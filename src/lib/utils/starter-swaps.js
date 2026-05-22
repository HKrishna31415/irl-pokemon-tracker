const LEGACY_STARTERS = new Set(['fire', 'water', 'grass'])

const STARTER_TRIOS = [
  ['bulbasaur', 'charmander', 'squirtle'],
  ['chikorita', 'cyndaquil', 'totodile'],
  ['treecko', 'torchic', 'mudkip'],
  ['turtwig', 'chimchar', 'piplup'],
  ['snivy', 'tepig', 'oshawott'],
  ['chespin', 'fennekin', 'froakie'],
  ['rowlet', 'litten', 'popplio'],
  ['grookey', 'scorbunny', 'sobble'],
  ['sprigatito', 'fuecoco', 'quaxly']
]

const STARTER_EVOLUTION_LINES = [
  ['bulbasaur', 'ivysaur', 'venusaur'],
  ['charmander', 'charmeleon', 'charizard'],
  ['squirtle', 'wartortle', 'blastoise'],
  ['chikorita', 'bayleef', 'meganium'],
  ['cyndaquil', 'quilava', 'typhlosion'],
  ['totodile', 'croconaw', 'feraligatr'],
  ['treecko', 'grovyle', 'sceptile'],
  ['torchic', 'combusken', 'blaziken'],
  ['mudkip', 'marshtomp', 'swampert'],
  ['turtwig', 'grotle', 'torterra'],
  ['chimchar', 'monferno', 'infernape'],
  ['piplup', 'prinplup', 'empoleon'],
  ['snivy', 'servine', 'serperior'],
  ['tepig', 'pignite', 'emboar'],
  ['oshawott', 'dewott', 'samurott'],
  ['chespin', 'quilladin', 'chesnaught'],
  ['fennekin', 'braixen', 'delphox'],
  ['froakie', 'frogadier', 'greninja'],
  ['rowlet', 'dartrix', 'decidueye'],
  ['litten', 'torracat', 'incineroar'],
  ['popplio', 'brionne', 'primarina'],
  ['grookey', 'thwackey', 'rillaboom'],
  ['scorbunny', 'raboot', 'cinderace'],
  ['sobble', 'drizzile', 'inteleon'],
  ['sprigatito', 'floragato', 'meowscarada'],
  ['fuecoco', 'crocalor', 'skeledirge'],
  ['quaxly', 'quaxwell', 'quaquaval']
]

const TYPE_BY_INDEX = ['grass', 'fire', 'water']
const ADVANTAGE_INDEX = {
  fire: 2,
  water: 0,
  grass: 1
}

const ABILITY_BY_TYPE = {
  fire: 'Blaze',
  water: 'Torrent',
  grass: 'Overgrow'
}

const MOVE_BY_TYPE = {
  fire: 'Ember',
  water: 'Bubble',
  grass: 'Vine Whip'
}

const RIVAL_SLOT_BY_TYPE = {
  fire: 'charcadet',
  water: 'finizen',
  grass: 'applin'
}

const KYLIE_SLOT_BY_TYPE = {
  fire: 'magby',
  water: 'clauncher',
  grass: 'bellsprout'
}

const ROUTE_5_SLOT_BY_TYPE = {
  fire: 'ceruledge',
  water: 'palafin',
  grass: 'ferrothorn'
}

const MIDDLE_EVOLUTION_BY_STARTER = {
  bulbasaur: 'ivysaur',
  charmander: 'charmeleon',
  squirtle: 'wartortle',
  chikorita: 'bayleef',
  cyndaquil: 'quilava',
  totodile: 'croconaw',
  treecko: 'grovyle',
  torchic: 'combusken',
  mudkip: 'marshtomp',
  turtwig: 'grotle',
  chimchar: 'monferno',
  piplup: 'prinplup',
  snivy: 'servine',
  tepig: 'pignite',
  oshawott: 'dewott',
  chespin: 'quilladin',
  fennekin: 'braixen',
  froakie: 'frogadier',
  rowlet: 'dartrix',
  litten: 'torracat',
  popplio: 'brionne',
  grookey: 'thwackey',
  scorbunny: 'raboot',
  sobble: 'drizzile',
  sprigatito: 'floragato',
  fuecoco: 'crocalor',
  quaxly: 'quaxwell'
}

