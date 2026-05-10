<script>
  export let game,
    id,
    location = '',
    starter = '',
    type,
    forceLevelCap = false,
    forceVs = false,
    defeated = false,
    reader = false

  // Core leaader data
  let pokemon = [],
    name = '',
    speciality = '',
    img

  $: boss = { pokemon, name, speciality, id, img, type }

  // Extra leader data
  let doubleBattle = false,
    effect,
    info,
    dataLevelCap = null

  import { browser } from '$app/environment'
  import { getContext } from 'svelte'
  import { fade } from 'svelte/transition'

  import Pokemon from '$lib/components/pokemon-card.svelte'
  import TypeBadge from '$lib/components/type-badge.svelte'
  import Label from '$lib/components/label.svelte'

  import { createImgUrl } from '$utils/rewrites'
  import { toList } from '$utils/string'

  import { Picture, Icon, PIcon, IconButton, Accordion, Tooltip } from '$c/core'
  import { Wrapper as SettingWrapper } from '$lib/components/Settings'

  import { Loop as Badge, Ball, Info, Download, Settings } from '$icons'
  import { Vs } from '$lib/components/BossBattle'
  import { bossToImage } from '$utils/rewrites'

  import Effect from '$lib/components/Effect.svelte'
  import PokemonEditorModal from '$lib/components/PokemonEditorModal.svelte'
  import { activeGame, getGameStore, patch, read } from '$lib/store'
  import { onDestroy, onMount } from 'svelte'

  export let loading = true

  let gameStore, bossOverrides = {}
  let unsubActive, unsubStore

  onMount(() => {
    unsubActive = activeGame.subscribe(gid => {
      if (gid) {
        gameStore = getGameStore(gid)
        if (unsubStore) unsubStore()
        unsubStore = gameStore.subscribe(read(d => {
          bossOverrides = d.__bossOverrides || {}
          if (!loading) applyOverrides()
        }))
      }
    })
  })

  onDestroy(() => {
    if (unsubActive) unsubActive()
    if (unsubStore) unsubStore()
  })

  function applyOverrides() {
    if (!pokemon.length || !bossOverrides[id]) return
    pokemon = pokemon.map((p, i) => {
      const override = bossOverrides[id][i] || {}
      return { ...p, ...override }
    })
  }

  const { getLeague } = getContext('game')
  const { open } = getContext('simple-modal')

  let CompareModal
  const loadmodal = async () => {
    if (CompareModal) return CompareModal
    return import('$lib/components/ProgressModal.svelte').then((m) => {
      CompareModal = m.default
      return CompareModal
    })
  }

  const openCompare = (id) => () =>
    loadmodal().then((modal) => open(modal, { boss, mode: 'compare', id }))
  const openBuilder = () =>
    loadmodal().then((modal) => open(modal, { boss, mode: 'build' }))

  const fetchData = async (starter) => {
    if (!browser) return

    loading = true
    pokemon = []
    name = ''
    speciality = ''
    img = null
    doubleBattle = false
    effect = null
    info = null
    dataLevelCap = null

    try {
      const league = await getLeague(game, starter)
      const data = league[id]
      if (!data) throw new Error(`Missing boss data for ${game}:${id}`)

      img = bossToImage(data);

      pokemon = data.pokemon
      name = data.name
      speciality = data.speciality

      doubleBattle = data.doubleBattle
      effect = data.effect
      info = data.info
      dataLevelCap = data.lvlCap ?? null
      
      applyOverrides()
      loading = false
    } catch (e) {
      console.error(e)
    }
  }

  $: (async () => await fetchData(starter))()

  $: derivedLevelCap = pokemon.every(
    (it) => String(it.level).startsWith('+') || String(it.level).startsWith('-')
  )
    ? null
    : pokemon.reduce((acc, it) => Math.max(acc, it.level), 0)
  $: levelCap = dataLevelCap ?? derivedLevelCap
  $: maxStat = pokemon.reduce(
    (acc, it) => Math.max(acc, Math.max(...Object.values(it.stats))),
    0
  )

  const exportToShowdown = () => {
    const showdownTeam = pokemon
      .map((p) => {
        const name = p.name
        const item = p.held?.name || ''
        const ability = p.ability?.name || ''
        const level = p.level
        const stats = p.stats
        const moves = p.moves.map((m) => m.name)

        return `${capitalise(name)}${item ? ' @ ' + item : ''}
Ability: ${ability}
Level: ${level}
EVs: 0 HP / 0 Atk / 0 Def / 0 SpA / 0 SpD / 0 Spe
Serious Nature
- ${moves[0] || 'Move 1'}
- ${moves[1] || 'Move 2'}
- ${moves[2] || 'Move 3'}
- ${moves[3] || 'Move 4'}`
      })
      .join('\n\n')

    navigator.clipboard.writeText(showdownTeam).then(() => {
      alert(`${name}'s team exported to clipboard!`)
    })
  }
