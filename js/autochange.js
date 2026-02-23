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

const LEVELS_DIR = "data/levels";
const LIST_PATH = "data/list.json";
const today = new Date().toISOString().split("T")[0];

let list = JSON.parse(fs.readFileSync(LIST_PATH, "utf8"));

if (addedRank < 1 || addedRank > list.length + 1) {
    console.error("Invalid rank.");
    process.exit(1);
}

// 🔹 Store level that will be pushed down
const displacedLevel = list[addedRank - 1];

// 🔹 Insert new level into list
list.splice(addedRank - 1, 0, { id: addedName });

// 🔹 Update moved levels changelog
for (let i = addedRank; i < list.length; i++) {
    const entry = list[i];
    const levelPath = path.join(LEVELS_DIR, `${entry.id}.json`);
    if (!fs.existsSync(levelPath)) continue;

    const level = JSON.parse(fs.readFileSync(levelPath, "utf8"));
    level.changelog ??= [];

    level.changelog.push({
        date: today,
        change: `Moved down to #${i + 1} because "${addedName}" was placed above it.`
    });

    fs.writeFileSync(levelPath, JSON.stringify(level, null, 4));
}

// 🔹 Update newly added level changelog
if (displacedLevel) {
    const newLevelPath = path.join(LEVELS_DIR, `${addedName}.json`);
    if (fs.existsSync(newLevelPath)) {
        const newLevel = JSON.parse(fs.readFileSync(newLevelPath, "utf8"));
        newLevel.changelog ??= [];

        newLevel.changelog.push({
            date: today,
            change: `Added at #${addedRank} above "${displacedLevel.id}".`
        });

        fs.writeFileSync(newLevelPath, JSON.stringify(newLevel, null, 4));
    }
}

// 🔹 Save updated list
fs.writeFileSync(LIST_PATH, JSON.stringify(list, null, 4));

console.log("Changelog updates complete.");