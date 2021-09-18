uniform vec2 iResolution;
uniform float time;

varying vec2 vUv;

#define M_PI 3.1415926535897932384626433832795
#define M_TWO_PI 2.0 * M_PI

float rand(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898, 12.1414))) * 83758.5453);
}

float noise(vec2 n) {
    const vec2 d = vec2(0.0, 1.0);
    vec2 b = floor(n);
    vec2 f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
    return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
}

vec3 ramp(float t) {
    return t <= 0.5 ? vec3(0.1412, 0.2824, 0.8471) / t : vec3(0.0, 0.2, 1.0) / t;
}
vec2 polarMap(vec2 uv, float shift, float inner) {
    
    uv = vec2(0.5) - uv;
    
    float px = 1.0 - fract(atan(uv.y, uv.x) / 6.28 + 0.25) + shift;
    float py = (sqrt(uv.x * uv.x + uv.y * uv.y) * (1.0 + inner * 3.0) - inner) * 5.0;
    
    return vec2(px, py);
}
float fire(vec2 n) {
    return noise(n) + noise(n * 2.1) * 0.6 + noise(n * 5.4) * 0.42;
}

float shade(vec2 uv, float t) {
    uv.x += uv.y < 0.5 ? 23.0 + t * 0.035 : -11.0 + t * 0.03;
    uv.y = abs(uv.y - 0.5);
    uv.x *= 35.0;
    
    float q = fire(uv - t * 0.013) / 2.0;
    vec2 r = vec2(fire(uv + q / 2.0 + t - uv.x - uv.y), fire(uv + q - t));
    
    return pow((r.y + r.y) * max(0.0, uv.y) + 0.1, 4.0);
}

vec3 color(float grad) {
    
    float m2 = 1.0;
    grad = sqrt(grad);
    vec3 color = vec3(1.0 / (pow(vec3(0.5, 0.0, 0.1) + 2.61, vec3(2.0))));
    vec3 color2 = color;
    color = ramp(grad);
    color /= (m2 + max(vec3(0), color));
    
    return color;
    
}

void main() {
    vec2 uv = vUv;
    vec2 center = vec2(0.5, 0.5);
    float r = 0.25;
    float r2 = 0.38;
    float w = (center.x - uv.x) * (center.x - uv.x) + (center.y - uv.y) * (center.y - uv.y);
    if (!(w > r*r)||(w > r2 * r2)) {
        return;
    }
    float m1 = 3.0;
    float t = time;
    float ff = 1.0 - uv.y;
    vec2 uv2 = uv;
    uv2.y = 1.0 - uv2.y;
    uv = polarMap(uv, 0.1, m1);
    uv2 = polarMap(uv2, 0.1, m1);
    
    vec3 c1 = color(shade(uv, t)) * ff;
    vec3 c2 = color(shade(uv2, t)) * (1.0 - ff);
    
    vec3 rColor = c1 + c2;
    
    gl_FragColor = vec4(rColor, rColor.x + rColor.y + rColor.z);
}