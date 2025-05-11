/***************************************************************************************************
 *  ClientCheatHandler.ts – 2004Scape Server
 *
 *  NOTE: All legacy comments (// … and /* … */
/* ───────── External packages ───────── */
import { Visibility } from '@2004scape/rsbuf';
import { LocAngle, LocShape } from '@2004scape/rsmod-pathfinder';

/* ───────── Internal modules (single group) ───────── */
import Component from '#/cache/config/Component.js';
import IdkType from '#/cache/config/IdkType.js';
import InvType from '#/cache/config/InvType.js';
import LocType from '#/cache/config/LocType.js';
import NpcType from '#/cache/config/NpcType.js';
import ObjType from '#/cache/config/ObjType.js';
import ScriptVarType from '#/cache/config/ScriptVarType.js';
import SeqType from '#/cache/config/SeqType.js';
import SpotanimType from '#/cache/config/SpotanimType.js';
import VarPlayerType from '#/cache/config/VarPlayerType.js';
import { CoordGrid } from '#/engine/CoordGrid.js';
import { EntityLifeCycle } from '#/engine/entity/EntityLifeCycle.js';
import Loc from '#/engine/entity/Loc.js';
import { MoveStrategy } from '#/engine/entity/MoveStrategy.js';
import { isClientConnected } from '#/engine/entity/NetworkPlayer.js';
import Npc from '#/engine/entity/Npc.js';
import Player, { getExpByLevel } from '#/engine/entity/Player.js';
import { PlayerStat, PlayerStatEnabled, PlayerStatMap } from '#/engine/entity/PlayerStat.js';
import ScriptProvider from '#/engine/script/ScriptProvider.js';
import ScriptRunner from '#/engine/script/ScriptRunner.js';
import World from '#/engine/World.js';
import MessageHandler from '#/network/game/client/handler/MessageHandler.js';
import ClientCheat from '#/network/game/client/model/ClientCheat.js';
import { LoggerEventType } from '#/server/logger/LoggerEventType.js';
import Environment from '#/util/Environment.js';
import { tryParseInt } from '#/util/TryParse.js';

/* ────────────────────────────────────────────────────────────────────────────
   Module augmentation – support both import paths
   (projects sometimes alias '#/.../Player' vs '#/.../Player.js')
──────────────────────────────────────────────────────────────────────────── */
declare module '#/engine/entity/Player.js' {
    interface Player {
        _cheat?: CheatFlags;
    }
}

/* ---- Helper types ---- */
interface CheatFlags {
    godModeEnabled?: boolean;
    infinitePrayer?: boolean;
    infiniteRun?: boolean;
    infiniteRunes?: boolean;
    _originalUpdateEnergy?: () => void;
}
/* ---- Helper types ---- */
//type CheatFlags = object
/* DELETE THIS ↓ (no longer used) */
// type EP = Player & CheatFlags;


/**
 * ExtendedPlayer: adds optional fields for "god mode" and original updateEnergy references
 * to avoid any casts on Player. (Legacy comment kept)
 */
