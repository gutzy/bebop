const Settings = require('../lib/Settings');

const blacklist = ["705899224193171456"];

function givePoints(punkPoints, from, to, amount) {

    if (!punkPoints[from]) {
        return "Yeah nice try <@"+from+">, you don't have any points to give";
    }
    else if (punkPoints[from] < amount) {
        return "Nope <@"+from+">, you don't have this many points to give";
    }
    else if (isNaN(amount*1)) {
        return "I really can't give that amount, <@"+from+">?";
    }
    else if (amount < 1) {
        return "Uh perhaps you can give more than that, <@"+from+">?";
    }
    else if (blacklist.indexOf(to) > -1) {
        return "I can't give <@"+to+"> any points because he's blacklisted";
    }
    else {
        if (!punkPoints[to]) punkPoints[to] = 0;

        punkPoints[from] -= amount*1;
        punkPoints[to] += amount*1;
        Settings.set('punk-points', punkPoints);
        return "ok <@"+from+">, it's your death wish. I'm giving <@"+to+"> "+amount+" of your punk points.";
    }
}

function giveCommand(props, author, channel, guild, client) {
    let punkPoints = Settings.get('punk-points', null);
    if (!punkPoints) { punkPoints = {[client.user.id] : 666}; }
    let targetUser, amount;

    let everybody = false;
    if (props[0] && props[1]) {
        targetUser = props[0];
        amount = props[1];
        if (targetUser[0] === "<") targetUser = targetUser.substring(3, targetUser.length-1);
        if (targetUser[0] === '@') targetUser = targetUser.substring(1);
        if (targetUser[0] === "&") targetUser = targetUser.substring(1);

        guild.members.fetch().then(members => {

            if (targetUser.toLowerCase() === "everybody") {
                everybody = true;
                if (!punkPoints[author.id]) return channel.send("<@"+author.id+">, you don't have any punk points to give.")
                else if (!punkPoints[author.id] < members.size * amount) return channel.send("<@"+author.id+">, you don't have this many punk points to give to everybody.")
            }

            for (let member of members) {
                if (member[1].user.id === targetUser) {
                    let pointsResult = givePoints(punkPoints, author.id, targetUser, amount);
                    return channel.send(pointsResult);
                }
                else if (everybody) {
                    givePoints(punkPoints, author.id, member[1].user.id, amount);
                }
            }
            if (everybody) {
                return channel.send("Haha, you maniac! ok, everybody gets "+amount+" punk points, courtesy of <@"+author.id+">");
            }
            return channel.send("Sorry <@"+author.id+">, I can't find the dude. Is he still alive?");
        });
    }
    else {
        return channel.send("Sorry <@"+author.id+">, I can't do that.");
    }
}

function getMyPoints(props, author, channel, guild, client) {
    let punkPoints = Settings.get('punk-points', null);
    if (!punkPoints) { punkPoints = {[client.user.id] : 666}; }

    if (punkPoints[author.id]) return channel.send("<@"+author.id+">, you seem to have "+punkPoints[author.id]+" punk points.");
    return channel.send("<@"+author.id+">, not at all.");
}

function getUserPoints(props, author, channel, guild, client) {
    let punkPoints = Settings.get('punk-points', null);
    if (!punkPoints) { punkPoints = {[client.user.id] : 666}; }

    let targetUser = props[0];
    let points;
    while (targetUser[targetUser.length-1] === '?') targetUser = targetUser.substring(0, targetUser.length-1)
    while (targetUser[targetUser.length-1] === '>') targetUser = targetUser.substring(0, targetUser.length-1)
    if (targetUser[0] === '@') targetUser = targetUser.substring(1);
    if (targetUser[0] === "<") targetUser = targetUser.substring(3);
    guild.members.fetch().then(members => {

        for (let member of members) {
            if (member[1].user.id === targetUser || member[1].user.username === targetUser) {
                points = punkPoints[targetUser]
                if (points && points > 0) return channel.send("<@"+author.id+">, it looks like <@"+member[1].user.id+"> has "+points+" punk points.");
                else return channel.send("<@"+author.id+">, it looks like <@"+member[1].user.id+"> is not punk at all...");
            }
        }
        return channel.send("<@"+author.id+">, I have no idea.");
    });

}

function requestPoints(props, author, channel, guild, client) {
    let punkPoints = Settings.get('punk-points', null);
    if (!punkPoints) { punkPoints = {[client.user.id] : 666}; }

    if (blacklist.indexOf(author.id) > -1) {
        return channel.send("Sorry <@"+author.id+">, I can't give you any points because you're blacklisted");
    }


    if (punkPoints[client.user.id] > 10) {
        if (!punkPoints[author.id]) punkPoints[author.id] = 0;
        punkPoints[author.id] += 10;
        punkPoints[client.user.id] -= 10;
        Settings.set('punk-points', punkPoints);
        return channel.send("Meh, yeah ok. <@"+author.id+"> you can have 10 punk points");
    }
    else {
        return channel.send("Sorry <@"+author.id+">, I'm all out.");
    }
}

module.exports = {
    give : giveCommand,
    my : getMyPoints,
    get : getUserPoints,
    request : requestPoints
};
