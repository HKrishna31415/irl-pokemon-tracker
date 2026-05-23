import routes from '$lib/data/routes.json'
import kantoIrlLeague from '../../../../static/api/league/kantoirl.json'

const legacyRadicalRedBosses = new Set(['Morty'])

export const load = () => {
  const route = routes.kantoirl || []
  const routeFightValues = new Set(
    route
      .filter((entry) => {
        if (entry?.type !== 'gym' || !entry.value) return false
        if (/^mb\d/i.test(entry.value)) return false
        return !legacyRadicalRedBosses.has(entry.boss)
      })
      .map((entry) => entry.value)
  )

  const leagueData = Object.fromEntries(
    Object.entries(kantoIrlLeague).filter(([value]) => routeFightValues.has(value))
  )

  return {
    route,
    leagueData
  }
}
