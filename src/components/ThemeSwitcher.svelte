<script lang="ts">
  import lightIcon from "@/icons/light.svg?raw";
  import darkIcon from "@/icons/dark.svg?raw";

  const isDarkTheme = (): boolean => {
    const theme = localStorage.getItem("theme");
    if (theme) {
      return theme === "dark";
    } else {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
  };

  let isDark = import.meta.env.SSR ? undefined : isDarkTheme();

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
  <span class="icon light" class:selected={isDark === false}>
    {@html lightIcon}
  </span>
  <span class="icon dark" class:selected={isDark === true}>
    {@html darkIcon}
  </span>
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
  }
  .icon {
    width: 24px;
    height: 24px;
    color: var(--nc-tx-1);
    transition: color 0.3s ease-in-out;
  }
  .icon.light.selected {
    color: orangered;
  }
  .icon.dark.selected {
    color: yellow;
  }
</style>
