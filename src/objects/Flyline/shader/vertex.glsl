attribute float percent;
uniform float time;
uniform float number;
uniform float speed;
uniform float length;
varying float opacity;
uniform float size;

void main()
{
    float l=clamp(1.-length,0.,1.);
    
    gl_PointSize=clamp(fract(percent*number+l-time*number*speed)-l,0.,1.)*size*(1./length);
    
    opacity=gl_PointSize/size;
    gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
}