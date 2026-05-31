<script>
  import { getContext, onMount } from 'svelte'
  import { readdata, getGameStore, read, readBox, readStarter } from '$lib/store'
  import { Expanded as Games } from '$lib/data/games.js'
  import { fetchRoute } from '$lib/utils/fetchers.js'
  import { PIcon, Button, Icon } from '$c/core'
  import { Gift } from '$icons'
  import {
    addTransaction,
    STORE_ITEMS,
    getEconomyConfig,
    getSpecialEncounters,
    getStoreItems,
    purchasePatch,
    tokenPurchasePatch
  } from '$lib/utils/economy'

  let storeItems = STORE_ITEMS

  let specialEncounters = []

  let gameStore,
    rawData,
    boxData = [],
    money = 0,
    inventory = {}
  const { getPkmns, getLeague } = getContext('game')
  let loading = true
  let isHardcore = false

  onMount(() => {
    const [, gameKey, id] = readdata()
    isHardcore = gameKey?.endsWith('_hard') || gameKey?.includes('_hard')

    gameStore = getGameStore(id)
    gameStore.subscribe(
      read(async (data) => {
        rawData = data
        money = data.__money || 0
        inventory = data.__items || {}
        storeItems = getStoreItems(data).map((item) =>
          item.id === 'rare-candy'
            ? {
                ...item,
                description: isHardcore
                  ? 'Instantly levels a Pokemon up by 1 level.'
                  : 'Instantly levels a Pokemon up to the current level cap.'
              }
            : item
        )
        specialEncounters = getSpecialEncounters(data)

        const box = readBox(data)
        const e = await getPkmns(box.map((p) => p.pokemon))
        boxData = box.map((p) => ({ ...p, details: e[p.pokemon] }))
        loading = false
      })
    )
  })

  const getActiveLevelCap = async () => {
    if (!rawData) return 100
    const [, gameKey] = readdata()
    if (!gameKey) return 100

    const starter = readStarter(rawData)
    try {
      const [league, routeData] = await Promise.all([
        getLeague(gameKey, starter),
        fetchRoute(Games[gameKey]?.pid || gameKey)
      ])

      if (!routeData || !league) return 100

      const defeatedBosses = new Set((rawData.__teams || []).map((t) => t.id))
      let maxCap = 5

      const KANTO_EARLY_CAPS = {
        'joey1': 5, 'joey1_hard': 5,
        'kylie1': 6, 'kylie1_hard': 6,
        'maven1': 7, 'maven1_hard': 7,
        'wilson1': 8, 'wilson1_hard': 8,
        'jerome1': 9, 'jerome1_hard': 9,
        'joel1': 10, 'joel1_hard': 10,
        'b1': 11, 'b1_hard': 11
      }

      for (const p of routeData) {
        if (p.type === 'route' && p.cap) {
          maxCap = Math.max(maxCap, p.cap)
        } else if (p.type === 'gym') {
          const bossData = league[p.value]
          let bossCap = 0
          if (KANTO_EARLY_CAPS[p.value] !== undefined) {
            bossCap = KANTO_EARLY_CAPS[p.value]
          } else if (bossData) {
            bossCap = bossData.lvlCap ?? (bossData.pokemon ? bossData.pokemon.reduce(
              (acc, it) => Math.max(acc, parseInt(it.level) || 0),
              0
            ) : 0)
          }
          if (bossCap > 0) {
            maxCap = Math.max(maxCap, bossCap)
          }
          if (!defeatedBosses.has(p.value)) {
            // Undefeated boss! Break loop.
            break
          }
        }
      }
      return maxCap
    } catch (e) {
      console.error('Error calculating active level cap:', e)
      return 100
    }
  }

  const buyRareCandy = async (monId, currentLevel) => {
    const price = getEconomyConfig(rawData).rareCandyPrice
    if (money < price) return window.alert('Not enough money!')

    const [, gameKey] = readdata()
    const isHard = gameKey?.endsWith('_hard') || gameKey?.includes('_hard')

    if (isHard) {
      if (!window.confirm(`Buy Rare Candy for $${price.toLocaleString()}?`)) return
      const nextLevel = (currentLevel || 0) + 1
      gameStore.update(() => JSON.stringify(addTransaction({
        ...rawData,
        __money: money - price,
        [monId]: { ...rawData[monId], level: nextLevel }
      }, {
        kind: 'consume',
        source: 'store',
        itemId: 'rare-candy',
        itemName: 'Rare Candy',
        itemType: 'item',
        quantity: 1,
        unitPrice: price,
        total: price,
        moneyBefore: money,
        moneyAfter: money - price,
        target: monId,
        levelBefore: currentLevel || 0,
        levelAfter: nextLevel,
        refundable: false
      })))
    } else {
      const cap = await getActiveLevelCap()
      const lvl = currentLevel || 0
      if (lvl >= cap) {
        return window.alert(`This Pokemon is already at or above the current level cap (Lv. ${cap})!`)
      }
      if (!window.confirm(`Buy Rare Candy for $${price.toLocaleString()} to level up to the level cap (Lv. ${cap})?`)) return
      gameStore.update(() => JSON.stringify(addTransaction({
        ...rawData,
        __money: money - price,
        [monId]: { ...rawData[monId], level: cap }
      }, {
        kind: 'consume',
        source: 'store',
        itemId: 'rare-candy',
        itemName: 'Rare Candy',
        itemType: 'item',
        quantity: 1,
        unitPrice: price,
        total: price,
        moneyBefore: money,
        moneyAfter: money - price,
        target: monId,
        levelBefore: lvl,
        levelAfter: cap,
        refundable: false
      })))
    }
  }

  import TypePicker from '$lib/components/TypePicker.svelte'
  const { open } = getContext('simple-modal')

  const buyItem = (item) => {
    if (money < item.price) return window.alert('Not enough money!')

    if (item.id === 'type-gem' || item.id === 'z-crystal') {
      open(TypePicker, {
        title: `Select ${item.name} Type`,
        onSelect: (type) => {
          const typeId = type.toLowerCase()
          const finalId = item.id === 'type-gem' ? `${typeId}-gem` : `${typeId}ium-z`
          const finalName = item.id === 'type-gem' ? `${type} Gem` : `${type}ium Z`
          
          if (window.confirm(`Buy ${finalName} for $${item.price}?`)) {
            gameStore.update(() => JSON.stringify(purchasePatch(rawData, item, 1, {
              source: 'store',
              itemId: finalId,
              itemName: finalName,
              itemType: 'held'
            })))
          }
        }
      }, {
        closeButton: true,
        styleWindow: { background: 'transparent' }
      })
      return
    }

    if (!window.confirm(`Buy ${item.name} for $${item.price}?`)) return

    if (item.id === 'encounter-token') {
      gameStore.update(() => JSON.stringify(tokenPurchasePatch(rawData, item.price, 1, 'store')))
      return
    }

    gameStore.update(() => JSON.stringify(purchasePatch(rawData, item, 1, {
      source: 'store',
      itemType: item.type
    })))
  }

  const buyPokemon = (item) => {
    if (money < item.price) return window.alert('Not enough money!')
    if (!window.confirm(`Buy ${item.name} for $${item.price}?`)) return

    const location = `Store: ${item.name}`
    gameStore.update(() => JSON.stringify(addTransaction({
      ...rawData,
      __money: money - item.price,
      [location]: {
          pokemon: item.pokemon,
          location: location,
          status: 1 // Caught
        }
    }, {
      kind: 'purchase',
      source: 'store',
      itemId: item.id,
      itemName: item.name,
      itemType: 'encounter',
      quantity: 1,
      unitPrice: item.price,
      total: item.price,
      moneyBefore: money,
      moneyAfter: money - item.price,
      refundable: false
    })))
  }

  const getItemImage = (id) => {
    const mapping = {
      'encounter-token': 'pass',
      'z-crystal': 'normalium-z',
      'mega-stone': 'key-stone',
      'type-gem': 'normal-gem',
      'tm-earthquake': 'ground-tm',
      'tm-u-turn': 'bug-tm',
      'tm-volt-switch': 'electric-tm',
      'tm-flip-turn': 'water-tm',
      'tm-flare-blitz': 'fire-tm',
      'tm-close-combat': 'fighting-tm',
      'tm-brave-bird': 'flying-tm',
      'tm-knock-off': 'dark-tm',
      'tier-1-tms': 'normal-tm',
      'tier-2-tms': 'normal-tm',
      'tier-3-tms': 'normal-tm',
      'evolution-stone': 'everstone',
      'weather-stone': 'smooth-rock',
      'type-resist-berry': 'enigma-berry',
      'terrain-seed': 'grassy-seed',
      'standard-bottle-cap': 'bottle-cap',
      'nature-mint': 'neutral-mint',
      'vitamin': 'hp-up'
    }

    const name = mapping[id] || id
    return `/assets/img/items/${name}.png`
  }

  $: heldItems = storeItems.filter((item) => item.type === 'held')
  $: keyItems = storeItems.filter((item) => item.type === 'key-item')
  $: tms = storeItems.filter((item) => item.type === 'tm')
  $: generalItems = storeItems.filter((item) => ['item', 'service', 'special'].includes(item.type) && item.id !== 'encounter-token')
  $: tokenItem = storeItems.find((item) => item.id === 'encounter-token')