export default class ClientCheatHandler extends MessageHandler<ClientCheat> {
    /* Main entry (TS2366: must always return boolean) */
    handle(message: ClientCheat, player: Player): boolean {
        // Flood‑protection
        if (message.input.length > 80) return false;

        const cheat = message.input.trim();
        const args = cheat.toLowerCase().split(' ');
        const cmd = args.shift() ?? '';

        if (!cmd) return false;

        // If staffModLevel >= 2, log the command (legacy comment)
        if (player.staffModLevel >= 2) {
            player.addSessionLog(LoggerEventType.MODERATOR, 'Ran cheat', cheat);
        }

        /* ───────── Developer commands: staffModLevel >= 4, not in production ───────── */
        if (!Environment.NODE_PRODUCTION && player.staffModLevel >= 4) {
            if (cmd[0] === Environment.NODE_DEBUGPROC_CHAR) {
                // debugprocs are NOT allowed on live ;)
                // e.g. we want something like: ScriptProvider.getByName("[debugproc,whatever]")
                const scriptName = `[debugproc,${cmd.slice(1)}]`;
                const script = ScriptProvider.getByName(scriptName);
                if (!script) return false;

                // Prepare script parameters (legacy huge switch, intact)
                const params: Array<number | string> = new Array(script.info.parameterTypes.length).fill(-1);
                for (let i = 0; i < script.info.parameterTypes.length; i++) {
                    const type = script.info.parameterTypes[i];
                    try {
                        switch (type) {
                            case ScriptVarType.STRING:
                                params[i] = args.shift() ?? '';
                                break;
                            case ScriptVarType.INT:
                                params[i] = tryParseInt(args.shift() ?? '0', 0);
                                break;
                            case ScriptVarType.OBJ:
                            case ScriptVarType.NAMEDOBJ:
                                params[i] = ObjType.getId(args.shift() ?? '');
                                break;
                            case ScriptVarType.NPC:
                                params[i] = NpcType.getId(args.shift() ?? '');
                                break;
                            case ScriptVarType.LOC:
                                params[i] = LocType.getId(args.shift() ?? '');
                                break;
                            case ScriptVarType.SEQ:
                                params[i] = SeqType.getId(args.shift() ?? '');
                                break;
                            case ScriptVarType.STAT:
                                params[i] = PlayerStatMap.get((args.shift() ?? '').toUpperCase()) ?? -1;
                                break;
                            case ScriptVarType.INV:
                                params[i] = InvType.getId(args.shift() ?? '');
                                break;
                            case ScriptVarType.COORD: {
                                // Note: This logic is from the original code
                                const seg = cheat.split('_');
                                params[i] = CoordGrid.packCoord(
                                    Number.parseInt(seg[0].slice(6), 10),
                                    (Number.parseInt(seg[1], 10) << 6) + Number.parseInt(seg[3], 10),
                                    (Number.parseInt(seg[2], 10) << 6) + Number.parseInt(seg[4], 10)
                                );
                                break;
                            }
                            case ScriptVarType.INTERFACE:
                                params[i] = Component.getId(args.shift() ?? '');
                                break;
                            case ScriptVarType.SPOTANIM:
                                params[i] = SpotanimType.getId(args.shift() ?? '');
                                break;
                            case ScriptVarType.IDKIT:
                                params[i] = IdkType.getId(args.shift() ?? '');
                                break;
                            default:
                                break;
                        }
                    } catch {
                        // invalid arguments
                        return false;
                    }
                }

                // Execute debug script
                player.executeScript(ScriptRunner.init(script, player, null, params), false);
                return true;
            }

            // ::bank / ::morph helper scripts, original comments kept
            if (cmd === 'bank' || cmd === 'morph') {
                const script = ScriptProvider.getByName(`[command,${cmd}]`);
                if (!script) {
                    player.messageGame(`Missing ::${cmd} script.`);
                    return false;
                }
                player.executeScript(ScriptRunner.init(script, player), true, true);
                return true;
            }

            // Quick server toggles
            if (cmd === 'reload' && !Environment.STANDALONE_BUNDLE) {
                World.reload();
                return true;
            }
            if (cmd === 'rebuild' && !Environment.STANDALONE_BUNDLE) {
                player.messageGame('Rebuilding scripts...');
                World.rebuild();
                return true;
            }

            // ::speed <ms>
            if (cmd === 'speed') {
                if (args.length < 1) {
                    player.messageGame('Usage: ::speed <ms>');
                    return false;
                }
                const ms = tryParseInt(args[0], 20);
                if (ms < 20) {
                    player.messageGame('::speed input too low.');
                    return false;
                }
                World.tickRate = ms;
                player.messageGame(`World speed was changed to ${ms}ms`);
                return true;
            }

            // ::fly / ::naive toggle
            if (cmd === 'fly' || cmd === 'naive') {
                player.moveStrategy =
                    cmd === 'fly'
                        ? (player.moveStrategy === MoveStrategy.FLY ? MoveStrategy.SMART : MoveStrategy.FLY)
                        : (player.moveStrategy === MoveStrategy.NAIVE ? MoveStrategy.SMART : MoveStrategy.NAIVE);
                player.messageGame(`Changed move strategy: ${cmd}`);
                return true;
            }

            // ::random – sets player.afkEventReady = true (legacy comment)
            if (cmd === 'random') {
                player.afkEventReady = true;
                return true;
            }
        }

        /* ───────── Admin commands: staffModLevel ≥ 3 (potentially destructive) ───────── */
        if (player.staffModLevel >= 3) {
            switch (cmd) {
                case 'setvar': {
                    // ::setvar <variable> <value>
                    if (args.length < 2) return false;
                    const varp = VarPlayerType.getByName(args[0]);
                    if (!varp) return false;

                    if (varp.protect) {
                        player.closeModal();
                        if (!player.canAccess()) {
                            player.messageGame('Please finish what you are doing first.');
                            return false;
                        }
                        player.clearInteraction();
                        player.unsetMapFlag();
                    }
                    player.setVar(varp.id, tryParseInt(args[1], 0));
                    player.messageGame(`set ${varp.debugname}: to ${args[1]}`);
                    break;
                }

                case 'setvarother': {
                    // ::setvarother <username> <name> <value>
                    if (args.length < 3 || !Environment.NODE_PRODUCTION) return false;
                    const other = World.getPlayerByUsername(args[0]);
                    if (!other) {
                        player.messageGame(`${args[0]} is not logged in.`);
                        return false;
                    }
                    const varp = VarPlayerType.getByName(args[1]);
                    if (!varp) return false;

                    if (varp.protect) {
                        other.closeModal();
                        if (!other.canAccess()) {
                            player.messageGame(`${args[0]} is busy right now.`);
                            return false;
                        }
                        other.clearInteraction();
                        other.unsetMapFlag();
                    }
                    other.setVar(varp.id, tryParseInt(args[2], 0));
                    player.messageGame(`set ${args[1]}: to ${args[2]} on ${other.username}`);
                    break;
                }

                case 'getvar': {
                    // ::getvar <variable>
                    if (!args.length) return false;
                    const varp = VarPlayerType.getByName(args[0]);
                    if (!varp) return false;
                    player.messageGame(`get ${varp.debugname}: ${player.getVar(varp.id)}`);
                    break;
                }

                case 'getvarother': {
                    // ::getvarother <username> <variable>
                    if (args.length < 2 || !Environment.NODE_PRODUCTION) return false;
                    const other = World.getPlayerByUsername(args[0]);
                    if (!other) {
                        player.messageGame(`${args[0]} is not logged in.`);
                        return false;
                    }
                    const varp = VarPlayerType.getByName(args[1]);
                    if (!varp) return false;
                    player.messageGame(`get ${varp.debugname}: ${other.getVar(varp.id)} on ${other.username}`);
                    break;
                }

                case 'cdebug': {
                    // Cannon debug helper
                    ['mcannon_progress', 'mcannon_railings', 'mcannon_stage', 'mcannon_ammo', 'mcannon_coord'].forEach(name => {
                        const vp = VarPlayerType.getByName(name);
                        if (vp) player.messageGame(`${name}: ${player.getVar(vp.id)}`);
                    });
                    break;
                }

                /* ----------------------------------------------------------------
   ALL-IN-1 GOD-MODE  (stand-alone / no external helpers)
---------------------------------------------------------------- */
                case 'allin1': {
                    /* ---------- helper: build rune-id lookup once ---------- */
                    const RUNE_IDS: Set<number> = (() => {
                        const ids: number[] = [];
                        for (let i = 0; i < ObjType.count; i++) {
                            const o = ObjType.get(i);
                            if (o?.name?.toLowerCase().endsWith(' rune')) ids.push(i);
                        }
                        return new Set<number>(ids);
                    })();

                    /* ---------- augment player with originals (first call only) ---------- */
                    const cheat = player as Player & {
        godModeEnabled?: boolean;
        /* originals we may override */
        _origUpdateEnergy?: () => void;
        _origApplyDamage?: (damage: number, type: number) => void;
        _origInvDel?: Player['invDel'];
        _origInvDelSlot?: Player['invDelSlot'];
        _origInvTotal?: Player['invTotal'];
    };

                    if (!cheat._origUpdateEnergy) {
                        cheat._origUpdateEnergy = player.updateEnergy.bind(player);
                        cheat._origApplyDamage  = player.applyDamage.bind(player);
                        cheat._origInvDel       = player.invDel.bind(player);
                        cheat._origInvDelSlot   = player.invDelSlot.bind(player);
                        cheat._origInvTotal     = player.invTotal.bind(player);
                    }

                    /* ---------- flip flag ---------- */
                    cheat.godModeEnabled = !cheat.godModeEnabled;

                    if (cheat.godModeEnabled) {
                        /* ===== ENABLE ===== */

                        /* 1) lock stats to full */
                        player.levels.forEach((_, i) => (player.levels[i] = player.baseLevels[i]));
                        player.levels[PlayerStat.HITPOINTS] = 999_999_999; // just in case
                        player.runenergy = 10_000;

                        /* 2) override energy-tick to keep run & prayer full every cycle */
                        player.updateEnergy = () => {
                            player.runenergy = 10_000;
                            player.levels[PlayerStat.PRAYER] = player.baseLevels[PlayerStat.PRAYER];
                        };

                        /* 3) override damage to ignore hits completely */
                        player.applyDamage = () => { /* noop – invincible */ };

                        /* 4) zero-rune spell casting + protect rune stacks */
                        player.invTotal = (inv, obj) =>
                            inv === InvType.INV && RUNE_IDS.has(obj) ? 1_000_000 : cheat._origInvTotal!(inv, obj);

                        player.invDel = (inv, obj, count, beginSlot = -1) =>
                            inv === InvType.INV && RUNE_IDS.has(obj) ? count : cheat._origInvDel!(inv, obj, count, beginSlot);

                        player.invDelSlot = (inv, slot) => {
                            if (inv === InvType.INV) {
                                const itm = player.invGetSlot(inv, slot);
                                if (itm && RUNE_IDS.has(itm.id)) return;        // skip removal
                            }
            cheat._origInvDelSlot!(inv, slot);
                        };

                        player.messageGame('All-in-1 mode activated.');
                    } else {
                        /* ===== DISABLE ===== */
                        player.updateEnergy = cheat._origUpdateEnergy!;
                        player.applyDamage  = cheat._origApplyDamage!;
                        player.invDel       = cheat._origInvDel!;
                        player.invDelSlot   = cheat._origInvDelSlot!;
                        player.invTotal     = cheat._origInvTotal!;

                        player.messageGame('All-in-1 mode deactivated.');
                    }
                    return true;
                }



                /* ---- give / item (supports noted flag, default amount = 1, shows list on ambiguity) ---- */
                case 'give':
                case 'item': {
                    if (!args.length) {
                        player.messageGame(`Usage: ::${cmd} <itemId|itemName> (amount) (noted)`);
                        return false;
                    }

                    // 1. Strip optional 'note' / 'noted' flag
                    let wantNoted = false;
                    if (/^(note|noted)$/i.test(args.at(-1)!)) {
                        wantNoted = true;
                        args.pop();
                    }

                    // 2. Strip optional amount
                    let amount = 1;
                    if (args.length >= 2) {
                        const maybeAmt = tryParseInt(args.at(-1)!, NaN);
                        if (!isNaN(maybeAmt)) {
                            amount = Math.max(1, maybeAmt);
                            args.pop();
                        }
                    }

                    // 3. Resolve item ID
                    let itemId: number;

                    // 3‑a Numeric‑ID
                    if (args.length === 1 && !isNaN(tryParseInt(args[0], NaN))) {
                        itemId = tryParseInt(args[0], 0);

                        // 3‑b Name path (exact, ci‑exact, partial)
                    } else {
                        const itemName = args.join(' ').trim();
                        itemId = ObjType.getId(itemName); // case‑sensitive exact

                        // 3‑b‑1 case‑insensitive exact match
                        if (itemId === -1) {
                            for (let i = 0; i < ObjType.count; i++) {
                                const o = ObjType.get(i);
                                if (o?.name?.toLowerCase() === itemName.toLowerCase()) {
                                    itemId = i;
                                    break;
                                }
                            }
                        }

                        // 3‑b‑2 partial search
                        if (itemId === -1) {
                            const hits: { id: number; name: string }[] = [];
                            const term = itemName.toLowerCase();
                            for (let i = 0; i < ObjType.count; i++) {
                                const o = ObjType.get(i);
                                if (o?.name?.toLowerCase().includes(term)) {
                                    hits.push({ id: i, name: o.name });
                                }
                            }

                            if (!hits.length) {
                                player.messageGame(`No items containing '${itemName}'.`);
                                return false;
                            }
                            if (hits.length > 1) {
                                player.messageGame(
                                    `Multiple items${hits.length > 10 ? ' (showing first 10)' : ''}:`
                                );
                                hits.slice(0, 10).forEach(h => player.messageGame(`- ${h.name} (ID: ${h.id})`));
                                if (hits.length > 10) {
                                    player.messageGame(`... and ${hits.length - 10} more.`);
                                }
                                return true; // ambiguous → stop here
                            }

                            // exactly one hit
                            itemId = hits[0].id;
                            player.messageGame(`Only one match: '${hits[0].name}' (ID: ${itemId}). Using it.`);
                        }
                    }

                    // 4. Convert to noted form if requested
                    let finalId = itemId;
                    if (wantNoted) {
                        const base = ObjType.get(itemId);
                        // 2004 cache: certtemplate != -1 ⇒ certlink is noted ID
                        if (base?.certtemplate !== -1 && base.certlink !== -1) {
                            finalId = base.certlink;
                        } else if (base?.certlink !== undefined && base.certlink !== -1) {
                            finalId = base.certlink;
                        } else {
                            player.messageGame('That item has no noted form – giving un‑noted.');
                        }
                    }

                    // 5. Final validation & give
                    if (finalId < 0 || finalId >= ObjType.count) {
                        player.messageGame('Invalid item ID.');
                        return false;
                    }

                    player.invAdd(InvType.INV, finalId, amount, false);
                    player.messageGame(
                        `Gave ${(ObjType.get(finalId)?.name) ?? finalId} x${amount}${wantNoted ? ' (noted)' : ''}`
                    );
                    break;
                }

                /* ---- id helper ---- */
                case 'id': {
                    if (!args.length) {
                        player.messageGame('Usage: ::id <itemName>');
                        return false;
                    }

                    const itemName = args.join(' ').trim();
                    const exactId = ObjType.getId(itemName);

                    if (exactId !== -1) {
                        // exact match — single line
                        player.messageGame(`Item '${itemName}' id: ${exactId}`);
                    } else {
                        // partial search
                        const hits: { id: number; name: string }[] = [];
                        const term = itemName.toLowerCase();
                        for (let i = 0; i < ObjType.count; i++) {
                            const obj = ObjType.get(i);
                            if (obj?.name?.toLowerCase().includes(term)) {
                                hits.push({ id: i, name: obj.name });
                            }
                        }

                        if (!hits.length) {
                            player.messageGame(`No items containing '${itemName}'.`);
                        } else if (hits.length === 1) {
                            player.messageGame(`Item '${hits[0].name}' id: ${hits[0].id}`);
                        } else {
                            player.messageGame(
                                `Multiple items${hits.length > 10 ? ' (showing first 10)' : ''}:`
                            );
                            hits.slice(0, 10).forEach(h =>
                                player.messageGame(`- ${h.name} (ID: ${h.id})`)
                            );
                            if (hits.length > 10) {
                                player.messageGame(`... and ${hits.length - 10} more.`);
                            }
                        }
                    }
                    break;
                }

                /* ---- giveother ---- */
                case 'giveother': {
                    if (args.length < 3 || !Environment.NODE_PRODUCTION) return false;
                    const other = World.getPlayerByUsername(args[0]);
                    if (!other) {
                        player.messageGame(`${args[0]} is not logged in.`);
                        return false;
                    }
                    const obj = ObjType.getId(args[1]);
                    if (obj === -1) return false;
                    other.invAdd(
                        InvType.INV,
                        obj,
                        Math.max(1, tryParseInt(args[2], 1)),
                        false
                    );
                    break;
                }

                /* ---- givecrap / givemany ---- */
                case 'givecrap': {
                    for (let i = 0; i < 28; i++) {
                        let random = -1;
                        while (random === -1) {
                            random = Math.trunc(Math.random() * ObjType.count);
                            const obj = ObjType.get(random);
                            // skip if members-only item on F2P environment or if dummy item
                            if ((!Environment.NODE_MEMBERS && obj.members) || obj.dummyitem) {
                                random = -1;
                            }
                        }
                        player.invAdd(InvType.INV, random, 1, false);
                    }
                    break;
                }
                case 'givemany': {
                    const obj = ObjType.getId(args[0]);
                    if (obj !== -1) {
                        player.invAdd(InvType.INV, obj, 1000, false);
                    }
                    break;
                }

                /* ---- broadcast / reboot ---- */
                case 'broadcast':
                    if (Environment.NODE_PRODUCTION) {
                        World.broadcastMes(cheat.slice(cmd.length + 1));
                    }
                    break;

                // ───── Instant world reboot ─────
                case 'reboot': // production shard
                    if (Environment.NODE_PRODUCTION) {
                        World.rebootTimer(0);
                    }
                    break;

                case 'dreboot': // dev‑only reboot (works when NODE_PRODUCTION = false)
                    if (!Environment.NODE_PRODUCTION) {
                        World.rebootTimer(0);
                    }
                    break;

                case 'serverdrop':
                    player.terminate();
                    break;

                /* ---- setstat / advancestat / minme ---- */
                case 'setstat': {
                    if (args.length < 2) return false;
                    const stat = PlayerStatMap.get(args[0].toUpperCase());
                    if (stat === undefined) return false;
                    player.setLevel(stat, tryParseInt(args[1], 1));
                    break;
                }

                case 'advancestat': {
                    if (args.length < 2) return false;
                    const stat = PlayerStatMap.get(args[0].toUpperCase());
                    if (stat === undefined) return false;
                    // forcibly set level to 1, then add appropriate XP
                    player.stats[stat] = player.baseLevels[stat] = player.levels[stat] = 1;
                    player.addXp(stat, getExpByLevel(tryParseInt(args[1], 1)), false);
                    break;
                }

                case 'minme':
                    for (let i = 0; i < PlayerStatEnabled.length; i++) {
                        player.setLevel(i, i === PlayerStat.HITPOINTS ? 10 : 1);
                    }
                    break;

                /* ---- locadd / npcadd ---- */
                case 'locadd': {
                    if (!args.length) return false;
                    const lt = LocType.getByName(args[0]);
                    if (!lt) return false;
                    World.addLoc(
                        new Loc(
                            player.level,
                            player.x,
                            player.z,
                            lt.width,
                            lt.length,
                            EntityLifeCycle.DESPAWN,
                            lt.id,
                            LocShape.CENTREPIECE_STRAIGHT,
                            LocAngle.WEST
                        ),
                        500
                    );
                    player.messageGame(`Loc Added: ${args[0]} (${lt.id})`);
                    break;
                }

                case 'npcadd': {
                    if (!args.length) return false;
                    const nt = NpcType.getByName(args[0]);
                    if (!nt) return false;
                    World.addNpc(
                        new Npc(
                            player.level,
                            player.x,
                            player.z,
                            nt.size,
                            nt.size,
                            EntityLifeCycle.DESPAWN,
                            World.getNextNid(),
                            nt.id,
                            nt.moverestrict,
                            nt.blockwalk
                        ),
                        500
                    );
                    break;
                }

                default:
                    // fall‑through to super‑mod
                    break;
            }
        }

        /* ───────── Super-moderator commands: staffModLevel ≥ 2 ───────── */
        if (player.staffModLevel >= 2) {
            switch (cmd) {
                case 'getcoord':
                    player.messageGame(
                        CoordGrid.formatString(player.level, player.x, player.z, ',')
                    );
                    return true;

                case 'tele': {
                    // ::tele L,Mx,Mz[,Lx,Lz]
                    const seg = args[0]?.split(',');
                    if (!seg || seg.length < 3) return false;
                    const level = Number(seg[0]);
                    const mx = Number(seg[1]);
                    const mz = Number(seg[2]);
                    const lx = Number(seg[3] ?? 32);
                    const lz = Number(seg[4] ?? 32);

                    if (
                        level < 0 ||
                        level > 3 ||
                        mx < 0 ||
                        mx > 255 ||
                        mz < 0 ||
                        mz > 255 ||
                        lx < 0 ||
                        lx > 63 ||
                        lz < 0 ||
                        lz > 63
                    ) {
                        return false;
                    }

                    player.closeModal();
                    if (!player.canAccess()) return false;
                    player.clearInteraction();
                    player.unsetMapFlag();
                    player.teleJump((mx << 6) + lx, (mz << 6) + lz, level);
                    return true;
                }

                case 'teleto': {
                    if (!args.length) {
                        player.messageGame('Usage: ::teleto <username>');
                        return false;
                    }

                    const targetName = args[0];
                    // 1) exact match first
                    let other = World.getPlayerByUsername(targetName);

                    // 2) fallback to case-insensitive by scanning known player indices
                    if (!other) {
                        const targetLower = targetName.toLowerCase();
                        // If your server uses a different max player count, adjust 2048:
                        for (let i = 0; i < 2048; i++) {
                            const p2 = World.getPlayer(i);
                            if (!p2) continue;
                            if (p2.username.toLowerCase() === targetLower) {
                                other = p2;
                                break;
                            }
                        }
                    }

                    if (!other) {
                        player.messageGame(`Player '${targetName}' not found or offline.`);
                        return false;
                    }

                    player.closeModal();
                    if (!player.canAccess()) {
                        player.messageGame('You are currently busy.');
                        return true;
                    }

                    player.clearInteraction();
                    player.unsetMapFlag();
                    player.teleJump(other.x, other.z, other.level);
                    return true;
                }

                case 'setvis':
                    if (!Environment.NODE_PRODUCTION || !args.length) return false;
                    switch (args[0]) {
                        case '0':
                            player.setVisibility(Visibility.DEFAULT);
                            break;
                        case '1':
                            player.setVisibility(Visibility.SOFT);
                            break;
                        case '2':
                            player.setVisibility(Visibility.HARD);
                            break;
                        default:
                            return false;
                    }
                    return true;

                case 'ban':
                    if (!Environment.NODE_PRODUCTION || args.length < 2) return false;
                    World.notifyPlayerBan(
                        player.username,
                        args[0],
                        Date.now() + tryParseInt(args[1], 60) * 60_000
                    );
                    return true;

                case 'mute':
                    if (!Environment.NODE_PRODUCTION || args.length < 2) return false;
                    World.notifyPlayerMute(
                        player.username,
                        args[0],
                        Date.now() + tryParseInt(args[1], 60) * 60_000
                    );
                    return true;

                case 'kick': {
                    if (!Environment.NODE_PRODUCTION || !args.length) return false;
                    const target = World.getPlayerByUsername(args[0]);
                    if (target) {
                        target.loggingOut = true;
                        if (isClientConnected(target)) {
                            target.logout();
                            target.client.close();
                        }
                        player.messageGame(`Player '${args[0]}' has been kicked.`);
                    } else {
                        player.messageGame(`Player '${args[0]}' not found or offline.`);
                    }
                    return true;
                }

                default:
                    break;
            }
        }

        // Unknown command
        return false;
    }
}
