type OnboardingState = "start" | "vehicles" | "end";

export function getOnboardingState(): OnboardingState {
	const value = localStorage.getItem("onboarding") as OnboardingState;
	return value ?? "start";
}

export function setOnboardingState(value: OnboardingState) {
	localStorage.setItem("onboarding", value);
}

export function getOnboardingView(def: string) {
	if (!window.__TAURI__) return def;
	const state = getOnboardingState();
	return state == "start"
		? "onboarding"
		: state == "vehicles"
			? "onboarding-vehicles"
			: def;
}
