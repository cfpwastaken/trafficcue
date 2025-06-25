import type { TextToSpeechPlugin } from "@capacitor-community/text-to-speech";
import { Capacitor } from "@capacitor/core";
import Duck from "../DuckPlugin";

export let tts: TextToSpeechPlugin | "web" | null = null;

export async function initTTS() {
	if(Capacitor.isNativePlatform()) {
		console.log("Using Capacitor TTS");
		tts = (await import("@capacitor-community/text-to-speech")).TextToSpeech;
	} else {
		console.log("Using Web TTS");
		tts = "web";
	}
}

export default async function say(text: string) {
	if(!tts) {
		// alert("TTS not initialized");
		// console.error("TTS not initialized");
		await initTTS();
		// return;
	}
	console.log("A");
	Duck.duck();
	console.log("B");
	if(tts !== "web") {
		try {
			await tts?.speak({
				text: text,
				lang: "deu-default", // TODO: make this configurable
			});
			console.log("C");
		} catch (e) {
			console.error("Error speaking text", e);
			alert(e);
		}
	} else {
		const utterance = new SpeechSynthesisUtterance(text);
		utterance.lang = "de-DE";
		window.speechSynthesis.speak(utterance);
	}
	console.log("D");
	Duck.unduck();
	console.log("E");
}
