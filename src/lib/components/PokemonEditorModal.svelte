<script>
  import { getContext, onMount } from 'svelte'
  import { capitalise } from '$utils/string'
  import { pokeapi } from '$utils/api'
  import { Loader, Icon, IconButton, PIcon } from '$c/core'
  import { Save, X, Plus, Minus, Info } from '$icons'
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
  let showShowdownImport = false
  let showdownText = ''

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
          .map(m => ({ name: m.name, isTM: false }))

        // TM moves if in inventory
        const ownedTMs = []
        Object.keys(inventory).forEach(itemId => {
          if (itemId.startsWith('tm-')) {
            const moveAlias = itemId.replace('tm-', '')
            
            // Verify the Pokémon's native learnset includes this move
            const canLearn = data.moves.some(m => m.move.name === moveAlias)
            if (!canLearn) return

            // Find move name in tmsData
            for (const tier of Object.values(tmsData)) {
              const tm = tier.find(t => t.alias === moveAlias)
              if (tm) ownedTMs.push({ name: tm.name, isTM: true })
            }
          }
        })

        // Egg moves if they have a heart scale
        const eggMoves = []
        if (inventory['heart-scale'] > 0) {
          data.moves.forEach(m => {
            const detail = m.version_group_details.find(d => d.move_learn_method.name === 'egg')
            if (detail) {
              eggMoves.push({ name: capitalise(m.move.name.replace(/-/g, ' ')), isEgg: true })
            }
          })
        }

        const combined = [...learnset, ...ownedTMs, ...eggMoves]
        const uniqueMovesMap = new Map()
        combined.forEach(m => {
           if (uniqueMovesMap.has(m.name)) {
               if (m.isTM) uniqueMovesMap.get(m.name).isTM = true
               if (m.isEgg) uniqueMovesMap.get(m.name).isEgg = true
           } else {
               uniqueMovesMap.set(m.name, m)
           }
        })
        availableMoves = Array.from(uniqueMovesMap.values()).sort((a,b) => a.name.localeCompare(b.name))
      }
    } catch (e) {
      console.error('Failed to fetch moves', e)
    } finally {
      loadingMoves = false
    }
  }

  $: if (level) fetchAvailableMoves()

  let moveDetails = {}
  async function fetchMoveDetails(moveName) {
    if (!moveName || moveDetails[moveName] || moveDetails[moveName] === 'loading') return
    try {
      moveDetails[moveName] = 'loading'
      const data = await pokeapi(`move/${moveName.toLowerCase().replace(/ /g, '-')}`)
      if (!data) return
      moveDetails[moveName] = {
        power: data.power,
        acc: data.accuracy,
        type: data.type?.name || 'unknown',
        effect: data.effect_entries?.find(e => e.language.name === 'en')?.short_effect || data.flavor_text_entries?.find(e => e.language.name === 'en')?.flavor_text || ''
      }
    } catch (e) {
      delete moveDetails[moveName]
    }
  }

  $: {
    moves.forEach(m => {
      if (m) fetchMoveDetails(m)
    })
  }

  function parseShowdown() {
    if (!showdownText) return
    const lines = showdownText.split('\n').map(l => l.trim()).filter(l => l)
    if (!lines.length) return

    // Handle Nickname/Species in first line
    const [pokemonPart] = lines[0].split('@')
    const part = pokemonPart.trim()
    const matches = [...part.matchAll(/\((.*?)\)/g)]
    if (matches.length >= 1) {
      const content = matches[0][1]
      if (content !== 'M' && content !== 'F') {
        // First parenthesis is species, text before is nickname
        nickname = part.split('(')[0].trim()
      } else if (matches.length === 2) {
        // Nickname (Species) (Gender)
        nickname = part.split('(')[0].trim()
      }
    }

    // Level
    const levelLine = lines.find(l => l.startsWith('Level:'))
    if (levelLine) level = parseInt(levelLine.replace('Level:', '').trim())

    // Ability
    const abilityLine = lines.find(l => l.startsWith('Ability:'))
    if (abilityLine) ability = capitalise(abilityLine.replace('Ability:', '').trim())

    // Nature
    const natureLine = lines.find(l => l.endsWith('Nature'))
    if (natureLine) {
      const n = natureLine.replace('Nature', '').trim().toLowerCase()
      if (NaturesMap[n]) nature = n
    }

    // EVs
    const evLine = lines.find(l => l.startsWith('EVs:'))
    if (evLine) {
      const parts = evLine.replace('EVs:', '').split('/')
      parts.forEach(p => {
        const [val, stat] = p.trim().split(' ')
        const s = stat.toLowerCase() === 'spd' ? 'spd' : stat.toLowerCase() === 'spa' ? 'spa' : stat.toLowerCase()
        if (evs[s] !== undefined) evs[s] = parseInt(val)
      })
      evs = evs
    }

    // IVs
    const ivLine = lines.find(l => l.startsWith('IVs:'))
    if (ivLine) {
      const parts = ivLine.replace('IVs:', '').split('/')
      parts.forEach(p => {
        const [val, stat] = p.trim().split(' ')
        const s = stat.toLowerCase() === 'spd' ? 'spd' : stat.toLowerCase() === 'spa' ? 'spa' : stat.toLowerCase()
        if (ivs[s] !== undefined) ivs[s] = parseInt(val)
      })
      ivs = ivs
    }

    // Moves
    const moveLines = lines.filter(l => l.startsWith('-'))
    if (moveLines.length) {
      moves = moveLines.map(l => capitalise(l.replace('-', '').trim())).slice(0, 4)
      while (moves.length < 4) moves.push('')
    }

    showShowdownImport = false
    showdownText = ''
  }

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
    <div class="flex items-center gap-x-2">
      <button 
        on:click={() => showShowdownImport = !showShowdownImport}
        class="text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-500 hover:text-blue-600 px-2 py-1 rounded-md transition-colors"
      >
        Import Showdown
      </button>
      <IconButton icon={X} on:click={close} />
    </div>
  </div>

  {#if showShowdownImport}
    <div class="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl space-y-3" in:fade>
      <div class="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Paste Showdown Set</div>
      <textarea 
        bind:value={showdownText}
        placeholder="Species @ Item&#10;Ability: ...&#10;Level: 50&#10;EVs: 252 Atk / 252 Spe&#10;Jolly Nature&#10;- Move 1&#10;- Move 2..."
        class="w-full h-32 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-900 rounded-lg p-3 text-sm font-mono outline-none dark:text-white"
      ></textarea>
      <div class="flex justify-end gap-x-2">
        <button 
          on:click={() => showShowdownImport = false}
          class="px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Cancel
        </button>
        <button 
          on:click={parseShowdown}
          class="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm"
        >
          Parse Set
        </button>
      </div>
    </div>
  {/if}

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
            <div class="flex items-center gap-x-2">
              <select 
                bind:value={moves[i]}
                class="w-full bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 dark:text-white rounded-lg px-4 py-2 outline-none text-sm"
              >
                <option value="">(None)</option>
                {#each availableMoves as m}
                  <option value={m.name}>{m.name} {m.isTM ? '(TM)' : ''} {m.isEgg ? '(Egg)' : ''}</option>
                {/each}
              </select>
              {#if moves[i] && moveDetails[moves[i]] && moveDetails[moves[i]] !== 'loading'}
                <span class="cursor-help shrink-0 opacity-50 hover:opacity-100 transition-opacity">
                  <Icon inline icon={Info} class="text-xl" />
                  <Tooltip>
                    <div class="p-2 space-y-1 w-48 text-sm">
                      <div class="font-bold border-b pb-1 mb-1">{moves[i]}</div>
                      <div class="capitalize">Type: {moveDetails[moves[i]].type}</div>
                      {#if moveDetails[moves[i]].power}<div>Power: {moveDetails[moves[i]].power}</div>{/if}
                      {#if moveDetails[moves[i]].acc}<div>Accuracy: {moveDetails[moves[i]].acc}%</div>{/if}
                      <div class="text-xs opacity-80 mt-1 leading-tight">{moveDetails[moves[i]].effect}</div>
                    </div>
                  </Tooltip>
                </span>
              {/if}
            </div>
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
