export const DEV_TOOL_ITEM_ID = 14;

/**
 * Checks if the item used by the player is the dev tool and if the player has dev rights.
 * Placeholder for hooking into item option logic.
 */
export function handleHerbBowlOption(player: any, optionIdx: number): void {
    if (player.staffModLevel < 2) {
        return;
    }

    if (optionIdx === 1) {
        // TODO: open Brew-Master Settings panel
    } else if (optionIdx === 2) {
        // TODO: open Anti-Mould Mixtures panel
    } else if (optionIdx === 3) {
        // TODO: open Pouch & Pollen panel
    } else if (optionIdx === 4) {
        // TODO: open Alchemist’s Lab panel
    }
}
