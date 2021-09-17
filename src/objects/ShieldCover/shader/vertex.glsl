uniform vec3 viewVector;
varying vec2 vUv;
varying vec3 vNormal;
varying vec4 vWorld;
uniform float c;
uniform float p;
varying float intensity;
void main()
{
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec3 vNormel = normalize(normalMatrix * viewVector);
    intensity = pow(c - dot(vNormal, vNormel), p);
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    vWorld = modelMatrix * vec4(position, 1.0);
}