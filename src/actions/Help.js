function showHelp(req) {

    const str = `Hey <@${req.author.id}>, I'm not feeling so well hark hark... I'm working on myself. I will let you know what's up with me when I know better...`

    return req.channel.send(str);
}


module.exports = {
    showHelp
};
