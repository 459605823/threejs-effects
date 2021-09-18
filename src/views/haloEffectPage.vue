<template>
  <div ref="container" class="w-screen h-screen bg-black"></div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import Halo from '@objects/Halo';
import Grid from '@objects/Grid';
import * as THREE from 'three';
import Pencil from '@/utils/pencil/index';

export default defineComponent({
  setup() {
    const container = ref<HTMLDivElement>();
    onMounted(() => {
      const pencil = new Pencil({
        container: container.value,
        control: true,
        stats: true,
        renderer: {
          bloom: false,
        },
      });
      if (pencil.camera) {
        pencil.camera.position.y = 3;
        pencil.camera.position.z = 10;
      }
      pencil.registerElement('halo', Halo);
      pencil.registerElement('grid', Grid);
      pencil.draw('halo');
      pencil.draw('grid', {
        size: 150,
        divisions: 50,
      });
      pencil.start();
    });
    return {
      container,
    };
  },
});
</script>

<style scoped></style>
