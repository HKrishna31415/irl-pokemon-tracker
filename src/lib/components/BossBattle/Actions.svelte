<script>
  export let badge, name, team

  import { onMount, createEventDispatcher } from 'svelte'
  import { Button, PIcon } from '$c/core'
  import { toList, regionise, capitalise } from '$lib/utils/string'
  import deferStyles from '$lib/utils/defer-styles'

  const dispatch = createEventDispatcher()
  onMount(async () => {
    deferStyles('/assets/badges.css')
  })

  function format(poke) {
    const nickname = poke.original.nickname

    return (
      (nickname ? nickname + ' the ' : '') +
      regionise(capitalise(poke.original.pokemon))
    )
  }

  const ontoggle = (_) => dispatch('toggle')
  const oncomplete = (_) => dispatch('complete')

  const exportToShowdown = async () => {
    const showdownTeam = await Promise.all(
      team.map(async (p) => {
        const nickname = p.original.nickname
          ? `${p.original.nickname} (${capitalise(p.alias)})`
          : capitalise(p.alias)
        const item = '' // Item tracking not currently implemented for player
        const ability = p.original.ability || 'Unknown Ability'
        const level = p.original.level || 50
        const nature = p.original.nature || 'Serious'
        const ivs = p.original.ivs || {
          hp: 31,
          atk: 31,
          def: 31,
          spa: 31,
          spd: 31,
          spe: 31
        }

        let moves = ['Move 1', 'Move 2', 'Move 3', 'Move 4']
        try {
          const res = await fetch(`/assets/data/learnsets/${p.alias}.json`)
          const ls = await res.json()
          if (ls && ls.learnset) {
            const possibleMoves = Object.entries(ls.learnset)
              .map(([move, sources]) => {
                const lvlSource = sources.find((s) => s.startsWith('8L'))
                if (!lvlSource) return null
                const lvl = parseInt(lvlSource.replace('8L', ''))
                return { move, lvl }
              })
              .filter((m) => m && m.lvl <= level)
              .sort((a, b) => b.lvl - a.lvl)

            moves = possibleMoves
              .slice(0, 4)
              .map((m) => capitalise(m.move.replace(/-/g, ' ')))
            while (moves.length < 4) moves.push(`Move ${moves.length + 1}`)
          }
        } catch (e) {
          console.warn(`Could not fetch learnset for ${p.alias}`)
        }

        return `${nickname}${item ? ' @ ' + item : ''}
Ability: ${ability}
Level: ${level}
EVs: 0 HP / 0 Atk / 0 Def / 0 SpA / 0 SpD / 0 Spe
${capitalise(nature)} Nature
IVs: ${ivs.hp} HP / ${ivs.atk} Atk / ${ivs.def} Def / ${ivs.spa} SpA / ${ivs.spd} SpD / ${ivs.spe} Spe
- ${moves[0]}
- ${moves[1]}
- ${moves[2]}
- ${moves[3]}`
      })
    )

    navigator.clipboard.writeText(showdownTeam.join('\n\n')).then(() => {
      alert('Team exported to clipboard!')
    })
  }
</script>

<div
  class="order-3 w-full text-right {$$restProps.class ||
    ''} items-end md:flex md:flex-col"
>
  <p
    class:hidden={!team.length}
    class="text-center text-xs italic opacity-50 md:w-[360px] md:text-right"
  >
    {#if badge}
      Mark <b>{name}</b> as <b>defeated</b> and claim their badge
    {:else}
      Mark <b>{name}</b> as <b>defeated</b>
    {/if}
    with your team of {toList(team.map(format))}
  </p>

  <div class="my-4 flex justify-center gap-x-2 md:justify-end">
    <Button on:click={ontoggle} class="!py-1 text-xs" rounded>
      <slot name="switch-text" />
    </Button>

    <Button
      disabled={!team.length}
      on:click={oncomplete}
      class="claim !py-1 text-xs"
      solid
      rounded
    >
      {#if badge}
        Claim badge
        <PIcon class="coin -mt-3 md:ml-2" type="b" name={badge} />
      {:else}
        Mark victory
      {/if}
    </Button>
    <Button on:click={exportToShowdown} class="!py-1 text-xs" rounded>
      Showdown
    </Button>
  </div>
</div>
