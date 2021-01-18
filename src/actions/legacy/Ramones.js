const r = [
    "Beat on the brat!", "Do you wanna dance?", "Now I wanna sniff some glue!", "We're a happy family!", "She went away for the holiday...",
    "Chewin' out a rhythm on my bubble gum!", "Well the kids are all hopped up and ready to go!", "Jackie is a punk! Judy is a runt!",
    "Hey ho, let's go! Hey ho, let's go!", "20, 20, 20, 4, hours to go... I wanna be sedated!", "Lobotomy! lobotomy! lobotomy! lobotomy!"
];


function songStart(props, author, channel, guild) {
    return channel.send("<@"+author.id+">, " +r[Math.floor(Math.random() * r.length)]);
}


module.exports = {
    songStart,
};
