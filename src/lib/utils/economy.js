import tms from '$lib/data/tms.json'
import { uuid } from '$lib/utils/uuid'

export const REMOVED_TM_ALIASES = new Set(['doubleteam', 'double-team'])

export const normaliseTmAlias = (value = '') =>
  String(value).toLowerCase().replace(/[^a-z0-9-]/g, '')

export const isRemovedTmAlias = (value = '') => {
  const alias = normaliseTmAlias(value)
  return REMOVED_TM_ALIASES.has(alias) || REMOVED_TM_ALIASES.has(alias.replace(/-/g, ''))
}

export const isRemovedTmItem = (id = '') =>
  String(id).startsWith('tm-') && isRemovedTmAlias(String(id).replace(/^tm-/, ''))

export const DEFAULT_TM_TIERS = {
  tier0: {
    name: 'Tier 0',
    desc: 'Momentum, 100/100, High Power Recoil',
    price: 8000
  },
  tier1: {
    name: 'Tier 1',
    desc: '90/100 Elemental, 2-Stage Boosting',
    price: 4000
  },
  tier2: {
    name: 'Tier 2',
    desc: 'Status, Weather, Hazards, High Power/Low Acc',
    price: 2000
  },
  tier3: {
    name: 'Tier 3',
    desc: 'Other Utility',
    price: 1000
  }
}

export const ECONOMY_DEFAULTS = {
  version: 1,
  tokenPrice: 500,
  rareCandyPrice: 500,
  rewards: {
    trainer: 2000,
    gymLeader: 10000,
    amuletCoinMultiplier: 1.5
  },
  tmTiers: DEFAULT_TM_TIERS,
  storeItems: {},
  specialEncounters: {}
}

