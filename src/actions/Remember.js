const Settings = require('../lib/Settings');

function saveMemory(res, target, value, doc) {

    // convert you/i stuff
    doc.match('you are').replaceWith('you_are_x_')
    doc.match("you're").replaceWith('youre_x_')
    doc.match('your').replaceWith('your_x_')
    doc.match("you").replaceWith('you_x_')

    doc.match('my').replaceWith("your")
    doc.match('i am').replaceWith("you are")
    doc.match("I'm").replaceWith("you're")
    doc.match('i').replaceWith("you")

    doc.match("you_x_").replaceWith("I")
    doc.match("youre_x_").replaceWith("I'm")
    doc.match("you_are_x_").replaceWith("I am")
    doc.match("your_x_").replaceWith("my")

    if (target.trim().length > 0) {
        const memories = Settings.get('memories', {});
        memories[res.author.id] = doc.text();
        Settings.set('memories', memories);
        return res.channel.send("ok, <@"+res.author.id+">, I'll remember that.");
    }
    else {
        return res.channel.send("Uhh, remember what, <@"+res.author.id+'>..?');
    }
}

function loadMemory(res) {
    const memories = Settings.get('memories', {});

    if (memories[res.author.id]) {
        return res.channel.send("oh yeah <@"+res.author.id+">, I remember "+memories[res.author.id]);
    }
    else {
        return res.channel.send("I hardly remember who you are, <@"+res.author.id+">...");
    }
}

function deleteMemory(props, author, channel, guild) {
    const memories = Settings.get('memories', {});

    if (memories[author.id]) {
        delete memories[author.id];
        Settings.set('memories', memories);
        return channel.send("ok <@"+author.id+">, it's like it never happened");
    }
    else {
        return channel.send("Forget about what? who are you even, <@"+author.id+">");
    }
}

module.exports = {
    saveMemory,
    loadMemory,
    deleteMemory,
};
