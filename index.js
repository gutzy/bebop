const Bebop = require('./src/bebop');
const Credentials = require('./src/sec/credentials');

// actions
const Rocksteady = require('./src/responders/Rocksteady');
const Read = require('./src/actions/Read');
const Ask = require('./src/actions/Ask');
const PunkPoints = require('./src/actions/PunkPoints');

// const Read = require('./src/actions/Read');
// const Help = require('./src/actions/Help');
// const Intro = require('./src/actions/Intro');
// const Influence = require('./src/actions/Influence');
// const Remember = require('./src/actions/Remember');
// const Ramones = require('./src/actions/Ramones');
// const RandomAnswer = require('./src/actions/RandomAnswer');

const bebop = new Bebop(Credentials.token, Credentials.username);
bebop.addResponder(Rocksteady.RespondToRocksteady);

// bebop.setRejection('no_target', (req, doc) => { req.channel.send(`<@${req.author.id}>, I'm not sure what to do! Maybe you forgot to include a target?`) })
bebop.setRejection('no_value', (req, doc) => { req.channel.send(`<@${req.author.id}>, hmm, this is confusing! Maybe you didn't enter a value?`) })
bebop.setRejection('value_after', (req, doc) => {req.channel.send(`<@${req.author.id}>, what what..? Maybe you didn't specify the value properly?`) })
bebop.setRejection('unmatched', (req, doc) => {req.channel.send(`<@${req.author.id}>, I still can't think of an answer that will not sound stupid. Master Sp... I mean, MISTER POTATO MAN told me to stay focused!`) })

bebop.addWorld([
        {type: "thing", singular: "point", plural: "points"},
        {type: "attribute", name: "punk" },
        {type: "attribute", name: "age" },
        {type: "action", action: "give", synonyms: ["provide", "hand out","supply","offer","grant","award","bestow"]},
        {type: "action", action: "analyze", synonyms: ["dissect"]},
])

bebop.addCommands([
    // punk points
    { callback: PunkPoints.give, action: "give", thing: "point", target: "#Username", value: '#Value+', valueTransform: (m => m.numbers().toNumber()) },
    // read
    { callback: Read.Analyze, action: "analyze", target: "*" },

])

bebop.addAnswers([
    //ask
    { callback: Ask.WhoIs, question: "Who is this?", target: "#Noun+"},
    { callback: Ask.WhoAmI, question: "Who am i?"},

    // punk points
    { callback: PunkPoints.get, question: "#LevelQuestion+", attribute: "punk", target: "is #Username", targetTransform: (m => m.match('#Username')) },
    { callback: PunkPoints.get, question: "#QuantityQuestion+", attribute: "points", target: "#Username (got|have|has)", targetTransform: (m => m.match('#Username')) },
    { callback: PunkPoints.my, question: "#LevelQuestion+", attribute: "punk", target: "am #Author" },
    { callback: PunkPoints.my, question: "#QuantityQuestion+", attribute: "points", target: "#Author (got|have|has)" },
    { callback: PunkPoints.your, question: "#LevelQuestion+", attribute: "punk", target: "(are|is) (you|bebop)" },

])




//
// bebop.addCommand("What's my age again", (props, author, channel) => {
//     const randomAge = Math.round(2+Math.random()*15);
//     channel.send("Hmm, I'd say <@"+author.id+"> is about "+randomAge)
// })
//
// bebop.addCommand("knows", (props, author, channel) => {
//     channel.send("I do.")
// })
//
// bebop.addCommand("it's not my imagination", (props, author, channel) => {
//     channel.send("...I GOT A GUN ON MY BACK!")
// })
//
// // read...
// bebop.addResponder(Read.Read, true);
// bebop.addCommand("analyze",Read.Analyze);
//
// ///////////////////////////////////////////////////////////////////////////////
// // ramones song openings
//     bebop.addCommand("1 2 3 4",Ramones.songStart);
//
// ///////////////////////////////////////////////////////////////////////////////
// // reveal yourself
//     bebop.addCommand('Reveal yourself', Intro.revealYourself);
//     bebop.addCommand('Excuse yourself', Intro.excuseYourself);
//     bebop.addCommand('Help Me', Intro.helpMe);
//     bebop.addCommand('Exert authority', Intro.exertAuthority);
//
// ///////////////////////////////////////////////////////////////////////////////
// // punk points
//     bebop.addCommand('Who are the punkest|who are the most punk', PunkPoints.top);
//     bebop.addCommand('How punk am I', PunkPoints.my);
//     bebop.addCommand('How punk is', PunkPoints.get);
//     bebop.addCommand('give', PunkPoints.give);
//     bebop.addCommand('spare some change', PunkPoints.request);
//
// ///////////////////////////////////////////////////////////////////////////////
// // remember
//     bebop.addCommand('Do you remember', Remember.loadMemory);
//     bebop.addCommand('remember', Remember.saveMemory);
//     bebop.addCommand('Forget about it', Remember.deleteMemory);
//
// ///////////////////////////////////////////////////////////////////////////////
// // Influence stuff
// bebop.addCommand("you should", Influence.youShould);
// bebop.addCommand("do you", Influence.doYou);
// bebop.addCommand("what do you", Influence.whatDoYou);
//
// ///////////////////////////////////////////////////////////////////////////////
// // random answer
//     bebop.addCommand('Who|Where|When|Why|What|How|Which', RandomAnswer.general);
//     bebop.addCommand('Is|Will|Do|Does|Did|Have|Are|Has|Should', RandomAnswer.yesNo);
//
// ///////////////////////////////////////////////////////////////////////////////
// // Debug
//     bebop.addCommand("Debug yourself", (props, author, channel, guild) => {
//         guild.members.fetch().then(members => {
//             console.log({props, author, channel, guild, members });
//         })
//        channel.send("Ok, everything important is shown in the console.");
//     });
//
// ///////////////////////////////////////////////////////////////////////////////
// // Help
//     bebop.addCommand("Help", Help.showHelp)
//


///////////////////////////////////////////////////////////////////////////////
// Start Server
bebop.start();
