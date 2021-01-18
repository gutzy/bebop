const Bebop = require('./src/bebop');
const Credentials = require('./src/sec/credentials');

const Read = require('./src/actions/Read');
const Remember = require('./src/actions/Remember');
const Listen = require('./src/actions/Listen');
const Ask = require('./src/actions/Ask');
const PunkPoints = require('./src/actions/PunkPoints');
const Help = require('./src/actions/Help');
const Quiz = require('./src/actions/Quiz');

const bebop = new Bebop(Credentials.token, Credentials.username);

///////////////////////////////////////////////////////////////////////////////
// Rejections Definitions

// bebop.setRejection('no_target', (req, doc) => { req.channel.send(`<@${req.author.id}>, I'm not sure what to do! Maybe you forgot to include a target?`) })
bebop.setRejection('no_value', (req, doc) => { req.channel.send(`<@${req.author.id}>, hmm, this is confusing! Maybe you didn't enter a value?`) })
bebop.setRejection('value_after', (req, doc) => {req.channel.send(`<@${req.author.id}>, what what..? Maybe you didn't specify the value properly?`) })
bebop.setRejection('unmatched', (req, doc) => {req.channel.send(`<@${req.author.id}>, I still can't think of an answer that will not sound stupid. Master Sp... I mean, MISTER POTATO MAN told me to stay focused!`) })

///////////////////////////////////////////////////////////////////////////////
// World Definitions
bebop.addWorld([
    // attributes
        {type: "attribute", name: "punk" },
        {type: "attribute", name: "age" },

    // things
        {type: "thing", singular: "point", plural: "points"},

    // actions
        {type: "action", action: "help" },
        {type: "action", action: "start", synonyms: ["begin","run","initialize"] },
        {type: "action", action: "stop", synonyms: ["end"] },
        {type: "action", action: "remember" },
        {type: "action", action: "give", synonyms: ["provide", "hand out","supply","offer","grant","award","bestow"]},
        {type: "action", action: "analyze", synonyms: ["dissect"]},

    // Words
        {type: "words", words: ["fuck","shit","cunt","wanker","fucker"], tags: ["CurseWord"] }
])

///////////////////////////////////////////////////////////////////////////////
// COMMANDS
bebop.addCommands([
    // help
    { callback: Help.showHelp, action: "help" },
    // punk points
    { callback: PunkPoints.give, action: "give", thing: "point", target: "#Username", value: '#Value+', valueTransform: (m => m.numbers().toNumber()) },
    // read
    { callback: Read.Analyze, action: "analyze", target: "*" },
    // remember
    { callback: Remember.saveMemory, action: "remember", target: "*"},
    // quiz
    { callback: Quiz.startQuiz, action: "start", target: "(a|the)? quiz"},
    { callback: Quiz.stopQuiz, action: "stop", target: "(a|the)? quiz"},

])
///////////////////////////////////////////////////////////////////////////////
// ANSWERS
bebop.addAnswers([
    //ask
    { callback: Ask.WhoIs, question: "who is this?", target: "#Noun+"},
    { callback: Ask.WhoAreYou, question: "who are you"},
    { callback: Ask.WhoAmI, question: "who am i?"},
    { callback: Ask.WhatsMyAgeAgain, question: "what's my age again", open: true},
    { callback: Ask.CurrencyCovertAmount, question: "#QuantityQuestion", attribute: "/[a-zA-Z]{3}/ *", target: "#NumericValue"},

    // punk points
    { callback: PunkPoints.get, question: "#LevelQuestion+", attribute: "punk", target: "is #Username", targetTransform: (m => m.match('#Username')) },
    { callback: PunkPoints.get, question: "#QuantityQuestion+", attribute: "points", target: "#Username (got|have|has)", targetTransform: (m => m.match('#Username')) },
    { callback: PunkPoints.my, question: "#LevelQuestion+", attribute: "punk", target: "am #Author" },
    { callback: PunkPoints.my, question: "#QuantityQuestion+", attribute: "points", target: "#Author (got|have|has)" },
    { callback: PunkPoints.your, question: "#LevelQuestion+", attribute: "punk", target: "(are|is) (you|bebop)" },

    // remember
    {callback: Remember.loadMemory, question: "(what)? #AbilityQuestion+ remember"},

])
///////////////////////////////////////////////////////////////////////////////
// RESPONSES
bebop.addResponses([
    { callback: Ask.GunOnMyBack, phrase: "It's not my imagination", open: true, bots: false },
    { callback: Listen.CurseWords, phrase: "#CurseWord", loose: true, open: true, bots: false },

])
///////////////////////////////////////////////////////////////////////////////
// Start Server
bebop.start();
