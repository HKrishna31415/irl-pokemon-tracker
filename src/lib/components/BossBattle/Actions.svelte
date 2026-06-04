<script>
  export let badge, name, team, pokemon = []

  import { onMount, createEventDispatcher } from 'svelte'
  import { Button, PIcon } from '$c/core'
  import { toList, regionise, capitalise } from '$lib/utils/string'
  import deferStyles from '$lib/utils/defer-styles'
  import { buildShowdownTeam } from '$lib/utils/showdown'

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

  const copyShowdown = (text, label) => {
    navigator.clipboard.writeText(text).then(
      () => alert(`${label} exported to clipboard!`),
      () => alert(`${label} export is ready, but clipboard access was blocked.`)
    )
  }

  const exportOpponentToShowdown = () =>
    copyShowdown(buildShowdownTeam(pokemon), `${name}'s team`)

  const exportMyTeamToShowdown = () => {
    const playerTeam = team.map((p) => ({
      ...p.original,
      name: p.original?.pokemon || p.name || p.alias,
      moves: p.original?.moves || []
    }))
    copyShowdown(buildShowdownTeam(playerTeam), 'Your team')
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
    <Button on:click={exportOpponentToShowdown} class="!py-1 text-xs" rounded>
      Export Opponent
    </Button>
    <Button disabled={!team.length} on:click={exportMyTeamToShowdown} class="!py-1 text-xs" rounded>
      Export My Team
    </Button>
  </div>
</div>
