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
  const HEART_SCALE_EGG_MOVE_LIMIT = 1

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
  let showdownCopied = false
  let natureMenuOpen = false
  let moveDetails = {}
  let itemSearch = ''
  let showOwnedHeldOnly = false
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
  $: selectedEggMoveCount = selectedMoves.filter((move) => move?.isEgg).length
  $: eggMoveBlocked = selectedEggMoveCount > HEART_SCALE_EGG_MOVE_LIMIT
  $: filteredHeldItems = heldItems.filter((item) => {
    const query = itemSearch.toLowerCase().trim()
    if (showOwnedHeldOnly && !Number(inventory[item.id] || 0) && heldItem !== item.id) return false
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

  function chooseNature(nextNature) {
    selectedNature = nextNature
    nature = nextNature?.id || ''
    natureMenuOpen = false
  }

  function moveOptionsForSlot(index) {
    const current = selectedMoves[index]
    return availableMoves.filter((move) => {
      if (!move?.isEgg) return true
      if (current?.name === move.name) return true
      return selectedEggMoveCount < HEART_SCALE_EGG_MOVE_LIMIT
    })
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

  function statLine(label, values, defaultValue = 0) {
    const parts = stats
      .map((stat) => [statLabel[stat].replace('SPA', 'SpA').replace('SPD', 'SpD').replace('SPE', 'Spe'), Number(values[stat]) || 0])
      .filter(([, value]) => value !== defaultValue)
      .map(([stat, value]) => `${value} ${stat}`)
    return parts.length ? `${label}: ${parts.join(' / ')}` : ''
  }

  function showdownExportText() {
    const displayName = nickname && nickname !== pokemonLabel ? `${nickname} (${pokemonLabel})` : pokemonLabel
    const header = `${displayName}${selectedHeldItem ? ` @ ${selectedHeldItem.name}` : ''}`
    return [
      header,
      ability ? `Ability: ${ability}` : '',
      level ? `Level: ${Number(level) || 1}` : '',
      statLine('EVs', evs, 0),
      selectedNature ? `${selectedNature.label} Nature` : nature ? `${capitalise(nature)} Nature` : '',
      statLine('IVs', ivs, 31),
      ...selectedMoves.map((move) => move?.name).filter(Boolean).map((move) => `- ${move}`)
    ].filter(Boolean).join('\n')
  }

  async function copyShowdownExport() {
    const text = showdownExportText()
    showdownCopied = false
    try {
      await navigator.clipboard.writeText(text)
      showdownCopied = true
    } catch (e) {
      showdownText = text
      showShowdownImport = true
    }
  }

  function cleanStats(values, max) {
    return stats.reduce((acc, stat) => {
      const value = Number(values[stat] || 0)
      acc[stat] = Math.max(0, Math.min(max, value))
      return acc
    }, {})
  }

  function save() {
    if (heldItemBlocked || eggMoveBlocked) return
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

<div class="pokemon-editor max-h-[94vh] w-[min(96vw,80rem)] overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900">
  <div class="editor-header sticky top-0 z-20 border-b border-gray-200 bg-white/95 px-5 py-4 backdrop-blur dark:border-gray-800 dark:bg-gray-900/95">
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div class="flex min-w-0 items-center gap-4">
        <div class="sprite-frame flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-900">
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

      <div class="header-actions flex flex-wrap items-center justify-end gap-2">
        <button
          on:click={copyShowdownExport}
          class="import-button rounded-lg bg-gray-100 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-gray-500 transition hover:bg-blue-100 hover:text-blue-700 dark:bg-gray-900 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
        >
          {showdownCopied ? 'Copied Set' : 'Export Showdown'}
        </button>
        <button
          on:click={() => (showShowdownImport = !showShowdownImport)}
          class="import-button rounded-lg bg-gray-100 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-gray-500 transition hover:bg-blue-100 hover:text-blue-700 dark:bg-gray-900 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
        >
          Import Showdown
        </button>
        <button
          on:click={save}
          disabled={heldItemBlocked || eggMoveBlocked}
          class="save-button inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-black text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Icon icon={Save} />
          Save
        </button>
        <IconButton icon={X} on:click={close} />
      </div>
    </div>

    <div class="editor-tabs mt-4 flex gap-2 overflow-x-auto">
      {#each tabs as tab}
        <button
          on:click={() => (activeTab = tab)}
          class="rounded-lg px-3 py-2 text-sm font-black transition {activeTab === tab ? 'active bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900' : 'bg-gray-100 text-gray-600 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-300 dark:hover:text-white'}"
        >
          {tab}
        </button>
      {/each}
    </div>
  </div>

  <div class="editor-body max-h-[calc(94vh-9rem)] overflow-y-auto p-5 md:p-6">
    {#if showShowdownImport}
      <div class="mb-5 rounded-xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20" in:fade>
        <div class="mb-3 text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-300">Showdown Set</div>
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
      <section class="overview-grid grid gap-4 md:grid-cols-2">
        <label class="editor-field space-y-2">
          <span>Nickname</span>
          <input
            type="text"
            bind:value={nickname}
            placeholder={pokemonLabel}
            class="editor-input h-12 w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 text-lg font-bold outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </label>

        <label class="editor-field space-y-2">
          <span>Level</span>
          <input
            type="number"
            bind:value={level}
            min="1"
            max="100"
            class="editor-input h-12 w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 text-lg font-bold outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </label>

        <div class="editor-field space-y-2">
          <span>Nature</span>
          <div class="nature-picker">
            <button
              type="button"
              class="nature-trigger"
              aria-haspopup="listbox"
              aria-expanded={natureMenuOpen}
              on:click={() => (natureMenuOpen = !natureMenuOpen)}
            >
              <span>{selectedNature?.label || 'Select Nature'}</span>
              <small>{selectedNature?.value?.length ? `+${statLabel[selectedNature.value[0]]} / -${statLabel[selectedNature.value[1]]}` : 'Neutral'}</small>
            </button>
            {#if natureMenuOpen}
              <div class="nature-menu" role="listbox">
                {#each Natures as natureOption}
                  <button
                    type="button"
                    role="option"
                    aria-selected={selectedNature?.id === natureOption.id}
                    class:selected={selectedNature?.id === natureOption.id}
                    on:click={() => chooseNature(natureOption)}
                  >
                    <b>{natureOption.label}</b>
                    <span>{natureOption.value?.length ? `+${statLabel[natureOption.value[0]]} / -${statLabel[natureOption.value[1]]}` : 'Neutral'}</span>
                  </button>
                {/each}
              </div>
            {/if}
          </div>
        </div>

        <label class="editor-field space-y-2">
          <span>Ability</span>
          <input
            type="text"
            bind:value={ability}
            placeholder="Ability"
            class="editor-input h-12 w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 text-lg font-bold outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
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
          <div class="rounded-xl border border-pink-200 bg-pink-50 p-3 text-xs font-bold text-pink-800 dark:border-pink-700 dark:bg-pink-900/20 dark:text-pink-200">
            Heart Scale unlocks one egg move total. Current egg moves: {selectedEggMoveCount} / {HEART_SCALE_EGG_MOVE_LIMIT}.
          </div>
          {#if eggMoveBlocked}
            <div class="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-800 dark:border-red-700 dark:bg-red-900/20 dark:text-red-200">
              Remove extra egg moves before saving.
            </div>
          {/if}
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
                      itemF={() => moveOptionsForSlot(i)}
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
              <label class="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
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
              <label class="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
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

        <label class="owned-toggle">
          <input type="checkbox" bind:checked={showOwnedHeldOnly} />
          <span>Only show bought items</span>
        </label>

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
              <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-gray-900">
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

<style lang="postcss">
  .pokemon-editor {
    --editor-panel: theme('colors.white');
    --editor-muted: theme('colors.gray.500');
    --editor-border: theme('colors.gray.200');
    --editor-soft: theme('colors.gray.50');
    --editor-ink: theme('colors.gray.900');
  }

  :global(.dark) .pokemon-editor {
    --editor-panel: theme('colors.gray.900');
    --editor-muted: theme('colors.gray.400');
    --editor-border: theme('colors.gray.800');
    --editor-soft: theme('colors.gray.900');
    --editor-ink: theme('colors.gray.50');
  }

  .editor-header {
    @apply shadow-sm;
  }

  .sprite-frame {
    @apply border border-gray-200/80 shadow-inner dark:border-gray-800;
  }

  .header-actions {
    @apply shrink-0;
  }

  .import-button,
  .save-button {
    @apply min-h-[2.75rem] rounded-xl px-4;
  }

  .import-button {
    @apply border border-gray-200 bg-gray-50 text-gray-600 shadow-sm hover:border-blue-200 dark:border-gray-800 dark:bg-gray-900;
  }

  .save-button {
    @apply shadow-xl shadow-blue-500/20;
  }

  .owned-toggle {
    @apply inline-flex w-fit cursor-pointer items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-black uppercase tracking-wider text-gray-500 shadow-sm transition hover:border-blue-300 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-blue-500 dark:hover:text-blue-200;
  }

  .owned-toggle input {
    @apply h-4 w-4 accent-blue-600;
  }

  .editor-tabs {
    @apply rounded-2xl bg-gray-100/80 p-1 dark:bg-gray-900/80;
  }

  .editor-tabs button {
    @apply min-h-[2.5rem] rounded-xl px-4 text-sm;
  }

  .editor-tabs button.active {
    @apply shadow-lg shadow-gray-900/10 dark:shadow-none;
  }

  .editor-body {
    @apply bg-gray-50/70 dark:bg-gray-800;
  }

  .overview-grid {
    @apply relative z-30 overflow-visible rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-5 dark:border-gray-700 dark:bg-gray-900;
  }

  .editor-field > span {
    @apply block text-[11px] font-black uppercase tracking-[0.18em] text-gray-700 dark:text-gray-200;
  }

  .editor-input {
    @apply h-12 rounded-xl border border-gray-300 bg-white px-4 text-base font-black text-gray-900 shadow-inner outline-none transition placeholder:text-gray-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400;
  }

  .nature-picker {
    @apply relative;
    z-index: 1000;
  }

  .nature-trigger {
    @apply flex h-12 w-full items-center justify-between gap-3 rounded-xl border border-gray-300 bg-white px-4 text-left text-base font-black text-gray-900 shadow-inner outline-none transition hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white;
  }

  .nature-trigger small {
    @apply shrink-0 text-xs font-black uppercase tracking-wide text-gray-700 dark:text-gray-200;
  }

  .nature-menu {
    @apply absolute left-0 right-0 top-[calc(100%+0.5rem)] grid max-h-80 grid-cols-2 gap-2 overflow-y-auto rounded-xl border p-2 shadow-2xl;
    z-index: 9999;
    border-color: rgb(71 85 105);
    background: rgb(17 24 39);
    color: rgb(249 250 251);
  }

  .nature-menu button {
    @apply flex items-center justify-between gap-3 rounded-lg border border-transparent px-3 py-2 text-left text-sm transition focus:outline-none;
    color: rgb(249 250 251);
    background: transparent;
  }

  .nature-menu button b {
    @apply font-black;
  }

  .nature-menu button span {
    @apply shrink-0 text-[11px] font-black uppercase tracking-wide;
    color: rgb(203 213 225);
  }

  .nature-menu button:hover,
  .nature-menu button:focus {
    border-color: rgb(147 197 253);
    background: rgb(30 58 138);
    color: rgb(255 255 255);
  }

  .nature-menu button:hover span,
  .nature-menu button:focus span {
    color: rgb(219 234 254);
  }

  .nature-menu button.selected {
    border-color: rgb(96 165 250);
    background: rgb(37 99 235);
    color: rgb(255 255 255);
  }

  .nature-menu button.selected span {
    color: rgb(239 246 255);
  }

  :global(.editor-autocomplete) {
    @apply relative;
  }

  :global(.editor-autocomplete input) {
    @apply h-12 w-full rounded-xl border border-gray-300 bg-white px-4 pr-11 text-base font-black text-gray-900 shadow-inner outline-none transition placeholder:text-gray-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400;
  }

  :global(.editor-autocomplete > svg) {
    @apply right-3 border-0 text-gray-400 dark:text-gray-500;
  }

  :global(.editor-autocomplete .results) {
    @apply left-0 right-0 mt-2 max-h-60 w-full min-w-0 overflow-auto rounded-xl border border-gray-200 bg-white p-1 shadow-2xl dark:border-gray-700 dark:bg-gray-900;
    bottom: auto;
    top: 100%;
    transform: none;
  }

  :global(.editor-autocomplete .results ul) {
    @apply grid gap-1;
  }

  :global(.editor-autocomplete .results li),
  :global(.editor-autocomplete .results small) {
    @apply rounded-lg px-3 py-2 text-sm font-bold text-gray-700 dark:text-gray-200;
  }

  :global(.editor-autocomplete .results li:hover),
  :global(.editor-autocomplete .results ul:not(:hover) li:focus) {
    @apply bg-blue-50 text-blue-800 dark:bg-blue-500/20 dark:text-blue-100;
  }

  :global(.editor-autocomplete .results li[aria-selected='true']) {
    @apply !bg-blue-600 !text-white;
  }

  @media (max-width: 720px) {
    .editor-header {
      @apply px-4;
    }

    .header-actions {
      @apply w-full justify-start;
    }

    .import-button,
    .save-button {
      @apply flex-1 justify-center;
    }
  }
</style>
