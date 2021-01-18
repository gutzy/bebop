const nlp = require('compromise');

const QuestionTypes = {
    QuantityQuestion: ['How much','How many'],
    LevelQuestion: ['How much','How'],
    AbilityQuestion: ['do you', 'does a', 'can you','can a','can the'],
    IdentityQuestion: ['Who am','Who is','What is','Who are',"what's"],
    SpecificationQuestion: ['Which','What',"Who", "Whose", "Who've"],
    LocationQuestion: ["Where"],
    TimeQuestion: ["When"]
}

const requestPrefixes = ["Please", "Would you", "Could you", "Will you", "May I ask you to"]

let _init = false, _hadRejection = false;
const _commands = [], _answers = [], _responses = [], _phrases = [], rejections = {};

const DEBUG = false;

function init() {

    // add plugins
    nlp.extend(require('compromise-numbers'));
    nlp.extend(require('compromise-sentences'));

    // Add base tags
    nlp.extend((Doc, world) => {
        world.addTags({
            Thing:      {isA: 'Noun'},
            Action:     {isA: 'Verb'},
            Question:   {isA: 'QuestionWord'},
            Username:   {isA: 'Noun'},
            Member:     {isA: 'Person'},
            Attribute:  {isA: 'Value'},
            Number:     {isA: 'NumericValue'},
            Response:  {},
            RequestPrefix:  {},
        })

        // populate question types
        for (let type of Object.keys(QuestionTypes)) world.addTags({[type]: {isA: "Question"}})
        const questions = {}
        for (let type of Object.keys(QuestionTypes)) QuestionTypes[type].forEach(q => { if (!questions[q]) questions[q] = ["Question"]; questions[q].push(type); })
        world.addWords(questions);

        // populate request prefixes
        for (let pref of requestPrefixes) world.addWords({[pref]: 'RequestPrefix'})

        world.postProcess(doc => {
            doc.match('you').tag("Self")
            doc.match('i').tag("Author")
            doc.match('#NumericValue').tag("Number")
            doc.match('/<@[!]?[0-9]+>/').tag("Username")
        })
    })

    _init = true;
}

function addAction(action, synonyms = []) {
    nlp.extend((Doc, world) => {
        if (action.indexOf(" ") === -1) {
            world.addTags({[action]: {isA: 'Action' }})
            world.addWords({[action]: ['Action',action]})
        }
        else {
            world.addWords({[action]: 'Action'})
        }
        synonyms.forEach(synonym => world.addWords({[synonym]: ['Action', action]}));
    })
}


function addThing(singular, plural = null) {
    nlp.extend((Doc, world) => {
        world.addWords({[singular]: ['Thing', singular]})
        if (plural) world.addWords({[plural]: [singular,'Plural','Thing']})
    })
}

function addAttribute(name) {
    nlp.extend((Doc, world) => {
        world.addWords({[name]: ['Attribute', name]})
    })
}

function addDocTags(doc, phrases, tags = []) {
    if (typeof tags === "string") tags = [tags];
    for (let p of phrases) {
        if (!p instanceof Array) p = [p];
        for (let phrase of p) {

            for (let tag of tags) {
                doc.match(phrase).tag(tag);
            }
        }
    }
}

function addMembers(doc, members, authorId, botId) {
    members.forEach(member => {
        if (member.nickname) doc.match(member.nickname).tag("Member");
        if (member.user.username) doc.match(member.user.username).tag("Member");
        if (member.id === authorId) {
            if (member.nickname) doc.match(member.nickname).tag("Author")
            if (member.user.username) doc.match(member.user.username).tag("Author");
        }
        if (member.id === botId) {
            if (member.nickname) doc.match(member.nickname).tag("Self")
            if (member.user.username) doc.match(member.user.username).tag("Self");
        }
    })
}

function addWords(wordsObj, tags = []) {

    if (typeof tags === "string" && tags.length > 1) tags = [tags]
    if (wordsObj instanceof Array && wordsObj.length > 0) {
        const a = {};
        for (let w of wordsObj) {
            if (typeof w === "string" && w.length > 1) a[w] = []
        }
        wordsObj = {...wordsObj, ...a}
    }
    else if (typeof wordsObj === "string" && wordsObj.length > 1) wordsObj = {[wordsObj]: []}
    if (tags.length > 0) {
        for (let w in wordsObj) {
            wordsObj[w] = [...tags, ...wordsObj[w]]
        }
    }
    nlp.extend((Doc, world) => world.addWords(wordsObj))
}

