import InvType from '#/cache/config/InvType.js';
import ObjType from '#/cache/config/ObjType.js';
import Player from '#/engine/entity/Player.js';

export function attemptSpecialAttack(player: Player): boolean {
    const worn = player.getInventory(InvType.WORN);
    if (!worn) {
        return false;
    }

    const weapon = worn.get(ObjType.getWearPosId('righthand'));
    if (!weapon) {
        return false;
    }

    const weaponType = ObjType.get(weapon.id);
    const cost = weaponType.specialEnergyCost;
    if (player.specialEnergy < cost) {
        player.messageGame("You don't have enough special attack energy.");
        return false;
    }

    player.specialEnergy -= cost;
    // TODO: trigger weapon-specific special attack effects
    return true;
}
