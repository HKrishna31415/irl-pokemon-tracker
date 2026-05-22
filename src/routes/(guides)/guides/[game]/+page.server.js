import { error } from '@sveltejs/kit'
import { toSlug, normalise } from '$lib/utils/string'

import { Expanded as Games } from '$lib/data/games.js'
import Themes from '$lib/data/theme.json'
import { applyStarterToLeague, applyStarterToTeam } from '$lib/utils/starter-swaps'

export const csr = true
export const prerender = true

const STARTER_ORDER = ['fire', 'water', 'grass']
const STARTER_LABELS = {
  fire: 'A',
  water: 'B',
  grass: 'C'
}

const formatEncounterLocation = (route, encounter) => {
  const rate = route.encounterRates?.[encounter]
  return rate ? `${route.name} (${rate}%)` : route.name
}

export async function load({ params, url, fetch }) {
  const { game } = params
  const gameCfg = Object.values(Games).find((g) => toSlug(g.title) === game)

  if (!gameCfg) {
    throw error(404, {
      message: 'Not found'
    })
  }

  let html,
    attributes = {}
  try {
    const post = await import(`../../../../docs/${gameCfg.pid}.md`)
    attributes = post.attributes
    html = post.html.replace(/<img/g, '<img loading="lazy"')
  } catch (e) {
    html = ''
  }

  const links = Object.values(Games)
    .filter((cfg) => toSlug(cfg.title) !== game)
    .map((g) => ({ ...g, href: `/guides/${toSlug(g.title)}` }))
    .reduce(
      (acc, g) => ({
        ...acc,
        [g.gen]: (acc[g.gen] || []).concat(g)
      }),
      {}
    )

  const titleCase = (str) =>
    str
      .match(
        /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g
      )
      .map((x) => x.charAt(0).toUpperCase() + x.slice(1))
      .join(' ')

  const fetchJson = async (uri) => {
    const res = await fetch(uri, { redirect: 'follow' })

    if (res.status === 301) return fetchJson(res.headers.get('location'))
    if (!res.ok) throw new Error(`${res.status} ${uri}`)

    return res.json()
  }

  const fetchOptionalJson = async (uri) => {
    try {
      return await fetchJson(uri)
    } catch (e) {
      if (String(e.message || e).startsWith('404 ')) return null
      throw e
    }
  }

  const [pokemon, route, combinedLeague] = await Promise.all([
    fetchJson(`/api/pokemon/${gameCfg.pid}.json`),
    fetchJson(`/api/route/${gameCfg.pid}.json`),
    fetchOptionalJson(`/api/league/${gameCfg.pid}.json`)
  ])

  const league = combinedLeague
    ? {
        combined: true,
        all: combinedLeague,
        fire: applyStarterToLeague(combinedLeague, 'fire'),
        water: applyStarterToLeague(combinedLeague, 'water'),
        grass: applyStarterToLeague(combinedLeague, 'grass')
      }
    : (() => {
        const files = STARTER_ORDER.map((starter) =>
          fetchJson(`/api/league/${gameCfg.pid}.${starter}.json`)
        )

        return Promise.all(files).then(([fire, water, grass]) => ({
          combined: false,
          fire,
          water,
          grass
        }))
      })()
  const { combined, all, fire, water, grass } = await league
  const starterSpecies = route.find((r) => r.name === 'Starter')?.encounters || []
  const hasSpeciesStarterSwaps = Object.values(all || {}).some(
    (team) => team?.starterSwaps || team?.rivalStarterSwap
  )

  const findPokemon = (id) =>
    pokemon.find(
      (p) =>
        normalise(p.alias) === normalise(id) ||
        normalise(p.sprite) === normalise(id)
    )

  const gameObj = { ...Games[gameCfg.pid], theme: Themes[gameCfg.pid] }

  const routes = route.filter((r) => r.type === 'route')
  const encounterMap = routes.reduce(
    (acc, route) => ({
      ...acc,
      ...(route.encounters || []).reduce(
        (rest, encounter) => ({
          ...rest,
          [encounter]: (acc[encounter] || []).concat(
            formatEncounterLocation(route, encounter)
          )
        }),
        {}
      )
    }),
    {}
  )

  const encounters = [
    ...new Set(
      route
        .map((r) => r.encounters)
        .flat()
        .filter((i) => i)
    )
  ]

  const { gen, pid } = gameObj
  const genFilter = (type) => {
    // Show all types for romhacks
    if (gen == 'romhack') return true

    // For gen I games, filter out dark,steel,and fairy
    if (gen == 'I')
      if (!['fr', 'lg'].includes(pid))
        return !['dark', 'steel', 'fairy'].includes(type)

    // For pre gen VI, filter out fairy
    if (['I', 'II', 'III', 'IV', 'V'].includes(gen))
      if (!['or', 'as', 'bd', 'sp'].includes(pid)) return type !== 'fairy'

    return true
  }

  const encounterdata = encounters
    .reduce((acc, i) => {
      const found = findPokemon(i)
      if (found) return acc.concat({ ...found, original: i })

      console.log(i, 'Not found')
      return acc
    }, [])
    .sort((a, b) => a.num - b.num)
    .reduce((acc, p) => {
      const [t1, t2] = p.types.filter(genFilter)

      return {
        ...acc,
        [t1 || 'normal']: (acc[t1] || []).concat(p),
        ...(t2 ? { [t2]: (acc[t2] || []).concat(p) } : {})
      }
    }, {})

  const leagueData = all || fire
  const expandGym = (gym) => {
    if (!combined || hasSpeciesStarterSwaps) return [gym]

    const starters = STARTER_ORDER.filter((starter) =>
      leagueData[gym.value]?.pokemon?.some((p) => p.starter === starter)
    )

    if (!starters.length) return [gym]

    return starters.map((starter) => ({
      ...gym,
      starter,
      boss:
        gym.group === 'rival'
          ? `Rival ${STARTER_LABELS[starter]}`
          : `${gym.boss} ${STARTER_LABELS[starter]}`
    }))
  }

  const gyms = route
    .filter((r) => r.type === 'gym')
    .flatMap(expandGym)
    .reduce((acc, g) => {
      const team =
      (g.starter ? applyStarterToTeam(leagueData[g.value], g.starter) : null) ||
      fire[g.value]

      return {
        ...acc,
        [titleCase(g.group || 'other')]: (
          acc[titleCase(g.group || 'other')] || []
        ).concat({
          ...g,
          lvlCap: Math.max(
            ...(team?.pokemon?.map((i) => i.level) || [])
          )
        })
      }
    }, {})

  return {
    html,
    attributes,
    links,
    game: gameObj,
    path: url.pathname,
    route: {
      routes,
      gyms,
      count: encounters.length,
      encounters: encounterdata,
      encounterMap
    },
    data: {
      combined,
      all,
      fire,
      water,
      grass,
      starterSpecies: hasSpeciesStarterSwaps ? starterSpecies : []
    }
  }
}
