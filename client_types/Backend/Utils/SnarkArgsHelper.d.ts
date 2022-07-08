/// <reference types="react" />
import { BiomebaseSnarkContractCallArgs, InitSnarkContractCallArgs, MoveSnarkContractCallArgs, RevealSnarkContractCallArgs } from '@darkforest_eth/snarks';
import { TerminalHandle } from '../../Frontend/Views/Terminal';
import { HashConfig } from '../../_types/global/GlobalTypes';
declare class SnarkArgsHelper {
    /**
     * How many snark results to keep in an LRU cache.
     */
    private static readonly DEFAULT_SNARK_CACHE_SIZE;
    private readonly useMockHash;
    private readonly snarkProverQueue;
    private readonly terminal;
    private readonly hashConfig;
    private readonly spaceTypePerlinOpts;
    private readonly biomebasePerlinOpts;
    private readonly planetHashMimc;
    private moveSnarkCache;
    private constructor();
    static create(hashConfig: HashConfig, terminal: React.MutableRefObject<TerminalHandle | undefined>, fakeHash?: boolean): SnarkArgsHelper;
    setSnarkCacheSize(size: number): void;
    getRevealArgs(x: number, y: number): Promise<RevealSnarkContractCallArgs>;
    getInitArgs(x: number, y: number, r: number): Promise<InitSnarkContractCallArgs>;
    getMoveArgs(x1: number, y1: number, x2: number, y2: number, r: number, distMax: number): Promise<MoveSnarkContractCallArgs>;
    getFindArtifactArgs(x: number, y: number): Promise<BiomebaseSnarkContractCallArgs>;
    private fakeRevealProof;
    private fakeInitProof;
    private fakeMoveProof;
    private fakeBiomebaseProof;
}
export default SnarkArgsHelper;
