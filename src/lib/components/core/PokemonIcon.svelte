<script>
  export let name = 'unknown-pokemon2',
    className = '',
    type = 'm'

  let imgError = false
</script>

<span class="pk{type}-wrapper {$$restProps.class || ''} {className}">
  {#if type === 'item' && !imgError}
    <img
      src="/assets/img/items/{name}.png"
      alt={name}
      class="h-full w-full object-contain"
      on:error={() => (imgError = true)}
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
