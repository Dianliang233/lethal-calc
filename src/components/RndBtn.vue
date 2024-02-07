<script setup lang="ts">
const { primary, secondary, gray } = defineProps({
  primary: Boolean,
  secondary: Boolean,
  gray: Boolean,
})
</script>
<template>
  <button
    :class="{
      'rnd-btn cursor-pointer border-none p-2 rounded-10 flex justify-center items-center hover:opacity-60 active:(opacity-70 border border-solid border-gray) transition': true,
      'bg-zinc-100 dark:bg-zinc-900 color-black dark:color-white': !primary && !secondary && !gray,
      'bg-indigo-600 color-white': primary,
      'bg-indigo-300 color-black': secondary,
      'bg-indigo-100 dark:bg-indigo-900 color-black dark:color-white': gray,
    }"
  >
    <slot />
  </button>
</template>
<style>
.rnd-btn .ML__base {
  @apply cursor-pointer;
}
</style>