export const STORE_ITEMS = [
  { id: 'encounter-token', name: 'Extra Encounter Token', price: 500, description: 'Buy an extra encounter slot for any route.', type: 'special' },
  { id: 'rare-candy', name: 'Rare Candy', price: 500, description: 'Instantly levels a Pokemon up by 1 level.', type: 'item' },
  { id: 'tier-0-tms', name: 'Tier 0 TMs', price: 8000, description: 'The most powerful moves: Momentum, 100/100 spread, and high-power recoil moves.', type: 'tm' },
  { id: 'tier-1-tms', name: 'Tier 1 TMs', price: 4000, description: 'Crucial competitive setup and 90BP/100Acc elemental attacks.', type: 'tm' },
  { id: 'tier-2-tms', name: 'Tier 2 TMs', price: 2000, description: 'Mid-tier moves: Status, Weather, Hazards, and high-power low-accuracy moves.', type: 'tm' },
  { id: 'tier-3-tms', name: 'Tier 3 TMs', price: 1000, description: 'Niche utility moves and other Technical Machines.', type: 'tm' },
  { id: 'exp-share', name: 'Exp. Share', price: 10000, description: 'Shares experience points across the team so all Pokemon autolevel to level cap.', type: 'key-item' },
  { id: 'dynamax-band', name: 'Dynamax Band', price: 10000, description: 'Enables Dynamax mechanics for your team (in doubles only) banned in singles.', type: 'key-item' },
  { id: 'tera-orb', name: 'Tera Orb', price: 10000, description: 'Allows a Pokemon to Terastallize during battle.', type: 'key-item' },
  { id: 'amulet-coin', name: 'Amulet Coin', price: 10000, description: '1.5x prize money earned from trainer battles.', type: 'held' },
  { id: 'mega-stone', name: 'Mega Stone', price: 10000, description: "Required held item to trigger a Pokemon's Mega Evolution.", type: 'held' },
  { id: 'ability-capsule', name: 'Ability Capsule', price: 2000, description: "Switches a Pokemon's ability to its other standard ability.", type: 'item' },
  { id: 'ability-patch', name: 'Ability Patch', price: 10000, description: "Permanently switches a Pokemon's ability to its Hidden Ability.", type: 'item' },
  { id: 'gold-bottle-cap', name: 'Gold Bottle Cap', price: 10000, description: 'Maxes out all IVs for a level 100 Pokemon through Hyper Training.', type: 'item' },
  { id: 'choice-band', name: 'Choice Band', price: 5000, description: 'Big immediate power for physical breakers. Locks user into one move.', type: 'held' },
  { id: 'choice-specs', name: 'Choice Specs', price: 5000, description: 'Big immediate power for special breakers. Locks user into one move.', type: 'held' },
  { id: 'choice-scarf', name: 'Choice Scarf', price: 5000, description: 'Provides out-speeding utility for revenge killers. Locks user into one move.', type: 'held' },
  { id: 'assault-vest', name: 'Assault Vest', price: 5000, description: 'Increases special bulk for tanks, but disables status moves.', type: 'held' },
  { id: 'leftovers', name: 'Leftovers', price: 5000, description: 'Reliable passive recovery for bulky pivots and stall cores.', type: 'held' },
  { id: 'type-gem', name: 'Type Gem', price: 5000, description: 'Provides a one-time 30% power boost to a specific elemental type.', type: 'held' },
  { id: 'bright-powder', name: 'Bright Powder', price: 5000, description: "Relies on RNG to lower opponent's accuracy by 10%.", type: 'held' },
  { id: 'z-crystal', name: 'Z-Crystal', price: 8000, description: 'Upgrades a specific move into a high-powered Z-Move.', type: 'held' },
  { id: 'life-orb', name: 'Life Orb', price: 5000, description: 'Trades 10% of max HP per attack for a universal 30% damage boost.', type: 'held' },
  { id: 'eviolite', name: 'Eviolite', price: 5000, description: 'Massively boosts the defenses of not-fully-evolved Pokemon.', type: 'held' },
  { id: 'focus-sash', name: 'Focus Sash', price: 5000, description: 'Guarantees survival of a single fatal hit from full HP.', type: 'held' },
  { id: 'covert-cloak', name: 'Covert Cloak', price: 4000, description: 'Shields the holder from secondary effects of attacks.', type: 'held' },
  { id: 'loaded-dice', name: 'Loaded Dice', price: 4000, description: 'Guarantees multi-hit moves hit at least 4 times.', type: 'held' },
  { id: 'clear-amulet', name: 'Clear Amulet', price: 4000, description: 'Prevents stat reduction from abilities or opponent moves.', type: 'held' },
  { id: 'weakness-policy', name: 'Weakness Policy', price: 4000, description: 'Provides a massive offensive boost when hit super-effectively.', type: 'held' },
  { id: 'heavy-duty-boots', name: 'Heavy-Duty Boots', price: 3000, description: 'Grants immunity to all entry hazards.', type: 'held' },
  { id: 'black-sludge', name: 'Black Sludge', price: 3000, description: 'Provides passive recovery for Poison-types.', type: 'held' },
  { id: 'muscle-band', name: 'Muscle Band', price: 3000, description: 'Provides a slight power boost to physical attacks.', type: 'held' },
  { id: 'wide-glasses', name: 'Wide Glasses', price: 3000, description: 'Provides a slight power boost to special attacks.', type: 'held' },
  { id: 'expert-belt', name: 'Expert Belt', price: 3000, description: 'Increases the damage of super-effective hits by 20%.', type: 'held' },
  { id: 'punching-glove', name: 'Punching Glove', price: 3000, description: 'Boosts punching moves and protects against contact effects.', type: 'held' },
  { id: 'throat-spray', name: 'Throat Spray', price: 3000, description: 'Boosts Special Attack after using a sound-based move.', type: 'held' },
  { id: 'flame-orb', name: 'Flame Orb', price: 3000, description: 'Self-inflicts a burn.', type: 'held' },
  { id: 'toxic-orb', name: 'Toxic Orb', price: 3000, description: 'Self-inflicts bad poison.', type: 'held' },
  { id: 'black-belt', name: 'Black Belt', price: 3000, description: 'A passive 20% power boost to Fighting-type attacks.', type: 'held' },
  { id: 'miracle-seed', name: 'Miracle Seed', price: 3000, description: 'A passive 20% power boost to Grass-type attacks.', type: 'held' },
  { id: 'never-melt-ice', name: 'Never-Melt Ice', price: 3000, description: 'A passive 20% power boost to Ice-type attacks.', type: 'held' },
  { id: 'white-herb', name: 'White Herb', price: 3000, description: 'Restores dropped stats to normal once per battle.', type: 'held' },
  { id: 'power-herb', name: 'Power Herb', price: 3000, description: 'Allows immediate execution of a two-turn charge move.', type: 'held' },
  { id: 'mental-herb', name: 'Mental Herb', price: 3000, description: 'Cures disruptive status conditions like Taunt or Encore.', type: 'held' },
  { id: 'mirror-herb', name: 'Mirror Herb', price: 3000, description: "Copies an opponent's stat boosts immediately.", type: 'held' },
  { id: 'metronome', name: 'Metronome', price: 3000, description: 'Damage scales up per consecutive use of the same move.', type: 'held' },
  { id: 'eject-button', name: 'Eject Button', price: 3000, description: 'Forces the holder to switch out after taking a hit.', type: 'held' },
  { id: 'eject-pack', name: 'Eject Pack', price: 3000, description: 'Forces the holder to switch out if stats are lowered.', type: 'held' },
  { id: 'red-card', name: 'Red Card', price: 3000, description: 'Forces the opponent to switch out randomly.', type: 'held' },
  { id: 'rocky-helmet', name: 'Rocky Helmet', price: 2500, description: 'Punishes physical attackers with contact chip damage.', type: 'held' },
  { id: 'light-clay', name: 'Light Clay', price: 2500, description: 'Extends screens and Aurora Veil duration.', type: 'held' },
  { id: 'shell-bell', name: 'Shell Bell', price: 2500, description: 'Provides slight recovery based on damage dealt.', type: 'held' },
  { id: 'safety-goggles', name: 'Safety Goggles', price: 2500, description: 'Grants immunity to weather chip and powder moves.', type: 'held' },
  { id: 'air-balloon', name: 'Air Balloon', price: 2000, description: 'Temporary Ground immunity until popped.', type: 'held' },
  { id: 'wide-lens', name: 'Wide Lens', price: 2000, description: 'Slightly boosts accuracy.', type: 'held' },
  { id: 'scope-lens', name: 'Scope Lens', price: 2000, description: 'Increases critical hit ratio.', type: 'held' },
  { id: 'evolution-stone', name: 'Evolution Stone', price: 2000, description: 'Used to evolve specific branches of Pokemon.', type: 'item' },
  { id: 'big-root', name: 'Big Root', price: 2000, description: 'Increases HP recovered by draining moves.', type: 'held' },
  { id: 'shed-shell', name: 'Shed Shell', price: 2000, description: 'Guarantees the holder can switch out.', type: 'held' },
  { id: 'utility-umbrella', name: 'Utility Umbrella', price: 2000, description: 'Shields holder from Rain and Sun effects.', type: 'held' },
  { id: 'blunder-policy', name: 'Blunder Policy', price: 2000, description: 'Boosts Speed if a move misses.', type: 'held' },
  { id: 'terrain-extender', name: 'Terrain Extender', price: 2000, description: 'Extends active terrain duration.', type: 'held' },
  { id: 'weather-stone', name: 'Weather Stone', price: 2000, description: 'Extends weather condition durations.', type: 'held' },
  { id: 'sitrus-berry', name: 'Sitrus Berry', price: 2000, description: 'Restores 25% HP below half health.', type: 'held' },
  { id: 'lum-berry', name: 'Lum Berry', price: 2000, description: 'Cures any single non-volatile status condition.', type: 'held' },
  { id: 'custap-berry', name: 'Custap Berry', price: 2000, description: 'Grants priority when health is low.', type: 'held' },
  { id: 'standard-bottle-cap', name: 'Standard Bottle Cap', price: 2000, description: 'Maxes out a single IV stat.', type: 'item' },
  { id: 'berry-juice', name: 'Berry Juice', price: 1500, description: 'Restores 20 HP.', type: 'held' },
  { id: 'adrenaline-orb', name: 'Adrenaline Orb', price: 1500, description: 'Boosts Speed when intimidated.', type: 'held' },
  { id: 'room-service', name: 'Room Service', price: 1500, description: 'Lowers Speed when Trick Room activates.', type: 'held' },
  { id: 'type-resist-berry', name: 'Type-Resist Berry', price: 1000, description: 'Halves one super-effective hit.', type: 'held' },
  { id: 'terrain-seed', name: 'Terrain Seed', price: 1000, description: 'Consumes in terrain to boost defenses.', type: 'held' },
  { id: 'heart-scale', name: 'Heart Scale', price: 1000, description: 'Unlocks one egg move in the Pokemon editor.', type: 'item' },
  { id: 'oran-berry', name: 'Oran Berry', price: 500, description: 'Restores 10 HP below half health.', type: 'held' },
  { id: 'rawst-berry', name: 'Rawst Berry', price: 500, description: 'Cures burn once per battle.', type: 'held' },
  { id: 'pecha-berry', name: 'Pecha Berry', price: 500, description: 'Cures poison once per battle.', type: 'held' },
  { id: 'aspear-berry', name: 'Aspear Berry', price: 500, description: 'Cures freeze once per battle.', type: 'held' },
  { id: 'chesto-berry', name: 'Chesto Berry', price: 500, description: 'Cures sleep once per battle.', type: 'held' },
  { id: 'cheri-berry', name: 'Cheri Berry', price: 500, description: 'Cures paralysis once per battle.', type: 'held' },
  { id: 'sticky-barb', name: 'Sticky Barb', price: 500, description: 'Deals chip damage and transfers on contact.', type: 'held' },
  { id: 'iron-ball', name: 'Iron Ball', price: 500, description: 'Halves Speed and removes Ground immunity.', type: 'held' },
  { id: 'lagging-tail', name: 'Lagging Tail', price: 500, description: 'Forces the user to move last.', type: 'held' },
  { id: 'focus-band', name: 'Focus Band', price: 500, description: 'Chance to survive a lethal hit.', type: 'held' },
  { id: 'nature-mint', name: 'Nature Mint', price: 3000, description: "Overrides a Pokemon's stats to match a specific nature.", type: 'item' },
  { id: 'vitamin', name: 'Vitamin', price: 400, description: 'Raises a specific EV by 14 points.', type: 'item' }
]

