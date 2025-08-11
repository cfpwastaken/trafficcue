export function getDeveloperToggle() {
	const value = localStorage.getItem("developer")
	const state = $state({
		current: value == null ? false : value
	});

	$effect(() => {
		localStorage.setItem("developer", JSON.stringify(state.current));
	});

	return state;
}