declare const MIN_CHUNK_SIZE = 16;
/**
 * @tutorial to speed up the game's background rendering code, it is possible to set this value to
 * be a higher power of two. This means that smaller chunks will be merged into larger chunks via
 * the algorithms implemented in {@link ChunkUtils}.
 *
 * {@code Math.floor(Math.pow(2, 16))} should be large enough for most.
 */
declare const MAX_CHUNK_SIZE: number;
declare const LOCATION_ID_UB: any;
declare const competitiveConfig = "0xc8b6b767570b2e39b622c6d5a8c4ac65a61d50a94f4312ac171483c95b2ec996";
declare const roundStartTimestamp = "2022-07-02T00:00:00.000Z";
declare const roundEndTimestamp = "2022-07-04T00:00:00.000Z";
declare const bronzeTime = 4500;
declare const silverTime = 3500;
declare const goldTime = 2500;
export { MIN_CHUNK_SIZE, MAX_CHUNK_SIZE, LOCATION_ID_UB, roundEndTimestamp, roundStartTimestamp, competitiveConfig, bronzeTime, silverTime, goldTime };
export declare const enum DFZIndex {
    MenuBar = 4,
    HoverPlanet = 1001,
    Modal = 1001,
    Tooltip = 16000000,
    Notification = 1000
}
