# Cyberpunk RED Core - Russian Translation

This module contains the community-maintained Russian translation for
Cyberpunk RED Core. The system itself remains the source of English strings;
Russian strings and compendium translations are maintained here so they can be
updated independently.

## Installation

1. Install and enable Cyberpunk RED Core and this module.
2. Select Russian (`ru`) as the Foundry language. A Foundry Russian interface
   translation may be needed to make Russian available in the language
   selector; this module translates CPR, not Foundry's own interface.
3. Enable Babele to use translated CPR compendium entries. The module registers
   its compendium translation directory automatically.

The CPR interface localization is loaded through the module's standard
`languages` manifest entry. It does not replace Foundry's core translation.

## Babele integration for translation modules

Each third-party CPR translation module should keep its own compendium
translations in a language-specific directory such as `babele/ru/` and
register that directory with Babele from its own `init` hook:

```js
const MODULE_ID = "your-cpr-translation";

Hooks.once("init", () => {
  const register = (babele) => {
    babele.register({
      module: MODULE_ID,
      dir: "babele/ru",
      lang: "ru",
    });
  };

  if (game.babele) register(game.babele);
  else Hooks.once("babele.init", register);
});
```

Use the translation module's own ID and directory. Babele remains a separate
required module for compendium translations; neither CPR Core nor this module
modifies Babele. Add your own `languages` entry if the module also supplies
interface strings and declare `cyberpunk-red-core` as a supported system in
the module manifest.

CPR Core registers Babele's standard item-name and item-description mappings,
plus `dvTable` for `system.dvTable`. Translation files can use `dvTable`
directly without repeating a per-compendium mapping declaration. Babele's
built-in RollTable mapping handles table results.

## Translation files

- `lang/ru.json` contains CPR Core interface strings.
- `babele/ru/` contains Babele compendium translations registered through the
  public module registration API.

Contributors should update these files in this module and keep the interface
keys aligned with `cyberpunk-red-core/lang/en.json`. Do not add Russian
localization files or Russian language declarations back to the CPR Core
system.

## Validation

From this directory, run:

```powershell
node scripts/validate-localization.mjs
```

By default, the validator looks for `cyberpunk-red-core` beside the `modules`
directory in this workspace. To validate against another system checkout,
pass its path:

```powershell
node scripts/validate-localization.mjs C:\path\to\cyberpunk-red-core
```
