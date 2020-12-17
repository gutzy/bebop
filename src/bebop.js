const DiscordClient = require('./DiscordClient');
const Settings = require('./lib/Settings');

const naturalRequests = ["Can you", "Will you", "Do you mind", "Please", "Just"]

class Bebop {
    constructor(apiKey, username) {
        this.client = new DiscordClient(apiKey, username);
        this.commands = {}

        this._bindHooks();
    }

    start() {
        this.client.login();
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

    _bindHooks() {
        this.client.addHook('message', (content, author, channel, guild, client) => {

            let props = content.split(/ /g);
            if (props[0].toLowerCase().indexOf('bebop') !== 0) return; // Only "bebop" calls will be answered
            props.shift();

            // ignore natural requests
            for (let nr of naturalRequests) {
                if (props.join(' ').toLowerCase().indexOf(nr.toLowerCase()) === 0) {
                    props = props.join(' ').substring(nr.length).trim().split(/ /g);
                }
            }

            let command = props.length > 0 ? props.shift() : null;
            let joined = [command, ...props].join(" ").toLowerCase().trim();
            while (joined[joined.length-1].match(/[!?.]/)) joined = joined.substring(0, joined.length-1)
            props = joined.split(/ /g);

            // first iteration, look for exact commands
            for (let c in this.commands) {
                if (joined === c.toLowerCase()) {
                    for (let cb of this.commands[c]) cb(props, author, channel, guild, client);
                    return true;
                }
            }

            // second iteration, look for command matches
            for (let c in this.commands) {
                if (joined.toLowerCase().indexOf(c.toLowerCase()) === 0) {
                    props = props.join(' ').substring(c.length + (c.split(/ /g).length-1) - props[0].length).trim().split(/ /g);
                    props.shift();
                    for (let cb of this.commands[c]) cb(props, author, channel, guild, client);
                    return true;
                }
            }

            // otherwise, we failed to understand.
            channel.send("<@"+author.id+">, What?");
            return false;

        });
    }
}

module.exports = Bebop


