import * as tts from '@diffusionstudio/vits-web';
import TTSWorker from './TTSWorker.ts?worker';

// const VOICE = "en_US-hfc_female-medium";
const VOICE = "de_DE-thorsten-medium";

export async function downloadVoice(): Promise<void> {
	await tts.download(VOICE, (progress) => {
		console.log(`Downloading ${progress.url} - ${Math.round(progress.loaded * 100 / progress.total)}%`);
	});
}

interface TTSItem {
	text: string;
	audio?: Blob; // Optional audio blob if already generated
	shouldPlay?: boolean; // Flag to indicate if the audio should be played immediately
}

const queue: TTSItem[] = [];
let playing = false;
let generating = 0;
const worker = new TTSWorker();

worker.addEventListener('message', (event: MessageEvent<{ type: 'result', audio: Blob, text: string }>) => {
	if (event.data.type != 'result') return;

	// const audio = new Audio();
	// audio.src = URL.createObjectURL(event.data.audio);
	// audio.play();
	// console.log("Audio playing");
	// audio.onended = () => {
	// 	playing = false;
	// };
	const item = queue.find(item => item.text === event.data.text);
	if (item) {
		item.audio = event.data.audio; // Set the audio blob for the item
		generating--;
	}
});

setInterval(() => {
	// if(playing) return;
	// if(queue[0]) {
	// 	playing = true;
	// 	const text = queue.shift();
	// 	console.log("Speaking:", text);
	// 	if(text) {
	// 		// tts.predict({
	// 		// 	text,
	// 		// 	voiceId: VOICE,
	// 		// }).then((wav) => {
	// 		// 	const audio = new Audio();
	// 		// 	audio.src = URL.createObjectURL(wav);
	// 		// 	audio.play();
	// 		// 	audio.onended = () => {
	// 		// 		playing = false;
	// 		// 	};
	// 		// }).catch((error) => {
	// 		// 	console.error("Error playing audio:", error);
	// 		// });
	// 		worker.postMessage({
	// 			type: 'init',
	// 			text,
	// 			voiceId: VOICE
	// 		});
	// 	}
	// }
	// Pregenerate audio one at a time
	if (generating != 0) return;
	for (const item of queue) {
		// Generate audio blob if it doesn't exist
		if (!item.audio) {
			generating++;
			console.log("Generating audio for:", item.text);
			worker.postMessage({
				type: 'init',
				text: item.text,
				voiceId: VOICE
			});
			item.audio = undefined; // Reset audio to undefined until generated
		}
	}
}, 100);

setInterval(() => {
	if (playing) return;
	if (queue.length === 0) return;

	for (const item of queue) {
		if (item.shouldPlay && item.audio) {
			playing = true;
			const audio = new Audio();
			audio.src = URL.createObjectURL(item.audio);
			audio.play();
			audio.onended = () => {
				playing = false;
			};
			queue.splice(queue.indexOf(item), 1); // Remove item from queue after playing
			return; // Exit after playing one item
		}
	}		
}, 100);

export function queueSpeech(text: string) {
	// const wav = await tts.predict({
	// 	text,
	// 	voiceId: VOICE,
	// });
	
	// const audio = new Audio();
	// audio.src = URL.createObjectURL(wav);
	// audio.play();
	if (queue.some(item => item.text === text)) {
		// console.warn("Text already in queue, not adding again:", text);
		return;
	}
	console.log("Queuing text for speech:", text);
	queue.push({
		text,
		shouldPlay: false
	});
}

export function speak(text: string) {
	const existingItem = queue.find(item => item.text === text);
	if (existingItem) {
		existingItem.shouldPlay = true;
	} else {
		console.warn("Adding new item to play immediately. Consider queuing instead!");
		queue.push({
			text,
			shouldPlay: true
		});
	}
}
