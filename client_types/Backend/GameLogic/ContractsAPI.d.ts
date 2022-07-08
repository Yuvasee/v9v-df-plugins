/// <reference types="node" />
import { DarkForest } from '@darkforest_eth/contracts/typechain';
import { EthConnection, TxExecutor } from '@darkforest_eth/network';
import { Artifact, ArtifactId, DiagnosticUpdater, EthAddress, LocationId, Planet, Player, QueuedArrival, RevealedCoords, Transaction, TxIntent } from '@darkforest_eth/types';
import { providers } from 'ethers';
import { EventEmitter } from 'events';
import { ContractConstants } from '../../_types/darkforest/api/ContractsAPITypes';
interface ContractsApiConfig {
    connection: EthConnection;
    contractAddress: EthAddress;
}
/**
 * Roughly contains methods that map 1:1 with functions that live in the contract. Responsible for
 * reading and writing to and from the blockchain.
 *
 * @todo don't inherit from {@link EventEmitter}. instead use {@link Monomitter}
 */
export declare class ContractsAPI extends EventEmitter {
    /**
     * Don't allow users to submit txs if balance falls below this amount (in wei)
     */
    private static readonly MIN_BALANCE;
    /**
     * Instrumented {@link ThrottledConcurrentQueue} for blockchain reads.
     */
    private readonly contractCaller;
    /**
     * Instrumented {@link ThrottledConcurrentQueue} for blockchain writes.
     */
    readonly txExecutor: TxExecutor;
    /**
     * Our connection to the blockchain. In charge of low level networking, and also of the burner
     * wallet.
     */
    readonly ethConnection: EthConnection;
    /**
     * The contract address is saved on the object upon construction
     */
    private contractAddress;
    get contract(): DarkForest;
    constructor({ connection, contractAddress }: ContractsApiConfig);
    /**
     * We pass this function into {@link TxExecutor} to calculate what gas fee we should use for the
     * given transaction. The result is either a number, measured in gwei, represented as a string, or
     * a string representing that we want to use an auto gas setting.
     */
    private getGasFeeForTransaction;
    /**
     * This function is called by {@link TxExecutor} before a transaction is queued.
     * It gives the client an opportunity to prevent a transaction from being queued based
     * on business logic or user interaction.
     *
     * Reject the promise to prevent the queued transaction from being queued.
     */
    private beforeQueued;
    /**
     * This function is called by {@link TxExecutor} before each transaction. It gives the client an
     * opportunity to prevent a transaction from going through based on business logic or user
     * interaction. To prevent the queued transaction from being submitted, throw an Error.
     */
    private beforeTransaction;
    private afterTransaction;
    destroy(): void;
    private makeCall;
    setupEventListeners(): Promise<void>;
    removeEventListeners(): void;
    getContractAddress(): EthAddress;
    getConstants(): Promise<ContractConstants>;
    getPlayers(onProgress?: (fractionCompleted: number) => void): Promise<Map<string, Player>>;
    getPlayerById(playerId: EthAddress): Promise<Player | undefined>;
    getWorldRadius(): Promise<number>;
    getTokenMintEndTimestamp(): Promise<number>;
    getArrival(arrivalId: number): Promise<QueuedArrival | undefined>;
    getArrivalsForPlanet(planetId: LocationId): Promise<QueuedArrival[]>;
    getAllArrivals(planetsToLoad: LocationId[], onProgress?: (fractionCompleted: number) => void): Promise<QueuedArrival[]>;
    getTouchedPlanetIds(startingAt: number, onProgress?: (fractionCompleted: number) => void): Promise<LocationId[]>;
    getTargetPlanetIds(startingAt: number, onProgress?: (fractionCompleted: number) => void): Promise<LocationId[]>;
    getSpawnPlanetIds(startingAt: number, onProgress?: (fractionCompleted: number) => void): Promise<LocationId[]>;
    getRevealedCoordsByIdIfExists(planetId: LocationId): Promise<RevealedCoords | undefined>;
    getIsPaused(): Promise<boolean>;
    getGameover(): Promise<boolean>;
    getWinners(): Promise<EthAddress[]>;
    getStartTime(): Promise<number | undefined>;
    getEndTime(): Promise<number | undefined>;
    getRevealedPlanetsCoords(startingAt: number, onProgressIds?: (fractionCompleted: number) => void, onProgressCoords?: (fractionCompleted: number) => void): Promise<RevealedCoords[]>;
    bulkGetPlanets(toLoadPlanets: LocationId[], onProgressPlanet?: (fractionCompleted: number) => void, onProgressMetadata?: (fractionCompleted: number) => void): Promise<Map<LocationId, Planet>>;
    getPlanetById(planetId: LocationId): Promise<Planet | undefined>;
    getArtifactById(artifactId: ArtifactId): Promise<Artifact | undefined>;
    bulkGetArtifactsOnPlanets(locationIds: LocationId[], onProgress?: (fractionCompleted: number) => void): Promise<Artifact[][]>;
    bulkGetArtifacts(artifactIds: ArtifactId[], onProgress?: (fractionCompleted: number) => void): Promise<Artifact[]>;
    getPlayerArtifacts(playerId?: EthAddress, onProgress?: (percent: number) => void): Promise<Artifact[]>;
    setDiagnosticUpdater(diagnosticUpdater?: DiagnosticUpdater): void;
    submitTransaction<T extends TxIntent>(txIntent: T, overrides?: providers.TransactionRequest): Promise<Transaction<T>>;
    /**
     * Remove a transaction from the queue.
     */
    cancelTransaction(tx: Transaction): void;
    /**
     * Make sure this transaction is the next to be executed.
     */
    prioritizeTransaction(tx: Transaction): void;
    /**
     * This is a strange interface between the transaction queue system and the rest of the game. The
     * strange thing about it is that introduces another way by which transactions are pushed into the
     * game - these {@code ContractsAPIEvent} events.
     */
    emitTransactionEvents(tx: Transaction): void;
    getAddress(): EthAddress;
}
export declare function makeContractsAPI({ connection, contractAddress, }: ContractsApiConfig): Promise<ContractsAPI>;
export {};
