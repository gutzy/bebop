const DiscordClient = require('./DiscordClient'), read = require('../lib/ReadLib');

class PunkBot {
    constructor(token, username, prefix) {
        this.client = new DiscordClient(token, username);
        this.prefix = prefix;
        this._bindHooks();
    }

    start() {
        console.log(`Starting ${this.prefix.toUpperCase()}`)
        this.client.login();
    }

    addDefs = (defs) => read.addDefs(defs)
    addWorld = (world) => read.addWorld(world)
    setRejection = (rejection, cb) => read.setRejection(rejection, cb);

    async processDoc(doc, guild, author, client) {
        const members = await guild.members.fetch(),
            responses = read.getResponses(), phrases = read.getPhrases();

        read.addMembers(doc, members, author.id, client.user.id);
        read.addDocTags(doc, responses.map(it => it.phrase), 'Response');
        read.addDocTags(doc, phrases.map(it => it.phrase), 'Phrase');
    }

    async runCommands(content, author, channel, guild, client, message) {

        if (author.id === client.user.id) return false; // don't answer yourself
        const hasPrefix = content.toLowerCase().indexOf(this.prefix.toLowerCase()) === 0, isBot = author.bot;

        const doc = read.getDoc(content).replace(`^${this.prefix}`,'').trim();
        await this.processDoc(doc, guild, author, client)

        doc.cache({root:true});

        const res = read.runIntention(doc, {content, author, channel, guild, client, message}, hasPrefix, isBot)
        if (!res && !read.hadRejection() && hasPrefix) channel.send("<@"+author.id+">, What?")
        return false;
    }

    _bindHooks() {
        this.client.addHook('message', async (content, author, channel, guild, client, message) => {

            if(channel.type === "dm") {
                console.log("DM from "+author.username+':',content);
                return false;
            }
            // run commands
            await this.runCommands(content, author, channel, guild, client, message);
            return false;
        });
    }
}

module.exports = PunkBot
