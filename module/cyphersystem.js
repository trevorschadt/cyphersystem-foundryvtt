// Import actors & items
import {CypherActor} from "./actor/actor.js";
import {CypherItem} from "./item/item.js";

// Import actor & item sheets
import {CypherItemSheet} from "./item/item-sheet.js";
import {CypherActorSheet} from "./actor/actor-sheet.js";
import {CypherActorSheetPC} from "./actor/pc-sheet.js";
import {CypherActorSheetNPC} from "./actor/npc-sheet.js";
import {CypherActorSheetCommunity} from "./actor/community-sheet.js";
import {CypherActorSheetCompanion} from "./actor/companion-sheet.js";
import {CypherActorSheetMarker} from "./actor/marker-sheet.js";
import {CypherActorSheetVehicle} from "./actor/vehicle-sheet.js";

// Import utility functions
import {preloadTemplates} from "./utilities/template-paths.js";
import {applyXPFromIntrusion, regainPoolPoints} from "./utilities/actor-utilities.js";
import {sendWelcomeMessage} from "./utilities/welcome-message.js";
import {createCyphersystemMacro} from "./utilities/create-macros.js";

// Import macros
import {
  quickRollMacro,
  easedRollMacro,
  hinderedRollMacro,
  diceRollMacro,
  recoveryRollMacro,
  spendEffortMacro,
  allInOneRollDialog,
  itemRollMacro,
  toggleDragRuler,
  resetDragRulerDefaults,
  resetBarBrawlDefaults,
  removeBarBrawlSettings,
  quickStatChange,
  proposeIntrusion,
  changeSymbolForFractions,
  toggleAttacksOnSheet,
  toggleArmorOnSheet,
  translateToRecursion,
  archiveItemsWithTag,
  unarchiveItemsWithTag,
  archiveStatusByTag,
  toggleAlwaysShowDescriptionOnRoll,
  calculateAttackDifficulty,
  recursionMacro,
  tagMacro,
  renameTagMacro,
  disasterModeMacro,
  lockStaticStatsMacro,
  migrateDataMacro,
  changeTagStats,
  changeRecursionStats
} from "./macros/macros.js";
import {
  easedRollEffectiveMacro,
  hinderedRollEffectiveMacro
} from "./macros/macro-helper.js";
import {
  chatCardMarkItemIdentified,
  chatCardProposeIntrusion,
  chatCardAskForIntrusion,
  chatCardIntrusionAccepted,
  chatCardIntrusionRefused,
  chatCardWelcomeMessage,
  chatCardRegainPoints
} from "./utilities/chat-cards.js";
import {barBrawlOverwrite} from "./utilities/token-utilities.js";
import {registerGameSettings} from "./utilities/game-settings.js";
import {registerHandlebars} from "./utilities/handlebars.js";
import {gameSockets} from "./utilities/game-sockets.js";
import {initiativeSettings} from "./utilities/initiative-settings.js";
import {
  dataMigration,
  dataMigrationPacks
} from "./utilities/migration.js";
import {rollEngineMain} from "./utilities/roll-engine/roll-engine-main.js";
import {gmiRangeForm, renderGMIForm} from "./forms/gmi-range-sheet.js";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once("init", async function () {
  console.log("Initializing Cypher System");

  // CONFIG.debug.hooks = true;

  const recursionDocumentLinkExceptions = ["@macro", "@actor", "@scene", "@item", "@rolltable", "@journalentry", "@cards", "@playlist", "@playlistsound", "@compendium", "@pdf", "@uuid"];

  game.cyphersystem = {
    // Actor sheets
    CypherActor,
    CypherItem,
    CypherActorSheet,
    CypherActorSheetPC,
    CypherActorSheetNPC,
    CypherActorSheetCommunity,
    CypherActorSheetCompanion,
    CypherActorSheetVehicle,
    CypherActorSheetMarker,

    // Macros
    quickRollMacro,
    easedRollMacro,
    hinderedRollMacro,
    easedRollEffectiveMacro,
    hinderedRollEffectiveMacro,
    diceRollMacro,
    recoveryRollMacro,
    spendEffortMacro,
    itemRollMacro,
    allInOneRollDialog,
    toggleDragRuler,
    resetDragRulerDefaults,
    resetBarBrawlDefaults,
    removeBarBrawlSettings,
    quickStatChange,
    proposeIntrusion,
    changeSymbolForFractions,
    toggleAttacksOnSheet,
    toggleArmorOnSheet,
    translateToRecursion,
    archiveItemsWithTag,
    unarchiveItemsWithTag,
    archiveStatusByTag,
    toggleAlwaysShowDescriptionOnRoll,
    calculateAttackDifficulty,
    recursionMacro,
    tagMacro,
    renameTagMacro,
    disasterModeMacro,
    lockStaticStatsMacro,
    migrateDataMacro,
    dataMigrationPacks,

    // Chat cards
    chatCardMarkItemIdentified,
    chatCardProposeIntrusion,
    chatCardAskForIntrusion,
    chatCardIntrusionAccepted,
    chatCardIntrusionRefused,
    chatCardWelcomeMessage,
    chatCardRegainPoints,

    // Recursion Document Link Exceptions
    recursionDocumentLinkExceptions
  }

  // Define custom Entity classes
  CONFIG.Actor.documentClass = CypherActor;
  CONFIG.Item.documentClass = CypherItem;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("cypher", CypherActorSheetPC, {
    types: ['pc'],
    makeDefault: true,
    label: "CYPHERSYSTEM.SheetClassPC"
  });
  Actors.registerSheet("cypher", CypherActorSheetNPC, {
    types: ['npc'],
    makeDefault: true,
    label: "CYPHERSYSTEM.SheetClassNPC"
  });
  Actors.registerSheet("cypher", CypherActorSheetMarker, {
    types: ['marker'],
    makeDefault: true,
    label: "CYPHERSYSTEM.SheetClassToken"
  });
  Actors.registerSheet("cypher", CypherActorSheetCommunity, {
    types: ['community'],
    makeDefault: true,
    label: "CYPHERSYSTEM.SheetClassCommunity"
  });
  Actors.registerSheet("cypher", CypherActorSheetCompanion, {
    types: ['companion'],
    makeDefault: true,
    label: "CYPHERSYSTEM.SheetClassCompanion"
  });
  Actors.registerSheet("cypher", CypherActorSheetVehicle, {
    types: ['vehicle'],
    makeDefault: true,
    label: "CYPHERSYSTEM.SheetClassVehicle"
  });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("cypher", CypherItemSheet, {
    makeDefault: true,
    label: "CYPHERSYSTEM.SheetClassItem"
  });

  // Load initiative settings
  initiativeSettings();

  // Register system settings
  registerGameSettings();

  // Register HTML-Handlebars
  registerHandlebars();

  // Pre-load HTML templates
  preloadTemplates();

  // Load game sockets
  gameSockets();
});

