const Currencies = require('../lib/data/Currencies.json');

module.exports = function(req, doc) {
    let aliases;

    for (let code in Currencies) {
        doc.match(code).tag("Currency")
        aliases = typeof Currencies[code] === "string" ? [Currencies[code]] : Currencies[code];
        // console.log(code, aliases)
        for (let alias of aliases) {
            doc.match(alias).tag("Currency")
            doc.match(alias+'s').tag("Currency")
        }
    }
}
