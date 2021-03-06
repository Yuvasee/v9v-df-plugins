/// <reference types="node" />
import { Monomitter } from "@darkforest_eth/events";
import { EthConnection } from "@darkforest_eth/network";
import { GameGLManager, Renderer } from "@darkforest_eth/renderer";
import {
	Artifact,
	ArtifactId,
	BaseRenderer,
	Biome,
	Chunk,
	Diagnostics,
	EthAddress,
	LocatablePlanet,
	LocationId,
	PerlinConfig,
	Planet,
	PlanetLevel,
	Player,
	QueuedArrival,
	Rectangle,
	Setting,
	SpaceType,
	Transaction,
	UnconfirmedActivateArtifact,
	UnconfirmedMove,
	UnconfirmedUpgrade,
	Upgrade,
	UpgradeBranchName,
	WorldCoords,
	WorldLocation,
	Wormhole,
} from "@darkforest_eth/types";
import { BigNumber } from "ethers";
import EventEmitter from "events";
import React from "react";
import ModalManager from "../../Frontend/Game/ModalManager";
import Viewport from "../../Frontend/Game/Viewport";
import UIEmitter from "../../Frontend/Utils/UIEmitter";
import { TerminalHandle } from "../../Frontend/Views/Terminal";
import { ContractConstants } from "../../_types/darkforest/api/ContractsAPITypes";
import { HashConfig } from "../../_types/global/GlobalTypes";
import { MiningPattern } from "../Miner/MiningPatterns";
import GameManager from "./GameManager";
import { GameObjects } from "./GameObjects";
import { PluginManager } from "./PluginManager";
export declare const enum GameUIManagerEvent {
	InitializedPlayer = "InitializedPlayer",
	InitializedPlayerError = "InitializedPlayerError",
}
declare class GameUIManager extends EventEmitter {
	readonly radiusMap;
	readonly gameManager;
	private modalManager;
	private terminal;
	/**
	 * In order to render React on top of the game, we need to insert React nodes into an overlay
	 * container. We keep a reference to this container, so that our React components can optionally
	 * choose to render themselves into this overlay container using React Portals.
	 */
	private overlayContainer?;
	private previousSelectedPlanetId;
	private selectedPlanetId;
	private selectedCoords;
	private mouseDownOverPlanet;
	private mouseDownOverCoords;
	private mouseHoveringOverPlanet;
	private mouseHoveringOverCoords;
	private sendingPlanet;
	private sendingCoords;
	private isSending;
	private abandoning;
	private viewportEntities;
	/**
	 * The Wormhole artifact requires you to choose a target planet. This value
	 * indicates whether or not the player is currently selecting a target planet.
	 */
	private isChoosingTargetPlanet;
	private onChooseTargetPlanet?;
	private minerLocation;
	private extraMinerLocations;
	private forcesSending;
	private silverSending;
	private artifactSending;
	private plugins;
	readonly selectedPlanetId$: Monomitter<LocationId | undefined>;
	readonly hoverPlanetId$: Monomitter<LocationId | undefined>;
	readonly hoverPlanet$: Monomitter<Planet | undefined>;
	readonly hoverArtifactId$: Monomitter<ArtifactId | undefined>;
	readonly hoverArtifact$: Monomitter<Artifact | undefined>;
	readonly myArtifacts$: Monomitter<Map<ArtifactId, Artifact>>;
	readonly isSending$: Monomitter<boolean>;
	readonly isAbandoning$: Monomitter<boolean>;
	private planetHoveringInRenderer;
	private constructor();
	/**
	 * Sets the overlay container. See {@link GameUIManger.overlayContainer} for more information
	 * about what the overlay container is.
	 */
	setOverlayContainer(randomContainer?: HTMLDivElement): void;
	/**
	 * Gets the overlay container. See {@link GameUIManger.overlayContainer} for more information
	 * about what the overlay container is.
	 */
	getOverlayContainer(): HTMLDivElement | undefined;
	static create(
		gameManager: GameManager,
		terminalHandle: React.MutableRefObject<TerminalHandle | undefined>
	): Promise<GameUIManager>;
	destroy(): void;
	getStringSetting(setting: Setting): string | undefined;
	getBooleanSetting(setting: Setting): boolean;
	getDiagnostics(): Diagnostics;
	updateDiagnostics(updateFn: (d: Diagnostics) => void): void;
	getEthConnection(): EthConnection;
	getContractAddress(): EthAddress;
	centerPlanet(planet: LocatablePlanet | undefined): void;
	centerCoords(coords: WorldCoords): void;
	centerLocationId(planetId: LocationId): void;
	joinGame(beforeRetry: (e: Error) => Promise<boolean>): Promise<void>;
	addAccount(coords: WorldCoords): Promise<boolean>;
	verifyTwitter(twitter: string): Promise<boolean>;
	disconnectTwitter(twitter: string): Promise<void>;
	getPluginManager(): PluginManager;
	getPrivateKey(): string | undefined;
	getMyBalance(): number;
	getMyBalanceBn(): BigNumber;
	getMyBalance$(): Monomitter<BigNumber>;
	findArtifact(planetId: LocationId): void;
	prospectPlanet(planetId: LocationId): void;
	withdrawArtifact(locationId: LocationId, artifactId: ArtifactId): void;
	depositArtifact(locationId: LocationId, artifactId: ArtifactId): void;
	drawAllRunningPlugins(ctx: CanvasRenderingContext2D): void;
	activateArtifact(locationId: LocationId, id: ArtifactId, wormholeTo?: LocationId): void;
	deactivateArtifact(locationId: LocationId, artifactId: ArtifactId): void;
	withdrawSilver(locationId: LocationId, amount: number): void;
	startWormholeFrom(planet: LocatablePlanet): Promise<LocatablePlanet | undefined>;
	revealLocation(locationId: LocationId): void;
	getNextBroadcastAvailableTimestamp(): number;
	timeUntilNextBroadcastAvailable(): number;
	getEnergyArrivingForMove(
		from: LocationId,
		to: LocationId | undefined,
		dist: number | undefined,
		energy: number
	): number;
	getIsChoosingTargetPlanet(): boolean;
	onMouseDown(coords: WorldCoords): void;
	onMouseClick(_coords: WorldCoords): void;
	onMouseMove(coords: WorldCoords): void;
	onMouseUp(coords: WorldCoords): void;
	onMouseOut(): void;
	startExplore(): void;
	stopExplore(): void;
	toggleExplore(): void;
	toggleTargettingExplorer(): void;
	setForcesSending(planetId: LocationId, percentage: number): void;
	setSilverSending(planetId: LocationId, percentage: number): void;
	setSending(sending: boolean): void;
	setAbandoning(abandoning: boolean): void;
	setArtifactSending(planetId: LocationId, artifact?: Artifact): void;
	isOwnedByMe(planet: Planet): boolean;
	addNewChunk(chunk: Chunk): void;
	bulkAddNewChunks(chunks: Chunk[]): Promise<void>;
	setMiningPattern(pattern: MiningPattern): void;
	getMiningPattern(): MiningPattern | undefined;
	isMining(): boolean;
	getAccount(): EthAddress | undefined;
	isAdmin(): boolean;
	getTwitter(address: EthAddress | undefined): string | undefined;
	getEndTimeSeconds(): number | undefined;
	isRoundOver(): boolean;
	getUpgrade(branch: UpgradeBranchName, level: number): Upgrade;
	private getBiomeKey;
	getDiscoverBiomeName(biome: Biome): string;
	getDistCoords(from: WorldCoords, to: WorldCoords): number;
	discoverBiome(planet: LocatablePlanet): void;
	getAllPlayers(): Player[];
	getSelectedPlanet(): LocatablePlanet | undefined;
	getPreviousSelectedPlanet(): Planet | undefined;
	setSelectedId(id: LocationId): void;
	setSelectedPlanet(planet: LocatablePlanet | undefined): void;
	getSelectedCoords(): WorldCoords | undefined;
	getMouseDownPlanet(): LocatablePlanet | undefined;
	onSendInit(planet: LocatablePlanet | undefined): void;
	onSendComplete(locationId: LocationId): void;
	onSendCancel(): void;
	hasMinedChunk(chunkLocation: Rectangle): boolean;
	getChunk(chunkFootprint: Rectangle): Chunk | undefined;
	spaceTypeFromPerlin(perlin: number): SpaceType;
	getSpaceTypePerlin(coords: WorldCoords, floor: boolean): number;
	getBiomePerlin(coords: WorldCoords, floor: boolean): number;
	onDiscoveredChunk(chunk: Chunk): void;
	getMinerLocation(): WorldCoords | undefined;
	setExtraMinerLocation(idx: number, coords: WorldCoords): void;
	removeExtraMinerLocation(idx: number): void;
	getAllMinerLocations(): WorldCoords[];
	getMouseDownCoords(): WorldCoords | undefined;
	setHoveringOverPlanet(planet: LocatablePlanet | undefined, inRenderer: boolean): void;
	setHoveringOverArtifact(artifactId?: ArtifactId): void;
	getHoveringOverPlanet(): Planet | undefined;
	getHoveringOverCoords(): WorldCoords | undefined;
	isSendingForces(): boolean;
	/**
	 * Percent from 0 to 100.
	 */
	getForcesSending(planetId?: LocationId): number;
	/**
	 * Percent from 0 to 100.
	 */
	getSilverSending(planetId?: LocationId): number;
	isAbandoning(): boolean;
	getArtifactSending(planetId?: LocationId): Artifact | undefined;
	getAbandonSpeedChangePercent(): number;
	getAbandonRangeChangePercent(): number;
	isSendingShip(planetId?: LocationId): boolean;
	isOverOwnPlanet(coords: WorldCoords): Planet | undefined;
	getMyArtifacts(): Artifact[];
	getMyArtifactsNotOnPlanet(): Artifact[];
	getMySpaceships(): Artifact[];
	getPlanetWithId(planetId: LocationId | undefined): Planet | undefined;
	getMyScore(): number | undefined;
	getPlayer(address?: EthAddress): Player | undefined;
	getArtifactWithId(artifactId: ArtifactId | undefined): Artifact | undefined;
	getPlanetWithCoords(coords: WorldCoords | undefined): Planet | undefined;
	getArtifactsWithIds(artifactIds?: ArtifactId[]): Array<Artifact | undefined>;
	getArtifactPlanet(artifact: Artifact): Planet | undefined;
	getPlanetLevel(planetId: LocationId): PlanetLevel | undefined;
	getAllOwnedPlanets(): Planet[];
	getAllVoyages(): QueuedArrival[];
	getSpeedBuff(): number;
	getRangeBuff(): number;
	/**
	 * @todo delete this. now that {@link GameObjects} is publically accessible, we shouldn't need to
	 * drill fields like this anymore.
	 * @tutorial Plugin developers, please access fields like this with something like {@code df.getGameObjects().}
	 * @deprecated
	 */
	getUnconfirmedMoves(): Transaction<UnconfirmedMove>[];
	getUnconfirmedUpgrades(): Transaction<UnconfirmedUpgrade>[];
	isCurrentlyRevealing(): boolean;
	getUnconfirmedWormholeActivations(): Transaction<UnconfirmedActivateArtifact>[];
	getWormholes(): Iterable<Wormhole>;
	getLocationOfPlanet(planetId: LocationId): WorldLocation | undefined;
	getExploredChunks(): Iterable<Chunk>;
	getLocationsAndChunks(): {
		chunks: Set<Chunk>;
		cachedPlanets: Map<LocationId, import("@darkforest_eth/types").PlanetRenderInfo>;
	};
	getCaptureZones(): Set<import("@darkforest_eth/types").CaptureZone>;
	getCaptureZoneGenerator(): import("./CaptureZoneGenerator").CaptureZoneGenerator;
	getIsHighPerfMode(): boolean;
	getPlanetsInViewport(): Planet[];
	getWorldRadius(): number;
	getWorldSilver(): number;
	getUniverseTotalEnergy(): number;
	getSilverOfPlayer(player: EthAddress): number;
	getEnergyOfPlayer(player: EthAddress): number;
	getPlayerScore(player: EthAddress): number | undefined;
	upgrade(planet: Planet, branch: number): void;
	buyHat(planet: Planet): void;
	getHomeCoords(): WorldCoords;
	getHomeHash(): LocationId | undefined;
	getHomePlanet(): Planet | undefined;
	getRadiusOfPlanetLevel(planetRarity: PlanetLevel): number;
	getEnergyCurveAtPercent(planet: Planet, percent: number): number;
	getSilverCurveAtPercent(planet: Planet, percent: number): number | undefined;
	getHashesPerSec(): number;
	generateVerificationTweet(twitter: string): Promise<string>;
	getPerlinThresholds(): [number, number, number];
	getHashConfig(): HashConfig;
	getViewport(): Viewport;
	getPlanetMap(): Map<LocationId, Planet>;
	getArtifactMap(): Map<ArtifactId, Artifact>;
	getMyPlanetMap(): Map<LocationId, Planet>;
	getMyArtifactMap(): Map<ArtifactId, Artifact>;
	getTerminal(): TerminalHandle | undefined;
	get contractConstants(): ContractConstants;
	getSpaceJunkEnabled(): boolean;
	get captureZonesEnabled(): boolean;
	get manualSpawnEnabled(): boolean;
	get targetPlanetsEnabled(): boolean;
	potentialCaptureScore(planetLevel: number): number;
	getDefaultSpaceJunkForPlanetLevel(level: number): number;
	getPerlinConfig(isBiome?: boolean): PerlinConfig;
	/**
	 * Gets a reference to the game's internal representation of the world state. Beware! Use this for
	 * reading only, otherwise you might mess up the state of the game. You can try modifying the game
	 * state in some way
	 */
	getGameObjects(): GameObjects;
	private updatePlanets;
	private updateMouseHoveringOverCoords;
	private onEmitInitializedPlayer;
	private onEmitInitializedPlayerError;
	getGameManager(): GameManager;
	private setModalManager;
	getModalManager(): ModalManager;
	/**
	 * If there is a planet being hovered over, returns whether or not it's being hovered
	 * over in the renderer.
	 */
	getPlanetHoveringInRenderer(): boolean;
	getRenderer(): Renderer | null;
	getPaused(): boolean;
	getPaused$(): Monomitter<boolean>;
	getGameStarted(): boolean;
	getGameover(): boolean;
	getGameover$(): Monomitter<boolean>;
	getPlayerMoves(addr: EthAddress): number;
	getWinners(): EthAddress[];
	getGameDuration(): number;
	getClaimVictoryPercentage(): number;
	getSilverScoreValue(): number;
	getArtifactPointValues(): import("@darkforest_eth/types").ArtifactPointValues;
	getCaptureZonePointValues(): [
		number,
		number,
		number,
		number,
		number,
		number,
		number,
		number,
		number,
		number
	];
	getArtifactUpdated$(): Monomitter<ArtifactId>;
	getUIEmitter(): UIEmitter;
	/**
	 * @returns - A wrapper class for the WebGL2RenderingContext.
	 */
	getGlManager(): GameGLManager | null;
	/**
	 * @returns the CanvasRenderingContext2D for the game canvas.
	 */
	get2dRenderer(): CanvasRenderingContext2D | null;
	/**
	 * Replaces the current renderer with the passed in custom renderer and adds the renderer
	 * to the rendering stack. The function will automatically determine which renderer it is
	 * by the rendererType and the methods in the renderer.
	 * @param customRenderer - a Renderer that follows one of the 23 renderer tempaltes
	 */
	setCustomRenderer(customRenderer: BaseRenderer): void;
	/**
	 * This function will remove the passed in renderer from the renderering stack. If the
	 * renderer is on top of the renderering stack the next renderer will be the one bellow it.
	 * @param customRenderer - a Renderer that follows one of the 23 renderer tempaltes
	 */
	disableCustomRenderer(customRenderer: BaseRenderer): void;
}
export default GameUIManager;
