const PunkBot = require('./src/core/PunkBot');
const Credentials = require('./src/sec/credentials');

const Read = require('./src/actions/Read');
const Remember = require('./src/actions/Remember');
const Listen = require('./src/actions/Listen');
const Ask = require('./src/actions/Ask');
const PunkPoints = require('./src/actions/PunkPoints');
const Help = require('./src/actions/Help');
const Quiz = require('./src/actions/Quiz');

const bot = new PunkBot(Credentials.token, Credentials.username, "bebop");

///////////////////////////////////////////////////////////////////////////////
// Rejections Definitions

// bebop.setRejection('no_target', (req, doc) => { req.channel.send(`<@${req.author.id}>, I'm not sure what to do! Maybe you forgot to include a target?`) })
bot.setRejection('no_value', (req, doc) => { req.channel.send(`<@${req.author.id}>, hmm, this is confusing! Maybe you didn't enter a value?`) })
bot.setRejection('value_after', (req, doc) => {req.channel.send(`<@${req.author.id}>, what what..? Maybe you didn't specify the value properly?`) })
bot.setRejection('unmatched', (req, doc) => {req.channel.send(`<@${req.author.id}>, I still can't think of an answer that will not sound stupid. Master Sp... I mean, MISTER POTATO MAN told me to stay focused!`) })

///////////////////////////////////////////////////////////////////////////////
// World Definitions

bot.addWorld([
    // attributes
        {type: "attribute", name: "punk" },
        {type: "attribute", name: "age" },
    // things
        {type: "thing", singular: "point", plural: "points"},
    // actions
        {type: "action", action: "help" },
        {type: "action", action: "start", synonyms: ["begin","run","initialize"] },
        {type: "action", action: "add", synonyms: ["create"] },
        {type: "action", action: "remove", synonyms: ["delete"] },
        {type: "action", action: "stop", synonyms: ["end"] },
        {type: "action", action: "list" },
        {type: "action", action: "remember" },
        {type: "action", action: "give", synonyms: ["provide", "hand out","supply","offer","grant","award","bestow"]},
        {type: "action", action: "analyze", synonyms: ["dissect"]},
    // Words
        {type: "words", words: ["fuck","shit","cunt","wanker","fucker"], tags: ["CurseWord"] }
])

///////////////////////////////////////////////////////////////////////////////
// Action defs

    bot.addDefs([
    // HELP
        { type: 'command',   callback: Help.showHelp, action: "help" },

    // LISTEN
        { type: 'response',  callback: Listen.CurseWords, phrase: "#CurseWord", loose: true, open: true, bots: false },

    // READ
        { type: 'command',   callback: Read.Analyze, action: "analyze", target: "*" },

    // REMEMBER
        { type: 'command',   callback: Remember.saveMemory, action: "remember", target: "*"},
        { type: 'answer',    callback: Remember.loadMemory, question: "(what)? #AbilityQuestion+ remember"},

   // ASK
        { type: 'answer',    callback: Ask.WhoIs, question: "who is this?", target: "#Noun+"},
        { type: 'answer',    callback: Ask.WhoAreYou, question: "who are you"},
        { type: 'answer',    callback: Ask.WhoAmI, question: "who am i?"},
        { type: 'answer',    callback: Ask.WhatsMyAgeAgain, question: "what's my age again", open: true},
        { type: 'answer',    callback: Ask.CurrencyCovertAmount, question: "#QuantityQuestion", attribute: "/[a-zA-Z]{3}/ *", target: "#NumericValue"},
        { type: 'response',  callback: Ask.GunOnMyBack, phrase: "It's not my imagination", open: true, bots: false },

    // PUNK POINTS
        { type: 'command',   callback: PunkPoints.give, action: "give", thing: "point", target: "#Username", value: '#Value+', valueTransform: (m => m.numbers().toNumber()) },
        { type: 'answer',    callback: PunkPoints.get, question: "#LevelQuestion+", attribute: "punk", target: "is #Username", targetTransform: (m => m.match('#Username')) },
        { type: 'answer',    callback: PunkPoints.get, question: "#QuantityQuestion+", attribute: "points", target: "#Username (got|have|has)", targetTransform: (m => m.match('#Username')) },
        { type: 'answer',    callback: PunkPoints.my, question: "#LevelQuestion+", attribute: "punk", target: "am #Author" },
        { type: 'answer',    callback: PunkPoints.my, question: "#QuantityQuestion+", attribute: "points", target: "#Author (got|have|has)" },
        { type: 'answer',    callback: PunkPoints.your, question: "#LevelQuestion+", attribute: "punk", target: "(are|is) (you|bebop)" },

   // QUIZ
        { type: 'command',   callback: Quiz.startQuiz, action: "start", target: "(a|the)? quiz"},
        { type: 'command',   callback: Quiz.stopQuiz, action: "stop", target: "(a|the)? quiz"},
        { type: 'command',   callback: Quiz.addQuestion, action: "add", target: "(a|the)? quiz question"},
        { type: 'command',   callback: Quiz.listQuestions, action: "list", target: "the? quiz questions"},
        { type: 'command',   callback: Quiz.removeQuestion, action: "remove", target: "the? quiz question"},
    ])

///////////////////////////////////////////////////////////////////////////////

bot.start();
