<script>
  import { getContext, onMount } from 'svelte'
  import { capitalise } from '$utils/string'
  import { pokeapi } from '$utils/api'
  import { Loader, Icon, IconButton, PIcon } from '$c/core'
  import { Save, X, Plus, Minus } from '$icons'
  import { Natures, NaturesMap } from '$lib/data/natures'
  import tmsData from '$lib/data/tms.json'

  export let pokemon // The pokemon object from the store
  export let inventory = {}
  export let onSave = () => {}

  const { close } = getContext('simple-modal')

  let level = pokemon.level || 1
  let nickname = pokemon.nickname || ''
  let ability = pokemon.ability || ''
  let nature = pokemon.nature || ''
  let ivs = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31, ...(pokemon.ivs || {}) }
  let evs = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0, ...(pokemon.evs || {}) }
  let moves = [...(pokemon.moves || []).map(m => typeof m === 'string' ? m : m.name), '', '', '', ''].slice(0, 4)

  let availableMoves = []
  let loadingMoves = true

  const stats = ['hp', 'atk', 'def', 'spa', 'spd', 'spe']

  onMount(async () => {
    await fetchAvailableMoves()
  })

  async function fetchAvailableMoves() {
    loadingMoves = true
    try {
      const name = pokemon.pokemon.toLowerCase()
        .replace(/ /g, '-')
        .replace(/\./g, '')
        .replace(/'/g, '')
        .replace(/jr\./g, 'jr')
        .replace(/mime\./g, 'mime')
      
      const data = await pokeapi(`pokemon/${name}`)
      if (data && data.moves) {
        // Natural learnset up to current level
        const learnset = data.moves
          .map(m => {
            const detail = m.version_group_details.find(d => d.move_learn_method.name === 'level-up')
            return detail ? { name: capitalise(m.move.name.replace(/-/g, ' ')), level: detail.level_learned_at } : null
          })
          .filter(m => m && m.level <= level)
          .map(m => m.name)

        // TM moves if in inventory
        const ownedTMs = []
        Object.keys(inventory).forEach(itemId => {
          if (itemId.startsWith('tm-')) {
            const moveAlias = itemId.replace('tm-', '')
            // Find move name in tmsData
            for (const tier of Object.values(tmsData)) {
              const tm = tier.find(t => t.alias === moveAlias)
              if (tm) ownedTMs.push(tm.name)
            }
          }
        })

        availableMoves = [...new Set([...learnset, ...ownedTMs])].sort()
      }
    } catch (e) {
      console.error('Failed to fetch moves', e)
    } finally {
      loadingMoves = false
    }
  }

  $: if (level) fetchAvailableMoves()

  function save() {
    onSave({
      ...pokemon,
      level,
      nickname,
      ability,
      nature,
      ivs,
      evs,
      moves: moves.filter(m => m)
    })
    close()
  }
</script>

<div class="p-6 bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full mx-auto">
  <div class="flex items-center justify-between mb-6 border-b dark:border-gray-800 pb-4">
    <h2 class="text-2xl font-bold flex items-center gap-x-3">
      <PIcon name={pokemon.pokemon} />
      Edit {capitalise(pokemon.pokemon)}
    </h2>
    <IconButton icon={X} on:click={close} />
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
    <!-- Basic Info -->
    <div class="space-y-4">
      <div>
        <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Nickname</label>
        <input 
          type="text" 
          bind:value={nickname}
          placeholder={capitalise(pokemon.pokemon)}
          class="w-full bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Level</label>
          <input 
            type="number" 
            bind:value={level}
            min="1" max="100"
            class="w-full bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 dark:text-white rounded-lg px-4 py-2 outline-none"
          />
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Nature</label>
          <select 
            bind:value={nature}
            class="w-full bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 dark:text-white rounded-lg px-4 py-2 outline-none"
          >
            <option value="">Select Nature</option>
            {#each Natures as n}
              <option value={n.id}>{n.label}</option>
            {/each}
          </select>
        </div>
      </div>

      <div>
        <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Ability</label>
        <input 
          type="text" 
          bind:value={ability}
          class="w-full bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 dark:text-white rounded-lg px-4 py-2 outline-none"
        />
      </div>

      <!-- Moves -->
      <div class="space-y-2">
        <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Moves</label>
        {#if loadingMoves}
          <div class="flex items-center gap-x-2 text-sm text-gray-400 italic">
            <Loader size="xs" /> Loading available moves...
          </div>
        {:else}
          {#each [0, 1, 2, 3] as i}
            <select 
              bind:value={moves[i]}
              class="w-full bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 dark:text-white rounded-lg px-4 py-2 outline-none text-sm"
            >
              <option value="">(None)</option>
              {#each availableMoves as m}
                <option value={m}>{m}</option>
              {/each}
            </select>
          {/each}
        {/if}
      </div>
    </div>

    <!-- Stats (IVs & EVs) -->
    <div class="space-y-6">
      <div>
        <h3 class="text-sm font-bold uppercase text-gray-400 mb-3 border-b dark:border-gray-800 pb-1">Individual Values (IVs)</h3>
        <div class="grid grid-cols-2 gap-3">
          {#each stats as s}
            <div class="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded-lg border dark:border-gray-700">
              <span class="text-[10px] font-bold uppercase text-gray-500">{s}</span>
              <input 
                type="number" 
                bind:value={ivs[s]}
                min="0" max="31"
                class="w-10 bg-transparent dark:text-white text-right font-mono font-bold outline-none"
              />
            </div>
          {/each}
        </div>
      </div>

      <div>
        <h3 class="text-sm font-bold uppercase text-gray-400 mb-3 border-b dark:border-gray-800 pb-1">Effort Values (EVs)</h3>
        <div class="grid grid-cols-2 gap-3">
          {#each stats as s}
            <div class="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded-lg border dark:border-gray-700">
              <span class="text-[10px] font-bold uppercase text-gray-500">{s}</span>
              <input 
                type="number" 
                bind:value={evs[s]}
                min="0" max="252"
                class="w-12 bg-transparent dark:text-white text-right font-mono font-bold outline-none"
              />
            </div>
          {/each}
        </div>
        <p class="text-[10px] text-gray-500 mt-2 text-right italic">
          Total: {Object.values(evs).reduce((a, b) => a + (b || 0), 0)} / 510
        </p>
      </div>
    </div>
  </div>

  <div class="mt-8 flex justify-end gap-x-4">
    <button 
      on:click={close}
      class="px-6 py-2 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    >
      Cancel
    </button>
    <button 
      on:click={save}
      class="px-8 py-2 rounded-xl font-bold bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all flex items-center gap-x-2"
    >
      <Icon icon={Save} />
      Save Changes
    </button>
  </div>
</div>
