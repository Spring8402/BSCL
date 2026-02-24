import fs from "fs";
import path from "path";

const args = process.argv.slice(2);

const getArg = (name) => {
    const index = args.indexOf(`--${name}`);
    return index !== -1 ? args[index + 1] : null;
};

const addedName = getArg("added");
const addedRank = parseInt(getArg("rank"), 10);

if (!addedName || isNaN(addedRank)) {
    console.error("Usage: node js/autochange.js --added \"Level Name\" --rank <number>");
    process.exit(1);
}

const LIST_PATH = "data/list.json";
const LEVELS_DIR = "data";
const today = new Date().toISOString().split("T")[0];

let list = JSON.parse(fs.readFileSync(LIST_PATH, "utf8"));

if (addedRank < 1 || addedRank > list.length + 1) {
    console.error("Invalid rank.");
    process.exit(1);
}

list.splice(addedRank - 1, 0, addedName);

for (let i = addedRank; i < list.length; i++) {
    const levelName = list[i];
    const levelPath = path.join(LEVELS_DIR, `${levelName}.json`);

    if (!fs.existsSync(levelPath)) continue;

    const level = JSON.parse(fs.readFileSync(levelPath, "utf8"));
    level.changelog ??= [];

    const newRank = i; 

    level.changelog.push({
        date: today,
        change: `Moved down to #${newRank} because "${addedName}" was placed above it.`
    });

    fs.writeFileSync(levelPath, JSON.stringify(level, null, 4));
}

const newLevelPath = path.join(LEVELS_DIR, `${addedName}.json`);
if (fs.existsSync(newLevelPath)) {
    const newLevel = JSON.parse(fs.readFileSync(newLevelPath, "utf8"));
    newLevel.changelog ??= [];

    newLevel.changelog.push({
        date: today,
        change: `Added at #${addedRank}.`
    });

    fs.writeFileSync(newLevelPath, JSON.stringify(newLevel, null, 4));
}

fs.writeFileSync(LIST_PATH, JSON.stringify(list, null, 4));

console.log("Changelog updates complete.");