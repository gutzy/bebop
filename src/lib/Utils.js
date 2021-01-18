const {getDoc} = require('./ReadLib');

const defaultResponseOptions = { maxMessages: 50, timeLimit: 10 }

module.exports = {
    validateModMessage(message, channel, sendResponse = false) {
        const isMod = !!message.member.roles.cache.find(r => r.name.toLowerCase().indexOf('mod') > -1);
        if (!isMod) {
            if (sendResponse) channel.send("<@"+author.id+">, who tf are you?");
            return false;
        }
        return true;
    },

    awaitResponses(channel, match, options = {}) {
        options = {...defaultResponseOptions, ...options};

        const filter = (r) => {
            if (r.author.bot || r.channel.id !== channel.id) return false;
            if (options.answer && r.author !== options.answer) return false;
            return true;
        }

        return new Promise(async (resolve, reject) => {
            const collector = channel.createMessageCollector(filter, { max: options.maxMessages, time: options.timeLimit * 1000 });
            let st;
            collector.on('collect', m => {
                st = getDoc(m.content).normalize({whitespace: true, case: true, punctuation: true,});
                if (st.has(match)) {
                    resolve(m);
                }
            });
            collector.on('end', collected => resolve(false));
        })
    },

    parseUser(username) {
        if (username[0] === "<" && username[username.length-1] === ">") username = username.substring(1, username.length-1);
        if (username[0] === '@') username = username.substring(1);
        if (username[0] === "&") username = username.substring(1);
        if (username[0] === '!') username = username.substring(1);
        return username;
    },


    getTextChannel(client, channelName) {
        return client.channels.cache.find(r => r.name === channelName && r.type === "text");
    }

}