export const KANTO_IRL_STARTERS = STARTER_TRIOS.flat()

const id = (value = '') =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')

export const starterSpeciesId = (starter = 'all') => id(starter)

const BASE_STARTER_BY_SPECIES = STARTER_EVOLUTION_LINES.reduce((acc, line) => {
  const [base] = line
  for (const species of line) acc[id(species)] = base
  return acc
}, {})

export const starterBaseSpeciesId = (starter = 'all') => {
  const key = starterSpeciesId(starter)
  return BASE_STARTER_BY_SPECIES[key] || key
}

export const starterInfo = KANTO_IRL_STARTERS.reduce((acc, species) => {
  const trio = STARTER_TRIOS.find((it) => it.includes(species))
  const index = trio.indexOf(species)
  const type = TYPE_BY_INDEX[index]
  const rivalIndex = ADVANTAGE_INDEX[type]
  const rival = trio[rivalIndex]
  const rivalType = TYPE_BY_INDEX[rivalIndex]

  acc[id(species)] = { species, type, rival, rivalType }
  return acc
}, {})

export const starterType = (starter = 'all') => {
  const key = starterBaseSpeciesId(starter)
  if (LEGACY_STARTERS.has(key)) return key
  return starterInfo[key]?.type
}

const cloneTeam = (team, pokemon = team?.pokemon || []) => ({
  ...team,
  pokemon: pokemon.map((p) => ({ ...p }))
})

const rivalStarterPokemon = ({ rival, rivalType }) => ({
  name: rival,
  level: '11',
  ability: { name: ABILITY_BY_TYPE[rivalType], effect: '' },
  held: null,
  tera: rivalType,
  types: [rivalType],
  moves: [MOVE_BY_TYPE[rivalType]]
})

const applyRivalStarterSwap = (team, starter) => {
  const info = starterInfo[starterBaseSpeciesId(starter)]
  if (!info) return team

  const slot = RIVAL_SLOT_BY_TYPE[info.rivalType]
  const replacement = rivalStarterPokemon(info)
  const pokemon = (team.pokemon || []).map((p) =>
    starterSpeciesId(p.name) === slot ? replacement : p
  )

  return cloneTeam(team, pokemon)
}

const route5StarterPokemon = (slotPokemon, info) => {
  const species = starterSpeciesId(info.rival) === 'piplup'
    ? 'marshtomp'
    : MIDDLE_EVOLUTION_BY_STARTER[starterSpeciesId(info.rival)] || info.rival

  const {
    icon,
    img,
    sprite,
    stats,
    types,
    ...rest
  } = slotPokemon || {}

  return {
    ...rest,
    name: species,
    level: rest.level || '29',
    ability: { name: ABILITY_BY_TYPE[info.rivalType], effect: '' },
    tera: info.rivalType,
    sprite: species,
    icon: species
  }
}

const rivalEvolutionPokemon = (slotPokemon, info, stage = 'final') => {
  const line = STARTER_EVOLUTION_LINES.find((it) => it[0] === starterSpeciesId(info.rival))
  const species = stage === 'middle'
    ? (line?.[1] || MIDDLE_EVOLUTION_BY_STARTER[starterSpeciesId(info.rival)] || info.rival)
    : (line?.[2] || info.rival)

  const {
    icon,
    img,
    sprite,
    stats,
    types,
    ...rest
  } = slotPokemon || {}

  return {
    ...rest,
    name: species,
    level: rest.level || slotPokemon?.level || '',
    ability: { name: ABILITY_BY_TYPE[info.rivalType], effect: '' },
    tera: info.rivalType,
    sprite: species,
    icon: species
  }
}

