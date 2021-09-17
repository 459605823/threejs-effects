<template>
  <div>
    <el-switch
      v-model="value"
      active-color="#13ce66"
      inactive-color="#ff4949"
    ></el-switch>
  </div>
</template>
<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
  setup() {
    const value = ref(true);
    return {
      value,
    };
  },
});
</script>

<style scoped></style>
