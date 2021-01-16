const DiscordClient = require('./DiscordClient');
const Settings = require('./lib/Settings'),
    read = require('./lib/ReadLib'),
    utils = require('./lib/Utils')

const naturalRequests = ["Can you", "Will you", "Do you mind", "Please", "Just"];

class Bebop {
    constructor(token, username) {
        this.client = new DiscordClient(token, username);
        this.commands = {}
        this.responses = []

        this._bindHooks();
    }

    start() {
        console.log("Starting BEBOP")
        this.client.login();
    }

    addResponder(callback) {
        this.responses.push(callback);
    }

    addWorld = (world) => read.addWorld(world)
    addCommands = (commands) => read.addCommands(commands);
    addAnswers = (commands) => read.addAnswers(commands);
    addWords = (commands) => read.addWords(commands);
    setRejection = (rejection, cb) => read.setRejection(rejection, cb);

    async runCommands(content, author, channel, guild, client, message) {

        for (let resp of this.responses) { resp(content, author, channel, guild, client, message); }

        let props = content.split(/ /g);
        if (props[0].toLowerCase().indexOf('bebop') !== 0 || author.bot) return false; // ignore non 'bebop' messages

        // guild specific stuff
            const members = await guild.members.fetch();
            read.addMembers(members);

        const text = content.split('').slice(content.indexOf(' ')).join('').trim();

        const res = read.runIntention(text, {content, author, channel, guild, client, message})
        if (!res && !read.hadRejection()) channel.send("<@"+author.id+">, What?")
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