export const SPECIAL_ENCOUNTERS = [
  {
    id: 'route-4-magikarp',
    name: 'Route 4 Magikarp',
    pokemon: 'magikarp',
    price: 500,
    description: 'A special Magikarp sold by a suspicious salesman near Route 4.',
    requirement: 'acetrainer1',
    type: 'encounter'
  }
]

export const getEconomyConfig = (data = {}) => ({
  ...ECONOMY_DEFAULTS,
  ...(data.__economyConfig || {}),
  rewards: {
    ...ECONOMY_DEFAULTS.rewards,
    ...(data.__economyConfig?.rewards || {})
  },
  tmTiers: {
    ...ECONOMY_DEFAULTS.tmTiers,
    ...(data.__economyConfig?.tmTiers || {})
  },
  storeItems: {
    ...ECONOMY_DEFAULTS.storeItems,
    ...(data.__economyConfig?.storeItems || {})
  },
  specialEncounters: {
    ...ECONOMY_DEFAULTS.specialEncounters,
    ...(data.__economyConfig?.specialEncounters || {})
  }
})

export const getTmTiers = (data = {}) => {
  const tiers = getEconomyConfig(data).tmTiers
  return Object.entries(tiers).map(([id, tier]) => ({ id, ...tier }))
}

export const getStoreItems = (data = {}) => {
  const config = getEconomyConfig(data)
  return STORE_ITEMS.map((item) => {
    const override = config.storeItems[item.id] || {}
    const tier = item.id.match(/^tier-(\d)-tms$/)?.[1]
    const tierConfig = tier ? config.tmTiers[`tier${tier}`] : null
    const price =
      item.id === 'encounter-token'
        ? config.tokenPrice
        : item.id === 'rare-candy'
          ? config.rareCandyPrice
          : tierConfig?.price ?? item.price

    return { ...item, ...override, price: Number(override.price ?? price) }
  }).filter((item) => item.enabled !== false)
}

