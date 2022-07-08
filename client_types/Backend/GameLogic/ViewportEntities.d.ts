import { Chunk, LocatablePlanet, LocationId, PlanetRenderInfo, WorldCoords } from '@darkforest_eth/types';
import GameManager from './GameManager';
import GameUIManager from './GameUIManager';
/**
 * Efficiently calculates which planets are in the viewport, and allows you to find the nearest
 * visible planet to the mouse.
 */
export declare class ViewportEntities {
    private readonly gameManager;
    private readonly uiManager;
    private cachedExploredChunks;
    private cachedPlanets;
    constructor(gameManager: GameManager, gameUIManager: GameUIManager);
    startRefreshing(): void;
    getPlanetsAndChunks(): {
        chunks: Set<Chunk>;
        cachedPlanets: Map<LocationId, PlanetRenderInfo>;
    };
    private updateLocationsAndChunks;
    private recalculateViewportChunks;
    private loadPlanetMessages;
    private recalculateViewportPlanets;
    private replacePlanets;
    /**
     * Gets the planet that is closest to the given coordinates. Filters out irrelevant planets
     * using the `radiusMap` parameter, which specifies how close a planet must be in order to
     * be returned from this function, given that planet's level. Smaller planets have a smaller
     * radius, and larger planets have a larger radius.
     *
     * If a smaller and a larger planet are both within respective radii of coords, the smaller
     * planet is returned.
     */
    getNearestVisiblePlanet(coords: WorldCoords): LocatablePlanet | undefined;
    /**
     * One entry per planet level - radius in screen pixels of that planet level given the current
     * viewport configuration, as well as the world radius.
     */
    private getPlanetRadii;
    /**
     * Returns a list of planet levels which, when rendered, would result in a planet that has a size
     * larger than one pixel.
     */
    private getVisiblePlanetLevels;
}
