const fs = require('fs');
const Pokemon = require('./src/routes/assets/data/pokemon.json');
const Moves = require('./src/routes/assets/data/moves.json');
const Items = require('./src/routes/assets/data/items.json');

// ── 1. ROUTES.JSON ──────────────────────────────────────────────
const routesPath = './src/lib/data/routes.json';
const routes = JSON.parse(fs.readFileSync(routesPath, 'utf8'));

const route2Encounters = [
  // 1-6: Remoraid
  "remoraid","remoraid","remoraid","remoraid","remoraid","remoraid",
  // 7-10: Abra
  "abra","abra","abra","abra",
  // 11-20: Oddish
  "oddish","oddish","oddish","oddish","oddish","oddish","oddish","oddish","oddish","oddish",
  // 21-23: Vulpix
  "vulpix","vulpix","vulpix",
  // 24-28: Venonat
  "venonat","venonat","venonat","venonat","venonat",
  // 29-30: Scyther
  "scyther","scyther",
  // 31-34: Mudkip
  "mudkip","mudkip","mudkip","mudkip",
  // 35-40: Budew
  "budew","budew","budew","budew","budew","budew",
  // 41-51: Phanpy
  "phanpy","phanpy","phanpy","phanpy","phanpy","phanpy","phanpy","phanpy","phanpy","phanpy","phanpy",
  // 52-66: Nidoran-f
  "nidoran-f","nidoran-f","nidoran-f","nidoran-f","nidoran-f","nidoran-f","nidoran-f","nidoran-f","nidoran-f","nidoran-f","nidoran-f","nidoran-f","nidoran-f","nidoran-f","nidoran-f",
  // 67-71: Shroomish
  "shroomish","shroomish","shroomish","shroomish","shroomish",
  // 72-84: Caterpie
  "caterpie","caterpie","caterpie","caterpie","caterpie","caterpie","caterpie","caterpie","caterpie","caterpie","caterpie","caterpie","caterpie",
  // 85-92: Ponyta
  "ponyta","ponyta","ponyta","ponyta","ponyta","ponyta","ponyta","ponyta",
  // 93-100: Weedle
  "weedle","weedle","weedle","weedle","weedle","weedle","weedle","weedle"
];

const viridianForestEncounters = [
  'caterpie',
  'weedle',
  'wurmple',
  'ledyba',
  'spinarak',
  'kricketot',
  'silicobra',
  'skorupi',
  'pikachu',
  'larvesta',
  'axew',
  'eevee'
];

const viridianForestRates = {
  caterpie: 15,
  weedle: 15,
  wurmple: 10,
  ledyba: 10,
  spinarak: 10,
  kricketot: 10,
  silicobra: 5,
  skorupi: 5,
  pikachu: 5,
  larvesta: 1,
  axew: 2,
  eevee: 12
};

const bossRouteEntries = [
  { type: 'gym', name: 'Viridian Forest', value: 'wilson1', group: 'mini-boss', boss: 'Bug Catcher Wilson' },
  { type: 'gym', name: 'Viridian Forest', value: 'jerome1', group: 'mini-boss', boss: 'Bug Catcher Jerome' },
  { type: 'gym', name: 'Viridian Forest', value: 'joel1', group: 'mini-boss', boss: 'Bird Keeper Joel' }
];

const pewterEntries = (hard = false) => [
  {
    type: 'gym',
    name: 'Pewter City Museum',
    value: hard ? 'brad1_hard' : 'brad1',
    group: 'mini-boss',
    boss: 'Miner Brad'
  },
  {
    type: 'gym',
    name: 'Pewter City Gym',
    value: hard ? 'george1_hard' : 'george1',
    group: 'mini-boss',
    boss: 'Miner George'
  }
];

const route3Encounters = [
  'caterpie', 'weedle', 'wurmple', 'litleo', 'roggenrola', 'dwebble',
  'woobat', 'zigzagoon', 'tyrogue', 'impidimp', 'dreepy', 'rookidee',
  'meowth-galar', 'chansey', 'larvitar'
];

const route3Rates = {
  caterpie: 10,
  weedle: 10,
  wurmple: 10,
  litleo: 5,
  roggenrola: 10,
  dwebble: 10,
  woobat: 5,
  zigzagoon: 5,
  tyrogue: 10,
  impidimp: 5,
  dreepy: 5,
  rookidee: 4,
  'meowth-galar': 4,
  chansey: 4,
  larvitar: 3
};

const route4Encounters = [
  'machop', 'nosepass', 'barboach', 'riolu', 'timburr', 'bonsly',
  'yanma', 'starly', 'shuckle', 'minccino', 'ferroseed',
  'helioptile', 'mareep', 'jangmo-o'
];

const route4Rates = {
  machop: 10,
  nosepass: 10,
  barboach: 10,
  riolu: 10,
  timburr: 5,
  bonsly: 5,
  yanma: 15,
  starly: 5,
  shuckle: 5,
  minccino: 5,
  ferroseed: 3,
  helioptile: 4,
  mareep: 12,
  'jangmo-o': 1
};

const mtMoonEncounters = [
  'paras', 'chingling', 'zubat', 'nosepass', 'dwebble', 'drilbur',
  'phanpy', 'woobat', 'bronzor', 'onix', 'clefairy', 'clefable', 'absol'
];

const mtMoonRates = {
  paras: 15,
  chingling: 15,
  zubat: 10,
  nosepass: 10,
  dwebble: 10,
  drilbur: 10,
  phanpy: 5,
  woobat: 5,
  bronzor: 5,
  onix: 5,
  clefairy: 7,
  clefable: 1,
  absol: 2
};

