<script>
  import nationalDex from '$lib/data/national-dex.json'
  import evolutionMinLevels from '$lib/data/evolution-min-levels.json'
  import { TIER_FILTERS, getPokemonTier, normalisePokemonId } from '$lib/data/smogon-tiers'
  import { VGC_TIERS, getVgcTier } from '$lib/data/vgc-tiers'
  import { Hero } from '$c/Guide'
  import { Icon, PIcon } from '$c/core'
  import TierBadge from '$lib/components/TierBadge.svelte'
  import TypeBadge from '$lib/components/type-badge.svelte'
  import {
    Atk,
    BarChart,
    Box,
    Caret,
    Check,
    Def,
    HP,
    Info,
    Search as SearchIcon,
    Shield,
    Spa,
    Spd,
    Spe,
    Sword,
    Trophy,
    X
  } from '$icons'

  const STAT_GROUPS = [
    {
      label: 'Core totals',
      options: [
        ['total', 'BST'],
        ['smogonTierScore', 'Smogon Tier'],
        ['minMaxPercent', 'Min-Max %'],
        ['totalWasted', 'Total Wasted'],
        ['statSpread', 'Stat Spread']
      ]
    },
    {
      label: 'Base stats',
      options: [
        ['hp', 'HP'],
        ['atk', 'Attack'],
        ['def', 'Defense'],
        ['spa', 'Sp. Attack'],
        ['spd', 'Sp. Defense'],
        ['spe', 'Speed']
      ]
    },
    {
      label: 'Stat ratings',
      options: [
        ['baseStatRating', 'BSR'],
        ['physicalTankiness', 'Physical Tankiness'],
        ['specialTankiness', 'Special Tankiness'],
        ['physicalSweepiness', 'Physical Sweepiness'],
        ['specialSweepiness', 'Special Sweepiness']
      ]
    },
    {
      label: 'Balance ratings',
      options: [
        ['offenseDefenseBalance', 'Offense/Defense Balance'],
        ['physicalSpecialBalance', 'Physical/Special Balance']
      ]
    },
    {
      label: 'Waste subparts',
      options: [
        ['wastedOffense', 'Wasted Offense'],
        ['wastedSpeed', 'Wasted Speed'],
        ['wastedDefense', 'Wasted Defense'],
        ['adjustedWastedDefense', 'Adjusted Wasted Defense'],
        ['lopsidedRatio', 'Lopsided Ratio'],
        ['offenseDeficit', 'Offense Deficit'],
        ['mixedOffenseRatio', 'Mixed Offense Ratio'],
        ['bulkTotal', 'Bulk Total'],
        ['physicalBulk', 'Physical Bulk'],
        ['specialBulk', 'Special Bulk'],
        ['maxOffense', 'Max Offense'],
        ['speedBandValue', 'Speed Band']
      ]
    }
  ]
  const STAT_OPTIONS = STAT_GROUPS.flatMap((group) => group.options)
  const STAT_DESCRIPTIONS = {
    total: 'Base Stat Total: HP + Attack + Defense + Sp. Attack + Sp. Defense + Speed.',
    smogonTierScore: 'Ordinal Smogon tier score: AG 16, Uber 15, OU 14, UUBL 13, UU 12, down to Untiered 1.',
    hp: 'Base HP. Higher HP improves both physical and special durability.',
    atk: 'Base Attack. Physical damage stat.',
    def: 'Base Defense. Physical durability stat.',
    spa: 'Base Sp. Attack. Special damage stat.',
    spd: 'Base Sp. Defense. Special durability stat.',
    spe: 'Base Speed. Below 40 is treated as Trick Room friendly, 80+ as normal fast play.',
    minMaxPercent: 'Efficiency score: 100% minus wasted stats as a share of BST. Higher means more min-maxed.',
    totalWasted: 'Combined wasted stat estimate using the current Waste Profile setting.',
    statSpread: 'Highest base stat minus lowest base stat. Higher means a more extreme stat shape.',
    wastedOffense: 'If Attack and Sp. Attack are within 10%, this is 0. Otherwise the lower attacking stat is treated as wasted.',
    wastedSpeed: 'Speed between 41 and 79 is treated as awkward: Speed 60 wastes 20, Speed 65 wastes 15.',
    wastedDefense: '|HP - Defense| + |HP - Sp. Defense|. Lower means the bulk stats are more evenly aligned.',
    adjustedWastedDefense: 'Defense waste scaled by defensive imbalance: ceil(wasted defense x (lopsided ratio - 1) x 50).',
    lopsidedRatio: 'Higher defense divided by lower defense. Equal defenses are 1. The graph displays this as ratio x100.',
    offenseDeficit: 'Penalty for weak offense: max(0, 95 - max(Attack, Sp. Attack)) x 3.',
    mixedOffenseRatio: 'Lower attacking stat as a percent of the higher attacking stat. Higher means better mixed offense.',
    bulkTotal: 'HP + Defense + Sp. Defense.',
    physicalBulk: 'HP + Defense.',
    specialBulk: 'HP + Sp. Defense.',
    maxOffense: 'The higher of Attack and Sp. Attack.',
    speedBandValue: 'Speed category: 0 Trick Room, 1 awkward middle speed, 2 fast.',
    physicalTankiness: 'Smogon CAP Physical Tankiness: normalized HP x normalized Defense / 35. 100 is average.',
    specialTankiness: 'Smogon CAP Special Tankiness: normalized HP x normalized Sp. Defense / 35. 100 is average.',
    physicalSweepiness: 'Smogon CAP Physical Sweepiness: normalized Attack adjusted by Speed Factor. 100 is average.',
    specialSweepiness: 'Smogon CAP Special Sweepiness: normalized Sp. Attack adjusted by Speed Factor. 100 is average.',
    offenseDefenseBalance: 'ODB: positive values lean offensive; negative values lean defensive.',
    physicalSpecialBalance: 'PSB: positive values lean physical; negative values lean special.',
    baseStatRating: 'BSR: Smogon CAP Overall Rating from tankiness, sweepiness, and rating modifiers.',
  }

  const RANGE_FILTER_GROUPS = [
    {
      label: 'Core Stats',
      description: 'BST and primary stats that define a form',
      open: false,
      options: [
        ['total', 'BST', 0, 800, 5, BarChart],
        ['hp', 'HP', 0, 255, 1, HP],
        ['atk', 'Attack', 0, 255, 1, Atk],
        ['def', 'Defense', 0, 255, 1, Def],
        ['spa', 'Sp. Attack', 0, 255, 1, Spa],
        ['spd', 'Sp. Defense', 0, 255, 1, Spd],
        ['spe', 'Speed', 0, 255, 1, Spe]
      ]
    },
    {
      label: 'Efficiency',
      description: 'Min-max score, bulk waste, and offensive tradeoffs',
      open: false,
      options: [
        ['minMaxPercent', 'Min-Max %', 0, 100, 1, Check],
        ['totalWasted', 'Total Wasted', 0, 800, 5, X],
        ['wastedOffense', 'Wasted Offense', 0, 255, 1, Sword],
        ['wastedSpeed', 'Wasted Speed', 0, 40, 1, Spe],
        ['wastedDefense', 'Wasted Defense', 0, 400, 5, Shield],
        ['adjustedWastedDefense', 'Adjusted Wasted Def', 0, 2000, 25, Shield],
        ['lopsidedRatio', 'Lopsided Ratio', 1, 8, 0.05, BarChart],
        ['offenseDeficit', 'Offense Deficit', 0, 285, 5, Sword]
      ]
    },
    {
      label: 'Competitive Shape',
      description: 'Bulk, offense, spread shape, and speed bands',
      open: false,
      options: [
        ['mixedOffenseRatio', 'Mixed Offense Ratio', 0, 100, 1, Sword],
        ['bulkTotal', 'Bulk Total', 0, 720, 5, Shield],
        ['physicalBulk', 'Physical Bulk', 0, 510, 5, Def],
        ['specialBulk', 'Special Bulk', 0, 510, 5, Spd],
        ['maxOffense', 'Max Offense', 0, 255, 1, Atk],
        ['speedBandValue', 'Speed Band', 0, 2, 1, Spe],
        ['statSpread', 'Stat Spread', 0, 255, 1, BarChart]
      ]
    },
    {
      label: 'Smogon Stat Ratings',
      description: 'CAP-style tankiness, sweepiness, balance, and BSR',
      open: false,
      options: [
        ['physicalTankiness', 'Physical Tankiness', 0, 350, 5, Shield],
        ['specialTankiness', 'Special Tankiness', 0, 350, 5, Shield],
        ['physicalSweepiness', 'Physical Sweepiness', 0, 350, 5, Sword],
        ['specialSweepiness', 'Special Sweepiness', 0, 350, 5, Sword],
        ['offenseDefenseBalance', 'Offense/Defense Balance', -80, 80, 1, BarChart],
        ['physicalSpecialBalance', 'Physical/Special Balance', -80, 80, 1, BarChart],
        ['baseStatRating', 'BSR', 0, 1600, 10, Trophy]
      ]
    }
  ]
  const RANGE_FILTERS = RANGE_FILTER_GROUPS.flatMap((group) => group.options)

  const TYPES = [
    'All',
    'normal',
    'fire',
    'water',
    'electric',
    'grass',
    'ice',
    'fighting',
    'poison',
    'ground',
    'flying',
    'psychic',
    'bug',
    'rock',
    'ghost',
    'dragon',
    'dark',
    'steel',
    'fairy'
  ]
  const TYPE_OPTIONS = TYPES.filter((type) => type !== 'All')
  const CATEGORY_OPTIONS = [
    ['isLegendary', 'Legendary'],
    ['isUltraBeast', 'Ultra Beast'],
    ['isParadox', 'Paradox'],
    ['isMega', 'Mega'],
    ['isGmax', 'G-Max'],
    ['isTotem', 'Totem'],
    ['isCrossGenEvolution', 'Cross-gen']
  ]
  const EVO_STAGE_OPTIONS = ['Basic', 'Middle', 'Final', 'Single-stage']
  const GENERATION_OPTIONS = Array.from({ length: 9 }, (_, index) => `Gen ${index + 1}`)
  const VGC_TIER_OPTIONS = VGC_TIERS.filter((tier) => tier !== 'All').map((tier) => tier.replace('Tier', 'VGC Tier')).concat('No VGC wins')
  const SMOGON_TIER_OPTIONS = TIER_FILTERS.filter((tier) => tier !== 'All')
  const WASTE_PROFILE_OPTIONS = [
    'Regular + regular defense',
    'Regular + adjusted defense',
    'Advanced + regular defense',
    'Advanced + adjusted defense'
  ]
  const GROUP_BY_OPTIONS = ['Generation', 'Type', 'Type Combo', 'Smogon Tier', 'VGC Tier']
  const SMOGON_GROUP_ORDER = ['AG', 'Uber', 'OU', 'UUBL', 'UU', 'RUBL', 'RU', 'NUBL', 'NU', 'PUBL', 'PU', 'ZUBL', 'ZU', 'NFE', 'LC', 'Untiered']
  const SMOGON_TIER_SCORES = {
    AG: 16,
    Uber: 15,
    OU: 14,
    UUBL: 13,
    UU: 12,
    RUBL: 11,
    RU: 10,
    NUBL: 9,
    NU: 8,
    PUBL: 7,
    PU: 6,
    ZUBL: 5,
    ZU: 4,
    NFE: 3,
    LC: 2,
    Untiered: 1
  }
  const SPEED_FACTOR_TABLE = [
    [10, 0],
    [15, 0.01],
    [20, 0.02],
    [25, 0.04],
    [30, 0.06],
    [35, 0.12],
    [40, 0.17],
    [45, 0.23],
    [50, 0.29],
    [55, 0.37],
    [60, 0.42],
    [65, 0.49],
    [70, 0.55],
    [75, 0.62],
    [80, 0.65],
    [85, 0.71],
    [90, 0.77],
    [95, 0.82],
    [100, 0.87],
    [105, 0.92],
    [110, 0.94],
    [115, 0.95],
    [120, 0.97],
    [130, 0.98],
    [150, 0.99],
    [Infinity, 1]
  ]
  const STAT_AXIS_BOUNDS = {
    smogonTierScore: [1, 16],
    offenseDefenseBalance: [-80, 80],
    physicalSpecialBalance: [-80, 80],
    baseStatRating: [0, 1600],
    physicalTankiness: [0, 350],
    specialTankiness: [0, 350],
    physicalSweepiness: [0, 350],
    specialSweepiness: [0, 350]
  }
  const VGC_GROUP_ORDER = VGC_TIERS.filter((tier) => tier !== 'All').map((tier) => tier.replace('Tier', 'VGC Tier')).concat('No VGC wins')
  const tierColors = {
    AG: '#ef4444',
    Uber: '#f97316',
    OU: '#eab308',
    UUBL: '#f59e0b',
    UU: '#22c55e',
    RUBL: '#84cc16',
    RU: '#14b8a6',
    NUBL: '#06b6d4',
    NU: '#3b82f6',
    PUBL: '#0ea5e9',
    PU: '#8b5cf6',
    ZUBL: '#6366f1',
    ZU: '#a855f7',
    LC: '#ec4899',
    NFE: '#64748b',
    Untiered: '#94a3b8',
    'VGC Tier 0': '#ef4444',
    'VGC Tier 1': '#f97316',
    'VGC Tier 2': '#eab308',
    'VGC Tier 3': '#22c55e',
    'VGC Tier 4': '#14b8a6',
    'VGC Tier 5': '#3b82f6',
    'VGC Tier 6': '#8b5cf6',
    'No VGC wins': '#94a3b8'
  }

  const typeColors = {
    normal: '#a8a77a',
    fire: '#ee8130',
    water: '#6390f0',
    electric: '#f7d02c',
    grass: '#7ac74c',
    ice: '#96d9d6',
    fighting: '#c22e28',
    poison: '#a33ea1',
    ground: '#e2bf65',
    flying: '#a98ff3',
    psychic: '#f95587',
    bug: '#a6b91a',
    rock: '#b6a136',
    ghost: '#735797',
    dragon: '#6f35fc',
    dark: '#705746',
    steel: '#b7b7ce',
    fairy: '#d685ad'
  }

  const genRanges = [
    [1, 151],
    [152, 251],
    [252, 386],
    [387, 493],
    [494, 649],
    [650, 721],
    [722, 809],
    [810, 905],
    [906, 1025]
  ]

  const genColors = [
    '#ef4444',
    '#f97316',
    '#eab308',
    '#22c55e',
    '#14b8a6',
    '#3b82f6',
    '#8b5cf6',
    '#a855f7',
    '#ec4899'
  ]

  const legendaryNums = new Set([
    144, 145, 146, 150, 151, 243, 244, 245, 249, 250, 251, 377, 378, 379, 380, 381, 382, 383, 384,
    385, 386, 480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493, 494, 638, 639,
    640, 641, 642, 643, 644, 645, 646, 647, 648, 649, 716, 717, 718, 719, 720, 721, 772, 773, 785,
    786, 787, 788, 789, 790, 791, 792, 793, 794, 795, 796, 797, 798, 799, 800, 801, 802, 807, 808,
    809, 888, 889, 890, 891, 892, 893, 894, 895, 896, 897, 898, 905, 1001, 1002, 1003, 1004, 1007,
    1008, 1009, 1010, 1024, 1025
  ])

  const ultraBeastNums = new Set([793, 794, 795, 796, 797, 798, 799, 803, 804, 805, 806])

  const paradoxSet = new Set(
    [
      'greattusk',
      'screamtail',
      'brutebonnet',
      'fluttermane',
      'slitherwing',
      'sandyshocks',
      'roaringmoon',
      'walkingleaves',
      'walkingwake',
      'gougingfire',
      'ragingbolt',
      'irontreads',
      'ironbundle',
      'ironhands',
      'ironjugulis',
      'ironmoth',
      'ironthorns',
      'ironvaliant',
      'ironleaves',
      'ironcrown',
      'ironboulder'
    ].map(normalisePokemonId)
  )

  const crossGenEvolutionSet = new Set(
    [
      'crobat',
      'bellossom',
      'politoed',
      'slowking',
      'steelix',
      'scizor',
      'kingdra',
      'porygon2',
      'blissey',
      'magnezone',
      'lickilicky',
      'rhyperior',
      'tangrowth',
      'electivire',
      'magmortar',
      'togekiss',
      'yanmega',
      'leafeon',
      'glaceon',
      'gliscor',
      'mamoswine',
      'porygonz',
      'gallade',
      'probopass',
      'dusknoir',
      'froslass',
      'sylveon',
      'kleavor',
      'ursaluna',
      'basculegion',
      'sneasler',
      'overqwil',
      'farigiraf',
      'dudunsparce',
      'kingambit',
      'annihilape',
      'clodsire',
      'wyrdeer'
    ].map(normalisePokemonId)
  )

  let search = ''
  let tableLimit = 120
  let filterKey = ''
  let wasteProfileOpen = false
  const defaultRangeFilters = () => Object.fromEntries(RANGE_FILTERS.flatMap(([id]) => [[`${id}Min`, ''], [`${id}Max`, '']]))
  const defaultFilters = () => ({
    selectedStat: 'total',
    groupBy: 'Generation',
    generationBasis: 'Original species generation',
    typeFilter: 'All',
    secondTypeFilter: 'All',
    levelCap: '',
    generationFilters: [],
    tierFilters: [],
    vgcTierFilters: [],
    excludedCategoryFilters: [],
    evoStageFilters: [],
    wasteProfile: 'Regular + regular defense',
    rangeFilters: defaultRangeFilters()
  })
  let draftFilters = defaultFilters()
  let activeFilters = defaultFilters()
  const cloneFilters = (filters) => ({
    ...filters,
    generationFilters: [...filters.generationFilters],
    tierFilters: [...filters.tierFilters],
    vgcTierFilters: [...filters.vgcTierFilters],
    excludedCategoryFilters: [...filters.excludedCategoryFilters],
    evoStageFilters: [...filters.evoStageFilters],
    rangeFilters: { ...filters.rangeFilters }
  })

  const generationFor = (num) => genRanges.findIndex(([min, max]) => num >= min && num <= max) + 1
  const formIntroducedGenerationFor = (pokemon) => {
    const text = normalisePokemonId(`${pokemon.name} ${pokemon.alias} ${pokemon.sprite}`)
    const speciesGeneration = generationFor(Number(pokemon.num))

    if (/eternamax/.test(text)) return 8
    if (/gmax/.test(text)) return 8
    if (/primal/.test(text)) return 6
    if (/mega/.test(text)) return officialMegaAliases.has(normalisePokemonId(pokemon.alias || pokemon.name)) ? 6 : 9
    if (/alola|totem/.test(text)) return 7
    if (/galar|hisui|origin|crowned|hero/.test(text)) return 8
    if (/paldea|stellar|terapagos|ogerpon|bloodmoon/.test(text) || isParadox(pokemon)) return 9
    if (/calyrexice|calyrexshadow|urshifu|zarude|enamorus|basculegion|ursaluna|wyrdeer|kleavor|sneasler|overqwil/.test(text)) return 8
    if (/kyuremwhite|kyuremblack|therian|darmanitanzen|keldeoresolute|meloettapirouette|basculinblue|basculinwhite/.test(text)) return 5
    if (/rotom|giratinaorigin|shayminsky|arceus/.test(text) && /-|\d|bug|dark|dragon|electric|fairy|fighting|fire|flying|ghost|grass|ground|ice|poison|psychic|rock|steel|water/.test(text)) return 4
    if (/deoxys|castform|groudonprimal|kyogreprimal/.test(text)) return /primal/.test(text) ? 6 : 3

    return speciesGeneration
  }
  const getStatValue = (pokemon, stat) => {
    if (stat === 'total') return pokemon.total
    if (stat === 'smogonTierScore') return pokemon.smogonTierScore
    if (stat === 'totalWasted') return pokemon.totalWasted
    if (stat === 'minMaxPercent') return pokemon.minMaxPercent
    if (stat === 'lopsidedRatio') return (Number(pokemon.lopsidedRatio) || 0) * 100
    return pokemon.baseStats?.[stat] ?? pokemon[stat] ?? pokemon.heuristics?.[stat] ?? 0
  }
  const statLabel = (stat) => stat === 'lopsidedRatio' ? 'Lopsided Ratio x100' : STAT_OPTIONS.find(([id]) => id === stat)?.[1] || 'BST'
  const statValueLabel = (pokemon, stat) => {
    const value = getStatValue(pokemon, stat)
    if (stat === 'smogonTierScore') return `${pokemon.tier} · score ${value}`
    if (stat === 'offenseDefenseBalance') return `${formatNumber(value)} · ${offenseDefenseLabel(value)}`
    if (stat === 'physicalSpecialBalance') return `${formatNumber(value)} · ${physicalSpecialLabel(value)}`
    if (stat === 'baseStatRating') return `${formatNumber(value)} · ${bsrQualityLabel(value)}`
    return formatNumber(value)
  }
  const statDescription = (stat) => STAT_DESCRIPTIONS[stat] || 'Derived stat used for filtering, sorting, and charting.'
  const idFor = (pokemon) => normalisePokemonId(`${pokemon.alias} ${pokemon.sprite} ${pokemon.name}`)
  const isMega = (pokemon) => /mega/i.test(`${pokemon.name} ${pokemon.alias}`)
  const isGmax = (pokemon) => /gmax/i.test(`${pokemon.name} ${pokemon.alias}`)
  const isTotem = (pokemon) => /totem/i.test(`${pokemon.name} ${pokemon.alias}`)
  const isEternamax = (pokemon) => /eternamax/i.test(`${pokemon.name} ${pokemon.alias}`)
  const isParadox = (pokemon) => [pokemon.alias, pokemon.sprite, pokemon.name].map(normalisePokemonId).some((id) => paradoxSet.has(id))
  const isCrossGenEvolution = (pokemon) =>
    [pokemon.alias, pokemon.sprite, pokemon.name].map(normalisePokemonId).some((id) => crossGenEvolutionSet.has(id))
  const isLegendary = (pokemon) => legendaryNums.has(Number(pokemon.num))
  const isUltraBeast = (pokemon) => ultraBeastNums.has(Number(pokemon.num))
  const baseLevelIdsFor = (pokemon) => {
    const ids = [pokemon.alias, pokemon.sprite, pokemon.name].map(normalisePokemonId).filter(Boolean)
    return [
      ...ids,
      ...ids.map((id) => id
        .replace(/gmax$/, '')
        .replace(/totem$/, '')
        .replace(/mega(?:x|y)?$/, '')
        .replace(/primal$/, '')
        .replace(/alola$/, '')
        .replace(/galar$/, '')
        .replace(/hisui$/, '')
        .replace(/paldea(?:aqua|blaze|combat)?$/, ''))
    ].filter(Boolean)
  }
  const minimumUsableLevelFor = (pokemon) => {
    const levels = baseLevelIdsFor(pokemon)
      .map((id) => evolutionMinLevels[id])
      .filter((level) => Number(level) > 1)
    return levels.length ? Math.max(...levels) : 1
  }
  const officialMegaAliases = new Set(
    [
      'venusaurmega',
      'charizardmegax',
      'charizardmegay',
      'blastoisemega',
      'beedrillmega',
      'pidgeotmega',
      'alakazammega',
      'slowbromega',
      'gengarmega',
      'kangaskhanmega',
      'pinsirmega',
      'gyaradosmega',
      'aerodactylmega',
      'mewtwomegax',
      'mewtwomegay',
      'ampharosmega',
      'steelixmega',
      'scizormega',
      'heracrossmega',
      'houndoommega',
      'tyranitarmega',
      'sceptilemega',
      'blazikenmega',
      'swampertmega',
      'gardevoirmega',
      'sableyemega',
      'mawilemega',
      'aggronmega',
      'medichammega',
      'manectricmega',
      'sharpedomega',
      'cameruptmega',
      'altariamega',
      'banettemega',
      'absolmega',
      'glaliemega',
      'salamencemega',
      'metagrossmega',
      'latiasmega',
      'latiosmega',
      'rayquazamega',
      'lopunnymega',
      'garchompmega',
      'lucariomega',
      'abomasnowmega',
      'gallademega',
      'audinomega',
      'dianciemega'
    ].map(normalisePokemonId)
  )
  const evoStageFor = (pokemon) => {
    const hasEvos = (pokemon.evos || []).length > 0
    const isRoot = normalisePokemonId(pokemon.alias) === normalisePokemonId(pokemon.evoline)
    if (isRoot && !hasEvos) return 'Single-stage'
    if (isRoot) return 'Basic'
    return hasEvos ? 'Middle' : 'Final'
  }
  const toggleValue = (list, value) => list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
  const selectedOrAll = (list, value) => !list.length || list.includes(value)
  const typeLabel = (type = '') => type[0]?.toUpperCase() + type.slice(1)
  const selectedLabel = (values, fallback = 'All') => values.length ? values.length : fallback
  const categoryOptionLabel = (key) => CATEGORY_OPTIONS.find(([optionKey]) => optionKey === key)?.[1] || key
  const rangeIsActive = (id) => draftFilters.rangeFilters[`${id}Min`] !== '' || draftFilters.rangeFilters[`${id}Max`] !== ''
  const typeComboKey = (pokemon) => (pokemon.types || []).slice().sort().join('/')
  const typeComboLabel = (key) => key.split('/').map(typeLabel).join(' / ')
  const colorForType = (type = '') => typeColors[type] || '#94a3b8'
  const colorsForGroup = (group, index) => {
    if (activeFilters.groupBy === 'Generation') return [genColors[index % genColors.length], genColors[index % genColors.length]]
    if (activeFilters.groupBy === 'Smogon Tier' || activeFilters.groupBy === 'VGC Tier') {
      const color = tierColors[group.key] || '#94a3b8'
      return [color, color]
    }
    if (activeFilters.groupBy === 'Type') return [colorForType(group.key), colorForType(group.key)]
    const types = group.key.split('/').filter(Boolean)
    return [colorForType(types[0]), colorForType(types[1] || types[0])]
  }
  const categoryLabels = (pokemon) =>
    CATEGORY_OPTIONS.filter(([key]) => pokemon[key]).map(([, label]) => label)
  const formatNumber = (value) => {
    const number = Number(value) || 0
    return Math.abs(number % 1) > 0.001 ? number.toFixed(2) : Math.round(number)
  }
  const speedFactorFor = (speed) => SPEED_FACTOR_TABLE.find(([max]) => speed <= max)?.[1] ?? 1
  const roundTo = (value, digits = 2) => Number(Number(value || 0).toFixed(digits))
  const ratingModifier = (rating) =>
    rating > 100 ? (3 * rating ** 2 - 600 * rating + 81200) / 51200 : 1
  const balanceIntensity = (value) => {
    const magnitude = Math.abs(Number(value) || 0)
    if (magnitude > 40) return 'Absolutely'
    if (magnitude > 30) return 'Strongly'
    if (magnitude > 20) return ''
    if (magnitude > 10) return 'Moderately'
    if (magnitude > 5) return 'Slightly'
    return 'Equally'
  }
  const offenseDefenseLabel = (value) => {
    const number = Number(value) || 0
    if (Math.abs(number) <= 5) return 'Balanced'
    const direction = number > 0 ? 'offensive' : 'defensive'
    const intensity = balanceIntensity(number)
    return intensity ? `${intensity} ${direction}` : direction[0].toUpperCase() + direction.slice(1)
  }
  const physicalSpecialLabel = (value) => {
    const number = Number(value) || 0
    if (Math.abs(number) <= 5) return 'Balanced'
    const direction = number > 0 ? 'physical' : 'special'
    const intensity = balanceIntensity(number)
    return intensity ? `${intensity} ${direction}` : direction[0].toUpperCase() + direction.slice(1)
  }
  const bsrQualityLabel = (value) => {
    const rating = Number(value) || 0
    if (rating > 1400) return 'Exaggerated'
    if (rating >= 900) return 'Too Good'
    if (rating >= 580) return 'Fantastic'
    if (rating >= 420) return 'Excellent'
    if (rating >= 300) return 'Very Good'
    if (rating >= 250) return 'Quite Good'
    if (rating >= 210) return 'Good'
    if (rating >= 175) return 'Average'
    if (rating >= 143) return 'Below Average'
    if (rating >= 127) return 'Poor'
    if (rating >= 100) return 'Bad'
    return 'Horrible'
  }
  const speedBandLabel = (value) => Number(value) <= 0 ? 'Trick Room' : Number(value) >= 2 ? 'Fast' : 'Middling'
  const selectedDefenseWaste = (metrics, wasteProfile = activeFilters.wasteProfile) =>
    wasteProfile.includes('adjusted') ? metrics.adjustedWastedDefense : metrics.wastedDefense
  const deriveHeuristics = (pokemon) => {
    const stats = pokemon.baseStats || {}
    const hp = Number(stats.hp) || 0
    const atk = Number(stats.atk) || 0
    const def = Number(stats.def) || 0
    const spa = Number(stats.spa) || 0
    const spd = Number(stats.spd) || 0
    const spe = Number(stats.spe) || 0
    const maxOffense = Math.max(atk, spa)
    const minOffense = Math.min(atk, spa)
    const allStats = [hp, atk, def, spa, spd, spe]
    const wastedOffense = maxOffense > 0 && minOffense / maxOffense >= 0.9 ? 0 : minOffense
    const wastedSpeed = spe <= 40 || spe >= 80 ? 0 : Math.min(spe - 40, 80 - spe)
    const wastedDefense = Math.abs(hp - def) + Math.abs(hp - spd)
    const minDefense = Math.max(1, Math.min(def, spd))
    const lopsidedRatio = Math.max(def, spd) / minDefense
    const adjustedWastedDefense = Math.ceil(wastedDefense * (lopsidedRatio - 1) * 50)
    const offenseDeficit = Math.max(0, 95 - maxOffense) * 3
    const mixedOffenseRatio = maxOffense ? Math.round((minOffense / maxOffense) * 100) : 0
    const bulkTotal = hp + def + spd
    const physicalBulk = hp + def
    const specialBulk = hp + spd
    const speedBandValue = spe <= 40 ? 0 : spe >= 80 ? 2 : 1
    const statSpread = Math.max(...allStats) - Math.min(...allStats)
    const archetype =
      spe >= 100 && maxOffense >= 110
        ? 'HYPER OFFENSE'
        : hp + def + spd >= 250 && maxOffense <= 85
          ? 'STALL'
          : 'BALANCE / UTILITY'
    const normalizedHp = hp / 4 + 18
    const normalizedAtk = atk + 18
    const normalizedDef = def + 18
    const normalizedSpa = spa + 18
    const normalizedSpd = spd + 18
    const speedFactor = speedFactorFor(spe)
    const physicalTankiness = normalizedHp * normalizedDef / 35
    const specialTankiness = normalizedHp * normalizedSpd / 35
    const physicalSweepiness =
      normalizedAtk * (normalizedAtk * speedFactor + 315) / (normalizedAtk * (1 - speedFactor) + 315)
    const specialSweepiness =
      normalizedSpa * (normalizedSpa * speedFactor + 315) / (normalizedSpa * (1 - speedFactor) + 315)
    const offenseDefenseBalance =
      roundTo(55 * Math.log(Math.max(physicalSweepiness, specialSweepiness) / Math.max(physicalTankiness, specialTankiness)), 1)
    const physicalSpecialBalance =
      roundTo(55 * Math.log((physicalTankiness * physicalSweepiness) / (specialTankiness * specialSweepiness)), 1)
    const modifier =
      ratingModifier(physicalTankiness) *
      ratingModifier(specialTankiness) *
      ratingModifier(physicalSweepiness) *
      ratingModifier(specialSweepiness)
    const baseStatRating = Math.round(
      physicalTankiness * specialTankiness * (physicalSweepiness + specialSweepiness) * modifier /
      (56 * (physicalTankiness + specialTankiness))
    )

    return {
      hp,
      atk,
      def,
      spa,
      spd,
      spe,
      maxOffense,
      mixedOffenseRatio,
      bulkTotal,
      physicalBulk,
      specialBulk,
      speedBandValue,
      statSpread,
      wastedOffense,
      wastedSpeed,
      wastedDefense,
      lopsidedRatio,
      adjustedWastedDefense,
      offenseDeficit,
      speedFactor,
      physicalTankiness: roundTo(physicalTankiness),
      specialTankiness: roundTo(specialTankiness),
      physicalSweepiness: roundTo(physicalSweepiness),
      specialSweepiness: roundTo(specialSweepiness),
      offenseDefenseBalance,
      physicalSpecialBalance,
      baseStatRating,
      archetype
    }
  }
  const totalWastedFor = (metrics, wasteProfile = activeFilters.wasteProfile) => {
    const defenseWaste = selectedDefenseWaste(metrics, wasteProfile)
    if (wasteProfile.startsWith('Advanced')) {
      if (metrics.archetype === 'HYPER OFFENSE') {
        return metrics.wastedOffense + metrics.wastedSpeed + metrics.hp + metrics.def + metrics.spd
      }
      if (metrics.archetype === 'STALL') {
        return metrics.wastedSpeed + defenseWaste + metrics.atk + metrics.spa
      }
      return metrics.wastedOffense + metrics.wastedSpeed + defenseWaste + metrics.offenseDeficit
    }
    return metrics.wastedOffense + metrics.wastedSpeed + defenseWaste
  }
  const withinRange = (pokemon, id) => {
    const min = activeFilters.rangeFilters[`${id}Min`]
    const max = activeFilters.rangeFilters[`${id}Max`]
    const value = Number(pokemon[id])
    if (min !== '' && value < Number(min)) return false
    if (max !== '' && value > Number(max)) return false
    return true
  }
  const matchesAnyType = (pokemon, type) => type === 'All' || (pokemon.types || []).includes(type)
  const matchesType = (pokemon, primary, secondary) => {
    const requested = [primary, secondary].filter((type) => type && type !== 'All')
    if (!requested.length) return true
    return requested.every((type) => matchesAnyType(pokemon, type))
  }
  const quantile = (values, q) => {
    if (!values.length) return 0
    const pos = (values.length - 1) * q
    const base = Math.floor(pos)
    const rest = pos - base
    return values[base + 1] === undefined ? values[base] : values[base] + rest * (values[base + 1] - values[base])
  }
  const stableJitter = (seed, spread = 11) => {
    const x = Math.sin(seed * 999.77) * 10000
    return (x - Math.floor(x) - 0.5) * spread
  }
  const densityPath = (values, y, scaleX, minValue, maxValue, color, rowHeight = 88) => {
    if (!values.length) return { path: '', color }
    const bins = 34
    const valueRange = maxValue - minValue
    const bandwidth = valueRange <= 20 ? Math.max(0.6, valueRange / 12) : Math.max(18, valueRange / 18)
    const points = Array.from({ length: bins }, (_, i) => {
      const value = minValue + ((maxValue - minValue) * i) / (bins - 1)
      const density = values.reduce((sum, sample) => {
        const z = (value - sample) / bandwidth
        return sum + Math.exp(-0.5 * z * z)
      }, 0)
      return { value, density }
    })
    const maxDensity = Math.max(...points.map((point) => point.density), 1)
    const top = points.map((point) => [scaleX(point.value), y - 4 - (point.density / maxDensity) * (rowHeight / 3)])
    const bottom = points.slice().reverse().map((point) => [scaleX(point.value), y - 4])
    const path = [...top, ...bottom]
      .map(([x, py], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${py.toFixed(2)}`)
      .join(' ') + ' Z'
    return { path, color }
  }
  const setDraft = (patch) => {
    draftFilters = cloneFilters({ ...draftFilters, ...patch })
  }
  const toggleDraftList = (key, value) => {
    const list = draftFilters[key] || []
    setDraft({ [key]: list.includes(value) ? list.filter((item) => item !== value) : [...list, value] })
  }
  const setDraftRange = (key, value) => {
    setDraft({ rangeFilters: { ...draftFilters.rangeFilters, [key]: value } })
  }
  const applyFilters = () => {
    activeFilters = cloneFilters(draftFilters)
  }
  const resetFilters = () => {
    const defaults = defaultFilters()
    draftFilters = cloneFilters(defaults)
    activeFilters = cloneFilters(defaults)
    search = ''
  }

  $: query = normalisePokemonId(search)
  $: filtersAreDirty = JSON.stringify(draftFilters) !== JSON.stringify(activeFilters)
  $: {
    const nextFilterKey = [
      activeFilters.selectedStat,
      activeFilters.groupBy,
      activeFilters.generationBasis,
      activeFilters.typeFilter,
      activeFilters.secondTypeFilter,
      activeFilters.levelCap,
      activeFilters.generationFilters.join(','),
      activeFilters.tierFilters.join(','),
      activeFilters.vgcTierFilters.join(','),
      activeFilters.excludedCategoryFilters.join(','),
      activeFilters.evoStageFilters.join(','),
      activeFilters.wasteProfile,
      JSON.stringify(activeFilters.rangeFilters),
      query,
    ].join('|')
    if (nextFilterKey !== filterKey) {
      filterKey = nextFilterKey
      tableLimit = 120
    }
  }
  $: statsDex = nationalDex.filter((pokemon) => normalisePokemonId(pokemon.alias || pokemon.name) !== 'xerneasneutral')
  $: enrichedDex = statsDex.map((pokemon) => {
    const wasteProfile = activeFilters.wasteProfile
    const vgc = getVgcTier(pokemon)
    const tier = getPokemonTier(pokemon)
    const heuristics = deriveHeuristics(pokemon)
    const totalWasted = totalWastedFor(heuristics, wasteProfile)
    const minMaxPercent = Math.round((1 - totalWasted / Math.max(1, Number(pokemon.total) || 1)) * 100)
    return {
      ...pokemon,
      ...heuristics,
      generation: generationFor(Number(pokemon.num)),
      formGeneration: formIntroducedGenerationFor(pokemon),
      heuristics,
      totalWasted,
      totalWastedRegular: heuristics.wastedOffense + heuristics.wastedSpeed + selectedDefenseWaste(heuristics, wasteProfile),
      totalWastedAdvanced:
        heuristics.archetype === 'HYPER OFFENSE'
          ? heuristics.wastedOffense + heuristics.wastedSpeed + heuristics.hp + heuristics.def + heuristics.spd
        : heuristics.archetype === 'STALL'
            ? heuristics.wastedSpeed + selectedDefenseWaste(heuristics, wasteProfile) + heuristics.atk + heuristics.spa
            : heuristics.wastedOffense + heuristics.wastedSpeed + selectedDefenseWaste(heuristics, wasteProfile) + heuristics.offenseDeficit,
      minMaxPercent,
      tier,
      smogonTierScore: SMOGON_TIER_SCORES[tier] || SMOGON_TIER_SCORES.Untiered,
      vgc,
      isLegendary: isLegendary(pokemon),
      isUltraBeast: isUltraBeast(pokemon),
      isMega: isMega(pokemon),
      isGmax: isGmax(pokemon),
      isTotem: isTotem(pokemon),
      isEternamax: isEternamax(pokemon),
      isParadox: isParadox(pokemon),
      isCrossGenEvolution: isCrossGenEvolution(pokemon),
      minimumLevel: minimumUsableLevelFor(pokemon),
      evoStage: evoStageFor(pokemon),
      typeCombo: typeComboKey(pokemon)
    }
  })
  $: filteredDex = enrichedDex
    .filter((pokemon) => pokemon.generation >= 1 && pokemon.generation <= 9)
    .filter((pokemon) => !pokemon.isEternamax)
    .filter((pokemon) => !activeFilters.levelCap || pokemon.minimumLevel <= Number(activeFilters.levelCap))
    .filter((pokemon) => selectedOrAll(activeFilters.generationFilters, `Gen ${activeFilters.generationBasis === 'Form introduced generation' ? pokemon.formGeneration : pokemon.generation}`))
    .filter((pokemon) => !activeFilters.excludedCategoryFilters.some((category) => pokemon[category]))
    .filter((pokemon) => matchesType(pokemon, activeFilters.typeFilter, activeFilters.secondTypeFilter))
    .filter((pokemon) => selectedOrAll(activeFilters.tierFilters, pokemon.tier))
    .filter((pokemon) => selectedOrAll(activeFilters.evoStageFilters, pokemon.evoStage))
    .filter((pokemon) => selectedOrAll(activeFilters.vgcTierFilters, pokemon.vgc?.label || 'No VGC wins'))
    .filter((pokemon) => RANGE_FILTERS.every(([id]) => withinRange(pokemon, id)))
    .filter((pokemon) => !query || normalisePokemonId(`${pokemon.name} ${pokemon.alias} ${pokemon.num} gen ${pokemon.generation} form gen ${pokemon.formGeneration} introduced gen ${pokemon.formGeneration} minimum level ${pokemon.minimumLevel} level ${pokemon.minimumLevel} ${pokemon.tier} smogon tier ${pokemon.tier} smogon tier score ${pokemon.smogonTierScore} ${pokemon.vgc?.label || 'No VGC wins'} ${pokemon.types?.join(' ')} ${typeComboLabel(pokemon.typeCombo)} ${pokemon.evoStage} ${categoryLabels(pokemon).join(' ')} ${pokemon.archetype} bst ${pokemon.total} hp ${pokemon.hp} attack ${pokemon.atk} defense ${pokemon.def} special attack ${pokemon.spa} special defense ${pokemon.spd} speed ${pokemon.spe} ${speedBandLabel(pokemon.speedBandValue)} wasted offense ${pokemon.wastedOffense} wasted speed ${pokemon.wastedSpeed} wasted defense ${pokemon.wastedDefense} adjusted wasted defense ${pokemon.adjustedWastedDefense} lopsided ratio ${formatNumber(pokemon.lopsidedRatio)} offense deficit ${pokemon.offenseDeficit} mixed offense ${pokemon.mixedOffenseRatio} bulk ${pokemon.bulkTotal} physical bulk ${pokemon.physicalBulk} special bulk ${pokemon.specialBulk} max offense ${pokemon.maxOffense} stat spread ${pokemon.statSpread} total wasted ${pokemon.totalWasted} min max ${pokemon.minMaxPercent} physical tankiness ${pokemon.physicalTankiness} special tankiness ${pokemon.specialTankiness} physical sweepiness ${pokemon.physicalSweepiness} special sweepiness ${pokemon.specialSweepiness} offense defense balance ${pokemon.offenseDefenseBalance} ${offenseDefenseLabel(pokemon.offenseDefenseBalance)} physical special balance ${pokemon.physicalSpecialBalance} ${physicalSpecialLabel(pokemon.physicalSpecialBalance)} bsr base stat rating ${pokemon.baseStatRating} ${bsrQualityLabel(pokemon.baseStatRating)}`).includes(query))
  $: sortedDex = filteredDex.slice().sort((a, b) => getStatValue(b, activeFilters.selectedStat) - getStatValue(a, activeFilters.selectedStat) || a.num - b.num)
  $: renderedTable = sortedDex.slice(0, tableLimit)
  $: values = filteredDex.map((pokemon) => getStatValue(pokemon, activeFilters.selectedStat))
  $: axisBounds = STAT_AXIS_BOUNDS[activeFilters.selectedStat]
  $: minValue = axisBounds
    ? values.length ? Math.min(...values, axisBounds[0]) : axisBounds[0]
    : values.length
      ? activeFilters.selectedStat === 'minMaxPercent' ? Math.min(...values, 100) - 5 : Math.max(0, Math.min(...values, 1) - 20)
      : 0
  $: maxValue = axisBounds
    ? values.length ? Math.max(...values, axisBounds[1]) : axisBounds[1]
    : values.length ? Math.max(...values, activeFilters.selectedStat === 'total' ? 800 : 255, 1) : 100
  $: plotWidth = 960
  $: plotHeight = Math.max(220, 94 + chartRows.length * 74)
  $: chartLeft = 230
  $: chartRight = 132
  $: axisWidth = plotWidth - chartLeft - chartRight
  $: scaleX = (value) => chartLeft + ((value - minValue) / Math.max(1, maxValue - minValue)) * axisWidth
  $: chartGenerationKey = (pokemon) => activeFilters.generationBasis === 'Form introduced generation' ? pokemon.formGeneration : pokemon.generation
  $: chartGroups = activeFilters.groupBy === 'Generation'
    ? Array.from({ length: 9 }, (_, index) => ({
      key: String(index + 1),
      label: String(index + 1),
      items: filteredDex.filter((pokemon) => chartGenerationKey(pokemon) === index + 1),
      keepEmpty: true
    }))
    : activeFilters.groupBy === 'Type'
      ? TYPE_OPTIONS.map((type) => ({
        key: type,
        label: typeLabel(type),
        items: filteredDex.filter((pokemon) => pokemon.types?.includes(type))
      })).filter((group) => group.items.length)
      : activeFilters.groupBy === 'Smogon Tier'
        ? SMOGON_GROUP_ORDER.map((tier) => ({
          key: tier,
          label: tier,
          items: filteredDex.filter((pokemon) => pokemon.tier === tier)
        })).filter((group) => group.items.length)
      : activeFilters.groupBy === 'VGC Tier'
        ? VGC_GROUP_ORDER.map((tier) => ({
          key: tier,
          label: tier,
          items: filteredDex.filter((pokemon) => (pokemon.vgc?.label || 'No VGC wins') === tier)
        })).filter((group) => group.items.length)
      : Array.from(new Set(filteredDex.map((pokemon) => pokemon.typeCombo)))
        .sort()
        .map((combo) => ({
          key: combo,
          label: typeComboLabel(combo),
          items: filteredDex.filter((pokemon) => pokemon.typeCombo === combo)
        }))
        .filter((group) => group.items.length)
  $: chartRows = chartGroups.map((group, index) => {
    const items = group.items
    const sorted = items.map((pokemon) => getStatValue(pokemon, activeFilters.selectedStat)).sort((a, b) => a - b)
    const y = 70 + index * 74
    const q1 = quantile(sorted, 0.25)
    const median = quantile(sorted, 0.5)
    const q3 = quantile(sorted, 0.75)
    const min = sorted[0] || 0
    const max = sorted[sorted.length - 1] || 0
    const highExamples = items.slice().sort((a, b) => getStatValue(b, activeFilters.selectedStat) - getStatValue(a, activeFilters.selectedStat)).slice(0, 3)
    const lowExample = items.slice().sort((a, b) => getStatValue(a, activeFilters.selectedStat) - getStatValue(b, activeFilters.selectedStat))[0]
    const [colorStart, colorEnd] = colorsForGroup(group, index)
    const fill = colorStart === colorEnd ? colorStart : `url(#row-gradient-${index})`
    return {
      key: group.key,
      label: group.label,
      index,
      items,
      sorted,
      y,
      q1,
      median,
      q3,
      min,
      max,
      color: colorStart,
      colorStart,
      colorEnd,
      fill,
      highExamples,
      lowExample,
      density: densityPath(sorted, y, scaleX, minValue, maxValue, colorStart)
    }
  })
</script>

<svelte:head>
  <title>Run Tracker | Pokémon Stat Explorer</title>
  <meta
    name="description"
    content="Explore Pokémon base stats by generation with raincloud plots, type filters, Smogon tiers, and VGC tournament tiers."
  />
</svelte:head>

<Hero theme={['#111827', '#db2777', '#f8fafc']}>
  <svelte:fragment slot="hero">
    <div>
      <small>Run Tracker</small>
      <h1>Stat Explorer</h1>
    </div>
  </svelte:fragment>
</Hero>

<main class="mx-auto max-w-7xl px-4 pb-24 md:px-8">
  <section class="controls">
    <div class="controls-heading">
      <div>
        <p class="eyebrow">Filters</p>
        <h2>Raincloud Stat Explorer</h2>
        <p>
          {filteredDex.length} of {statsDex.length} forms shown. VGC Tier 6 still means that Pokémon or form has won at least one major VGC tournament.
        </p>
      </div>
      <div class="status-chip" class:dirty={filtersAreDirty}>
        {filtersAreDirty ? 'Pending changes' : 'Filters applied'}
      </div>
    </div>

    {#if filtersAreDirty}
      <p class="pending-note">Filter changes are pending. Press Apply Filters to update the chart and table.</p>
    {/if}

    <div class="control-grid">
      <label class="control-card search-card">
        <span class="field-label">Search</span>
        <div class="input-shell">
          <Icon icon={SearchIcon} />
          <input bind:value={search} type="search" placeholder="Search..." />
        </div>
      </label>

      <label class="control-card">
        <span class="field-label">
          Stat
          <span class="info-bubble" tabindex="0" role="note" aria-label={statDescription(draftFilters.selectedStat)} data-tooltip={statDescription(draftFilters.selectedStat)}>
            <Icon icon={Info} />
          </span>
        </span>
        <div class="select-shell">
          <Icon icon={HP} />
          <select value={draftFilters.selectedStat} on:change={(event) => setDraft({ selectedStat: event.currentTarget.value })}>
            {#each STAT_GROUPS as group}
              <optgroup label={group.label}>
                {#each group.options as [id, label]}
                  <option value={id}>{label}</option>
                {/each}
              </optgroup>
            {/each}
          </select>
          <Icon icon={Caret} class="chevron" />
        </div>
      </label>

      <label class="control-card">
        <span class="field-label">Group By</span>
        <div class="select-shell">
          <Icon icon={Box} />
          <select value={draftFilters.groupBy} on:change={(event) => setDraft({ groupBy: event.currentTarget.value })}>
            {#each GROUP_BY_OPTIONS as option}
              <option>{option}</option>
            {/each}
          </select>
          <Icon icon={Caret} class="chevron" />
        </div>
      </label>

      <label class="control-card">
        <span class="field-label">Type</span>
        <div class="select-shell">
          <span class="type-dot"></span>
          <select value={draftFilters.typeFilter} on:change={(event) => setDraft({ typeFilter: event.currentTarget.value })}>
            {#each TYPES as type}
              <option value={type}>{type === 'All' ? type : type[0].toUpperCase() + type.slice(1)}</option>
            {/each}
          </select>
          <Icon icon={Caret} class="chevron" />
        </div>
      </label>

      <label class="control-card">
        <span class="field-label">Second Type</span>
        <div class="select-shell">
          <span class="type-dot hollow"></span>
          <select value={draftFilters.secondTypeFilter} on:change={(event) => setDraft({ secondTypeFilter: event.currentTarget.value })}>
            {#each TYPES as type}
              <option value={type}>{type === 'All' ? type : type[0].toUpperCase() + type.slice(1)}</option>
            {/each}
          </select>
          <Icon icon={Caret} class="chevron" />
        </div>
      </label>

      <label class="control-card">
        <span class="field-label">Generation Basis</span>
        <div class="select-shell">
          <Icon icon={BarChart} />
          <select value={draftFilters.generationBasis} on:change={(event) => setDraft({ generationBasis: event.currentTarget.value })}>
            <option>Original species generation</option>
            <option>Form introduced generation</option>
          </select>
          <Icon icon={Caret} class="chevron" />
        </div>
      </label>

      <label class="control-card">
        <span class="field-label">Max Level</span>
        <div class="level-shell">
          <div class="level-row">
            <span class="level-icon">Lv</span>
            <strong>{draftFilters.levelCap || 'All levels'}</strong>
            <input
              value={draftFilters.levelCap}
              on:input={(event) => setDraft({ levelCap: event.currentTarget.value === '100' ? '' : event.currentTarget.value })}
              type="number"
              min="1"
              max="100"
              placeholder="All"
            />
          </div>
          <input
            class="level-range"
            value={draftFilters.levelCap === '' ? 100 : draftFilters.levelCap}
            on:input={(event) => setDraft({ levelCap: event.currentTarget.value === '100' ? '' : event.currentTarget.value })}
            type="range"
            min="1"
            max="100"
            step="1"
            aria-label="Maximum evolution level"
          />
        </div>
      </label>

      <div class="control-card wide" class:open-dropdown={wasteProfileOpen}>
        <span class="field-label">Waste Profile</span>
        <details class="single-panel" bind:open={wasteProfileOpen}>
          <summary>
            <span><Icon icon={Shield} /> {draftFilters.wasteProfile}</span>
            <Icon icon={Caret} class="menu-chevron" />
          </summary>
          <div class="single-dropdown">
            {#each WASTE_PROFILE_OPTIONS as option}
              <button type="button" class:active={draftFilters.wasteProfile === option} on:click={() => { setDraft({ wasteProfile: option }); wasteProfileOpen = false }}>
                {#if draftFilters.wasteProfile === option}
                  <Icon icon={Check} />
                {/if}
                <span>{option}</span>
              </button>
            {/each}
          </div>
        </details>
      </div>
    </div>

    <div class="multi-grid">
      <details class="multi-panel">
        <summary><span><Icon icon={BarChart} /> Smogon tiers</span><b>{selectedLabel(draftFilters.tierFilters)}</b><Icon icon={Caret} class="menu-chevron" /></summary>
        <div class="dropdown-panel">
          {#if draftFilters.tierFilters.length}
            <p class="selected-list">
              {#each draftFilters.tierFilters as tier}
                <button type="button" on:click={() => toggleDraftList('tierFilters', tier)}>{tier} x</button>
              {/each}
            </p>
          {/if}
          {#each SMOGON_TIER_OPTIONS as tier}
            <label class:selected={draftFilters.tierFilters.includes(tier)}><input checked={draftFilters.tierFilters.includes(tier)} on:change={() => toggleDraftList('tierFilters', tier)} value={tier} type="checkbox" /> <span>{tier}</span></label>
          {/each}
        </div>
      </details>

      <details class="multi-panel">
        <summary><span><Icon icon={BarChart} /> Generations</span><b>{selectedLabel(draftFilters.generationFilters)}</b><Icon icon={Caret} class="menu-chevron" /></summary>
        <div class="dropdown-panel">
          {#if draftFilters.generationFilters.length}
            <p class="selected-list">
              {#each draftFilters.generationFilters as generation}
                <button type="button" on:click={() => toggleDraftList('generationFilters', generation)}>{generation} x</button>
              {/each}
            </p>
          {/if}
          {#each GENERATION_OPTIONS as generation}
            <label class:selected={draftFilters.generationFilters.includes(generation)}><input checked={draftFilters.generationFilters.includes(generation)} on:change={() => toggleDraftList('generationFilters', generation)} value={generation} type="checkbox" /> <span>{generation}</span></label>
          {/each}
        </div>
      </details>

      <details class="multi-panel">
        <summary><span><Icon icon={Trophy} /> VGC tiers</span><b>{selectedLabel(draftFilters.vgcTierFilters)}</b><Icon icon={Caret} class="menu-chevron" /></summary>
        <div class="dropdown-panel">
          {#if draftFilters.vgcTierFilters.length}
            <p class="selected-list">
              {#each draftFilters.vgcTierFilters as tier}
                <button type="button" on:click={() => toggleDraftList('vgcTierFilters', tier)}>{tier} x</button>
              {/each}
            </p>
          {/if}
          {#each VGC_TIER_OPTIONS as tier}
            <label class:selected={draftFilters.vgcTierFilters.includes(tier)}><input checked={draftFilters.vgcTierFilters.includes(tier)} on:change={() => toggleDraftList('vgcTierFilters', tier)} value={tier} type="checkbox" /> <span>{tier}</span></label>
          {/each}
        </div>
      </details>

      <details class="multi-panel">
        <summary><span><Icon icon={X} /> Exclude</span><b>{selectedLabel(draftFilters.excludedCategoryFilters, 'None')}</b><Icon icon={Caret} class="menu-chevron" /></summary>
        <div class="dropdown-panel">
          {#if draftFilters.excludedCategoryFilters.length}
            <p class="selected-list">
              {#each draftFilters.excludedCategoryFilters as key}
                <button type="button" on:click={() => toggleDraftList('excludedCategoryFilters', key)}>{categoryOptionLabel(key)} x</button>
              {/each}
            </p>
          {/if}
          {#each CATEGORY_OPTIONS as [key, label]}
            <label class:selected={draftFilters.excludedCategoryFilters.includes(key)}><input checked={draftFilters.excludedCategoryFilters.includes(key)} on:change={() => toggleDraftList('excludedCategoryFilters', key)} value={key} type="checkbox" /> <span>{label}</span></label>
          {/each}
        </div>
      </details>

      <details class="multi-panel">
        <summary><span><Icon icon={Check} /> Evolution stage</span><b>{selectedLabel(draftFilters.evoStageFilters)}</b><Icon icon={Caret} class="menu-chevron" /></summary>
        <div class="dropdown-panel">
          {#if draftFilters.evoStageFilters.length}
            <p class="selected-list">
              {#each draftFilters.evoStageFilters as stage}
                <button type="button" on:click={() => toggleDraftList('evoStageFilters', stage)}>{stage} x</button>
              {/each}
            </p>
          {/if}
          {#each EVO_STAGE_OPTIONS as stage}
            <label class:selected={draftFilters.evoStageFilters.includes(stage)}><input checked={draftFilters.evoStageFilters.includes(stage)} on:change={() => toggleDraftList('evoStageFilters', stage)} value={stage} type="checkbox" /> <span>{stage}</span></label>
          {/each}
        </div>
      </details>
    </div>

    <div class="range-panel">
      <div class="range-panel-heading">
        <span><Icon icon={BarChart} /> Numeric Filters</span>
        <small>BST, base stats, and derived efficiency metrics</small>
      </div>
      {#each RANGE_FILTER_GROUPS as group}
        <details class="range-section" open={group.open}>
          <summary>
            <span><Icon icon={BarChart} /> {group.label}</span>
            <small>{group.description}</small>
            <Icon icon={Caret} class="menu-chevron" />
          </summary>
          <div class="range-list">
            {#each group.options as [id, label, minBound, maxBound, step, icon]}
              <div class="range-control" class:active={rangeIsActive(id)}>
                <div class="range-title">
                  <span class="range-name">
                    <Icon icon={icon} />
                    {label}
                    <span class="info-bubble" tabindex="0" role="note" aria-label={statDescription(id)} data-tooltip={statDescription(id)}>
                      <Icon icon={Info} />
                    </span>
                  </span>
                  {#if rangeIsActive(id)}
                    <button type="button" aria-label="Clear {label} filter" on:click={() => setDraft({ rangeFilters: { ...draftFilters.rangeFilters, [`${id}Min`]: '', [`${id}Max`]: '' } })}>
                      <Icon icon={X} />
                    </button>
                  {/if}
                </div>
                <div class="range-inputs">
                  <input value={draftFilters.rangeFilters[`${id}Min`]} on:input={(event) => setDraftRange(`${id}Min`, event.currentTarget.value)} type="number" {step} placeholder="Min" min={minBound} max={maxBound} />
                  <input value={draftFilters.rangeFilters[`${id}Max`]} on:input={(event) => setDraftRange(`${id}Max`, event.currentTarget.value)} type="number" {step} placeholder="Max" min={minBound} max={maxBound} />
                </div>
                <div class="range-slider-wrap">
                  <div class="slider-pair">
                    <input
                      value={draftFilters.rangeFilters[`${id}Min`] === '' ? minBound : draftFilters.rangeFilters[`${id}Min`]}
                      on:input={(event) => setDraftRange(`${id}Min`, event.currentTarget.value)}
                      type="range"
                      min={minBound}
                      max={maxBound}
                      {step}
                    />
                    <input
                      value={draftFilters.rangeFilters[`${id}Max`] === '' ? maxBound : draftFilters.rangeFilters[`${id}Max`]}
                      on:input={(event) => setDraftRange(`${id}Max`, event.currentTarget.value)}
                      type="range"
                      min={minBound}
                      max={maxBound}
                      {step}
                    />
                  </div>
                  <small>{draftFilters.rangeFilters[`${id}Min`] === '' ? minBound : draftFilters.rangeFilters[`${id}Min`]} - {draftFilters.rangeFilters[`${id}Max`] === '' ? maxBound : draftFilters.rangeFilters[`${id}Max`]}</small>
                </div>
              </div>
            {/each}
          </div>
        </details>
      {/each}
    </div>
    <div class="filter-actions">
      <span>{filtersAreDirty ? 'Pending changes' : 'Filters applied'}</span>
      <button type="button" class="apply-filters" class:dirty={filtersAreDirty} on:click={applyFilters}>Apply Filters</button>
      <button type="button" class="reset-filters" on:click={resetFilters}>Reset</button>
    </div>
  </section>

  <section class="chart-panel">
    <div class="chart-shell">
      <svg viewBox="0 0 {plotWidth} {plotHeight}" role="img" aria-label="{activeFilters.groupBy} raincloud plot for {statLabel(activeFilters.selectedStat)}">
        <defs>
          {#each chartRows as row}
            {#if row.colorStart !== row.colorEnd}
              <linearGradient id="row-gradient-{row.index}" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color={row.colorStart} />
                <stop offset="100%" stop-color={row.colorEnd} />
              </linearGradient>
            {/if}
          {/each}
        </defs>
        <line x1="54" y1="28" x2="54" y2={plotHeight - 50} class="axis" />
        <text x="18" y={plotHeight / 2} class="axis-label" transform="rotate(-90 18 {plotHeight / 2})">{activeFilters.groupBy}</text>
        {#each chartRows as row}
          <g class="row">
            <text x={chartLeft - 18} y={row.y + 4} class="gen-label" text-anchor="end">{row.label}</text>
            {#if row.lowExample}
              <foreignObject x={chartLeft - 76} y={row.y - 27} width="48" height="48">
                <PIcon lazy name={row.lowExample.sprite} className="plot-icon" />
              </foreignObject>
            {/if}
            {#if row.items.length}
              <path d={row.density.path} fill={row.fill} opacity="0.42" />
              <line x1={scaleX(row.min)} x2={scaleX(row.max)} y1={row.y + 4} y2={row.y + 4} class="whisker" />
              <line x1={scaleX(row.min)} x2={scaleX(row.min)} y1={row.y} y2={row.y + 8} class="whisker" />
              <line x1={scaleX(row.max)} x2={scaleX(row.max)} y1={row.y} y2={row.y + 8} class="whisker" />
              <rect x={scaleX(row.q1)} y={row.y - 7} width={Math.max(2, scaleX(row.q3) - scaleX(row.q1))} height="22" class="box" />
              <line x1={scaleX(row.median)} x2={scaleX(row.median)} y1={row.y - 7} y2={row.y + 15} class="median" />
              <text x={scaleX(row.median)} y={row.y - 12} class="median-label">{formatNumber(row.median)}</text>
              {#each row.items as pokemon, dotIndex (pokemon.alias)}
                {@const dotValue = getStatValue(pokemon, activeFilters.selectedStat)}
                <circle
                  cx={scaleX(dotValue)}
                  cy={row.y + 29 + stableJitter(dotIndex + pokemon.num + row.index)}
                  r="3.2"
                  fill={row.color}
                  opacity="0.55"
                >
                  <title>{pokemon.name} · {statLabel(activeFilters.selectedStat)} {statValueLabel(pokemon, activeFilters.selectedStat)} · {activeFilters.groupBy} {row.label}</title>
                </circle>
              {/each}
              <text x={scaleX(row.min) - 4} y={row.y + 10} class="range-label" text-anchor="end">{formatNumber(row.min)}</text>
              <text x={scaleX(row.max) + 4} y={row.y + 10} class="range-label">{formatNumber(row.max)}</text>
              <text x={plotWidth - 22} y={row.y + 8} class="count-label" text-anchor="end">(n = {row.items.length})</text>
              {#each row.highExamples as pokemon, iconIndex}
                <foreignObject x={plotWidth - 176 + iconIndex * 34} y={row.y - 28} width="44" height="44">
                  <PIcon lazy name={pokemon.sprite} className="plot-icon" />
                </foreignObject>
              {/each}
            {:else}
              <text x={chartLeft} y={row.y + 5} class="empty-label">No matches</text>
            {/if}
          </g>
        {/each}
      </svg>
    </div>
  </section>

  <section class="table-panel">
    <div class="table-heading">
      <h2>Ranked Forms</h2>
      <span>{renderedTable.length} shown</span>
    </div>
    <div class="overflow-x-auto">
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Pokémon</th>
            <th>Gen</th>
            <th>Min Lv</th>
            <th>Stage</th>
            <th>Types</th>
            <th>Categories</th>
            <th>{statLabel(activeFilters.selectedStat)}</th>
            <th>BST</th>
            <th>Archetype</th>
            <th>Total Wasted</th>
            <th>Min-Max</th>
            <th>Ratio</th>
            <th>Off. Deficit</th>
            <th>Bulk</th>
            <th>Mix</th>
            <th>Speed Band</th>
            <th>Smogon</th>
            <th>VGC</th>
          </tr>
        </thead>
        <tbody>
          {#each renderedTable as pokemon, index (pokemon.alias)}
            {@const rowValue = getStatValue(pokemon, activeFilters.selectedStat)}
            <tr>
              <td>{index + 1}</td>
              <td>
                <span class="mon-cell">
                  <PIcon lazy name={pokemon.sprite} className="table-icon" />
                  <span>
                    <b>{pokemon.name}</b>
                    <small>#{String(pokemon.num).padStart(4, '0')}</small>
                  </span>
                </span>
              </td>
              <td>
                <span class="gen-cell">
                  <b>Gen {pokemon.generation}</b>
                  {#if pokemon.formGeneration !== pokemon.generation}
                    <small>Form Gen {pokemon.formGeneration}</small>
                  {/if}
                </span>
              </td>
              <td>{pokemon.minimumLevel}</td>
              <td>{pokemon.evoStage}</td>
              <td>
                <span class="type-cell">
                  {#each pokemon.types as type}
                    <TypeBadge {type} className="tiny-type" />
                  {/each}
                </span>
              </td>
              <td>
                <span class="category-cell">
                  {#each categoryLabels(pokemon) as label}
                    <span>{label}</span>
                  {/each}
                  {#if !categoryLabels(pokemon).length}
                    <span>Regular</span>
                  {/if}
                </span>
              </td>
              <td>
                {#if activeFilters.selectedStat === 'smogonTierScore'}
                  <span class="tier-score-cell"><TierBadge tier={pokemon.tier} /><small>score {rowValue}</small></span>
                {:else if activeFilters.selectedStat === 'offenseDefenseBalance'}
                  <span class="metric-label-cell"><b>{formatNumber(rowValue)}</b><small>{offenseDefenseLabel(rowValue)}</small></span>
                {:else if activeFilters.selectedStat === 'physicalSpecialBalance'}
                  <span class="metric-label-cell"><b>{formatNumber(rowValue)}</b><small>{physicalSpecialLabel(rowValue)}</small></span>
                {:else if activeFilters.selectedStat === 'baseStatRating'}
                  <span class="metric-label-cell"><b>{formatNumber(rowValue)}</b><small>{bsrQualityLabel(rowValue)}</small></span>
                {:else}
                  <b>{formatNumber(rowValue)}</b>
                {/if}
              </td>
              <td>{pokemon.total}</td>
              <td><span class="archetype-pill">{pokemon.archetype}</span></td>
              <td>{formatNumber(pokemon.totalWasted)}</td>
              <td>{pokemon.minMaxPercent}%</td>
              <td>{formatNumber(pokemon.lopsidedRatio)}</td>
              <td>{formatNumber(pokemon.offenseDeficit)}</td>
              <td>{pokemon.bulkTotal}</td>
              <td>{pokemon.mixedOffenseRatio}%</td>
              <td>{speedBandLabel(pokemon.speedBandValue)}</td>
              <td><TierBadge tier={pokemon.tier} /></td>
              <td>{pokemon.vgc?.label || '-'}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    {#if renderedTable.length < sortedDex.length}
      <button class="show-more" on:click={() => (tableLimit += 120)}>Show more</button>
    {/if}
  </section>
</main>

<style lang="postcss">
  .controls,
  .chart-panel,
  .table-panel {
    @apply mt-8 rounded-xl border p-4 shadow-sm;
  }

  .chart-panel,
  .table-panel {
    @apply border-gray-100 bg-white/80;
  }

  :global(.dark) .chart-panel,
  :global(.dark) .table-panel {
    @apply border-gray-800 bg-gray-900/70;
  }

  .controls {
    @apply relative overflow-visible border-slate-700/70 p-4 text-slate-100 shadow-2xl md:p-5;
    background:
      radial-gradient(circle at top left, rgba(168, 85, 247, 0.2), transparent 28rem),
      linear-gradient(135deg, rgba(8, 18, 32, 0.98), rgba(11, 24, 42, 0.96) 52%, rgba(18, 13, 35, 0.96));
  }

  .controls::before {
    content: '';
    @apply pointer-events-none absolute inset-0 rounded-xl border border-white/5;
  }

  .controls-heading {
    @apply relative z-10 flex flex-wrap items-start justify-between gap-3 border-b border-slate-700/70 pb-4;
  }

  .controls h2,
  .table-heading h2 {
    @apply text-xl font-black;
  }

  .controls h2 {
    @apply text-xl text-white md:text-2xl;
  }

  .controls p {
    @apply mt-1 max-w-3xl text-xs font-semibold text-slate-400 md:text-sm;
  }

  .eyebrow,
  .field-label {
    @apply text-[11px] font-black uppercase tracking-widest text-slate-400;
  }

  .field-label {
    @apply flex items-center gap-2;
  }

  .info-bubble {
    @apply relative z-30 inline-flex h-5 w-5 cursor-help items-center justify-center rounded-full border border-purple-300/40 bg-purple-500/10 text-purple-200 outline-none transition hover:border-purple-200 hover:bg-purple-500/25 focus:border-purple-200 focus:bg-purple-500/25;
  }

  .info-bubble :global(svg) {
    @apply h-3.5 w-3.5;
  }

  .info-bubble::after {
    content: attr(data-tooltip);
    @apply pointer-events-none absolute bottom-[calc(100%+0.55rem)] left-1/2 z-50 w-72 max-w-[80vw] -translate-x-1/2 translate-y-1 rounded-lg border border-purple-300/30 bg-gray-900/95 px-3 py-2 text-left text-[11px] font-bold normal-case leading-snug tracking-normal text-slate-100 opacity-0 shadow-2xl transition;
  }

  .info-bubble::before {
    content: '';
    @apply pointer-events-none absolute bottom-[calc(100%+0.3rem)] left-1/2 z-50 h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r border-purple-300/30 bg-gray-900/95 opacity-0 transition;
  }

  .info-bubble:hover::after,
  .info-bubble:hover::before,
  .info-bubble:focus::after,
  .info-bubble:focus::before {
    @apply translate-y-0 opacity-100;
  }

  .eyebrow {
    @apply text-purple-300;
  }

  .status-chip,
  .controls .pending-note {
    @apply inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide;
  }

  .status-chip {
    @apply border border-emerald-400/30 bg-emerald-400/10 text-emerald-200;
  }

  .status-chip.dirty,
  .controls .pending-note {
    @apply border border-pink-400/30 bg-pink-500/10 text-pink-200;
  }

  .controls .pending-note {
    @apply relative z-10 mt-4;
  }

  .control-grid {
    @apply relative z-20 mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4;
  }

  .control-card {
    @apply relative grid gap-2;
  }

  .control-card.wide {
    @apply xl:col-span-2;
  }

  .control-card.open-dropdown {
    @apply z-[90];
  }

  .input-shell,
  .level-shell,
  .select-shell,
  .multi-panel summary,
  .single-panel summary {
    @apply flex min-h-[3.15rem] items-center gap-3 rounded-lg border border-slate-600/70 bg-gray-900/40 px-3.5 shadow-inner transition;
  }

  .input-shell:focus-within,
  .level-shell:focus-within,
  .level-shell:hover,
  .select-shell:focus-within,
  .multi-panel[open] summary,
  .multi-panel summary:hover,
  .single-panel[open] summary,
  .single-panel summary:hover {
    @apply border-purple-400/80 bg-slate-900/80;
  }

  .input-shell :global(svg),
  .select-shell :global(svg),
  .multi-panel summary :global(svg),
  .single-panel summary :global(svg),
  .single-dropdown :global(svg),
  .range-title :global(svg),
  .range-panel-heading :global(svg),
  .range-section summary :global(svg) {
    @apply h-4 w-4 flex-none text-purple-300;
  }

  .input-shell input,
  .select-shell select {
    @apply h-auto min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 text-sm font-black text-slate-100 outline-none md:text-base;
  }

  .input-shell input::placeholder {
    @apply text-slate-500;
  }

  .select-shell select option {
    @apply bg-gray-900 text-slate-100;
  }

  .chevron,
  .menu-chevron {
    @apply ml-auto text-slate-400 transition;
  }

  .level-icon,
  .type-dot {
    @apply inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-purple-500/10 text-xs font-black text-purple-200;
  }

  .level-shell {
    @apply grid gap-2 py-2.5;
  }

  .level-row {
    @apply flex items-center gap-3;
  }

  .level-row strong {
    @apply min-w-0 flex-1 truncate text-sm font-black text-slate-100 md:text-base;
  }

  .level-row input[type='number'] {
    @apply h-8 w-20 rounded-md border border-slate-700 bg-gray-900/80 px-2 text-right text-xs font-black text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-purple-400;
  }

  .level-range {
    @apply h-4 w-full cursor-pointer appearance-none border-0 bg-transparent p-0 accent-purple-400;
  }

  .level-range::-webkit-slider-runnable-track {
    @apply h-2 rounded-full bg-slate-600;
  }

  .level-range::-webkit-slider-thumb {
    @apply h-5 w-5 appearance-none rounded-full border-2 border-purple-200 bg-purple-500 shadow-lg;
    margin-top: -0.375rem;
  }

  .level-range::-moz-range-track {
    @apply h-2 rounded-full bg-slate-600;
  }

  .level-range::-moz-range-thumb {
    @apply h-5 w-5 rounded-full border-2 border-purple-200 bg-purple-500;
  }

  .type-dot {
    @apply border-4 border-purple-400;
  }

  .type-dot.hollow {
    @apply bg-transparent;
    border-style: dashed;
  }

  .multi-grid {
    @apply relative z-40 mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5;
  }

  .multi-panel,
  .single-panel {
    @apply relative;
  }

  .multi-panel summary,
  .single-panel summary {
    @apply cursor-pointer list-none justify-between text-[11px] font-black uppercase tracking-widest text-slate-300;
  }

  .multi-panel summary::-webkit-details-marker,
  .single-panel summary::-webkit-details-marker {
    display: none;
  }

  .multi-panel summary > span,
  .single-panel summary > span {
    @apply flex min-w-0 items-center gap-2;
  }

  .multi-panel summary b {
    @apply ml-auto rounded-full border border-slate-600/80 bg-gray-900/70 px-3 py-1 text-[11px] text-slate-100;
  }

  .multi-panel[open] .menu-chevron,
  .single-panel[open] .menu-chevron {
    @apply rotate-180 text-purple-200;
  }

  .dropdown-panel,
  .single-dropdown {
    @apply absolute left-0 right-0 top-[calc(100%+0.5rem)] z-[100] grid max-h-80 min-w-[17rem] grid-cols-2 gap-2 overflow-y-auto rounded-xl border border-slate-600/80 bg-gray-900/95 p-3 shadow-2xl backdrop-blur;
  }

  .single-dropdown {
    @apply left-auto right-0 w-full min-w-[18rem] grid-cols-1;
  }

  .single-dropdown button {
    @apply flex w-full items-center gap-2 rounded-lg border border-transparent px-3 py-2.5 text-left text-sm font-black text-slate-300 transition hover:border-purple-400/50 hover:bg-purple-500/10 hover:text-white;
  }

  .single-dropdown button.active {
    @apply border-purple-400/70 bg-purple-500/20 text-white;
  }

  .selected-list {
    @apply col-span-2 flex flex-wrap gap-1 border-b border-slate-700/80 pb-2;
  }

  .selected-list button {
    @apply rounded-full border border-purple-400/40 bg-purple-500/20 px-2.5 py-1 text-[10px] font-black uppercase text-purple-100 transition hover:bg-purple-500/30;
  }

  .multi-panel label {
    @apply inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs font-black text-slate-300 transition hover:border-purple-400/60 hover:bg-purple-500/10;
  }

  .multi-panel label.selected {
    @apply border-purple-400/80 bg-purple-500/20 text-white;
  }

  .multi-panel input {
    @apply h-4 w-4 accent-purple-400;
  }

  .range-panel {
    @apply relative z-10 mt-5 overflow-visible rounded-xl border border-slate-700/80 bg-gray-900/30;
  }

  .range-panel-heading {
    @apply flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-slate-700/70 px-4 py-3 text-xs font-black uppercase tracking-widest text-purple-200;
  }

  .range-panel-heading span,
  .range-section summary span {
    @apply flex items-center gap-2;
  }

  .range-panel-heading small,
  .range-section summary small {
    @apply text-[11px] font-bold normal-case tracking-normal text-slate-400;
  }

  .range-section {
    @apply border-b border-slate-700/60 last:border-b-0;
  }

  .range-section summary {
    @apply flex cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1 bg-slate-900/40 px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-200 transition hover:bg-slate-900/70;
  }

  .range-section summary::-webkit-details-marker {
    display: none;
  }

  .range-section summary .menu-chevron {
    @apply ml-auto;
  }

  .range-section[open] summary .menu-chevron {
    @apply rotate-180 text-purple-200;
  }

  .range-list {
    @apply divide-y divide-slate-700/60;
  }

  .range-control {
    @apply relative grid items-center gap-3 px-4 py-3 transition lg:grid-cols-[minmax(10rem,14rem)_10rem_minmax(16rem,1fr)];
  }

  .range-control:hover,
  .range-control:focus-within {
    @apply z-20;
  }

  .range-control.active {
    @apply bg-purple-500/10;
  }

  .range-title {
    @apply flex min-h-[1.75rem] items-center justify-between gap-2;
  }

  .range-title .range-name {
    @apply flex items-center gap-2 text-sm font-black text-slate-200;
  }

  .range-title :global(svg) {
    @apply text-purple-300;
  }

  .range-title button {
    @apply inline-flex h-7 w-7 items-center justify-center rounded-full border border-pink-400/40 text-pink-200 transition hover:bg-pink-500/20;
  }

  .range-title button :global(svg) {
    @apply h-4 w-4;
  }

  .range-inputs {
    @apply grid grid-cols-2 gap-2;
  }

  .range-inputs input {
    @apply h-9 rounded-lg border border-slate-700 bg-gray-900/70 px-3 text-sm font-black text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-purple-400;
  }

  .range-slider-wrap {
    @apply grid gap-1;
  }

  .slider-pair {
    @apply relative h-8;
  }

  .slider-pair input {
    @apply absolute left-0 top-1/2 h-6 w-full -translate-y-1/2 cursor-pointer appearance-none border-0 bg-transparent p-0 accent-purple-400;
    pointer-events: none;
  }

  .slider-pair input:first-child {
    @apply z-20;
  }

  .slider-pair input:last-child {
    @apply z-30;
  }

  .slider-pair input::-webkit-slider-runnable-track {
    @apply h-2 rounded-full bg-slate-600;
  }

  .slider-pair input::-webkit-slider-thumb {
    @apply h-5 w-5 appearance-none rounded-full border-2 border-purple-200 bg-purple-500 shadow-lg;
    margin-top: -0.375rem;
    pointer-events: auto;
  }

  .slider-pair input::-moz-range-track {
    @apply h-2 rounded-full bg-slate-600;
  }

  .slider-pair input::-moz-range-thumb {
    @apply h-5 w-5 rounded-full border-2 border-purple-200 bg-purple-500;
    pointer-events: auto;
  }

  .range-slider-wrap small {
    @apply block text-[11px] font-black text-slate-400;
  }

  .filter-actions {
    @apply mt-5 flex flex-wrap items-center justify-end gap-2 rounded-xl border border-slate-700/80 bg-gray-900/90 p-3 shadow-2xl backdrop-blur;
  }

  .filter-actions span {
    @apply mr-auto text-xs font-black uppercase tracking-widest text-slate-400;
  }

  .apply-filters {
    @apply rounded-lg bg-pink-500 px-5 py-2.5 text-xs font-black uppercase text-white transition hover:bg-pink-400;
  }

  .apply-filters.dirty {
    @apply animate-pulse ring-2 ring-pink-300 ring-offset-2;
    --tw-ring-offset-color: #07111f;
  }

  .reset-filters {
    @apply rounded-lg border border-slate-600 bg-slate-900/80 px-4 py-2.5 text-xs font-black uppercase text-slate-200 transition hover:border-slate-400 hover:bg-slate-800;
  }

  .gen-cell {
    @apply flex flex-col gap-0.5;
  }

  .gen-cell small {
    @apply text-[10px] font-black uppercase tracking-wide text-pink-500;
  }

  .chart-shell {
    @apply overflow-x-auto;
  }

  svg {
    min-width: 980px;
    width: 100%;
    height: auto;
  }

  .axis,
  .whisker {
    stroke: #111827;
    stroke-width: 2;
  }

  :global(.dark) .axis,
  :global(.dark) .whisker {
    stroke: #e5e7eb;
  }

  .box {
    fill: rgba(255, 255, 255, 0.58);
    stroke: #111827;
    stroke-width: 2;
  }

  :global(.dark) .box {
    fill: rgba(17, 24, 39, 0.62);
    stroke: #e5e7eb;
  }

  .median {
    stroke: #111827;
    stroke-width: 3;
  }

  :global(.dark) .median {
    stroke: #f8fafc;
  }

  .gen-label {
    @apply fill-gray-800 text-2xl font-black;
  }

  :global(.dark) .gen-label {
    @apply fill-gray-100;
  }

  .axis-label,
  .median-label {
    @apply fill-gray-800 text-sm font-black;
  }

  :global(.dark) .axis-label,
  :global(.dark) .median-label {
    @apply fill-gray-100;
  }

  .range-label,
  .count-label,
  .empty-label {
    @apply fill-gray-500 text-[10px] font-bold;
  }

  :global(.dark) .range-label,
  :global(.dark) .count-label,
  :global(.dark) .empty-label {
    @apply fill-gray-400;
  }

  :global(.plot-icon) {
    width: 42px;
    height: 42px;
  }

  .table-heading {
    @apply mb-4 flex items-center justify-between gap-4;
  }

  .table-heading span {
    @apply text-xs font-black uppercase tracking-widest text-gray-400;
  }

  table {
    @apply w-full min-w-[1320px] text-left text-sm;
  }

  th {
    @apply border-b py-3 pr-4 text-xs uppercase tracking-wider text-gray-400;
  }

  td {
    @apply border-b py-3 pr-4 align-middle;
  }

  :global(.dark) th,
  :global(.dark) td {
    @apply border-gray-800;
  }

  .mon-cell {
    @apply flex items-center gap-3;
  }

  .mon-cell small {
    @apply block text-xs text-gray-400;
  }

  :global(.table-icon) {
    width: 2.5rem;
    height: 2.5rem;
    flex: 0 0 auto;
  }

  .type-cell {
    @apply flex flex-wrap gap-1;
  }

  .category-cell {
    @apply flex flex-wrap gap-1;
  }

  .category-cell span {
    @apply rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-gray-500;
  }

  :global(.dark) .category-cell span {
    @apply bg-gray-800 text-gray-300;
  }

  .tier-score-cell {
    @apply inline-flex items-center gap-2;
  }

  .tier-score-cell small,
  .metric-label-cell small {
    @apply text-xs font-black uppercase tracking-wide text-gray-500;
  }

  :global(.dark) .tier-score-cell small,
  :global(.dark) .metric-label-cell small {
    @apply text-gray-300;
  }

  .metric-label-cell {
    @apply inline-flex flex-col gap-1;
  }

  .archetype-pill {
    @apply inline-flex rounded bg-gray-100 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-gray-600;
  }

  :global(.dark) .archetype-pill {
    @apply bg-gray-800 text-gray-300;
  }

  :global(.tiny-type) {
    font-size: 10px !important;
    letter-spacing: 0 !important;
    border-radius: 4px !important;
    padding: 0 4px !important;
  }

  .show-more {
    @apply mx-auto mt-4 block rounded border border-pink-300 bg-pink-50 px-4 py-2 text-xs font-black uppercase text-pink-700 transition hover:bg-pink-100;
  }

  :global(.dark) .show-more {
    @apply border-pink-800 bg-pink-900/30 text-pink-300;
  }
</style>
