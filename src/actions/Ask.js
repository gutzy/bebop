const fetch = require('node-fetch');

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

async function CurrencyCovertAmount(req, matches, doc) {
    console.log(matches);
    // let currencies = doc.match('/[A-Za-z]{3}/').out('array').map(it => it.toUpperCase());
    // value = doc.match('#NumericValue').text();
    // let info = await fetch("https://api.exchangeratesapi.io/latest");
    // let {rates, base} = await info.json();
    // let a, b;
    // for (let r of currencies) {
    //     if (rates[r]) {
    //         if (b) break; if (a) b = r; else a = r;
    //     }
    // }
    // if (a && b) {
    //     const res = parseFloat(value/rates[a]*rates[b]).toFixed(2)
    //     req.channel.send(`<@${req.author.id}>, ${value.toString()} ${a} is worth about ${res} ${b}`)
    // }
    // else {
    // }
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