export const getSpecialEncounters = (data = {}) => {
  const config = getEconomyConfig(data)
  return SPECIAL_ENCOUNTERS.map((encounter) => {
    const override = config.specialEncounters[encounter.id] || {}
    return { ...encounter, ...override, price: Number(override.price ?? encounter.price) }
  }).filter((encounter) => encounter.enabled !== false)
}

export const getItemCatalog = (data = {}) =>
  getStoreItems(data).reduce((acc, item) => ({ ...acc, [item.id]: item }), {})

export const getTmCatalog = () =>
  Object.values(tms).flat().filter((tm) => !isRemovedTmAlias(tm.alias || tm.name)).reduce((acc, tm) => {
    const id = `tm-${tm.alias || tm.name.toLowerCase().replace(/ /g, '-')}`
    acc[id] = {
      id,
      name: `${tm.name} TM`,
      type: 'tm',
      tm: tm.tm,
      move: tm.name,
      tmType: tm.type,
      category: tm.category,
      bp: tm.bp,
      acc: tm.acc,
      pp: tm.pp,
      tier: tm.tier
    }
    return acc
  }, {})

export const itemDisplayName = (id, data = {}) => {
  if (id === 'encounter-token') return 'Extra Encounter Token'
  const catalog = { ...getItemCatalog(data), ...getTmCatalog() }
  return catalog[id]?.name || id.replace(/^tm-/, '').replace(/-/g, ' ')
}

