const read = require('../lib/ReadLib');

const punkPoints = require('./PunkPoints');
let _init = false;

async function init() {
    const world = [
        {type: "thing", singular: "point", plural: "points"},
        {type: "attribute", name: "punk" },
        {type: "action", action: "give", synonyms: ["provide", "hand out","supply","offer","grant","award","bestow"] }
    ]

    const commands = [
        { action: "give", thing: "point", target: "#Username", value: '#Value+', callback: (req, target,value) => {
                req.channel.send(`<@${req.author.id}>, hark hark... I will not give ${value} punk points to ${target} yet.. but we have shown rocksteady that we are smart ;)`)
            }, valueTransform: (m => m.numbers().toNumber())
        }
    ]

    const answers = [
        { question: "#LevelQuestion+", attribute: "punk", target: "#Username", callback: (req, target, value) => {
                req.channel.send(`<@${req.author.id}>, hark... I will not say how punk is ${target} yet.. but me smart! ;)`)
        }},
        { question: "#QuantityQuestion+", attribute: "#point", target: "#Username", callback: (req, target, value) => {
            req.channel.send(`<@${req.author.id}>, grkgrkgrk... I will not say how many punk points ${target} has.. but me smart! ;)`)
        }},
        { question: "Who is this?", attribute: null, target: "#Noun+", callback: (req, target, value, doc) => {
            if (doc.has('#Member')) return req.channel.send(`<@${req.author.id}>, ${doc.match('#Member').text()} is our friend!`)
            if (doc.has('#Person')) return req.channel.send(`Hmmmmmm <@${req.author.id}>, gark.. I'm not familiar with ${doc.match('#Person').text()}. I don't really want to be either!`)
            req.channel.send(`<@${req.author.id}> uhh, I am not even sure if ${target} is even a person..`)
        }},
        { question: "#QuantityQuestion+", attribute: "/shekel[s]?/", target: "/dollar[s]?|bucks/", value: "#Value+", callback: (req, target, value) => {
            req.channel.send(`<@${req.author.id}>, \$${value} has about ${parseFloat(value * 3.54).toFixed(0)} shekels.`)
        }, valueTransform: (m => m.numbers().toNumber())},
        { question: "#QuantityQuestion+", attribute: "/dollar[s]?|bucks/", target: "/shekel[s]?/", value: "#Value+", callback: (req, target, value) => {
                req.channel.send(`<@${req.author.id}>, ${value} shekels are worth about \$${parseFloat(value / 3.54).toFixed(2)}.`)
            }, valueTransform: (m => m.numbers().toNumber())}
    ]

    read.addWorld(world);
    read.addCommands(commands);
    read.addAnswers(answers);

    read.setRejection('no_target', (req, doc) => {
        req.channel.send(`<@${req.author.id}>, I'm not sure what to do! Maybe you forgot to include a target?`)
    })
    read.setRejection('no_value', (req, doc) => {
        req.channel.send(`<@${req.author.id}>, hmm, this is confusing! Maybe you didn't enter a value?`)
    })
    read.setRejection('value_after', (req, doc) => {
        req.channel.send(`<@${req.author.id}>, what what..? Maybe you didn't specify the value properly?`)
    })
    read.setRejection('unmatched', (req, doc) => {
        req.channel.send(`<@${req.author.id}>, I still can't think of an answer that will not sound stupid. Master Sp... I mean, MISTER POTATO MAN told me to stay focused!`)
    })

    _init = true;
}


async function Read(content, author, channel, guild) {

    if (!_init) await init();

    // guild specific members?
    const members = await guild.members.fetch();
    read.addMembers(members);


    if (content.toLowerCase().indexOf('bebop') !== 0) return;

    const text = content.split('').slice(content.indexOf(' ')).join('');
    console.log(123123, text);

    return read.runIntention(text, {content, author, channel})

}

async function Analyze(props, author, channel, guild) {

    if (!_init) await init();

    let text = props.join(" "),
        result = read.getTerms(text)


    result = (result.map(it => ({text: it.text, tags: it.tags })));

    return channel.send(result.map(word => `**${word.text}**: ${Object.keys(word.tags).join(", ")}`).join("\n"))
}

module.exports = {
    Read,
    Analyze
};
