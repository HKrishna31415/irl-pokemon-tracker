<script>
</script>

<footer class={$$restProps.class || ''}>
  All content & design © Pokémon Run Tracker, 2021-{(new Date()).getFullYear()}. <a href='/privacy-policy'>Privacy Policy</a>. <a href='/credit'>Credits</a>.
  <br class='hidden md:block' />
  Pokémon images & names © 1995-2024 Nintendo/Creatures Inc./GAME FREAK inc. TM
</footer>

<!-- svelte-ignore css-unused-selector -->
<style>
  footer { @apply text-center w-full absolute bottom-4 md:bottom-2 sm:my-6 px-4 text-tiny md:text-xs text-gray-500 dark:text-gray-400 leading-3 z-20 h-max; }
  footer a { @apply transition-colors; }
  footer a:hover, { @apply text-black }
  :global(.dark) footer a:hover { @apply text-white }
</style>
