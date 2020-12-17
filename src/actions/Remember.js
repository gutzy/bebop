const Settings = require('../lib/Settings');

function saveMemory(props, author, channel, guild) {
    if (props.length > 0) {
        const memories = Settings.get('memories', {});
        memories[author.id] = props.join(" ");
        Settings.set('memories', memories);
        return channel.send("ok, <@"+author.id+">, I'll remember that.");
    }
    else {
        return channel.send("Uhh, remember what, <@"+author.id+'>..?');
    }
}

function loadMemory(props, author, channel, guild) {
    const memories = Settings.get('memories', {});

    if (memories[author.id]) {
        return channel.send("oh yeah <@"+author.id+">, I remember "+memories[author.id]);
    }
    else {
        return channel.send("I hardly remember who you are, <@"+author.id+">...");
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
