const Settings = require('../lib/Settings'), utils = require("../lib/Utils"), pointsBank = require("../lib/PointsBank");

function giveCommand(props, author, channel, guild, client) {
    let targetUser, amount;
    if (props[0] && props[1]) {
        targetUser = utils.parseUser(props[0])*1;
        amount = props[1];

        guild.members.fetch().then(async members => {

            const tu = members.find(m => m.user.id*1 === targetUser);
            if (tu) {
                try {
                    await pointsBank.givePoints(client, author.id, tu.id, amount);
                    return channel.send(`Ok <@${author.id}>, whatever you want... Giving <@${tu.id}> ${amount} of your punk points...`);
                } catch (e) {
                    return channel.send(e);
                }
            }
            return channel.send("Sorry <@"+author.id+">, I can't find the dude. Is he still alive?");
        });
    }
    else {
        return channel.send("Sorry <@"+author.id+">, I can't do that.");
    }
}

async function getMyPoints(props, author, channel, guild, client) {

    const user = client.user.id;
    const points = await pointsBank.getPoints(client, author.id)

    if (points) return channel.send("<@"+author.id+">, you seem to have "+points+" punk points.");
    return channel.send("<@"+author.id+">, not at all.");
}

async function getUserPoints(props, author, channel, guild, client) {
    let targetUser = utils.parseUser(props.pop());
    let points = await pointsBank.getPoints(client, targetUser);
    if (points && points > 0) return channel.send("<@"+author.id+">, it looks like <@"+targetUser+"> has "+points+" punk points.");
    else return channel.send("<@"+author.id+">, it looks like <@"+targetUser+"> is not punk at all...");
}

async function getTopList(props, author, channel, guild, client) {
    let topList = await pointsBank.getTopList(client);

    let str = '**Here are the *punkest of them all*...**' + "\n";
    const members = await guild.members.fetch();

    let member;
    topList
        .split(/\|/g)
        .map(pair => pair.split(":"))
        .forEach((entry, index) => {
            member = members.find(mem => mem.id === entry[0]);
            console.log(member);
            str += `${index + 1}: **${member.nickname ? member.nickname : member.user.username}**: ${entry[1]} punk points` + "\n";
        });

    return channel.send(str);
}

async function requestPoints(props, author, channel, guild, client) {
    const sparedTo = Settings.get("spared-change", []);
    if (sparedTo.indexOf(author.id) > -1) {
        return channel.send("Oh no <@"+author.id+">, I already gave you free points. Don't be a beggar.")
    }

    const spareAmount = 10;
    let points = await pointsBank.getPoints(client, client.user.id);

    if (points >= spareAmount) {
        await pointsBank.givePoints(client, client.user.id, author.id, spareAmount);
        sparedTo.push(author.id);
        Settings.set("spared-change", sparedTo);
        return channel.send("Meh, yeah ok. <@"+author.id+"> you can have "+spareAmount+" punk points");
    }
    else {
        return channel.send("Sorry <@"+author.id+">, I'm all out.");
    }
}

module.exports = {
    give : giveCommand,
    my : getMyPoints,
    get : getUserPoints,
    top: getTopList,
    request : requestPoints,
};
