<script>
  import { afterUpdate } from 'svelte'
  import { fade } from 'svelte/transition'
  import {
    patch,
    addlocation,
    removelocation,
    hidelocation,
    read,
    readStarter
  } from '$lib/store'
  import { Gift } from '$icons'
  import { Icon } from '$c/core'

  import { toDbLocation } from '$utils/link'
  import { insertList } from '$utils/arr'
  import { shortuuid } from '$utils/uuid'
  import { slugify } from '$utils/string'

  import { Tooltip } from '$lib/components/core'
  import CustomLocation from './CustomLocation.svelte'
  import StarterType from '$lib/components/starter-type.svelte'
  import GymCard from '$lib/components/gym-card.svelte'
  import PokemonSelector from '$lib/components/pokemon-selector.svelte'

  import {
    hideRouteF,
    isRoute,
    isGym,
    isStarter,
    isCustom,

    showStarterRoute,
    showRoute,
    showGym,
    showCustom
  } from './_predicates'
  import { filterEntry } from './_filters'

  export let route,
    game,
    filters,
    search,
    progress = '',
    className = ''
  const { store, key, data } = game

  let starter = readStarter(data)
  let element

  /** Custom route handlers & Empty routes */
  const FREE_ROLLS_PER_ROUTE = 3

  let custom = [],
    hidden = [],
    bossTeamIds = [],
    encounterTokens = 0,
    routeRolls = {},
    hideRoute = (_) => false
  store.subscribe(
    read((d) => {
      if (!custom.length && d.__custom?.length) custom = d.__custom
      if (!hidden.length && d.__hidden?.length) hidden = d.__hidden

      bossTeamIds = (d.__teams || []).map((i) => i.id)
      encounterTokens = d.__encounterTokens || 0
      routeRolls = d.__routeRolls || {}
      hideRoute = hideRouteF(d)
      starter = readStarter(d)
    })
  )

  /** Returns the number of extra encounters already used on a route */
  const getRollCount = (routeName) => routeRolls[routeName] || 0

  /**
   * Add an extra encounter slot to a route beyond the first 3.
   * Costs 1 Encounter Token.
   */
  const useEncounterToken = (routeName) => {
    if (encounterTokens <= 0) {
      window.alert(`No Encounter Tokens left! You've used your 3 guaranteed slots on ${routeName}. Purchase more tokens in the Store.`)
      return
    }

    if (!window.confirm(`Spend 1 Encounter Token for an extra encounter on ${routeName}? (${encounterTokens} token${encounterTokens !== 1 ? 's' : ''} remaining)`)) return

    const routeIndex = route.findIndex(r => r.name === routeName)
    const extrasCount = custom.filter(c => c.parentId === routeName).length
    const loc = {
      type: 'custom',
      name: `${routeName} (Extra ${extrasCount + 1})`,
      parentId: routeName,
      id: `${routeName.toLowerCase().replace(/\s+/g, '-')}-extra-${extrasCount + 1}`,
      index: routeIndex !== -1 ? routeIndex + 1 : 9999
    }
    custom = custom.concat(loc)

    store.update((raw) => {
      const d = JSON.parse(raw)
      const newCustom = (d.__custom || []).concat(loc)
      const newTokens = Math.max(0, (d.__encounterTokens || 0) - 1)
      return JSON.stringify({ ...d, __encounterTokens: newTokens, __custom: newCustom })
    })
  }

  const onnewlocation = (e) => {
    const index = e.detail.id + 1
    const loc = { type: 'custom', name: '', id: shortuuid(), index }
    custom = custom.concat(loc)
    store.update(addlocation(loc))
  }

  const ondeletelocation = (e) => {
    const id = e.detail.id
    custom = custom.filter((i) => i.id !== id)
    store.update(removelocation(id))
  }

  const onhidelocation = (e) => {
    const id = e.detail.id
    store.update(hidelocation(id))
  }

  /** Event Handlers */
  const setstarter = (e) => {
    starter = e.detail.value
    game.store.update(patch({ __starter: starter }))
  }

  export const setnav = (e) =>
    setloc(`boss-${e.detail.value}`, e.detail.value + 20)

  export const setroute =
    ({ name, id }) =>
    () =>
      setloc(`route-${name}`, id + 10)

  let scroll, ulRef
  const scrollToItem = (id) => {
    document.getElementById(id).scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    })
  }

  const setloc = (id, i) => {
    document.getElementById(id) ? scrollToItem(id) : (scroll = id)
  }

  const locid = (p, i) => {
    return p.type === 'custom'
      ? slugify(`${p.type}-${p.name}-${p.id}`)
      : slugify(`${p.type}-${p.name}-${p.origPos}`)
  }

  afterUpdate(() => {
    if (!scroll) return
    setTimeout(scrollToItem.bind({}, scroll))
    scroll = null
  })

  $: routeList = insertList(route, custom).filter(p => !p.parentId)
  $: getExtras = (routeName) => custom.filter(c => c.parentId === routeName || (c.name && c.name.startsWith(routeName) && c.name.includes('(Extra')))
  $: firstUndefeatedLeaderIndex = routeList.findIndex((p) =>
    isGym(p) && p.group === 'gym-leader' && !bossTeamIds.includes(p.value)
  )
  $: isProgressLocked = (id) =>
    firstUndefeatedLeaderIndex >= 0 &&
    id > firstUndefeatedLeaderIndex

