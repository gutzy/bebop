const Bebop = require('./src/bebop');
const Credentials = require('./src/sec/credentials');

// actions
const Rocksteady = require('./src/responders/Rocksteady');
const Read = require('./src/actions/Read');
const Help = require('./src/actions/Help');
const Intro = require('./src/actions/Intro');
const Influence = require('./src/actions/Influence');
const PunkPoints = require('./src/actions/PunkPoints');
const Remember = require('./src/actions/Remember');
const Ramones = require('./src/actions/Ramones');
const RandomAnswer = require('./src/actions/RandomAnswer');

const bebop = new Bebop(Credentials.token, Credentials.username);

bebop.addResponder(Rocksteady.RespondToRocksteady);

bebop.addCommand("What's my age again", (props, author, channel) => {
    const randomAge = Math.round(2+Math.random()*15);
    channel.send("Hmm, I'd say <@"+author.id+"> is about "+randomAge)
})

bebop.addCommand("knows", (props, author, channel) => {
    channel.send("I do.")
})

bebop.addCommand("it's not my imagination", (props, author, channel) => {
    channel.send("...I GOT A GUN ON MY BACK!")
})

// read...
bebop.addResponder(Read.Read, true);
bebop.addCommand("analyze",Read.Analyze);

///////////////////////////////////////////////////////////////////////////////
// ramones song openings
    bebop.addCommand("1 2 3 4",Ramones.songStart);

///////////////////////////////////////////////////////////////////////////////
// reveal yourself
    bebop.addCommand('Reveal yourself', Intro.revealYourself);
    bebop.addCommand('Excuse yourself', Intro.excuseYourself);
    bebop.addCommand('Help Me', Intro.helpMe);
    bebop.addCommand('Exert authority', Intro.exertAuthority);

///////////////////////////////////////////////////////////////////////////////
// punk points
    bebop.addCommand('Who are the punkest|who are the most punk', PunkPoints.top);
    bebop.addCommand('How punk am I', PunkPoints.my);
    bebop.addCommand('How punk is', PunkPoints.get);
    bebop.addCommand('give', PunkPoints.give);
    bebop.addCommand('spare some change', PunkPoints.request);

///////////////////////////////////////////////////////////////////////////////
// remember
    bebop.addCommand('Do you remember', Remember.loadMemory);
    bebop.addCommand('remember', Remember.saveMemory);
    bebop.addCommand('Forget about it', Remember.deleteMemory);

///////////////////////////////////////////////////////////////////////////////
// Influence stuff
bebop.addCommand("you should", Influence.youShould);
bebop.addCommand("do you", Influence.doYou);
bebop.addCommand("what do you", Influence.whatDoYou);

///////////////////////////////////////////////////////////////////////////////
// random answer
    bebop.addCommand('Who|Where|When|Why|What|How|Which', RandomAnswer.general);
    bebop.addCommand('Is|Will|Do|Does|Did|Have|Are|Has|Should', RandomAnswer.yesNo);

///////////////////////////////////////////////////////////////////////////////
// Debug
    bebop.addCommand("Debug yourself", (props, author, channel, guild) => {
        guild.members.fetch().then(members => {
            console.log({props, author, channel, guild, members });
        })
       channel.send("Ok, everything important is shown in the console.");
    });

///////////////////////////////////////////////////////////////////////////////
// Help
    bebop.addCommand("Help", Help.showHelp)



///////////////////////////////////////////////////////////////////////////////
// Start Server
bebop.start();
