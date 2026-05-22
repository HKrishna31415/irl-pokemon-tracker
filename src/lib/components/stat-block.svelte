<script>
  export let max,
    atk,
    def,
    spd,
    spa,
    spe,
    hp,
    col = '',
    nature = [],
    compare,
    side = 'right',
    shorthand = true,
    showbars = true,
    detailed = false,
    level = '',
    ivs = {},
    evs = {}

  import StatBar from '$lib/components/stat-bar.svelte'
  import NaturesMap from '$lib/data/natures'

  const statMap = {
    hp: 'HP',
    atk: 'Attack',
    def: 'Defense',
    spa: 'Sp. Attack',
    spd: 'Sp. Defense',
    spe: 'Speed'
  }

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
  const toStat = (value) => {
    const stat = Number(value)
    return Number.isFinite(stat) ? stat : 0
  }
  const statKeys = ['hp', 'atk', 'def', 'spa', 'spd', 'spe']
  const toOptionalNumber = (value) => {
    const number = Number(value)
    return Number.isFinite(number) ? number : null
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
  const statColor = (value) => {
    if (value > 200) return mix('#02FFFF', '#91FFFF', clamp((value - 200) / 55, 0, 1))
    if (value > 180) return mix('#91FFE5', '#02FFFF', (value - 180) / 20)
    if (value >= 120) return '#56d364'
    if (value >= 100) return '#a3e635'
    if (value >= 80) return '#facc15'
    if (value >= 50) return '#fb923c'
    return '#f43f5e'
  }
  const levelNumber = (value) => {
    const match = String(value ?? '').match(/\d+/)
    if (!match) return null
    const number = Number(match[0])
    return Number.isFinite(number) ? clamp(number, 1, 100) : null
  }
  const ivFor = (stat) => clamp(toOptionalNumber(ivs?.[stat]) ?? 31, 0, 31)
  const evFor = (stat) => clamp(toOptionalNumber(evs?.[stat]) ?? 0, 0, 252)
  const finalStat = (stat, base, lvl) => {
    if (!lvl || !base) return null

    const iv = ivFor(stat)
    const ev = evFor(stat)
    const raw = Math.floor(((2 * base + iv + Math.floor(ev / 4)) * lvl) / 100)
    if (stat === 'hp') return raw + lvl + 10

    const mod = stat === pos ? 1.1 : stat === neg ? 0.9 : 1
    return Math.floor((raw + 5) * mod)
  }

  $: [pos, neg] = NaturesMap[String(nature || '').toLowerCase()] || []
  $: stats = {
    hp: toStat(hp),
    atk: toStat(atk),
    def: toStat(def),
    spa: toStat(spa),
    spd: toStat(spd),
    spe: toStat(spe)
  }
  $: total = Object.values(stats).reduce((acc, it) => acc + it, 0)
  $: safeMax = Math.max(1, toStat(max) || Math.max(...Object.values(stats), 1))
  $: lvl = levelNumber(level)
  $: rows = statKeys.map((key) => {
    const base = stats[key]
    const ev = evFor(key)
    const iv = ivFor(key)
    return {
      key,
      label: shorthand ? key : statMap[key],
      longLabel: statMap[key],
      base,
      ev,
      iv,
      baseWidth: clamp((100 * base) / safeMax, 0, 100),
      evWidth: clamp((100 * ev) / 252, 0, 100),
      ivWidth: clamp((100 * iv) / 31, 0, 100),
      color: statColor(base),
      mod: key === pos ? 1.1 : key === neg ? 0.9 : 1
    }
  })
</script>

<div
  style="--t-col: {col}"
  class="stat-block relative min-w-0 {$$restProps.class ||
    ''}"