Hooks.on("canvasReady", function (canvas) {
  console.log(`The canvas was just rendered for scene: ${canvas.scene.id}`);
  for (let t of game.scenes.viewed.tokens) {
    if (t.getFlag("cyphersystem", "toggleDragRuler") !== undefined) {
      // do nothing
    } else {
      if (t.actor.type !== "marker" && t.actor.type !== "vehicle") {
        t.setFlag("cyphersystem", "toggleDragRuler", true);
      } else {
        t.setFlag("cyphersystem", "toggleDragRuler", false);
      }
    }
  }
});

Hooks.once("ready", async function () {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on("hotbarDrop", (bar, data, slot) => {
    if (data.type === "Item") {
      createCyphersystemMacro(data, slot);
      return false;
    }
  });

  // Migrate actor data
  await dataMigration();

  // Overwrite document types after migration - remove in future version, when item migration is done
  game.documentTypes.Item = ["ability", "ammo", "armor", "artifact", "attack", "cypher", "equipment", "lasting-damage", "material", "oddity", "power-shift", "recursion", "skill", "tag"];

  game.documentTypes.Actor = ["pc", "npc", "companion", "community", "vehicle", "marker"];

  // Send welcome message
  if (game.settings.get("cyphersystem", "welcomeMessage")) sendWelcomeMessage();
});

