<script>
  import { getContext, onMount } from 'svelte'
  import tms from '$lib/data/tms.json'
  import moves from '../../routes/assets/data/moves.json'
  import { Tooltip, PIcon } from '$c/core'
  import { readdata, getGameStore, read, readBox } from '$lib/store'
  import { getTmTiers, isRemovedTmAlias, purchasePatch } from '$lib/utils/economy'
  import TMCompatibilityModal from './TMCompatibilityModal.svelte'

  let search = ''
  let money = 0
  let gameStore
  let inventory = {}
  let boxData = []
  let rawData = {}
  let tiers = getTmTiers()

  const { getPkmns } = getContext('game')
  const { open } = getContext('simple-modal')

  const moveKey = (value = '') => String(value).toLowerCase().replace(/[^a-z0-9]/g, '')
  const moveRef = (tm) => moves[moveKey(tm.alias)] || moves[moveKey(tm.name)] || tm
  const statValue = (value, fallback = '--') => {
    if (value === true || value === 0 || value === null || typeof value === 'undefined') return fallback
    return value
  }
  const categoryLabel = (tm) => moveRef(tm).category || tm.category
  const powerLabel = (tm) => statValue(moveRef(tm).basePower ?? tm.bp)
  const accuracyLabel = (tm) => statValue(moveRef(tm).accuracy ?? tm.acc)
  const ppLabel = (tm) => moveRef(tm).pp ?? tm.pp

  onMount(async () => {
    const [, , id] = readdata()
    gameStore = getGameStore(id)
    gameStore.subscribe(read(async d => {
      rawData = d
      money = d.__money || 0
      inventory = d.__items || {}
      tiers = getTmTiers(d)
      
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

    gameStore.update(() => JSON.stringify(purchasePatch(rawData, {
      id: itemId,
      name: `${tm.name} TM`,
      price,
      type: 'tm'
    }, 1, {
      source: 'tm-box',
      itemId,
      itemName: `${tm.name} TM`,
      itemType: 'tm'
    })))
  }

  $: filteredTms = (tierId) => {
    const s = search.toLowerCase().trim()
    const availableTms = (tms[tierId] || []).filter((tm) => !isRemovedTmAlias(tm.alias || tm.name))
    if (!s) return availableTms
    const tier = tiers.find((it) => it.id === tierId)
    return availableTms.filter((tm) => {
      const fields = [
        tm.tm,
        tm.name,
        tm.alias,
        tm.type,
        tm.category,
        tm.tier,
        tier?.name,
        tier?.desc,
        `tier ${tm.tier?.replace('tier', '')}`,
        `${tm.bp} bp`,
        `${tm.acc} accuracy`,
        `${tm.pp} pp`
      ]
      return fields.some((field) => String(field || '').toLowerCase().includes(s))
    })
  }

  $: totalVisibleTms = Object.values(tms)
    .flat()
    .filter((tm) => !isRemovedTmAlias(tm.alias || tm.name)).length
</script>

<div class="tm-box p-4">
  <div class="mb-6 flex items-center justify-between gap-4">
    <div class="relative w-full max-w-md">
      <input
        type="text"
        bind:value={search}
        placeholder="Search TMs by number, name, type, category, or tier..."
        class="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
      />
    </div>
    <div class="flex items-center gap-x-6 text-sm font-bold">
      <div class="text-lime-600 dark:text-lime-400 font-mono tracking-tighter text-lg">
        ${money.toLocaleString()}
      </div>
      <div class="opacity-30">
        Total TMs: {totalVisibleTms}
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
                  <span class="block text-[8px] font-mono text-gray-400">{tm.tm}</span>
                  {tm.name}
                </span>

                <div class="flex flex-wrap items-center justify-center gap-1 opacity-60">
                   <span class="text-[8px] uppercase px-1 rounded-sm bg-gray-100 dark:bg-gray-700">
                     {tm.type}
                   </span>
                   <span class="text-[8px] uppercase px-1 rounded-sm bg-gray-100 dark:bg-gray-700">
                     {categoryLabel(tm)}
                   </span>
                   {#if tm.bp > 0}
                     <span class="text-[8px] font-mono">{powerLabel(tm)} BP</span>
                   {/if}
                </div>

                <Tooltip>
                  <div class="space-y-1 p-2 text-left text-xs">
                    <div class="mb-1 border-b pb-1 font-bold">{tm.tm} {tm.name}</div>
                    <div>Type: {tm.type}</div>
                    <div>Category: {categoryLabel(tm)}</div>
                    <div>Power: {powerLabel(tm)}</div>
                    <div>Accuracy: {accuracyLabel(tm)}</div>
                    <div>PP: {ppLabel(tm)}</div>
                    <div>Tier: {tm.tier?.replace('tier', 'Tier ')}</div>
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
