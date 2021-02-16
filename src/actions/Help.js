const {createCanvas, loadImage} = require('canvas'), Discord = require('discord.js')

function showHelp(req) {

    const str = `Hey <@${req.author.id}>, I'm not feeling so well hark hark... I'm working on myself. I will let you know what's up with me when I know better...`

    return req.channel.send(str);
}

async function arise(req, m, d, env) {

    const path = env.path + '/src/assets/images/arise.png';

    console.log(path);

    const img = await loadImage(path);
    const c = createCanvas(img.width, img.height),
        c2 = c.getContext('2d');

    c2.imageSmoothingEnabled = false;
    c2.drawImage(img,0,0)
    const attachment = new Discord.MessageAttachment(c.toBuffer(),'arise.png');
    return req.channel.send(null, attachment);

    // for (let item of items) {
    //     name = `${path}/images/items/${item.name.toLowerCase().split(" ").join("-")}.png`;
    //     try { images[name] = await loadImage(name); w += images[name].width; } catch(e) {}
    // }
    // if (items.length === 0) return null;
    //
    // c = createCanvas(w*scale + (spacing*(items.length+1)), 40);
    // c2 = c.getContext('2d');
    // c2.imageSmoothingEnabled = false;
}


module.exports = {
    showHelp,
    arise
};
