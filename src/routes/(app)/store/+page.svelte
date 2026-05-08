<script>
  import { getContext, onMount } from 'svelte'
  import { readdata, getGameStore, read, patch, readBox } from '$lib/store'
  import { PIcon, Button, Icon } from '$c/core'
  import { Gift } from '$icons'
  import { capitalise } from '$utils/string'

  const storeItems = [
    {
      id: 'encounter-token',
      name: 'Extra Encounter Token',
      price: 500,
      description: 'Buy an extra encounter slot for any route.',
      type: 'special'
    },
    {
      id: 'rare-candy',
      name: 'Rare Candy',
      price: 500,
      description: 'Instantly levels a Pokémon up by 1 level.',
      type: 'item'
    },
    {
      id: 'tier-0-tms',
      name: 'Tier 0 TMs',
      price: 8000,
      description: 'The most powerful moves: Momentum, 100/100 spread, and high-power recoil moves.',
      type: 'tm'
    },
    {
      id: 'tier-1-tms',
      name: 'Tier 1 TMs',
      price: 4000,
      description: 'Crucial competitive setup and 90BP/100Acc elemental attacks.',
      type: 'tm'
    },
    {
      id: 'tier-2-tms',
      name: 'Tier 2 TMs',
      price: 2000,
      description: 'Mid-tier moves: Status, Weather, Hazards, and high-power low-accuracy moves.',
      type: 'tm'
    },
    {
      id: 'tier-3-tms',
      name: 'Tier 3 TMs',
      price: 1000,
      description: 'Niche utility moves and other Technical Machines.',
      type: 'tm'
    },
    {
      id: 'exp-share',
      name: 'Exp. Share',
      price: 30000,
      description:
        'Shares experience points across the team so all Pokemon autolevel to level cap.',
      type: 'key-item'
    },
    {
      id: 'dynamax-band',
      name: 'Dynamax Band',
      price: 10000,
      description:
        'Enables Dynamax mechanics for your team (in doubles only) banned in singles.',
      type: 'key-item'
    },
    {
      id: 'tera-orb',
      name: 'Tera Orb',
      price: 15000,
      description: 'Allows a Pokémon to Terastallize during battle.',
      type: 'key-item'
    },
    {
      id: 'amulet-coin',
      name: 'Amulet Coin',
      price: 10000,
      description:
        '1.5x prize money earned from trainer battles ($2k->$3k for trainers, $10k-$15k for gym leaders).',
      type: 'held'
    },
    {
      id: 'mega-stone',
      name: 'Mega Stone',
      price: 10000,
      description: "Required held item to trigger a Pokémon's Mega Evolution.",
      type: 'held'
    },
    {
      id: 'ability-patch',
      name: 'Ability Patch',
      price: 10000,
      description:
        "Permanently switches a Pokémon's ability to its Hidden Ability.",
      type: 'item'
    },
    {
      id: 'gold-bottle-cap',
      name: 'Gold Bottle Cap',
      price: 10000,
      description:
        'Maxes out all IVs for a level 100 Pokémon through Hyper Training.',
      type: 'item'
    },
    {
      id: 'choice-band',
      name: 'Choice Band',
      price: 5000,
      description:
        'Big immediate power for physical breakers. Locks user into one move.',
      type: 'held'
    },
    {
      id: 'choice-specs',
      name: 'Choice Specs',
      price: 5000,
      description:
        'Big immediate power for special breakers. Locks user into one move.',
      type: 'held'
    },
    {
      id: 'choice-scarf',
      name: 'Choice Scarf',
      price: 5000,
      description:
        'Provides out-speeding utility for revenge killers. Locks user into one move.',
      type: 'held'
    },
    {
      id: 'assault-vest',
      name: 'Assault Vest',
      price: 5000,
      description:
        'Increases special bulk for tanks, but disables status moves.',
      type: 'held'
    },
    {
      id: 'leftovers',
      name: 'Leftovers',
      price: 5000,
      description:
        'Reliable passive recovery for bulky pivots and stall cores.',
      type: 'held'
    },
    {
      id: 'type-gem',
      name: 'Type Gem',
      price: 5000,
      description:
        'Provides a one-time 30% power boost to a specific elemental type.',
      type: 'held'
    },
    {
      id: 'bright-powder',
      name: 'Bright Powder',
      price: 5000,
      description: "Relies on RNG to lower opponent's accuracy by 10%.",
      type: 'held'
    },
    {
      id: 'z-crystal',
      name: 'Z-Crystal',
      price: 8000,
      description: 'Upgrades a specific move into a high-powered Z-Move.',
      type: 'held'
    },
    {
      id: 'life-orb',
      name: 'Life Orb',
      price: 5000,
      description:
        'Trades 10% of max HP per attack for a universal 30% damage boost.',
      type: 'held'
    },
    {
      id: 'eviolite',
      name: 'Eviolite',
      price: 5000,
      description:
        'Massively boosts the defenses of not-fully-evolved Pokémon.',
      type: 'held'
    },
    {
      id: 'focus-sash',
      name: 'Focus Sash',
      price: 5000,
      description:
        'Guarantees survival of a single fatal hit from full HP. Great for setup sweepers.',
      type: 'held'
    },
    {
      id: 'move-tutor-access',
      name: 'Move Tutor Access',
      price: 4000,
      description:
        'Unlocks specialized competitive moves not found in standard TMs.',
      type: 'service'
    },
    {
      id: 'covert-cloak',
      name: 'Covert Cloak',
      price: 4000,
      description:
        'Shields the holder from secondary effects of attacks, like flinches or stat drops.',
      type: 'held'
    },
    {
      id: 'loaded-dice',
      name: 'Loaded Dice',
      price: 4000,
      description:
        'Guarantees multi-hit moves hit at least 4 times. Great for Scale Shot or Icicle Spear.',
      type: 'held'
    },
    {
      id: 'clear-amulet',
      name: 'Clear Amulet',
      price: 4000,
      description:
        'Prevents stat reduction from abilities like Intimidate or opponent moves.',
      type: 'held'
    },
    {
      id: 'weakness-policy',
      name: 'Weakness Policy',
      price: 4000,
      description:
        'Provides a massive +2 offensive boost when hit by a super-effective attack.',
      type: 'held'
    },
    {
      id: 'heavy-duty-boots',
      name: 'Heavy-Duty Boots',
      price: 3000,
      description:
        'Grants immunity to all entry hazards, perfect for pivot Pokémon.',
      type: 'held'
    },
    {
      id: 'black-sludge',
      name: 'Black Sludge',
      price: 3000,
      description:
        'Provides passive recovery for Poison-types, but damages non-Poison holders.',
      type: 'held'
    },
    {
      id: 'muscle-band',
      name: 'Muscle Band',
      price: 3000,
      description:
        'Provides a slight power boost to physical attacks without locking moves.',
      type: 'held'
    },
    {
      id: 'wide-glasses',
      name: 'Wide Glasses',
      price: 3000,
      description:
        'Provides a slight power boost to special attacks without locking moves.',
      type: 'held'
    },
    {
      id: 'expert-belt',
      name: 'Expert Belt',
      price: 3000,
      description: 'Increases the damage of super-effective hits by 20%.',
      type: 'held'
    },
    {
      id: 'punching-glove',
      name: 'Punching Glove',
      price: 3000,
      description:
        'Boosts punching moves by 10% and protects against contact-punishing abilities.',
      type: 'held'
    },
    {
      id: 'throat-spray',
      name: 'Throat Spray',
      price: 3000,
      description:
        'Boosts Special Attack by +1 stage after using a sound-based move.',
      type: 'held'
    },
    {
      id: 'flame-orb',
      name: 'Flame Orb',
      price: 3000,
      description:
        'Self-inflicts a burn. Excellent for triggering Guts or Flare Boost.',
      type: 'held'
    },
    {
      id: 'toxic-orb',
      name: 'Toxic Orb',
      price: 3000,
      description:
        'Self-inflicts bad poison. Great for Poison Heal or Facade users.',
      type: 'held'
    },
    {
      id: 'black-belt',
      name: 'Black Belt',
      price: 3000,
      description: 'A passive 20% power boost to Fighting-type attacks.',
      type: 'held'
    },
    {
      id: 'miracle-seed',
      name: 'Miracle Seed',
      price: 3000,
      description: 'A passive 20% power boost to Grass-type attacks.',
      type: 'held'
    },
    {
      id: 'never-melt-ice',
      name: 'Never-Melt Ice',
      price: 3000,
      description: 'A passive 20% power boost to Ice-type attacks.',
      type: 'held'
    },
    {
      id: 'white-herb',
      name: 'White Herb',
      price: 3000,
      description:
        'Restores dropped stats to normal once per battle. Pairs well with Shell Smash.',
      type: 'held'
    },
    {
      id: 'power-herb',
      name: 'Power Herb',
      price: 3000,
      description:
        'Allows immediate execution of a two-turn charge move like Meteor Beam.',
      type: 'held'
    },
    {
      id: 'mental-herb',
      name: 'Mental Herb',
      price: 3000,
      description:
        'Cures disruptive status conditions like Taunt or Encore once per battle.',
      type: 'held'
    },
    {
      id: 'mirror-herb',
      name: 'Mirror Herb',
      price: 3000,
      description:
        "Copies an opponent's stat boosts immediately. Great for punishing setup.",
      type: 'held'
    },
    {
      id: 'metronome',
      name: 'Metronome',
      price: 3000,
      description: 'Damage scales up 20% per consecutive use of the same move.',
      type: 'held'
    },
    {
      id: 'eject-button',
      name: 'Eject Button',
      price: 3000,
      description:
        'Forces the holder to switch out immediately after taking a hit.',
      type: 'held'
    },
    {
      id: 'eject-pack',
      name: 'Eject Pack',
      price: 3000,
      description:
        'Forces the holder to switch out if any of its stats are lowered.',
      type: 'held'
    },
    {
      id: 'red-card',
      name: 'Red Card',
      price: 3000,
      description:
        'Forces the opponent to switch out randomly when they hit the holder.',
      type: 'held'
    },
    {
      id: 'rocky-helmet',
      name: 'Rocky Helmet',
      price: 2500,
      description:
        'Punishes physical attackers with 1/6 max HP chip damage upon contact.',
      type: 'held'
    },
    {
      id: 'light-clay',
      name: 'Light Clay',
      price: 2500,
      description:
        'Extends dual screens and Aurora Veil duration from 5 to 8 turns.',
      type: 'held'
    },
    {
      id: 'shell-bell',
      name: 'Shell Bell',
      price: 2500,
      description:
        'Provides slight recovery based on the amount of damage dealt.',
      type: 'held'
    },
    {
      id: 'safety-goggles',
      name: 'Safety Goggles',
      price: 2500,
      description:
        'Grants immunity to weather chip damage and powder/spore moves.',
      type: 'held'
    },
    {
      id: 'air-balloon',
      name: 'Air Balloon',
      price: 2000,
      description:
        'Provides a temporary immunity to Ground-type moves until popped.',
      type: 'held'
    },
    {
      id: 'wide-lens',
      name: 'Wide Lens',
      price: 2000,
      description:
        'Slightly boosts accuracy. Ideal for multi-hit moves or Population Bomb.',
      type: 'held'
    },
    {
      id: 'scope-lens',
      name: 'Scope Lens',
      price: 2000,
      description:
        'Increases critical hit ratio. Deadly when paired with Sniper or high-crit moves.',
      type: 'held'
    },
    {
      id: 'evolution-stone',
      name: 'Evolution Stone',
      price: 2000,
      description: 'Used to evolve specific branches of Pokémon.',
      type: 'item'
    },
    {
      id: 'big-root',
      name: 'Big Root',
      price: 2000,
      description: 'Increases the amount of HP recovered by draining moves.',
      type: 'held'
    },
    {
      id: 'shed-shell',
      name: 'Shed Shell',
      price: 2000,
      description:
        'Guarantees the holder can switch out, ignoring Shadow Tag or Arena Trap.',
      type: 'held'
    },
    {
      id: 'utility-umbrella',
      name: 'Utility Umbrella',
      price: 2000,
      description: 'Shields the holder from the effects of Rain and Sun.',
      type: 'held'
    },
    {
      id: 'blunder-policy',
      name: 'Blunder Policy',
      price: 2000,
      description:
        "Sharply boosts Speed if the user's move misses due to accuracy.",
      type: 'held'
    },
    {
      id: 'terrain-extender',
      name: 'Terrain Extender',
      price: 2000,
      description: 'Extends active terrain duration from 5 to 8 turns.',
      type: 'held'
    },
    {
      id: 'weather-stone',
      name: 'Weather Stone',
      price: 2000,
      description:
        'Extends weather condition durations (Heat/Damp/Smooth/Icy Rock) to 8 turns.',
      type: 'held'
    },
    {
      id: 'sitrus-berry',
      name: 'Sitrus Berry',
      price: 2000,
      description: 'Restores 25% of max HP when health drops below 50%.',
      type: 'held'
    },
    {
      id: 'lum-berry',
      name: 'Lum Berry',
      price: 2000,
      description:
        'Cures any single non-volatile status condition once per battle.',
      type: 'held'
    },
    {
      id: 'custap-berry',
      name: 'Custap Berry',
      price: 2000,
      description:
        'Grants +1 priority to the next move when health is below 25%.',
      type: 'held'
    },
    {
      id: 'standard-bottle-cap',
      name: 'Standard Bottle Cap',
      price: 2000,
      description: 'Maxes out a single IV stat for a level 100 Pokémon.',
      type: 'item'
    },
    {
      id: 'berry-juice',
      name: 'Berry Juice',
      price: 1500,
      description: 'Restores 20 HP. Highly favored in Little Cup formats.',
      type: 'held'
    },
    {
      id: 'adrenaline-orb',
      name: 'Adrenaline Orb',
      price: 1500,
      description: 'Boosts Speed by +1 stage when intimidated by the opponent.',
      type: 'held'
    },
    {
      id: 'room-service',
      name: 'Room Service',
      price: 1500,
      description: 'Lowers Speed by -1 stage when Trick Room is activated.',
      type: 'held'
    },
    {
      id: 'type-resist-berry',
      name: 'Type-Resist Berry',
      price: 1000,
      description: 'Halves the damage of a single super-effective hit.',
      type: 'held'
    },
    {
      id: 'terrain-seed',
      name: 'Terrain Seed',
      price: 1000,
      description:
        'Consumes upon entry into terrain to boost Defense or Special Defense.',
      type: 'held'
    },
    {
      id: 'heart-scale',
      name: 'Heart Scale',
      price: 1000,
      description:
        'Used as currency for a Pokémon to remember a forgotten move.',
      type: 'item'
    },
    {
      id: 'oran-berry',
      name: 'Oran Berry',
      price: 500,
      description: 'Restores 10 HP when health drops below 50%.',
      type: 'held'
    },
    {
      id: 'rawst-berry',
      name: 'Rawst Berry',
      price: 500,
      description: 'Automatically cures the holder of a burn once per battle.',
      type: 'held'
    },
    {
      id: 'pecha-berry',
      name: 'Pecha Berry',
      price: 500,
      description: 'Automatically cures the holder of poison once per battle.',
      type: 'held'
    },
    {
      id: 'aspear-berry',
      name: 'Aspear Berry',
      price: 500,
      description:
        'Automatically cures the holder of being frozen once per battle.',
      type: 'held'
    },
    {
      id: 'chesto-berry',
      name: 'Chesto Berry',
      price: 500,
      description: 'Automatically cures sleep. Classic combo with Rest.',
      type: 'held'
    },
    {
      id: 'cheri-berry',
      name: 'Cheri Berry',
      price: 500,
      description:
        'Automatically cures the holder of paralysis once per battle.',
      type: 'held'
    },
    {
      id: 'sticky-barb',
      name: 'Sticky Barb',
      price: 500,
      description:
        'Deals chip damage and transfers to an attacker upon physical contact.',
      type: 'held'
    },
    {
      id: 'iron-ball',
      name: 'Iron Ball',
      price: 500,
      description:
        'Halves Speed and removes Ground immunity. Good for slow pivots or Trick.',
      type: 'held'
    },
    {
      id: 'lagging-tail',
      name: 'Lagging Tail',
      price: 500,
      description: 'Forces the user to move last in their priority bracket.',
      type: 'held'
    },
    {
      id: 'focus-band',
      name: 'Focus Band',
      price: 500,
      description: 'Has a 10% chance to miraculously survive a lethal hit.',
      type: 'held'
    },
    {
      id: 'nature-mint',
      name: 'Nature Mint',
      price: 3000,
      description: "Overrides a Pokémon's stats to match a specific nature.",
      type: 'item'
    },
    {
      id: 'vitamin',
      name: 'Vitamin',
      price: 400,
      description: 'Raises a specific Effort Value (EV) by 14 points.',
      type: 'item'
    }
  ]

  const specialEncounters = [
    {
      id: 'route-4-magikarp',
      name: 'Route 4 Magikarp',
      pokemon: 'magikarp',
      price: 1000,
      description:
        'A special Magikarp sold by a suspicious salesman near Route 4.',
      requirement: 'acetrainer1', // ID of Ace Trainer on Route 4
      type: 'encounter'
    }
  ]

  let gameStore,
    rawData,
    boxData = [],
    money = 0,
    inventory = {}
  const { getPkmns } = getContext('game')
  let loading = true

  onMount(() => {
    const [, , id] = readdata()
    gameStore = getGameStore(id)
    gameStore.subscribe(
      read(async (data) => {
        rawData = data
        money = data.__money || 0
        inventory = data.__items || {}

        const box = readBox(data)
        const e = await getPkmns(box.map((p) => p.pokemon))
        boxData = box.map((p) => ({ ...p, details: e[p.pokemon] }))
        loading = false
      })
    )
  })

  const buyRareCandy = (monId, currentLevel) => {
    if (money < 500) return window.alert('Not enough money!')
    if (!window.confirm('Buy Rare Candy for $500?')) return

    gameStore.update(
      patch({
        __money: money - 500,
        [monId]: { ...rawData[monId], level: (currentLevel || 0) + 1 }
      })
    )
  }

  import TypePicker from '$lib/components/TypePicker.svelte'
  const { open } = getContext('simple-modal')

  const buyItem = (item) => {
    if (money < item.price) return window.alert('Not enough money!')

    if (item.id === 'type-gem' || item.id === 'z-crystal') {
      open(TypePicker, {
        title: `Select ${item.name} Type`,
        onSelect: (type) => {
          const typeId = type.toLowerCase()
          const finalId = item.id === 'type-gem' ? `${typeId}-gem` : `${typeId}ium-z`
          const finalName = item.id === 'type-gem' ? `${type} Gem` : `${type}ium Z`
          
          if (window.confirm(`Buy ${finalName} for $${item.price}?`)) {
            gameStore.update(
              patch({
                __money: money - item.price,
                __items: {
                  ...(rawData.__items || {}),
                  [finalId]: (rawData.__items?.[finalId] || 0) + 1
                }
              })
            )
          }
        }
      }, {
        closeButton: true,
        styleWindow: { background: 'transparent' }
      })
      return
    }

    if (!window.confirm(`Buy ${item.name} for $${item.price}?`)) return

    if (item.id === 'encounter-token') {
      gameStore.update(
        patch({
          __money: money - item.price,
          __encounterTokens: (rawData.__encounterTokens || 0) + 1
        })
      )
      return
    }

    gameStore.update(
      patch({
        __money: money - item.price,
        __items: {
          ...(rawData.__items || {}),
          [item.id]: (rawData.__items?.[item.id] || 0) + 1
        }
      })
    )
  }

  const buyPokemon = (item) => {
    if (money < item.price) return window.alert('Not enough money!')
    if (!window.confirm(`Buy ${item.name} for $${item.price}?`)) return

    const location = `Store: ${item.name}`
    gameStore.update(
      patch({
        __money: money - item.price,
        [location]: {
          pokemon: item.pokemon,
          location: location,
          status: 1 // Caught
        }
      })
    )
  }

  const getItemImage = (id) => {
    const mapping = {
      'encounter-token': 'pass',
      'tera-orb': 'enigma-stone',
      'z-crystal': 'normalium-z',
      'mega-stone': 'key-stone',
      'type-gem': 'normal-gem',
      'tm-earthquake': 'ground-tm',
      'tm-u-turn': 'bug-tm',
      'tm-volt-switch': 'electric-tm',
      'tm-flip-turn': 'water-tm',
      'tm-flare-blitz': 'fire-tm',
      'tm-close-combat': 'fighting-tm',
      'tm-brave-bird': 'flying-tm',
      'tm-knock-off': 'dark-tm',
      'tier-1-tms': 'normal-tm',
      'tier-2-tms': 'normal-tm',
      'tier-3-tms': 'normal-tm',
      'evolution-stone': 'everstone',
      'weather-stone': 'smooth-rock',
      'type-resist-berry': 'enigma-berry',
      'terrain-seed': 'grassy-seed',
      'standard-bottle-cap': 'bottle-cap',
      'nature-mint': 'neutral-mint',
      'vitamin': 'hp-up',
      'move-tutor-access': 'heart-scale'
    }

    const name = mapping[id] || id
    return `/assets/img/items/${name}.png`
  }

  const heldItems = storeItems.filter((item) => item.type === 'held')
  const keyItems = storeItems.filter((item) => item.type === 'key-item')
  const tms = storeItems.filter((item) => item.type === 'tm')
  const generalItems = storeItems.filter((item) => ['item', 'service', 'special'].includes(item.type) && item.id !== 'encounter-token')
