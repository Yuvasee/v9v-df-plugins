import { Monomitter } from '@darkforest_eth/events';
import { CaptureZone, LocationId } from '@darkforest_eth/types';
import GameManager from './GameManager';
export declare type CaptureZonesGeneratedEvent = {
    changeBlock: number;
    nextChangeBlock: number;
    zones: CaptureZone[];
};
/**
 * Given a game start block and a zone change block interval, decide when to generate new Capture Zones.
 */
export declare class CaptureZoneGenerator {
    private gameManager;
    private zones;
    private capturablePlanets;
    private lastChangeBlock;
    private nextChangeBlock;
    private changeInterval;
    readonly generated$: Monomitter<CaptureZonesGeneratedEvent>;
    constructor(gameManager: GameManager, gameStartBlock: number, changeInterval: number);
    /**
     * Call when a new block is received to check if generation is needed.
     * @param blockNumber Current block number.
     */
    generate(blockNumber: number): Promise<void>;
    private setNextGenerationBlock;
    private _generate;
    private updateCapturablePlanets;
    private get gameObjects();
    private onNewChunk;
    /**
     * Is the given planet inside of a Capture Zone.
     */
    isInZone(locationId: LocationId): boolean;
    /**
     * The next block that will trigger a Capture Zone generation.
     */
    getNextChangeBlock(): number;
    getZones(): Set<CaptureZone>;
}
