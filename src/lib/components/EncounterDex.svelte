<script>
  import { getContext } from 'svelte'

  import nationalDex from '$lib/data/national-dex.json'
  import { TIER_FILTERS, getPokemonTier, normalisePokemonId } from '$lib/data/smogon-tiers'
  import { readStarter } from '$lib/store'
  import { PIcon } from '$c/core'
  import TierBadge from '$lib/components/TierBadge.svelte'
  import TypeBadge from '$lib/components/type-badge.svelte'

  export let route = []
  export let gameKey = ''
  export let gameData = {}
  export let showAvailability = false
  export let leagueData = null
  export let title = 'Encounter Dex'

  const gameContext = getContext('game') || {}
  const { getAllPkmn, getLeague } = gameContext

  let allPokemon = []
  let league = {}
  let tierFilter = 'All'
  let search = ''
  let megaOnly = false
  let legendaryFilter = 'All'
  let minBst = ''
  let maxBst = ''
  let loadToken = 0
  let visibleLimit = 96
  let filterKey = ''

  const byId = (items = []) =>
    items.reduce((acc, pokemon) => {
      for (const key of [pokemon.alias, pokemon.sprite, pokemon.name]) {
        const id = normalisePokemonId(key)
        if (id && !acc[id]) acc[id] = pokemon
      }
      return acc
    }, {})

  const routeIds = (items = []) =>
    items.flatMap((entry) => entry?.encounters || []).map(normalisePokemonId)

  const leagueIds = (teams = {}) =>
    Object.values(teams)
      .flatMap((team) => team?.pokemon || [])
      .map((pokemon) => normalisePokemonId(pokemon?.name || pokemon?.sprite))

  const addLocation = (acc, line, label) => {
    if (!line || !label) return acc
    if (!acc[line]) acc[line] = new Set()
    acc[line].add(label)
    return acc
  }

  const lineFor = (id, maps) => {
    const pokemon = maps.all[id] || maps.dex[id]
    return normalisePokemonId(pokemon?.evoline || pokemon?.alias || id)
  }

  const makeLineSet = (ids, maps) => new Set(ids.map((id) => lineFor(id, maps)))

  const exactFor = (pokemon = {}) =>
    [...new Set([pokemon.alias, pokemon.sprite, pokemon.name].map(normalisePokemonId).filter(Boolean))]

  const makeExactSet = (ids = []) => new Set(ids)

  const exactRouteLocations = (items = []) =>
    Object.fromEntries(
      Object.entries(
        items.reduce((acc, entry) => {
          const label = entry?.method ? `${entry.name} (${entry.method})` : entry?.name
          for (const encounter of entry?.encounters || []) {
            addLocation(acc, normalisePokemonId(encounter), label)
          }
          return acc
        }, {})
      ).map(([id, labels]) => [id, [...labels]])
    )

  const routeLineLocations = (items = [], maps) =>
    Object.fromEntries(
      Object.entries(
        items.reduce((acc, entry) => {
          const label = entry?.method ? `${entry.name} (${entry.method})` : entry?.name
          for (const encounter of entry?.encounters || []) {
            addLocation(acc, lineFor(normalisePokemonId(encounter), maps), label)
          }
          return acc
        }, {})
      ).map(([line, labels]) => [line, [...labels]])
    )

  const exactTrainerLocations = (teams = {}) =>
    Object.fromEntries(
      Object.entries(
        Object.values(teams).reduce((acc, team) => {
          for (const pokemon of team?.pokemon || []) {
            addLocation(acc, normalisePokemonId(pokemon?.name || pokemon?.sprite), team?.name)
          }
          return acc
        }, {})
      ).map(([id, labels]) => [id, [...labels]])
    )

  const trainerLineLocations = (teams = {}, maps) =>
    Object.fromEntries(
      Object.entries(
        Object.values(teams).reduce((acc, team) => {
          for (const pokemon of team?.pokemon || []) {
            addLocation(
              acc,
              lineFor(normalisePokemonId(pokemon?.name || pokemon?.sprite), maps),
              team?.name
            )
          }
          return acc
        }, {})
      ).map(([line, labels]) => [line, [...labels]])
    )

  const getFirstLabels = (ids = [], source = {}) => {
    for (const id of ids) {
      if (source[id]?.length) return source[id]
    }
    return []
  }

  const totemDisplaySprite = (pokemon = {}) => {
    if (!/-totem/i.test(`${pokemon.name} ${pokemon.alias} ${pokemon.sprite}`)) return pokemon.sprite
    return String(pokemon.name || pokemon.sprite || pokemon.alias)
      .replace(/-Totem$/i, '')
      .replace(/\s+/g, '-')
      .toLowerCase()
  }

  const legendaryNums = new Set([
    144, 145, 146, 150, 151,
    243, 244, 245, 249, 250, 251,
    377, 378, 379, 380, 381, 382, 383, 384, 385, 386,
    480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493,
    494, 638, 639, 640, 641, 642, 643, 644, 645, 646, 647, 648, 649,
    716, 717, 718, 719, 720, 721,
    772, 773, 785, 786, 787, 788, 789, 790, 791, 792,
    793, 794, 795, 796, 797, 798, 799, 800, 801, 802, 807, 808, 809,
    888, 889, 890, 891, 892, 893, 894, 895, 896, 897, 898,
    905, 1001, 1002, 1003, 1004, 1007, 1008, 1009, 1010, 1024, 1025
  ])

  const isLegendary = (pokemon = {}) => legendaryNums.has(Number(pokemon.num))

  const tooltipFor = (
    pokemon,
    exactRouteLabels = [],
    exactTrainerLabels = [],
    routeLabels = [],
    trainerLabels = []
  ) => {
    const hasExact = exactRouteLabels.length || exactTrainerLabels.length
    const lines = [
      `${pokemon.name} · ${pokemon.tier} · BST ${pokemon.total}`,
      exactRouteLabels.length ? `Encounterable: ${exactRouteLabels.join(', ')}` : '',
      exactTrainerLabels.length ? `Fought/seen: ${exactTrainerLabels.join(', ')}` : '',
      !hasExact && routeLabels.length
        ? `Evolution line encounterable: ${routeLabels.join(', ')}`
        : '',
      !hasExact && trainerLabels.length
        ? `Evolution line fought/seen: ${trainerLabels.join(', ')}`
        : '',
      showAvailability && !hasExact && !routeLabels.length && !trainerLabels.length
        ? 'Not encounterable or fought in Kanto IRL'
        : ''
    ]
      .filter(Boolean)
      .join('\n')
    return lines
  }

  $: starter = readStarter(gameData)

  $: if (showAvailability && gameKey && getAllPkmn && getLeague) {
    const token = ++loadToken
    Promise.all([getAllPkmn(), getLeague(gameKey, starter)]).then(([pokemon, leagueData]) => {
      if (token !== loadToken) return
      allPokemon = pokemon || []
      league = leagueData || {}
    })
  }
  $: if (leagueData) league = leagueData

  $: maps = {
    dex: byId(nationalDex),
    all: byId(allPokemon)
  }
  $: exactEncounterSet = makeExactSet(routeIds(route))
  $: encounterLines = makeLineSet(routeIds(route), maps)
  $: exactTrainerSet = makeExactSet(leagueIds(league))
  $: trainerLines = makeLineSet(leagueIds(league), maps)
  $: encounterExactLocations = exactRouteLocations(route)
  $: encounterLocations = routeLineLocations(route, maps)
  $: trainerExactLocations = exactTrainerLocations(league)
  $: trainerLocations = trainerLineLocations(league, maps)
  $: query = normalisePokemonId(search)
  $: bstMin = minBst === '' ? -Infinity : Number(minBst)
  $: bstMax = maxBst === '' ? Infinity : Number(maxBst)
  $: {
    const nextFilterKey = `${tierFilter}|${query}|${megaOnly}|${legendaryFilter}|${bstMin}|${bstMax}`
    if (nextFilterKey !== filterKey) {
      filterKey = nextFilterKey
      visibleLimit = 96
    }
  }
  $: visibleDex = nationalDex
    .map((pokemon) => {
      const line = lineFor(normalisePokemonId(pokemon.alias), maps)
      const tier = getPokemonTier(pokemon)
      const exactIds = exactFor(pokemon)
      const exactRouteAvailable = showAvailability && exactIds.some((id) => exactEncounterSet.has(id))
      const exactTrainerOnly = showAvailability && !exactRouteAvailable && exactIds.some((id) => exactTrainerSet.has(id))
      const lineRouteAvailable = showAvailability && !exactRouteAvailable && !exactTrainerOnly && encounterLines.has(line)
      const lineTrainerOnly = showAvailability && !exactRouteAvailable && !exactTrainerOnly && !lineRouteAvailable && trainerLines.has(line)
      const routeAvailable = exactRouteAvailable || lineRouteAvailable
      const trainerOnly = exactTrainerOnly || lineTrainerOnly
      const exactRouteLabels = getFirstLabels(exactIds, encounterExactLocations)
      const exactTrainerLabels = getFirstLabels(exactIds, trainerExactLocations)
      const routeLabels = encounterLocations[line] || []
      const trainerLabels = trainerLocations[line] || []

      return {
        ...pokemon,
        line,
        tier,
        isLegendary: isLegendary(pokemon),
        isTotem: /-totem/i.test(`${pokemon.name} ${pokemon.alias} ${pokemon.sprite}`),
        displaySprite: totemDisplaySprite(pokemon),
        exactRouteLabels,
        exactTrainerLabels,
        routeLabels,
        trainerLabels,
        tooltip: tooltipFor({ ...pokemon, tier }, exactRouteLabels, exactTrainerLabels, routeLabels, trainerLabels),
        state: showAvailability
          ? exactRouteAvailable
            ? 'available'
            : exactTrainerOnly
              ? 'trainer'
              : lineRouteAvailable
                ? 'line-available'
                : lineTrainerOnly
                  ? 'line-trainer'
                  : 'unavailable'
          : 'listed'
      }
    })
    .filter((pokemon) => tierFilter === 'All' || pokemon.tier === tierFilter)
    .filter((pokemon) => !megaOnly || /mega/i.test(`${pokemon.name} ${pokemon.alias}`))
    .filter((pokemon) => legendaryFilter === 'All' || (legendaryFilter === 'Legendary' ? pokemon.isLegendary : !pokemon.isLegendary))
    .filter((pokemon) => !query || normalisePokemonId(`${pokemon.name} ${pokemon.alias} ${pokemon.tier} ${pokemon.types?.join(' ')} ${pokemon.num} ${pokemon.total}`).includes(query))
    .filter((pokemon) => Number.isNaN(bstMin) || pokemon.total >= bstMin)
    .filter((pokemon) => Number.isNaN(bstMax) || pokemon.total <= bstMax)
  $: renderedDex = visibleDex.slice(0, visibleLimit)
