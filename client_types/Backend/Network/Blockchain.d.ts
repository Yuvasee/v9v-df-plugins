import { EthConnection } from '@darkforest_eth/network';
import type { Contract, providers, Wallet } from 'ethers';
/**
 * Loads the game contract, which is responsible for updating the state of the game.
 */
export declare function loadDiamondContract<T extends Contract>(address: string, provider: providers.JsonRpcProvider, signer?: Wallet): Promise<T>;
/**
 * Loads the faucet contract, which is responsible for dripping funds to players
 */
export declare function loadFaucetContract<T extends Contract>(address: string, provider: providers.JsonRpcProvider, signer?: Wallet): Promise<T>;
/**
 * Loads the init contract, which is responsible for initializing lobbies
 */
export declare function loadInitContract<T extends Contract>(address: string, provider: providers.JsonRpcProvider, signer?: Wallet): Promise<T>;
export declare function getEthConnection(): Promise<EthConnection>;
