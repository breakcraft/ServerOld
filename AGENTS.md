# AGENTS.md – **Mystic Herb-Bowl Dev-Tool**

> **Mission**  
> Re-forge every Rotten-Potato super-power into a single, hidden **Herb-Bowl** (item ID 14, rev 225) so staff can dose themselves with QA magic while regular adventurers remain blissfully oblivious.

---

## 0 ▸ Host Item

| Item | Cache name | ID (rev 225) | Why it’s perfect |
|------|------------|--------------|------------------|
| **Herb-Bowl** | `herbbowl` | **14** | Dummy “graphic_only” object (`model_506_obj`), never dropped, sold, or scripted. Safe sandbox. |

```kotlin
const val DEV_TOOL_ITEM_ID = 14   // herbbowl


⸻

1 ▸ UX Spellbook

Right-click the Herb-Bowl in your inventory to reveal four “herbal actions”:

Herbal Action	Pops open…	Internal key
Sip (was Eat)	Brew-Master Settings	op1
Chop Herbs (was Slice)	Anti-Mould Mixtures	ame
Stir (was Peel)	Pouch & Pollen	op3
Crush & Mash (was Mash)	Alchemist’s Lab	op4

All four panels reuse parchment widget group 320 and are triggered only if player.hasDevRights.

⸻

2 ▸ Server Plumbing

2.1 Privilege Gate

if (itemId != DEV_TOOL_ITEM_ID || !player.hasDevRights) return
openHerbBowlPane(optionIdx)   // 0=Sip, 1=Chop Herbs, 2=Stir, 3=Crush & Mash

2.2 Opcode Dispatch

Same op-code map as the original Potato, now bundled in
plugins.dev.HerbBowlDevTool.kt.
(Handler names unchanged for code reuse; only UI labels differ.)

⸻

3 ▸ Effect Recipes (rev 225)

Power	Quick brew note
Set all stats	player.setSkill(...) loop → instant 99s (or any input).
Wipe inventory	Preserve bowl; nuke the rest.
Random Events (AME)	Teleport self or local crowd into any 225 random (Beehive, Maze, etc.).
Setup POH	If your fork back-ports houses, call generator; else pop “Unavailable in rev 225”.
Bank anywhere / wipe / pin	Works with interface 762.
Spawn aggressive NPC	NPC ID 472 (Tormented Demon prototype) auto-aggros nearest non-staff.
Holiday rares	Pumpkin (1961) & Scythe (1419) only.
Transmogrify	player.setNpcAppearance(npcId); list trimmed to models present in 225.
Keep-alive / Kick / Suicide	Idle timer hack, logout queue, self-death.


⸻

4 ▸ Client Hook (TypeScript)

import { DEV_TOOL_ITEM_ID } from "./constants";

onItemOption(itemId: number, optionIdx: number) {
  if (itemId === DEV_TOOL_ITEM_ID && DevRights.has()) {
    openHerbBowlPane(optionIdx);   // maps to op1/ame/op3/op4 server keys
  }
}

No cache edits required—the bowl already has a sprite.

⸻

5 ▸ QA Tasting Menu ✔︎
	1.	::give 14 → bowl appears (weight 1 lb).
	2.	Sip → Set 99 → total lvl 2277, combat recalculates.
	3.	Chop Herbs → Beehive random runs & returns.
	4.	Stir → Wipe bank → reopen bank, confirm empty.
	5.	Crush & Mash → Transmog Jad → walk, emote, clip-test.
	6.	Non-staff with bowl sees nothing special.

Smoke-test logs under logs/herbBowlDev*.txt; mark ✔︎, ✖︎, ★ anomalies.

⸻

6 ▸ Roll-Out Potion
	1.	Toggle DEV_TOOL_HERB_BOWL on staging world.
	2.	QA with tasting menu above.
	3.	Merge behind player.hasDevRights.
	4.	Retire Rotten Potato once feature parity confirmed.

⸻

Nothing Lost ☑️
	•	Privilege-gated; live players never access the bowl’s secret seasonings.
	•	Purely additive—no cache edits, no balance shifts.

🍃 Stir well and enjoy your new QA concoction!

