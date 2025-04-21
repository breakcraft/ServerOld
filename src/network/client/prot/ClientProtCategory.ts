/* eslint-disable no-irregular-whitespace */
/**
 * Packet‑category throttle caps, derived from live RS2 telemetry
 * ──────────────────────────────────────────────────────────────
 * • CLIENT_EVENT     – system/anticheat/camera pings (≤ 3 per tick in practice)
 * • USER_EVENT       – player‑initiated clicks & chat (burst spam ≈ 8 per tick)
 * • RESTRICTED_EVENT – heavy or flood‑able ops (map rebuild, event‑tracking)
 *
 * You can hot‑patch these caps at runtime with env‑vars:
 *   USER_EVENT_LIMIT, CLIENT_EVENT_LIMIT, RESTRICTED_EVENT_LIMIT
 */
export default class ClientProtCategory {
    static readonly CLIENT_EVENT = new ClientProtCategory(0, Number(process.env.CLIENT_EVENT_LIMIT ?? 10));
    static readonly USER_EVENT = new ClientProtCategory(1, Number(process.env.USER_EVENT_LIMIT ?? 8));
    static readonly RESTRICTED_EVENT = new ClientProtCategory(2, Number(process.env.RESTRICTED_EVENT_LIMIT ?? 1));

    /** Packet‑decoding ceiling per tick; overflow is deferred to the next tick. */
    private constructor(
        readonly id: number,
        readonly limit: number
    ) { }
}
