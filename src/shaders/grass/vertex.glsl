
#include ../includes/utils.glsl

uniform float uTime;

varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vNormal;
varying float vElevation;

attribute float vertIndex;
attribute float angle;
attribute vec3 offsets;

float wave(float waveSize, float tipDistance, float centerDistance,float height) {
    return 10.0 * sin((uTime * 1.4) + waveSize) * sin((uTime * 0.8) + waveSize * 1.5) * smoothstep(0.0, 3.14159,height) ;
}

void main() {
    vPosition = position;
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);

    vec3 axis = vec3(0.0,1.0,0.0);
    vPosition = rotate_vertex_position(vPosition,axis,angle);
    vPosition.xz += offsets.xz;

    float elevation = getElevation(vPosition.xz);
    vElevation = elevation;
    elevation = clamp(elevation,-0.06,0.09);
    vPosition.y += elevation;


    vPosition.x += wave(uv.x * 10.0, 0.3, 0.1,vPosition.y);

    vec4 modelPosition = modelMatrix * vec4(vPosition, 1.0);
    gl_Position = projectionMatrix * viewMatrix * modelPosition;

    vec4 modelNormal = modelMatrix * vec4(vNormal, 0.0);
    vNormal = modelNormal.xyz;
    vPosition = modelPosition.xyz;
}