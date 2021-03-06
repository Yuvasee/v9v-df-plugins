import { Chunk, ClaimedCoords, DiagnosticUpdater, EthAddress, LocationId, ModalId, ModalPosition, PersistedTransaction, Rectangle, RevealedCoords, Transaction, WorldLocation } from '@darkforest_eth/types';
import { IDBPDatabase } from 'idb';
import { ChunkStore } from '../../_types/darkforest/api/ChunkStoreTypes';
import { SerializedPlugin } from '../Plugins/SerializedPlugin';
interface PersistentChunkStoreConfig {
    db: IDBPDatabase;
    contractAddress: EthAddress;
    account: EthAddress;
    configHash?: string;
}
export declare const MODAL_POSITIONS_KEY = "modal_positions";
declare class PersistentChunkStore implements ChunkStore {
    private diagnosticUpdater?;
    private db;
    private queuedChunkWrites;
    private throttledSaveChunkCacheToDisk;
    private nUpdatesLastTwoMins;
    private chunkMap;
    private confirmedTxHashes;
    private account;
    private contractAddress;
    private configHash?;
    constructor({ db, account, contractAddress, configHash }: PersistentChunkStoreConfig);
    destroy(): void;
    /**
     * NOTE! if you're creating a new object store, it will not be *added* to existing dark forest
     * accounts. This creation code runs once per account. Therefore, if you're adding a new object
     * store, and need to test it out, you must either clear the indexed db databse for this account,
     * or create a brand new account.
     */
    static create({ account, contractAddress, configHash }: Omit<PersistentChunkStoreConfig, 'db'>): Promise<PersistentChunkStore>;
    setDiagnosticUpdater(diagnosticUpdater?: DiagnosticUpdater): void;
    /**
     * Important! This sets the key in indexed db per account and per contract. This means the same
     * client can connect to multiple different dark forest contracts, with multiple different
     * accounts, and the persistent storage will not overwrite data that is not relevant for the
     * current configuration of the client.
     */
    private getKey;
    /**
     * Important! This sets the key in indexed db per account and per contract. This means the same
     * client can connect to multiple different dark forest contracts, with multiple different
     * accounts, and the persistent storage will not overwrite data that is not relevant for the
     * current configuration of the client.
     */
    private setKey;
    private removeKey;
    private bulkSetKeyInCollection;
    /**
     * This function loads all chunks persisted in the user's storage into the game.
     */
    private loadChunks;
    /**
     * Rather than saving a chunk immediately after it's mined, we queue up new chunks, and
     * periodically save them. This function gets all of the queued new chunks, and persists them to
     * indexed db.
     */
    private persistQueuedChunks;
    /**
     * we keep a list rather than a single location, since client/contract can
     * often go out of sync on initialization - if client thinks that init
     * failed but is wrong, it will prompt user to initialize with new home coords,
     * which bricks the user's account.
     */
    getHomeLocations(): Promise<WorldLocation[]>;
    addHomeLocation(location: WorldLocation): Promise<void>;
    confirmHomeLocation(location: WorldLocation): Promise<void>;
    getSavedTouchedPlanetIds(): Promise<LocationId[]>;
    getSavedRevealedCoords(): Promise<RevealedCoords[]>;
    getSavedClaimedCoords(): Promise<ClaimedCoords[]>;
    saveTouchedPlanetIds(ids: LocationId[]): Promise<void>;
    saveRevealedCoords(revealedCoordTups: RevealedCoords[]): Promise<void>;
    saveClaimedCoords(claimedCoordTupps: ClaimedCoords[]): Promise<void>;
    /**
     * Returns the explored chunk data for the given rectangle if that chunk has been mined. If this
     * chunk is entirely contained within another bigger chunk that has been mined, return that chunk.
     * `chunkLoc` is an aligned square, as defined in ChunkUtils.ts in the `getSiblingLocations`
     * function.
     */
    getChunkByFootprint(chunkLoc: Rectangle): Chunk | undefined;
    hasMinedChunk(chunkLoc: Rectangle): boolean;
    private getChunkById;
    /**
     * When a chunk is mined, or a chunk is imported via map import, or a chunk is loaded from
     * persistent storage for the first time, we need to add this chunk to the game. This function
     * allows you to add a new chunk to the game, and optionally persist that chunk. The reason you
     * might not want to persist the chunk is if you are sure that you got it from persistent storage.
     * i.e. it already exists in persistent storage.
     */
    addChunk(chunk: Chunk, persistChunk?: boolean): void;
    /**
     * Returns all the mined chunks with smaller sidelength strictly contained in the chunk.
     *
     * TODO: move this into ChunkUtils, and also make use of it, the way that it is currently used, in
     * the function named `addToChunkMap`.
     */
    private getMinedSubChunks;
    private recomputeSaveThrottleAfterUpdate;
    allChunks(): Iterable<Chunk>;
    /**
     * Whenever a transaction is submitted, it is persisted. When the transaction either fails or
     * succeeds, it is un-persisted. The reason we persist submitted transactions is to be able to
     * wait for them upon a fresh start of the game if you close the game before a transaction
     * confirms.
     */
    onEthTxSubmit(tx: Transaction): Promise<void>;
    /**
     * Partner function to {@link PersistentChunkStore#onEthTxSubmit}
     */
    onEthTxComplete(txHash: string): Promise<void>;
    getUnconfirmedSubmittedEthTxs(): Promise<PersistedTransaction[]>;
    loadPlugins(): Promise<SerializedPlugin[]>;
    savePlugins(plugins: SerializedPlugin[]): Promise<void>;
    saveModalPositions(modalPositions: Map<ModalId, ModalPosition>): Promise<void>;
    loadModalPositions(): Promise<Map<ModalId, ModalPosition>>;
}
export default PersistentChunkStore;
