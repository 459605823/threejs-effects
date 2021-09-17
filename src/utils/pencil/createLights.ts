import * as THREE from 'three';

export default () => {
  // const {helper} = options;
  // const lights = [];
  // const ambientLight = new THREE.AmbientLight(0x505050);
  // const spotLight = new THREE.SpotLight(0xeeeeee, 3);
  // spotLight.position.x = 730;
  // spotLight.position.y = 520;
  // spotLight.position.z = 626;
  // spotLight.castShadow = true;
  // const pointLight = new THREE.PointLight(0x222222, 14.8);
  // pointLight.position.x = -640;
  // pointLight.position.y = -500;
  // pointLight.position.z = -1000;

  // lights.push(ambientLight);
  // lights.push(spotLight);
  // lights.push(pointLight);

  // return lights;
  const sphereSize = 1;
  const ambientLight = new THREE.AmbientLight(0x404040);
  const pointLight = new THREE.PointLight(0xffffff, 1);
  const pointLightHelper = new THREE.PointLightHelper(pointLight, sphereSize);
  return {
    ambientLight,
    pointLight,
    pointLightHelper,
  };
};