const applyTypedRivalStarterSwap = (team, starter, config) => {
  const info = starterInfo[starterBaseSpeciesId(starter)]
  if (!info) return team

  const slot = config?.slots?.[info.rivalType]
  if (!slot) return team

  const pokemon = (team.pokemon || []).map((p) =>
    starterSpeciesId(p.name) === starterSpeciesId(slot)
      ? rivalEvolutionPokemon(p, info, config.stage)
      : p
  )

  return cloneTeam(team, pokemon)
}

const applyRoute5RivalSwap = (team, starter) => {
  const info = starterInfo[starterBaseSpeciesId(starter)]
  if (!info) return team

  const slot = ROUTE_5_SLOT_BY_TYPE[info.rivalType]
  const pokemon = (team.pokemon || [])
    .filter((p) => starterSpeciesId(p.name) !== 'dewott' || starterSpeciesId(info.rival) === 'tepig')
    .map((p) =>
      starterSpeciesId(p.name) === slot ? route5StarterPokemon(p, info) : p
    )

  return cloneTeam(team, pokemon)
}

const applyKylieRivalTypeSwap = (team, starter) => {
  const info = starterInfo[starterBaseSpeciesId(starter)]
  if (!info) return team

  const keep = KYLIE_SLOT_BY_TYPE[info.rivalType]
  const byName = (team.pokemon || []).reduce((acc, p) => {
    const key = starterSpeciesId(p.name)
    acc[key] = acc[key] || []
    acc[key].push(p)
    return acc
  }, {})
  const take = (name) => byName[name]?.shift()
  const pokemon = [
    take('rattata'),
    take('rattata'),
    take('rattata'),
    take(keep),
    take('shinx'),
    take('sentret')
  ].filter(Boolean)

  return cloneTeam(team, pokemon)
}

const applyExplicitSwap = (team, swap) => {
  if (!swap) return team

  if (swap.pokemon) {
    return {
      ...team,
      ...swap,
      pokemon: swap.pokemon.map((p) => ({ ...p }))
    }
  }

  const remove = new Set((swap.remove || []).map(starterSpeciesId))
  const pokemon = (team.pokemon || [])
    .filter((p) => !remove.has(starterSpeciesId(p.name)))
    .concat((swap.add || []).map((p) => ({ ...p })))

  return cloneTeam({ ...team, ...swap }, pokemon)
}

export const applyStarterToTeam = (team, starter = 'all') => {
  if (!team?.pokemon?.length || starter === 'all') return team

  const legacyType = starterType(starter)
  const key = starterBaseSpeciesId(starter)
  const swap = team.starterSwaps?.[key]
  let result = team

  if (legacyType && team.pokemon.some((p) => p.starter)) {
    result = cloneTeam(
      result,
      result.pokemon.filter((p) => !p.starter || p.starter === legacyType)
    )
  }

  result = applyExplicitSwap(result, swap)

  if (result.starterSwapMode === 'kylie-rival-type') {
    result = applyKylieRivalTypeSwap(result, starter)
  }

  if (result.rivalStarterSwap === 'route5') {
    result = applyRoute5RivalSwap(result, starter)
  } else if (typeof result.rivalStarterSwap === 'object') {
    result = applyTypedRivalStarterSwap(result, starter, result.rivalStarterSwap)
  } else if (result.rivalStarterSwap) {
    result = applyRivalStarterSwap(result, starter)
  }

  return result
}

export const applyStarterToLeague = (league, starter = 'all') =>
  Object.entries(league || {}).reduce(
    (acc, [teamId, team]) => ({
      ...acc,
      [teamId]: applyStarterToTeam(team, starter)
    }),
    {}
  )

export const readStarterSpecies = (data = {}) =>
  data.Starter?.pokemon || data.__starter || 'fire'
