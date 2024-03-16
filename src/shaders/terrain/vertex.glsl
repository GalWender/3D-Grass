#include ../includes/utils.glsl

varying vec3 vPosition;
varying float vUpDot;

void main () {
    float shift = 0.01;
    vec3 positionA = position + vec3(shift,0.0,0.0);
    vec3 positionB = position + vec3(0.0,0.0,-shift);
    
    float elevation = getElevation(csm_Position.xz);
    csm_Position.y += elevation;
    positionA.y = getElevation(positionA.xz); 
    positionB.y = getElevation(positionB.xz); 

    vec3 toA = normalize(positionA - csm_Position);
    vec3 toB = normalize(positionB - csm_Position);
    csm_Normal = cross(toA,toB);

    vPosition = csm_Position;
    vUpDot = dot(csm_Normal, vec3(0.0,1.0,0.0));
}