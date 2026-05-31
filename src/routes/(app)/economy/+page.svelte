<script>
  import { onMount } from 'svelte'
  import { readdata, getGameStore, read } from '$lib/store'
  import { SPECIAL_ENCOUNTERS, STORE_ITEMS, getEconomyConfig } from '$lib/utils/economy'
  import { Button } from '$c/core'
  import { Footer } from '$c/navs'

  let gameStore
  let config = getEconomyConfig()
  let items = STORE_ITEMS
  let specialEncounters = SPECIAL_ENCOUNTERS

  onMount(() => {
    const [, , id] = readdata()
    gameStore = getGameStore(id)
    gameStore.subscribe(read((data) => {
      config = getEconomyConfig(data)
      items = STORE_ITEMS.map((item) => ({ ...item, ...(config.storeItems[item.id] || {}) }))
      specialEncounters = SPECIAL_ENCOUNTERS.map((encounter) => ({
        ...encounter,
        ...(config.specialEncounters[encounter.id] || {})
      }))
    }))
  })

  const saveConfig = (next) => {
    gameStore.update((raw) => {
      const data = JSON.parse(raw || '{}')
      return JSON.stringify({ ...data, __economyConfig: next })
    })
  }

  const updateRoot = (key, value) => saveConfig({ ...config, [key]: Number(value) })
  const updateReward = (key, value) =>
    saveConfig({ ...config, rewards: { ...config.rewards, [key]: Number(value) } })
  const updateTier = (id, key, value) =>
    saveConfig({
      ...config,
      tmTiers: {
        ...config.tmTiers,
        [id]: { ...config.tmTiers[id], [key]: key === 'price' ? Number(value) : value }
      }
    })
  const updateItem = (id, key, value) =>
    saveConfig({
      ...config,
      storeItems: {
        ...config.storeItems,
        [id]: { ...(config.storeItems[id] || {}), [key]: key === 'enabled' ? value : key === 'price' ? Number(value) : value }
      }
    })
  const updateSpecialEncounter = (id, key, value) =>
    saveConfig({
      ...config,
      specialEncounters: {
        ...config.specialEncounters,
        [id]: {
          ...(config.specialEncounters[id] || {}),
          [key]: key === 'enabled' ? value : key === 'price' ? Number(value) : value
        }
      }
    })

  const reset = () => {
    if (!window.confirm('Reset economy overrides for this save?')) return
    gameStore.update((raw) => {
      const data = JSON.parse(raw || '{}')
      const { __economyConfig, ...rest } = data
      return JSON.stringify(rest)
    })
  }
</script>

