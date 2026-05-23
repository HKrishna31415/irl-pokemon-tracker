<script>
  export let name = 'unknown-pokemon2',
    className = '',
    type = 'm',
    lazy = false

  let imgError = false

  const itemMap = {
    boosterenergy: 'booster-energy',
    clearamulet: 'clear-amulet',
    covertcloak: 'covert-cloak',
    loadeddice: 'loaded-dice',
    lustrousglobe: 'lustrous-globe',
    mirrorherb: 'mirror-herb',
    punchingglove: 'punching-glove',
    'punching-gloves': 'punching-glove',
    wideglasses: 'wise-glasses',
    'wide-glasses': 'wise-glasses'
  }

  const normalize = (value = '') =>
    String(value || 'unknown-pokemon2')
    .toLowerCase()
    .replace(/\.(png|webp)$/i, '')
    .replace(/[':]/g, '')
    .replace(/\./g, '')
    .replace(/\s+/g, '-')

  const formMarkerPattern =
    /-(mega(?:-[xy])?|gmax|totem|alola(?:-totem)?|galar(?:-zen)?|hisui|paldea(?:-(?:aqua|blaze|combat))?|origin|hero|crowned|therian|incarnate|sky|white|black|dusk|dawn|blade|shield|school|solo|sunny|rainy|snowy|red|blue|white-striped|female|male|f|m|x|y)$/i

  const compactFormSuffixes = [
    'megax',
    'megay',
    'mega',
    'gmax',
    'alolatotem',
    'alola',
    'galarzen',
    'galar',
    'hisui',
    'paldeaaqua',
    'paldeablaze',
    'paldeacombat',
    'paldea',
    'origin',
    'hero',
    'crowned',
    'therian',
    'incarnate',
    'sky',
    'white',
    'black',
    'dusk',
    'dawn',
    'blade',
    'shield',
    'school',
    'solo',
    'red',
    'blue',
    'whitestriped',
    'female',
    'male'
  ]

  const baseSlugFor = (value = '') => {
    const normalized = normalize(value)
    const hyphenBase = normalized.replace(formMarkerPattern, '')
    if (hyphenBase !== normalized) return hyphenBase

    const compact = normalized.replace(/-/g, '')
    const suffix = compactFormSuffixes.find((ending) => compact.endsWith(ending) && compact.length > ending.length)
    return suffix ? compact.slice(0, -suffix.length) : normalized
  }

  $: slug = normalize(name)
  $: itemSlug = itemMap[slug] || slug
  $: baseSlug = baseSlugFor(name)
</script>

<span class="pk{type}-wrapper {$$restProps.class || ''} {className}">
  {#if type === 'item' && !imgError}
    <img
      src="/assets/img/items/{itemSlug}.png"
      alt={name}
      loading={lazy ? 'lazy' : 'eager'}
      class="h-full w-full object-contain"
      on:error={() => (imgError = true)}
    />
  {:else if type === 'm'}
    <img
      src="/assets/img/pokemon/base-{slug}.png"
      alt={name}
      loading={lazy ? 'lazy' : 'eager'}
      class="h-full w-full object-contain"
      on:error={(event) => {
        const target = event.currentTarget
        if (baseSlug && baseSlug !== slug && !target.dataset.baseFallback) {
          target.dataset.baseFallback = 'true'
          target.src = `/assets/img/pokemon/base-${baseSlug}.png`
          return
        }
        target.onerror = null
        target.src = 'https://img.nuzlocke.app/sprites/unown.png?v=1'
      }}
    />
  {:else}
    <i
      class:pkm-sevii={name?.includes('sevii')}
      class:pkm-hoennian={name?.includes('-hoenn')}
      class="pk{type} pk{type}-{name}"
    />
  {/if}
  <slot />
</span>
