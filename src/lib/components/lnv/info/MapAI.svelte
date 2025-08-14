<script lang="ts">
	import { m } from "$lang/messages";
	import Input from "$lib/components/ui/input/input.svelte";
	import { ai } from "$lib/services/lnv";
	import { SparklesIcon } from "@lucide/svelte";

	let { lat, lon } = $props();
	let question = $state("");

	function getText(res: string) {
		console.log("Response from MapAI:", res);
		const chunks = res.split("\n");
		let text = "";
		for (const chunk of chunks) {
			if (chunk.startsWith("0:")) {
				text += JSON.parse(chunk.substring(2).trim());
			}
		}
		return text;
	}
</script>

<div class="flex gap-2 mt-2 p-2 border-border border-solid border-2 rounded-lg">
	<SparklesIcon />
	<div class="flex gap-2 flex-col w-full">
		{#await ai(question, { lat, lon })}
			<p>{m.loading()}</p>
		{:then data}
			{@const text = getText(data)}
			<p>{text}</p>
		{:catch error}
			<p>{m.error()}: {error.message}</p>
		{/await}
		<Input
			type="text"
			value=""
			placeholder={m["sidebar.mapai.ask-question"]()}
			onchange={(e) => {
				question = (e.target! as HTMLInputElement).value;
			}}
		/>
	</div>
</div>