</script>

<div class="container mx-auto max-w-4xl p-4 pt-8 pb-32 md:pt-16">
  <div class="mb-8 rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
    <div class="mb-8 flex items-center justify-between">
      <h1 class="inline-flex items-center gap-x-4 text-3xl font-bold">
        <Icon icon={Gift} inline class="scale-125 transform" /> Store
      </h1>
      <div
        class="text-2xl font-bold tracking-wider text-lime-600 dark:text-lime-400"
      >
        ${money.toLocaleString()}
      </div>
    </div>

    <div class="grid gap-6">
      <!-- Encounter Token -->
      {#if tokenItem}
      <div
        class="flex flex-col justify-between rounded-lg border-2 border-gray-200 p-6 dark:border-gray-700 bg-lime-50/20 dark:bg-lime-900/10"
      >
        <div class="flex gap-x-4">
          <div class="shrink-0">
            <img
              src={getItemImage('encounter-token')}
              alt="Token"
              class="h-12 w-12 object-contain"
              on:error={(e) => (e.target.src = '/assets/img/items/pass.png')}
            />
          </div>
          <div>
            <h2 class="mb-2 text-xl font-bold">Extra Encounter Token</h2>
            <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Buy an extra encounter slot for any route. You currently have <strong
                class="text-lg text-lime-500"
                >{rawData?.__encounterTokens || 0}</strong
              > tokens.
            </p>
          </div>
        </div>
        <Button
          class="w-full"
          solid
          rounded
          on:click={() => buyItem(tokenItem)}
        >
          Buy for ${tokenItem.price.toLocaleString()}
        </Button>
      </div>
      {/if}

      <p class="text-gray-500 text-center italic text-sm">Select an item category below to browse the shop.</p>
    </div>
  </div>

  {#if keyItems.length}
    <div class="mb-8 rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
      <h2 class="mb-2 text-2xl font-bold">Key Items & Mechanics</h2>
      <p class="mb-6 text-sm text-gray-600 dark:text-gray-400">
        Unlock powerful multi-battle mechanics and permanent team upgrades.
      </p>

      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {#each keyItems as item}
          <div class="flex flex-col gap-y-3 rounded-lg border-2 border-gray-200 p-4 dark:border-gray-700">
            <div class="flex items-start justify-between gap-x-3">
              <div class="flex gap-x-3">
                <div class="shrink-0 pt-1">
                  <img src={getItemImage(item.id)} alt={item.name} class="h-10 w-10 object-contain" on:error={(e) => (e.target.src = '/assets/img/items/unknown-item.png')} />
                </div>
                <div>
                  <h3 class="font-bold">{item.name}</h3>
                  <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                </div>
              </div>
              <div class="shrink-0 text-right">
                <div class="font-bold text-lime-600 dark:text-lime-400">${item.price.toLocaleString()}</div>
                <div class="text-xs text-gray-500">Owned: {inventory[item.id] || 0}</div>
              </div>
            </div>
            <Button class="w-full" rounded on:click={() => buyItem(item)}>Buy {item.name}</Button>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <div class="mb-8 rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
    <h2 class="mb-2 text-2xl font-bold">Competitive Held Items</h2>
    <p class="mb-6 text-sm text-gray-600 dark:text-gray-400">
      Build out your team options with reusable battle items instead of consumables.
    </p>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {#each heldItems as item}
        <div class="flex flex-col gap-y-3 rounded-lg border-2 border-gray-200 p-4 dark:border-gray-700">
          <div class="flex items-start justify-between gap-x-3">
            <div class="flex gap-x-3">
              <div class="shrink-0 pt-1">
                <img src={getItemImage(item.id)} alt={item.name} class="h-10 w-10 object-contain" on:error={(e) => (e.target.src = '/assets/img/items/unknown-item.png')} />
              </div>
              <div>
                <h3 class="font-bold">{item.name}</h3>
                <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
              </div>
            </div>
            <div class="shrink-0 text-right">
              <div class="font-bold text-lime-600 dark:text-lime-400">${item.price.toLocaleString()}</div>
              <div class="text-xs text-gray-500">Owned: {inventory[item.id] || 0}</div>
            </div>
          </div>
          <Button class="w-full" rounded on:click={() => buyItem(item)}>Buy {item.name}</Button>
        </div>
      {/each}
    </div>
  </div>

  {#if tms.length}
    <div class="mb-8 rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
      <h2 class="mb-2 text-2xl font-bold">Technical Machines (TMs)</h2>
      <p class="mb-6 text-sm text-gray-600 dark:text-gray-400">
        Expand your movepool with tiered access to high-power and utility moves.
      </p>

      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {#each tms as item}
          <div class="flex flex-col gap-y-3 rounded-lg border-2 border-gray-200 p-4 dark:border-gray-700">
            <div class="flex items-start justify-between gap-x-3">
              <div class="flex gap-x-3">
                <div class="shrink-0 pt-1">
                  <img src={getItemImage(item.id)} alt={item.name} class="h-10 w-10 object-contain" on:error={(e) => (e.target.src = '/assets/img/items/normal-tm.png')} />
                </div>
                <div>
                  <h3 class="font-bold">{item.name}</h3>
                  <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                </div>
              </div>
              <div class="shrink-0 text-right">
                <div class="font-bold text-lime-600 dark:text-lime-400">${item.price.toLocaleString()}</div>
                <div class="text-xs text-gray-500">Owned: {inventory[item.id] || 0}</div>
              </div>
            </div>
            <Button class="w-full" rounded on:click={() => buyItem(item)}>Buy {item.name}</Button>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  {#if generalItems.length}
    <div class="mb-8 rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
      <h2 class="mb-2 text-2xl font-bold">Items & Services</h2>
      <p class="mb-6 text-sm text-gray-600 dark:text-gray-400">
        Consumables, evolutionary tools, and professional trainer services.
      </p>

      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {#each generalItems as item}
          <div class="flex flex-col gap-y-3 rounded-lg border-2 border-gray-200 p-4 dark:border-gray-700">
            <div class="flex items-start justify-between gap-x-3">
              <div class="flex gap-x-3">
                <div class="shrink-0 pt-1">
                  <img src={getItemImage(item.id)} alt={item.name} class="h-10 w-10 object-contain" on:error={(e) => (e.target.src = '/assets/img/items/unknown-item.png')} />
                </div>
                <div>
                  <h3 class="font-bold">{item.name}</h3>
                  <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                </div>
              </div>
              <div class="shrink-0 text-right">
                <div class="font-bold text-lime-600 dark:text-lime-400">${item.price.toLocaleString()}</div>
                <div class="text-xs text-gray-500">Owned: {inventory[item.id] || 0}</div>
              </div>
            </div>
            <Button class="w-full" rounded on:click={() => buyItem(item)}>Buy {item.name}</Button>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  {#if specialEncounters.some((e) => (rawData?.__teams || []).some((t) => t.id === e.requirement))}
    <div class="mb-8 rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
      <h2 class="mb-2 text-2xl font-bold text-orange-500">
        Special Encounters
      </h2>
      <p class="mb-6 text-sm text-gray-600 dark:text-gray-400">
        Unique opportunities to expand your team from world vendors.
      </p>

      <div class="grid gap-4 sm:grid-cols-2">
        {#each specialEncounters.filter((e) => (rawData?.__teams || []).some((t) => t.id === e.requirement)) as item}
          {@const owned = !!rawData?.[`Store: ${item.name}`]}
          <div
            class="flex flex-col gap-y-3 rounded-lg border-2 border-gray-200 p-4 dark:border-gray-700 {owned
              ? 'opacity-50 grayscale'
              : ''}"
          >
            <div class="flex items-start justify-between gap-x-3">
              <div class="flex gap-x-3">
                <PIcon name={item.pokemon} className="-my-2" />
                <div>
                  <h3 class="font-bold">{item.name}</h3>
                  <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
              </div>
              <div class="shrink-0 text-right">
                <div class="font-bold text-lime-600 dark:text-lime-400">
                  ${item.price.toLocaleString()}
                </div>
                {#if owned}
                  <div class="text-xs font-bold uppercase text-orange-500">
                    Sold Out
                  </div>
                {/if}
              </div>
            </div>

            <Button
              class="w-full"
              rounded
              disabled={owned}
              on:click={() => buyPokemon(item)}
            >
              {owned ? 'Purchased' : `Purchase ${item.name}`}
            </Button>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
