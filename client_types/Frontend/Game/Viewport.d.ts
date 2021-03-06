import { CanvasCoords, Chunk, DiagnosticUpdater, Planet, WorldCoords } from '@darkforest_eth/types';
import GameUIManager from '../../Backend/GameLogic/GameUIManager';
export declare const getDefaultScroll: () => number;
declare type ViewportData = {
    widthInWorldUnits: number;
    centerWorldCoords: WorldCoords;
};
declare class Viewport {
    static instance: Viewport | undefined;
    centerWorldCoords: WorldCoords;
    widthInWorldUnits: number;
    heightInWorldUnits: number;
    viewportWidth: number;
    viewportHeight: number;
    isPanning: boolean;
    mouseLastCoords: CanvasCoords | undefined;
    canvas: HTMLCanvasElement;
    isFirefox: boolean;
    gameUIManager: GameUIManager;
    mousedownCoords: CanvasCoords | undefined;
    velocity: WorldCoords | undefined;
    momentum: boolean;
    mouseSensitivity: number;
    intervalId: ReturnType<typeof setTimeout>;
    frameRequestId: number;
    diagnosticUpdater?: DiagnosticUpdater;
    scale: number;
    private isSending;
    private constructor();
    setDiagnosticUpdater(diagnosticUpdater: DiagnosticUpdater): void;
    onSendInit(): void;
    onSendComplete(): void;
    get minWorldWidth(): number;
    get maxWorldWidth(): number;
    getViewportPosition(): {
        x: number;
        y: number;
    };
    getBottomBound(): number;
    getLeftBound(): number;
    getTopBound(): number;
    getRightBound(): number;
    getViewportWorldWidth(): number;
    getViewportWorldHeight(): number;
    setMouseSensitivty(mouseSensitivity: number): void;
    static getInstance(): Viewport;
    static destroyInstance(): void;
    static initialize(gameUIManager: GameUIManager, widthInWorldUnits: number, canvas: HTMLCanvasElement): Viewport;
    onResize(): void;
    private getStorageKey;
    getStorage(): ViewportData | undefined;
    setStorage(): void;
    setData(data: ViewportData): void;
    centerPlanet(planet: Planet | undefined): void;
    zoomPlanet(planet?: Planet, radii?: number): void;
    centerCoords(coords: WorldCoords): void;
    centerChunk(chunk: Chunk): void;
    zoomIn(): void;
    zoomOut(): void;
    onMouseDown(canvasCoords: CanvasCoords): void;
    onMouseMove(canvasCoords: CanvasCoords): void;
    onMouseUp(canvasCoords: CanvasCoords): void;
    onMouseOut(): void;
    onScroll(deltaY: number, forceZoom?: boolean): void;
    onWindowResize(): void;
    canvasToWorldCoords(canvasCoords: CanvasCoords): WorldCoords;
    worldToCanvasCoords(worldCoords: WorldCoords): CanvasCoords;
    worldToCanvasDist(d: number): number;
    canvasToWorldDist(d: number): number;
    private worldToCanvasX;
    private canvasToWorldX;
    private worldToCanvasY;
    private canvasToWorldY;
    isInOrAroundViewport(coords: WorldCoords): boolean;
    isInViewport(coords: WorldCoords): boolean;
    intersectsViewport(chunk: Chunk): boolean;
    private isValidWorldWidth;
    private setWorldWidth;
    setWorldHeight(height: number): void;
    private updateDiagnostics;
}
export default Viewport;
