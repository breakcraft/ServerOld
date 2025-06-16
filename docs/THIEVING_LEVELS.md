# Thieving Level Requirements (May 18, 2004)

The following table consolidates all thieving-related requirements present in this codebase. These values mirror the May 18, 2004 snapshot.

## Pickpocket Targets

| Level | Code ID | NPC Name |
| ----- | ------- | -------- |
| 1 | `pickpocket_man` / `pickpocket_woman` | Man / Woman |
| 10 | `pickpocket_farmer` | Farmer |
| 25 | `pickpocket_warrior` | Warrior Woman / Al-Kharid Warrior |
| 32 | `pickpocket_rogue` | Rogue |
| 40 | `pickpocket_guard` | Guard |
| 55 | `pickpocket_knight_of_ardougne` | Knight of Ardougne |
| 65 | `pickpocket_watchman` | Watchman (Yanille) |
| 70 | `pickpocket_paladin` | Paladin |
| 75 | `pickpocket_gnome` | Tree-Gnome Stronghold Gnome |
| 80 | `pickpocket_hero` | Hero |

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

| Level | Code ID / Location | Details |
| ----- | ----------------- | ------- |
| 1 | `tutorial_hut_door` | Tutorial hut doors (Karamja) |
| 13 | `draynor_manor_kitchen_door` | Draynor Manor kitchen side-door |
| 16 | `varrock_sewer_door` | Varrock Sewers wooden door |
| 23 | `witchaven_fish_shop_back_door` | Witchaven fish-shop back door |
| 31 | `east_ardy_sewer_gate_(N/S)` | East Ardougne sewer gates |
| 39 | `yanille_wizards_guild_side_door` | Yanille Wizards’ Guild side entrance |
| 46 | `desert_palace_treasure_room_door` | Desert palace treasure room |
| 61 | `legends_guild_gatehouse_rear_door` | Legends’ Guild gatehouse rear door |
| 82 | `lava_maze_gate` | Deep Wilderness Lava Maze gate |

## Trapped and Loot Chests

| Level | Chest | Notable Rewards |
| ----- | ----- | --------------- |
| 13 | 10-coin chest – Ardougne pub | 10 gp |
| 28 | Nature-rune chest – Ardougne pub | 1 nature rune + 3 gp |
| 43 | 50-coin chest – upstairs Ardougne pub | 50 gp |
| 47 | Steel arrowtips chest – Rogue’s Castle | 6 arrowtips |
| 59 | Blood-rune chest – Chaos Druid tower | 2 blood runes + 500 gp |
| 72 | Paladin chests – Ardougne Castle | 1,000 gp / raw sharks (teleports to Witchaven on fail) |

## Quest-Level Checks

| Level | Quest | Reason |
| ----- | ----- | ------ |
| 21 | Tribal Totem | Search trap |
| 25 | The Dig Site | Pickpocket workman for key |
| 42 | Temple of Ikov | Disable wire trap |
| 50 | Legends’ Quest | Sophisticated lock |
| 50 | Underground Pass | Unlock cage door |

These thresholds match the `levelup_unlocks_thieving.rs2` script. New content should respect these breakpoints for consistency.
