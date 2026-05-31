<script>
  import { getContext, onMount } from 'svelte'
  import { readdata, getGameStore, read } from '$lib/store'
  import { getEconomyConfig, tokenPurchasePatch } from '$lib/utils/economy'
  import { Button, Icon } from '$c/core'
  import { Plus } from '$icons'

  let tokens = 0
  let money = 0
  let loading = true
  let gameStore
  let rawData = {}
  let tokenPrice = 500

  onMount(() => {
    const [, , id] = readdata()
    gameStore = getGameStore(id)
    gameStore.subscribe(
      read((data) => {
        rawData = data
        tokens = data.__encounterTokens || 0
        money = data.__money || 0
        tokenPrice = getEconomyConfig(data).tokenPrice
        loading = false
      })
    )
  })

  const buyToken = () => {
    if (money < tokenPrice) return window.alert(`Not enough money! Each token costs $${tokenPrice.toLocaleString()}.`)
    if (!window.confirm(`Buy an Extra Encounter Token for $${tokenPrice.toLocaleString()}?`)) return

    gameStore.update(() => JSON.stringify(tokenPurchasePatch(rawData, tokenPrice, 1, 'tokens')))
  }
</script>

<div class="tokens p-4">
  <div class="mb-6 border-b pb-2 dark:border-gray-700">
    <h3 class="text-xl font-bold">Encounter Tokens</h3>
    <p class="text-sm opacity-50 text-gray-500">Spend tokens to get extra encounters on routes you've already rolled.</p>
  </div>

  {#if loading}
    <div class="py-12 text-center opacity-50">Loading tokens...</div>
  {:else}
    <div class="flex flex-col items-center justify-center py-12 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
      <div class="relative mb-6">
        <div class="text-8xl">🎟️</div>
        <div class="absolute -top-2 -right-4 flex h-12 w-12 items-center justify-center rounded-full bg-lime-500 text-xl font-black text-white shadow-lg">
          {tokens}
        </div>
      </div>
      
      <h4 class="text-2xl font-bold mb-2">Available Tokens</h4>
      <p class="text-gray-500 mb-8 max-w-xs text-center">You have {tokens} tokens remaining. Each extra roll on a route costs 1 token.</p>
      
      <div class="flex flex-col items-center gap-y-4">
        <Button solid rounded class="px-8 py-3 text-lg" on:click={buyToken}>
          <Icon icon={Plus} inline class="mr-2" />
          Buy Extra Token (${tokenPrice.toLocaleString()})
        </Button>
        <span class="text-sm font-medium text-lime-600 dark:text-lime-400">Current Balance: ${money.toLocaleString()}</span>
      </div>
    </div>
  {/if}
</div>
