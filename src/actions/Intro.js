const Settings = require('../lib/Settings');

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

const onWords = ['at','on','towards','against'];

function validateModMessage(message, channel = null) {
    const isMod = !!message.member.roles.cache.find(r => r.name.toLowerCase().indexOf('mod') > -1);
    if (!isMod) {
        channel.send("<@"+author.id+">, who tf are you?");
        return false;
    }
    return true;
}

function parseUser(targetUser) {
    if (targetUser[0] === "<") targetUser = targetUser.substring(3, targetUser.length-1);
    if (targetUser[0] === '@') targetUser = targetUser.substring(1);
    if (targetUser[0] === "&") targetUser = targetUser.substring(1);
    return targetUser;
}

function getChannel(props, _default = 'general') {
    let channelToReveal = props[0];
    if (props[1]) channelToReveal = props[1];
    if (!channelToReveal) channelToReveal = _default;
    return channelToReveal;
}

function getUserAndChannel(props) {
    let user = null, chn = null;
    for (let p of props) {
        if (!user) {
            if (onWords.indexOf(p) > -1) continue;
            else user = p; break;
        }
    }
    chn = props[props.length-1];
    return {user, chn};
}

function revealYourself(props, author, channel, guild, client,message) {

    if (!validateModMessage(message, channel)) return false;

    const g = revealStrings;
    const channelToReveal = getChannel(props);

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

    if (!validateModMessage(message, channel)) return false;

    const g = excuseStrings;
    const channelToReveal = getChannel(props);

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

    if (!validateModMessage(message, channel)) return false;

    const g = helpMeStrings;
    const channelToReveal = getChannel(props);

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

    if (!validateModMessage(message, channel)) return false;

    const g = exertAurhorityStrings;
    let {chn, user} = getUserAndChannel(props);

    chn = client.channels.cache.find(r => r.name === chn && r.type === "text");
    if (chn) {
        channel.send("Ok <@"+author.id+">, exerting authority against "+user+" in "+chn.name);
        chn.send(g[Math.floor(Math.random() * g.length)].replace(/TARGET/g, user));
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
