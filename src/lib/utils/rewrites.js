import { building, dev } from '$app/environment'
const rewrite = !building && !dev

// TODO: Remember to update `vercel.json` in root of project when
// modifying these sources

export const SPRITE = '/assets/img/pokemon'
export const CUSTOM = 'https://img.nuzlocke.app/sprites'
export const SHOWDOWN_TRAINER = 'https://play.pokemonshowdown.com/sprites/trainers'
export const IMG = '/assets/img'
export const SHARE = 'https://share.nuzlocke.app'

export const DATA = rewrite ? '/api' : '/api' // Load locally for development

export const QRCODE = rewrite
  ? '/assets/js/qrcode.min.js'
  : 'https://cdn.jsdelivr.net/gh/davidshimjs/qrcodejs@gh-pages/qrcode.min.js'

export const INSTASCAN = rewrite
  ? '/assets/js/instascan.min.js'
  : 'https://cdn.jsdelivr.net/gh/schmich/instascan-builds@master/instascan.min.js'

export const UNOWN = 'https://img.nuzlocke.app/sprites/unown.png?v=1'

const toSpriteId = (value = '') =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/\.(png|webp)$/i, '')
    .replace(/[':]/g, '')
    .replace(/\./g, '')
    .replace(/\s+/g, '-')

export const createImgUrl = (p, { ext = 'webp', shiny = false } = {}) => {
  if (!p) return UNOWN
  if (p.imgUrl) return `${CUSTOM}${p.imgUrl}.${ext}`

  const normalId = toSpriteId(p.imgId || p.sprite || p.alias || p.name)
  const variant = toSpriteId(p.spriteVariant || p.variant || 'base')

  if (!normalId) return UNOWN

  if (shiny) return `${SPRITE}/shiny-${normalId}.${ext}`
  return `${SPRITE}/${variant}-${normalId}.${ext}`
}

const kantoIrlTrainerImageById = {
  '3': '/trainers/ltsurge',
  '3hard': '/trainers/ltsurge',
  '3_hard': '/trainers/ltsurge',
  '8': '/trainers/giovanni',
  '8hard': '/trainers/giovanni',
  '8_hard': '/trainers/giovanni',
  joey1: '/trainers/youngster-gen3rs',
  kylie1: '/trainers/lass-gen4dp',
  maven1: '/trainers/bugcatcher-gen3',
  wilson1: '/trainers/bugcatcher-gen6',
  jerome1: '/trainers/bugmaniac-gen3',
  joel1: '/trainers/birdkeeper-gen3',
  brad1: '/trainers/hiker-gen3',
  brad1_hard: '/trainers/hiker-gen3',
  george1: '/trainers/hiker-gen3rs',
  george1_hard: '/trainers/hiker-gen3rs',
  lass1: '/trainers/lass-gen3',
  lass1_hard: '/trainers/lass-gen3',
  acetrainer1: '/trainers/acetrainer-gen3rs',
  acetrainer1_hard: '/trainers/acetrainer-gen3rs',
  hiker1: '/trainers/hiker-gen4',
  hiker1_hard: '/trainers/hiker-gen4',
  rocketgrunts1: '/trainers/teamrocketgruntf-gen3',
  rocketgrunts1_hard: '/trainers/teamrocketgruntf-gen3',
  supernerd1: '/trainers/supernerd-gen3',
  supernerd1_hard: '/trainers/supernerd-gen3',
  swimmer1: '/trainers/swimmerf-gen3',
  swimmer1_hard: '/trainers/swimmerf-gen3',
  fishlover1: '/trainers/swimmerf-gen4dp',
  fishlover1_hard: '/trainers/swimmerf-gen4dp',
  supermodel1: '/trainers/swimmerf2-gen7',
  supermodel1_hard: '/trainers/swimmerf2-gen7',
  baby1: '/trainers/preschooler',
  baby1_hard: '/trainers/preschooler',
  superfan1: '/trainers/pokemaniac-gen3rs',
  superfan1_hard: '/trainers/pokemaniac-gen3rs',
  acetrainer2: '/trainers/acetrainer-gen4dp',
  acetrainer2_hard: '/trainers/acetrainer-gen4dp',
  acetrainer3: '/trainers/acetrainerf-gen3rs',
  acetrainer3_hard: '/trainers/acetrainerf-gen3rs',
  cooltrainer1: '/trainers/sailor-gen6',
  cooltrainer1_hard: '/trainers/sailor-gen6',
  acetrainer4: '/trainers/acetrainerf-gen4dp',
  acetrainer4_hard: '/trainers/acetrainerf-gen4dp',
  trainer1_rt6: '/trainers/schoolkid-gen4',
  trainer1_rt6_hard: '/trainers/schoolkid-gen4',
  bluefan1: '/trainers/blue-gen3',
  bluefan1_hard: '/trainers/blue-gen3',
  rivalfan1: '/trainers/pokefan-gen3',
  rivalfan1_hard: '/trainers/pokefan-gen3',
  rivalfan2: '/trainers/pokefanf-gen3',
  rivalfan2_hard: '/trainers/pokefanf-gen3',
  electric1: '/trainers/worker-lgpe',
  electric1_hard: '/trainers/worker-lgpe',
  diglettlover1: '/trainers/hiker-gen7',
  diglettlover1_hard: '/trainers/hiker-gen7',
  professoroak: '/trainers/oak',
  professoroak_hard: '/trainers/oak',
  meme1: '/trainers/gamer-gen3',
  meme1_hard: '/trainers/gamer-gen3',
  eeveemaster: '/trainers/kimonogirl',
  eeveemaster_hard: '/trainers/kimonogirl',
  rocket1: '/trainers/rocketgrunt',
  rocket1_hard: '/trainers/rocketgrunt',
  lackey1: '/trainers/rocketgrunt',
  lackey1f: '/trainers/rocketgruntf',
  lackey1hard: '/trainers/rocketgrunt',
  lackey1fhard: '/trainers/rocketgruntf',
  lackey1_celadon: '/trainers/aromalady-gen3',
  lackey1_celadon_hard: '/trainers/aromalady-gen3',
  lackey1_fuschia: '/trainers/biker-gen3',
  lackey1_fuschia_hard: '/trainers/biker-gen3',
  lackey1_koga: '/trainers/ninjaboy-gen3',
  lackey1_koga_hard: '/trainers/ninjaboy-gen3',
  lackey1_sabrina: '/trainers/psychicf-gen3',
  lackey1_sabrina_hard: '/trainers/psychicf-gen3',
  mrfuji: '/trainers/mrfuji-gen3',
  mrfuji_hard: '/trainers/mrfuji-gen3',
  towermaster: '/trainers/channeler-gen3',
  towermaster_hard: '/trainers/channeler-gen3',
  fightingleader: '/trainers/blackbelt-gen3',
  fightingleader_hard: '/trainers/blackbelt-gen3',
  fightingleaderhard: '/trainers/blackbelt-gen3',
  scientist1_silph: '/trainers/scientistf',
  scientist1_silph_hard: '/trainers/scientistf',
  scientist1: '/trainers/scientist-gen3',
  scientist1hard: '/trainers/scientist-gen3',
  mrfujihard: '/trainers/gentleman-lgpe',
  towertop: '/trainers/channeler-lgpe',
  towertophard: '/trainers/channeler-lgpe',
  wardenbaoba: '/trainers/baoba',
  wardenbaobahard: '/trainers/baoba',
  giovanni1: '/trainers/giovanni-lgpe',
  giovanni1_hard: '/trainers/giovanni-lgpe',
  snorlax1: '/sprite/snorlax-gmax',
  snorlax1_hard: '/sprite/snorlax-gmax',
  trainerdog: '/trainers/cyclist',
  trainerdog_hard: '/trainers/cyclist',
  trainerfox: '/trainers/cyclistf-gen4',
  trainerfox_hard: '/trainers/cyclistf-gen4',
  trainercat: '/trainers/cyclistf',
  trainercat_hard: '/trainers/cyclistf',
  farmanimals: '/trainers/rancher',
  farmanimals_hard: '/trainers/rancher',
  gimmick1: '/trainers/collector-gen3',
  gimmick1_hard: '/trainers/collector-gen3',
  baoba: '/trainers/baoba',
  baoba_hard: '/trainers/baoba',
  turtlelover: '/trainers/tuberf-gen3rs',
  turtlelover_hard: '/trainers/tuberf-gen3rs',
  royals: '/trainers/richboy-gen3',
  royals_hard: '/trainers/richboy-gen3',
  heavylightguy: '/trainers/worker-gen4',
  heavylightguy_hard: '/trainers/worker-gen4',
  b2: '/trainers/brendan',
  b2_hard: '/trainers/brendan',
  b3: '/trainers/brendan',
  b3_hard: '/trainers/brendan',
  weapons64: '/trainers/blackbelt-gen4',
  weapons64_hard: '/trainers/blackbelt-gen4',
  wedding65: '/trainers/acetrainercouple-gen3',
  wedding65_hard: '/trainers/acetrainercouple-gen3',
  articuno_boss: '/sprite/articuno',
  articuno_boss_hard: '/sprite/articuno',
  dittogod: '/sprite/ditto',
  dittogod_hard: '/sprite/ditto',
  scientist1_mansion: '/trainers/scientist-gen3',
  scientist1_mansion_hard: '/trainers/scientist-gen3',
  scientist2_mansion: '/trainers/scientist-gen4',
  scientist2_mansion_hard: '/trainers/scientist-gen4',
  scientist3_mansion: '/trainers/scientist-gen6',
  scientist3_mansion_hard: '/trainers/scientist-gen6',
  zapdos_boss: '/sprite/zapdos',
  zapdos_boss_hard: '/sprite/zapdos',
  blainelackey: '/trainers/kindler-gen3',
  blainelackey_hard: '/trainers/kindler-gen3',
  metronome_team: '/trainers/scientist-gen7',
  metronome_team_hard: '/trainers/scientist-gen7',
  fossiltrainer: '/trainers/ruinmaniac-gen3',
  fossiltrainer_hard: '/trainers/ruinmaniac-gen3',
  treasureisland: '/trainers/scubadiver',
  treasureisland_hard: '/trainers/scubadiver',
  mtember75: '/trainers/hiker-gen3rs',
  mtember75_hard: '/trainers/hiker-gen3rs',
  moltres_boss: '/sprite/moltres',
  moltres_boss_hard: '/sprite/moltres',
  gamecornertriple: '/trainers/collector-masters',
  gamecornertriple_hard: '/trainers/collector-masters',
  lostelle76: '/trainers/yancy',
  lostelle76_hard: '/trainers/yancy',
  billcelio76: '/trainers/bill-gen3',
  billcelio76_hard: '/trainers/bill-gen3',
  viridianlackey1: '/trainers/gentleman-gen4',
  viridianlackey1_hard: '/trainers/gentleman-gen4',
  viridianlackey2: '/trainers/richboy-gen6xy',
  viridianlackey2_hard: '/trainers/richboy-gen6xy',
  viridianlackey3: '/trainers/policeman-gen4',
  viridianlackey3_hard: '/trainers/policeman-gen4',
  rival3: '/trainers/brendan',
  rival3_hard: '/trainers/brendan',
  snipersquad83: '/trainers/cueball-gen3',
  snipersquad83_hard: '/trainers/cueball-gen3',
  moustache84: '/trainers/gentleman-gen3',
  moustache84_hard: '/trainers/gentleman-gen3',
  gloup85: '/trainers/beauty-gen6xy',
  gloup85_hard: '/trainers/beauty-gen6xy',
  lorelei_icefall: '/trainers/lorelei-lgpe',
  lorelei_icefall_hard: '/trainers/lorelei-lgpe',
  gideon87: '/trainers/scientist-gen9',
  gideon87_hard: '/trainers/scientist-gen9',
  wealthylady88: '/trainers/rosa-pokestar2',
  wealthylady88_hard: '/trainers/rosa-pokestar2',
  ruinvalley89: '/trainers/ruinmaniac-gen3',
  ruinvalley89_hard: '/trainers/ruinmaniac-gen3',
  alteringcave90: '/trainers/artist',
  alteringcave90_hard: '/trainers/artist',
  patternbush91: '/trainers/aromalady-gen6',
  patternbush91_hard: '/trainers/aromalady-gen6',
  trainertower92: '/trainers/acetrainercouple',
  trainertower92_hard: '/trainers/acetrainercouple',
  bruno_sevault: '/trainers/bruno',
  bruno_sevault_hard: '/trainers/bruno',
  unknowngod93: '/sprite/unown',
  unknowngod93_hard: '/sprite/unown',
  navelrock93: '/sprite/lugia',
  navelrock93_hard: '/sprite/lugia',
  birthisland93: '/sprite/deoxys',
  birthisland93_hard: '/sprite/deoxys',
  ceruleancave93: '/sprite/mewtwo',
  ceruleancave93_hard: '/sprite/mewtwo',
  elite_trainer94: '/trainers/acetrainerf',
  elite_trainer94_hard: '/trainers/acetrainerf',
  elite_trainer95: '/trainers/acetrainer-gen6xy',
  elite_trainer95_hard: '/trainers/acetrainer-gen6xy',
  elite_trainer96: '/trainers/veteranf',
  elite_trainer96_hard: '/trainers/veteranf',
  elite_trainer97: '/trainers/veteran-gen7',
  elite_trainer97_hard: '/trainers/veteran-gen7',
  elite_trainer98: '/trainers/veteran',
  elite_trainer98_hard: '/trainers/veteran',
  rival4: '/trainers/brendan-masters2',
  rival4_hard: '/trainers/brendan-masters2',
  elite4_lorelei: '/trainers/lorelei-lgpe',
  elite4_lorelei_hard: '/trainers/lorelei-lgpe',
  elite4_bruno: '/trainers/bruno',
  elite4_bruno_hard: '/trainers/bruno',
  elite4_agatha: '/trainers/agatha-lgpe',
  elite4_agatha_hard: '/trainers/agatha-lgpe',
  elite4_lance: '/trainers/lance-lgpe',
  elite4_lance_hard: '/trainers/lance-lgpe',
  elite4_champion: '/trainers/blue-lgpe',
  elite4_champion_hard: '/trainers/blue-lgpe'
}

const kantoIrlTrainerImageByType = {
  electric: '/trainers/ltsurge',
  water: '/trainers/misty-lgpe',
  rock: '/trainers/brock-lgpe',
  ground: '/trainers/hiker-gen3',
  grass: '/trainers/erika-lgpe',
  poison: '/trainers/koga-lgpe',
  psychic: '/trainers/sabrina-lgpe',
  ghost: '/trainers/channeler-lgpe',
  fighting: '/trainers/blackbelt',
  ice: '/trainers/lorelei-lgpe',
  dark: '/trainers/rocketgrunt',
  dragon: '/trainers/lance-lgpe'
}

const showdownTrainerAliases = {
  'frlg-agatha': 'agatha-lgpe',
  'frlg-blaine': 'blaine-lgpe',
  'frlg-blue-1': 'blue-lgpe',
  'frlg-blue-2': 'blue-lgpe',
  'frlg-blue-3': 'blue-lgpe',
  'frlg-brock': 'brock-lgpe',
  'frlg-bruno': 'bruno',
  'frlg-erika': 'erika-lgpe',
  'frlg-giovanni': 'giovanni-lgpe',
  'frlg-koga': 'koga-lgpe',
  'frlg-lance': 'lance-lgpe',
  'frlg-lorelei': 'lorelei-lgpe',
  'frlg-misty': 'misty-lgpe',
  'frlg-sabrina': 'sabrina-lgpe',
  'frlg-surge': 'ltsurge',
  'gs-blaine2': 'blaine-lgpe',
  'gs-blue': 'blue-lgpe',
  'gs-brock2': 'brock-lgpe',
  'gs-erika2': 'erika-lgpe',
  'gs-giovanni': 'giovanni-lgpe',
  'gs-janine': 'janine',
  'gs-koga': 'koga-lgpe',
  'gs-lance': 'lance-lgpe',
  'gs-misty2': 'misty-lgpe',
  'gs-red': 'red-lgpe',
  'gs-sabrina2': 'sabrina-lgpe',
  'gs-surge2': 'ltsurge',
  'hgss-joey': 'youngster',
  'frlg-bugcatcher': 'bugcatcher-gen3',
  'frlg-birdkeeper': 'birdkeeper-gen3',
  'frlg-hiker': 'hiker-gen3',
  'frlg-lass': 'lass-gen3',
  'frlg-cooltrainer': 'cooltrainer-gen3',
  'frlg-rocketgrunt': 'rocketgrunt',
  'frlg-supernerd': 'supernerd-gen3',
  'frlg-swimmer': 'swimmer-gen3',
  'frlg-beauty': 'beauty-gen3',
  'dp-mars-jupiter': 'mars',
  'rs-grunts': 'teammagma',
  'rs-maxie-courtney': 'maxie',
  'rs-maxie-tabitha': 'maxie',
  'rs-tabitha-courtney': 'tabitha',
  'xy-celosia-bryony': 'celosia',
  'xy-tierno-trevor': 'tierno'
}

const kantoIrlTrainerImagePatterns = [
  [/rival|brendan/i, '/trainers/brendan'],
  [/rocket|lackey|giovanni|archer/i, '/trainers/rocketgrunt'],
  [/surge|electric/i, '/trainers/ltsurge'],
  [/misty|swimmer|fish|water|turtle/i, '/trainers/misty-lgpe'],
  [/brock|hiker|diglett|ground|rock/i, '/trainers/hiker-gen3'],
  [/erika|grass/i, '/trainers/erika-lgpe'],
  [/koga|janine|poison/i, '/trainers/koga-lgpe'],
  [/sabrina|psychic/i, '/trainers/sabrina-lgpe'],
  [/fighting|dojo/i, '/trainers/blackbelt'],
  [/fuji|tower|ghost/i, '/trainers/channeler-lgpe'],
  [/scientist|oak/i, '/trainers/scientist'],
  [/ace|trainer|fan|baby|super|royals|heavy|farm|gimmick/i, '/trainers/acetrainer'],
  [/dog|fox|cat/i, '/trainers/pokefan-gen3']
]

const toShowdownTrainerId = (leader) => {
  if (showdownTrainerAliases[leader]) return showdownTrainerAliases[leader]

  return leader
    .replace(/^(blwh|dp|frlg|gs|rs|sm|sv|swsh|xy)-/, '')
    .replace(/-oras$/, '-gen6')
    .replace(/-\d+$/, '')
    .replace(/-boss$/, '')
}

export const normaliseTrainerImage = (img) => {
  if (!img) return img
  const next = typeof img === 'string' ? { src: img } : { ...img }
  if (!next.src) return next

  if(next.src.startsWith('/trainers/')) {
    next.src = `${SHOWDOWN_TRAINER}/${next.src.slice('/trainers/'.length)}`
  }
  if(next.src.startsWith('/leaders/')) {
    const leader = next.src.slice('/leaders/'.length)
    next.src = `${SHOWDOWN_TRAINER}/${toShowdownTrainerId(leader)}`
  }
  if(next.src.startsWith('/sprite/')) {
    next.src = `/assets/img/pokemon/base-${next.src.slice(8)}`;
  }

  return next
}

const kantoIrlTrainerFallback = (bossData = {}, id = '') => {
  const key = toSpriteId(id)
  if (kantoIrlTrainerImageById[key]) return kantoIrlTrainerImageById[key]

  const name = String(bossData.name || '')
  const speciality = toSpriteId(bossData.speciality || '')
  const match = kantoIrlTrainerImagePatterns.find(([pattern]) => pattern.test(name))
  if (match) return match[1]

  return kantoIrlTrainerImageByType[speciality] || '/trainers/acetrainer'
}

const isKantoIrlGame = (game = '') => {
  const gameId = typeof game === 'string' ? game : game?.pid || game?.lid || game?.title || ''
  return String(gameId).toLowerCase().replace(/\s+/g, '').startsWith('kantoirl')
}

export const bossToImage = (bossData = {}, id = '', game = '') => {
  const kantoIrlImage = isKantoIrlGame(game)
    ? kantoIrlTrainerImageById[toSpriteId(id)]
    : null
  if (kantoIrlImage) return normaliseTrainerImage(kantoIrlImage)
  if (typeof bossData.img !== 'undefined') return normaliseTrainerImage(bossData.img)
  if (isKantoIrlGame(game)) return normaliseTrainerImage(kantoIrlTrainerFallback(bossData, id))
  return null
}
