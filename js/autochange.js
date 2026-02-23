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
    console.error("Usage: node js/auto-changelog.js --added \"Level Name\" --rank <number>");
    process.exit(1);
}

const LEVELS_DIR = "data/levels";
const LIST_PATH = "data/list.json";

const today = new Date().toISOString().split("T")[0];

const list = JSON.parse(fs.readFileSync(LIST_PATH, "utf8"));

list.forEach((entry, index) => {
    const oldRank = index + 1;

    if (oldRank < addedRank) return;

    const levelPath = path.join(LEVELS_DIR, `${entry.id}.json`);
    if (!fs.existsSync(levelPath)) return;

    const level = JSON.parse(fs.readFileSync(levelPath, "utf8"));

    level.changelog ??= [];

    level.changelog.push({
        date: today,
        change: `Moved down from #${oldRank} to #${oldRank + 1} because "${addedName}" was placed above it.`
    });

    fs.writeFileSync(levelPath, JSON.stringify(level, null, 4));
});

console.log("Changelog updates complete.");