import { readdir, readFile, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const moduleRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const systemRoot = resolve(
  process.argv[2] ?? join(moduleRoot, "..", "..", "cyberpunk-red-core"),
);
const errors = [];

function report(condition, message) {
  if (!condition) errors.push(message);
}

async function readJson(path, label) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    errors.push(`${label}: ${error.message}`);
    return null;
  }
}

const moduleManifest = await readJson(join(moduleRoot, "module.json"), "module.json");
const systemManifest = await readJson(join(systemRoot, "system.json"), "system.json");
const english = await readJson(join(systemRoot, "lang", "en.json"), "CPR Core English locale");
const russian = await readJson(join(moduleRoot, "lang", "ru.json"), "Russian locale");
const integration = await readFile(join(moduleRoot, "scripts", "main.js"), "utf8").catch((error) => {
  errors.push(`scripts/main.js: ${error.message}`);
  return "";
});

report(moduleManifest?.id === "cpr-ru", "module.json must declare id cpr-ru");
report(
  moduleManifest?.languages?.some(
    (language) => language.lang === "ru" && language.path === "lang/ru.json",
  ),
  "module.json must register lang/ru.json for ru",
);
report(
  moduleManifest?.relationships?.systems?.some(
    (system) => system.id === "cyberpunk-red-core" && system.type === "system",
  ),
  "module.json must declare compatibility with cyberpunk-red-core",
);
report(
  moduleManifest?.relationships?.requires?.some(
    (dependency) => dependency.id === "babele" && dependency.type === "module",
  ),
  "module.json must require Babele for compendium translations",
);
report(
  integration.includes('babele.register({') &&
    integration.includes('dir: "babele/ru"') &&
    integration.includes('lang: "ru"') &&
    integration.includes('Hooks.once("babele.init"'),
  "scripts/main.js must register babele/ru through Babele's module API",
);
report(
  !systemManifest?.languages?.some((language) => language.lang === "ru"),
  "Russian must not be declared as a CPR Core system language",
);

if (english && russian) {
  const englishKeys = Object.keys(english).sort();
  const russianKeys = Object.keys(russian).sort();
  const missing = englishKeys.filter((key) => !(key in russian));
  const extra = russianKeys.filter((key) => !(key in english));
  report(missing.length === 0, `Russian locale is missing ${missing.length} English key(s)`);
  report(extra.length === 0, `Russian locale has ${extra.length} unknown key(s)`);
}

for (const path of [
  join(systemRoot, "lang", "ru.json"),
  join(systemRoot, "babele", "ru"),
]) {
  try {
    await stat(path);
    errors.push(`Russian translations must be maintained outside CPR Core: ${path}`);
  } catch (error) {
    if (error.code !== "ENOENT") errors.push(`${path}: ${error.message}`);
  }
}

const babeleDirectory = join(moduleRoot, "babele", "ru");
let babeleFiles = [];
try {
  babeleFiles = (await readdir(babeleDirectory, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name);
  report(babeleFiles.length > 0, "babele/ru must contain compendium translation JSON files");
} catch (error) {
  errors.push(`babele/ru: ${error.message}`);
}

for (const file of babeleFiles) {
  await readJson(join(babeleDirectory, file), `babele/ru/${file}`);
}

if (errors.length > 0) {
  console.error(`Localization validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(
    `Validated ${Object.keys(russian).length} Russian interface keys and ${babeleFiles.length} Babele translation files.`,
  );
}