const ceruleanEntries = (hard = false) => [
  { type: 'gym', name: 'Route 3', value: hard ? 'lass1_hard' : 'lass1', group: 'mini-boss', boss: 'Lass 1' },
  { type: 'route', name: 'Route 4 Magikarp ($1000)', encounters: ['magikarp'] },
  { type: 'gym', name: 'Route 4', value: hard ? 'acetrainer1_hard' : 'acetrainer1', group: 'mini-boss', boss: 'Ace Trainer' },
  { type: 'gym', name: 'Mt. Moon 1F', value: hard ? 'hiker1_hard' : 'hiker1', group: 'mini-boss', boss: 'Hiker 1' },
  { type: 'gym', name: 'Mt. Moon B1F', value: hard ? 'rocketgrunts1_hard' : 'rocketgrunts1', group: 'evil-team', boss: 'Rocket Grunts' },
  { type: 'gym', name: 'Mt. Moon B2F', value: hard ? 'supernerd1_hard' : 'supernerd1', group: 'mini-boss', boss: 'Super Nerd' },
  { type: 'route', name: 'Mt. Moon Gift - Kabuto', encounters: ['kabuto'] },
  { type: 'route', name: 'Mt. Moon Gift - Omanyte', encounters: ['omanyte'] },
  { type: 'gym', name: 'Cerulean City', value: hard ? 'swimmer1_hard' : 'swimmer1', group: 'mini-boss', boss: 'Swimmer 1' },
  { type: 'gym', name: 'Cerulean City', value: hard ? 'fishlover1_hard' : 'fishlover1', group: 'mini-boss', boss: 'Fish Lover 1' },
  { type: 'gym', name: 'Cerulean City', value: hard ? 'supermodel1_hard' : 'supermodel1', group: 'mini-boss', boss: 'Supermodel 1' }
];

const move = (alias) => {
  if (typeof alias === 'object') {
    return {
      power: alias.power || 0,
      type: alias.type,
      damage_class: alias.damage_class,
      name: alias.name,
      effect: alias.effect || ''
    };
  }

  const data = Moves[alias];
  return {
    power: data?.basePower || 0,
    type: (data?.type || '').toLowerCase(),
    damage_class: (data?.category || '').toLowerCase(),
    name: data?.name,
    effect: ''
  };
};

const ability = (pokemonAlias, name) => {
  const abilities = Pokemon[pokemonAlias]?.abilities || {};
  const found = Object.values(abilities).find((it) => it === name);
  return { name: found || name, effect: '' };
};

const held = (alias) => {
  if (!alias) return null;
  const data = Items[alias];
  return { sprite: data?.sprite || alias, name: data?.name || alias, effect: '' };
};

const mon = ({
  name,
  lookup = name,
  level,
  moves,
  abilityName,
  heldItem = null,
  icon = null,
  extra = {}
}) => {
  const data = Pokemon[lookup];
  const result = {
    name,
    level: String(level),
    moves: moves.map(move),
    ability: ability(name, abilityName),
    held: held(heldItem),
    sprite: String(data.num),
    types: data.types.map((t) => t.toLowerCase()),
    stats: data.baseStats
  };

  if (icon) result.icon = icon;
  return { ...result, ...extra };
};

const customMon = ({
  name,
  level,
  moves,
  abilityName,
  heldItem = null,
  sprite,
  types,
  stats,
  extra = {}
}) => ({
  name,
  level: String(level),
  moves: moves.map(move),
  ability: { name: abilityName, effect: '' },
  held: held(heldItem),
  sprite: String(sprite),
  types,
  stats,
  ...extra
});

console.log('Route 2 encounters count:', route2Encounters.length);