<div class="container mx-auto max-w-6xl p-4 pt-20 pb-32">
  <div class="rounded-2xl border bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900">
    <div class="mb-6 flex flex-wrap items-center justify-between gap-4 border-b pb-4 dark:border-gray-800">
      <div>
        <h1 class="text-3xl font-bold">Economy Config</h1>
        <p class="mt-1 text-sm text-gray-500">Per-save prices, rewards, TM tiers, and store item settings.</p>
      </div>
      <Button rounded on:click={reset}>Reset Defaults</Button>
    </div>

    <section class="mb-8 grid gap-4 md:grid-cols-4">
      <label class="config-field">
        <span>Encounter Token</span>
        <input type="number" value={config.tokenPrice} on:change={(e) => updateRoot('tokenPrice', e.currentTarget.value)} />
      </label>
      <label class="config-field">
        <span>Rare Candy</span>
        <input type="number" value={config.rareCandyPrice} on:change={(e) => updateRoot('rareCandyPrice', e.currentTarget.value)} />
      </label>
      <label class="config-field">
        <span>Trainer Reward</span>
        <input type="number" value={config.rewards.trainer} on:change={(e) => updateReward('trainer', e.currentTarget.value)} />
      </label>
      <label class="config-field">
        <span>Gym Reward</span>
        <input type="number" value={config.rewards.gymLeader} on:change={(e) => updateReward('gymLeader', e.currentTarget.value)} />
      </label>
      <label class="config-field">
        <span>Amulet Coin Multiplier</span>
        <input type="number" step="0.1" value={config.rewards.amuletCoinMultiplier} on:change={(e) => updateReward('amuletCoinMultiplier', e.currentTarget.value)} />
      </label>
    </section>

    <section class="mb-8">
      <h2 class="mb-3 text-xl font-bold">TM Tiers</h2>
      <div class="grid gap-3 md:grid-cols-4">
        {#each Object.entries(config.tmTiers) as [id, tier]}
          <div class="rounded-xl border p-4 dark:border-gray-800">
            <h3 class="font-bold">{tier.name}</h3>
            <label class="config-field mt-3">
              <span>Price</span>
              <input type="number" value={tier.price} on:change={(e) => updateTier(id, 'price', e.currentTarget.value)} />
            </label>
            <label class="config-field mt-3">
              <span>Description</span>
              <input value={tier.desc} on:change={(e) => updateTier(id, 'desc', e.currentTarget.value)} />
            </label>
          </div>
        {/each}
      </div>
    </section>

    <section class="mb-8">
      <h2 class="mb-3 text-xl font-bold">Store Items</h2>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[760px] text-left text-sm">
          <thead class="border-b text-xs uppercase tracking-wider text-gray-400 dark:border-gray-800">
            <tr>
              <th class="py-3 pr-4">Enabled</th>
              <th class="py-3 pr-4">Item</th>
              <th class="py-3 pr-4">Type</th>
              <th class="py-3 pr-4">Price</th>
              <th class="py-3">Description</th>
            </tr>
          </thead>
          <tbody class="divide-y dark:divide-gray-800">
            {#each items as item}
              <tr>
                <td class="py-2 pr-4">
                  <input type="checkbox" checked={item.enabled !== false} on:change={(e) => updateItem(item.id, 'enabled', e.currentTarget.checked)} />
                </td>
                <td class="py-2 pr-4 font-bold">{item.name}</td>
                <td class="py-2 pr-4 text-xs uppercase text-gray-500">{item.type}</td>
                <td class="py-2 pr-4">
                  <input class="w-28 rounded border bg-transparent px-2 py-1 dark:border-gray-700" type="number" value={item.price} on:change={(e) => updateItem(item.id, 'price', e.currentTarget.value)} />
                </td>
                <td class="py-2">
                  <input class="w-full rounded border bg-transparent px-2 py-1 dark:border-gray-700" value={item.description} on:change={(e) => updateItem(item.id, 'description', e.currentTarget.value)} />
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </section>

    <section>
      <h2 class="mb-3 text-xl font-bold">Special Encounters</h2>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[840px] text-left text-sm">
          <thead class="border-b text-xs uppercase tracking-wider text-gray-400 dark:border-gray-800">
            <tr>
              <th class="py-3 pr-4">Enabled</th>
              <th class="py-3 pr-4">Encounter</th>
              <th class="py-3 pr-4">Pokemon</th>
              <th class="py-3 pr-4">Requirement</th>
              <th class="py-3 pr-4">Price</th>
              <th class="py-3">Description</th>
            </tr>
          </thead>
          <tbody class="divide-y dark:divide-gray-800">
            {#each specialEncounters as encounter}
              <tr>
                <td class="py-2 pr-4">
                  <input type="checkbox" checked={encounter.enabled !== false} on:change={(e) => updateSpecialEncounter(encounter.id, 'enabled', e.currentTarget.checked)} />
                </td>
                <td class="py-2 pr-4 font-bold">{encounter.name}</td>
                <td class="py-2 pr-4">
                  <input class="w-36 rounded border bg-transparent px-2 py-1 dark:border-gray-700" value={encounter.pokemon} on:change={(e) => updateSpecialEncounter(encounter.id, 'pokemon', e.currentTarget.value)} />
                </td>
                <td class="py-2 pr-4">
                  <input class="w-36 rounded border bg-transparent px-2 py-1 dark:border-gray-700" value={encounter.requirement} on:change={(e) => updateSpecialEncounter(encounter.id, 'requirement', e.currentTarget.value)} />
                </td>
                <td class="py-2 pr-4">
                  <input class="w-28 rounded border bg-transparent px-2 py-1 dark:border-gray-700" type="number" value={encounter.price} on:change={(e) => updateSpecialEncounter(encounter.id, 'price', e.currentTarget.value)} />
                </td>
                <td class="py-2">
                  <input class="w-full rounded border bg-transparent px-2 py-1 dark:border-gray-700" value={encounter.description} on:change={(e) => updateSpecialEncounter(encounter.id, 'description', e.currentTarget.value)} />
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </section>
  </div>
  <Footer />
</div>

<style lang="postcss">
  .config-field {
    @apply flex flex-col gap-1 text-sm font-bold text-gray-500;
  }

  .config-field input {
    @apply rounded-lg border bg-transparent px-3 py-2 text-base font-bold text-gray-900 dark:border-gray-700 dark:text-gray-50;
  }
</style>
