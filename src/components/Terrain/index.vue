<template>
  <div ref="container" class="w-full h-full bg-black"></div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import Building from '@objects/Building';
import Terrain from '@objects/Terrain';
import EnvBackground from '@objects/EnvBackground';
import * as THREE from 'three';
import Pencil from '@/utils/pencil/index';
import AreaScale from '@/utils/AreaScale';

export default defineComponent({
  name: 'Building',
  setup() {
    const container = ref<HTMLDivElement>();
    const area = [119.993, 35.9975, 120.6514, 36.2859] as [
      number,
      number,
      number,
      number
    ];
    const polygonCenter = [120.3224, 36.1415];
    const init = async (pencil: Pencil) => {
      const areaScale = AreaScale(area, [3840, 2080]);
      const center = areaScale.getPoint(polygonCenter[0], polygonCenter[1]);
      await pencil.draw('terrain');
      await pencil.draw('envBackground');
      pencil.control?.target.set(center.x, 0, center.y);
      pencil.camera?.position.set(0, 1500, 0);
      pencil.start();
    };
    onMounted(() => {
      const pencil = new Pencil({
        container: container.value,
        control: true,
        stats: true,
        renderer: {
          edge: false,
          bloom: false,
        },
        scene: {
          background: new THREE.Color('#999999'),
        },
      });
      pencil.registerElement('building', Building);
      pencil.registerElement('terrain', Terrain);
      pencil.registerElement('envBackground', EnvBackground);
      init(pencil);
    });
    return {
      container,
    };
  },
});
</script>

<style scoped></style>
