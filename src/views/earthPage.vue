<template>
  <div class="wrapper">
    <div ref="container" class="w-screen h-screen"></div>
    <div id="labels"></div>
    <div id="ui"></div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import Earth from '@objects/Earth';
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
        gui: true,
        scene: {
          background: new THREE.Color('#000'),
        },
      });
      const {camera} = pencil;
      if (camera) {
        camera.near = 0.1;
        camera.far = 10;
        camera.position.set(0, 0, 2.5);
        camera.updateProjectionMatrix();
      }

      pencil.registerElement('earth', Earth);
      pencil.draw('earth', {
        container: container.value,
      });

      pencil.start();
    });
    return {
      container,
    };
  },
});
</script>

<style lang="scss">
.wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
#ui {
  position: absolute;
  left: 1em;
  top: 1em;
  div {
    color: #fff;
    font-size: 20pt;
    padding: 1em;
    display: inline-block;
  }
  div.selected {
    color: red;
  }
}
#labels {
  position: absolute;
  left: 0;
  top: 0;
  color: white;
  z-index: 0;
}
#labels > div {
  // white-space: nowrap;
  position: absolute; /* let us position them inside the container */
  left: 0; /* make their default position the top left of the container */
  top: 0;
  cursor: pointer; /* change the cursor to a hand when over us */
  font-size: small;
  user-select: none; /* don't let the text get selected */
  text-shadow:         /* create a black outline */ -1px -1px 0 #000,
    0 -1px 0 #000, 1px -1px 0 #000, 1px 0 0 #000, 1px 1px 0 #000, 0 1px 0 #000,
    -1px 1px 0 #000, -1px 0 0 #000;
}
</style>
