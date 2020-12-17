const fs = require('fs');

const settingsFile = 'data/bebop-settings.json';

let data;

function load() {
    if (fs.existsSync(settingsFile)) {
        data = JSON.parse(fs.readFileSync(settingsFile));
    } else {
        data = {}
    }
}

function save() {
    fs.writeFileSync(settingsFile, JSON.stringify(data));
}

function get(prop, defaultValue = null) {
    if (!data) load();
    return (typeof data[prop] !== "undefined") ? data[prop] : defaultValue;
}

function set(prop, value) {
    if (!data) load();
    data[prop] = value;
    save();
}

module.exports = {
    get, set
};
