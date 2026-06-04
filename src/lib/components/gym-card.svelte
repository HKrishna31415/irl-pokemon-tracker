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
  import { buildShowdownTeam } from '$lib/utils/showdown'

  import { Picture, Icon, PIcon, IconButton, Accordion } from '$c/core'
  import { Wrapper as SettingWrapper } from '$lib/components/Settings'

  import { Loop as Badge, Ball, Download, Settings } from '$icons'
  import { Vs } from '$lib/components/BossBattle'
  import { bossToImage } from '$utils/rewrites'

  import Effect from '$lib/components/Effect.svelte'
  import PokemonEditorModal from '$lib/components/PokemonEditorModal.svelte'
  import { activeGame, getGameStore, patch, read } from '$lib/store'
  import { onDestroy, onMount } from 'svelte'
  import deferStyles from '$utils/defer-styles'

  export let loading = true

  let gameStore, bossOverrides = {}
  let unsubActive, unsubStore
  let movesData = {}
  let pokemonData = {}
  let showdownText = ''

  const fallbackMoves = {
    armorcannon: { type: 'fire', category: 'Special', basePower: 120 },
    bitterblade: { type: 'fire', category: 'Physical', basePower: 90 },
    chillingwater: { type: 'water', category: 'Special', basePower: 50 },
    darkhole: { type: 'dark', category: 'Status' },
    dracobarrage: { type: 'dragon', category: 'Special' },
    populationbomb: { type: 'normal', category: 'Physical', basePower: 20 },
    ragingbull: { type: 'normal', category: 'Physical', basePower: 90 },
    revivalblessing: { type: 'normal', category: 'Status' },
    saltcure: { type: 'rock', category: 'Physical', basePower: 40 },
    shedtail: { type: 'normal', category: 'Status' },
    soulrobbery: { type: 'dark', category: 'Physical' },
    supercellslam: { type: 'electric', category: 'Physical', basePower: 100 },
    tidyup: { type: 'normal', category: 'Status' },
    triplearrows: { type: 'fighting', category: 'Physical', basePower: 90 },
    tripledive: { type: 'water', category: 'Physical', basePower: 30 }
  }

  const fallbackPokemon = {
    electrodehisui: { sprite: 'electrode-hisui', types: ['electric', 'grass'], baseStats: { hp: 60, atk: 50, def: 70, spa: 80, spd: 80, spe: 150 } },
    orthworm: { sprite: 'orthworm', types: ['steel'], baseStats: { hp: 70, atk: 85, def: 145, spa: 60, spd: 55, spe: 65 } },
    pawmot: { sprite: 'pawmot', types: ['electric', 'fighting'], baseStats: { hp: 70, atk: 115, def: 70, spa: 70, spd: 60, spe: 105 } },
    quaxwell: { sprite: 'quaxwell', types: ['water'], baseStats: { hp: 70, atk: 85, def: 65, spa: 65, spd: 60, spe: 65 } },
    annihilape: { sprite: 'annihilape', types: ['fighting', 'ghost'], baseStats: { hp: 110, atk: 115, def: 80, spa: 50, spd: 90, spe: 90 } },
    archaludon: { sprite: 'archaludon', types: ['steel', 'dragon'], baseStats: { hp: 90, atk: 105, def: 130, spa: 125, spd: 65, spe: 85 } },
    arcaninehisui: { sprite: 'arcanine-hisui', types: ['fire', 'rock'], baseStats: { hp: 95, atk: 115, def: 80, spa: 95, spd: 80, spe: 90 } },
    armarouge: { sprite: 'armarouge', types: ['fire', 'psychic'], baseStats: { hp: 85, atk: 60, def: 100, spa: 125, spd: 80, spe: 75 } },
    caribolt: { sprite: 'caribolt', types: ['electric', 'grass'], baseStats: { hp: 84, atk: 106, def: 82, spa: 77, spd: 80, spe: 106 } },
    aegislashshield: { sprite: 'aegislash-shield', types: ['steel', 'ghost'], baseStats: { hp: 60, atk: 50, def: 140, spa: 50, spd: 140, spe: 60 } },
    alcremie: { sprite: 'alcremie', types: ['fairy'], baseStats: { hp: 65, atk: 60, def: 75, spa: 110, spd: 121, spe: 64 } },
    baxcalibur: { sprite: 'baxcalibur', types: ['dragon', 'ice'], baseStats: { hp: 115, atk: 145, def: 92, spa: 75, spd: 86, spe: 87 } },
    basculegion: { sprite: 'basculegion', types: ['water', 'ghost'], baseStats: { hp: 120, atk: 112, def: 65, spa: 80, spd: 75, spe: 78 } },
    bellibolt: { sprite: 'bellibolt', types: ['electric'], baseStats: { hp: 109, atk: 64, def: 91, spa: 103, spd: 83, spe: 45 } },
    brutebonnet: { sprite: 'brute-bonnet', types: ['grass', 'dark'], baseStats: { hp: 111, atk: 127, def: 99, spa: 79, spd: 99, spe: 55 } },
    charcadet: { sprite: 'charcadet', types: ['fire'], baseStats: { hp: 40, atk: 50, def: 40, spa: 50, spd: 40, spe: 35 } },
    ceruledge: { sprite: 'ceruledge', types: ['fire', 'ghost'], baseStats: { hp: 75, atk: 125, def: 80, spa: 60, spd: 100, spe: 85 } },
    chienpao: { sprite: 'chien-pao', types: ['dark', 'ice'], baseStats: { hp: 80, atk: 120, def: 80, spa: 90, spd: 65, spe: 135 } },
    charizardmegax: { sprite: 'charizard-mega-x', types: ['fire', 'dragon'], baseStats: { hp: 78, atk: 130, def: 111, spa: 130, spd: 85, spe: 100 } },
    chiyu: { sprite: 'chi-yu', types: ['dark', 'fire'], baseStats: { hp: 55, atk: 80, def: 80, spa: 135, spd: 120, spe: 100 } },
    clodsire: { sprite: 'clodsire', types: ['poison', 'ground'], baseStats: { hp: 130, atk: 75, def: 60, spa: 45, spd: 100, spe: 20 } },
    crocalor: { sprite: 'crocalor', types: ['fire'], baseStats: { hp: 81, atk: 55, def: 78, spa: 90, spd: 58, spe: 49 } },
    decidueyehisui: { sprite: 'decidueye-hisui', types: ['grass', 'fighting'], baseStats: { hp: 88, atk: 112, def: 80, spa: 95, spd: 95, spe: 60 } },
    dubwool: { sprite: 'dubwool', types: ['normal'], baseStats: { hp: 72, atk: 80, def: 100, spa: 60, spd: 90, spe: 88 } },
    equilibra: { sprite: 'equilibra', types: ['ground', 'steel'], baseStats: { hp: 102, atk: 50, def: 96, spa: 133, spd: 118, spe: 60 } },
    espathra: { sprite: 'espathra', types: ['psychic'], baseStats: { hp: 95, atk: 60, def: 60, spa: 101, spd: 60, spe: 105 } },
    finizen: { sprite: 'finizen', types: ['water'], baseStats: { hp: 70, atk: 45, def: 40, spa: 45, spd: 40, spe: 75 } },
    floragato: { sprite: 'floragato', types: ['grass'], baseStats: { hp: 61, atk: 80, def: 63, spa: 60, spd: 63, spe: 83 } },
    fluttermane: { sprite: 'flutter-mane', types: ['ghost', 'fairy'], baseStats: { hp: 55, atk: 55, def: 55, spa: 135, spd: 135, spe: 135 } },
    fuecoco: { sprite: 'fuecoco', types: ['fire'], baseStats: { hp: 67, atk: 45, def: 59, spa: 63, spd: 40, spe: 36 } },
    gougingfire: { sprite: 'gouging-fire', types: ['fire', 'dragon'], baseStats: { hp: 105, atk: 115, def: 121, spa: 65, spd: 93, spe: 91 } },
    gholdengo: { sprite: 'gholdengo', types: ['steel', 'ghost'], baseStats: { hp: 87, atk: 60, def: 95, spa: 133, spd: 91, spe: 84 } },
    glimmora: { sprite: 'glimmora', types: ['rock', 'poison'], baseStats: { hp: 83, atk: 55, def: 90, spa: 130, spd: 81, spe: 86 } },
    goodrahisui: { sprite: 'goodra-hisui', types: ['steel', 'dragon'], baseStats: { hp: 80, atk: 100, def: 100, spa: 110, spd: 150, spe: 60 } },
    grafaiai: { sprite: 'grafaiai', types: ['poison', 'normal'], baseStats: { hp: 63, atk: 95, def: 65, spa: 80, spd: 72, spe: 110 } },
    garganacl: { sprite: 'garganacl', types: ['rock'], baseStats: { hp: 100, atk: 100, def: 130, spa: 45, spd: 90, spe: 35 } },
    greattusk: { sprite: 'great-tusk', types: ['ground', 'fighting'], baseStats: { hp: 115, atk: 131, def: 131, spa: 53, spd: 53, spe: 87 } },
    ironboulder: { sprite: 'iron-boulder', types: ['rock', 'psychic'], baseStats: { hp: 90, atk: 120, def: 80, spa: 68, spd: 108, spe: 124 } },
    ironbundle: { sprite: 'iron-bundle', types: ['ice', 'water'], baseStats: { hp: 56, atk: 80, def: 114, spa: 124, spd: 60, spe: 136 } },
    ironcrown: { sprite: 'iron-crown', types: ['steel', 'psychic'], baseStats: { hp: 90, atk: 72, def: 100, spa: 122, spd: 108, spe: 98 } },
    ironhands: { sprite: 'iron-hands', types: ['fighting', 'electric'], baseStats: { hp: 154, atk: 140, def: 108, spa: 50, spd: 68, spe: 50 } },
    ironjugulis: { sprite: 'iron-jugulis', types: ['dark', 'flying'], baseStats: { hp: 94, atk: 80, def: 86, spa: 122, spd: 80, spe: 108 } },
    ironleaves: { sprite: 'iron-leaves', types: ['grass', 'psychic'], baseStats: { hp: 90, atk: 130, def: 88, spa: 70, spd: 108, spe: 104 } },
    ironmoth: { sprite: 'iron-moth', types: ['fire', 'poison'], baseStats: { hp: 80, atk: 70, def: 60, spa: 140, spd: 110, spe: 110 } },
    ironthorns: { sprite: 'iron-thorns', types: ['rock', 'electric'], baseStats: { hp: 100, atk: 134, def: 110, spa: 70, spd: 84, spe: 72 } },
    irontreads: { sprite: 'iron-treads', types: ['ground', 'steel'], baseStats: { hp: 90, atk: 112, def: 120, spa: 72, spd: 70, spe: 106 } },
    ironvaliant: { sprite: 'iron-valiant', types: ['fairy', 'fighting'], baseStats: { hp: 74, atk: 130, def: 90, spa: 120, spd: 60, spe: 116 } },
    kingambit: { sprite: 'kingambit', types: ['dark', 'steel'], baseStats: { hp: 100, atk: 135, def: 120, spa: 60, spd: 85, spe: 50 } },
    kleavor: { sprite: 'kleavor', types: ['bug', 'rock'], baseStats: { hp: 70, atk: 135, def: 95, spa: 45, spd: 70, spe: 85 } },
    koraidon: { sprite: 'koraidon', types: ['fighting', 'dragon'], baseStats: { hp: 100, atk: 135, def: 115, spa: 85, spd: 100, spe: 135 } },
    lilliganthisui: { sprite: 'lilligant-hisui', types: ['grass', 'fighting'], baseStats: { hp: 70, atk: 105, def: 75, spa: 50, spd: 75, spe: 105 } },
    maushold: { sprite: 'maushold', types: ['normal'], baseStats: { hp: 74, atk: 75, def: 70, spa: 65, spd: 75, spe: 111 } },
    mabosstiff: { sprite: 'mabosstiff', types: ['dark'], baseStats: { hp: 80, atk: 120, def: 90, spa: 60, spd: 70, spe: 85 } },
    meganiummega: { sprite: 'meganium-mega', types: ['grass', 'fairy'], baseStats: { hp: 80, atk: 82, def: 100, spa: 123, spd: 120, spe: 80 } },
    meowscarada: { sprite: 'meowscarada', types: ['grass', 'dark'], baseStats: { hp: 76, atk: 110, def: 70, spa: 81, spd: 70, spe: 123 } },
    meowsticm: { sprite: 'meowstic-m', types: ['psychic'], baseStats: { hp: 74, atk: 48, def: 76, spa: 83, spd: 81, spe: 104 } },
    miraidon: { sprite: 'miraidon', types: ['electric', 'dragon'], baseStats: { hp: 100, atk: 85, def: 100, spa: 135, spd: 115, spe: 135 } },
    naclstack: { sprite: 'naclstack', types: ['rock'], baseStats: { hp: 60, atk: 60, def: 100, spa: 35, spd: 65, spe: 35 } },
    naviathan: { sprite: 'naviathan', types: ['water', 'steel'], baseStats: { hp: 103, atk: 110, def: 90, spa: 95, spd: 65, spe: 97 } },
    overqwil: { sprite: 'overqwil', types: ['dark', 'poison'], baseStats: { hp: 85, atk: 115, def: 95, spa: 65, spd: 65, spe: 85 } },
    palafinhero: { sprite: 'palafin-hero', types: ['water'], baseStats: { hp: 100, atk: 160, def: 97, spa: 106, spd: 87, spe: 100 } },
    oinkologne: { sprite: 'oinkologne', types: ['normal'], baseStats: { hp: 110, atk: 100, def: 75, spa: 59, spd: 80, spe: 65 } },
    ogerponwellspring: { sprite: 'ogerpon-wellspring', types: ['grass', 'water'], baseStats: { hp: 80, atk: 120, def: 84, spa: 60, spd: 96, spe: 110 } },
    ogerponhearthflame: { sprite: 'ogerpon-hearthflame', types: ['grass', 'fire'], baseStats: { hp: 80, atk: 120, def: 84, spa: 60, spd: 96, spe: 110 } },
    palafin: { sprite: 'palafin', types: ['water'], baseStats: { hp: 100, atk: 70, def: 72, spa: 53, spd: 62, spe: 100 } },
    polteageist: { sprite: 'polteageist', types: ['ghost'], baseStats: { hp: 60, atk: 65, def: 65, spa: 134, spd: 114, spe: 70 } },
    palkiaorigin: { sprite: 'palkia-origin', types: ['water', 'dragon'], baseStats: { hp: 90, atk: 100, def: 100, spa: 150, spd: 120, spe: 120 } },
    ragingbolt: { sprite: 'raging-bolt', types: ['electric', 'dragon'], baseStats: { hp: 125, atk: 73, def: 91, spa: 137, spd: 89, spe: 75 } },
    regidrago: { sprite: 'regidrago', types: ['dragon'], baseStats: { hp: 200, atk: 100, def: 50, spa: 100, spd: 50, spe: 80 } },
    revavroom: { sprite: 'revavroom', types: ['steel', 'poison'], baseStats: { hp: 80, atk: 119, def: 90, spa: 54, spd: 67, spe: 90 } },
    roaringmoon: { sprite: 'roaring-moon', types: ['dragon', 'dark'], baseStats: { hp: 105, atk: 139, def: 71, spa: 55, spd: 101, spe: 119 } },
    sandyshocks: { sprite: 'sandy-shocks', types: ['electric', 'ground'], baseStats: { hp: 85, atk: 81, def: 97, spa: 121, spd: 85, spe: 101 } },
    samurotthisui: { sprite: 'samurott-hisui', types: ['water', 'dark'], baseStats: { hp: 90, atk: 108, def: 80, spa: 100, spd: 65, spe: 85 } },
    sneasler: { sprite: 'sneasler', types: ['fighting', 'poison'], baseStats: { hp: 80, atk: 130, def: 60, spa: 40, spd: 80, spe: 120 } },
    slitherwing: { sprite: 'slither-wing', types: ['bug', 'fighting'], baseStats: { hp: 85, atk: 135, def: 79, spa: 85, spd: 105, spe: 81 } },
    snaelstrom: { sprite: 'snaelstrom', types: ['water', 'bug'], baseStats: { hp: 91, atk: 94, def: 110, spa: 80, spd: 97, spe: 63 } },
    snorlaxgmax: { sprite: 'snorlax-gmax', types: ['normal'], baseStats: { hp: 160, atk: 110, def: 65, spa: 65, spd: 110, spe: 30 } },
    screamtail: { sprite: 'scream-tail', types: ['fairy', 'psychic'], baseStats: { hp: 115, atk: 65, def: 99, spa: 65, spd: 115, spe: 111 } },
    sprigatito: { sprite: 'sprigatito', types: ['grass'], baseStats: { hp: 40, atk: 61, def: 54, spa: 45, spd: 45, spe: 65 } },
    taurospaldeaaqua: { sprite: 'tauros-paldea-aqua', types: ['fighting', 'water'], baseStats: { hp: 75, atk: 110, def: 105, spa: 30, spd: 70, spe: 100 } },
    thievul: { sprite: 'thievul', types: ['dark'], baseStats: { hp: 70, atk: 58, def: 58, spa: 87, spd: 92, spe: 90 } },
    tinglu: { sprite: 'ting-lu', types: ['dark', 'ground'], baseStats: { hp: 155, atk: 110, def: 125, spa: 55, spd: 80, spe: 45 } },
    tinkatink: { sprite: 'tinkatink', types: ['fairy', 'steel'], baseStats: { hp: 50, atk: 45, def: 45, spa: 35, spd: 64, spe: 58 } },
    ursaluna: { sprite: 'ursaluna', types: ['ground', 'normal'], baseStats: { hp: 130, atk: 140, def: 105, spa: 45, spd: 80, spe: 50 } },
    walkingwake: { sprite: 'walking-wake', types: ['water', 'dragon'], baseStats: { hp: 99, atk: 83, def: 91, spa: 125, spd: 83, spe: 109 } },
    venomicon: { sprite: 'venomicon', types: ['flying', 'poison'], baseStats: { hp: 85, atk: 50, def: 113, spa: 118, spd: 90, spe: 64 } },
    volkraken: { sprite: 'volkraken', types: ['water', 'fire'], baseStats: { hp: 100, atk: 45, def: 80, spa: 135, spd: 100, spe: 95 } },
    wiglett: { sprite: 'wiglett', types: ['water'], baseStats: { hp: 10, atk: 55, def: 25, spa: 35, spd: 25, spe: 95 } },
    wugtrio: { sprite: 'wugtrio', types: ['water'], baseStats: { hp: 35, atk: 100, def: 50, spa: 50, spd: 70, spe: 120 } },
    wyrdeer: { sprite: 'wyrdeer', types: ['normal', 'psychic'], baseStats: { hp: 103, atk: 105, def: 72, spa: 105, spd: 75, spe: 65 } },
    zaciancrowned: { sprite: 'zacian-crowned', types: ['fairy', 'steel'], baseStats: { hp: 92, atk: 150, def: 115, spa: 80, spd: 115, spe: 148 } },
    zamazentacrowned: { sprite: 'zamazenta-crowned', types: ['fighting', 'steel'], baseStats: { hp: 92, atk: 120, def: 140, spa: 80, spd: 140, spe: 128 } },
    zoroarkhisui: { sprite: 'zoroark-hisui', types: ['normal', 'ghost'], baseStats: { hp: 55, atk: 100, def: 60, spa: 125, spd: 60, spe: 110 } }
  }

  onMount(() => {
    deferStyles('/assets/badges.css')
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
      return enrichPokemon({ ...p, ...override })
    })
  }

  const moveKey = (name = '') =>
    String(name)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')

  const enrichMove = (move) => {
    const moveName = typeof move === 'string' ? move : move?.name
    if (!moveName) return move

    const ref = movesData[moveKey(moveName)] || fallbackMoves[moveKey(moveName)]
    if (!ref) return typeof move === 'string' ? { name: moveName } : move

    return {
      ...ref,
      ...(typeof move === 'string' ? { name: moveName } : move),
      name: moveName || ref.name,
      type: (move?.type || ref.type || '').toLowerCase(),
      damage_class: (move?.damage_class || ref.category || '').toLowerCase(),
      power: move?.power ?? ref.basePower,
      priority: move?.priority ?? ref.priority,
      effect: move?.effect || ref.shortDesc || ref.desc
    }
  }

  const isNumericSprite = (value) => /^\d+$/.test(String(value || ''))

  const pokemonRef = (p) => {
    const keys = [p?.alias, p?.name]
    if (p?.sprite && !isNumericSprite(p.sprite)) keys.push(p.sprite)
    if (p?.sprite && isNumericSprite(p.sprite)) keys.push(p.sprite)

    for (const key of keys) {
      const ref = pokemonData[moveKey(key)] || fallbackPokemon[moveKey(key)]
      if (ref) return ref
    }
  }

  const enrichPokemon = (p) => {
    const ref = pokemonRef(p)
    const hasPlaceholderTypes = p.types?.length === 1 && p.types[0] === 'normal' && ref?.types?.[0] !== 'normal'
    const hasPlaceholderStats = p.stats && Object.values(p.stats).every((it) => it === 50)

    return {
      ...p,
      sprite: isNumericSprite(p.sprite) ? ref?.sprite || p.sprite : p.sprite || ref?.sprite,
      icon: p.icon || ref?.sprite,
      types: (!p.types?.length || hasPlaceholderTypes)
        ? ref?.types?.map((it) => it.toLowerCase()) || p.types
        : p.types,
      stats: (!p.stats || hasPlaceholderStats) ? ref?.baseStats || p.stats : p.stats,
      level: String(p.level ?? ''),
      moves: (p.moves || []).map(enrichMove)
    }
  }

  const loadMovesData = async () => {
    if (Object.keys(movesData).length) return
    movesData = (await import('../../routes/assets/data/moves.json')).default
  }

  const loadPokemonData = async () => {
    if (Object.keys(pokemonData).length) return
    const data = (await import('../../routes/assets/data/pokemon.json')).default
    pokemonData = Object.values(data).reduce((acc, p) => {
      for (const key of [p.alias, p.sprite, p.name, p.num]) {
        if (!key) continue
        const normalized = moveKey(key)
        if (/^\d+$/.test(String(key)) && acc[normalized]) continue
        acc[normalized] = p
      }
      return acc
    }, {})
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
      await loadMovesData()
      await loadPokemonData()
      const league = await getLeague(game, starter)
      const data = league[id]
      if (!data) throw new Error(`Missing boss data for ${game}:${id}`)

      img = bossToImage(data, id, game);

      pokemon = data.pokemon.map(enrichPokemon)
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
      loading = false
    }
  }

  $: (async () => await fetchData(starter))()

  const KANTO_EARLY_CAPS = {
    'joey1': 5, 'joey1_hard': 5,
    'kylie1': 6, 'kylie1_hard': 6,
    'maven1': 7, 'maven1_hard': 7,
    'wilson1': 8, 'wilson1_hard': 8,
    'jerome1': 9, 'jerome1_hard': 9,
    'joel1': 10, 'joel1_hard': 10,
    'b1': 11, 'b1_hard': 11
  }

  $: derivedLevelCap = pokemon.every(
    (it) => String(it.level).startsWith('+') || String(it.level).startsWith('-')
  )
    ? null
    : pokemon.reduce((acc, it) => Math.max(acc, it.level), 0)

  $: levelCap = KANTO_EARLY_CAPS[id] ?? dataLevelCap ?? derivedLevelCap
  $: maxStat = pokemon.reduce(
    (acc, it) => it.stats ? Math.max(acc, Math.max(...Object.values(it.stats))) : acc,
    0
  )

  const getBadgeName = (type) => {
    const map = {
      rock: 'Boulder', water: 'Cascade', electric: 'Thunder', grass: 'Rainbow',
      poison: 'Soul', psychic: 'Marsh', fire: 'Volcano', ground: 'Earth',
      flying: 'Zephyr', bug: 'Hive', normal: 'Plain', ghost: 'Fog',
      fighting: 'Storm', steel: 'Mineral', ice: 'Glacier', dragon: 'Rising'
    }
    return map[type] || type
  }

  const exportToShowdown = () => {
    const showdownTeam = buildShowdownTeam(pokemon)
    showdownText = showdownTeam

    navigator.clipboard.writeText(showdownTeam).then(
      () => alert(`${name}'s team exported to clipboard!`),
      () => alert(`${name}'s team export is ready below, but clipboard access was blocked.`)
    )
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

<div class="relative my-6 {type === 'gym-leader' || type === 'elite-four' ? 'mt-10 rounded-xl border-2 border-amber-400/80 bg-amber-50/50 p-4 shadow-sm dark:border-amber-600/50 dark:bg-amber-900/20' : ''}">
  {#if type === 'gym-leader'}
    {@const regionClass = game ? game.replace(/irl.*/, '').replace(/_hard/, '') : 'kanto'}
    <div class="absolute -top-5 left-1/2 flex -translate-x-1/2 items-center gap-x-2 whitespace-nowrap rounded-full border-2 border-amber-400 bg-gradient-to-b from-amber-400 to-amber-500 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white shadow-md dark:border-amber-600 dark:from-amber-600 dark:to-orange-600 {regionClass}">
      {#if speciality}
        <PIcon type="b" name={speciality} className="scale-[2.5] origin-center -ml-1 mr-3 translate-y-[-1px]" />
        {getBadgeName(speciality)} Badge
      {:else}
        Gym Leader
      {/if}
    </div>
  {/if}
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
              {#if setting > 0 || forceLevelCap}
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
          {#if !loading}
            <IconButton rounded title="Export {name}'s team to Showdown" on:click={exportToShowdown}>
              <Icon class="pl-1" height="1.2em" inline icon={Download} />
            </IconButton>
          {/if}
        {/if}
      </div>
    </span>

    <div slot="item">
      {#if reader && info}
        <div class="mb-4 mt-2 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 p-5 text-sm leading-relaxed text-indigo-900 shadow-sm border border-indigo-100/50 dark:from-gray-800 dark:to-gray-900 dark:text-indigo-100 dark:border-gray-700">
          <h4 class="mb-2 flex items-center gap-x-2 font-bold tracking-wider uppercase text-[10px] text-indigo-500 dark:text-indigo-400">
            Strategy Guide
          </h4>
          <p class="whitespace-pre-wrap">{info}</p>
        </div>
      {/if}

      {#if !loading}
        <div class="mb-6 flex flex-wrap gap-4 items-center justify-between bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 shadow-sm">
          <div class="flex items-center gap-x-3">
            <span class="flex items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-900/30 p-2 text-indigo-600 dark:text-indigo-400">
              <PIcon type="b" name="poke-ball" className="scale-[1.8] origin-center opacity-90" />
            </span>
            <div>
              <h4 class="text-sm font-semibold text-gray-800 dark:text-gray-100">
                Ready to battle {name}?
              </h4>
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-0">
                Export this trainer's exact team with moves, items, and abilities directly to Pokémon Showdown.
              </p>
            </div>
          </div>
          <button
            class="flex items-center gap-x-2 bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-500 dark:hover:bg-indigo-600 px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm border border-indigo-700 dark:border-indigo-600 cursor-pointer"
            on:click|stopPropagation={exportToShowdown}
          >
            <Icon height="1.2em" inline icon={Download} />
            Export Trainer
          </button>
        </div>
        {#if showdownText}
          <pre class="showdown-export mb-6 overflow-x-auto whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50 p-4 font-mono text-xs leading-5 text-gray-800 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100">{showdownText}</pre>
        {/if}
      {/if}

      <div class="mt-8 grid gap-y-10 md:grid-cols-2 md:gap-x-2 lg:grid-cols-2 lg:gap-x-6">
      {#each pokemon as p, id (p.name + id)}
        <Pokemon
          {...p}
          class="snap-start scroll-mt-6"
          sprite={createImgUrl(p, { ext: 'png' }) || `/assets/img/pokemon/base-${p.name}.png`}
          fallback={`https://img.nuzlocke.app/sprites/${p.name}.png`}
          {maxStat}
          showStatDetails={reader}
        >
          <div slot="footer" class="flex items-center justify-between mx-8 mb-2 z-50 transition opacity-25 hover:opacity-75">
            {#if bossOverrides[boss.id]?.[id]}
              <span class="rounded-full border border-emerald-300 bg-emerald-50 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
                Saved edits
              </span>
            {/if}
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

            {#if !reader}
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
            {/if}
          </div>

        </Pokemon>
      {/each}
    </div>
    </div>
  </Accordion>
</div>
