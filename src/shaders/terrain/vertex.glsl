#include ../includes/utils.glsl

varying vec3 vPosition;
varying float vUpDot;
varying vec3 vNormal;

void main () {
    vPosition = position;
    float shift = 0.01;
    vec3 positionA = vPosition + vec3(shift,0.0,0.0);
    vec3 positionB = vPosition + vec3(0.0,0.0,-shift);
    
    float elevation = getElevation(vPosition.xz);
    vPosition.y += elevation;
    positionA.y = getElevation(positionA.xz); 
    positionB.y = getElevation(positionB.xz); 

    vec3 toA = normalize(positionA - vPosition);
    vec3 toB = normalize(positionB - vPosition);
    vNormal = cross(toA,toB);

    vUpDot = dot(vNormal, vec3(0.0,1.0,0.0));
    vec4 modelPosition = modelMatrix * vec4(vPosition, 1.0);
    gl_Position = projectionMatrix * viewMatrix * modelPosition;

    vec4 modelNormal = modelMatrix * vec4(vNormal, 0.0);

    vNormal = modelNormal.xyz;
    vPosition = modelPosition.xyz;
}