function addWorld(world) {
    if (!_init) init();

    for (let item of world) {
        switch (item.type) {
            case 'thing': addThing(item.singular, item.plural); break;
            case 'action': addAction(item.action, item.synonyms); break;
            case 'attribute': addAttribute(item.name); break;
            case 'word': case 'words': item.words ? addWords(item.words, item.tags) : addWords(item.name, item.tags); break;
        }
    }
}

function addAnswer(callback, question, attribute, target = null, value = null, valueTransform = null, targetTransform = null, open = false) {
    _answers.push({callback, question, attribute, target, value, valueTransform, targetTransform, open});
}

function addResponse(callback, phrase, target = null, value = null, valueTransform = null, targetTransform = null, open = false, bots = false, loose = false) {
    _responses.push({callback, phrase, target, value, valueTransform, targetTransform, open, bots, loose});
}

function addCommand(callback, action, thing, target = null, value = null, valueTransform = null, targetTransform = null) {
    _commands.push({callback, action, thing, target, value, valueTransform, targetTransform});
}

function addPhrase(phrase, tags = []) {
    _phrases.push({phrase, tags});
}

function setRejection(rejection, callback) {
    rejections[rejection] = callback;
}

function addAnswers(answers) {
    for (let c of answers) addAnswer(c.callback, c.question, c.attribute, c.target, c.value, c.valueTransform, c.targetTransform, c.open)
}

function addResponses(responses) {
    for (let c of responses) addResponse(c.callback, c.phrase, c.target, c.value, c.valueTransform, c.targetTransform, c.open, c.bots, c.loose)
}

function addCommands(commands) {
    for (let c of commands) addCommand(c.callback, c.action, c.thing, c.target, c.value, c.valueTransform, c.targetTransform)
}

function addPhrases(phrases, tags = []) {
    for (let phrase of phrases) addPhrase(phrase, tags);
}

function doAction(doc, req) {
    doc.replace('#RequestPrefix+','')
    let action = doc.matchOne('#Action').normalize().out('text');
    let thing = doc.matchOne('#Thing').normalize().nouns().toSingular().out('text');


    let target, value;
    for (let command of _commands) {
    if (DEBUG) console.log(`*Action`, action, thing, {action: command.action, thing: command.thing, target: command.target, value: command.value}, thing === (command.thing || ''))
        target = value = null;
        if (action !== command.action && !doc.has('#'+command.action)) continue;
        action = command.action;
        if (thing !== (command.thing || '')) continue;
        if (command.target) {
            if (!doc.has(command.target)) {
                if (DEBUG) console.log("No target!", {action, thing})
                continue;
            }
            target = doc.replace(`^#Action`,'').matchOne(command.target)
            if (command.targetTransform) target = command.targetTransform(target);
            target = target.normalize().text();
        }
        if (command.value) {
            if (!doc.has(command.value)) {
                if (DEBUG) console.log("No value!", {action, thing})
                if (rejections['no_value']) { rejections['no_value'](req, doc); _hadRejection = true; }
                continue;
            }
            let match = `${command.value} * #Thing`;
            if (!doc.has(`${command.value} * #${command.thing}`)) {
                if (DEBUG) console.log("Value is specified after thing!", {action, thing}, command.value+' . #'+command.thing)
                if (rejections['value_after']) { rejections['value_after'](req, doc);  _hadRejection = true; }
                continue;
            }
            value = doc.matchOne(command.value);
            if (command.valueTransform) value = command.valueTransform(value);
            value = value.normalize().text();
        }

        command.callback(req, target, value, doc);
        if (!_hadRejection) {
            return true;
        }
    }
}