// Process kantoirl and kantoirl_hard
['kantoirl', 'kantoirl_hard'].forEach(gameKey => {
  const arr = routes[gameKey];
  if (!arr) { console.log('Missing:', gameKey); return; }

  // Remove Oak's Laboratory gym entry
  const oaksIdx = arr.findIndex(r => r.type === 'gym' && r.name === "Oak's Laboratory");
  if (oaksIdx !== -1) {
    arr.splice(oaksIdx, 1);
    console.log(`[${gameKey}] Removed Oak's Lab at index ${oaksIdx}`);
  } else {
    console.log(`[${gameKey}] Oak's Lab not found`);
  }

  // Update Route 2 encounters + add cap
  // Update Route 1 cap
  arr.forEach(r => {
    if (r.type === 'route' && r.name === 'Route 1') {
      r.cap = 5;
      console.log(`[${gameKey}] Set Route 1 cap=5`);
    }
    if (r.type === 'route' && r.name === 'Route 2') {
      r.encounters = route2Encounters;
      r.cap = 6;
      console.log(`[${gameKey}] Updated Route 2 encounters (${r.encounters.length}) cap=6`);
    }
    if (r.type === 'route' && r.name === 'Viridian Forest') {
      r.encounters = viridianForestEncounters;
      r.encounterRates = viridianForestRates;
      r.cap = 8;
      console.log(`[${gameKey}] Updated Viridian Forest encounters (${r.encounters.length}) cap=8`);
    }
    if (r.type === 'route' && r.name === 'Route 22') {
      r.cap = 7;
    }
    if (r.type === 'route' && r.name === 'Route 3') {
      r.encounters = route3Encounters;
      r.encounterRates = route3Rates;
      r.cap = 16;
    }
    if (r.type === 'route' && r.name === 'Route 4') {
      r.encounters = route4Encounters;
      r.encounterRates = route4Rates;
      r.cap = 17;
    }
    if (r.type === 'route' && r.name === 'Mt. Moon') {
      r.encounters = mtMoonEncounters;
      r.encounterRates = mtMoonRates;
      r.cap = 18;
    }
  });

  const rivalIndex = arr.findIndex(
    (r) => r.type === 'gym' && (r.value === 'b1' || r.value === 'b1_hard')
  );

  if (rivalIndex !== -1) {
    const remaining = arr.filter(
      (r) => !['wilson1', 'jerome1', 'joel1'].includes(r.value)
    );
    const insertAt = remaining.findIndex(
      (r) => r.type === 'gym' && (r.value === 'b1' || r.value === 'b1_hard')
    );
    remaining.splice(insertAt, 0, ...bossRouteEntries);
    routes[gameKey] = remaining;
    console.log(`[${gameKey}] Inserted Viridian Forest mini-bosses before Brendan`);
  }

  const hard = gameKey.includes('_hard');
  const pewterFiltered = routes[gameKey].filter(
    (r) =>
      ![
        'mb1',
        'mb1_hard',
        'brad1',
        'brad1_hard',
        'george1',
        'george1_hard'
      ].includes(r.value)
  );
  const brockIndex = pewterFiltered.findIndex(
    (r) => r.type === 'gym' && (r.value === '1' || r.value === '1_hard')
  );
  if (brockIndex !== -1) {
    pewterFiltered.splice(brockIndex, 0, ...pewterEntries(hard));
    routes[gameKey] = pewterFiltered;
    console.log(`[${gameKey}] Replaced Falkner with Brad/George before Brock`);
  }

  const ceruleanFiltered = routes[gameKey].filter(
    (r) =>
      ![
        'lass1', 'lass1_hard', 'acetrainer1', 'acetrainer1_hard',
        'hiker1', 'hiker1_hard', 'rocketgrunts1', 'rocketgrunts1_hard',
        'supernerd1', 'supernerd1_hard', 'swimmer1', 'swimmer1_hard',
        'fishlover1', 'fishlover1_hard', 'supermodel1', 'supermodel1_hard'
      ].includes(r.value) &&
      !['Route 4 Magikarp ($1000)', 'Mt. Moon Gift - Kabuto', 'Mt. Moon Gift - Omanyte'].includes(r.name)
  );
  const mistyIndex = ceruleanFiltered.findIndex(
    (r) => r.type === 'gym' && (r.value === '2' || r.value === '2_hard')
  );
  if (mistyIndex !== -1) {
    ceruleanFiltered.splice(mistyIndex, 0, ...ceruleanEntries(hard));
    routes[gameKey] = ceruleanFiltered;
    console.log(`[${gameKey}] Inserted Route 3 through Misty trainer chain`);
  }
});

fs.writeFileSync(routesPath, JSON.stringify(routes, null, 2));
console.log('✓ routes.json updated\n');

// ── 2. LEAGUE JSONS ─────────────────────────────────────────────
const leagueFiles = [
  'kantoirl',
  'kantoirl_hard'
];

const joey1 = {
  name: "Youngster Joey", speciality: "normal", img: "/leaders/hgss-joey",
  pokemon: [
    { name:"rattata", level:"3", moves:[{power:0,type:"normal",damage_class:"status",name:"Tail Whip",effect:""},{power:40,type:"normal",damage_class:"physical",name:"Tackle",effect:""}], ability:{name:"Run Away",effect:""}, held:null, sprite:"19", types:["normal"], stats:{hp:30,atk:56,def:35,spa:25,spd:35,spe:72} },
    { name:"rattata-alola", level:"4", moves:[{power:40,type:"normal",damage_class:"physical",name:"Tackle",effect:""},{power:0,type:"normal",damage_class:"status",name:"Tail Whip",effect:""},{power:40,type:"normal",damage_class:"physical",name:"Quick Attack",effect:""}], ability:{name:"Gluttony",effect:""}, held:null, sprite:"10091", types:["dark","normal"], stats:{hp:30,atk:56,def:35,spa:25,spd:35,spe:72} },
    { name:"mankey", level:"4", moves:[{power:50,type:"fighting",damage_class:"physical",name:"Low Kick",effect:""},{type:"fighting",damage_class:"status",name:"Focus Energy",effect:""},{type:"normal",damage_class:"status",name:"Leer",effect:""},{power:60,type:"normal",damage_class:"physical",name:"Covet",effect:""}], ability:{name:"Anger Point",effect:""}, held:{sprite:"oran-berry",name:"Oran Berry",effect:""}, sprite:"56", types:["fighting"], stats:{hp:40,atk:80,def:35,spa:35,spd:45,spe:70}, icon:"mankey" },
    { name:"pidgey", level:"3", moves:[{power:40,type:"normal",damage_class:"physical",name:"Tackle",effect:""}], ability:{name:"Keen Eye",effect:""}, held:null, sprite:"16", types:["normal","flying"], stats:{hp:40,atk:45,def:40,spa:35,spd:35,spe:56} },
    { name:"pidgey", level:"4", moves:[{power:40,type:"normal",damage_class:"physical",name:"Tackle",effect:""}], ability:{name:"Keen Eye",effect:""}, held:null, sprite:"16", types:["normal","flying"], stats:{hp:40,atk:45,def:40,spa:35,spd:35,spe:56} },
    { name:"hoothoot", level:"4", moves:[{power:35,type:"flying",damage_class:"physical",name:"Peck",effect:""},{type:"normal",damage_class:"status",name:"Growl",effect:""},{power:40,type:"normal",damage_class:"physical",name:"Tackle",effect:""}], ability:{name:"Insomnia",effect:""}, held:{sprite:"stick",name:"Stick",effect:""}, sprite:"163", types:["normal","flying"], stats:{hp:60,atk:30,def:30,spa:36,spd:56,spe:50} }
  ]
};