Hooks.on("getSceneControlButtons", function (hudButtons) {
  let tokenControls = hudButtons.find(val => {return val.name == "token"})
  if (tokenControls && game.user.isGM) {
    tokenControls.tools.push({
      name: "proposeGMI",
      title: game.i18n.localize("CYPHERSYSTEM.ProposeIntrusion"),
      icon: "fas fa-bolt",
      onClick: () => {proposeIntrusion()},
      button: true
    });
  }
  if (tokenControls) {
    tokenControls.tools.push({
      name: "gmiRange",
      title: game.i18n.localize("CYPHERSYSTEM.GMIRange"),
      icon: "fas fa-exclamation-triangle",
      onClick: () => {gmiRangeForm()},
      button: true
    });
  }
});

Hooks.on("preCreateActor", async function (actor) {
  if (["pc", "community", "vehicle"].includes(actor.type)) {
    actor.updateSource({
      "token.displayName": CONST.TOKEN_DISPLAY_MODES.HOVER,
      "token.disposition": CONST.TOKEN_DISPOSITIONS.NEUTRAL,
      "token.actorLink": true
    });
  }

  if (actor.type == "npc") {
    actor.updateSource({
      "token.bar1": {"attribute": "health"},
      "token.bar2": {"attribute": "level"},
      "token.displayName": CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
      "token.displayBars": CONST.TOKEN_DISPLAY_MODES.OWNER,
      "token.disposition": CONST.TOKEN_DISPOSITIONS.NEUTRAL
    });
  }

  if (actor.type == "companion") {
    actor.updateSource({
      "token.bar1": {"attribute": "health"},
      "token.bar2": {"attribute": "level"},
      "token.displayName": CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
      "token.displayBars": CONST.TOKEN_DISPLAY_MODES.OWNER,
      "token.disposition": CONST.TOKEN_DISPOSITIONS.NEUTRAL,
      "token.actorLink": true
    });
  }

  if (actor.type == "marker") {
    actor.updateSource({
      "token.bar1": {"attribute": "quantity"},
      "token.bar2": {"attribute": "level"},
      "token.displayName": CONST.TOKEN_DISPLAY_MODES.HOVER,
      "token.displayBars": CONST.TOKEN_DISPLAY_MODES.ALWAYS,
      "token.disposition": CONST.TOKEN_DISPOSITIONS.NEUTRAL
    });
  }
});

Hooks.on("updateActor", async function (actor, data, options, userId) {
  if (data.ownership) {
    game.socket.emit("system.cyphersystem", {operation: "renderGMIForm"});
    renderGMIForm();
  }
});

Hooks.on("preCreateItem", function (item) {
  if (item.img == "icons/svg/item-bag.svg") {
    item.updateSource({"img": `systems/cyphersystem/icons/items/${item.type}.svg`});
  }
  if (item.parent?.system.basic.unmaskedForm == "Teen" && ["ability", "armor", "attack", "lasting-damage", "skill"].includes(item.type)) {
    item.updateSource({"system.settings.general.unmaskedForm": "Teen"});
  }
});

Hooks.on("updateItem", async function (item) {
  if (item.type == "tag" && item.system.exclusive && item.system.active) {
    await changeTagStats(fromUuidSync(item.actor.uuid), item.system.settings.statModifiers.might.value, item.system.settings.statModifiers.might.edge, item.system.settings.statModifiers.speed.value, item.system.settings.statModifiers.speed.edge, item.system.settings.statModifiers.intellect.value, item.system.settings.statModifiers.intellect.edge);
  } else if (item.type == "recursion" && fromUuidSync(item.actor.uuid).flags.cyphersystem.recursion == "@" + item.name.toLowerCase()) {
    await changeRecursionStats(fromUuidSync(item.actor.uuid), "@" + item.name.toLowerCase(), item.system.settings.statModifiers.might.value, item.system.settings.statModifiers.might.edge, item.system.settings.statModifiers.speed.value, item.system.settings.statModifiers.speed.edge, item.system.settings.statModifiers.intellect.value, item.system.settings.statModifiers.intellect.edge);
  }
});

Hooks.on("preCreateToken", function (document, data) {
  if (!data.actorId) return;
  let actor = game.actors.get(data.actorId);

  // Support for Drag Ruler
  if (actor.type !== "marker" && actor.type !== "community") {
    document.updateSource({"flags.cyphersystem.toggleDragRuler": true})
  } else {
    document.updateSource({"flags.cyphersystem.toggleDragRuler": false})
  }

  // Support for Bar Brawl
  if (game.modules.get("barbrawl")?.active && game.settings.get("cyphersystem", "barBrawlDefaults")) {
    barBrawlOverwrite(document, actor);
  }
});

