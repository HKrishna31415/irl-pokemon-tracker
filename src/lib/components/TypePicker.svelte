<script>
  import { capitalise } from '$utils/string'

  export let title = 'Select Type'
  export let onSelect = () => {}
  
  const types = ['Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice', 'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Steel', 'Dark', 'Fairy']

  const select = (type) => onSelect(type)
</script>

<div class="p-6 bg-white dark:bg-gray-900 rounded-xl">
  <h2 class="text-2xl font-bold mb-6 text-center">{title}</h2>
  <div class="grid grid-cols-3 gap-3 sm:grid-cols-6">
    {#each types as type}
      <button
        on:click={() => select(type)}
        class="flex flex-col items-center gap-y-2 p-3 rounded-lg border border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition-all dark:border-gray-800 dark:hover:bg-gray-800"
      >
        <div class="h-10 w-10 flex items-center justify-center">
           <img src="/assets/img/items/{type.toLowerCase()}-gem.png" alt={type} class="h-8 w-8 object-contain" on:error={(e) => e.target.src = '/assets/img/items/normal-gem.png'} />
        </div>
        <span class="text-[10px] font-bold uppercase">{type}</span>
      </button>
    {/each}
  </div>
</div>
