

// 海洋相关shader
float coast2water_fadedepth = 0.10;
float large_waveheight = 0.50; // change to adjust the "heavy" waves
float large_wavesize = 4.0; // factor to adjust the large wave size
float small_waveheight = 0.6; // change to adjust the small random waves
float small_wavesize = 5.5; // factor to ajust the small wave size
float water_softlight_fact = 200.0; // range [1..200] (should be << smaller than glossy-fact)
float water_glossylight_fact = 200.0; // range [1..200]
float particle_amount = 70.0;
vec3 watercolor = vec3(0.43, 0.60, 0.66); // 'transparent' low-water color (RGB)
vec3 watercolor2 = vec3(0.06, 0.07, 0.11); // deep-water color (RGB, should be darker than the low-water color)
vec3 water_specularcolor = vec3(1.3, 1.3, 0.9); // specular Color (RGB) of the water-highlights
vec3 light;

float hash(float n) { return fract(sin(n) * 43758.5453123); }
float noise(vec2 p) { return textureLod(waterNoiseTexture, p * vec2(1.0 / 256.0), 0.0).x; }
const mat2 m = mat2(0.72, - 1.60, 1.60, 0.72);

float water_map(vec2 p, float height) {
  vec2 p2 = p*large_wavesize;
  vec2 shift1 = 0.001 * vec2(iTime * 160.0 * 2.0, iTime * 120.0 * 2.0);
  vec2 shift2 = 0.001 * vec2(iTime * 190.0 * 2.0, - iTime * 130.0 * 2.0);
  // coarse crossing 'ocean' waves...
  float f = 0.6000 * noise(p);
  f += 0.2500 * noise(p * m);
  f += 0.1666 * noise(p * m*m);
  float wave = sin(p2.x * 0.622 + p2.y * 0.622 + shift2.x * 4.269) * large_waveheight * f*height * height ;
  
  p *= small_wavesize;
  f = 0.0;
  float amp = 1.0, s = 0.5;
  for(int i = 0; i < 9; i ++ ) { p = m*p * 0.947; f -= amp * abs(sin((noise(p + shift1 * s) - 0.5) * 2.0)); amp = amp * 0.59; s *=- 1.329; }
  return wave + f*small_waveheight;
}

float nautic(vec2 p) {
  p *= 18.0;
  float f = 0.0;
  float amp = 1.0, s = 0.5;
  for(int i = 0; i < 3; i ++ ) { p = m*p * 1.2; f += amp * abs(smoothstep(0.0, 1.0, noise(p + iTime * s)) - 0.5); amp = amp * 0.5; s *=- 1.227; }
  return pow(1.0 - f, 5.0);
}

float particles(vec2 p) {
  p *= 200.0;
  float f = 0.0;
  float amp = 1.0, s = 1.5;
  for(int i = 0; i < 3; i ++ ) { p = m*p * 1.2; f += amp * noise(p + iTime * s); amp = amp * 0.5; s *=- 1.227; }
  return pow(f * 0.35, 7.0) * particle_amount;
}

float test_shadow(vec2 xy, float height) {
  vec3 r0 = vec3(xy, height);
  vec3 rd = normalize(light - r0);
  
  float hit = 1.0;
  float t = 0.001;
  for(int j = 1; j < 25; j ++ ) {
    vec3 p = r0 + t*rd;
    float h = 0.0;
    float height_diff = p.z - h;
    if (height_diff < 0.0) { return 0.0; }
    t += 0.01 + height_diff * 0.02;
    hit = min(hit, 2.0 * height_diff / t); // soft shaddow
  }
  return hit;
}

vec4 getWaterColor(vec2 uv) {
  light = vec3(-0.0, sin(0.5) * 0.5 + 0.35, 2.8); // position of the sun

  float WATER_LEVEL = 2.0; // Water level (range: 0.0 - 2.0)
  float deepwater_fadedepth = 0.5 + coast2water_fadedepth;
  float height = 0.0;
  vec3 col;
  
  float waveheight = clamp(WATER_LEVEL * 3.0 - 1.5, 0.0, 1.0);
  float level = WATER_LEVEL + 0.2 * water_map(uv * 15.0 + vec2(iTime * 0.1), waveheight);
  if (height <= level) {
    vec2 dif = vec2(0.0, 0.01);
    vec2 pos = uv * 15.0 + vec2(iTime * 0.01);
    float h1 = water_map(pos - dif, waveheight);
    float h2 = water_map(pos + dif, waveheight);
    float h3 = water_map(pos - dif.yx, waveheight);
    float h4 = water_map(pos + dif.yx, waveheight);
    vec3 normwater = normalize(vec3(h3 - h4, h1 - h2, 0.125)); // norm-vector of the 'bumpy' water-plane
    uv += normwater.xy * 0.002 * (level - height);
    
    float coastfade = clamp((level - height) / coast2water_fadedepth, 0.0, 1.0);
    float coastfade2 = clamp((level - height) / deepwater_fadedepth, 0.0, 1.0);
    float intensity = col.r * 0.2126 + col.g * 0.7152 + col.b * 0.0722;
    watercolor = mix(watercolor * intensity, watercolor2, smoothstep(0.0, 1.0, coastfade2));
    
    vec3 r0 = vec3(uv, WATER_LEVEL);
    vec3 rd = normalize(light - r0); // ray-direction to the light from water-position
    float grad = dot(normwater, rd); // dot-product of norm-vector and light-direction
    float specular = pow(grad, water_softlight_fact); // used for soft highlights
    float specular2 = pow(grad, water_glossylight_fact); // used for glossy highlights
    float gradpos = dot(vec3(0.0, 0.0, 1.0), rd);
    float specular1 = smoothstep(0.0, 1.0, pow(gradpos, 5.0)); // used for diffusity (some darker corona around light's specular reflections...)
    float watershade = test_shadow(uv, level);
    watercolor *= 2.2 + watershade;
    watercolor += (0.2 + 0.8 * watershade) * ((grad - 1.0) * 0.5 + specular) * 0.25;
    watercolor /= (1.0 + specular1 * 1.25);
    watercolor += watershade * specular2 * water_specularcolor;
    watercolor += watershade * coastfade * (1.0 - coastfade2) * (vec3(0.5, 0.6, 0.7) * nautic(uv) + vec3(1.0, 1.0, 1.0) * particles(uv));
    
    col = mix(col, watercolor, coastfade);
  }
  
  return vec4(col , 1.0);
}
// 海洋相关

gl_FragColor = mix(defaultTexture, getWaterColor(vUv), isWater * 1.5);
