<script>
  import { getContext } from 'svelte'
  import { fade } from 'svelte/transition'
  import { capitalise } from '$utils/string'
  import { pokeapi } from '$utils/api'
  import { AutoComplete, Loader, Icon, IconButton, PIcon, Tooltip } from '$c/core'
  import { Save, X, Info } from '$icons'
  import { Natures, NaturesMap } from '$lib/data/natures'
  import tmsData from '$lib/data/tms.json'
  import {
    findCatalogItemId,
    getHeldItemAvailableCount,
    getHeldItemCatalog,
    getHeldItemUsage,
    getPokemonHeldItemId,
    getPokemonStorageKey,
    isRemovedTmAlias
  } from '$lib/utils/economy'

  export let pokemon
  export let inventory = {}
  export let box = []
  export let itemCatalog = null
  export let onSave = () => {}

  const { close } = getContext('simple-modal')

  const stats = ['hp', 'atk', 'def', 'spa', 'spd', 'spe']
  const statLabel = {
    hp: 'HP',
    atk: 'ATK',
    def: 'DEF',
    spa: 'SPA',
    spd: 'SPD',
    spe: 'SPE'
  }
  const tabs = ['Overview', 'Moves', 'Stats', 'Item']

  let activeTab = 'Overview'
  let level = pokemon.level || 1
  let nickname = pokemon.nickname || ''
  let ability = pokemon.ability || ''
  let nature = pokemon.nature || ''
  let selectedNature = Natures.find((n) => n.id === nature) || null
  let ivs = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31, ...(pokemon.ivs || {}) }
  let evs = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0, ...(pokemon.evs || {}) }
  let availableMoves = []
  let loadingMoves = true
  let showShowdownImport = false
  let showdownText = ''
  let moveDetails = {}
  let itemSearch = ''
  let lastMoveFetchKey = ''
  let moves = [...(pokemon.moves || []).map((m) => (typeof m === 'string' ? m : m.name)), '', '', '', ''].slice(0, 4)
  let selectedMoves = moves.map((name) => moveOption(name))
  let heldItem = getPokemonHeldItemId(pokemon)
  const originalHeldItem = heldItem
  const pokemonKey = getPokemonStorageKey(pokemon)

  const pokemonName = pokemon.pokemon || pokemon.name || ''
  const pokemonLabel = capitalise(pokemonName)

  $: heldCatalog = Object.entries(itemCatalog || getHeldItemCatalog()).reduce((acc, [id, item]) => {
    if (item.type === 'held') acc[id] = item
    return acc
  }, {})
  $: heldItems = Object.values(heldCatalog).sort((a, b) => a.name.localeCompare(b.name))
  $: heldUsage = getHeldItemUsage(box, { excludeKey: pokemonKey })
  $: selectedHeldItem = heldCatalog[heldItem]
  $: selectedHeldAvailable = heldItem ? getHeldItemAvailableCount(inventory, heldUsage, heldItem) : Infinity
  $: heldItemBlocked = !!heldItem && heldItem !== originalHeldItem && selectedHeldAvailable <= 0
  $: heldItemWarning =
    !!heldItem && selectedHeldAvailable <= 0
      ? heldItem === originalHeldItem
        ? 'This save already has this item equipped, but your locker has no free copies. You can keep or remove it, but cannot equip extra copies elsewhere.'
        : 'No free copies remain in your locker.'
      : ''
  $: selectedNature && selectedNature.id !== nature && (nature = selectedNature.id)
  $: selectedMoves, (moves = selectedMoves.map((move) => move?.name || ''))
  $: evTotal = Object.values(evs).reduce((a, b) => a + (Number(b) || 0), 0)
  $: filteredHeldItems = heldItems.filter((item) => {
    const query = itemSearch.toLowerCase().trim()
    if (!query) return true
    return `${item.name} ${item.id} ${item.description}`.toLowerCase().includes(query)
  })
  $: {
    const key = `${pokemonName}:${level}`
    if (pokemonName && key !== lastMoveFetchKey) {
      lastMoveFetchKey = key
      fetchAvailableMoves()
    }
  }
  $: {
    selectedMoves.forEach((move) => {
      if (move?.name) fetchMoveDetails(move.name)
    })
  }

  function moveOption(name) {
    if (!name) return null
    return availableMoves.find((move) => move.name === name) || { name, isCustom: true }
  }

  function syncSelectedMoves() {
    selectedMoves = moves.map((name) => moveOption(name))
  }

  function cleanPokemonApiName(name) {
    return name
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/\./g, '')
      .replace(/'/g, '')
      .replace(/jr\./g, 'jr')
      .replace(/mime\./g, 'mime')
  }

  async function fetchAvailableMoves() {
    loadingMoves = true
    try {
      const data = await pokeapi(`pokemon/${cleanPokemonApiName(pokemonName)}`)
      if (data?.moves) {
        const learnset = data.moves
          .map((move) => {
            const detail = move.version_group_details.find((d) => d.move_learn_method.name === 'level-up')
            return detail
              ? {
                  name: capitalise(move.move.name.replace(/-/g, ' ')),
                  level: detail.level_learned_at
                }
              : null
          })
          .filter((move) => move && move.level <= level)
          .map((move) => ({ name: move.name, isTM: false }))

        const ownedTMs = []
        Object.keys(inventory || {}).forEach((itemId) => {
          if (!itemId.startsWith('tm-')) return
          const moveAlias = itemId.replace('tm-', '')
          if (isRemovedTmAlias(moveAlias)) return

          const canLearn = data.moves.some((move) => move.move.name === moveAlias)
          if (!canLearn) return

          for (const tier of Object.values(tmsData)) {
            const tm = tier.find((move) => move.alias === moveAlias)
            if (tm) ownedTMs.push({ name: tm.name, isTM: true })
          }
        })

        const eggMoves = []
        if ((inventory || {})['heart-scale'] > 0) {
          data.moves.forEach((move) => {
            const detail = move.version_group_details.find((d) => d.move_learn_method.name === 'egg')
            if (detail) eggMoves.push({ name: capitalise(move.move.name.replace(/-/g, ' ')), isEgg: true })
          })
        }

        const uniqueMovesMap = new Map()
        ;[...learnset, ...ownedTMs, ...eggMoves, ...selectedMoves.filter(Boolean)].forEach((move) => {
          if (uniqueMovesMap.has(move.name)) {
            if (move.isTM) uniqueMovesMap.get(move.name).isTM = true
            if (move.isEgg) uniqueMovesMap.get(move.name).isEgg = true
            if (move.isCustom) uniqueMovesMap.get(move.name).isCustom = true
          } else {
            uniqueMovesMap.set(move.name, move)
          }
        })
        availableMoves = Array.from(uniqueMovesMap.values()).sort((a, b) => a.name.localeCompare(b.name))
        syncSelectedMoves()
      }
    } catch (e) {
      console.error('Failed to fetch moves', e)
    } finally {
      loadingMoves = false
    }
  }

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
        effect:
          data.effect_entries?.find((entry) => entry.language.name === 'en')?.short_effect ||
          data.flavor_text_entries?.find((entry) => entry.language.name === 'en')?.flavor_text ||
          ''
      }
    } catch (e) {
      delete moveDetails[moveName]
    }
  }

  function setMove(index, value) {
    selectedMoves[index] = value
    selectedMoves = selectedMoves
  }

  function itemAvailable(itemId) {
    return getHeldItemAvailableCount(inventory, heldUsage, itemId)
  }

  function itemHolders(itemId) {
    return heldUsage.holders[itemId] || []
  }

  function parseShowdown() {
    if (!showdownText) return
    const lines = showdownText.split('\n').map((line) => line.trim()).filter(Boolean)
    if (!lines.length) return

    const [pokemonPart, itemPart] = lines[0].split('@')
    const part = pokemonPart.trim()
    const matches = [...part.matchAll(/\((.*?)\)/g)]
    if (matches.length >= 1) {
      const content = matches[0][1]
      if (content !== 'M' && content !== 'F') {
        nickname = part.split('(')[0].trim()
      } else if (matches.length === 2) {
        nickname = part.split('(')[0].trim()
      }
    }

    if (itemPart) {
      const parsedHeldItem = findCatalogItemId(itemPart.trim(), heldCatalog)
      if (parsedHeldItem) heldItem = parsedHeldItem
    }

    const levelLine = lines.find((line) => line.startsWith('Level:'))
    if (levelLine) level = parseInt(levelLine.replace('Level:', '').trim())

    const abilityLine = lines.find((line) => line.startsWith('Ability:'))
    if (abilityLine) ability = capitalise(abilityLine.replace('Ability:', '').trim())

    const natureLine = lines.find((line) => line.endsWith('Nature'))
    if (natureLine) {
      const nextNature = natureLine.replace('Nature', '').trim().toLowerCase()
      if (NaturesMap[nextNature]) {
        nature = nextNature
        selectedNature = Natures.find((n) => n.id === nextNature) || null
      }
    }

    const evLine = lines.find((line) => line.startsWith('EVs:'))
    if (evLine) {
      const nextEvs = { ...evs }
      evLine.replace('EVs:', '').split('/').forEach((part) => {
        const [val, stat] = part.trim().split(' ')
        const key = stat.toLowerCase() === 'spd' ? 'spd' : stat.toLowerCase() === 'spa' ? 'spa' : stat.toLowerCase()
        if (nextEvs[key] !== undefined) nextEvs[key] = parseInt(val)
      })
      evs = nextEvs
    }

    const ivLine = lines.find((line) => line.startsWith('IVs:'))
    if (ivLine) {
      const nextIvs = { ...ivs }
      ivLine.replace('IVs:', '').split('/').forEach((part) => {
        const [val, stat] = part.trim().split(' ')
        const key = stat.toLowerCase() === 'spd' ? 'spd' : stat.toLowerCase() === 'spa' ? 'spa' : stat.toLowerCase()
        if (nextIvs[key] !== undefined) nextIvs[key] = parseInt(val)
      })
      ivs = nextIvs
    }

    const moveLines = lines.filter((line) => line.startsWith('-'))
    if (moveLines.length) {
      moves = moveLines.map((line) => capitalise(line.replace('-', '').trim())).slice(0, 4)
      while (moves.length < 4) moves.push('')
      syncSelectedMoves()
    }

    showShowdownImport = false
    showdownText = ''
  }

  function cleanStats(values, max) {
    return stats.reduce((acc, stat) => {
      const value = Number(values[stat] || 0)
      acc[stat] = Math.max(0, Math.min(max, value))
      return acc
    }, {})
  }

  function save() {
    if (heldItemBlocked) return
    onSave({
      ...pokemon,
      level: Number(level) || 1,
      nickname,
      ability,
      nature,
      heldItem: heldItem || undefined,
      ivs: cleanStats(ivs, 31),
      evs: cleanStats(evs, 252),
      moves: selectedMoves.map((move) => move?.name).filter(Boolean)
    })
    close()
  }
