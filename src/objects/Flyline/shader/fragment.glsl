varying float opacity;
uniform vec3 color;

void main(){
    if(opacity<=.2){
        discard;
    }
    gl_FragColor=vec4(color,1.);
}