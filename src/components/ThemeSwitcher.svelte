<script lang="ts">
  import LightIcon from "@/icons/light.svelte";
  import DarkIcon from "@/icons/dark.svelte";

  let isDark = import.meta.env.SSR
    ? undefined
    : document.documentElement.classList.contains("dark");

  const toggle = () => {
    isDark = !isDark;
    if (isDark) {
      localStorage.setItem("theme", "dark");
      document.documentElement.classList.add("dark");
    } else {
      localStorage.setItem("theme", "light");
      document.documentElement.classList.remove("dark");
    }
  };
</script>

<button type="button" aria-label="switch theme" class="icons" on:click={toggle}>
  <span class="icon light"><LightIcon /></span>
  <span class="icon dark"><DarkIcon /></span>
</button>

<style>
  .icons {
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: space-around;
    gap: 8px;
    padding: 8px;
    margin: 0;
    background-color: var(--nc-bg-3);
    border: 0;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  .icon {
    width: 24px;
    height: 24px;
    color: var(--nc-tx-1);
    transition: color 0.3s ease-in-out;
  }
  :global(:root:not(.dark)) .icon.light {
    color: orangered;
  }
  :global(:root.dark) .icon.dark {
    color: yellow;
  }
</style>
