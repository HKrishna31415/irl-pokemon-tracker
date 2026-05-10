import { pokeapi } from '$lib/utils/api'

export default {
  getPokemonByName: (name) => pokeapi(`pokemon/${name}`),
  getItemByName: (name) => pokeapi(`item/${name}`),
  getAbilityByName: (name) => pokeapi(`ability/${name}`),
  getMoveByName: (name) => pokeapi(`move/${name}`)
}