</script>

<div class="container mx-auto max-w-4xl p-4 pt-8 pb-32 md:pt-16">
  <div class="mb-8 rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
    <div class="mb-8 flex items-center justify-between">
      <h1 class="inline-flex items-center gap-x-4 text-3xl font-bold">
        <Icon icon={Gift} inline class="scale-125 transform" /> Store
      </h1>
      <div
        class="text-2xl font-bold tracking-wider text-lime-600 dark:text-lime-400"
      >
        ${money.toLocaleString()}
      </div>
    </div>

    <div class="grid gap-6">
      <!-- Encounter Token -->
      <div
        class="flex flex-col justify-between rounded-lg border-2 border-gray-200 p-6 dark:border-gray-700 bg-lime-50/20 dark:bg-lime-900/10"
      >
        <div class="flex gap-x-4">
          <div class="shrink-0">
            <img
              src={getItemImage('encounter-token')}
              alt="Token"
              class="h-12 w-12 object-contain"
              on:error={(e) => (e.target.src = '/assets/img/items/pass.png')}
            />
          </div>
          <div>
            <h2 class="mb-2 text-xl font-bold">Extra Encounter Token</h2>
            <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Buy an extra encounter slot for any route. You currently have <strong
                class="text-lg text-lime-500"
                >{rawData?.__encounterTokens || 0}</strong
              > tokens.
            </p>
          </div>
        </div>
        <Button
          class="w-full"
          solid
          rounded
          on:click={() => buyItem(storeItems[0])}
        >
          Buy for $500
        </Button>
      </div>

      <p class="text-gray-500 text-center italic text-sm">Select an item category below to browse the shop.</p>
    </div>
  </div>

  {#if keyItems.length}
    <div class="mb-8 rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
      <h2 class="mb-2 text-2xl font-bold">Key Items & Mechanics</h2>
      <p class="mb-6 text-sm text-gray-600 dark:text-gray-400">
        Unlock powerful multi-battle mechanics and permanent team upgrades.
      </p>

      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {#each keyItems as item}
          <div class="flex flex-col gap-y-3 rounded-lg border-2 border-gray-200 p-4 dark:border-gray-700">
            <div class="flex items-start justify-between gap-x-3">
              <div class="flex gap-x-3">
                <div class="shrink-0 pt-1">
                  <img src={getItemImage(item.id)} alt={item.name} class="h-10 w-10 object-contain" on:error={(e) => (e.target.src = '/assets/img/items/unknown-item.png')} />
                </div>
                <div>
                  <h3 class="font-bold">{item.name}</h3>
                  <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                </div>
              </div>
              <div class="shrink-0 text-right">
                <div class="font-bold text-lime-600 dark:text-lime-400">${item.price.toLocaleString()}</div>
                <div class="text-xs text-gray-500">Owned: {inventory[item.id] || 0}</div>
              </div>
            </div>
            <Button class="w-full" rounded on:click={() => buyItem(item)}>Buy {item.name}</Button>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <div class="mb-8 rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
    <h2 class="mb-2 text-2xl font-bold">Competitive Held Items</h2>
    <p class="mb-6 text-sm text-gray-600 dark:text-gray-400">
      Build out your team options with reusable battle items instead of consumables.
    </p>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {#each heldItems as item}
        <div class="flex flex-col gap-y-3 rounded-lg border-2 border-gray-200 p-4 dark:border-gray-700">
          <div class="flex items-start justify-between gap-x-3">
            <div class="flex gap-x-3">
              <div class="shrink-0 pt-1">
                <img src={getItemImage(item.id)} alt={item.name} class="h-10 w-10 object-contain" on:error={(e) => (e.target.src = '/assets/img/items/unknown-item.png')} />
              </div>
              <div>
                <h3 class="font-bold">{item.name}</h3>
                <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
              </div>
            </div>
            <div class="shrink-0 text-right">
              <div class="font-bold text-lime-600 dark:text-lime-400">${item.price.toLocaleString()}</div>
              <div class="text-xs text-gray-500">Owned: {inventory[item.id] || 0}</div>
            </div>
          </div>
          <Button class="w-full" rounded on:click={() => buyItem(item)}>Buy {item.name}</Button>
        </div>
      {/each}
    </div>
  </div>

  {#if tms.length}
    <div class="mb-8 rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
      <h2 class="mb-2 text-2xl font-bold">Technical Machines (TMs)</h2>
      <p class="mb-6 text-sm text-gray-600 dark:text-gray-400">
        Expand your movepool with tiered access to high-power and utility moves.
      </p>

      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {#each tms as item}
          <div class="flex flex-col gap-y-3 rounded-lg border-2 border-gray-200 p-4 dark:border-gray-700">
            <div class="flex items-start justify-between gap-x-3">
              <div class="flex gap-x-3">
                <div class="shrink-0 pt-1">
                  <img src={getItemImage(item.id)} alt={item.name} class="h-10 w-10 object-contain" on:error={(e) => (e.target.src = '/assets/img/items/normal-tm.png')} />
                </div>
                <div>
                  <h3 class="font-bold">{item.name}</h3>
                  <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                </div>
              </div>
              <div class="shrink-0 text-right">
                <div class="font-bold text-lime-600 dark:text-lime-400">${item.price.toLocaleString()}</div>
                <div class="text-xs text-gray-500">Owned: {inventory[item.id] || 0}</div>
              </div>
            </div>
            <Button class="w-full" rounded on:click={() => buyItem(item)}>Buy {item.name}</Button>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  {#if generalItems.length}
    <div class="mb-8 rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
      <h2 class="mb-2 text-2xl font-bold">Items & Services</h2>
      <p class="mb-6 text-sm text-gray-600 dark:text-gray-400">
        Consumables, evolutionary tools, and professional trainer services.
      </p>

      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {#each generalItems as item}
          <div class="flex flex-col gap-y-3 rounded-lg border-2 border-gray-200 p-4 dark:border-gray-700">
            <div class="flex items-start justify-between gap-x-3">
              <div class="flex gap-x-3">
                <div class="shrink-0 pt-1">
                  <img src={getItemImage(item.id)} alt={item.name} class="h-10 w-10 object-contain" on:error={(e) => (e.target.src = '/assets/img/items/unknown-item.png')} />
                </div>
                <div>
                  <h3 class="font-bold">{item.name}</h3>
                  <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                </div>
              </div>
              <div class="shrink-0 text-right">
                <div class="font-bold text-lime-600 dark:text-lime-400">${item.price.toLocaleString()}</div>
                <div class="text-xs text-gray-500">Owned: {inventory[item.id] || 0}</div>
              </div>
            </div>
            <Button class="w-full" rounded on:click={() => buyItem(item)}>Buy {item.name}</Button>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  {#if specialEncounters.some((e) => rawData?.__teams?.includes(e.requirement))}
    <div class="mb-8 rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
      <h2 class="mb-2 text-2xl font-bold text-orange-500">
        Special Encounters
      </h2>
      <p class="mb-6 text-sm text-gray-600 dark:text-gray-400">
        Unique opportunities to expand your team from world vendors.
      </p>

      <div class="grid gap-4 sm:grid-cols-2">
        {#each specialEncounters.filter( (e) => rawData?.__teams?.includes(e.requirement) ) as item}
          {@const owned = !!rawData?.[`Store: ${item.name}`]}
          <div
            class="flex flex-col gap-y-3 rounded-lg border-2 border-gray-200 p-4 dark:border-gray-700 {owned
              ? 'opacity-50 grayscale'
              : ''}"
          >
            <div class="flex items-start justify-between gap-x-3">
              <div class="flex gap-x-3">
                <PIcon name={item.pokemon} className="-my-2" />
                <div>
                  <h3 class="font-bold">{item.name}</h3>
                  <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
              </div>
              <div class="shrink-0 text-right">
                <div class="font-bold text-lime-600 dark:text-lime-400">
                  ${item.price.toLocaleString()}
                </div>
                {#if owned}
                  <div class="text-xs font-bold uppercase text-orange-500">
                    Sold Out
                  </div>
                {/if}
              </div>
            </div>

            <Button
              class="w-full"
              rounded
              disabled={owned}
              on:click={() => buyPokemon(item)}
            >
              {owned ? 'Purchased' : `Purchase ${item.name}`}
            </Button>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
