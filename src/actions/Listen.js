const Settings = require('../lib/Settings'), read = require('../lib/ReadLib')

const curseMilestones = [ 50, 100, 500, 1000, 5000, 10000 ]

function CurseWords(req, word) {
    const curses = Settings.get('curses', {})
    if (!curses[word]) curses[word] = {};
    if (!curses[word][req.author.id]) curses[word][req.author.id] = 0;
    curses[word][req.author.id]++;
    Settings.set('curses', curses);

    let total = curses[word][req.author.id];
    if (curseMilestones.indexOf(total) > -1) {
        total = read.getDoc(total).numbers().toOrdinal().text()
        req.channel.send(`<@${req.author.id}>, this is the ${total} time you have said *${word}* since I started counting. I thought this was worth mentioning.`)
    }
}

module.exports = {
    CurseWords


}
