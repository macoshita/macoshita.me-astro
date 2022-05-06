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
      localStorage.removeItem("theme");
      document.documentElement.classList.remove("dark");
    }
  };
</script>

<div class="icons" on:click={toggle}>
  <button
    type="button"
    class="light"
    class:selected={isDark === false}
    aria-label="light"
  >
    {@html lightIcon}
  </button>
  <button
    type="button"
    class="dark"
    class:selected={isDark === true}
    aria-label="dark"
  >
    {@html darkIcon}
  </button>
</div>

<style>
  .icons {
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: space-around;
    gap: 8px;
    padding: 8px;
    background-color: var(--nc-bg-3);
  }
  .icons button {
    background-color: transparent;
    padding: 0;
    margin: 0;
    width: 24px;
    height: 24px;
    color: var(--nc-tx-1);
    transition: color 0.3s ease-in-out;
  }
  button.light.selected {
    color: orangered;
  }
  button.dark.selected {
    color: yellow;
  }
</style>
