const Bebop = require('./src/bebop');
const Credentials = require('./src/sec/credentials');

// actions
const Intro = require('./src/actions/Intro');
const PunkPoints = require('./src/actions/PunkPoints');
const Remember = require('./src/actions/Remember');
const RandomAnswer = require('./src/actions/RandomAnswer');

const bebop = new Bebop(Credentials.token, Credentials.username);

bebop.addCommand("What's my age again", (props, author, channel) => {
    const randomAge = Math.round(2+Math.random()*15);
    channel.send("Hmm, I'd say <@"+author.id+"> is about "+randomAge)
})

///////////////////////////////////////////////////////////////////////////////
// reveal yourself
    bebop.addCommand('Reveal yourself', Intro.revealYourself);
    bebop.addCommand('Excuse yourself', Intro.excuseYourself);
    bebop.addCommand('Help Me', Intro.helpMe);
    bebop.addCommand('Exert authority', Intro.exertAuthority);

///////////////////////////////////////////////////////////////////////////////
// punk points
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
// random answer
    bebop.addCommand('Who|Where|When|Why|What|How|Which', RandomAnswer.general);
    bebop.addCommand('Is|Will|Do|Does|Did|Have|Are|Has', RandomAnswer.yesNo);

///////////////////////////////////////////////////////////////////////////////
// Debug
    bebop.addCommand("Debug yourself", (props, author, channel, guild) => {
        guild.members.fetch().then(members => {
            console.log({props, author, channel, guild, members });
        })
       channel.send("Ok, everything important is shown in the console.");
    });

///////////////////////////////////////////////////////////////////////////////
// Start Server
bebop.start();
