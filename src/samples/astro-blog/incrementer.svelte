<script lang="ts">
  import { count } from "./store";

  function increment() {
    count.update((n) => n + 1);
  }
</script>

<button on:click={increment}> + </button>
