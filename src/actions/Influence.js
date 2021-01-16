const Settings = require('../lib/Settings'), utils = require("../lib/Utils");

function youShould(props, author, channel, guild, client, message) {

    let action = "add";
    if (props[0] === "not") {
        action = "remove";
        props.shift();
    }

    let res = utils.parseThingOnSubject(props);

    if (res.length < 2) return channel.send("Huh?");

    const opinion = res[0], subject = res[1];

    if (!utils.validateModMessage(message, channel)) {
        return channel.send("<@"+author.id+">, don't tell me what to do!");
    }

    let opinions = Settings.get('opinions', null);
    if (!opinions) { opinions = {}; }
    if (!opinions[opinion]) opinions[opinion] = [];

    if (action === "add") {
        if (opinions[opinion].indexOf(subject) > -1) {
            return channel.send("<@"+author.id+">, I already do!");
        }

        opinions[opinion].push(subject);
        Settings.set('opinions', opinions);

        return channel.send("<@"+author.id+">, ok I will.");
    }
    else if (action === "remove") {
        if (opinions[opinion].indexOf(subject) === -1) {
            return channel.send("<@"+author.id+">, I already don't!");
        }

        opinions[opinion].splice(opinions[opinion].indexOf(subject), 1);
        Settings.set('opinions', opinions);

        return channel.send("<@"+author.id+">, ok I won't.");
    }
}

function doYou(props, author, channel, guild, client, message) {
    let opinions = Settings.get('opinions', {});
    let res = utils.parseThingOnSubject(props);

    if (res.length < 2) return channel.send("Huh?");

    const opinion = res[0], subject = res[1];

    if (opinions[opinion] && opinions[opinion].indexOf(subject) > -1) {
        return channel.send("<@"+author.id+">, Yes I do.");
    }
    else {
        return channel.send("<@"+author.id+">, I don't know...");
    }
}

function whatDoYou(props, author, channel, guild, client, message) {
    let opinions = Settings.get('opinions', {});
    const thing = props.join(" ").trim();

    if (!thing) return channel.send("Huh?");

    if (!opinions[thing] || opinions[thing].length === 0) {
        return channel.send("<@"+author.id+">, I don't "+ thing +" anything.");
    }
    else {
        if (opinions[thing].length > 10) {
            return channel.send("<@"+author.id+">, I "+ thing +" so many things, you'll have to ask more specifically.")
        }
        else {
            let stuff = "";
            for (let i = 0; i < opinions[thing].length; i++) {
                if (stuff) {
                    if (i === opinions[thing].length -1) stuff += " and ";
                    else stuff += ", ";
                }
                stuff += opinions[thing][i];
            }
            return channel.send("<@"+author.id+">, I "+ thing +" "+stuff+".");
        }
    }

}

module.exports = {
    doYou,
    youShould,
    whatDoYou,
};
