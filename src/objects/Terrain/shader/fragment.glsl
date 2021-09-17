uniform sampler2D waterTexture; // 判断海洋
uniform sampler2D waterDiffuseTexture; // 海洋噪声
uniform sampler2D defaultTexture; // 默认贴图
uniform vec2 repeat;
uniform float iTime; // 动画生命周期
varying vec2 vUv;
varying vec4 vUv4;

void main() {
  float isWater = texture2D(waterTexture, vUv).x;
  vec4 defaultTexture = texture2D(defaultTexture, vUv);
  if (isWater > 0.0) {
	  vec4 water = texture2D(waterDiffuseTexture, mod(vUv * repeat , 1.0));
    gl_FragColor = mix(defaultTexture, water, 0.5);
  } else {
    gl_FragColor = defaultTexture;
  }
}
