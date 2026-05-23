<script>
  import EncounterDex from '$lib/components/EncounterDex.svelte'
  import { Hero } from '$c/Guide'

  export let data
</script>

<svelte:head>
  <title>Run Tracker | Pokémon Dex</title>
  <meta
    name="description"
    content="Search the Kanto IRL National Dex, supported forms, Smogon tier tags, Mega forms, and BST ranges."
  />
</svelte:head>

<Hero theme={['#111827', '#65a30d', '#f8fafc']}>
  <svelte:fragment slot="hero">
    <div>
      <small>Run Tracker</small>
      <h1>Pokémon Dex</h1>
    </div>
  </svelte:fragment>
</Hero>

<main class="mx-auto max-w-7xl px-4 pb-24 md:px-8">
  <EncounterDex title="National Dex" route={data.route} leagueData={data.leagueData} showAvailability />
</main>