</script>

<section class="encounter-dex mt-8 rounded-2xl border border-gray-100 bg-white/40 p-3 shadow-sm dark:border-gray-800/50 dark:bg-gray-900/20 md:p-4">
  <div class="mb-3 flex flex-col gap-3">
    <div>
      <h2 class="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
        {title}
      </h2>
      <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
        {visibleDex.length} matched · {renderedDex.length} shown
        {#if showAvailability}
          · green is encounterable · blue outline is fought/seen
        {:else}
          · National Dex species and supported forms
        {/if}
      </p>
    </div>

    <div class="dex-controls">
      <label class="dex-search">
        <span>Search</span>
        <input bind:value={search} type="search" placeholder="Tauros, OU, 490..." />
      </label>

      <label class="dex-bst">
        <span>BST Min</span>
        <input bind:value={minBst} type="number" min="1" max="999" inputmode="numeric" placeholder="Any" />
      </label>

      <label class="dex-bst">
        <span>BST Max</span>
        <input bind:value={maxBst} type="number" min="1" max="999" inputmode="numeric" placeholder="Any" />
      </label>

      <label class="mega-toggle">
        <input bind:checked={megaOnly} type="checkbox" />
        <span>Mega</span>
      </label>

      <label class="dex-legendary">
        <span>Legendary</span>
        <select bind:value={legendaryFilter}>
          <option>All</option>
          <option>Legendary</option>
          <option>Non-Legendary</option>
        </select>
      </label>
    </div>

    <div class="flex flex-wrap gap-1.5">
      {#each TIER_FILTERS as tier}
        <button
          class:active={tierFilter === tier}
          class="rounded border border-gray-200 px-2 py-1 text-[10px] font-black uppercase text-gray-500 transition hover:border-lime-400 hover:text-lime-600 dark:border-gray-700 dark:text-gray-400 dark:hover:border-lime-500 dark:hover:text-lime-300"
          on:click={() => (tierFilter = tier)}
        >
          {tier}
        </button>
      {/each}
    </div>
  </div>

  <div class="dex-grid">
    {#each renderedDex as pokemon (pokemon.alias)}
      <article
        class="dex-entry {pokemon.state}"
        class:totem={pokemon.isTotem}
        data-tooltip={pokemon.tooltip}
      >
        <span class="dex-num">#{String(pokemon.num).padStart(4, '0')}</span>
        <PIcon lazy name={pokemon.displaySprite} className="dex-icon" />
        <span class="dex-name">{pokemon.name}</span>
        <span class="dex-types">
          {#each pokemon.types as type}
            <TypeBadge {type} className="dex-type" />
          {/each}
        </span>
        <span class="dex-bst-label">BST {pokemon.total}</span>
        <TierBadge tier={pokemon.tier} />
        {#if showAvailability && pokemon.state !== 'unavailable'}
          <span class="dex-state">{pokemon.state.includes('available') ? 'Encounter' : 'Seen'}</span>
        {/if}
      </article>
    {/each}
  </div>

  {#if renderedDex.length < visibleDex.length}
    <div class="mt-4 flex justify-center">
      <button
        class="rounded border border-lime-300 bg-lime-50 px-4 py-2 text-xs font-black uppercase text-lime-700 transition hover:bg-lime-100 dark:border-lime-800 dark:bg-lime-900/30 dark:text-lime-300 dark:hover:bg-lime-900/50"
        on:click={() => (visibleLimit += 240)}
      >
        Show more
      </button>
    </div>
  {/if}
</section>

<style lang="postcss">
  .dex-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(10.5rem, 1fr));
    gap: 0.5rem;
  }

  .dex-entry {
    @apply relative grid min-h-[4.75rem] grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-x-2 overflow-visible rounded-lg border border-gray-100 bg-white/70 px-2 py-2 transition;
  }

  .dex-entry:hover {
    z-index: 20;
  }

  .dex-entry::after {
    content: attr(data-tooltip);
    white-space: pre-line;
    pointer-events: none;
    @apply invisible absolute left-0 bottom-[calc(100%+0.5rem)] z-50 w-max max-w-xs rounded border border-gray-200 bg-white px-3 py-2 text-[11px] font-bold leading-4 text-gray-700 opacity-0 shadow-lg transition;
  }

  .dex-entry:hover::after,
  .dex-entry:focus-within::after {
    @apply visible opacity-100;
  }

  :global(.dark) .dex-entry::after {
    @apply border-gray-700 bg-gray-900 text-gray-100;
  }

  :global(.dark) .dex-entry {
    @apply border-gray-800 bg-gray-900/30;
  }

  .dex-entry.listed {
    @apply hover:border-lime-300 hover:bg-lime-50/40;
  }

  :global(.dark) .dex-entry.listed {
    @apply hover:border-lime-800 hover:bg-lime-900/20;
  }

  .dex-entry.unavailable {
    @apply opacity-40 grayscale;
  }

  .dex-entry.trainer {
    @apply border-2 border-sky-300 bg-white/80 ring-1 ring-inset ring-sky-200;
  }

  .dex-entry.line-trainer {
    @apply border border-sky-200 bg-sky-50/30 ring-1 ring-inset ring-sky-100;
  }

  :global(.dark) .dex-entry.trainer {
    @apply border-sky-600 bg-gray-900/70 ring-sky-800;
  }

  :global(.dark) .dex-entry.line-trainer {
    @apply border-sky-900/60 bg-sky-900/10 ring-sky-900/40;
  }

  .dex-entry.available {
    @apply border-2 border-lime-400 bg-lime-100/80 shadow-sm shadow-lime-300/30 ring-1 ring-inset ring-lime-300;
  }

  .dex-entry.line-available {
    @apply border border-lime-300 bg-lime-50/40 ring-1 ring-inset ring-lime-200;
  }

  :global(.dark) .dex-entry.available {
    @apply border-lime-500 bg-lime-900/70 shadow-lime-900/30 ring-lime-700;
  }

  :global(.dark) .dex-entry.line-available {
    @apply border-lime-800/70 bg-lime-900/20 ring-lime-900/50;
  }

  .dex-num {
    @apply absolute right-2 top-1 text-[9px] font-black text-gray-300;
  }

  :global(.dark) .dex-num {
    @apply text-gray-700;
  }

  :global(.dex-icon) {
    width: 3rem;
    height: 3rem;
    grid-row: span 3;
    position: relative;
  }

  .dex-entry.totem :global(.dex-icon)::before {
    content: '';
    position: absolute;
    inset: 0.1rem;
    border-radius: 999px;
    background: rgba(239, 68, 68, 0.45);
    box-shadow: 0 0 0 2px rgba(185, 28, 28, 0.45);
    z-index: 0;
  }

  .dex-entry.totem :global(.dex-icon img),
  .dex-entry.totem :global(.dex-icon i) {
    position: relative;
    z-index: 1;
  }

  .dex-name {
    @apply min-w-0 truncate pr-8 text-xs font-bold text-gray-800;
  }

  :global(.dark) .dex-name {
    @apply text-gray-100;
  }

  .dex-types {
    @apply flex min-w-0 flex-wrap gap-1;
  }

  :global(.dex-type) {
    font-size: 10px !important;
    letter-spacing: 0 !important;
    border-radius: 4px !important;
    padding: 0 4px !important;
  }

  .dex-controls {
    @apply grid gap-2 sm:grid-cols-[minmax(12rem,1fr)_7rem_7rem_auto_9rem];
  }

  .dex-controls label {
    @apply min-w-0;
  }

  .dex-controls label span:first-child {
    @apply mb-1 block text-[9px] font-black uppercase tracking-widest text-gray-400;
  }

  :global(.dark) .dex-controls label span:first-child {
    @apply text-gray-500;
  }

  .dex-controls input[type='search'],
  .dex-controls input[type='number'],
  .dex-controls select {
    @apply h-9 w-full rounded border border-gray-200 bg-white px-2 text-xs font-bold outline-none transition focus:border-lime-400;
  }

  :global(.dark) .dex-controls input[type='search'],
  :global(.dark) .dex-controls input[type='number'],
  :global(.dark) .dex-controls select {
    @apply border-gray-700 bg-gray-900 text-gray-100;
  }

  .mega-toggle {
    @apply flex h-9 items-center gap-2 self-end rounded border border-gray-200 px-3 text-xs font-black uppercase text-gray-500;
  }

  :global(.dark) .mega-toggle {
    @apply border-gray-700 text-gray-300;
  }

  .mega-toggle input {
    @apply h-4 w-4 accent-lime-500;
  }

  .mega-toggle span:first-child {
    @apply m-0;
  }

  .dex-bst-label {
    @apply text-[9px] font-black uppercase text-gray-400;
  }

  :global(.dark) .dex-bst-label {
    @apply text-gray-500;
  }

  .dex-state {
    @apply justify-self-end rounded border border-current px-1.5 py-0.5 text-[9px] font-black uppercase text-sky-500;
  }

  .dex-entry.available .dex-state {
    @apply text-lime-700;
  }

  .dex-entry.line-available .dex-state {
    @apply text-lime-600;
  }

  :global(.dark) .dex-entry.available .dex-state {
    @apply text-lime-300;
  }

  :global(.dark) .dex-entry.line-available .dex-state {
    @apply text-lime-400;
  }

  button.active {
    @apply border-lime-400 bg-lime-100 text-lime-700;
  }

  :global(.dark) button.active {
    @apply border-lime-500 bg-lime-900 text-lime-300;
  }
</style>
