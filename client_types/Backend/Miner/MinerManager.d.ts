/// <reference types="node" />
import { Chunk, Rectangle } from '@darkforest_eth/types';
import { EventEmitter } from 'events';
import { ChunkStore } from '../../_types/darkforest/api/ChunkStoreTypes';
import { HashConfig } from '../../_types/global/GlobalTypes';
import { MiningPattern } from './MiningPatterns';
export declare const enum MinerManagerEvent {
    DiscoveredNewChunk = "DiscoveredNewChunk"
}
export declare type workerFactory = () => Worker;
export declare class HomePlanetMinerChunkStore implements ChunkStore {
    private initPerlinMin;
    private initPerlinMax;
    private minedChunkKeys;
    private perlinOptions;
    constructor(initPerlinMin: number, initPerlinMax: number, hashConfig: HashConfig);
    addChunk(exploredChunk: Chunk): void;
    hasMinedChunk(chunkFootprint: Rectangle): boolean;
}
declare class MinerManager extends EventEmitter {
    private readonly minedChunksStore;
    private readonly planetRarity;
    private readonly planetLevelThresholds;
    private isExploring;
    private miningPattern;
    private workers;
    private worldRadius;
    private cores;
    private exploringChunk;
    private exploringChunkStart;
    private minersComplete;
    private currentJobId;
    private useMockHash;
    private perlinOptions;
    private hashConfig;
    private workerFactory;
    private constructor();
    setMiningPattern(pattern: MiningPattern): void;
    getMiningPattern(): MiningPattern;
    destroy(): void;
    static create(chunkStore: ChunkStore, miningPattern: MiningPattern, worldRadius: number, planetRarity: number, planetLevelThresholds: number[], hashConfig: HashConfig, useMockHash?: boolean, workerFactory?: workerFactory): MinerManager;
    private initWorker;
    private onDiscovered;
    private exploreNext;
    setCores(nCores: number): void;
    startExplore(): void;
    stopExplore(): void;
    isMining(): boolean;
    getCurrentlyExploringChunk(): Rectangle | undefined;
    setRadius(radius: number): void;
    private nextValidExploreTarget;
    private isValidExploreTarget;
    private sendMessageToWorkers;
    private chunkLocationToKey;
    private chunkKeyToLocation;
}
export default MinerManager;
