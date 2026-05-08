<script>
  import { getContext, onMount } from 'svelte'
  import { readdata, getGameStore, read } from '$lib/store'
  import { capitalise } from '$utils/string'
  
  import Locker from '$lib/components/Locker.svelte'
  import TMBox from '$lib/components/TMBox.svelte'
  import Tokens from '$lib/components/Tokens.svelte'
  import { Footer } from '$c/navs'
  import { Icon } from '$c/core'
  import { Box, Save } from '$icons'

  let subview = 'locker' // 'locker', 'tms', 'tokens'
  let money = 0

  onMount(() => {
    const [, , id] = readdata()
    const gameStore = getGameStore(id)
    gameStore.subscribe(read(d => {
      money = d.__money || 0
    }))
  })
</script>

<div class="container mx-auto max-w-6xl p-4 pt-20 pb-32">
  <div class="mb-8 rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900 border dark:border-gray-800">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-3xl font-bold flex items-center gap-x-3">
        <Icon icon={Save} class="text-blue-500" />
        Locker & Management
      </h1>
      <div class="text-2xl font-mono font-bold text-lime-600 dark:text-lime-400">
        ${money.toLocaleString()}
      </div>
    </div>

    <!-- Sub-navigation -->
    <div class="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-8">
      {#each ['locker', 'tms', 'tokens'] as view}
        <button 
          on:click={() => subview = view}
          class="flex-1 py-2.5 text-sm font-bold rounded-lg transition-all {subview === view ? 'bg-white shadow-sm text-blue-600 dark:bg-gray-700 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}"
        >
          {capitalise(view === 'tms' ? 'TMs' : view)}
        </button>
      {/each}
    </div>

    <div class="min-h-[500px]">
      {#if subview === 'locker'}
        <Locker />
      {:else if subview === 'tms'}
        <TMBox />
      {:else if subview === 'tokens'}
        <Tokens />
      {/if}
    </div>
  </div>
  
  <Footer />
</div>