Hooks.on("createCombatant", function (combatant) {
  if (game.user.isGM) {
    let actor = combatant.actor;

    if (actor.type == "npc") {
      combatant.updateSource({"initiative": (actor.system.basic.level * 3) + actor.system.settings.general.initiativeBonus - 0.5});
    } else if (actor.type == "community" && !combatant.hasPlayerOwner) {
      combatant.updateSource({"initiative": (actor.system.basic.rank * 3) + actor.system.settings.general.initiativeBonus - 0.5});
    } else if (actor.type == "community" && combatant.hasPlayerOwner) {
      combatant.updateSource({"initiative": (actor.system.basic.rank * 3) + actor.system.settings.general.initiativeBonus});
    } else if (actor.type == "vehicle") {
      combatant.updateSource({"initiative": (actor.system.basic.level * 3) - 0.5});
    }
  }
});

Hooks.on("updateCombat", function () {
  if (game.user.isGM) {
    let combatant = (game.combat.combatant) ? game.combat.combatant.actor : "";

    if (combatant.type == "marker" && combatant.system.settings.general.isCounter == true) {
      let step = (!combatant.system.settings.general.counting) ? -1 : combatant.system.settings.general.counting;
      let newQuantity = combatant.system.pools.quantity.value + step;
      combatant.updateSource({"system.pools.quantity.value": newQuantity});
    }
  }
});

Hooks.on("renderChatMessage", function (message, html, data) {
  // Hide buttons
  if (html.find('.chat-card-buttons').data('actor')) {
    let actor = game.actors.get(html.find('.chat-card-buttons').data('actor'));
    if (!actor.isOwner) html.find("div[class='chat-card-buttons']").addClass('chat-hidden');
  }

  // Event Listener to confirm cypher and artifact identification
  html.find('.confirm').click(clickEvent => {
    if (!game.user.isGM) return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.OnlyGMCanIdentify"));
    let actor = game.actors.get(html.find('.confirm').data('actor'));
    let item = actor.items.get(html.find('.confirm').data('item'));
    item.updateSource({"system.basic.identified": true});
    ui.notifications.notify(game.i18n.format("CYPHERSYSTEM.ConfirmIdentification", {item: item.name, actor: actor.name}));
  });

  // Event Listener for rerolls of stat rolls
  html.find('.reroll-stat').click(clickEvent => {
    let user = html.find('.reroll-stat').data('user');
    if (user !== game.user.id) return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.WarnRerollUser"));
    const data = html.find('.reroll-stat').data('data');
    delete data["skipDialog"];
    delete data["roll"];
    data.reroll = true;
    rollEngineMain(data);
  });

  // Event Listener for rerolls of recovery rolls
  html.find('.reroll-recovery').click(clickEvent => {
    let user = html.find('.reroll-recovery').data('user');
    if (user !== game.user.id) return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.WarnRerollUser"));
    let dice = html.find('.reroll-recovery').data('dice');
    let actor = fromUuidSync(html.find('.reroll-stat').data('actor-uuid'));
    recoveryRollMacro(actor, dice, false);
  });

  // Event Listener for rerolls of dice rolls
  html.find('.reroll-dice-roll').click(clickEvent => {
    let user = html.find('.reroll-dice-roll').data('user');
    if (user !== game.user.id) return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.WarnRerollUser"));
    let dice = html.find('.reroll-dice-roll').data('dice');
    diceRollMacro(dice);
  });

  // Event Listener to regain pool points
  html.find('.regain-points').click(clickEvent => {
    let user = html.find('.regain-points').data('user');
    if (user !== game.user.id) return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.WarnRerollUser"));
    let actor = game.actors.get(html.find('.reroll-stat').data('actor'));
    let cost = html.find('.regain-points').data('cost');
    let pool = html.find('.regain-points').data('pool');
    let teen = html.find('.regain-points').data('teen');
    regainPoolPoints(actor, cost, pool, teen);
  });

  // Event Listener for description in chat
  html.find('.chat-description').click(clickEvent => {
    const description = html.find('.chat-card-item-description');
    if (description.hasClass("expanded")) {
      description.slideUp();
      description.toggleClass("expanded");
    } else {
      description.slideDown();
      description.toggleClass("expanded");
    }
  });

  // Event Listener for accepting intrusions
  html.find('.accept-intrusion').click(clickEvent => {
    let actor = game.actors.get(html.find('.accept-intrusion').data('actor'));
    if (!actor.isOwner) return ui.notifications.warn(game.i18n.format("CYPHERSYSTEM.IntrusionWrongPlayer", {actor: actor.name}));

    // Create list of PCs
    let list = "";
    for (let actor of game.actors.contents) {
      if (actor.type === "pc" && actor._id != html.find('.accept-intrusion').data('actor') && actor.hasPlayerOwner) list = list + `<option value=${actor._id}>${actor.name}</option>`;
    }

    // Create dialog content
    let content = `<div align="center"><label style="display: inline-block; text-align: right"><b>${game.i18n.localize("CYPHERSYSTEM.GiveAdditionalXPTo")}: </b></label>
    <select name="selectPC" id="selectPC" style="width: auto; margin-left: 5px; margin-bottom: 5px; text-align-last: center">`+ list + `</select></div>`

    // Create dialog
    let d = new Dialog({
      title: game.i18n.localize("CYPHERSYSTEM.GiveAdditionalXP"),
      content: content,
      buttons: {
        apply: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize("CYPHERSYSTEM.Apply"),
          callback: (html) => applyXPFromIntrusion(actor, html.find('#selectPC').val(), data.message._id, 1)
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize("CYPHERSYSTEM.Cancel"),
          callback: () => {}
        }
      },
      default: "apply",
      close: () => {}
    });
    if (list == "") {
      applyXPFromIntrusion(actor, "", data.message._id, 1)
    } else {
      d.render(true);
    }
  });

  // Event Listener for refusing intrusions
  html.find('.refuse-intrusion').click(clickEvent => {
    let actor = game.actors.get(html.find('.refuse-intrusion').data('actor'));
    if (!actor.isOwner) return ui.notifications.warn(game.i18n.format("CYPHERSYSTEM.IntrusionWrongPlayer", {actor: actor.name}));
    applyXPFromIntrusion(actor, "", data.message._id, -1)
  });
});