const kylie1 = {
  name: "Youngster Kylie", speciality: "normal", img: "/leaders/hgss-joey",
  pokemon: [
    { name:"rattata", level:"5", moves:[{power:0,type:"normal",damage_class:"status",name:"Tail Whip",effect:""},{power:40,type:"normal",damage_class:"physical",name:"Tackle",effect:""},{power:40,type:"normal",damage_class:"physical",name:"Quick Attack",effect:""}], ability:{name:"Guts",effect:""}, held:null, sprite:"19", types:["normal"], stats:{hp:30,atk:56,def:35,spa:25,spd:35,spe:72} },
    { name:"rattata", level:"5", moves:[{power:0,type:"normal",damage_class:"status",name:"Tail Whip",effect:""},{power:40,type:"normal",damage_class:"physical",name:"Tackle",effect:""},{power:40,type:"normal",damage_class:"physical",name:"Quick Attack",effect:""}], ability:{name:"Guts",effect:""}, held:null, sprite:"19", types:["normal"], stats:{hp:30,atk:56,def:35,spa:25,spd:35,spe:72} },
    { name:"rattata", level:"5", moves:[{power:0,type:"normal",damage_class:"status",name:"Tail Whip",effect:""},{power:40,type:"normal",damage_class:"physical",name:"Tackle",effect:""},{power:40,type:"normal",damage_class:"physical",name:"Quick Attack",effect:""}], ability:{name:"Guts",effect:""}, held:{sprite:"flame-orb",name:"Flame Orb",effect:""}, sprite:"19", types:["normal"], stats:{hp:30,atk:56,def:35,spa:25,spd:35,spe:72} },
    mon({ name:'magby', level:5, moves:['ember', 'smog', 'willowisp'], abilityName:'Flame Body' }),
    { name:"shinx", level:"6", moves:[{type:"electric",damage_class:"status",name:"Charge",effect:""},{power:40,type:"normal",damage_class:"physical",name:"Tackle",effect:""},{type:"normal",damage_class:"status",name:"Leer",effect:""},{power:40,type:"electric",damage_class:"special",name:"Thunder Shock",effect:""}], ability:{name:"Intimidate",effect:""}, held:null, sprite:"403", types:["electric"], stats:{hp:45,atk:65,def:34,spa:40,spd:34,spe:45} },
    { name:"bellsprout", level:"4", moves:[{power:45,type:"grass",damage_class:"physical",name:"Vine Whip",effect:""}], ability:{name:"Gluttony",effect:""}, held:{sprite:"oran-berry",name:"Oran Berry",effect:""}, sprite:"69", types:["grass","poison"], stats:{hp:50,atk:75,def:35,spa:70,spd:30,spe:40} },
    { name:"sentret", level:"4", moves:[{power:40,type:"normal",damage_class:"physical",name:"Scratch",effect:""},{type:"normal",damage_class:"status",name:"Defense Curl",effect:""},{type:"normal",damage_class:"status",name:"Growl",effect:""}], ability:{name:"Frisk",effect:""}, held:null, sprite:"161", types:["normal"], stats:{hp:35,atk:46,def:34,spa:35,spd:45,spe:20} }
  ]
};

const maven1 = {
  name: "Bugcatcher Maven", speciality: "bug", img: "/leaders/frlg-bugcatcher",
  pokemon: [
    { name:"metapod", level:"12", moves:[{power:40,type:"normal",damage_class:"physical",name:"Tackle",effect:""},{type:"normal",damage_class:"status",name:"Harden",effect:""}], ability:{name:"Shed Skin",effect:""}, held:{sprite:"eviolite",name:"Eviolite",effect:""}, sprite:"11", types:["bug"], stats:{hp:50,atk:20,def:55,spa:25,spd:25,spe:30}, tera:"bug" },
    { name:"metapod", level:"10", moves:[{power:40,type:"normal",damage_class:"physical",name:"Tackle",effect:""},{type:"normal",damage_class:"status",name:"Harden",effect:""}], ability:{name:"Shed Skin",effect:""}, held:null, sprite:"11", types:["bug"], stats:{hp:50,atk:20,def:55,spa:25,spd:25,spe:30}, tera:"bug" },
    { name:"spinarak", level:"6", moves:[{power:15,type:"poison",damage_class:"physical",name:"Poison Sting",effect:""},{type:"bug",damage_class:"status",name:"String Shot",effect:""},{power:20,type:"grass",damage_class:"special",name:"Absorb",effect:""}], ability:{name:"Swarm",effect:""}, held:null, sprite:"167", types:["bug","poison"], stats:{hp:40,atk:60,def:40,spa:40,spd:40,spe:30}, tera:"bug" },
    { name:"pineco", level:"6", moves:[{power:40,type:"normal",damage_class:"physical",name:"Tackle",effect:""},{type:"normal",damage_class:"status",name:"Protect",effect:""},{power:200,type:"normal",damage_class:"physical",name:"Self-Destruct",effect:""}], ability:{name:"Sturdy",effect:""}, held:{sprite:"oran-berry",name:"Oran Berry",effect:""}, sprite:"204", types:["bug"], stats:{hp:50,atk:65,def:90,spa:35,spd:35,spe:15}, tera:"bug" },
    { name:"metapod", level:"8", moves:[{power:40,type:"normal",damage_class:"physical",name:"Tackle",effect:""},{type:"normal",damage_class:"status",name:"Harden",effect:""}], ability:{name:"Shed Skin",effect:""}, held:null, sprite:"11", types:["bug"], stats:{hp:50,atk:20,def:55,spa:25,spd:25,spe:30}, tera:"bug" },
    { name:"sewaddle", level:"6", moves:[{power:40,type:"normal",damage_class:"physical",name:"Tackle",effect:""},{type:"bug",damage_class:"status",name:"String Shot",effect:""},{power:60,type:"bug",damage_class:"special",name:"Silver Wind",effect:""}], ability:{name:"Swarm",effect:""}, held:null, sprite:"540", types:["bug","grass"], stats:{hp:45,atk:53,def:70,spa:40,spd:60,spe:42}, tera:"bug" }
  ]
};

