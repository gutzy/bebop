const onWords = ['at','on','in','towards','against'];

module.exports = {
    validateModMessage(message, channel, sendResponse = false) {
        const isMod = !!message.member.roles.cache.find(r => r.name.toLowerCase().indexOf('mod') > -1);
        if (!isMod) {
            if (sendResponse) channel.send("<@"+author.id+">, who tf are you?");
            return false;
        }
        return true;
    },

    parseUser(username) {
        if (username[0] === "<") username = username.substring(3, username.length-1);
        if (username[0] === '@') username = username.substring(1);
        if (username[0] === "&") username = username.substring(1);
        return username;
    },

    parseChannel(props, _default = 'general') {
        let channelToReveal = props[0];
        if (props[1]) channelToReveal = props[1];
        if (!channelToReveal) channelToReveal = _default;
        return channelToReveal;
    },

    parseUserInChannel(props) {
        let user = null, chn = null;
        for (let p of props) {
            if (!user) {
                if (onWords.indexOf(p) > -1) continue;
                else user = p; break;
            }
        }
        chn = props[props.length-1];
        return [user, chn];
    },

    getTextChannel(client, channelName) {
        return client.channels.cache.find(r => r.name === channelName && r.type === "text");
    }

}
