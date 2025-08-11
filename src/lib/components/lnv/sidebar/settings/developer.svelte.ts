export function getDeveloperToggle() {
	const value = localStorage.getItem("developer");
	const state = $state({
		current: value == null ? "false" : value,
	});

	$effect(() => {
		localStorage.setItem("developer", state.current);
	});

	return state;
}
