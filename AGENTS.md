# AGENTS.md — **Mystic Herb-Bowl Dev-Tool** (RuneScape revision 225, mid-2004)

> **Goal**  
> Give staff a stealthy in-game “Herb-Bowl” (item ID 14) that unlocks every power a moderator or QA-tester needs on a 2004-era world—without touching normal gameplay.

---

## 1 ▸ Host Item

| Item | Cache name | ID (225) | Reason it’s safe |
|------|------------|----------|------------------|
| **Herb-Bowl** | `herbbowl` | **14** | Dummy `graphic_only` object unused by quests, shops or drops. |

```kotlin
const val DEV_TOOL_ITEM_ID = 14  // herb-bowl


⸻

2 ▸ Herbal Actions & Panels

Right-click the bowl in your inventory:

Herbal Action (option)	Opens panel	Panel key
Sip	Brew-Master Settings	op1
Chop Herbs	Anti-Mould Mixtures	ame
Stir	Pouch & Pollen	op3
Crush & Mash	Alchemist’s Lab	op4

Panels reuse parchment widget group 320 and appear only when player.hasDevRights is true.

⸻

3 ▸ Server Plumbing

// Hook in ItemActionListener
if (itemId != DEV_TOOL_ITEM_ID || !player.hasDevRights) return
openHerbBowlPane(optionIdx)   // 0-3 map to op1 / ame / op3 / op4

3.1 Opcode Map  (plugins.dev.HerbBowlDevTool.kt)

Panel	Button	Opcode	Handler method
Brew-Master	Set all stats	stats:set	setAllStats(Player, Int)
	Wipe inventory	inv:wipe	wipeInventory(Player)
	Teleport to player	tele:player	teleportToPlayer(Player)
	Spawn aggressive NPC	npc:spawn	spawnBlackDemon(Player)
Anti-Mould	Any random (list below)	ame:<key>	sendToRandom(Player, RandomEvent)
	AMEs for all	ame:mass	massRandom(Player)
Pouch & Pollen	Open bank	bank:open	openBankAnywhere(Player)
	Wipe bank	bank:wipe	wipeBank(Player)
	Teleport to rare	rare:goto	gotoRare(Player)
	Spawn rare	rare:spawn	spawnRare(Player)
Alchemist’s Lab	Keep logged in	sess:hold	keepAlive(Player)
	Kick self	sess:kick	player.queueLogout()
	Self-KO	sess:suicide	player.applyDeath(null)
	Transmogrify…	xmog:list / xmog:set:<npcId>	transmog(Player, Int)


⸻

4 ▸ Feature Recipes (2004-valid)

Power	Implementation hints
Set all stats	Loop skills → setSkill(level,xp) → updateSkills().
Inventory wipe	Clear everything except the bowl.
Teleport to player	Prompt name → search online list → teleport(target.tile).
Spawn aggressive NPC	Spawn NPC 128 (Black Demon) one tile east, then npc.setTarget(nearestNonStaff).
Random Events in 2004	Keys: maze, mime, quiz, zombie, shade, rockgolem, rivertroll, treesprit, strangeplant. Use RandomEventManager.start(key, player).
AMEs for all	Iterate player.getLocalPlayers(15) excluding staff.
Bank open / wipe	Interface 762; wipe via bank.clear().
Holiday rares	Only Pumpkin (1961) and Scythe (1419) exist by mid-2004.
Transmogrify list	Self, Elvarg (742), Black Knight Titan (306), King Black Dragon (50), Drunken Dwarf (409), Boat (generic 303), Door (generic 1539).
Session tricks	keepAlive resets idle timer; kick queues logout; suicide triggers death routine.


⸻

5 ▸ Client Hook (TypeScript)

import { DEV_TOOL_ITEM_ID } from "./constants";

onItemOption(itemId: number, optionIdx: number) {
  if (itemId === DEV_TOOL_ITEM_ID && DevRights.has()) {
    openHerbBowlPane(optionIdx);  // sends op1 / ame / op3 / op4 to server
  }
}

The bowl’s sprite already exists—no cache edits required.

⸻

6 ▸ QA Tasting Menu ✔︎
	1.	::give 14 → bowl appears.
	2.	Sip → Set 99 → stats and combat level update.
	3.	Chop Herbs → Maze random runs & returns.
	4.	Stir → Wipe bank → open bank, verify empty.
	5.	Crush & Mash → Transmog King Black Dragon → walk & emote.
	6.	Non-staff account with bowl sees only standard Use/Examine.

Log outcomes to logs/herbBowlDev*.txt and flag ✔︎/✖︎/★ issues.

⸻

7 ▸ Roll-out Plan
	1.	Enable feature-flag DEV_TOOL_HERB_BOWL on staging world.
	2.	Run QA tasting menu.
	3.	Merge behind player.hasDevRights.

⸻

🔒 Nothing Lost
	•	Entire tool is privilege-gated; normal players never access it.
	•	No cache, balance, or asset changes for the live 2004 experience.
