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
const _defs = [], _responses = [], _phrases = [], rejections = {};

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

function _addAction(action, synonyms = []) {
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

function _addThing(singular, plural = null) {
    nlp.extend((Doc, world) => {
        world.addWords({[singular]: ['Thing', singular]})
        if (plural) world.addWords({[plural]: [singular,'Plural','Thing']})
    })
}

function _addAttribute(name) {
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

function _addWords(wordsObj, tags = []) {

    if (typeof tags === "string" && tags.length > 1) tags = [tags]
    if (wordsObj === "string" && wordsObj.length > 1) wordsObj = {[wordsObj]: []}
    else if (wordsObj instanceof Array && wordsObj.length > 0) {
        const a = {};
        for (let w of wordsObj) {
            if (typeof w === "string" && w.length > 1) a[w] = []
        }
        wordsObj = { ...a}
    }
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
            case 'thing': _addThing(item.singular, item.plural); break;
            case 'action': _addAction(item.action, item.synonyms); break;
            case 'attribute': _addAttribute(item.name); break;
            case 'word': case 'words': item.words ? _addWords(item.words, item.tags) : _addWords([item.name], item.tags); break;
        }
    }
}

function setRejection(rejection, callback) { rejections[rejection] = callback; }

function addDef(callback, has, match = null, stripMatches = null, loose = false, open = false, bots = false) {
    _defs.push({callback, has, match, stripMatches, loose, open, bots});
}

function addDefs(defs) {
    for (let d of defs) addDef(d.callback, d.has, d.match, d.stripMatches, d.loose, d.open, d.bots);
}

function runDefs(defs, doc, req, hasPrefix = false, isBot = false) {

    let ok;
    for (let def of defs) {
        ok = true;
        if ((!hasPrefix && !def.open) || (isBot && !def.bots)) continue;

        if (typeof def.has === "string") def.has = [def.has];
        for (let has of def.has) {
            if (def.loose) {
                if (!looseNounsVerbs(doc).has(has)) { ok = false; break; }
            }
            else if (!doc.has(has)) { ok = false; break; }
        }
        if (!ok) continue;

        // Matched, can run

        let matches = [], matcher = nlp(doc.text());
        if (def.stripMatches) matcher.match(def.stripMatches).replaceWith('');

        if (def.match) {
            if (typeof def.match === "string") def.match = [def.match];
            matches = [];
            for (let m of def.match) {
                if (def.loose) {
                    matches = [...matches, looseNounsVerbs(matcher).matchOne(m).text() ]
                }
                else {
                    matches = [...matches, matcher.matchOne(m).text() ]
                }
                matcher.matchOne(m).replaceWith('');
            }
        }

        matches = def.match ? (def.match.length > 1 ? matches : (matches[0] || null) ) : matcher.text();
        def.callback(req, matches, doc);
        return true;
    }
}

function looseNounsVerbs(doc) {
    return nlp(nlp(doc.text()).verbs().toInfinitive().parent().text()).nouns().toSingular().parent();
}

function hadRejection() { return _hadRejection }
function getResponses() { return _responses }
function getPhrases() { return _phrases }

function runIntention(doc, req, hasPrefix, isBot) {
    _hadRejection = false;
    if (!_init) init();

    return runDefs(_defs, doc, req, hasPrefix, isBot);
}

function getDoc(text) {
    return nlp(text.toString().trim())
}

module.exports = {
    addWorld,
    addMembers,
    getDoc,
    addDefs,
    addDocTags,
    getResponses,
    getPhrases,
    setRejection,
    hadRejection,
    runIntention
}