</script>

<div class="max-h-[88vh] w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-gray-950">
  <div class="sticky top-0 z-20 border-b border-gray-200 bg-white/95 px-5 py-4 backdrop-blur dark:border-gray-800 dark:bg-gray-950/95">
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div class="flex min-w-0 items-center gap-4">
        <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-900">
          <PIcon name={pokemonName} className="scale-125" />
        </div>
        <div class="min-w-0">
          <p class="text-xs font-black uppercase tracking-[0.24em] text-gray-400">Edit Pokemon</p>
          <h2 class="truncate text-3xl font-black text-gray-900 dark:text-gray-50">{nickname || pokemonLabel}</h2>
          <div class="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span>Level {level || 1}</span>
            <span class="h-1 w-1 rounded-full bg-gray-400"></span>
            {#if selectedHeldItem}
              <span class="inline-flex items-center gap-1 rounded-full bg-lime-100 px-2 py-1 font-bold text-lime-800 dark:bg-lime-400/10 dark:text-lime-300">
                <PIcon type="item" name={selectedHeldItem.sprite || selectedHeldItem.id} className="h-4 w-4" />
                {selectedHeldItem.name}
              </span>
            {:else}
              <span>No held item</span>
            {/if}
          </div>
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-end gap-2">
        <button
          on:click={() => (showShowdownImport = !showShowdownImport)}
          class="rounded-lg bg-gray-100 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-gray-500 transition hover:bg-blue-100 hover:text-blue-700 dark:bg-gray-900 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
        >
          Import Showdown
        </button>
        <button
          on:click={save}
          disabled={heldItemBlocked}
          class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-black text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Icon icon={Save} />
          Save
        </button>
        <IconButton icon={X} on:click={close} />
      </div>
    </div>

    <div class="mt-4 flex gap-2 overflow-x-auto">
      {#each tabs as tab}
        <button
          on:click={() => (activeTab = tab)}
          class="rounded-lg px-3 py-2 text-sm font-black transition {activeTab === tab ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-950' : 'bg-gray-100 text-gray-500 hover:text-gray-900 dark:bg-gray-900 dark:text-gray-400 dark:hover:text-white'}"
        >
          {tab}
        </button>
      {/each}
    </div>
  </div>

  <div class="max-h-[calc(88vh-9rem)] overflow-y-auto p-5">
    {#if showShowdownImport}
      <div class="mb-5 rounded-xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20" in:fade>
        <div class="mb-3 text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-300">Paste Showdown Set</div>
        <textarea
          bind:value={showdownText}
          placeholder="Species @ Item&#10;Ability: ...&#10;Level: 50&#10;EVs: 252 Atk / 252 Spe&#10;Jolly Nature&#10;- Move 1&#10;- Move 2..."
          class="h-36 w-full rounded-lg border border-blue-200 bg-white p-3 font-mono text-sm outline-none dark:border-blue-900 dark:bg-gray-900 dark:text-white"
        ></textarea>
        <div class="mt-3 flex justify-end gap-2">
          <button
            on:click={() => (showShowdownImport = false)}
            class="rounded-lg px-3 py-2 text-xs font-black text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Cancel
          </button>
          <button on:click={parseShowdown} class="rounded-lg bg-blue-600 px-4 py-2 text-xs font-black text-white hover:bg-blue-700">
            Parse Set
          </button>
        </div>
      </div>
    {/if}

    {#if activeTab === 'Overview'}
      <section class="grid gap-4 md:grid-cols-2">
        <label class="space-y-2">
          <span class="text-xs font-black uppercase tracking-wider text-gray-500">Nickname</span>
          <input
            type="text"
            bind:value={nickname}
            placeholder={pokemonLabel}
            class="h-12 w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 text-lg font-bold outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </label>

        <label class="space-y-2">
          <span class="text-xs font-black uppercase tracking-wider text-gray-500">Level</span>
          <input
            type="number"
            bind:value={level}
            min="1"
            max="100"
            class="h-12 w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 text-lg font-bold outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </label>

        <div class="space-y-2">
          <span class="text-xs font-black uppercase tracking-wider text-gray-500">Nature</span>
          <AutoComplete
            id="pokemon-editor-nature"
            placeholder="Select Nature"
            bind:selected={selectedNature}
            itemF={() => Natures}
            labelF={(nature) => nature?.label || ''}
            searchKeyF={(nature) => `${nature?.label || ''} ${nature?.id || ''}`}
          />
        </div>

        <label class="space-y-2">
          <span class="text-xs font-black uppercase tracking-wider text-gray-500">Ability</span>
          <input
            type="text"
            bind:value={ability}
            placeholder="Ability"
            class="h-12 w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 text-lg font-bold outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </label>
      </section>
    {:else if activeTab === 'Moves'}
      <section class="space-y-4">
        {#if loadingMoves}
          <div class="flex items-center gap-2 rounded-xl border border-gray-200 p-5 text-sm font-bold text-gray-400 dark:border-gray-800">
            <Loader size="xs" /> Loading available moves...
          </div>
        {:else}
          <div class="grid gap-3 md:grid-cols-2">
            {#each [0, 1, 2, 3] as i}
              <div class="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900/60">
                <div class="mb-2 flex items-center justify-between">
                  <span class="text-xs font-black uppercase tracking-wider text-gray-500">Move {i + 1}</span>
                  <button
                    on:click={() => setMove(i, null)}
                    class="rounded-md px-2 py-1 text-[10px] font-black uppercase text-gray-400 hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                  >
                    Clear
                  </button>
                </div>
                <div class="flex items-center gap-2">
                  <div class="min-w-0 flex-1">
                    <AutoComplete
                      id={`pokemon-editor-move-${i}`}
                      placeholder={`Move ${i + 1}`}
                      bind:selected={selectedMoves[i]}
                      itemF={() => availableMoves}
                      labelF={(move) => move?.name || ''}
                      searchKeyF={(move) => `${move?.name || ''} ${move?.isTM ? 'tm' : ''} ${move?.isEgg ? 'egg' : ''}`}
                    >
                      <div slot="option" let:option let:label class="flex items-center justify-between gap-4 py-1">
                        <span>{@html label}</span>
                        <span class="flex gap-1">
                          {#if option.isTM}<span class="rounded bg-blue-100 px-1.5 py-0.5 text-[9px] font-black text-blue-700">TM</span>{/if}
                          {#if option.isEgg}<span class="rounded bg-pink-100 px-1.5 py-0.5 text-[9px] font-black text-pink-700">Egg</span>{/if}
                          {#if option.isCustom}<span class="rounded bg-gray-100 px-1.5 py-0.5 text-[9px] font-black text-gray-600">Custom</span>{/if}
                        </span>
                      </div>
                    </AutoComplete>
                  </div>
                  {#if moves[i] && moveDetails[moves[i]] && moveDetails[moves[i]] !== 'loading'}
                    <span class="relative shrink-0 cursor-help opacity-60 transition hover:opacity-100">
                      <Icon inline icon={Info} class="text-xl" />
                      <Tooltip>
                        <div class="w-52 space-y-1 p-2 text-sm">
                          <div class="mb-1 border-b pb-1 font-bold">{moves[i]}</div>
                          <div class="capitalize">Type: {moveDetails[moves[i]].type}</div>
                          {#if moveDetails[moves[i]].power}<div>Power: {moveDetails[moves[i]].power}</div>{/if}
                          {#if moveDetails[moves[i]].acc}<div>Accuracy: {moveDetails[moves[i]].acc}%</div>{/if}
                          <div class="mt-1 text-xs leading-tight opacity-80">{moveDetails[moves[i]].effect}</div>
                        </div>
                      </Tooltip>
                    </span>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </section>
    {:else if activeTab === 'Stats'}
      <section class="grid gap-5 lg:grid-cols-2">
        <div class="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/60">
          <h3 class="mb-3 text-sm font-black uppercase tracking-wider text-gray-500">Individual Values</h3>
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {#each stats as stat}
              <label class="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-950">
                <span class="text-xs font-black text-gray-500">{statLabel[stat]}</span>
                <input type="number" bind:value={ivs[stat]} min="0" max="31" class="w-14 bg-transparent text-right font-mono text-lg font-black outline-none dark:text-white" />
              </label>
            {/each}
          </div>
        </div>

        <div class="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/60">
          <div class="mb-3 flex items-center justify-between">
            <h3 class="text-sm font-black uppercase tracking-wider text-gray-500">Effort Values</h3>
            <span class="text-xs font-black {evTotal > 510 ? 'text-red-500' : 'text-gray-400'}">{evTotal} / 510</span>
          </div>
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {#each stats as stat}
              <label class="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-950">
                <span class="text-xs font-black text-blue-500">EV:{statLabel[stat]}</span>
                <input type="number" bind:value={evs[stat]} min="0" max="252" class="w-16 bg-transparent text-right font-mono text-lg font-black outline-none dark:text-white" />
              </label>
            {/each}
          </div>
        </div>
      </section>
    {:else if activeTab === 'Item'}
      <section class="space-y-4">
        {#if heldItemWarning}
          <div class="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-bold text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-200">
            {heldItemWarning}
          </div>
        {/if}

        <div class="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
          <input
            type="search"
            bind:value={itemSearch}
            placeholder="Search held items..."
            class="h-12 rounded-xl border-2 border-gray-200 bg-gray-50 px-4 font-bold outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
          <button
            on:click={() => (heldItem = '')}
            class="rounded-xl border-2 border-gray-200 px-4 py-2 text-sm font-black text-gray-500 transition hover:border-gray-400 hover:text-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:text-white"
          >
            No item
          </button>
        </div>

        <div class="grid max-h-[24rem] gap-3 overflow-y-auto pr-1 md:grid-cols-2">
          {#each filteredHeldItems as item}
            {@const available = itemAvailable(item.id)}
            {@const holders = itemHolders(item.id)}
            {@const selected = heldItem === item.id}
            {@const disabled = !selected && available <= 0}
            <button
              on:click={() => (heldItem = item.id)}
              {disabled}
              class="flex items-start gap-3 rounded-xl border p-3 text-left transition {selected ? 'border-lime-400 bg-lime-50 dark:border-lime-500 dark:bg-lime-500/10' : 'border-gray-200 bg-gray-50 hover:border-gray-400 hover:bg-white dark:border-gray-800 dark:bg-gray-900/60 dark:hover:border-gray-600'} {disabled ? 'cursor-not-allowed opacity-45' : ''}"
            >
              <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-gray-950">
                <PIcon type="item" name={item.sprite || item.id} className="h-9 w-9" />
              </span>
              <span class="min-w-0 flex-1">
                <span class="flex items-start justify-between gap-3">
                  <span class="font-black text-gray-900 dark:text-white">{item.name}</span>
                  <span class="shrink-0 rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-black text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                    {available} free / {inventory[item.id] || 0}
                  </span>
                </span>
                <span class="mt-1 block text-xs leading-snug text-gray-500 dark:text-gray-400">{item.description}</span>
                {#if holders.length}
                  <span class="mt-2 block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Equipped by {holders.map((holder) => holder.name).join(', ')}
                  </span>
                {/if}
              </span>
            </button>
          {/each}
        </div>
      </section>
    {/if}
  </div>
</div>
