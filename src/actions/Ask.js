const fetch = require('node-fetch'), {getDoc} = require('../lib/ReadLib');
const Currencies = require('../lib/data/Currencies.json');

const eqLower = (a,b) => a.toLowerCase().trim() === b.toLowerCase().trim()

function findCurrency(type) {
    let aliases;
    for (let code in Currencies) {
        if (eqLower(code, type)) return code;
        aliases = typeof Currencies[code] === "string" ? [Currencies[code]] : Currencies[code];
        for (let alias of aliases) if (eqLower(alias, type)) return code;
    }
}

async function WhoIs(req, match, doc) {
    if (doc.has('#Author')) return req.channel.send(`<@${req.author.id}>, it is you!`)
    if (doc.has('(#Self|bebop)')) return req.channel.send(`<@${req.author.id}>, it is me, Bebop!!!`)
    if (doc.has('#Member')) return req.channel.send(`<@${req.author.id}>, ${doc.match('#Member').text()} is our friend!`)
    if (doc.has('#Person')) return req.channel.send(`Hmmmmmm <@${req.author.id}>, gark.. I'm not familiar with ${match}. I don't really want to be either!`)
    req.channel.send(`<@${req.author.id}> uhh, I am not even sure if ${match} is a person..`)
}

async function WhoAreYou(req, matches, doc) {
    req.channel.send(`<@${req.author.id}> I am bebop.. I'm a mutant punk pig!`)
}

async function CurrencyCovertAmount(req, [amount, from, to], doc) {

    from = getDoc(from).nouns().toSingular().text();
    to = getDoc(to).nouns().toSingular().text();
    amount = (getDoc(amount).numbers().json())[0]['number'] || 1;

    const fromCurrency = findCurrency(from), toCurrency = findCurrency(to);
    let info = await fetch("https://api.exchangeratesapi.io/latest");
    let {rates, base} = await info.json();

    if (!rates[fromCurrency]) return req.channel.send(`<@${req.author.id}>, I don't have currency rate information for ${from}, sorry...`)
    if (!rates[toCurrency]) return req.channel.send(`<@${req.author.id}>, I don't have currency rate information for ${to}, sorry...`)
   const res = parseFloat((amount/rates[fromCurrency]*rates[toCurrency])+'').toFixed(2)
    req.channel.send(`<@${req.author.id}>, ${amount} ${from} is worth about ${res} ${to}`)
}

async function WhoAmI(req, matches, doc) {
    req.channel.send(`<@${req.author.id}>, you are my friend!`);
}

async function WhatsMyAgeAgain(req, matches, doc) {
    const randomAge = Math.round(2+Math.random()*15);
    req.channel.send("Hmm, I'd say <@"+req.author.id+"> is about "+randomAge)
}

async function GunOnMyBack(req, matches, doc) {
    req.channel.send("...I GOT A GUN ON MY BACK!")
}

module.exports = {
    WhoIs,
    WhoAmI,
    WhoAreYou,
    WhatsMyAgeAgain,
    CurrencyCovertAmount,
    GunOnMyBack,
};
