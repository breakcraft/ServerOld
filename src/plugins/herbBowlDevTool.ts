import { DEV_TOOL_ITEM_ID } from '#/constants.js';
import Player from '#/engine/entity/Player.js';

/** Internal panel IDs reused from parchment widget group. */
const PARCHMENT_GROUP = 320;

/**
 * Checks if the item used by the player is the dev tool and if the player has dev rights.
 * Placeholder for hooking into item option logic.
 */
export function handleHerbBowlOption(player: Player, itemId: number, optionIdx: number): void {
    if (itemId !== DEV_TOOL_ITEM_ID) {
        return;
    }
    if (!player.hasDevRights) {
        return;
    }

    openHerbBowlPane(player, optionIdx);
}

function openHerbBowlPane(player: Player, optionIdx: number): void {
    // open the parchment interface to display the dev panel
    player.openMainModal(PARCHMENT_GROUP);

    const panel = PANEL_NAME[optionIdx] ?? 'Unknown';
    player.messageGame(`Herb-Bowl: ${panel}`);
}

const PANEL_NAME: Record<number, string> = {
    0: 'Brew-Master Settings',
    1: 'Anti-Mould Mixtures',
    2: 'Pouch & Pollen',
    3: 'Alchemist\u2019s Lab'
};
