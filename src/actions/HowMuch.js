const utils = require("../lib/Utils");
const positive = [
    "I really THING TARGET!", "I THING TARGET a lot!!!", "I actually do THING TARGET quite a lot!", "you can't even imagine how much I THING TARGET...",
    "So much! I think I THING TARGET more than anything else.", "I THING TARGET alright.", "TARGET is something you THING.", "A lot!", "so much!!!"
], negative = [
    "Heh, I don't THING TARGET and I never will.", "Not at all. Why would anyone THING TARGET?", "I can't think of one good reason to THING TARGET",
    "Who would ever THING TARGET? seriously? you fool!", "I don't THING TARGET", "on a scale of 0 to 100? zero.", "I don't! I never will!"
], bel  =[
    "I do. Why shouldn't I?", "Yes of course", "Maybe I believe TARGET. Got any problem with that?"
], notBel = [
    "Nobody believes TARGET", "Believing TARGET would be a very bad idea", "No. who would believe TARGET?"
];


function doYou(props, author, channel, guild, client, message) {
    let res = utils.parseThingOnSubject(props);
    let r = positive;

    if (!utils.validateModMessage(message, channel)) {
        r = negative;
    }

    return channel.send("<@"+author.id+">, " +r[Math.floor(Math.random() * r.length)]
        .replace(/THING/g, res[0])
        .replace(/TARGET/g, res[1])
        .replace(/ my /gi," your ")
        .replace(/ me/gi," you")
    );
}

function believe(props, author, channel, guild, client, message) {
    let r = notBel;
    if (!utils.validateModMessage(message, channel)) {
        r = bel;
    }
    const subject = props.join(" ");
    return channel.send("<@"+author.id+">, " + r[Math.floor(Math.random() * r.length)]
        .replace(/TARGET/g, subject)
        .replace(/ my /gi," your ")
        .replace(/ I /gi," you ")
        .replace(/ me/gi," you")
    )
        ;
}

module.exports = {
    doYou,
    believe,
};
