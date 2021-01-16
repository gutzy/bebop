const DiscordClient = require('./DiscordClient');
const Settings = require('./lib/Settings'), utils = require('./lib/Utils');

const naturalRequests = ["Can you", "Will you", "Do you mind", "Please", "Just"];

class Bebop {
    constructor(token, username) {
        this.client = new DiscordClient(token, username);
        this.commands = {}
        this.responses = []
        this.terminal = []

        this._bindHooks();
    }

    start() {
        console.log("Starting BEBOP")
        this.client.login();
    }

    addResponder(callback, terminal = false) {
        this.responses.push(callback);
        this.terminal.push(!!terminal);
    }

    addCommand(command, callback) {
        if (command.indexOf('|') > -1) {
            const commands = command.split(/\|/g);
            for (let cmd of commands) {
                if (!this.commands[cmd]) this.commands[cmd] = []
                this.commands[cmd].push(callback);
            }
        }
        else {
            if (!this.commands[command]) this.commands[command] = []
            this.commands[command].push(callback);
        }
    }

    removeCommand(command, callback) {
        if (!this.commands[command]) return false;
        for (let i = 0; i < this.commands[command].length; i++) {
            if (this.commands[command][i] === callback) {
                this.commands[command].splice(i, 1);
                return true;
            }
        }
    }

    async runCommands(content, author, channel, guild, client, message) {

        let r;
        for (let i = 0; i < this.responses.length; i++) {
            r = await this.responses[i](content, author, channel, guild, client, message);
            if (this.terminal[i] && r === true) return;
        }

        let props = content.split(/ /g);
        if (props[0].toLowerCase().indexOf('bebop') !== 0 || author.bot) return false;

        props.shift();

        // ignore natural requests
        for (let nr of naturalRequests) {
            if (props.join(' ').toLowerCase().indexOf(nr.toLowerCase()) === 0) {
                props = props.join(' ').substring(nr.length).trim().split(/ /g);
            }
        }


        let command = props.length > 0 ? props.shift() : null;
        let joined = [command, ...props].join(" ").toLowerCase().trim();
        while (joined.length>0 && joined[joined.length-1].match(/[!?.]/)) joined = joined.substring(0, joined.length-1)
        props = joined.split(/ /g);

        // first iteration, look for exact commands
        for (let c in this.commands) {
            if (joined === c.toLowerCase()) {
                for (let cb of this.commands[c]) cb([], author, channel, guild, client, message);
                return true;
            }
        }

        // second iteration, look for command matches
        for (let c in this.commands) {
            if (joined.toLowerCase().indexOf(c.toLowerCase()) === 0) {
                props = props.join(' ').substring(c.length).trim().split(/ /g);
                if (props[0] === c) props.shift();
                for (let cb of this.commands[c]) cb(props, author, channel, guild, client, message);
                return true;
            }
        }

        channel.send("<@"+author.id+">, What?")
        return false;
    }

    _bindHooks() {
        this.client.addHook('message', async (content, author, channel, guild, client, message) => {

            if(channel.type === "dm") {
                console.log("DM from "+author.username+':',content);
                return false;
            }
            // run commands
            this.runCommands(content, author, channel, guild, client, message);

            return false;

        });
    }
}

module.exports = Bebop
