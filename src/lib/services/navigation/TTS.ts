import { duck, unduck } from "tauri-plugin-duck-api";
import { invoke } from "@tauri-apps/api/core";

export let tts: "tauri" | "web" | null = null;

export async function initTTS() {
	if (window.__TAURI__) {
		console.log("Using Tauri TTS");
		tts = "tauri";
	} else {
		console.log("Using Web TTS");
		tts = "web";
	}
}

export default async function say(text: string) {
	if (!tts) {
		// alert("TTS not initialized");
		// console.error("TTS not initialized");
		await initTTS();
		// return;
	}
	duck();
	if (tts !== "web") {
		try {
			await invoke("plugin:tts|speak", { text });
		} catch (e) {
			console.error("Error speaking text", e);
			alert(e);
		}
	} else {
		const utterance = new SpeechSynthesisUtterance(text);
		utterance.lang = "de-DE";
		window.speechSynthesis.speak(utterance);
	}
	unduck();
}
