const pointsBank = require('../lib/PointsBank');

const annoyResponses = [
    "grrrr SHUT UP, Rocksteady!!!", "GRRRR... RRRRRRocksteady!", "Why do you keep saying this about me? shut up rocksteady!!!",
    "grr I am not stupid! no ROCKSTEADY!", "stop it ROCKSTEADY!", "nooo shut up ROCKSTEADY! :(",
    "hark hark ROCKSTEADY! stop it!", "I'm not dumb! shut up ROCKSTEADY!",
    "hark hark! I will tell @Shredder about this :(", "No I am not stupid!!", "Rocksteady you are not my boss!"
],
robOkResponses = [
    `Ok! ok Rocksteady! here take AMOUNT points and leave me alone!!!`,`Rocksteady you bastard! don't hurt me... take these AMOUNT points :(`,
    `Please rocksteady, don't do it! gark gark ok take AMOUNT punk points geez..!`, `Noooo ok ok you can have it! leave me alone rocksteady here is AMOUNT points!`
],
robBrokeResponses = [`What do you want, I already gave you everything I have!`, `No... please Rocksteady, I don't have anything left!`]

const annoyMatches = [
    "Stupid", "DUM DUM", "BRAIN DEAD", "DUMB","NO BRAIN", "and I don't know anything", "idiot", "What a surprise, BEBOP IS STUPID!!!!",
    "Anyone is smarter than BEBOP", "when you DON'T STAY IN SCHOOL"].map(it => it.toLowerCase()),
    rocksteadyRobMatches = [
        `I need a small loan from you`, `I need you to give me some points now`, `Give me your points right now`, `GIVE ME PUNK POINTS or I will KICK YOUR ASS`
    ].map(it => it.toLowerCase())

const randResponse = (arr) => arr[Math.floor(Math.random()*arr.length)];
const isRocksteady = (author) => author.bot && author.username.toLowerCase().indexOf("rocksteady") > -1
const matchInArray = (content, arr) => { for (let match of arr) if (content.toLowerCase().indexOf(match) > -1) return true; return false; }
const isAnnoy = (content) => {
    if (content.toLowerCase().indexOf('bebop') === -1) return false;
    if (matchInArray(content, annoyMatches)) return true;
}


const isRob = (content) => {
    if (content.toLowerCase().indexOf('bebop') === -1) return false;
    if (matchInArray(content, rocksteadyRobMatches)) return true;
}

async function RespondToRocksteady(content, author, channel, guild, client, message) {
    if (!isRocksteady(author)) return false;
    if (isAnnoy(content)) {
        console.log("Rocksteady Annoyance:", content);
        if (Math.random() > 0.8) {
            return channel.send(randResponse(annoyResponses))
        }
    }

    else if (isRob(content)) {
        const points = await pointsBank.getPoints(client, client.user.id);
        if (points > 0) {
            const pointsToGive = Math.min(points*1, 3 + Math.floor(Math.random() * 5))
            await pointsBank.givePoints(client, client.user.id, author.id, pointsToGive);
            return channel.send(randResponse(robOkResponses).replace('AMOUNT', pointsToGive));
        }
        else {
            return channel.send(randResponse(robBrokeResponses));
        }
        console.log("Rocksteady Robbery:", content);
    }
}

module.exports = {
    RespondToRocksteady
}
