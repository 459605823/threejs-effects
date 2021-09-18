<template>
  <div ref="container" class="w-screen h-screen bg-black"></div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import RingEffect from '@objects/RingEffect';
import Grid from '@objects/Grid';
import * as THREE from 'three';
import Pencil from '@/utils/pencil/index';

export default defineComponent({
  setup() {
    const container = ref<HTMLDivElement>();
    onMounted(async () => {
      const pencil = new Pencil({
        container: container.value,
        control: true,
        stats: true,
        renderer: {
          bloom: false,
        },
      });
      if (pencil.camera) {
        pencil.camera.position.y = 80;
        pencil.camera.position.z = 80;
      }
      pencil.registerElement('ringEffect', RingEffect);
      pencil.registerElement('grid', Grid);
      const ringEffect = await pencil.draw('ringEffect', {
        radius: 10,
        position: new THREE.Vector3(0, 0, 0),
      });
      ringEffect.object3d.rotation.copy(
        new THREE.Euler((-Math.PI / 180) * 90, 0, 0)
      );
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
