<template>
  <div>
    <Coordinate ref="coor" label="X" :value="x" />
    <Coordinate label="Y" :value="y" />
    <el-switch
      v-model="value"
      active-color="#13ce66"
      inactive-color="#ff4949"
    ></el-switch>
  </div>
</template>
<script lang="ts" setup>
const {x, y} = useMouse();
const coor = ref(null);
const value = ref(true);
onMounted(() => {
  console.log(coor.value);
});
watchEffect(() => {
  console.log(x.value, y.value);
});
</script>

<style scoped></style>
