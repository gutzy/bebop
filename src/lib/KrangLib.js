const uniqid = require('uniqid'), utils = require('./Utils');

async function request(client, requestStr, paramsString = '', errors = {}) {

    const validateMsg = r => r.author.bot && r.author.username.toLowerCase().indexOf('krang') > -1

    return new Promise(async (resolve, reject) => {

        const reqId = uniqid();
        const msg = `krang ${requestStr} ${reqId} ${paramsString}`;
        const channel = utils.getTextChannel(client, 'technodrome-bank');
        try {
            let res = channel.awaitMessages((r) => validateMsg(r) && r.content.indexOf(reqId) === 0 , {max: 1, time: 5000}).then(res => {
                const first = res.first();
                const r = first.content.split(' '), result = r[1], details = r[2] ? r.slice(2) : null;
                if (result === "ERROR") {
                    if (errors[details]) reject(errors[details]);
                    else reject(details);
                }
                else {
                    resolve(details);
                }
            });

            let m = await channel.send(msg);

        } catch (e) {
            console.log("uhhh...", e);
        }
    })
}

module.exports = {
    request
}
