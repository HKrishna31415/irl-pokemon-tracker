<script>
  import { onMount } from 'svelte'
  import { Loader, Icon } from '$c/core'
  import { capitalise } from '$utils/string'

  export let pokemon

  let loading = true
  let learnset = []
  let error = null

  const GEN_MAP = {
    'red-blue': 1, 'yellow': 1,
    'gold-silver': 2, 'crystal': 2,
    'ruby-sapphire': 3, 'emerald': 3, 'firered-leafgreen': 3,
    'diamond-pearl': 4, 'platinum': 4, 'heartgold-soulsilver': 4,
    'black-white': 5, 'black-2-white-2': 5,
    'x-y': 6, 'omega-ruby-alpha-sapphire': 6,
    'sun-moon': 7, 'ultra-sun-ultra-moon': 7, 'lets-go-pikachu-eevee': 7,
    'sword-shield': 8, 'brilliant-diamond-shining-pearl': 8, 'legends-arceus': 8,
    'scarlet-violet': 9
  }

  onMount(async () => {
    try {
      const name = pokemon.toLowerCase().replace(/ /g, '-')
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
      if (!res.ok) throw new Error('Could not fetch data from PokeAPI')
      const data = await res.json()

      const result = {}
      data.moves.forEach(m => {
        const moveName = m.move.name.replace(/-/g, ' ')
        m.version_group_details.forEach(detail => {
          if (detail.move_learn_method.name === 'level-up') {
            const gen = GEN_MAP[detail.version_group.name]
            const level = detail.level_learned_at
            if (gen && (!result[moveName] || level < result[moveName].level)) {
              result[moveName] = { level, gen }
            }
          }
        })
      })

      learnset = Object.entries(result)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => a.level - b.level)

      loading = false
    } catch (e) {
      error = e.message
      loading = false
    }
  })
</script>

<div class="p-6 max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg">
  <h2 class="text-2xl font-bold mb-4 flex items-center gap-x-2">
    {capitalise(pokemon)} Learnset
    <span class="text-sm font-normal opacity-50">(PokeAPI All Gens)</span>
  </h2>

  {#if loading}
    <div class="flex justify-center py-12">
      <Loader />
    </div>
  {:else if error}
    <div class="text-red-500 py-12 text-center">
      {error}
    </div>
  {:else if !learnset.length}
    <div class="py-12 text-center opacity-50">
      No level-up moves found for this Pokémon.
    </div>
  {:else}
    <table class="w-full text-left">
      <thead>
        <tr class="border-b dark:border-gray-700">
          <th class="py-2">Level</th>
          <th class="py-2">Move</th>
          <th class="py-2 text-right">Earliest Gen</th>
        </tr>
      </thead>
      <tbody>
        {#each learnset as move}
          <tr class="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <td class="py-2 font-mono">{move.level}</td>
            <td class="py-2 capitalize">{move.name}</td>
            <td class="py-2 text-right opacity-70">Gen {move.gen}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>

<style lang="postcss">
  table {
    border-collapse: collapse;
  }
</style>
