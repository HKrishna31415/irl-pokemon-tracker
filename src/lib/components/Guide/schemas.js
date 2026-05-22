import { toList, capitalise } from '$utils/string'

export const faq = (game, data, { routes, gyms, encounters }) => {
  const { title } = game
  const routesQuestion = [
    `How many encounters are there in a Pokémon ${title} Run`,
    `There are ${routes.length} distinct routes and locations to encounter Pokémon in a Pokémon ${title} Run.`
  ]
  const encounterTypesQuestions = Object
        .entries(encounters)
        .map(([type, encs]) => {
          const validEncs = encs.filter(e => e?.name)
          return [
            `How many ${type} Pokémon are there in Pokémon ${title}?`,
            `You can encounter and catch ${validEncs.length} different ${type} Pokémon in Pokémon ${title}${validEncs.length ? ', including ' + toList(validEncs, e => e.name) : ''}`
          ]
        }).concat(
          [[`How many different Pokémon encounters are there in Pokémon ${title}?`,
            `You can encounter and catch ${Object.values(encounters).flat().length} different Pokémon in Pokémon ${title}.`]]
        )

  const gymGroupQuestions = Object
      .entries(gyms)
      .map(([group, gyms]) => [
        `How many ${group} fights are there in Pokémon ${title}?`,
        `There are ${gyms.length} ${group} fights in Pokémon ${title}.`
      ]).concat(
        [[`How many Boss fights are there in Pokémon ${title}?`,
          `There are ${Object.values(gyms).flat().length} Boss fights in total in Pokémon ${title}.`]]
      )

  const gymTeamQuestions = [
    ...(gyms['Gym Leader'] || []),
    ...(gyms['Elite Four'] || [])
  ]
    .map(g => data?.[g?.value])
    .filter(d => d && d.name && d.pokemon && Array.isArray(d.pokemon))
    .map((data) => {
      const { name, speciality, pokemon } = data
      const validPokemon = pokemon.filter(p => p && p.name)
      return [
      [
        `How many Pokémon does ${name} use in Pokémon ${title}?`,
        speciality
          ? `${name} has a team of ${validPokemon.length} and uses only ${speciality} type Pokémon in Pokémon ${title}.`
          : `${name} has a team of ${validPokemon.length} in Pokémon ${title}.`,
      ],
      [
        `What is the level cap for ${name} in Pokémon ${title}?`,
        `The level cap for ${name} is Level ${Math.max(0, ...validPokemon.map(i=>parseInt(i.level) || 0))} in Pokémon ${title}.`
      ],
      [
        `What team of Pokémon does ${name} use in Pokémon ${title}?`,
        `${name} uses a team of ${toList(validPokemon, p => capitalise(p.name || ''))}.`
      ]
    ]}).flat()

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      routesQuestion,
      ...encounterTypesQuestions,
      ...gymGroupQuestions,
      ...gymTeamQuestions
    ].map(([q, a]) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: a
      }
    }))
  }
}
