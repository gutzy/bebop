const Settings = require('../lib/Settings'), utils = require("../lib/Utils"), pointsBank = require("../lib/PointsBank");

function giveCommand(req, target, value) {
    let targetUser, amount;
    if (target && value) {
        targetUser = utils.parseUser(target);
        amount = value * 1;

        req.guild.members.fetch().then(async members => {

            const tu = members.find(m => m.user.id*1 === targetUser);
            if (tu) {
                try {
                    await pointsBank.givePoints(req.client, req.author.id, tu.id, amount);
                    return req.channel.send(`Ok <@${req.author.id}>, whatever you want... Giving <@${tu.id}> ${amount} of your punk points...`);
                } catch (e) {
                    return req.channel.send(e);
                }
            }
            return req.channel.send("Sorry <@"+req.author.id+">, I can't find the dude. Is he still alive?");
        });
    }
    else {
        return req.channel.send("Sorry <@"+req.author.id+">, I can't do that.");
    }
}

async function getYourPoints(req) {

    const points = await pointsBank.getPoints(req.client, req.client.user.id)

    if (points) return req.channel.send("<@"+req.author.id+">, I have "+points+" punk points.");
    return req.channel.send("<@"+req.author.id+">, I am not punk at all :(");
}

async function getMyPoints(req) {

    const points = await pointsBank.getPoints(req.client, req.author.id)

    if (points) return req.channel.send("<@"+req.author.id+">, you seem to have "+points+" punk points.");
    return req.channel.send("<@"+req.author.id+">, you are not punk at all.");
}

async function getUserPoints(req, targetUser) {
    targetUser = utils.parseUser(targetUser);
    let points = await pointsBank.getPoints(req.client, targetUser);
    if (points && points > 0) return req.channel.send("<@"+req.author.id+">, it looks like <@"+targetUser+"> has "+points+" punk points.");
    else return req.channel.send("<@"+req.author.id+">, it looks like <@"+targetUser+"> is not punk at all...");
}

async function getTopList(req) {
    let topList = await pointsBank.getTopList(req.client);

    let str = '**Here are the *punkest of them all*...**' + "\n";
    const members = await req.guild.members.fetch();

    let member;
    topList
        .split(/\|/g)
        .map(pair => pair.split(":"))
        .forEach((entry, index) => {
            member = members.find(mem => mem.id === entry[0]);
            console.log(member);
            str += `${index + 1}: **${member.nickname ? member.nickname : member.user.username}**: ${entry[1]} punk points` + "\n";
        });

    return req.channel.send(str);
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
    your: getYourPoints,
    get : getUserPoints,
    top: getTopList,
    request : requestPoints,
};
