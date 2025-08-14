<script lang="ts">
	import { m } from "$lang/messages";
	import * as Avatar from "$lib/components/ui/avatar";
	import { Button } from "$lib/components/ui/button";
	import { getReviews, postReview } from "$lib/services/lnv";
	import Stars from "./Stars.svelte";

	let { lat, lng }: { lat: number; lng: number } = $props();
</script>

<h3 class="text-lg font-bold mt-2">{m["sidebar.info.reviews"]()}</h3>
{#await getReviews({ lat, lon: lng }) then reviews}
	{#if reviews.length > 0}
		<ul class="list-disc pl-5">
			{#each reviews as review (review)}
				<li class="flex justify-center gap-2 mb-2 flex-col">
					<div class="flex items-center gap-2">
						<Avatar.Root>
							<!-- <Avatar.Image src="https://github.com/shadcn.png" alt="@shadcn" /> -->
							<Avatar.Fallback>{review.username}</Avatar.Fallback>
						</Avatar.Root>
						<Stars rating={review.rating} />
					</div>
					<span>{review.comment}</span>
				</li>
			{/each}
		</ul>
	{:else}
		<p>{m["sidebar.info.no-reviews"]()}</p>
	{/if}
	<Button
		variant="secondary"
		onclick={async () => {
			const rating = prompt("Enter your rating (1-5):");
			const comment = prompt("Enter your review comment:");
			if (rating && comment) {
				console.log(`Rating: ${rating}, Comment: ${comment}`);
				await postReview(
					{ lat, lon: lng },
					{
						rating: parseInt(rating, 10),
						comment,
					},
				);
				alert("Thank you for your review!");
			} else {
				alert("Review submission cancelled.");
			}
		}}
		disabled>{m["sidebar.info.write-review"]()}</Button
	><br />
{:catch error}
	<p>{m.error()}: {error.message}</p>
{/await}
