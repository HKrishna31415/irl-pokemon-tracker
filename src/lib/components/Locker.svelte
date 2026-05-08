<script>
  import { getContext, onMount } from 'svelte'
  import { readdata, getGameStore, read, readBox } from '$lib/store'
  import { capitalise } from '$utils/string'
  import { PIcon } from '$c/core'
  import TMCompatibilityModal from './TMCompatibilityModal.svelte'

  let inventory = {}
  let boxData = []
  let loading = true

  const { getPkmns } = getContext('game')
  const { open } = getContext('simple-modal')

  onMount(() => {
    const [, , id] = readdata()
    const gameStore = getGameStore(id)
    gameStore.subscribe(
      read(async (data) => {
        inventory = data.__items || {}
        
        const box = readBox(data)
        const e = await getPkmns(box.map((p) => p.pokemon))
        boxData = box.map((p) => ({ ...p, details: e[p.pokemon] }))
        
        loading = false
      })
    )
  })

  const checkCompatibility = (itemId) => {
    if (!itemId.startsWith('tm-')) return
    
    const moveName = itemId.replace('tm-', '')
    open(TMCompatibilityModal, {
      moveName,
      box: boxData
    }, {
      styleWindow: { background: 'transparent' }
    })
  }

  const getItemImage = (id) => {
    const mapping = {
      'encounter-token': 'pass',
      'tera-orb': 'enigma-stone',
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
      'tm-knock-off': 'dark-tm'
    }

    const name = mapping[id] || id
    return `/assets/img/items/${name}.png`
  }
</script>

<div class="locker p-4">
  <div class="mb-6 border-b pb-2 dark:border-gray-700">
    <h3 class="text-xl font-bold">Item Locker</h3>
    <p class="text-sm opacity-50 text-gray-500">Your purchased battle items and permanent upgrades.</p>
  </div>

  {#if loading}
    <div class="py-12 text-center opacity-50">Loading locker...</div>
  {:else if Object.keys(inventory).length === 0}
    <div class="py-20 text-center">
       <div class="text-4xl mb-4">🎒</div>
       <p class="text-gray-500">Your locker is empty. Visit the Store to buy items!</p>
    </div>
  {:else}
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {#each Object.entries(inventory).sort() as [itemId, qty]}
        <button 
          class="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md dark:border-gray-800 dark:bg-gray-800/50 {itemId.startsWith('tm-') ? 'cursor-help border-blue-100 dark:border-blue-900/30' : 'cursor-default text-left'}"
          on:click={() => checkCompatibility(itemId)}
        >
          <div class="flex items-center gap-x-3 text-left">
            <div class="h-10 w-10 shrink-0 flex items-center justify-center">
              <img
                src={getItemImage(itemId)}
                alt={itemId}
                class="h-10 w-10 object-contain"
                on:error={(e) => (e.target.src = '/assets/img/items/unknown-item.png')}
              />
            </div>
            <div class="flex flex-col">
              <span class="text-sm font-bold leading-tight">
                {capitalise(itemId.replace(/-/g, ' '))}
              </span>
              <span class="text-[10px] uppercase opacity-50">
                {itemId.includes('tm') ? 'Technical Machine' : 'Held Item'}
              </span>
            </div>
          </div>
          <div class="text-lg font-black text-lime-600 dark:text-lime-400">
            x{qty}
          </div>
        </button>
      {/each}
    </div>
  {/if}
</div>
