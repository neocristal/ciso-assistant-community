<script lang="ts">
	import Anchor from '$lib/components/Anchor/Anchor.svelte';

	interface Props {
		title: any;
		desc: any;
		link: any;
		tags?: string[];
	}

	let { title, desc, link, tags = [] }: Props = $props();
</script>

<article
	class="hover:animate-background rounded-xl bg-linear-to-r from-green-300 via-blue-500 to-purple-600 p-0.5 shadow-xl transition hover:bg-size-[400%_400%] hover:shadow-xs hover:[animation-duration:4s]"
>
	<Anchor href={link}>
		<div class="rounded-[10px] bg-white p-4 pt-20! sm:p-6 h-full">
			<div class="block text-xs text-gray-500 min-h-10 flex items-end">{desc}</div>

			<h3 class="mt-0.5 text-lg font-medium text-gray-900">
				{title}
			</h3>

			<div class="mt-4 flex flex-wrap gap-1">
				{#each tags as tag}
					<span
						class="whitespace-nowrap rounded-full bg-purple-100 px-2.5 py-0.5 text-xs text-purple-600"
					>
						{tag}
					</span>
				{/each}
			</div>
		</div>
	</Anchor>
</article>
