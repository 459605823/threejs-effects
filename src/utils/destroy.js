import * as THREE from 'three';

function destroyMaterial(materials) {
  if (!Array.isArray(materials)) {
    materials = [materials];
  }
  materials.forEach((material) => {
    Object.keys(material).forEach((key) => {
      if (material[key] instanceof THREE.Texture) {
        material[key].dispose();
        material[key] = null;
      }
    });
    material.uniforms = {};
    material.defaultAttributeValues = {};
  });
}

export default function destroy(objects) {
  if (!Array.isArray(objects)) {
    objects = [objects];
  }
  objects.forEach((object) => {
    if (!object) {
      return;
    }
    object?.dispose?.();
    if (object.texture) {
      destroy?.(object.texture);
    }
    if (object.children) {
      destroy?.(object.children);
      object?.remove?.(...object.children);
      // if (!object.tagName) { }
    }
    if (object.material) {
      destroyMaterial(object.material);
    }
    if (object.geometry) {
      destroy(object.geometry);
    }
  });
  objects = null;
}
