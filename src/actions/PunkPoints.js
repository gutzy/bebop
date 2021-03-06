const Settings = require('../lib/Settings'), utils = require("../lib/Utils"), pointsBank = require("../lib/PointsBank");

function GivePoints(req, matches, doc) {
    const {client, channel, author, guild} = req;

    let targetUser = utils.parseUser(matches[0]),
        amount = matches[1] * 1;

    guild.members.fetch().then(async members => {

        const tu = members.find(m => m.user.id*1 === targetUser*1);
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

async function GetBotPoints(req) {
    const {client, channel, author, guild} = req;

    const points = await pointsBank.getPoints(client, client.user.id)

    if (points) return channel.send("<@"+author.id+">, I have "+points+" punk points.");
    return channel.send("<@"+author.id+">, I am not punk at all :(");
}

async function GetAuthorPoints(req) {
    const {client, channel, author} = req;

    const points = await pointsBank.getPoints(client, author.id)

    if (points) return channel.send("<@"+author.id+">, you seem to have "+points+" punk points.");
    return channel.send("<@"+author.id+">, you are not punk at all.");
}

async function GetUserPoints(req, targetUser) {
    const {client, channel, author, guild} = req;

    targetUser = utils.parseUser(targetUser);
    let points = await pointsBank.getPoints(client, targetUser);
    if (points && points > 0) return channel.send("<@"+author.id+">, it looks like <@"+targetUser+"> has "+points+" punk points.");
    else return channel.send("<@"+author.id+">, it looks like <@"+targetUser+"> is not punk at all...");
}

async function GetTopList(req) {
    const {client, channel, guild} = req;

    let topList = await pointsBank.getTopList(client);

    let str = '**Here are the *punkest of them all*...**' + "\n";
    const members = await guild.members.fetch();

    let member;
    topList
        .split(/\|/g)
        .map(pair => pair.split(":"))
        .forEach((entry, index) => {
            member = members.find(mem => mem.id === entry[0]);
            str += `${index + 1}: **${member.nickname ? member.nickname : member.user.username}**: ${entry[1]} punk points` + "\n";
        });

    return channel.send(str);
}

async function RequestPoints(req) {
    const { author, channel, client} = req;

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
    GivePoints,
    GetAuthorPoints,
    GetUserPoints,
    GetBotPoints,
    GetTopList,
    RequestPoints,
};
