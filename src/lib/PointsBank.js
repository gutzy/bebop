const utils = require('./Utils'), krangLib = require('./KrangLib');


async function givePoints(client, from, to, amount) {

    return new Promise(async (resolve, reject) => {
        try {
            await krangLib.request(client,'Transaction',`${from} ${to} ${amount}`,{
                'BAD_PARAMS': "I didn't really get that, <@"+from+">?",
                'BLACKLISTED': "I can't give <@"+to+"> any points because he's blacklisted",
                'NO_BALANCE': "Yeah nice try <@"+from+">, you don't have any points to give",
                'NOT_ENOUGH_POINTS': "Nope <@"+from+">, you don't have this many points to give",
            });
            return resolve();
        } catch (e) {
            reject(e)
        }
    });
}

async function getPoints(client, user) {

    return new Promise(async (resolve, reject) => {
        try {
            const res = await krangLib.request(client,'Balance',`${user}`,{});
            return resolve(res*1);
        } catch (e) {
            reject(e)
        }
    });
}

async function getTopList(client) {

    return new Promise(async (resolve, reject) => {
        try {
            const res = await krangLib.request(client,'TopPoints',``,{});
            return resolve(res.join(" "));
        } catch (e) {
            reject(e)
        }
    });
}

module.exports = {
    getPoints,
    givePoints,
    getTopList,
}