const wilson1 = {
  name: 'Bug Catcher Wilson', speciality: 'bug', img: '/leaders/frlg-bugcatcher',
  pokemon: [
    mon({ name:'combee', level:8, moves:['sweetscent', 'strugglebug', 'gust', 'bugbite'], abilityName:'Honey Gather', heldItem:'hondewberry' }),
    mon({ name:'butterfree', level:10, moves:['gust', 'confusion', 'bugbite', 'harden'], abilityName:'Compound Eyes', heldItem:'expertbelt' }),
    mon({ name:'beedrill', level:10, moves:['furyattack', 'bugbite', 'poisonsting', 'harden'], abilityName:'Sniper' }),
    mon({ name:'spinarak', level:8, moves:['poisonsting', 'absorb', 'stringshot', 'infestation'], abilityName:'Swarm' }),
    mon({ name:'paras', level:6, moves:['scratch', 'stunspore', 'poisonpowder'], abilityName:'Effect Spore' }),
    mon({ name:'surskit', level:7, moves:['watergun', 'quickattack'], abilityName:'Swift Swim' })
  ]
};

const jerome1 = {
  name: 'Bug Catcher Jerome', speciality: 'bug', img: '/leaders/frlg-bugcatcher',
  pokemon: [
    mon({ name:'bulbasaur', level:12, moves:['leechseed', 'vinewhip', 'tackle', 'razorleaf'], abilityName:'Overgrow', heldItem:'bigroot' }),
    mon({ name:'shuckle', level:10, moves:['strugglebug', 'rollout'], abilityName:'Sturdy', heldItem:'assaultvest' }),
    mon({ name:'beedrill', level:10, moves:['bugbite', 'strugglebug', 'poisonsting', 'roost'], abilityName:'Swarm', heldItem:'silverpowder' }),
    mon({ name:'pineco', level:10, moves:['selfdestruct', 'tackle', 'harden'], abilityName:'Sturdy' }),
    mon({ name:'venonat', level:9, moves:['confusion', 'poisonpowder', 'tackle'], abilityName:'Compound Eyes' }),
    mon({ name:'pidgeotto', level:10, moves:['sandattack', 'gust', 'quickattack'], abilityName:'Keen Eye' })
  ]
};

const joel1 = {
  name: 'Bird Keeper Joel', speciality: 'flying', img: '/leaders/frlg-birdkeeper',
  pokemon: [
    mon({ name:'noctowl', level:12, moves:['confusion', 'reflect', 'fly', 'agility'], abilityName:'Insomnia', heldItem:'sharpbeak' }),
    mon({ name:'drifloon', level:12, moves:['minimize', 'astonish', 'gust', 'payback'], abilityName:'Aftermath' }),
    mon({ name:'ledian', level:12, moves:['supersonic', 'swift', 'lightscreen', 'machpunch'], abilityName:'Iron Fist' }),
    mon({ name:'pidgeotto', level:13, moves:['sandattack', 'gust', 'quickattack'], abilityName:'Keen Eye' }),
    mon({ name:'staravia', level:13, moves:['wingattack', 'doubleteam', 'facade'], abilityName:'Intimidate' }),
    mon({ name:'taillow', level:10, moves:['wingattack', 'quickattack'], abilityName:'Guts', heldItem:'flameorb' })
  ]
};

const brad1 = {
  name: 'Miner Brad', speciality: 'rock', img: '/leaders/frlg-hiker', lvlCap: 13,
  pokemon: [
    mon({
      name: 'graveler',
      level: 25,
      moves: ['ancientpower', 'stealthrock', 'smackdown', 'defensecurl'],
      abilityName: 'Rock Head',
      heldItem: 'expertbelt'
    })
  ]
};

const george1 = {
  name: 'Miner George', speciality: 'ground', img: '/leaders/frlg-hiker', lvlCap: 14,
  pokemon: [
    mon({ name: 'gloom', level: 13, moves: ['leechseed', 'megadrain', 'sleeppowder', 'growth'], abilityName: 'Chlorophyll' }),
    mon({ name: 'geodude', level: 16, moves: ['selfdestruct', 'sandstorm', 'rockthrow', 'harden'], abilityName: 'Sturdy' }),
    mon({ name: 'zubat', level: 13, moves: ['meanlook', 'astonish', 'supersonic', 'absorb'], abilityName: 'Inner Focus' }),
    mon({ name: 'sandshrew', level: 15, moves: ['furycutter', 'stealthrock', 'sandattack', 'scratch'], abilityName: 'Sand Veil' }),
    mon({ name: 'diglett', level: 14, moves: ['mudslap', 'scratch', 'growl', 'sandattack'], abilityName: 'Sand Veil' }),
    mon({ name: 'geodude-alola', lookup: 'geodudealola', level: 16, moves: ['tackle', 'irondefense', 'rockthrow', 'selfdestruct'], abilityName: 'Galvanize' })
  ]
};

