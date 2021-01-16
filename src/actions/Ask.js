async function WhoIs(req, target, value, doc) {
    if (doc.has('#Member')) return req.channel.send(`<@${req.author.id}>, ${doc.match('#Member').text()} is our friend!`)
    if (doc.has('#Person')) return req.channel.send(`Hmmmmmm <@${req.author.id}>, gark.. I'm not familiar with ${doc.match('#Person').text()}. I don't really want to be either!`)
    req.channel.send(`<@${req.author.id}> uhh, I am not even sure if ${target} is even a person..`)
}

async function WhoAmI(req, target, value, doc) {
    req.channel.send(`<@${req.author.id}>, you are my friend!`);
}

module.exports = {
    WhoIs,
    WhoAmI
};
