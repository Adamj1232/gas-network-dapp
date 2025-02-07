<script lang="ts">
    import { writable } from 'svelte/store'

    export let currentStep = writable(0)
    
    const steps = [
      '',
        'Fetching gas predictions from GasNet',
        'Initiate transaction send to wallet',
        'Gas predictions written to the target chain',
        // 'Reading gas predictions from the target chain'
    ]
</script>

<div class="flex flex-col gap-1">
    {#each steps as step, index}
        {#if index > 0}
        <div class="flex items-start gap-3">
            <!-- Bullet and Line -->
            <div class="flex flex-col items-center">
                <div class={`
                    h-4 w-4 rounded-full border-2 border-gray-300
                    ${$currentStep >= index 
                        ? 'bg-red-500' 
                        : 'bg-transparent'}
                `}></div>
                {#if index !== steps.length - 1}
                    <div class={`h-8 w-0.5 ${$currentStep >= index 
                        ? 'bg-red-500' 
                        : 'bg-gray-300'}`}></div>
                {/if}
            </div>
            
            <!-- Step Text -->
            <span class={`text-sm ${$currentStep >= index ? 'text-gray-900' : 'text-gray-500'}`}>
                {step}
            </span>
        </div>
        {/if}
    {/each}
</div> 