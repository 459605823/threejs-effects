uniform mat4 textureMatrix;
varying vec2 vUv;
varying vec3 vNormal;
varying vec4 vUv4;
void main() {
  vUv = uv;
  vUv4 = textureMatrix * vec4(position, 1.0);
  vNormal = normal;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}