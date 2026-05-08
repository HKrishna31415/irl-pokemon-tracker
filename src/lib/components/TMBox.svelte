<script>
  import tms from '$lib/data/tms.json'
  import { capitalise } from '$utils/string'
  import { Tooltip } from '$c/core'

  const tiers = [
    { id: 'tier0', name: 'Tier 0', desc: 'Momentum, 100/100, High Power Recoil' },
    { id: 'tier1', name: 'Tier 1', desc: '90/100 Elemental, 2-Stage Boosting' },
    { id: 'tier2', name: 'Tier 2', desc: 'Status, Weather, Hazards, High Power/Low Acc' },
    { id: 'tier3', name: 'Tier 3', desc: 'Other Utility' }
  ]

  let search = ''

  $: filteredTms = (tierId) => {
    return tms[tierId].filter(tm => 
      tm.name.toLowerCase().includes(search.toLowerCase()) ||
      tm.type.toLowerCase().includes(search.toLowerCase())
    )
  }
</script>

<div class="tm-box p-4">
  <div class="mb-6 flex items-center justify-between gap-4">
    <div class="relative w-full max-w-md">
      <input
        type="text"
        bind:value={search}
        placeholder="Search TMs by name or type..."
        class="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
      />
    </div>
    <div class="text-sm opacity-50">
      Total TMs: {Object.values(tms).reduce((acc, curr) => acc + curr.length, 0)}
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
              <div class="group relative flex flex-col items-center rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition-all hover:scale-105 hover:shadow-md dark:border-gray-800 dark:bg-gray-800/50">
                <div class="relative mb-2 h-12 w-12 flex items-center justify-center">
                  <PIcon
                    type="item"
                    name="{tm.type.toLowerCase()}-tm"
                    class="h-10 w-10"
                  />
                </div>
                
                <span class="text-center text-[10px] font-bold leading-tight line-clamp-2 min-h-[2.5em] mb-1">
                  {tm.name}
                </span>

                <div class="flex items-center gap-x-1 opacity-60">
                   <span class="text-[8px] uppercase px-1 rounded-sm bg-gray-100 dark:bg-gray-700">
                     {tm.type}
                   </span>
                   {#if tm.bp > 0}
                     <span class="text-[8px] font-mono">{tm.bp} BP</span>
                   {/if}
                </div>

                <Tooltip>
                  <div class="p-2 space-y-1">
                    <div class="font-bold border-b pb-1 mb-1">{tm.name}</div>
                    <div>Type: {tm.type}</div>
                    {#if tm.bp > 0}<div>Power: {tm.bp}</div>{/if}
                    {#if tm.acc > 0}<div>Accuracy: {tm.acc}%</div>{/if}
                  </div>
                </Tooltip>
              </div>
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
