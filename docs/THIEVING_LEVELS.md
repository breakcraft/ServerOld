# Thieving Level Requirements (May 18, 2004)

The following table consolidates all thieving-related requirements present in this codebase. These values mirror the May 18, 2004 snapshot.

Config identifiers in the data files have been renamed to match in-game terminology for ease of reference.

## Pickpocket Targets

| Level | Config ID | NPC Name |
| ----- | --------- | -------- |
| 1 | `man` / `woman` | Man / Woman |
| 10 | `farmer` | Farmer |
| 25 | `warrior_woman` | Warrior Woman / Al-Kharid Warrior |
| 32 | `rogue` | Rogue |
| 40 | `guard` | Guard |
| 55 | `knight_of_ardougne` | Knight of Ardougne |
| 65 | `watchman` | Watchman (Yanille) |
| 70 | `paladin` | Paladin |
| 75 | `gnome` | Tree-Gnome Stronghold Gnome |
| 80 | `hero` | Hero |

## Market Stalls

| Level | Code ID | Stall |
| ----- | ------- | ----- |
| 5 | `stealing_bakery_stall` | Bakery stall / Tea stall |
| 20 | `stealing_silk_stall` | Silk stall |
| 35 | `stealing_fur_stall` | Fur stall |
| 50 | `stealing_silver_stall` | Silver stall |
| 65 | `stealing_spice_stall` | Spice stall |
| 75 | `stealing_gem_stall` | Gem stall |

## Locked Doors and Gates

| Level | Config ID / Location | Details |
| ----- | ------------------- | ------- |
| 1 | `tutorial_hut_door` | Tutorial hut doors (Karamja) |
| 13 | `draynor_manor_kitchen_side_door` | Draynor Manor kitchen side-door |
| 16 | `varrock_sewers_door` | Varrock Sewers wooden door |
| 23 | `witchaven_fish_shop_back_door` | Witchaven fish-shop back door |
| 31 | `east_ardougne_sewer_gate_north` / `east_ardougne_sewer_gate_south` | East Ardougne sewer gates |
| 39 | `yanille_wizards_guild_side_entrance` | Yanille Wizards’ Guild side entrance |
| 46 | `desert_palace_treasure_room_door` | Desert palace treasure room |
| 61 | `legends_guild_gatehouse_rear_door` | Legends’ Guild gatehouse rear door |
| 82 | `lava_maze_gate` | Deep Wilderness Lava Maze gate |

## Trapped and Loot Chests

| Level | Config ID | Notable Rewards |
| ----- | --------- | --------------- |
| 13 | `ardougne_pub_10_coin_chest` | 10 gp |
| 28 | `ardougne_pub_nature_rune_chest` | 1 nature rune + 3 gp |
| 43 | `ardougne_pub_upstairs_50_coin_chest` | 50 gp |
| 47 | `rogues_castle_arrowtips_chest` | 6 arrowtips |
| 59 | `chaos_druid_tower_blood_rune_chest` | 2 blood runes + 500 gp |
| 72 | `ardougne_castle_paladin_chest` | 1,000 gp / raw sharks (teleports to Witchaven on fail) |

## Quest-Level Checks

| Level | Quest | Reason |
| ----- | ----- | ------ |
| 21 | Tribal Totem | Search trap |
| 25 | The Dig Site | Pickpocket workman for key |
| 42 | Temple of Ikov | Disable wire trap |
| 50 | Legends’ Quest | Sophisticated lock |
| 50 | Underground Pass | Unlock cage door |

These thresholds match the `levelup_unlocks_thieving.rs2` script. New content should respect these breakpoints for consistency.
