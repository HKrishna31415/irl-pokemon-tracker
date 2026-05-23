import tiers from './smogon-tiers.json'

export const TIER_FILTERS = [
  'All',
  'AG',
  'Uber',
  'OU',
  'UUBL',
  'UU',
  'RUBL',
  'RU',
  'NUBL',
  'NU',
  'PUBL',
  'PU',
  'ZUBL',
  'ZU',
  'LC',
  'NFE',
  'Untiered'
]

export const normalisePokemonId = (value = '') =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')

export const getPokemonTier = (pokemon) => {
  const key = normalisePokemonId(
    typeof pokemon === 'string'
      ? pokemon
      : pokemon?.alias || pokemon?.sprite || pokemon?.name
  )

  return tiers[key]?.tier || 'Untiered'
}

export const getPokemonTierGen = (pokemon) => {
  const key = normalisePokemonId(
    typeof pokemon === 'string'
      ? pokemon
      : pokemon?.alias || pokemon?.sprite || pokemon?.name
  )

  return tiers[key]?.gen || null
}
