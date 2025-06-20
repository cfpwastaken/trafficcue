export type View = {
	type: string;
	props?: Record<string, any>;
}

export const view = $state({
	current: { type: "main" } as View,
	history: [] as View[],
	back: () => {
		if (view.history.length > 0) {
			view.current = view.history.pop()!;
		} else {
			view.current = { type: "main" } as View; // Reset to main view if history is empty
		}
	},
	switch: (to: string, props?: Record<string, any>) => {
		if (view.current.type !== to) {
			view.history.push(view.current);
		}
		view.current = { type: to, props } as View;
	}
});

export const searchbar = $state({
	text: ""
})