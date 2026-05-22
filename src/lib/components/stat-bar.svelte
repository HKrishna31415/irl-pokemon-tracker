<script>
  export let max, stat, val, mod = 1, className = '', iv = undefined, ev = undefined

  import Icon from '@iconify/svelte/dist/OfflineIcon.svelte'
  import { Chevron as Priority } from '$icons'

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
  const toNumber = (value, fallback = 0) => {
    const number = Number(value)
    return Number.isFinite(number) ? number : fallback
  }
  const hex = (value) => value.toString(16).padStart(2, '0')
  const mix = (from, to, amount) => {
    const parse = (color) => color.match(/\w\w/g).map((part) => parseInt(part, 16))
    const [r1, g1, b1] = parse(from)
    const [r2, g2, b2] = parse(to)

    return `#${hex(Math.round(r1 + (r2 - r1) * amount))}${hex(
      Math.round(g1 + (g2 - g1) * amount)
    )}${hex(Math.round(b1 + (b2 - b1) * amount))}`
  }
  const highColor = (value) => {
    if (value <= 180) return '#91FFE5'
    if (value <= 200) return mix('#91FFE5', '#02FFFF', (value - 180) / 20)
    return mix('#02FFFF', '#91FFFF', clamp((value - 200) / 55, 0, 1))
  }

  $: safeVal = toNumber(val)
  $: safeMax = Math.max(1, toNumber(max, safeVal || 1))
  $: barWidth = clamp((100 * safeVal) / safeMax, 0, 100)
  $: c = safeVal > 180
    ? 'high'
    : safeVal < 50
    ? 'poor'
    : safeVal < 80
      ? 'meh'
      : safeVal < 100
        ? 'okay'
        : safeVal < 120
          ? 'good'
          : 'great'
  $: statColor = c === 'high' ? highColor(safeVal) : ''
  $: statRing = c === 'high' ? highColor(Math.max(180, safeVal - 18)) : ''

</script>

<span
  style={statColor ? `--stat-col: ${statColor}; --stat-col-ring: ${statRing}` : ''}
  class='stat-label flex justify-end items-center text-xs text-right {className}'
  class:pos={mod > 1}
  class:neg={mod < 1}
>
    {#if mod !== 1}
      <Icon inline={true} class='fill-current {mod < 1 ? 'transform rotate-180' : ''}' icon={Priority} />
    {/if}
    {stat}
</span>

<span
  style={statColor ? `--stat-col: ${statColor}; --stat-col-ring: ${statRing}` : ''}
  class='stat-value {c} {className} transition font-bold text-xs text-right'
>
    {safeVal}
    <div class="inline-flex flex-col -mb-1 leading-[6px]">
      {#if typeof iv !== 'undefined' && iv > 0}
        <sub class="text-[7px] opacity-60 ml-0.5">IV:{iv}</sub>
      {/if}
      {#if typeof ev !== 'undefined' && ev > 0}
        <sub class="text-[7px] text-blue-500 opacity-80 ml-0.5">EV:{ev}</sub>
      {/if}
    </div>
</span>
<div
  style={statColor ? `--stat-col: ${statColor}; --stat-col-ring: ${statRing}` : ''}
  class="stat-track {className}"
>
  <span style='width: {barWidth}%' class='stat-fill {c} transition h-2 rounded-md ring-2' />
</div>

<style lang="postcss">

  .neg { color: theme('colors.blue.400'); }
  .pos { color: theme('colors.orange.600'); }
  :global(.dark) .neg { color: theme('colors.blue.300'); }
  :global(.dark) .pos { color: theme('colors.orange.300'); }

  .poor { --stat-col: theme('colors.red.300'); --stat-col-ring: theme('colors.red.100'); }
  .meh { --stat-col: theme('colors.orange.300'); --stat-col-ring: theme('colors.orange.100'); }
  .okay { --stat-col: theme('colors.yellow.300'); --stat-col-ring: theme('colors.yellow.100'); }
  .good { --stat-col: theme('colors.lime.300'); --stat-col-ring: theme('colors.lime.100'); }
  .great { --stat-col: theme('colors.green.300'); --stat-col-ring: theme('colors.green.100'); }

  :global(.dark) .great { --stat-col: theme('colors.green.600'); --stat-col-ring: theme('colors.green.400'); }
  :global(.dark) .good { --stat-col: theme('colors.lime.600'); --stat-col-ring: theme('colors.lime.400'); }
  :global(.dark) .okay { --stat-col: theme('colors.yellow.600'); --stat-col-ring: theme('colors.yellow.400'); }
  :global(.dark) .meh { --stat-col: theme('colors.orange.600'); --stat-col-ring: theme('colors.orange.400'); }
  :global(.dark) .poor { --stat-col: theme('colors.red.600'); --stat-col-ring: theme('colors.red.400'); }

  .stat-track {
    min-width: 0;
    height: 0.5rem;
  }

  .stat-fill {
    display: block;
  }

  .stat-fill {
    background-color: var(--stat-col);
    --tw-ring-color: var(--stat-col-ring);
  }

  span { color: var(--stat-col); }
  :global(.dark) span { color: var(--stat-col-ring); }

</style>