const brock1 = {
  name: 'Brock', speciality: 'rock', img: '/leaders/frlg-brock', lvlCap: 15,
  pokemon: [
    mon({ name: 'sudowoodo', level: 15, moves: ['woodhammer', 'stoneedge', 'brickbreak', 'curse'], abilityName: 'Sturdy', heldItem: 'sitrusberry' }),
    mon({ name: 'marill', level: 15, moves: ['aquajet', 'charm', 'bounce', 'slam'], abilityName: 'Huge Power', heldItem: 'lifeorb', extra: { gender: 'F' } }),
    mon({ name: 'rhyhorn', level: 15, moves: ['stealthrock', 'hornattack', 'poisonjab', 'bulldoze'], abilityName: 'Rock Head', heldItem: 'eviolite' }),
    mon({ name: 'onix', level: 15, moves: ['dragonbreath', 'stealthrock', 'curse', 'rockthrow'], abilityName: 'Sturdy', heldItem: 'berryjuice' }),
    mon({ name: 'geodude', level: 15, moves: ['selfdestruct', 'rockthrow', 'rocksmash', 'stealthrock'], abilityName: 'Sturdy', heldItem: 'choiceband' }),
    mon({ name: 'golbat', level: 15, moves: ['poisonfang', 'quickguard', 'meanlook', 'fly'], abilityName: 'Infiltrator', heldItem: 'rockyhelmet' })
  ]
};

const lass1 = {
  name: 'Lass 1', speciality: 'normal', img: '/leaders/frlg-lass', lvlCap: 16,
  pokemon: [
    mon({ name:'eevee', level:16, moves:['quickattack', 'bite', 'covet', 'charm'], abilityName:'Adaptability', extra:{ tera:'normal' } }),
    mon({ name:'pichu', level:16, moves:['thunderbolt', 'quickattack', 'charm', 'sweetkiss'], abilityName:'Static', heldItem:'electricgem', extra:{ tera:'electric' } }),
    mon({ name:'buneary', level:16, moves:['quickattack', 'frustration', 'defensecurl', 'charm'], abilityName:'Klutz', extra:{ tera:'normal', happiness: 0 } }),
    mon({ name:'togepi', level:16, moves:['ancientpower', 'sweetkiss', 'yawn', 'encore'], abilityName:'Serene Grace', extra:{ tera:'fairy' } }),
    mon({ name:'pidgeotto', level:16, moves:['wingattack', 'return', 'uturn', 'quickattack'], abilityName:'Keen Eye', heldItem:'choiceband', extra:{ tera:'normal' } }),
    mon({ name:'butterfree', level:16, moves:['sleeppowder', 'energyball', 'gust', 'psybeam'], abilityName:'Tinted Lens', extra:{ tera:'bug' } })
  ]
};

const aceTrainer1 = {
  name: 'Ace Trainer', speciality: 'mixed', img: '/leaders/frlg-cooltrainer', lvlCap: 17,
  pokemon: [
    mon({ name:'froakie', level:17, moves:['bubble', 'quickattack', 'waterpulse', 'uturn'], abilityName:'Torrent', extra:{ tera:'water' } }),
    mon({ name:'fletchinder', level:16, moves:['ember', 'acrobatics', 'quickattack', 'roost'], abilityName:'Gale Wings', extra:{ tera:'fire' } }),
    mon({ name:'gible', level:17, moves:['dragonclaw', 'dig', 'sandattack', 'irontail'], abilityName:'Sand Veil', extra:{ tera:'dragon' } }),
    mon({ name:'riolu', level:16, moves:['forcepalm', 'quickattack', 'endure', 'counter'], abilityName:'Steadfast', extra:{ tera:'fighting' } }),
    mon({ name:'honedge', level:16, moves:['furycutter', 'shadowsneak', 'irondefense', 'swordsdance'], abilityName:'No Guard', heldItem:'eviolite', extra:{ tera:'steel' } }),
    customMon({ name:'bellibolt', level:17, moves:['paraboliccharge', 'acidspray', 'voltswitch', { name:'Muddy Water', power: 90, type:'water', damage_class:'special' }], abilityName:'Electromorphosis', heldItem:'leftovers', sprite:'939', types:['electric'], stats:{ hp:109, atk:64, def:91, spa:103, spd:83, spe:45 }, extra:{ tera:'flying' } })
  ]
};

const hiker1 = {
  name: 'Hiker 1', speciality: 'ground', img: '/leaders/frlg-hiker', lvlCap: 18,
  pokemon: [
    mon({ name:'timburr', level:18, moves:['drainpunch', 'machpunch', 'knockoff', 'bulkup'], abilityName:'Guts', heldItem:'flameorb', extra:{ tera:'fighting' } }),
    mon({ name:'machop', level:18, moves:['swagger', 'knockoff', 'rockslide', 'bulletpunch'], abilityName:'No Guard', heldItem:'expertbelt', extra:{ tera:'fighting' } }),
    mon({ name:'silicobra', level:18, moves:['stealthrock', 'drillrun', 'glare', 'rest'], abilityName:'Shed Skin', extra:{ tera:'ground' } }),
    mon({ name:'roggenrola', level:18, moves:['stealthrock', 'bulldoze', 'rockslide', 'explosion'], abilityName:'Weak Armor', heldItem:'eviolite', extra:{ tera:'rock' } }),
    mon({ name:'wooper', level:18, moves:['scald', 'recover', 'mudshot', 'yawn'], abilityName:'Water Absorb', extra:{ tera:'water' } }),
    mon({ name:'woobat', level:18, moves:['calmmind', 'substitute', 'storedpower', 'airslash'], abilityName:'Simple', extra:{ tera:'psychic' } })
  ]
};

