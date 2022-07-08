declare module "https://unpkg.com/htm/preact/standalone.module.js" {
	import { VNode } from "preact";
	import { StateUpdater } from "preact/hooks";

	type EffectCallback = () => void | (() => void);
	type Inputs = ReadonlyArray<unknown>;

	export function html(strings: TemplateStringsArray, ...values: any[]): VNode;
	export function render(tree: VNode, parent: HTMLElement): void;
	export function useEffect(effect: EffectCallback, inputs?: Inputs): void;
	export function useState<S>(initialState: S | (() => S)): [S, StateUpdater<S>];
	export function useState<S = undefined>(): [S | undefined, StateUpdater<S | undefined>];
}
