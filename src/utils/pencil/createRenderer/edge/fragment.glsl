varying vec2 vUv;
uniform sampler2D tDiffuse;
uniform vec2 iResolution;
uniform vec3 edgeColor;

void main() {
    float th = 0.001;
    
    vec3 gx, gy;
    gx = texture(tDiffuse, vUv.xy + vec2(th, 0.0)).rgb
    - texture(tDiffuse, vUv.xy - vec2(th, 0.0)).rgb ;
    
    gy = texture(tDiffuse, vUv.xy + vec2(0.0, th)).rgb
    - texture(tDiffuse, vUv.xy - vec2(0.0, th)).rgb;
    
    float gr = gx.r * gx.r + gy.r * gy.r;
    float gg = gx.g * gx.g + gy.g * gy.g;
    float gb = gx.b * gx.b + gy.b * gy.b;
    float g = pow((gr + gg + gb) / 1.0, 1.2);
    
    vec4 texture = texture(tDiffuse, vUv);
    if (g > 0.8) { // 调整这个判断值 更改边缘的识别范围
        gl_FragColor = vec4(edgeColor, 1.0);
    } else {
        gl_FragColor = texture;
    }
}