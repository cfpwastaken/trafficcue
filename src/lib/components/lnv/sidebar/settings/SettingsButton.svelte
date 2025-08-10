<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import type { IconProps } from "@lucide/svelte";
	import type { Component } from "svelte";
	import { view } from "../../view.svelte";

	const { icon: Icon, text, view: viewName, onclick, disabled }: { icon: Component<IconProps>, text: string, view?: string, onclick?: () => void, disabled?: boolean } = $props();
</script>

<Button variant="secondary" style="width: 100%; height: 40px;" {disabled} onclick={() => {
	if(viewName) view.switch(viewName)
	if(onclick) onclick();
}}>
	<Icon />
	{text}
</Button>