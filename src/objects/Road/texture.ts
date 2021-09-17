import * as THREE from 'three';

export default (bg: string, active: string) => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 1;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

  const gradient = ctx.createLinearGradient(0, 0, 256, 1);
  // const bg = 'rgba(253,128,93,0.3)';
  // const active = 'rgba(23,184,190,0.3)';
  gradient.addColorStop(0, bg);
  gradient.addColorStop(0.5, active);
  gradient.addColorStop(0.5, bg);
  gradient.addColorStop(1, bg);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 1);
  console.log(canvas.toDataURL());
  const texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
};
