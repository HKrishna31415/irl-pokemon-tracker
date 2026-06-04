import {
  capitalise,
  toShowdownAbility,
  toShowdownItem,
  toShowdownMove,
  toShowdownName
} from '$utils/string'

const statLabels = {
  hp: 'HP',
  atk: 'Atk',
  def: 'Def',
  spa: 'SpA',
  spd: 'SpD',
  spe: 'Spe'
}

const statLine = (label, stats = {}, includeZero = false) => {
  const parts = Object.entries(statLabels)
    .filter(([key]) => {
      const value = stats?.[key]
      if (value === undefined || value === null || value === '') return false
      return includeZero ? true : Number(value) > 0
    })
    .map(([key, name]) => `${stats[key]} ${name}`)

  return parts.length ? `${label}: ${parts.join(' / ')}` : ''
}

const valueName = (value) => {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value.name || ''
}

const speciesName = (p = {}) => p.name || p.pokemon || p.alias || p.species || ''

export const buildShowdownTeam = (pokemon = []) =>
  pokemon
    .map((p) => {
      const species = speciesName(p)
      const sName = toShowdownName(p.nickname || species)
      const sSpecies = p.nickname ? ` (${toShowdownName(species)})` : ''
      const heldItem = valueName(p.held) || valueName(p.item)
      const item = heldItem ? ` @ ${toShowdownItem(heldItem)}` : ''
      const ability = valueName(p.ability)
      const lines = [
        `${sName}${sSpecies}${item}`,
        ability ? `Ability: ${toShowdownAbility(ability)}` : '',
        p.level ? `Level: ${p.level}` : '',
        p.tera ? `Tera Type: ${capitalise(p.tera)}` : '',
        statLine('EVs', p.evs),
        p.nature ? `${capitalise(p.nature)} Nature` : '',
        statLine('IVs', p.ivs, true),
        ...(p.moves || [])
          .map((m) => typeof m === 'string' ? m : m?.name)
          .filter(Boolean)
          .map((move) => `- ${toShowdownMove(move)}`)
      ]

      return lines.filter(Boolean).join('\n')
    })
    .join('\n\n')
