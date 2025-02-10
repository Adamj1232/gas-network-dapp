<script lang="ts">
	import { writable } from 'svelte/store'

	export let currentStep = writable(0)

	const steps = [
		'',
		'Fetching gas predictions from GasNet',
		'Initiate transaction send to wallet',
		'Gas predictions written to the target chain'
	]
</script>

<div class="flex flex-col gap-1">
	{#each steps as step, index}
		{#if index > 0}
			<div class="flex items-start gap-3">
				<!-- Bullet and Line -->
				<div class="flex flex-col items-center">
					<div
						class="h-4 w-4 rounded-full border-2 border-gray-300"
						class:bg-red-500={$currentStep >= index}
						class:bg-transparent={$currentStep < index}
					></div>

					{#if index !== steps.length - 1}
						<div
							class="h-8 w-0.5"
							class:bg-red-500={$currentStep >= index}
							class:bg-gray-300={$currentStep < index}
						></div>
					{/if}
				</div>

				<!-- Step Text -->
				<span
					class="text-sm"
					class:text-gray-900={$currentStep >= index}
					class:text-gray-500={$currentStep < index}
				>
					{step}
				</span>
			</div>
		{/if}
	{/each}
</div>
