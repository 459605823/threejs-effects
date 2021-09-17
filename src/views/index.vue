<template>
  <div class="w-screen h-screen">
    <router-link
      v-for="page of pages"
      :key="page"
      :to="'/' + page"
      class="block"
    >
      {{ page.split('Page')[0] }}
    </router-link>
  </div>
</template>
<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
  setup() {
    const pages = ['shieldCoverPage', 'buildingPage'];
    return {
      pages,
    };
  },
});
</script>

<style scoped></style>
