<script>
  import { onMount } from 'svelte'
  import { Loader, PIcon } from '$c/core'
  import { capitalise } from '$utils/string'
  import { pokeapi } from '$utils/api'

  export let moveName
  export let box = []

  let loading = true
  let error = null
  let compatiblePokemon = []

  onMount(async () => {
    try {
      const normalizedMove = moveName.toLowerCase().replace(/ /g, '-')
      const data = await pokeapi(`move/${normalizedMove}`)
      
      if (!data) throw new Error(`Could not fetch data for move: ${moveName}`)
      
      const compatibleNames = new Set(data.learned_by_pokemon.map(p => p.name))

      // Filter the user's box for compatible pokemon
      compatiblePokemon = box.filter(mon => {
        const monName = mon.pokemon.toLowerCase().replace(/ /g, '-')
        return compatibleNames.has(monName)
      })

      loading = false
    } catch (e) {
      error = e.message
      loading = false
    }
  })
</script>

<div class="p-6 max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl shadow-2xl border dark:border-gray-800">
  <div class="mb-6 flex items-center justify-between border-b pb-4 dark:border-gray-800">
    <div>
      <h2 class="text-2xl font-bold">Compatibility</h2>
      <p class="text-sm opacity-50">Who can learn <span class="capitalize text-blue-500 font-bold">{moveName.replace(/-/g, ' ')}</span>?</p>
    </div>
    <div class="h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
       <span class="text-2xl">🎓</span>
    </div>
  </div>

  {#if loading}
    <div class="flex flex-col items-center justify-center py-12">
      <Loader />
      <p class="mt-4 text-sm opacity-50 animate-pulse">Checking move compatibility via PokeAPI...</p>
    </div>
  {:else if error}
    <div class="text-red-500 py-12 text-center bg-red-50 dark:bg-red-900/10 rounded-xl">
      <p class="font-bold">Error</p>
      <p class="text-sm">{error}</p>
    </div>
  {:else if !compatiblePokemon.length}
    <div class="py-16 text-center">
      <div class="text-5xl mb-4 grayscale opacity-50">🚫</div>
      <h3 class="text-lg font-bold">No Compatible Pokémon</h3>
      <p class="text-sm text-gray-500 mt-2">None of the Pokémon currently in your Box can learn this move.</p>
    </div>
  {:else}
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {#each compatiblePokemon as mon}
        <div class="flex items-center gap-x-3 rounded-xl border border-gray-100 bg-gray-50/50 p-3 dark:border-gray-800 dark:bg-gray-800/30">
          <div class="relative shrink-0">
            <PIcon name={mon.details?.sprite || mon.pokemon} className="-my-4 -ml-2 transform scale-90" />
          </div>
          <div class="flex flex-col overflow-hidden">
            <span class="text-sm font-bold truncate">
              {mon.nickname || capitalise(mon.pokemon)}
            </span>
            <span class="text-[10px] uppercase opacity-50">
              Lv. {mon.level || '??'} • {mon.location}
            </span>
          </div>
          <div class="ml-auto">
            <span class="text-xs font-bold text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">✓ Yes</span>
          </div>
        </div>
      {/each}
    </div>
    
    <div class="mt-8 pt-4 border-t dark:border-gray-800 flex items-center justify-between text-xs opacity-50">
      <span>Found {compatiblePokemon.length} compatible Pokémon in your Box</span>
      <span>Source: PokeAPI</span>
    </div>
  {/if}
</div>
