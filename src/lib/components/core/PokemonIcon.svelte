<script>
  export let name = 'unknown-pokemon2',
    className = '',
    type = 'm'

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

  $: slug = normalize(name)
  $: itemSlug = itemMap[slug] || slug
</script>

<span class="pk{type}-wrapper {$$restProps.class || ''} {className}">
  {#if type === 'item' && !imgError}
    <img
      src="/assets/img/items/{itemSlug}.png"
      alt={name}
      class="h-full w-full object-contain"
      on:error={() => (imgError = true)}
    />
  {:else if type === 'm'}
    <img
      src="/assets/img/pokemon/base-{slug}.png"
      alt={name}
      class="h-full w-full object-contain"
      on:error={(event) => {
        event.currentTarget.onerror = null
        event.currentTarget.src = 'https://img.nuzlocke.app/sprites/unown.png?v=1'
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