const rocketGrunts1 = {
  name: 'Rocket Grunts', speciality: 'dark', img: '/leaders/frlg-rocketgrunt', lvlCap: 19, doubleBattle: true,
  pokemon: [
    mon({ name:'sneasel', level:19, moves:['fakeout', 'iceshard', 'feintattack', 'agility'], abilityName:'Inner Focus', extra:{ tera:'dark' } }),
    mon({ name:'sandile', level:19, moves:['earthquake', 'knockoff', 'stoneedge', 'pursuit'], abilityName:'Moxie', extra:{ tera:'ground' } }),
    mon({ name:'grimer', level:19, moves:['poisonjab', 'curse', 'rest', 'sleeptalk'], abilityName:'Poison Touch', heldItem:'blacksludge', extra:{ tera:'poison' } }),
    mon({ name:'mareep', level:19, moves:['thunderbolt', 'cottonguard', 'thunderwave', 'signalbeam'], abilityName:'Static', heldItem:'eviolite', extra:{ tera:'electric' } }),
    mon({ name:'scraggy', level:19, moves:['drainpunch', 'dragontail', 'fakeout', 'bulkup'], abilityName:'Shed Skin', heldItem:'leftovers', extra:{ tera:'dark' } }),
    mon({ name:'emolga', level:19, moves:['thunderbolt', 'airslash', 'uturn', 'voltswitch'], abilityName:'Motor Drive', extra:{ tera:'electric' } })
  ]
};

const superNerd1 = {
  name: 'Super Nerd', speciality: 'mixed', img: '/leaders/frlg-supernerd', lvlCap: 20,
  pokemon: [
    mon({ name:'magnemite', level:20, moves:['chargebeam', 'flashcannon', 'thunderwave', 'swift'], abilityName:'Magnet Pull', extra:{ tera:'electric' } }),
    mon({ name:'porygon', level:20, moves:['shadowball', 'thunderwave', 'chargebeam', 'conversion'], abilityName:'Download', heldItem:'eviolite', extra:{ tera:'normal' } }),
    mon({ name:'solosis', level:20, moves:['psyshock', 'recover', 'thunderwave', { name:'Hidden Power [Fighting]', power: 60, type:'fighting', damage_class:'special' }], abilityName:'Magic Guard', extra:{ tera:'psychic' } }),
    mon({ name:'foongus', level:20, moves:['gigadrain', 'spore', 'clearsmog', 'toxic'], abilityName:'Regenerator', extra:{ tera:'grass' } }),
    mon({ name:'kabuto', level:20, moves:['aquajet', 'stoneedge', 'knockoff', 'rapidspin'], abilityName:'Battle Armor', extra:{ tera:'rock' } }),
    mon({ name:'omanyte', level:20, moves:['scald', 'spikes', 'toxicspikes', 'stealthrock'], abilityName:'Shell Armor', extra:{ tera:'rock' } })
  ]
};

const swimmer1 = {
  name: 'Swimmer 1', speciality: 'water', img: '/leaders/frlg-swimmer', lvlCap: 21,
  pokemon: [
    mon({ name:'cloyster', level:21, moves:['shellsmash', 'iciclespear', 'spikes', 'rockblast'], abilityName:'Skill Link', heldItem:'whiteherb' }),
    mon({ name:'seel', level:20, moves:['whirlpool', 'perishsong', 'protect', 'rest'], abilityName:'Thick Fat', heldItem:'eviolite' }),
    mon({ name:'drizzile', level:21, moves:['surf', { name:'Chilling Water', power: 50, type:'water', damage_class:'special' }, 'mudshot', 'uturn'], abilityName:'Sniper', heldItem:'scopelens' }),
    mon({ name:'marshtomp', level:21, moves:['stealthrock', 'yawn', 'toxic', 'waterfall'], abilityName:'Torrent', heldItem:'eviolite' }),
    mon({ name:'croconaw', level:21, moves:['dragondance', 'waterfall', 'icepunch', 'earthquake'], abilityName:'Sheer Force', heldItem:'lifeorb' }),
    mon({ name:'quagsire', level:21, moves:['scald', 'earthquake', 'recover', 'toxic'], abilityName:'Unaware', heldItem:'leftovers' })
  ]
};

const fishLover1 = {
  name: 'Fish Lover 1', speciality: 'water', img: '/leaders/frlg-swimmer', lvlCap: 22,
  pokemon: [
    mon({ name:'wishiwashi', level:22, moves:['hydropump', 'icebeam', { name:'Hidden Power [Grass]', power: 60, type:'grass', damage_class:'special' }, 'uturn'], abilityName:'Schooling', heldItem:'choicespecs' }),
    mon({ name:'seaking', level:22, moves:['waterfall', 'knockoff', 'drillrun', 'megahorn'], abilityName:'Lightning Rod', heldItem:'lifeorb' }),
    mon({ name:'lumineon', level:22, moves:['raindance', 'scald', 'uturn', 'toxic'], abilityName:'Swift Swim', heldItem:'leftovers' }),
    mon({ name:'bruxish', level:22, moves:['crunch', 'psychicfangs', 'icefang', 'wavecrash'], abilityName:'Wonder Skin', heldItem:'lifeorb' }),
    mon({ name:'barraskewda', level:22, moves:['raindance', 'closecombat', 'crunch', 'flipturn'], abilityName:'Swift Swim', heldItem:'clearamulet' }),
    mon({ name:'relicanth', level:22, moves:['headsmash', 'waterfall', 'earthquake', 'zenheadbutt'], abilityName:'Rock Head', heldItem:'choiceband' })
  ]
};

