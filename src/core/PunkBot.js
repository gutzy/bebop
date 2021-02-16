const DiscordClient = require('./DiscordClient'), read = require('../lib/ReadLib');

class PunkBot {
    constructor(token, username, prefix, path) {
        this.client = new DiscordClient(token, username);
        this.prefix = prefix;
        this.docProcessors = [];
        this._bindHooks();

        if (path) {
            read.setEnvProp('path', path)
        }
    }

    start() {
        console.log(`Starting ${this.prefix.toUpperCase()}`)
        this.client.login();
    }

    addProcessor = (docProcessor) => this.docProcessors.push(docProcessor)
    addDefs = (defs) => read.addDefs(defs)
    addWorld = (world) => read.addWorld(world)
    setRejection = (rejection, cb) => read.setRejection(rejection, cb);
    getRejection = (rejection) => read.getRejection(rejection);

    async processDoc(doc, req) {

        const {guild, author, client} = req;
        const members = await guild.members.fetch(),
            responses = read.getResponses(), phrases = read.getPhrases();

        read.addMembers(doc, members, author.id, client.user.id);
        read.addDocTags(doc, responses.map(it => it.phrase), 'Response');
        read.addDocTags(doc, phrases.map(it => it.phrase), 'Phrase');

        for (let processor of this.docProcessors) {
            await processor(req, doc, read)
        }

    }

    async runCommands(content, author, channel, guild, client, message) {
        const req = {content, author, channel, guild, client, message}

        if (author.id === client.user.id) return false; // don't answer yourself
        const hasPrefix = content.toLowerCase().indexOf(this.prefix.toLowerCase()) === 0, isBot = author.bot;

        const doc = read.getDoc(content).replace(`^${this.prefix}`,'').trim();
        await this.processDoc(doc, req)

        doc.cache({root:true});

        const res = read.runIntention(doc, req, hasPrefix, isBot)
        if (!res && !read.hadRejection() && hasPrefix && this.getRejection('unmatched')) {
            this.getRejection('unmatched')(req, doc)
        }
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
