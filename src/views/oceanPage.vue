<template>
  <div ref="container" class="w-screen h-screen bg-black"></div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import Ocean from '@objects/Ocean';
import * as THREE from 'three';
import Pencil from '@/utils/pencil/index';
import {getImage} from '@/utils/pencil/utils';

export default defineComponent({
  setup() {
    const container = ref<HTMLDivElement>();
    const imgs = ['nx', 'ny', 'nz', 'px', 'py', 'pz'];
    onMounted(async () => {
      const images = imgs.map((name) => getImage(`Ocean/${name}.jpeg`));
      const sceneBackground = new THREE.CubeTextureLoader().load(images, () => {
        sceneBackground.encoding = THREE.sRGBEncoding;
      });
      const pencil = new Pencil({
        container: container.value,
        control: true,
        stats: true,
        renderer: {
          bloom: false,
        },
        scene: {
          // background: sceneBackground,
        },
      });
      if (pencil.camera) {
        pencil.camera.position.set(1000, 500, -1500);
      }
      pencil.registerElement('ocean', Ocean);
      pencil.draw('ocean');
      pencil.start();
    });
    return {
      container,
    };
  },
});
</script>

<style scoped></style>