function doAnswer(doc, req, hasPrefix) {

    // convert to lowercase - we're in question zone now.
    let m = doc.clone().toLowerCase();

    let answered = false, target, value, start, end;
    _answers.forEach(answer => {
        start = `^${answer.question} ${answer.attribute||''}`;
        end = `${answer.value?answer.value+' ':''}${answer.target||''}`;

        if (!hasPrefix && !answer.open) return;
        if (!m.has(start)) return;
        if (answer.target) {
            if (!m.has(`${start} * ${answer.target}`)) {
                if (rejections['no_target']) { rejections['no_target'](req, doc);  _hadRejection = true; }
                return;
            }
            if (!m.match(`${start} * ${end}`).found) return;

            target = doc.matchOne(answer.target)
            if (answer.targetTransform) target = answer.targetTransform(target);
            target = target.normalize().text();
        }
        if (answer.value) {
            if (!m.has(answer.value)) {
                if (rejections['no_value']) { rejections['no_value'](req, doc);  _hadRejection = true; }
                return;
            }
            value = doc.matchOne(answer.value);
            if (answer.valueTransform) value = answer.valueTransform(value);
            value = value.normalize().text();
        }
        if (!answer.target && !answer.value) { // simple match answer, do not allow anything between question and attribute
            if (!m.has(`${start}`)) return;
        }

        if (!_hadRejection) {
            answer.callback(req, target, value, doc);
            answered = true;
        }
    });

    if (!answered && !_hadRejection) {
        _hadRejection = true;
        if (hasPrefix) {
            if (rejections['unmatched']) rejections['unmatched'](req, doc)
        }
    }
    return true;
}

function doResponse(doc, req, hasPrefix, isBot) {

    let responded = false, target, value, start, end;
    _responses.forEach(response => {
        start = `^${response.phrase}`;
        if (!hasPrefix && !response.open) return;
        if (isBot && !response.bots) return;
        if (!response.loose && (!doc.has(`${start}`))) return;
        if (response.target) {
            if (!doc.has(`${start} * ${response.target}`)) {
                if (rejections['no_target']) { rejections['no_target'](req, doc);  _hadRejection = true; }
                return;
            }
            if (!doc.match(`${start} * ${end}`).found) return;

            target = doc.matchOne(response.target)
            if (response.targetTransform) target = response.targetTransform(target);
            target = target.normalize().text();
        }
        else {
            if (response.loose) {
                target = looseNounsVerbs(doc).matchOne(response.phrase).text();
                if (!target) return false;
            }
            else target = doc.match(response.phrase).text()
        }

        if (response.value) {
            if (!doc.has(response.value)) {
                if (rejections['no_value']) { rejections['no_value'](req, doc);  _hadRejection = true; }
                return;
            }
            value = doc.matchOne(response.value);
            if (response.valueTransform) value = response.valueTransform(value);
            value = value.normalize().text();
        }
        if (!response.target && !response.value) { // simple match response, do not allow anything between question and attribute
            if (!response.loose) return;
        }

        if (!_hadRejection) {
            response.callback(req, target, value, doc);
            responded = true;
        }
    });

    if (!responded && !_hadRejection) {
        _hadRejection = true;
    }
    return true;
}

function looseNounsVerbs(doc) {
    return nlp(nlp(doc.text()).verbs().toInfinitive().parent().text()).nouns().toSingular().parent();
}

function getIntention(doc) {

    if (doc.has('^#RequestPrefix+? #Action')) return 'action';
    if (doc.has('^#Question')) return 'question';
    if (doc.has('#Response')) return 'response';
    for (let r of _responses) {
        if (!r.loose) continue;
        if (looseNounsVerbs(doc).has(r.phrase)) return 'response'
    }
    return 'unknown';
}

function hadRejection() { return _hadRejection }
function getResponses() { return _responses }
function getPhrases() { return _phrases }

function runIntention(doc, req, hasPrefix, isBot) {
    _hadRejection = false;

    if (!_init) init();

    const intention = getIntention(doc)

    if (DEBUG && intention !== "unknown") console.log(`[bebop: ${intention}]`, {hasPrefix, isBot}, doc.text())
    switch (intention) {
        case 'action': if (hasPrefix && !isBot) return doAction(doc, req)
        case 'question': if (!isBot) return doAnswer(doc, req, hasPrefix)
        case 'response': return doResponse(doc, req, hasPrefix, isBot)
    }
}

function getDoc(text) {
    return nlp(text.toString().trim())
}

function getTerms(text) {
    const doc = nlp(text);

    return doc.termList();
}

module.exports = {
    QuestionTypes,
    addWorld,
    addAnswers,
    addResponses,
    addCommands,
    addMembers,
    addWords,
    addPhrases,
    getDoc,
    getTerms,
    addDocTags,
    getResponses,
    getPhrases,
    setRejection,
    hadRejection,
    runIntention
}
