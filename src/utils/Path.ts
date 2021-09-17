import * as THREE from 'three';

class CustomCurve extends THREE.CurvePath<THREE.Vector3> {
  // public curves: THREE.Curve<THREE.Vector3>[] = null;
  constructor(nodes: [number, number][] = [], radius = 0.8) {
    super();

    if (nodes.length < 2) {
      return;
    }

    nodes.forEach((item, index) => {
      // filter: first
      if (index) {
        const end = new THREE.Vector3(...item);
        const start = new THREE.Vector3(...nodes[index - 1]);
        let left = start.clone();
        let right = end.clone();
        if (index !== 1) {
          left = start.clone().sub(end).multiplyScalar(radius).add(end);
        }
        if (nodes.length !== index + 1) {
          right = end.clone().sub(start).multiplyScalar(radius).add(start);
        }
        this.curves.push(new THREE.LineCurve3(left, right));
      }
      // filter: first and last
      if (index && nodes.length !== index + 1) {
        const center = new THREE.Vector3(...item);
        const start = new THREE.Vector3(...nodes[index - 1]);
        const end = new THREE.Vector3(...nodes[index + 1]);
        this.curves.push(
          new THREE.QuadraticBezierCurve3(
            center.clone().sub(start).multiplyScalar(radius).add(start),
            center,
            end
              .clone()
              .sub(center)
              .multiplyScalar(1 - radius)
              .add(center)
          )
        );
      }
    });
  }
}

export default CustomCurve;
