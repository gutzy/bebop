const uniqid = require('uniqid'), utils = require('./Utils'), {getDoc} = require('./ReadLib');

async function request(client, requestStr, paramsString = '', errors = {}) {

    const validateMsg = (r, reqId) => r.author.bot && r.author.username.toLowerCase().indexOf('krang') > -1 && r.content.indexOf(reqId) === 0

    return new Promise(async (resolve, reject) => {

        const reqId = uniqid();
        const msg = `krang ${requestStr} ${reqId} ${paramsString}`;
        const channel = utils.getTextChannel(client, 'technodrome-bank');
        const collector = channel.createMessageCollector((r) => validateMsg(r, reqId), { max: 10, time: 5 * 1000 });
        let st;
        collector.on('collect', m => {

            st = getDoc(m.content).normalize({whitespace: true, case: true, punctuation: true,}).text().split(' ');
            const result = st[1], details = st[2] ? st.slice(2) : null;
            if (result.toLowerCase() === "error") {
                if (errors && errors[details.join("").toUpperCase()]) reject(errors[details.join("").toUpperCase()]);
                else reject(details);
            }
            else {
                if (m.attachments.size === 1) details.attachment = m.attachments.first();
                resolve(details);
            }
        });
        collector.on('end', collected => reject(false));

        channel.send(msg);
    })
}

module.exports = {
    request
}
