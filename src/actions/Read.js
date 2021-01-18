async function Analyze(req, target, value, doc) {

    const terms = doc.termList(),
        result = (terms.map(it => ({text: it.text, tags: it.tags })))

    return req.channel.send(result.map(word => `**${word.text}**: ${Object.keys(word.tags).join(", ")}`).join("\n"))
}

module.exports = {
    Analyze
};
