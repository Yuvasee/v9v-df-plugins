/// <reference types="node" />
import { EventEmitter } from 'events';
import GameUIManager from './GameUIManager';
export declare const enum TutorialManagerEvent {
    StateChanged = "StateChanged"
}
export declare const enum TutorialState {
    None = 0,
    SendFleet = 1,
    SpaceJunk = 2,
    Spaceship = 3,
    Deselect = 4,
    HowToGetScore = 5,
    ZoomOut = 6,
    MinerMove = 7,
    MinerPause = 8,
    Terminal = 9,
    AlmostCompleted = 10,
    Completed = 11
}
declare class TutorialManager extends EventEmitter {
    static instance: TutorialManager;
    private tutorialState;
    private uiManager;
    private constructor();
    static getInstance(uiManager: GameUIManager): TutorialManager;
    private setTutorialState;
    private advance;
    private shouldSkipState;
    reset(): void;
    complete(): void;
    acceptInput(state: TutorialState): void;
}
export default TutorialManager;