</script>

{#if reader}
  <h4 class="sr-only">
    {name} - {#if location}{location}{/if}
  </h4>
  <p class="sr-only">
    {name} has a team of {pokemon.length}, made up of
    {toList(pokemon, (p) => `a level ${p?.level} ${p?.name}`)}. The level cap
    for this fight is level {levelCap}.
  </p>
{/if}

<div class="relative my-6">
  <Accordion
    jsenabled={!reader}
    iconClassName="transition duration-1000 {loading
      ? 'opacity-0'
      : 'opacity-100'}"
  >
    <span
      slot="heading"
      class:md:-ml-2={!!img}
      class="-mt-4 inline-flex h-16 items-center gap-x-2 text-left"
    >
      {#if defeated && !loading}
        <div class="z-50 -ml-2 w-0" in:fade={{ delay: 150 }}>
          <span
            class="grayscale-1 absolute top-4 left-2 -mx-2 -rotate-30 scale-75 border-2 border-red-600 bg-red-300 pl-2 pr-1.5 font-mono text-base font-bold uppercase leading-4 tracking-widest text-red-700 md:left-12 md:scale-100"
          >
            defeated
          </span>
        </div>
      {/if}

      {#if img}
        <span class="relative -mx-5" class:grayscale={defeated}>
          <Picture
            src="{img.src}"
            alt={name}
            pixelated
            className="w-18 md:w-36"
            aspect="72x52"
          />
        </span>
      {/if}

      <span class="flex flex-col gap-y-2">
        <span class="inline-flex h-6 gap-x-2">
          {#if loading}
            <span
              class="-ml-9 w-20 animate-pulse rounded-md bg-gray-400 md:ml-0 md:w-24"
            />
          {:else}
            <div>
              <h4 class="text-xl font-medium">{name}</h4>
              {#if img?.author}
                <a
                  href={img.link}
                  target="_blank"
                  rel="noreferrer"
                  on:click|stopPropagation={function () {}}
                  class:mt-6={location}
                  class="absolute text-tiny italic text-gray-500 transition hover:text-indigo-300 hover:underline dark:text-gray-600 dark:hover:text-indigo-400"
                >
                  Sprite by <strong>{img.author}</strong>
                </a>
              {/if}
            </div>
          {/if}

          {#if speciality}
            <div class:grayscale={defeated}>
              <TypeBadge type={speciality} />
            </div>
          {/if}

          {#if info}
            <span class="ml-1 text-xl">
              <Tooltip>
                {@html info}
              </Tooltip>
              <Icon class="mt-1" inline icon={Info} />
            </span>
          {/if}

          {#if effect}
            <Effect {effect} class="-mt-1 h-fit text-4xl" />
          {/if}

          {#if doubleBattle}
            <Effect effect="double-battle" class="text-3xl" />
          {/if}
        </span>

        {#if loading}
          <div
            class="-ml-9 h-4 w-32 animate-pulse rounded-md bg-gray-400 md:ml-0 md:w-48"
          />
        {:else if location}
          <h5 class="text-md -mt-1 h-4 font-medium">
            <span>{location}</span>
          </h5>
        {/if}
      </span>

      <div class="absolute top-0 right-0 inline-flex gap-x-2">
        {#if loading}
          <div class="-mt-2 h-14 w-14 animate-pulse rounded-md bg-gray-400" />
        {:else}
          <span
            class:grayscale={defeated}
            class="hidden items-center gap-x-2 lg:inline-flex"
          >
            {#each pokemon as p, i (p.name + i)}
              <PIcon
                name={p.icon || p.name}
                className="-m-4 z-10 relative"
              />
            {/each}
          </span>

          <SettingWrapper id="team-caps" on="1">
            <Label
              heading="Max"
              className="-mr-4"
              body={Math.min(6, pokemon.length)}
            />
          </SettingWrapper>

          {#if levelCap}
            <SettingWrapper let:setting id="level-caps">
              {#if (setting === 1 && (type === 'gym-leader' || type === 'elite-four')) || (setting === 2 && (type === 'gym-leader' || type === 'elite-four' || type === 'rival' || type === 'mini-boss')) || setting === 3 || forceLevelCap}
                <Label heading="Lvl cap" body={levelCap} />
              {/if}
            </SettingWrapper>
          {/if}

          {#if forceVs}
            <IconButton
              on:click={openBuilder}
              title="Load team builder against the {boss.name} boss fight"
              class="h-12 pl-0.5 md:mt-1"
              rounded
            >
              <Vs
                containerClass="translate-y-3 scale-90"
                class="bg-white dark:bg-gray-800"
              />
            </IconButton>
          {/if}
          <IconButton rounded title="Export {name}'s team to Showdown" on:click={exportToShowdown}>
            <Icon class="pl-1" height="1.2em" inline icon={Download} />
          </IconButton>
        {/if}
      </div>
    </span>

    <div
      slot="item"
      class="mt-8 grid gap-y-10 md:grid-cols-2 md:gap-x-2 lg:grid-cols-2 lg:gap-x-6"
    >
      {#each pokemon as p, id (p.name + id)}
        <Pokemon
          {...p}
          class="snap-start scroll-mt-6"
          sprite={createImgUrl(p, { ext: 'png' })}
          {maxStat}
        >
          <div slot="footer" class="flex items-center justify-between mx-8 mb-2 z-50 transition opacity-25 hover:opacity-75">
            <button
              class="compare flex items-center gap-x-2"
              on:click={openCompare(id)}
            >
              <span class="relative h-8 w-8 transform md:scale-75">
                <Icon inline={true} class="absolute" height="1.4em" icon={Badge} />
                <Icon inline={true} class="absolute -top-0.5 right-1.5 rounded-full bg-white dark:bg-gray-800" height="0.8em" icon={Ball} />
                <Icon inline={true} class="absolute bottom-2 -left-0.5 rounded-full bg-white dark:bg-gray-800" height="0.8em" icon={Ball} />
              </span>
              <span class="md:text-xs"> Compare </span>
            </button>

            <button
              class="flex items-center gap-x-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 px-3 py-1 rounded-full text-xs font-bold"
              on:click={() => {
                open(PokemonEditorModal, { 
                  pokemon: { ...p, pokemon: p.name }, 
                  onSave: (updated) => {
                    const bossId = boss.id
                    const newOverrides = { ...bossOverrides }
                    if (!newOverrides[bossId]) newOverrides[bossId] = {}
                    newOverrides[bossId][id] = {
                      ivs: updated.ivs,
                      evs: updated.evs,
                      level: updated.level,
                      nickname: updated.nickname,
                      ability: updated.ability,
                      nature: updated.nature,
                      moves: updated.moves.map(m => ({ name: m }))
                    }
                    gameStore.update(patch({ __bossOverrides: newOverrides }))
                  }
                })
              }}
            >
              <Icon inline={true} icon={Settings} />
              Edit
            </button>
          </div>

        </Pokemon>
      {/each}
    </div>
  </Accordion>
</div>
