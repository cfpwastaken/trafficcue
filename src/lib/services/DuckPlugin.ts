import { registerPlugin } from "@capacitor/core";

export interface DuckPlugin {
	duck: () => void;
	unduck: () => void;
}

const Duck = registerPlugin<DuckPlugin>("Duck");

export default Duck;