export const itemLookupKey = (value = '') =>
  String(value || '')
    .toLowerCase()
    .replace(/\.(png|webp)$/i, '')
    .replace(/[^a-z0-9]/g, '')

export const findCatalogItemId = (value = '', catalog = {}) => {
  const needle = itemLookupKey(value)
  if (!needle) return ''

  return (
    Object.values(catalog).find((item) =>
      [item.id, item.name, item.move, item.sprite]
        .filter(Boolean)
        .some((candidate) => itemLookupKey(candidate) === needle)
    )?.id || ''
  )
}

export const getHeldItemCatalog = (data = {}) =>
  Object.entries(getItemCatalog(data)).reduce((acc, [id, item]) => {
    if (item.type === 'held') acc[id] = item
    return acc
  }, {})

export const getPokemonStorageKey = (pokemon = {}) =>
  pokemon?.customId || pokemon?.location || pokemon?.id || `${pokemon?.pokemon || ''}:${pokemon?.nickname || ''}`

export const getPokemonHeldItemId = (pokemon = {}) => {
  if (!pokemon) return ''
  if (typeof pokemon.heldItem === 'string') return pokemon.heldItem
  if (typeof pokemon.held === 'string') return pokemon.held
  return pokemon.heldItem?.id || pokemon.held?.id || ''
}

export const getHeldItemUsage = (pokemonList = [], options = {}) => {
  const excludeKey = options.excludeKey || ''
  return (pokemonList || []).reduce(
    (acc, pokemon) => {
      const key = getPokemonStorageKey(pokemon)
      if (excludeKey && key === excludeKey) return acc

      const itemId = getPokemonHeldItemId(pokemon)
      if (!itemId) return acc

      acc.counts[itemId] = (acc.counts[itemId] || 0) + 1
      acc.holders[itemId] = (acc.holders[itemId] || []).concat({
        key,
        name: pokemon.nickname || pokemon.pokemon || pokemon.name || 'Pokemon',
        location: pokemon.customName || pokemon.location || ''
      })
      return acc
    },
    { counts: {}, holders: {} }
  )
}

export const getHeldItemAvailableCount = (inventory = {}, usage = {}, itemId = '') =>
  Math.max(0, Number(inventory?.[itemId] || 0) - Number(usage?.counts?.[itemId] || 0))

export const hasItemInInventoryOrBox = (data = {}, itemId = '') => {
  if (!itemId) return false
  if (Number(data.__items?.[itemId] || 0) > 0) return true

  return Object.entries(data || {}).some(([key, pokemon]) => {
    if (key.startsWith('__') || !pokemon?.pokemon) return false
    return getPokemonHeldItemId(pokemon) === itemId
  })
}

export const isBattleRewardTransaction = (entry = {}) =>
  entry.kind === 'earn' && entry.source === 'boss-reward'

export const opponentContextFromReward = (entry = {}) => {
  if (!isBattleRewardTransaction(entry)) return null
  return {
    id: entry.itemId,
    name: entry.itemName || 'Battle Reward',
    type: entry.itemType,
    defeatedAt: entry.at,
    rewardTransactionId: entry.id
  }
}

export const getLatestBeatenOpponent = (data = {}) =>
  (data.__transactions || [])
    .filter(isBattleRewardTransaction)
    .sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0))
    .map((entry) => entry.contextOpponent || opponentContextFromReward(entry))
    .find(Boolean) || null

const tx = (entry, contextOpponent = null) => {
  const next = {
    id: uuid(),
    at: new Date().toISOString(),
    ...entry
  }

  next.contextOpponent =
    entry.contextOpponent ||
    (isBattleRewardTransaction(next) ? opponentContextFromReward(next) : contextOpponent)

  return next
}

export const addTransaction = (data, entry) => ({
  ...(data || {}),
  __transactions: [tx(entry, getLatestBeatenOpponent(data))].concat(data.__transactions || [])
})

