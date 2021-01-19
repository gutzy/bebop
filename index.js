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

// bebop.setRejection("no_target", (req, doc) => { req.channel.send(`<@${req.author.id}>, I'm not sure what to do! Maybe you forgot to include a target?`) })
bot.setRejection("no_value", (req, doc) => { req.channel.send(`<@${req.author.id}>, hmm, this is confusing! Maybe you didn't enter a value?`) })
bot.setRejection("value_after", (req, doc) => {req.channel.send(`<@${req.author.id}>, what what..? Maybe you didn't specify the value properly?`) })
bot.setRejection("unmatched", (req, doc) => {req.channel.send(`<@${req.author.id}>, I still can't think of an answer that will not sound stupid. Master Sp... I mean, MISTER POTATO MAN told me to stay focused!`) })

///////////////////////////////////////////////////////////////////////////////
// World Definitions

bot.addWorld([
    // attributes
        {type: "attribute", name: "punk" },
        {type: "attribute", name: "age" },
    // things
        {type: "thing", singular: "point", plural: "points"},
    // actions
        {type: "action", action: "Help" },
        {type: "action", action: "Start", synonyms: ["begin","run","initialize"] },
        {type: "action", action: "Add", synonyms: ["create"] },
        {type: "action", action: "Remove", synonyms: ["delete"] },
        {type: "action", action: "Stop", synonyms: ["end"] },
        {type: "action", action: "List" },
        {type: "action", action: "Remember" },
        {type: "action", action: "Give", synonyms: ["provide", "hand out","supply","offer","grant","award","bestow"]},
        {type: "action", action: "Analyze", synonyms: ["dissect"]},
    // Words
        {type: "words", words: ["fuck","shit","cunt","wanker","fucker"], tags: ["CurseWord"] }
])

///////////////////////////////////////////////////////////////////////////////
// Action defs

    bot.addDefs([
    // HELP
        { callback: Help.showHelp, has: "^help"},

    // LISTEN
        { callback: Listen.CurseWords, has: "#CurseWord+", match: "#CurseWord", loose: true, open: true, bots: false },

    // READ
        { callback: Read.Analyze, has: "^analyze .", stripMatches: "^analyze" },

    // REMEMBER
        { callback: Remember.saveMemory, has: "^remember .", stripMatches: "^analyze" },
        { callback: Remember.loadMemory, has: "(what)? #AbilityQuestion+ remember" },

   // ASK
        { callback: Ask.WhoIs, has: "^who is this?", match: "#Noun+"},
        { callback: Ask.WhoAreYou, has: "^who are you"},
        { callback: Ask.WhoAmI, has: "^who am i?"},
        { callback: Ask.WhatsMyAgeAgain, has: "what is my age again$", open: true },
        { callback: Ask.CurrencyCovertAmount, has: "^(#QuantityQuestion|convert) #NumericValue /[a-zA-Z]{3}/ * (in|to)? /[a-zA-Z]{3}/", matches: ["#NumericValue", "/[a-zA-Z]{3}/", "/[a-zA-Z]{3}/"]},
        { callback: Ask.GunOnMyBack, has: "It is not my imagination", open: true },

    // PUNK POINTS
        { callback: PunkPoints.GivePoints, has: "^#Give #Username * #NumericValue punk? #Point", match: ["#Username","#NumericValue"] },
        { callback: PunkPoints.GivePoints, has: "^#Give * #NumericValue punk? #Point to #Username", match: ["#Username","#NumericValue"] },
        { callback: PunkPoints.GetAuthorPoints, has: "^#LevelQuestion+ punk (is|am) #Author" },
        { callback: PunkPoints.GetAuthorPoints, has: "^#QuantityQuestion+ punk? #Point * #Author (got|have|has)?" },
        { callback: PunkPoints.GetUserPoints, has : "^#LevelQuestion+ punk (is|are) #Username", match: "#Username" },
        { callback: PunkPoints.GetUserPoints, has: "^#QuantityQuestion+ punk? #Point * #Username (got|have|has)?", match: "#Username" },
        { callback: PunkPoints.GetBotPoints, has: "^#LevelQuestion+ punk (is|are) (#Self|bebop)" },

   // QUIZ
        { callback: Quiz.startQuiz, has: "^start (a|the)? quiz", match: "#NumericValue"},
        { callback: Quiz.stopQuiz, has: "^stop (a|the)? quiz"},
        { callback: Quiz.addQuestion, has: "^add (a|the)? quiz question"},
        { callback: Quiz.listQuestions, has: "^list the? quiz questions"},
        { callback: Quiz.removeQuestion, has: "^remove the? quiz question", match: "#NumericValue"},
    ])

///////////////////////////////////////////////////////////////////////////////

bot.start();
