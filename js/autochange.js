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

list = list.filter(name => name !== addedName);

list.splice(addedRank - 1, 0, addedName);

list = list.filter(name => name !== addedName);


list.splice(addedRank - 1, 0, addedName);


list.forEach((levelName, index) => {
    const levelPath = path.join(LEVELS_DIR, `${levelName}.json`);
    if (!fs.existsSync(levelPath)) return;

    const level = JSON.parse(fs.readFileSync(levelPath, "utf8"));
    level.changelog ??= [];

    const currentRank = index + 1;

    if (levelName === addedName) {
        level.changelog.push({
            date: today,
            change: `Placed at #${currentRank}.`
        });
    } else if (currentRank >= addedRank) {
        level.changelog.push({
            date: today,
            change: `Moved to #${currentRank} because "${addedName}" was placed above it.`
        });
    }

    fs.writeFileSync(levelPath, JSON.stringify(level, null, 4));
});

fs.writeFileSync(LIST_PATH, JSON.stringify(list, null, 4));

console.log("Changelog updates complete.");