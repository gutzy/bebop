const nlp = require('compromise');

const questionTypes = {
    QuantityQuestion: ['How much','How many'],
    LevelQuestion: ['How much','How'],
    IdentityQuestion: ['Which','Who','What','Who is','Who are'],
    LocationQuestion: ["Where"],
    TimeQuestion: ["When"]
}

let _init = false, _hadRejection = false;
const _commands = [], _answers = [], rejections = {};

const DEBUG = true;

function init() {

    // add plugins
    nlp.extend(require('compromise-numbers'));
    nlp.extend(require('compromise-sentences'));

    // Add base tags
    nlp.extend((Doc, world) => {
        world.addTags({
            Thing:      {isA: 'Noun'},
            Action:     {isA: 'Verb'},
            Username:   {isA: 'Noun'},
            Member:     {isA: 'Person'},
            Attribute:  {isA: 'Value'},
            Number:     {isA: 'NumericValue'},
        })

        // populate question types
        const questions = {}
        for (let type of Object.keys(questionTypes)) questionTypes[type].forEach(q => { if (!questions[q]) questions[q] = ['QuestionWord']; questions[q].push(type); })
        for (let word of Object.keys(questions)) world.addWords(questions);


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
        world.addTags({[action]: {isA: 'Action' }})
        world.addWords({[action]: ['Action',action]})
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

function addMembers(members) {
    nlp.extend((Doc, world) => {
        members.forEach(member => {
            if (member.nickname) world.addWords({[member.nickname]: 'Member'})
            if (member.user.username) world.addWords({[member.user.username]: 'Member'})
        })
    })
}

function addWords(wordsObj, tags = []) {
    for (let w of Object.keys(wordsObj)) wordsObj[w] = wordsObj[w] instanceof Array ? [...tags, ...wordsObj[w]] : [...tags, wordsObj[w]];
    nlp.extend((Doc, world) => world.addWords(wordsObj))
}

function addWorld(world) {
    if (!_init) init();

    for (let item of world) {
        switch (item.type) {
            case 'thing': addThing(item.singular, item.plural); break;
            case 'action': addAction(item.action, item.synonyms); break;
            case 'attribute': addAttribute(item.name); break;
        }
    }
}

function addAnswer(callback, question, attribute, target = null, value = null, valueTransform = null) {
    _answers.push({callback, question, attribute, target, value, valueTransform});
}

function addCommand(callback, action, thing, target = null, value = null, valueTransform = null) {
    _commands.push({callback, action, thing, target, value, valueTransform});
}

function setRejection(rejection, callback) {
    rejections[rejection] = callback;
}

function addAnswers(answers) {
    for (let c of answers) addAnswer(c.callback, c.question, c.attribute, c.target, c.value, c.valueTransform)
}

function addCommands(commands) {
    for (let c of commands) addCommand(c.callback, c.action, c.thing, c.target, c.value, c.valueTransform)
}

function doAction(doc, req) {
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
                console.log("No target!", {action, thing})
                continue;
            }
            target = doc.matchOne(command.target).normalize().text();
        }
        if (command.value) {
            if (!doc.has(command.value)) {
                console.log("No value!", {action, thing})
                if (rejections['no_value']) { rejections['no_value'](req, doc); _hadRejection = true; }
                continue;
            }
            let match = `${command.value} * #Thing`;
            if (!doc.has(`${command.value} * #${command.thing}`)) {
                console.log("Value is specified after thing!", {action, thing}, command.value+' . #'+command.thing)
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

function doAnswer(doc, req) {

    let answered = false, target, value, start, end;
    _answers.forEach(answer => {
        start = `^${answer.question} ${answer.attribute||''}`;
        end = `${answer.value?answer.value+' ':''}${answer.target||''}`;

        if (!doc.has(`^${answer.question}`)) return;
        if (answer.attribute && !doc.has(`^${answer.question} ${answer.attribute}`)) return;
        if (answer.target) {
          console.log(answer.target, doc.text(), doc.has(`${start} * ${answer.target}`))
          if (!doc.has(`${start} * ${answer.target}`)) {
              if (rejections['no_target']) { rejections['no_target'](req, doc);  _hadRejection = true; }
              return;
          }
          if (!doc.match(`${start} * ${end}`).found) return;
          target = doc.matchOne(answer.target).normalize().text();
        }
        if (answer.value) {
          if (!doc.has(answer.value)) {
              if (rejections['no_value']) { rejections['no_value'](req, doc);  _hadRejection = true; }
              return;
          }
          value = doc.matchOne(answer.value);
          if (answer.valueTransform) value = answer.valueTransform(value);
          value = value.normalize().text();
        }
        if (!answer.target && !answer.value) { // simple match answer, do not allow anything between question and attribute
            if (!doc.has(`^${answer.question} ${answer.attribute}`)) return;
        }

        if (!_hadRejection) {
            answer.callback(req, target, value, doc);
            answered = true;
        }
    });

    if (!answered && !_hadRejection) {
    console.log("I'm here", answered)
        _hadRejection = true;
        if (rejections['unmatched']) rejections['unmatched'](req, doc)
    }
    return true;
}

function getIntention(doc) {


    if (doc.has('#Action')) return 'action';
    if (doc.has('^#QuestionWord')) return 'question';
    return 'unknown';
}

function hadRejection() { return _hadRejection }

function runIntention(text, req) {
    _hadRejection = false;

    if (!_init) init();


    const doc = nlp(text.trim()),
        intention = getIntention(doc)

    if (DEBUG) console.log("[intention]", {intention, text: doc.text()})
    switch (intention) {
        case 'action': return doAction(doc, req)
        case 'question': return doAnswer(doc, req)
    }

}

function getTerms(text) {
    const doc = nlp(text);

    return doc.termList();
}

module.exports = {
    addWorld,
    addCommands,
    addAnswers,
    addMembers,
    addWords,
    getTerms,
    setRejection,
    hadRejection,
    runIntention
}
