<template>
  <div ref="container" class="w-full h-full bg-black"></div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import ShieldCover from '@objects/ShieldCover';
import ElectricShield from '@objects/ElectricShield';
import Grid from '@objects/Grid';
import * as THREE from 'three';
import Pencil from '@/utils/pencil/index';

export default defineComponent({
  name: 'ShieldCover',
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
        pencil.camera.position.y = 10;
        pencil.camera.position.z = 20;
      }
      pencil.registerElement('shieldCover', ShieldCover);
      pencil.registerElement('electricShield', ElectricShield);
      pencil.registerElement('grid', Grid);
      pencil.draw('shieldCover', {
        position: new THREE.Vector3(-5, 0, 0),
      });
      pencil.draw('electricShield', {
        radius: 5,
        position: new THREE.Vector3(5, 0, 0),
      });
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
