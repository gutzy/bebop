const DiscordClient = require('./DiscordClient');
    read = require('./lib/ReadLib');

class Bebop {
    constructor(token, username) {
        this.client = new DiscordClient(token, username);

        this._bindHooks();
    }

    start() {
        console.log("Starting BEBOP")
        this.client.login();
    }

    addWorld = (world) => read.addWorld(world)
    addResponses = (responses) => read.addResponses(responses);
    addCommands = (commands) => read.addCommands(commands);
    addAnswers = (answers) => read.addAnswers(answers);
    addWords = (words, tags) => read.addWords(words, tags);
    setRejection = (rejection, cb) => read.setRejection(rejection, cb);

    async processDoc(doc, guild, author, client) {
        const members = await guild.members.fetch(),
            responses = read.getResponses();
        read.addMembers(doc, members, author.id, client.user.id);
        read.addResponsePhrases(doc, responses.map(it => it.phrase));
    }

    async runCommands(content, author, channel, guild, client, message) {

        if (author.id === client.user.id) return false; // don't answer yourself
        const hasPrefix = content.toLowerCase().indexOf('bebop') === 0, isBot = author.bot;

        const doc = read.getDoc(content).replace('^bebop','').trim();
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
            this.runCommands(content, author, channel, guild, client, message);
            return false;
        });
    }
}

module.exports = Bebop