>
  <span
    class="absolute top-0 z-40 -translate-y-1/2 {side === 'right'
      ? '-'
      : ''}translate-x-1/2 {side}-2"
  >
    <b class="-ml-2 py-1 pl-2 pr-2.5">{total}</b>
  </span>

  {#if showbars && detailed}
    <div class="stat-table" role="table" aria-label="Pokemon stat details">
      <div class="stat-meta">
        {#if level}
          <span>Level {level}</span>
        {/if}
        {#if nature}
          <span class="nature">{nature}</span>
        {/if}
      </div>
      <div class="stat-head" role="row">
        <span></span>
        <span>Base</span>
        <span>EVs</span>
        <span>IVs</span>
      </div>
      {#each rows as row}
        <div class="stat-row" role="row">
          <span class="detail-label" class:pos={row.mod > 1} class:neg={row.mod < 1}>
            {row.longLabel}
          </span>
          <span class="base-cell">
            <strong>{row.base}</strong>
            <span class="detail-track">
              <span
                class="detail-fill"
                style="width: {row.baseWidth}%; --detail-col: {row.color}"
              />
            </span>
          </span>
          <span class="range-cell" class:empty={!row.ev}>
            {row.ev || '-'}
          </span>
          <span class="range-cell">
            {row.iv}
          </span>
        </div>
      {/each}
    </div>
  {:else if showbars}
    {#each Object.entries(stats) as [s, sval]}
      <StatBar
        className={compare && sval <= compare[s] ? 'grayscale opacity-25' : ''}
        mod={s === pos ? 1.1 : s === neg ? 0.9 : 1}
        stat={shorthand ? s : statMap[s]}
        val={sval}
        iv={ivs[s]}
        ev={evs[s]}
        {max}
      />
    {/each}
  {/if}
</div>

<style lang="postcss">
  b {
    z-index: 5;
    position: relative;
  }

  :global(.dark) b::after {
    background-color: theme('colors.gray.900');
  }

  :global(.dark) b::before {
    background-color: theme('colors.gray.900');
  }

  b::after {
    content: '';
    background-color: white;
    position: absolute;
    top: 0;
    height: 100%;
    width: 100%;
    left: 0;
    border-radius: 6px;
    z-index: -5;
    border: 2px solid var(--t-col);
  }

  b::before {
    content: '';
    background-color: white;
    position: absolute;
    top: -1px;
    transform: translateY(calc(100% - 1px));
    left: -2px;
    right: 2px;
    width: calc(100% + 4px);
    height: calc(50% + 2px);
    z-index: -2;
  }

  .stat-block {
    display: grid;
    grid-template-columns: minmax(2rem, auto) minmax(2.75rem, auto) minmax(6rem, 1fr);
    align-items: center;
    column-gap: 0.5rem;
    row-gap: 0.625rem;
  }

  .stat-block:has(.stat-table) {
    display: block;
    overflow-x: visible;
  }

  .stat-table {
    width: 100%;
    display: grid;
    gap: 0.3rem;
    padding-top: 0.25rem;
  }

  .stat-head,
  .stat-row {
    display: grid;
    grid-template-columns: minmax(4.25rem, 0.85fr) minmax(5.75rem, 1.25fr) minmax(1.8rem, 0.35fr) minmax(1.8rem, 0.35fr);
    align-items: center;
    column-gap: 0.35rem;
  }

  .stat-meta {
    display: flex;
    min-height: 0.875rem;
    align-items: center;
    gap: 0.4rem;
    color: theme('colors.gray.500');
    font-size: 0.58rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    line-height: 1;
    text-transform: uppercase;
  }

  :global(.dark) .stat-meta {
    color: theme('colors.gray.500');
  }

  .stat-meta .nature {
    opacity: 0.75;
  }

  .stat-head {
    color: theme('colors.gray.500');
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  :global(.dark) .stat-head {
    color: theme('colors.gray.400');
  }

  .stat-row {
    min-height: 2.15rem;
    border-radius: 0.375rem;
  }

  .detail-label {
    min-width: 0;
    color: theme('colors.gray.700');
    font-size: 0.76rem;
    font-weight: 800;
    white-space: nowrap;
  }

  :global(.dark) .detail-label {
    color: theme('colors.gray.200');
  }

  .base-cell {
    display: grid;
    grid-template-columns: 2.25rem minmax(2.5rem, 1fr);
    align-items: center;
    gap: 0.45rem;
    min-width: 0;
  }

  .base-cell strong {
    color: theme('colors.gray.900');
    font-size: 0.84rem;
    text-align: right;
  }

  :global(.dark) .base-cell strong {
    color: theme('colors.gray.50');
  }

  .detail-track {
    position: relative;
    display: block;
    height: 0.42rem;
    min-width: 0;
    overflow: hidden;
    border-radius: 999px;
    background: theme('colors.gray.200');
    box-shadow: inset 0 0 0 1px rgb(0 0 0 / 0.06);
  }

  :global(.dark) .detail-track {
    background: theme('colors.gray.800');
    box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.08);
  }

  .detail-fill {
    display: block;
    height: 100%;
    border-radius: inherit;
  }

  .detail-fill {
    background: var(--detail-col);
  }

  .range-cell {
    color: theme('colors.gray.700');
    font-size: 0.76rem;
    font-weight: 700;
    text-align: center;
  }

  :global(.dark) .range-cell {
    color: theme('colors.gray.200');
  }

  .pos { color: theme('colors.orange.600'); }
  .neg { color: theme('colors.blue.500'); }
  :global(.dark) .pos { color: theme('colors.orange.300'); }
  :global(.dark) .neg { color: theme('colors.blue.300'); }

  @media (max-width: 520px) {
    .stat-head,
    .stat-row {
      grid-template-columns: minmax(3.2rem, 0.8fr) minmax(5.5rem, 1.2fr) minmax(2rem, 0.35fr) minmax(2rem, 0.35fr);
      column-gap: 0.35rem;
    }

    .stat-head {
      font-size: 0.62rem;
    }

    .detail-label,
    .range-cell {
      font-size: 0.72rem;
    }

    .base-cell {
      grid-template-columns: 2rem minmax(2.4rem, 1fr);
      gap: 0.4rem;
    }

    .base-cell strong {
      font-size: 0.78rem;
    }
  }
</style>
