const krangLib = require('./KrangLib');

async function giveItem(client, from, to, item) {
    try {
        return await krangLib.request(client,`GiveItem`, `${from} ${to} ${item}`, {
            'BAD_PARAMS': "I didn't really get that, <@"+from+">?",
            'BLACKLISTED': "I can't give <@"+to+"> any items because he's blacklisted",
            'NO_ITEM': "Yeah nice try <@"+from+">, you don't have that item"
        })
    } catch (e) {
        throw (e);
    }
}

async function snatchItem(client, to, item) {
    try {
        await krangLib.request(client, `SnatchItem`,`${to}|${item}`, {
            'BAD_PARAMS': "I didn't really get that?",
            'BLACKLISTED': "I can't give <@"+to+"> any items because he's blacklisted",
            'NO_ITEM': "Sorry, I couldn't find that item"
        })
        return "ok haha!! Snatching item "+item+" and giving it to <@"+to+">...";
    } catch (e) {
        throw (e);
    }
}

async function getProp(client, item, prop) {
    item = item.trim();
    prop = prop.trim();

    try {
        return await krangLib.request(client, `GetItemProp`,`${item}|${prop}`, {
            'BAD_PARAMS': "I didn't really get that?",
            'NO_ITEM': "Item not found"
        })
    } catch (e) {
        throw (e);
    }
}

async function setProp(client, item, prop, value) {
    try {
        await krangLib.request(client, `SetItemProp`,`${item}|${prop}|${value}`, {
            'BAD_PARAMS': "I didn't really get that?",
            'NO_ITEM': "Item not found"
        })
        return true;
    } catch (e) {
        throw (e);
    }
}

async function createItem(client, name) {
    try {
        await krangLib.request(client, `CreateItem`,`${name}`, {
            'BAD_PARAMS': "I didn't really get that?",
            'EXISTS': "item already exists"
        })
        return true;
    } catch (e) {
        throw (e);
    }
}

async function removeItem(client, name) {
    try {
        await krangLib.request(client, `RemoveItem`,`${name}`, {
            'BAD_PARAMS': "I didn't really get that?",
            'NO_ITEM': "item not found"
        })
        return true;
    } catch (e) {
        throw (e);
    }
}

async function getInventory(client, userId, props = null) {
    try {
        let res = await krangLib.request(client, `Inventory`,`${userId}`, {})
        res = res ? res : [];
        let inventory = res.join(" ").trim().split(/\|\|/g);
        if (inventory.length === 1 && inventory[0] === '') inventory.splice(0, 1);
        inventory = inventory.map(it => {
            let r = {}
            const props = it.split(/\|/g);
            r.name = props.shift();
            props.forEach(prop => {let x = prop.split(/:/); r[x[0]] = x[1]});
            return r;
        })
        if (props) inventory = inventory.filter(it => {for (let p in props) if (it[p] !== props[p]) return false; return true });
        if (res.attachment) inventory.attachment = res.attachment;
        return inventory;
    } catch (e) {
        throw (e);
    }
}

async function locateItem(client, item) {
    try {
        const res = await krangLib.request(client, `LocateItem`,`${item}`, {
            'BAD_PARAMS': "I didn't really get that?",
            'NO_ITEM': "item not found anywhere!"
        })
        return res
    } catch (e) {
        throw (e);
    }
}

module.exports = {
    giveItem,
    getInventory,
    createItem,
    removeItem,
    locateItem,
    snatchItem,
    getProp,
    setProp,
}
