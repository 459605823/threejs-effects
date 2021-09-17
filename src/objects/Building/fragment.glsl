varying vec2 vUv;
uniform sampler2D tDiffuse;
uniform vec2 iResolution;
uniform vec3 normalColor;
uniform vec3 shadowColor;

void main() {
    
    vec2 uv = vUv.xy / iResolution.xy * 300.0;
    
    gl_FragColor = vec4(normalColor, uv.y);
}