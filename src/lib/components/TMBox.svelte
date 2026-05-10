<script>
  import { getContext, onMount } from 'svelte'
  import tms from '$lib/data/tms.json'
  import { capitalise } from '$utils/string'
  import { Tooltip, PIcon } from '$c/core'
  import { readdata, getGameStore, read, patch, readBox } from '$lib/store'
  import TMCompatibilityModal from './TMCompatibilityModal.svelte'

  const tiers = [
    { id: 'tier0', name: 'Tier 0', desc: 'Momentum, 100/100, High Power Recoil', price: 8000 },
    { id: 'tier1', name: 'Tier 1', desc: '90/100 Elemental, 2-Stage Boosting', price: 4000 },
    { id: 'tier2', name: 'Tier 2', desc: 'Status, Weather, Hazards, High Power/Low Acc', price: 2000 },
    { id: 'tier3', name: 'Tier 3', desc: 'Other Utility', price: 1000 }
  ]

  let search = ''
  let money = 0
  let gameStore
  let inventory = {}
  let boxData = []

  const { getPkmns } = getContext('game')
  const { open } = getContext('simple-modal')

  onMount(async () => {
    const [, , id] = readdata()
    gameStore = getGameStore(id)
    gameStore.subscribe(read(async d => {
      money = d.__money || 0
      inventory = d.__items || {}
      
      const box = readBox(d)
      const e = await getPkmns(box.map((p) => p.pokemon))
      boxData = box.map((p) => ({ ...p, details: e[p.pokemon] }))
    }))
  })

  const buyTM = (tm, price) => {
    const itemId = `tm-${tm.alias || tm.name.toLowerCase().replace(/ /g, '-')}`
    
    if (inventory[itemId]) {
      open(TMCompatibilityModal, {
        moveName: tm.alias || tm.name.toLowerCase().replace(/ /g, '-'),
        box: boxData
      }, {
        styleWindow: { background: 'transparent' }
      })
      return
    }

    if (money < price) return window.alert(`Not enough money! This TM costs $${price.toLocaleString()}.`)
    if (!window.confirm(`Buy ${tm.name} TM for $${price.toLocaleString()}?`)) return

    gameStore.update(patch({
      __money: money - price,
      __items: {
        ...inventory,
        [itemId]: (inventory[itemId] || 0) + 1
      }
    }))
  }

  $: filteredTms = (tierId) => {
    const s = search.toLowerCase().trim()
    if (!s) return tms[tierId]
    return tms[tierId].filter(tm => 
      tm.name.toLowerCase().includes(s) ||
      tm.type.toLowerCase().includes(s) ||
      (tm.bp && tm.bp.toString() === s) ||
      (s === 'status' && tm.bp === 0)
    )
  }
</script>

<div class="tm-box p-4">
  <div class="mb-6 flex items-center justify-between gap-4">
    <div class="relative w-full max-w-md">
      <input
        type="text"
        bind:value={search}
        placeholder="Search TMs by name or type..."
        class="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
      />
    </div>
    <div class="flex items-center gap-x-6 text-sm font-bold">
      <div class="text-lime-600 dark:text-lime-400 font-mono tracking-tighter text-lg">
        ${money.toLocaleString()}
      </div>
      <div class="opacity-30">
        Total TMs: {Object.values(tms).reduce((acc, curr) => acc + curr.length, 0)}
      </div>
    </div>
  </div>

  <div class="space-y-8">
    {#each tiers as tier}
      {@const list = filteredTms(tier.id)}
      {#if list.length}
        <section>
          <div class="mb-4 flex items-baseline gap-x-3 border-b pb-2 dark:border-gray-700">
            <h3 class="text-xl font-bold text-blue-600 dark:text-blue-400">{tier.name}</h3>
            <span class="text-xs opacity-50">{tier.desc}</span>
          </div>

          <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
            {#each list as tm}
              {@const itemId = `tm-${tm.alias || tm.name.toLowerCase().replace(/ /g, '-')}`}
              {@const isOwned = inventory[itemId]}
              <button 
                on:click={() => buyTM(tm, tier.price)}
                class="group relative flex flex-col items-center rounded-xl border bg-white p-3 shadow-sm transition-all hover:scale-105 hover:shadow-md dark:bg-gray-800/50 cursor-pointer {isOwned ? 'border-blue-400 ring-1 ring-blue-400 dark:border-blue-500' : 'border-gray-100 dark:border-gray-800'}"
              >
                {#if isOwned}
                  <div class="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-[10px] shadow-sm z-10">
                    ✓
                  </div>
                {/if}
                <div class="relative mb-2 h-12 w-12 flex items-center justify-center">
                  <PIcon
                    type="item"
                    name="{tm.type.toLowerCase()}-tm"
                    class="h-10 w-10"
                  />
                </div>
                
                <span class="text-center text-[10px] font-bold leading-tight line-clamp-2 min-h-[2.5em] mb-1">
                  {tm.name}
                </span>

                <div class="flex items-center gap-x-1 opacity-60">
                   <span class="text-[8px] uppercase px-1 rounded-sm bg-gray-100 dark:bg-gray-700">
                     {tm.type}
                   </span>
                   {#if tm.bp > 0}
                     <span class="text-[8px] font-mono">{tm.bp} BP</span>
                   {/if}
                </div>

                <Tooltip>
                  <div class="p-2 space-y-1">
                    <div class="font-bold border-b pb-1 mb-1">{tm.name}</div>
                    <div>Type: {tm.type}</div>
                    {#if tm.bp > 0}<div>Power: {tm.bp}</div>{/if}
                    {#if tm.acc > 0}<div>Accuracy: {tm.acc}%</div>{/if}
                  </div>
                </Tooltip>
              </button>
            {/each}
          </div>
        </section>
      {/if}
    {/each}
  </div>
</div>

<style lang="postcss">
  .tm-box {
    animation: fadeIn 0.3s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
