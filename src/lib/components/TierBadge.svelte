<script>
  export let tier = 'Untiered'

  const colors = {
    AG: 'bg-rose-500/15 text-rose-600 ring-rose-500/30 dark:text-rose-300',
    Uber: 'bg-red-500/15 text-red-600 ring-red-500/30 dark:text-red-300',
    OU: 'bg-orange-500/15 text-orange-600 ring-orange-500/30 dark:text-orange-300',
    UUBL: 'bg-amber-500/15 text-amber-600 ring-amber-500/30 dark:text-amber-300',
    UU: 'bg-yellow-500/15 text-yellow-700 ring-yellow-500/30 dark:text-yellow-300',
    RUBL: 'bg-lime-500/15 text-lime-700 ring-lime-500/30 dark:text-lime-300',
    RU: 'bg-green-500/15 text-green-700 ring-green-500/30 dark:text-green-300',
    NUBL: 'bg-teal-500/15 text-teal-700 ring-teal-500/30 dark:text-teal-300',
    NU: 'bg-cyan-500/15 text-cyan-700 ring-cyan-500/30 dark:text-cyan-300',
    PUBL: 'bg-sky-500/15 text-sky-700 ring-sky-500/30 dark:text-sky-300',
    PU: 'bg-blue-500/15 text-blue-700 ring-blue-500/30 dark:text-blue-300',
    ZU: 'bg-indigo-500/15 text-indigo-700 ring-indigo-500/30 dark:text-indigo-300',
    LC: 'bg-violet-500/15 text-violet-700 ring-violet-500/30 dark:text-violet-300',
    NFE: 'bg-fuchsia-500/15 text-fuchsia-700 ring-fuchsia-500/30 dark:text-fuchsia-300',
    Untiered: 'bg-gray-500/10 text-gray-500 ring-gray-500/20 dark:text-gray-400'
  }

  $: label = tier || 'Untiered'
  $: color = colors[label] || colors.Untiered
</script>

<span
  class="inline-flex h-5 shrink-0 items-center rounded px-1.5 text-[10px] font-black uppercase tracking-normal ring-1 {color}"
>
  {label}
</span>
