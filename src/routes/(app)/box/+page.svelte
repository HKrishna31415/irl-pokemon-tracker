<script>
  import { onMount, getContext } from 'svelte'
  import { fade } from 'svelte/transition'
  import { page } from '$app/stores'

  import { Footer } from '$c/navs'

  import PokemonCard from '$lib/components/pokemon-card.svelte'

  import { Settings } from '$lib/components/Settings'
  import { Loader, PIcon, IconButton, Tooltip, Toggle, Icon } from '$c/core'
  import { Ball, Plus, Minus, Shiny, X, Deceased, External, Download, Analysis as LearnsetIcon, Settings as SettingsIcon } from '$icons'

  import TypeLogo from '$lib/components/type-logo.svelte'
  import { Modal as AnalysisModal } from '$lib/components/Analysis'
  import LearnsetModal from '$lib/components/LearnsetModal.svelte'
  import PokemonEditorModal from '$lib/components/PokemonEditorModal.svelte'
  import ShowdownImportModal from '$lib/components/ShowdownImportModal.svelte'

  import { capitalise } from '$utils/string'
  import { drag } from '$utils/drag'
  import { locid } from '$utils/pokemon'
  import { pokeapi } from '$utils/api'

  import {
    getGameStore,
    getBox,
    readdata,
    read,
    readTeam,
    readTeams,
    patch,
    updatePokemon,
    killPokemon
  } from '$lib/store'

  import { canonTypes as types } from '$lib/data/types'
  import { stats, StatIconMap, StatLongMap } from '$lib/data/stats'

  import { UNOWN, createImgUrl } from '$utils/rewrites'
  import { toDb } from '$utils/link'
  import { summarise } from '$utils/badges'
  import { NaturesMap } from '$lib/data/natures'

  const region = getContext('region')
  const { getPkmns, getPkmn } = getContext('game')
  const { open } = getContext('simple-modal')

  let minimal = false
  let Particles
  let gameStore,
    rawData,
    money = 0,
    inventory = {},
    teamData = [],
    winData,
    subview = 'pokemon',
    setTeam = (_) => _

  onMount(() => {
    import('$lib/components/particles').then((m) => (Particles = m.default))

    const [, , gameId] = readdata()
    gameStore = getGameStore(gameId)
    gameStore.subscribe(
      read((data) => {
        rawData = data
        money = data.__money || 0
        inventory = data.__items || {}
        teamData = readTeam(data)
        winData = readTeams(data)
      })
    )

    setTeam = (data) => gameStore.update(patch({ __team: data.slice(0, 6) }))

    const useRareCandy = (monId, currentLevel) => {
      const qty = inventory['rare-candy'] || 0
      if (qty <= 0) return window.alert('You have no Rare Candies! Buy them in the Store.')
      
      if (!window.confirm(`Use 1 Rare Candy to level up to Lv. ${+(currentLevel || 0) + 1}?`)) return

      gameStore.update(
        patch({
          __items: { ...inventory, 'rare-candy': qty - 1 },
          [monId]: { ...rawData[monId], level: (currentLevel || 0) + 1 }
        })
      )
    }

    // FIXME: Awkward hack to allow page transition cleanup
    ;['game_el'].forEach((id) => {
      const el = document.getElementById(id)
      if (el) {
        el.style = 'opacity: 0'
        setTimeout((_) => el.remove(), 500)
      }
    })
  })

  let loading = true
  let ogbox = [],
    box = [],
    Pokemon = {}
  getBox((b) => {
    ogbox = box = b
    getPkmns(box.map((i) => i.pokemon)).then((data) => {
      Pokemon = data
      loading = false
    })
  })

  let type = ''
  let stat = ''

  const clear = () => (stat = type = '')
  const sum = (l) => l.reduce((acc, it) => acc + it, 0)
  $: filter = (p) => {
    const [fType, fVal] = type.split(':')

    if (fType == 'type')
      return (Pokemon[p.pokemon]?.types || [])
        .map((i) => i.toLowerCase())
        .includes(fVal)

    if (fType == 'badge')
      return winData
        .find((w) => w.id === fVal)
        ?.team?.find((d) => d.id === locid(p))

    return true
  }

  $: typeCounts = types.reduce(
    (acc, it) => ({
      ...acc,
      [it]: ogbox.filter((p) =>
        (Pokemon[p.pokemon]?.types || [])
          .map((i) => i.toLowerCase())
          .includes(it)
      ).length
    }),
    {}
  )

  $: box = [...ogbox].sort((a, b) => {
    if (stat === 'total') {
      return (
        sum(Object.values(Pokemon[b.pokemon]?.baseStats)) -
        sum(Object.values(Pokemon[a.pokemon]?.baseStats))
      )
    }

    if (stat === 'type') {
      const val = Pokemon[b.pokemon].types
        .join('/')
        .localeCompare(Pokemon[a.pokemon].types.join('/'))

      if (val !== 0) return val
      return (
        sum(Object.values(Pokemon[b.pokemon]?.baseStats)) -
        sum(Object.values(Pokemon[a.pokemon]?.baseStats))
      )
    }

    if (type.startsWith('badge')) {
      const [, fVal] = type.split(':')
      const winTeam = winData.find((w) => w.id === fVal)?.team || []
      return (
        winTeam.findIndex((p) => p.id === locid(b)) -
        winTeam.findIndex((p) => p.id === locid(a))
      )
    }

    return stat
      ? Pokemon[b.pokemon]?.baseStats[stat] -
          Pokemon[a.pokemon]?.baseStats[stat]
      : a.id - b.id
  })

  $: enabled = box.length && (stat || type)

  const toid = (p) => `${p.id}@${p.location}`

  let DeathModal
  const openDeathModal = async (args) => {
    if (DeathModal) open(DeathModal, args)
    import('$lib/components/DeathModal/index.svelte').then((m) => {
      DeathModal = m.default
      open(DeathModal, args)
    })
  }

  let EvoModal
  const openEvoModal = async (args) => {
    if (EvoModal) open(EvoModal, args)
    import('$lib/components/EvolutionModal.svelte').then((m) => {
      EvoModal = m.default
      open(EvoModal, args)
    })
  }

  let evoComplete = false
  const handleEvo = ({ evos, alias }, original) =>
    openEvoModal({
      evolutions: evos,
      base: alias,
      select: handleEvoComplete(original)
    })
  const handleEvoComplete = (o) => async (id) =>
    getPkmn(id).then((p) => {
      getPkmns(box.map((i) => i.pokemon).concat(p.alias)).then((data) => {
        Pokemon = data
        ogbox = ogbox.map((i) => {
          return toid(i) == toid(o) ? { ...i, pokemon: p.alias } : i
        })

        updatePokemon({ ...o, pokemon: p.alias })
        evoComplete = toid(o)
      })
    })

  const handleKill = (o) => () => {
    openDeathModal({
      submit: handleDeath(o),
      pokemon: Pokemon[o.pokemon],
      nickname: o.nickname
    })
  }

  const handleDeath = (o) => (death) => {
    ogbox = ogbox.filter((i) => toid(i) !== toid(o))
    killPokemon({ ...o, death })
    handleTeamRemove(o)
  }

  /** Team management */
  function handleTeamAdd(p) {
    setTeam((teamData || []).filter((i) => i !== locid(p)).concat(locid(p)))
  }

  function handleTeamRemove(p) {
    setTeam((teamData || []).filter((i) => i !== locid(p)))
  }

  const openLearnset = (pokemon) => {
    open(LearnsetModal, { pokemon }, {
      styleWindow: { width: '500px', maxWidth: '90vw', padding: '0', background: 'transparent' }
    })
  }

  let mons = []
  $: {
    mons = (teamData || [])
      .map((t) => ogbox.find((o) => t === locid(o)))
      .filter((i) => i)
      .slice(0, 6)
  }

  const formatPokemon = async (p) => {
    const data = Pokemon[p.pokemon] || { name: capitalise(p.pokemon) }
    const nickname = p.nickname ? `${p.nickname} (${data.name})` : data.name
    const item = '' // Item tracking not currently implemented
    const ability = p.ability || 'Unknown Ability'
    const level = p.level || 50
    const nature = p.nature ? NaturesMap[p.nature]?.label : 'Serious'
    const ivs = p.ivs || { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 }
    const evs = p.evs || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }

    let moves = p.moves && p.moves.length ? p.moves.map(m => typeof m === 'string' ? m : m.name) : []
    
    if (moves.length === 0) {
      try {
        const name = p.pokemon.toLowerCase()
          .replace(/ /g, '-')
          .replace(/\./g, '')
          .replace(/'/g, '')
          .replace(/jr\./g, 'jr')
          .replace(/mime\./g, 'mime')
        
        const data = await pokeapi(`pokemon/${name}`)
        if (data && data.moves) {
          const possibleMoves = data.moves
            .map(m => {
              const levelUpDetail = m.version_group_details.find(d => d.move_learn_method.name === 'level-up')
              return levelUpDetail ? { name: m.move.name, level: levelUpDetail.level_learned_at } : null
            })
            .filter(m => m && m.level <= level)
            .sort((a, b) => b.level - a.level)

          moves = possibleMoves
            .slice(0, 4)
            .map(m => capitalise(m.name.replace(/-/g, ' ')))
        }
      } catch (e) {
        console.warn(`Could not fetch learnset for ${p.pokemon}`, e)
      }
    }

    moves = moves.filter(m => m && m.trim())
    while (moves.length < 4) moves.push(`Move ${moves.length + 1}`)

    return `${nickname}${item ? ' @ ' + item : ''}
Ability: ${ability}
Level: ${level}
EVs: ${evs.hp || 0} HP / ${evs.atk || 0} Atk / ${evs.def || 0} Def / ${evs.spa || 0} SpA / ${evs.spd || 0} SpD / ${evs.spe || 0} Spe
${nature} Nature
IVs: ${ivs.hp} HP / ${ivs.atk} Atk / ${ivs.def} Def / ${ivs.spa} SpA / ${ivs.spd} SpD / ${ivs.spe} Spe
- ${moves[0]}
- ${moves[1]}
- ${moves[2]}
- ${moves[3]}`
  }

  const exportToShowdown = async () => {
    const formatted = await Promise.all(mons.map(p => formatPokemon(p)))
    navigator.clipboard.writeText(formatted.join('\n\n')).then(() => {
      alert('Team exported to clipboard!')
    })
  }

  const exportBox = async () => {
    const formatted = await Promise.all(ogbox.map(p => formatPokemon(p)))
    navigator.clipboard.writeText(formatted.join('\n\n')).then(() => {
      alert('Full Box exported to clipboard!')
    })
  }

  const exportSingle = async (p) => {
    const formatted = await formatPokemon(p)
    navigator.clipboard.writeText(formatted).then(() => {
      alert(`${p.nickname || capitalise(p.pokemon)} exported to clipboard!`)
    })
  }

  const openImportModal = () => {
    open(ShowdownImportModal, { onImport: handleBulkImport })
  }

  const handleBulkImport = (sets) => {
    const newRawData = { ...rawData }
    let updatedCount = 0

    const normalizeSpecies = (s) => s.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[.'’]/g, '')
      .replace(/jr-/, 'jr')
      .replace(/mime-/, 'mime')

    sets.forEach(set => {
      // Find a match in ogbox
      const match = ogbox.find(p => {
        const pSpecies = normalizeSpecies(p.pokemon)
        const sSpecies = set.species
        const pNick = (p.nickname || '').trim()
        const sNick = (set.nickname || '').trim()

        // Match by species AND (nickname if provided, otherwise first match)
        return pSpecies === sSpecies && (!sNick || pNick === sNick)
      })

      if (match) {
        const { species, ...updates } = set
        newRawData[match.location] = { ...newRawData[match.location], ...updates }
        updatedCount++
      }
    })

    if (updatedCount > 0) {
      gameStore.update(() => JSON.stringify(newRawData))
      alert(`Successfully updated ${updatedCount} Pokémon from Showdown!`)
    } else {
      alert('No matching Pokémon found in Box to update.')
    }
  }
</script>

{#if loading}
  <Loader />
{:else}
  <div
    out:fade|local={{ duration: 250 }}
    in:fade|local={{ duration: 250, delay: 300 }}
    class="container mx-auto"
  >
    <div class="mx-auto flex flex-col items-center justify-center">
      <main
        class="box flex w-full snap-y scroll-pt-14 flex-col gap-y-4 overflow-hidden px-4 pt-14 pb-32 md:px-8 md:pt-20 md:pb-48 xl:w-3/4 {region}"
      >
        <div
          class="relative -my-2 flex snap-start flex-row items-center gap-x-2 md:mt-0"
        >
          <AnalysisModal box={Object.values(Pokemon)}>
            <small>Box</small>
          </AnalysisModal>
          <AnalysisModal box={mons.map((p) => Pokemon[p.pokemon])}>
            <small>Team</small>
          </AnalysisModal>
          <div class="flex flex-wrap items-center gap-2">
            <IconButton rounded title="Export Team to Showdown" on:click={exportToShowdown}>
              <Icon class="pl-1" height="1.2em" inline icon={Download} />
              <small class="pl-0.5 pr-2">Team</small>
            </IconButton>
            <IconButton rounded title="Export Entire Box" on:click={exportBox}>
              <Icon class="pl-1" height="1.2em" inline icon={Download} />
              <small class="pl-0.5 pr-2">Full Box</small>
            </IconButton>
            <IconButton rounded title="Import from Showdown" on:click={openImportModal}>
              <Icon class="pl-1" height="1.2em" inline icon={External} />
              <small class="pl-0.5 pr-2">Import</small>
            </IconButton>
          </div>

          <Settings class="absolute right-0" />

          <div
            class="mt-0 mr-8 flex gap-x-2 max-md:flex-grow max-md:justify-end md:flex-row-reverse"
          >
            <Toggle id="minimal" bind:state={minimal}>
              <small>Hide stats</small>
            </Toggle>
          </div>
        </div>

        <div class="mt-4 flex items-center justify-between gap-x-4 border-b dark:border-gray-700 pb-2">
           <h2 class="text-xl font-bold">Pokémon Box</h2>
           <div class="flex items-center gap-x-4">
             <div class="flex items-center gap-x-2 text-sm bg-lime-50 dark:bg-lime-900/20 px-3 py-1 rounded-full border border-lime-100 dark:border-lime-900/30">
                <img src="/assets/img/items/rare-candy.png" alt="Candy" class="h-4 w-4" />
                <span class="font-bold text-lime-700 dark:text-lime-400">x{inventory['rare-candy'] || 0}</span>
             </div>
             <div class="text-lg font-bold font-mono text-lime-600 dark:text-lime-400">
                ${money.toLocaleString()}
             </div>
           </div>
        </div>

        {#if subview === 'pokemon'}
        <div
          class="z-50 mt-2 inline-flex flex-wrap gap-y-2 gap-x-4 sm:flex-row sm:items-start md:flex-nowrap"
        >
          <div
            class="col-span-2 grid w-full grid-cols-5 grid-rows-2 gap-2 sm:w-auto sm:gap-2"
          >
            <IconButton
              rounded
              title="Clear filters"
              disabled={!enabled}
              on:click={clear}
            >
              <Icon class="pl-1" height="1.2em" inline icon={X} />
              <span class="pl-0.5 pr-2 text-sm">Clear</span>
            </IconButton>

            {#each stats as s}
              <label
                class="row-span-1 inline-flex h-7 w-full cursor-pointer items-center justify-center rounded-lg border border-gray-400 px-2 text-center text-xs font-medium text-gray-500 shadow-sm shadow-sm transition dark:text-gray-400"
                class:border-gray-600={stat === s}
                class:text-gray-50={stat === s}
                class:bg-gray-600={stat === s}
                class:dark:bg-gray-50={stat === s}
                class:dark:text-gray-900={stat === s}
                class:dark:border-gray-50={stat === s}
              >
                <input
                  type="radio"
                  bind:group={stat}
                  name="sortable"
                  value={s}
                />
                {#if StatLongMap[s]}
                  <Tooltip delay="1000"
                    >Sort by highest {StatLongMap[s]}</Tooltip
                  >
                {:else}
                  <Tooltip delay="1000">Sort by {s}</Tooltip>
                {/if}
                {#if StatIconMap[s]}
                  <Icon
                    inline={true}
                    class="text-tiny  {s !== 'spa'
                      ? 'fill-current'
                      : ''} -mt-2.5 mr-2 translate-y-1/2"
                    icon={StatIconMap[s]}
                  />
                {:else}
                  <span />
                {/if}
                {capitalise(s)}
              </label>
            {/each}
          </div>

          <div
            class="col-span-3 my-1.5 grid grid-cols-6 gap-x-2 gap-y-2 sm:w-auto md:my-0 md:grid-cols-6 xl:grid-cols-9"
          >
            {#each types as t}
              {#if typeCounts[t] > 0}
                <label
                  class="h-6 scale-75 cursor-pointer transition max-md:-mx-1"
                  class:grayscale={(type && !type.endsWith(t)) ||
                    !typeCounts[t]}
                  class:opacity-50={(type && !type.endsWith(t)) ||
                    !typeCounts[t]}
                  class:grayscale-0={type && type.endsWith(t)}
                >
                  <input
                    disabled={!typeCounts[t]}
                    bind:group={type}
                    value="type:{t}"
                    type="radio"
                    name="filter"
                  />
                  <Tooltip delay="1000">Filter to {t} types</Tooltip>
                  <TypeLogo
                    tooltip={false}
                    type={t}
                    className="w-full justify-center"
                  />
                </label>
              {/if}
            {/each}
          </div>

          {#if true}
            {@const gymData = winData.filter((d) => d.group === 'gym-leader')}
            <div
              class:pl-2={gymData.length}
              class:border-l={gymData.length}
              class="col-span-2 my-2 grid origin-left scale-125 grid-cols-4 gap-x-1 border-gray-200 dark:border-gray-500 md:my-0 xl:scale-[1.4] xl:grid-cols-8"
            >
              {#each gymData as d}
                <label
                  class="cursor-pointer self-end px-1 text-center transition max-md:-mx-0.5"
                  class:grayscale={type && !type.endsWith(d.id)}
                  class:grayscale-0={type && type.endsWith(d.id)}
                  class:opacity-50={type && !type.endsWith(d.id)}
                >
                  <PIcon type="b" name={d.type || d.speciality || d.id} />
                  <Tooltip delay="1000">Filter to team for {d.name}</Tooltip>
                  <input
                    bind:group={type}
                    type="radio"
                    value="badge:{d.id}"
                    name="badge"
                  />
                </label>
              {/each}
            </div>
          {/if}
        </div>

        <div
          class:grid-cols-1={!minimal}
          class:grid-cols-2={minimal}
          class:sm:grid-cols-2={!minimal}
          class:sm:grid-cols-3={minimal}
          class:md:grid-cols-4={minimal}
          class:lg:grid-cols-3={!minimal}
          class:lg:grid-cols-5={minimal}
          class:xl:grid-cols-4={!minimal}
          class:xl:grid-cols-5={minimal}
          class:gap-y-6={minimal}
          class:gap-x-3={minimal}
          class:gap-x-4={!minimal}
          class:gap-y-8={!minimal}
          class:xl:grid-cols-3={!minimal &&
            (stat === 'team' || type.startsWith('badge:'))}
          class:xl:grid-cols-6={minimal &&
            (stat === 'team' || type.startsWith('badge:'))}
          class="mt-6 grid"
        >
          {#if box.length === 0}
            <span
              class="col-span-4 flex h-96 items-center justify-center text-xl dark:text-gray-600"
              >You have no Pokémon in your box</span
            >
          {/if}
          {#each (stat === 'team' ? mons : box).filter(filter) as p (locid(p))}
            {@const badgeSummary = summarise(p, winData)}

            <span
              use:drag={{ data: p, effect: 'add', hideImg: true }}
              class="snap-start"
            >
              <PIcon
                class="data-drag-img invisible absolute -left-20 -top-20 -z-20"
                name={p.pokemon}
              />

              <PokemonCard
                {minimal}
                sprite={createImgUrl(Pokemon[p.pokemon], {
                  shiny: p.status === 6,
                  ext: 'png'
                })}
                fallback={UNOWN}
                maxStat={Math.max(
                  150,
                  ...Object.values(Pokemon[p.pokemon].baseStats)
                )}
                moves={p.moves || []}
                nickname={p.nickname}
                ability={p.ability}
                name={Pokemon[p.pokemon].name}
                nature={p.nature}
                ivs={p.ivs}
                stats={Pokemon[p.pokemon].baseStats}
                types={(Pokemon[p.pokemon].types || []).map((t) =>
                  t.toLowerCase()
                )}
              >
                <svelte:fragment slot="badges">
                  {#if badgeSummary}
                    {@const { summary, icons } = badgeSummary}
                    <Tooltip>
                      {summary}
                    </Tooltip>
                    {#each icons as icon}
                      <PIcon name={icon} type="b" />
                    {/each}
                  {/if}
                </svelte:fragment>

                <span slot="img">
                  {#if evoComplete === toid(p)}
                    <span
                      style="z-index: 999999"
                      class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                    >
                      <Particles
                        amount={25}
                        icons={['ice-stone', 'dawn-stone', 'fire-stone']}
                        on:end={() => (evoComplete = false)}
                      />
                    </span>
                  {/if}
                  {#if p.status === 6}
                    <Icon
                      inline={true}
                      icon={Shiny}
                      height="3.6em"
                      class="absolute left-1/2 z-50 -translate-y-3/4 -translate-x-full animate-pulse fill-current text-orange-200"
                    />
                    <Icon
                      inline={true}
                      icon={Shiny}
                      height="2.8em"
                      class="absolute top-0 right-0 z-50 translate-y-1/4 -translate-x-2/3 rotate-180 transform animate-pulse fill-current text-orange-300"
                    />
                  {/if}
                </span>

                <span
                  class="z-40 p-2 text-center text-xs text-gray-500"
                  slot="footer"
                  let:id
                >
                  {#if p.location === 'Starter'}
                    Met in a fateful encounter
                  {:else if p.status === 2}
                    Obtained from {p.location || p.customName}
                  {:else if p.status === 3}
                    Received in a trade {(
                      p.customName || p.location
                    ).startsWith('Route')
                      ? 'on'
                      : 'in'}
                    {p.customName || p.location}
                  {:else if !p.location || (p.customId && !p.customName)}
                    Met in an unknown place
                  {:else if p.customName}
                    Met {p.customName.startsWith('Route') ? 'on' : 'in'}
                    {p.customName}
                  {:else}
                    Met {p.location.startsWith('Route') ? 'on' : 'in'}
                    {p.location}
                  {/if}

                  {#if !p.customName}
                    <span class="mx-1">ǀ</span>

                    <a
                      class="inline border-b border-transparent transition hover:border-black hover:text-black dark:hover:text-gray-50"
                      href={toDb(id)}
                      title="Pokémon DB Link for {id}"
                      rel="noreferrer"
                      target="_blank"
                    >
                      Info
                      <Icon
                        inline={true}
                        icon={External}
                        class="-mt-0.5 inline fill-current"
                      />
                    </a>
                  {/if}

                  <div
                    class:hidden={minimal}
                    class="card-controls absolute -bottom-4 left-1/2 flex -translate-x-1/2 rounded-lg border border-gray-200 bg-red-200 shadow-md"
                  >
                    {#if Pokemon[p.pokemon].evos?.length}
                      <IconButton
                        className="translate-y-1 -mb-px transform scale-75"
                        borderless
                        name="dawn-stone"
                        on:click={handleEvo(Pokemon[p.pokemon], p)}
                      />
                    {/if}
                    <IconButton
                      on:click={handleKill(p)}
                      className="translate-y-1"
                      src={Deceased}
                      borderless
                    />
                    <IconButton
                      className="translate-y-1 transform scale-110"
                      borderless
                      src="/assets/img/items/rare-candy.png"
                      title="Level Up (Use Rare Candy)"
                      disabled={!inventory['rare-candy']}
                      on:click={() => useRareCandy(p.customId || p.location, p.level)}
                    />
                    <IconButton
                      className="translate-y-1 transform scale-125"
                      borderless
                      src={LearnsetIcon}
                      title="View {p.pokemon} Learnset"
                      on:click={() => openLearnset(p.pokemon)}
                    />
                    <IconButton
                      className="translate-y-1 transform scale-125"
                      borderless
                      src={SettingsIcon}
                      title="Edit {p.pokemon} Details"
                      on:click={() => {
                        open(PokemonEditorModal, { 
                          pokemon: p, 
                          inventory,
                          onSave: (updated) => {
                             gameStore.update(patch({ [p.customId || p.location]: updated }))
                          }
                        })
                      }}
                    />
                    <IconButton
                      className="translate-y-1 transform scale-125"
                      borderless
                      src={Download}
                      title="Export to Showdown"
                      on:click={() => exportSingle(p)}
                    />
                    {#if !teamData || teamData?.length < 6 || teamData?.includes(p.location)}
                      <IconButton
                        className="translate-y-1 transform scale-125"
                        borderless
                        src={Ball}
                        title="{teamData?.includes(locid(p))
                          ? `Remove`
                          : `Add`} {p.pokemon} {teamData?.includes(locid(p))
                          ? `from`
                          : `to`} your team"
                        on:click={(teamData?.includes(locid(p))
                          ? handleTeamRemove
                          : handleTeamAdd
                        ).bind({}, p)}
                      >
                        {#if teamData?.includes(locid(p))}
                          <Icon
                            class="absolute right-0.5 top-2 scale-75 transform rounded-full bg-white dark:bg-gray-900"
                            inline
                            icon={Minus}
                          />
                        {:else}
                          <Icon
                            class="absolute right-0.5 top-2 scale-75 transform rounded-full bg-white dark:bg-gray-900"
                            inline
                            icon={Plus}
                          />
                        {/if}
                      </IconButton>
                    {/if}
                  </div>
                </span>
              </PokemonCard>
            </span>
          {/each}
        </div>
        {/if}

        <Footer class="!relative !mt-6 !-mb-20 md:hidden" />
      </main>
    </div>
  </div>
{/if}

<style lang="postcss">
  input {
    display: none;
  }

  .card-controls {
    z-index: -2;
    background-color: white;
  }

  :global(.dark) .card-controls,
  :global(.dark) .card-controls:after {
    background-color: theme('colors.gray.900');
    border-color: transparent;
  }
  .card-controls:after {
    content: '';
    position: absolute;
    background-color: white;
    width: calc(100% + 12px);
    left: -6px;
    bottom: calc(50% + 1px);
    z-index: -10;
    height: calc(50% + 1px);
  }

  @media (max-width: theme('screens.md')) {
    .container + :global(footer) {
      @apply hidden;
    }

    :global(body) {
      overflow: hidden;
    }
    main {
      height: calc(100vh - 38px);
      overflow-y: scroll;
    }
  }
</style>
