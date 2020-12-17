const Discord = require('discord.js');

const intents = new Discord.Intents([
    Discord.Intents.NON_PRIVILEGED, // include all non-privileged intents, would be better to specify which ones you actually need
    "GUILD_MEMBERS", // lets you request guild members (i.e. fixes the issue)
]);

class DiscordClient {
    constructor(token, username) {
        this.token = token;
        this.client = new Discord.Client({ws: { intents }});
        this.hooks = {};
        this.username = username;

        this._bindClientActions();
    }

    _bindClientActions() {
        this.client.once('ready', this._onReady.bind(this));
        this.client.on('message', this._onMessage.bind(this));
    }

    addHook(event, callback) {
        if (!this.hooks[event]) this.hooks[event] = [];
        this.hooks[event].push(callback);
    }

    removeHook(event, callback) {
        if (!this.hooks[event]) return false;
        for (let i = 0; i < this.hooks[event].length; i++) {
            if (this.hooks[event][i] === callback) {
                this.hooks[event].splice(i, 1);
                return true;
            }
        }
    }

    _onReady() {
        console.log("Discord client ready!");
        if (this.hooks['ready']) { for (let hook of this.hooks['ready']) hook(); }
        this.client.user.setUsername(this.username);
    }

    _onMessage(message) {
        const {content, author, channel} = message;
        const {guild} = channel;
        if (this.hooks['message']) { for (let hook of this.hooks['message']) hook(content, author, channel, guild, this.client); }
    }

    login() {
        this.client.login(this.token);
    }
}

module.exports = DiscordClient;
