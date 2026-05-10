<script>
  import { getContext } from 'svelte'
  import { capitalise } from '$utils/string'
  import { NaturesMap } from '$lib/data/natures'
  import { X } from '$icons'
  import { IconButton } from '$c/core'

  export let onImport = () => {}
  const { close } = getContext('simple-modal')

  let text = ''

  function handleImport() {
    if (!text) return
    const sets = text.split(/\n\s*\n/)
    const parsedSets = sets.map(set => {
      const lines = set.split('\n').map(l => l.trim()).filter(l => l)
      if (!lines.length) return null

      const firstLine = lines[0]
      const [pokemonPart] = firstLine.split('@')
      const part = pokemonPart.trim()
      
      let species = part
      let nickname = ''
      
      // Handle parentheses (Nickname) (Species) (Gender)
      const matches = [...part.matchAll(/\((.*?)\)/g)]
      if (matches.length === 2) {
        // Nickname (Species) (Gender)
        nickname = part.split('(')[0].trim()
        species = matches[0][1]
      } else if (matches.length === 1) {
        const content = matches[0][1]
        if (content === 'M' || content === 'F') {
          // Species (Gender)
          species = part.split('(')[0].trim()
        } else {
          // Nickname (Species)
          nickname = part.split('(')[0].trim()
          species = content
        }
      }

      const normalizeSpecies = (s) => s.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[.'’]/g, '')
        .replace(/jr-/, 'jr')
        .replace(/mime-/, 'mime')

      const updates = { 
        species: normalizeSpecies(species), 
        nickname: nickname.trim() 
      }

      const levelLine = lines.find(l => l.startsWith('Level:'))
      if (levelLine) updates.level = parseInt(levelLine.replace('Level:', '').trim())

      const abilityLine = lines.find(l => l.startsWith('Ability:'))
      if (abilityLine) updates.ability = capitalise(abilityLine.replace('Ability:', '').trim())

      const natureLine = lines.find(l => l.endsWith('Nature'))
      if (natureLine) {
        const n = natureLine.replace('Nature', '').trim().toLowerCase()
        if (NaturesMap[n]) updates.nature = n
      }

      const evLine = lines.find(l => l.startsWith('EVs:'))
      if (evLine) {
        const evs = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }
        const parts = evLine.replace('EVs:', '').split('/')
        parts.forEach(p => {
          const [val, stat] = p.trim().split(' ')
          const s = stat.toLowerCase() === 'spd' ? 'spd' : stat.toLowerCase() === 'spa' ? 'spa' : stat.toLowerCase()
          if (evs[s] !== undefined) evs[s] = parseInt(val)
        })
        updates.evs = evs
      }

      const ivLine = lines.find(l => l.startsWith('IVs:'))
      if (ivLine) {
        const ivs = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 }
        const parts = ivLine.replace('IVs:', '').split('/')
        parts.forEach(p => {
          const [val, stat] = p.trim().split(' ')
          const s = stat.toLowerCase() === 'spd' ? 'spd' : stat.toLowerCase() === 'spa' ? 'spa' : stat.toLowerCase()
          if (ivs[s] !== undefined) ivs[s] = parseInt(val)
        })
        updates.ivs = ivs
      }

      const moveLines = lines.filter(l => l.startsWith('-'))
      if (moveLines.length) {
        updates.moves = moveLines.map(l => capitalise(l.replace('-', '').trim())).slice(0, 4)
      }

      return updates
    }).filter(Boolean)

    onImport(parsedSets)
    close()
  }
</script>

<div class="p-6 bg-white dark:bg-gray-900 rounded-xl max-w-lg w-full mx-auto">
  <div class="flex items-center justify-between mb-4 border-b dark:border-gray-800 pb-3">
    <h2 class="text-xl font-bold">Import from Showdown</h2>
    <IconButton icon={X} on:click={close} />
  </div>

  <div class="space-y-4">
    <p class="text-sm text-gray-500 dark:text-gray-400">
      Paste your Pokémon Showdown export here. The app will try to match Pokémon in your box by species and nickname to update their stats and moves.
    </p>

    <textarea
      bind:value={text}
      placeholder="Pikachu @ Light Ball&#10;Ability: Static&#10;EVs: 252 Atk / 4 SpD / 252 Spe&#10;Jolly Nature&#10;- Volt Tackle&#10;- Iron Tail..."
      class="w-full h-64 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-3 text-sm font-mono outline-none dark:text-white focus:ring-2 focus:ring-blue-500"
    ></textarea>

    <div class="flex justify-end gap-x-3 pt-2">
      <button
        on:click={close}
        class="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        Cancel
      </button>
      <button
        on:click={handleImport}
        class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm transition-colors"
      >
        Import Sets
      </button>
    </div>
  </div>
</div>
