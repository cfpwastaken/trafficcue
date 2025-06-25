import { registerPlugin, WebPlugin } from "@capacitor/core";

export interface DuckPlugin {
	duck: () => void;
	unduck: () => void;
}

class DuckWeb extends WebPlugin implements DuckPlugin {
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	duck(): void {}
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	unduck(): void {}
}

const Duck = registerPlugin<DuckPlugin>("Duck", {
	web: new DuckWeb()
});

export default Duck;