export const purchasePatch = (data, item, quantity = 1, options = {}) => {
  const moneyBefore = data.__money || 0
  const total = Number(item.price || 0) * quantity
  const itemId = options.itemId || item.id
  const inventory = data.__items || {}
  const patch = {
    __money: moneyBefore - total,
    __items: {
      ...inventory,
      [itemId]: (inventory[itemId] || 0) + quantity
    }
  }

  return addTransaction({ ...data, ...patch }, {
    kind: 'purchase',
    source: options.source || 'store',
    itemId,
    itemName: options.itemName || item.name,
    itemType: options.itemType || item.type || 'item',
    quantity,
    unitPrice: Number(item.price || 0),
    total,
    moneyBefore,
    moneyAfter: moneyBefore - total,
    refundable: options.refundable ?? true
  })
}

export const tokenPurchasePatch = (data, price, quantity = 1, source = 'store') => {
  const moneyBefore = data.__money || 0
  const total = price * quantity
  return addTransaction({
    ...data,
    __money: moneyBefore - total,
    __encounterTokens: (data.__encounterTokens || 0) + quantity
  }, {
    kind: 'purchase',
    source,
    itemId: 'encounter-token',
    itemName: 'Extra Encounter Token',
    itemType: 'token',
    quantity,
    unitPrice: price,
    total,
    moneyBefore,
    moneyAfter: moneyBefore - total,
    refundable: true
  })
}

export const spendTokenPatch = (data, routeName, loc) => {
  const moneyBefore = data.__money || 0
  const next = {
    ...data,
    __encounterTokens: Math.max(0, (data.__encounterTokens || 0) - 1),
    __custom: loc ? (data.__custom || []).concat(loc) : (data.__custom || [])
  }

  return addTransaction(next, {
    kind: 'consume',
    source: 'route',
    itemId: 'encounter-token',
    itemName: 'Extra Encounter Token',
    itemType: 'token',
    quantity: 1,
    unitPrice: 0,
    total: 0,
    moneyBefore,
    moneyAfter: moneyBefore,
    target: routeName,
    refundable: false
  })
}

export const rewardPatch = (data, boss) => {
  const config = getEconomyConfig(data)
  const isGymLeader = boss?.type === 'gym-leader'
  const base = isGymLeader ? config.rewards.gymLeader : config.rewards.trainer
  const hasAmuletCoin = hasItemInInventoryOrBox(data, 'amulet-coin')
  const multiplier = hasAmuletCoin ? config.rewards.amuletCoinMultiplier : 1
  const total = Math.floor(base * multiplier)
  const moneyBefore = data.__money || 0

  return addTransaction({
    ...data,
    __money: moneyBefore + total
  }, {
    kind: 'earn',
    source: 'boss-reward',
    itemId: boss?.id,
    itemName: boss?.name || 'Battle Reward',
    itemType: isGymLeader ? 'gym-leader' : 'trainer',
    quantity: 1,
    unitPrice: total,
    total,
    moneyBefore,
    moneyAfter: moneyBefore + total,
    baseReward: base,
    multiplier,
    refundable: false
  })
}

export const refundTransactionPatch = (data, transaction) => {
  if (!transaction || transaction.refundedBy || transaction.refundable === false) return data
  const qty = transaction.quantity || 1
  const itemId = transaction.itemId
  const moneyBefore = data.__money || 0
  const refund = transaction.total || 0
  const next = { ...data }

  if (transaction.itemType === 'token') {
    if ((data.__encounterTokens || 0) < qty) return data
    next.__encounterTokens = (data.__encounterTokens || 0) - qty
  } else {
    if ((data.__items?.[itemId] || 0) < qty) return data
    next.__items = {
      ...(data.__items || {}),
      [itemId]: (data.__items[itemId] || 0) - qty
    }
    if (next.__items[itemId] <= 0) delete next.__items[itemId]
  }

  next.__money = moneyBefore + refund
  const refundEntry = tx({
    kind: 'refund',
    source: 'receipts',
    itemId,
    itemName: transaction.itemName,
    itemType: transaction.itemType,
    quantity: qty,
    unitPrice: transaction.unitPrice || refund,
    total: refund,
    moneyBefore,
    moneyAfter: next.__money,
    refundOf: transaction.id,
    contextOpponent: transaction.contextOpponent || transaction.displayContextOpponent || getLatestBeatenOpponent(data),
    refundable: false
  })

  next.__transactions = (data.__transactions || []).map((it) =>
    it.id === transaction.id ? { ...it, refundedBy: refundEntry.id } : it
  )
  next.__transactions = [refundEntry].concat(next.__transactions)
  return next
}
