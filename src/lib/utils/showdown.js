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
    .filter(([key]) => includeZero ? stats[key] !== undefined : Number(stats[key]) > 0)
    .map(([key, name]) => `${stats[key]} ${name}`)

  return parts.length ? `${label}: ${parts.join(' / ')}` : ''
}

export const buildShowdownTeam = (pokemon = []) =>
  pokemon
    .map((p) => {
      const sName = toShowdownName(p.nickname || p.name)
      const sSpecies = p.nickname ? ` (${toShowdownName(p.name)})` : ''
      const item = p.held?.name ? ` @ ${toShowdownItem(p.held.name)}` : ''
      const ability = typeof p.ability === 'string' ? p.ability : p.ability?.name || ''
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
