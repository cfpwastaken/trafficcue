<script lang="ts">
	let { lane }: { lane: Lane } = $props();
	const knownDirections = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024];

  async function fetchImage(bit: number) {
    if (knownDirections.includes(bit)) {
      return await fetch(`/img/lanes/${bit}.svg`).then(res => res.text());
    } else {
      return `<span>${bit}</span>`;
    }
  }

  function loadImage(node: HTMLElement, bit: number) {
    fetchImage(bit).then(img => {
      node.innerHTML = img;
    });
  }
</script>

<div class="lane">
	{#each Array(10).fill(0).map((_, i) => 1 << i) as bit}
		{#if lane.directions & bit}
			<div
				class="lane-image {lane.valid & bit ? 'valid' : ''} {lane.active & bit ? 'active' : ''}"
				use:loadImage={bit}
			></div>
		{/if}
	{/each}
</div>

<style>
	.lane {
		display: flex;
	}

	:global(.lane svg) {
		width: 30px;
	}

	:global(.lane svg path) {
		stroke: #6b6b6b;
		stroke-width: 3;
	}

	:global(.lane .active svg path) {
		stroke: #fff;
	}

	:global(.lane .valid svg path) {
		stroke: #c0c0c0;
	}

	:global(.lane-image > span) {
		font-size: 1rem;
		font-weight: bold;
		color: #812020;
	}

	:global(.lane-image.active > span) {
		font-size: 1rem;
		font-weight: bold;
		color: #ff0000;
	}

	:global(.lane-image.valid > span) {
		font-size: 1rem;
		font-weight: bold;
		color: #cc2c2c;
	}
</style>