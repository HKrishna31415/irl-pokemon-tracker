let pokemon = import.meta.glob(
  [
    '/node_modules/pokemon-sprites/sprites/pokemon/*.png',
    '/node_modules/pokemon-sprites/sprites/pokemon/shiny/*.png',
  ],
  {
    query: '?base64',
    import: 'default'
  }
)

import pokemonData from '../../../data/pokemon.json'

const toSpriteKey = (value = '') =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/\.(png|webp)$/i, '')
    .replace(/[':]/g, '')
    .replace(/\./g, '')
    .replace(/\s+/g, '-')

const spriteMap = Object.values(pokemonData).reduce((acc, p) => {
  const spriteId = p.imgId || p.num
  if (!spriteId) return acc

  for (const key of [p.alias, p.sprite, p.name, spriteId]) {
    if (key) acc[toSpriteKey(key)] = String(spriteId)
  }

  return acc
}, {})

const fallbackSpriteMap = {
  bulbasaur: '1',
  charmander: '4',
  charmeleon: '5',
  squirtle: '7',
  wartortle: '8',
  chikorita: '152',
  bayleef: '153',
  cyndaquil: '155',
  quilava: '156',
  totodile: '158',
  croconaw: '159',
  treecko: '252',
  grovyle: '253',
  torchic: '255',
  combusken: '256',
  mudkip: '258',
  marshtomp: '259',
  turtwig: '387',
  grotle: '388',
  chimchar: '390',
  monferno: '391',
  piplup: '393',
  prinplup: '394',
  snivy: '495',
  servine: '496',
  tepig: '498',
  pignite: '499',
  oshawott: '501',
  dewott: '502',
  chespin: '650',
  quilladin: '651',
  fennekin: '653',
  braixen: '654',
  froakie: '656',
  frogadier: '657',
  rowlet: '722',
  dartrix: '723',
  litten: '725',
  torracat: '726',
  popplio: '728',
  brionne: '729',
  grookey: '810',
  thwackey: '811',
  scorbunny: '813',
  raboot: '814',
  sobble: '816',
  drizzile: '817',
  sprigatito: '906',
  floragato: '907',
  fuecoco: '909',
  crocalor: '910',
  quaxly: '912',
  finizen: '963',
  'rotom-wash': '10009',
  rotomwash: '10009',
  'rotom-heat': '10008',
  rotomheat: '10008',
  'rotom-frost': '10010',
  rotomfrost: '10010',
  'rotom-fan': '10011',
  rotomfan: '10011',
  'rotom-mow': '10012',
  rotommow: '10012',
  graveler: '75',
  geodude: '74',
  'rattata-alola': '10091',
  'raticate-alola': '10092',
  'raichu-alola': '10100',
  'sandshrew-alola': '10101',
  'sandslash-alola': '10102',
  'vulpix-alola': '10103',
  'ninetales-alola': '10104',
  'diglett-alola': '10105',
  'dugtrio-alola': '10106',
  'meowth-alola': '10107',
  'persian-alola': '10108',
  'rapidash-galar': '10163',
  'corsola-galar': '10173',
  'slowking-galar': '10172',
  'geodude-alola': '10109',
  'graveler-alola': '10110',
  'golem-alola': '10111',
  'grimer-alola': '10112',
  'muk-alola': '10113',
  'exeggutor-alola': '10114',
  'marowak-alola': '10115',
  'arcanine-hisui': '10230',
  'electrode-hisui': '10232',
  'goodra-hisui': '10242',
  'zoroark-hisui': '10239',
  basculegion: '902',
  'basculegion-male': '902',
  basculegionmale: '902',
  'basculegion-female': '10248',
  basculegionfemale: '10248',
  basculin: '550',
  'basculin-red-striped': '550',
  basculinredstriped: '550',
  'basculin-blue-striped': '10016',
  basculinbluestriped: '10016',
  'basculin-white-striped': '10247',
  basculinwhitestriped: '10247',
  wishiwashi: '746',
  'wishiwashi-solo': '746',
  wishiwashisolo: '746',
  'wishiwashi-school': '10127',
  wishiwashischool: '10127',
  alcremie: '869',
  dubwool: '832',
  florges: '671',
  garganacl: '934',
  grafaiai: '945',
  mabosstiff: '943',
  meowscarada: '908',
  'meowstic-m': '678',
  meowsticm: '678',
  oinkologne: '916',
  orthworm: '968',
  palafin: '964',
  polteageist: '855',
  thievul: '828',
  pawmot: '923',
  quaxwell: '913',
  armarouge: '936',
  baxcalibur: '998',
  bellibolt: '939',
  charcadet: '935',
  ceruledge: '937',
  'decidueye-hisui': '10244',
  espathra: '956',
  glimmora: '970',
  kleavor: '900',
  'lilligant-hisui': '10237',
  maushold: '925',
  naclstack: '933',
  overqwil: '904',
  revavroom: '966',
  'samurott-hisui': '10236',
  sneasler: '903',
  'scream-tail': '985',
  'tauros-paldea-aqua': '10251',
  'ting-lu': '1003',
  tinkatink: '957',
  ursaluna: '901',
  wiglett: '960',
  wugtrio: '961',
  wyrdeer: '899'
}

const pokeApiFormSpriteMap = {
  'rotom-wash': '10009',
  rotomwash: '10009',
  'aegislash-shield': '681',
  aegislashshield: '681',
  'arcanine-hisui': '10230',
  arcaninehisui: '10230',
  'charizard-mega-x': '10034',
  charizardmegax: '10034',
  clodsire: '980',
  'corsola-galar': '10173',
  corsolagalar: '10173',
  'rapidash-galar': '10163',
  rapidashgalar: '10163',
  graveler: '75',
  geodude: '74',
  'goodra-hisui': '10242',
  goodrahisui: '10242',
  'meowstic-m': '678',
  meowsticm: '678',
  'samurott-hisui': '10236',
  samurotthisui: '10236',
  basculegion: '902',
  'basculegion-male': '902',
  basculegionmale: '902',
  'basculegion-female': '10248',
  basculegionfemale: '10248',
  'basculin-blue-striped': '10016',
  basculinbluestriped: '10016',
  'basculin-white-striped': '10247',
  basculinwhitestriped: '10247',
  'slowking-galar': '10172',
  slowkinggalar: '10172',
  'snorlax-gmax': '10206',
  'venusaur-gmax': '10195',
  'weezing-galar': '10167',
  'wishiwashi-school': '10127',
  wishiwashischool: '10127',
  'zoroark-hisui': '10239',
  zoroarkhisui: '10239'
}

const showdownSpriteMap = {
  'aerodactyl-mega': 'aerodactyl-mega',
  'alakazam-mega': 'alakazam-mega',
  annihilape: 'annihilape',
  archaludon: 'archaludon',
  basculegion: 'basculegion',
  'blastoise-mega': 'blastoise-mega',
  'brute-bonnet': 'brutebonnet',
  'calyrex-shadow': 'calyrex-shadow',
  caribolt: 'caribolt',
  'chi-yu': 'chiyu',
  'chien-pao': 'chienpao',
  equilibra: 'equilibra',
  'flutter-mane': 'fluttermane',
  'gouging-fire': 'gougingfire',
  gholdengo: 'gholdengo',
  'great-tusk': 'greattusk',
  'iron-boulder': 'ironboulder',
  'iron-bundle': 'ironbundle',
  'iron-crown': 'ironcrown',
  'iron-hands': 'ironhands',
  'iron-jugulis': 'ironjugulis',
  'iron-leaves': 'ironleaves',
  'iron-moth': 'ironmoth',
  'iron-thorns': 'ironthorns',
  'iron-treads': 'irontreads',
  'iron-valiant': 'ironvaliant',
  kingambit: 'kingambit',
  koraidon: 'koraidon',
  'kyurem-white': 'kyurem-white',
  'meganium-mega': 'meganium-mega',
  miraidon: 'miraidon',
  'necrozma-dusk-mane': 'necrozma-duskmane',
  naviathan: 'naviathan',
  'ogerpon-wellspring': 'ogerpon-wellspring',
  'ogerpon-hearthflame': 'ogerpon-hearthflame',
  'palkia-origin': 'palkia-origin',
  'palafin-hero': 'palafin-hero',
  'pidgeot-mega': 'pidgeot-mega',
  'rayquaza-mega': 'rayquaza-mega',
  'raging-bolt': 'ragingbolt',
  regidrago: 'regidrago',
  'roaring-moon': 'roaringmoon',
  'sandy-shocks': 'sandyshocks',
  'scream-tail': 'screamtail',
  'slither-wing': 'slitherwing',
  snaelstrom: 'snaelstrom',
  'unown-b': 'unown-b',
  'unown-c': 'unown-c',
  'unown-o': 'unown-o',
  'unown-s': 'unown-s',
  'unown-v': 'unown-v',
  'venusaur-mega': 'venusaur-mega',
  venomicon: 'venomicon',
  volkraken: 'volkraken',
  'walking-wake': 'walkingwake',
  'zacian-crowned': 'zacian-crowned',
  'zamazenta-crowned': 'zamazenta-crowned'
}

const gen8SpriteNames = new Set([
  'weezing-galar',
  'venusaur-gmax',
  'charizard-gmax',
  'blastoise-gmax',
  'butterfree-gmax',
  'pikachu-gmax',
  'meowth-gmax',
  'machamp-gmax',
  'gengar-gmax',
  'kingler-gmax',
  'lapras-gmax',
  'eevee-gmax',
  'snorlax-gmax',
  'garbodor-gmax',
  'melmetal-gmax',
  'rillaboom-gmax',
  'cinderace-gmax',
  'inteleon-gmax',
  'corviknight-gmax',
  'orbeetle-gmax',
  'drednaw-gmax',
  'coalossal-gmax',
  'flapple-gmax',
  'appletun-gmax',
  'sandaconda-gmax',
  'toxtricity-gmax',
  'toxtricity-low-key-gmax',
  'centiskorch-gmax',
  'hatterene-gmax',
  'grimmsnarl-gmax',
  'alcremie-gmax',
  'copperajah-gmax',
  'duraludon-gmax',
  'urshifu-gmax',
  'urshifu-rapid-strike-gmax'
])

const keyToBase64 = async (spriteName, shiny) => {
  spriteName = fallbackSpriteMap[toSpriteKey(spriteName)] || spriteMap[toSpriteKey(spriteName)] || toSpriteKey(spriteName)

  let defaultShinyPath = `/node_modules/pokemon-sprites/sprites/pokemon/shiny/${spriteName}.png`
  let defaultPath = `/node_modules/pokemon-sprites/sprites/pokemon/${spriteName}.png`;

  let sprite = null;

  if(shiny) {
    sprite = pokemon[defaultShinyPath];
  } else {
    sprite = pokemon[defaultPath];
  }

  if(!sprite) return null;

  return await sprite();
}

export async function GET({ params }) {

  const {id, variant} = params;

  let shiny = false;
  if(variant === 'shiny') {
    shiny = true;
  }

  const gen8SpriteName = toSpriteKey(id)
  if (showdownSpriteMap[gen8SpriteName]) {
    return Response.redirect(
      `https://play.pokemonshowdown.com/sprites/gen5${shiny ? '-shiny' : ''}/${showdownSpriteMap[gen8SpriteName]}.png`,
      302
    )
  }

  if (pokeApiFormSpriteMap[gen8SpriteName]) {
    return Response.redirect(
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokeApiFormSpriteMap[gen8SpriteName]}.png`,
      302
    )
  }

  if (variant === 'gen8' && gen8SpriteNames.has(gen8SpriteName)) {
    return Response.redirect(`https://play.pokemonshowdown.com/sprites/gen8${shiny ? '-shiny' : ''}/${gen8SpriteName}.png`, 302)
  }

  let sprite = await keyToBase64(id, shiny);
  if (!sprite) {
    if (gen8SpriteNames.has(gen8SpriteName)) {
      return Response.redirect(`https://play.pokemonshowdown.com/sprites/gen8${shiny ? '-shiny' : ''}/${gen8SpriteName}.png`, 302)
    }

    const fallbackId = fallbackSpriteMap[toSpriteKey(id)] || toSpriteKey(id)
    return Response.redirect(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${fallbackId}.png`, 302)
  }

  return new Response(Buffer.from(sprite, 'base64'), {
    headers: {
      'Content-Type': 'image/png'
    }
  });
}