const supermodel1 = {
  name: 'Supermodel 1', speciality: 'water', img: '/leaders/frlg-beauty', lvlCap: 23,
  pokemon: [
    mon({ name:'dragonair', level:23, moves:['dragondance', 'outrage', 'rest', 'sleeptalk'], abilityName:'Marvel Scale', heldItem:'eviolite', extra:{ tera:'dragon' } }),
    mon({ name:'milotic', level:23, moves:['scald', 'recover', 'icebeam', 'haze'], abilityName:'Marvel Scale', heldItem:'leftovers', extra:{ tera:'water' } }),
    mon({ name:'servine', level:23, moves:['leafstorm', 'substitute', 'leechseed', 'glare'], abilityName:'Contrary', heldItem:'leftovers', extra:{ tera:'grass' } }),
    mon({ name:'alomomola', level:23, moves:['wish', 'protect', 'scald', 'knockoff'], abilityName:'Regenerator', heldItem:'leftovers', extra:{ tera:'water' } }),
    mon({ name:'vaporeon', level:23, moves:['wish', 'scald', 'protect', 'healbell'], abilityName:'Water Absorb', heldItem:'leftovers', extra:{ tera:'water' } }),
    mon({ name:'mareanie', level:23, moves:['scald', 'sludgebomb', 'knockoff', 'recover'], abilityName:'Regenerator', heldItem:'eviolite', extra:{ tera:'poison' } })
  ]
};

const misty1 = {
  name: 'Misty', speciality: 'water', img: '/leaders/frlg-misty', lvlCap: 24,
  pokemon: [
    mon({ name:'gyarados', level:24, moves:['dragondance', 'waterfall', 'icefang', 'earthquake'], abilityName:'Intimidate', heldItem:'gyaradosite' }),
    mon({ name:'starmie', level:24, moves:['hydropump', 'icebeam', 'psyshock', 'rapidspin'], abilityName:'Analytic', heldItem:'colburberry' }),
    mon({ name:'psyduck', level:24, moves:['raindance', 'hydropump', 'icebeam', { name:'Hidden Power [Grass]', power: 60, type:'grass', damage_class:'special' }], abilityName:'Swift Swim', heldItem:'lifeorb' }),
    mon({ name:'togekiss', level:24, moves:['nastyplot', 'airslash', 'aurasphere', 'roost'], abilityName:'Serene Grace', heldItem:'leftovers' }),
    mon({ name:'chinchou', level:24, moves:['scald', 'voltswitch', 'icebeam', { name:'Hidden Power [Fire]', power: 60, type:'fire', damage_class:'special' }], abilityName:'Volt Absorb', heldItem:'assaultvest' }),
    mon({ name:'politoed', level:24, moves:['scald', 'encore', 'icebeam', 'rest'], abilityName:'Drizzle', heldItem:'damprock' })
  ]
};

leagueFiles.forEach(base => {
  const p = `./static/api/league/${base}.json`;
  const d = JSON.parse(fs.readFileSync(p, 'utf8'));
  delete d.mb1;
  delete d.mb1_hard;
  d.joey1 = joey1;
  d.kylie1 = kylie1;
  d.maven1 = maven1;
  d.wilson1 = wilson1;
  d.jerome1 = jerome1;
  d.joel1 = joel1;
  d[base.includes('_hard') ? 'brad1_hard' : 'brad1'] = brad1;
  d[base.includes('_hard') ? 'george1_hard' : 'george1'] = george1;
  d[base.includes('_hard') ? '1_hard' : '1'] = brock1;
  d[base.includes('_hard') ? 'lass1_hard' : 'lass1'] = lass1;
  d[base.includes('_hard') ? 'acetrainer1_hard' : 'acetrainer1'] = aceTrainer1;
  d[base.includes('_hard') ? 'hiker1_hard' : 'hiker1'] = hiker1;
  d[base.includes('_hard') ? 'rocketgrunts1_hard' : 'rocketgrunts1'] = rocketGrunts1;
  d[base.includes('_hard') ? 'supernerd1_hard' : 'supernerd1'] = superNerd1;
  d[base.includes('_hard') ? 'swimmer1_hard' : 'swimmer1'] = swimmer1;
  d[base.includes('_hard') ? 'fishlover1_hard' : 'fishlover1'] = fishLover1;
  d[base.includes('_hard') ? 'supermodel1_hard' : 'supermodel1'] = supermodel1;
  d[base.includes('_hard') ? '2_hard' : '2'] = misty1;
  fs.writeFileSync(p, JSON.stringify(d, null, 2));
  console.log(`✓ Updated ${base}.json`);
});

const dedupePokemon = (pokemon) => {
  const seen = new Set();
  return pokemon.filter((entry) => {
    const key = JSON.stringify(entry);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

['kantoirl', 'kantoirl_hard'].forEach((base) => {
  const files = ['fire', 'water', 'grass'].map((starter) =>
    JSON.parse(
      fs.readFileSync(`./static/api/league/${base}.${starter}.json`, 'utf8')
    )
  );

  const ids = [...new Set(files.flatMap((data) => Object.keys(data)))];
  const combined = ids.reduce((acc, id) => {
    const source = files.find((data) => data[id]);
    if (!source) return acc;

    const mergedPokemon = files.flatMap((data) => data[id]?.pokemon || []);
    const hasStarterVariants = mergedPokemon.some((entry) => entry.starter);

    return {
      ...acc,
      [id]: {
        ...source[id],
        pokemon: hasStarterVariants
          ? dedupePokemon(mergedPokemon)
          : source[id].pokemon
      }
    };
  }, {});

  fs.writeFileSync(
    `./static/api/league/${base}.json`,
    JSON.stringify(combined, null, 2)
  );
  console.log(`✓ Updated ${base}.json`);
});

console.log('\nAll done!');
