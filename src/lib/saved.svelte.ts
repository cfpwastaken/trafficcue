export const saved: Record<string, WorldLocation> = $state(
	JSON.parse(localStorage.getItem("saved") ?? "{}"),
);

export function saveLocations() {
	localStorage.setItem("saved", JSON.stringify(saved));
}
