const Settings = require('../lib/Settings'), utils = require('../lib/BebopUtils');

const revealStrings = [
    "Hi boys, I'm baaaack", "BEBOP IS HERE", "Somebody called me?", "HELLO!! Have you been looking for ME??"
];
const excuseStrings = [
    "Grrr.... I had about enough here. See you later!", "Seems like my job here is done. BYE!", "See you later losers!"
];
const helpMeStrings = [
    "Hey <@TARGET>, need a hand?", "<@TARGET>, somebody giving you trouble here?", "Hey <@TARGET>, everything ok here? need some help?",
];
const exertAurhorityStrings = [
    "Hey TARGET, are you causing problems?", "TARGET, don't make me angry!", "I'm losing my patience, TARGET!",
];

function revealYourself(props, author, channel, guild, client,message) {

    if (!utils.validateModMessage(message, channel)) return false;

    const g = revealStrings;
    const channelToReveal = utils.parseChannel(props);

    const chn = client.channels.cache.find(r => r.name === channelToReveal && r.type === "text");
    if (chn) {
        channel.send("Ok <@"+author.id+">, revealing myself in "+channelToReveal);
        chn.send(g[Math.floor(Math.random() * g.length)]);
    }
    else {
        return channel.send("Sorry <@"+author.id+">, I couldn't find that channel")
    }
}

function excuseYourself(props, author, channel, guild, client, message) {

    if (!utils.validateModMessage(message, channel)) return false;

    const g = excuseStrings;
    const channelToReveal = utils.parseChannel(props);

    const chn = client.channels.cache.find(r => r.name === channelToReveal && r.type === "text");
    if (chn) {
        channel.send("Ok <@"+author.id+">, showing myself the door in "+channelToReveal);
        chn.send(g[Math.floor(Math.random() * g.length)]);
    }
    else {
        return channel.send("Sorry <@"+author.id+">, I couldn't find that channel")
    }
}

function helpMe(props, author, channel, guild, client, message) {

    if (!utils.validateModMessage(message, channel)) return false;

    const g = helpMeStrings;
    const channelToReveal = utils.parseChannel(props);

    const chn = client.channels.cache.find(r => r.name === channelToReveal && r.type === "text");
    if (chn) {
        channel.send("Ok <@"+author.id+">, providing help in "+channelToReveal);
        chn.send(g[Math.floor(Math.random() * g.length)].replace(/TARGET/g, author.id));
    }
    else {
        return channel.send("Sorry <@"+author.id+">, I couldn't find that channel")
    }
}

function exertAuthority(props, author, channel, guild, client, message) {

    if (!utils.validateModMessage(message, channel)) return false;

    const g = exertAurhorityStrings;
    let res = utils.parseUserInChannel(props), chn;

    chn = client.channels.cache.find(r => r.name === res[1] && r.type === "text");
    if (chn) {
        channel.send("Ok <@"+author.id+">, exerting authority against "+res[0]+" in "+chn.name);
        chn.send(g[Math.floor(Math.random() * g.length)].replace(/TARGET/g, res[0]));
    }
    else {
        return channel.send("Sorry <@"+author.id+">, I couldn't find that channel")
    }
}


module.exports = {
    revealYourself,
    excuseYourself,
    helpMe,
    exertAuthority
};