</script>

<ul bind:this={ulRef} class="flex flex-col gap-y-0 lg:gap-y-2 {className}">
  {#each routeList as p, id (locid(p, id))}
    {@const hidden = !filterEntry(filters, search, game.data, progress - 1)(p)}

  {#if isStarter(p)}
      <li
        class="flex items-center gap-x-2"
        id="route-{p.name}"
        in:fade
        out:fade={{ duration: 100 }}
        class:hidden={hidden || !showStarterRoute(p, filters, hideRoute)}
      >
        <PokemonSelector
          {id}
          {store}
          cap={5}
          encounters={p.encounters}
          encounterRates={p.encounterRates}
          type="starter"
          location="Starter"
          locationName="Starter"
          on:new={onnewlocation}
        >
          <div
            slot="location"
            class="-mr-1 flex flex-row-reverse items-center gap-x-2 lg:-ml-6 lg:flex-row"
          >
            <StarterType {key} on:select={setstarter} bind:starter />
            <p>
              Starter* <Tooltip
                >Selecting a starter species modifies Rival encounters.</Tooltip
              >
            </p>
          </div>
        </PokemonSelector>
      </li>
    {:else if isRoute(p)}
      <li
        class="location-group mb-4 flex w-full flex-col gap-y-2 rounded-2xl border border-gray-100 bg-white/40 p-3 shadow-sm transition-all hover:bg-white/60 dark:border-gray-800/50 dark:bg-gray-900/20 dark:hover:bg-gray-900/40 lg:mb-6"
        id="route-{p.name}"
        in:fade
        out:fade={{ duration: 100 }}
        class:hidden={hidden || isProgressLocked(id) || !showRoute(p, filters, hideRoute)}
      >
        <div class="flex items-center justify-between px-1">
          <h3 class="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
            {p.name}
          </h3>
          
          {#if encounterTokens > 0}
            <button
              class="inline-flex items-center gap-x-1 rounded-full bg-lime-100 px-2 py-0.5 text-[10px] font-bold text-lime-700 shadow-xs transition hover:bg-lime-200 dark:bg-lime-900/40 dark:text-lime-300 dark:hover:bg-lime-800/60"
              title="Spend 1 Encounter Token for an extra slot on {p.name}"
              on:click={() => useEncounterToken(p.name)}
            >
              <Icon inline icon={Gift} height="0.8rem" />
              +1 SLOT ({encounterTokens})
            </button>
          {/if}
        </div>

        <div class="flex flex-col gap-y-1">
          <PokemonSelector
            {id}
            {store}
            cap={p.cap}
            method={p.method}
            infolink={toDbLocation(key, p.name)}
            location={p.name}
            encounters={p.encounters}
            encounterRates={p.encounterRates}
            on:hide={onhidelocation}
            on:new={onnewlocation}
          />
          
          <PokemonSelector
            id="{id}-2"
            {store}
            cap={p.cap}
            method={p.method}
            location="{p.name} (Roll 2)"
            locationName="{p.name} (Roll 2)"
            encounters={p.encounters}
            encounterRates={p.encounterRates}
            on:new={onnewlocation}
          />

          <PokemonSelector
            id="{id}-3"
            {store}
            cap={p.cap}
            method={p.method}
            location="{p.name} (Roll 3)"
            locationName="{p.name} (Roll 3)"
            encounters={p.encounters}
            encounterRates={p.encounterRates}
            on:new={onnewlocation}
          />

          {#each getExtras(p.name) as extra, i}
            <PokemonSelector
              id="{id}-extra-{i}"
              {store}
              cap={p.cap}
              method={p.method}
              type="custom"
              location={extra.id}
              locationName={extra.name}
              encounters={p.encounters}
              encounterRates={p.encounterRates}
              on:new={onnewlocation}
              on:delete={ondeletelocation}
            />
          {/each}
        </div>
      </li>
    {:else if isCustom(p)}
      <li
        class="location flex items-center gap-x-2"
        id="custom-{p.index}"
        in:fade
        out:fade={{ duration: 100 }}
        class:hidden={hidden || isProgressLocked(id) || !showCustom(p, filters, hideRoute)}
      >
        <PokemonSelector
          type="custom"
          locationName={p.name}
          location={p.id}
          {id}
          {store}
          encounters={p.encounters}
          encounterRates={p.encounterRates}
          on:new={onnewlocation}
          on:delete={ondeletelocation}
        >
          <svelte:fragment slot="location">
            <CustomLocation {store} id={p.id} />
          </svelte:fragment>
        </PokemonSelector>
      </li>
    {:else if isGym(p)}
      <li
        class="boss -mb-4 md:my-2"
        class:hidden={hidden || isProgressLocked(id) || !showGym(p, filters)}
        id="boss-{id}"
        in:fade
        out:fade={{ duration: 100 }}
      >
        <GymCard
          forceVs
          {starter}
          game={key}
          id={p.value}
          defeated={bossTeamIds.includes(p.value)}
          location={p.name}
          type={p.group}
        />
      </li>
    {/if}
  {/each}
</ul>

<style>
  li {
    scroll-margin-top: 28px;
    @apply snap-start;
  }

  @media (min-width: theme('screens.md')) {
    li.location {
      scroll-margin-top: 32px;
    }
  }
</style>
