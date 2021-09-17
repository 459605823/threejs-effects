import {CSS3DRenderer} from 'three/examples/jsm/renderers/CSS3DRenderer';

export default (width: number, height: number) => {
  const css3DRenderer = new CSS3DRenderer();
  css3DRenderer.setSize(width, height);
  css3DRenderer.domElement.style.position = 'absolute';
  css3DRenderer.domElement.style.top = '0';
  return css3DRenderer;
};