Hooks.once("dragRuler.ready", (SpeedProvider) => {
  class CypherSystemSpeedProvider extends SpeedProvider {
    get colors() {
      return [
        {id: "immediate", default: 0x0000FF, name: "immediate"},
        {id: "short", default: 0x008000, name: "short"},
        {id: "long", default: 0xFFA500, name: "long"},
        {id: "veryLong", default: 0xFF0000, name: "very long"}
      ]
    }

    getRanges(token) {
      let immediate = 0;
      let short = 0;
      let long = 0;
      let veryLong = 0;
      if (["m", "meter", "metre"].includes(token.scene.grid.units) || token.scene.grid.units == game.i18n.localize("CYPHERSYSTEM.UnitDistanceMeter")) {
        immediate = 3;
        short = 15;
        long = 30;
        veryLong = 150;
      } else if (["ft", "ft.", "feet"].includes(token.scene.grid.units) || token.scene.grid.units == game.i18n.localize("CYPHERSYSTEM.UnitDistanceFeet")) {
        immediate = 10;
        short = 50;
        long = 100;
        veryLong = 500;
      }

      const ranges = [
        {range: immediate, color: "immediate"},
        {range: short, color: "short"},
        {range: long, color: "long"},
        {range: veryLong, color: "veryLong"}
      ]
      return ranges
    }

    get defaultUnreachableColor() {
      return 0x000000
    }

    usesRuler(token) {
      if (token.document.flags.cyphersystem.toggleDragRuler) {
        return true
      } else {
        return false
      }
    }
  }

  dragRuler.registerSystem("cyphersystem", CypherSystemSpeedProvider)
})

Hooks.on("renderTokenConfig", function (tokenConfig, html, data) {
  if (game.modules.get("barbrawl")?.active && game.settings.get("cyphersystem", "barBrawlDefaults")) {
    html.find("a[data-tab='resources']").addClass('hidden');
  }
});