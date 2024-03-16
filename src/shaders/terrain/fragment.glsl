#include ../includes/utils.glsl

uniform vec3 uColorWaterDeep;
uniform vec3 uColorWaterSurface;
uniform vec3 uGrassBaseColor;
uniform vec3 uColorSand;
uniform vec3 uColorSnow;
uniform vec3 uColorRock;

varying vec3 vPosition;
varying float vUpDot;


// void main () {
//     vec3 color = vec3(1.0);

//     float surfaceWaterMix = smoothstep(-1.0,-0.1,vPosition.y);
//     color = mix(uColorWaterDeep,uColorWaterSurface,surfaceWaterMix);
//     float sandMix = step(-0.1,vPosition.y);
//     color = mix(color,uColorSand,sandMix);
//     float grassMix = step(-0.06,vPosition.y);
//     color = mix(color,uGrassBaseColor,grassMix);
// //rock type 1
//     float rockThreshold = 0.06;
//     rockThreshold += simplexNoise2d(vPosition.xz * 15.0) * 0.06;
    
//     float rockMix = step(rockThreshold,vPosition.y);
//     color = mix(color,uColorRock,rockMix);
// //rock type 2
//     // float rockThreshold = 0.75;
//     // rockThreshold += simplexNoise2d(vPosition.xz * 15.0) * 0.02;
    
//     // float rockMix = vUpDot;
//     // rockMix = 1.0 - step(rockThreshold,rockMix);
    
//     // rockMix *= step(-0.06,vPosition.y);
//     // color = mix(color,uColorRock,rockMix);
    
//     csm_DiffuseColor = vec4(color,1.0);
     

// }

void main () {
    vec3 color = vec3(1.0);

    // float surfaceWaterMix = smoothstep(-1.0,-0.1,vPosition.y);
    // color = mix(uColorWaterDeep,uColorWaterSurface,surfaceWaterMix);
    // float sandMix = step(-0.1,vPosition.y);
    // color = mix(color,uColorSand,sandMix);
    float grassMix = step(-0.06,vPosition.y);
    color = mix(color,uGrassBaseColor,1.0);
//rock type 1
    float rockThreshold = 0.06;
    rockThreshold += simplexNoise2d(vPosition.xz * 15.0) * 0.06;
    
    float rockMix = step(rockThreshold,vPosition.y);
    color = mix(color,uColorRock,rockMix);
//rock type 2
    // float rockThreshold = 0.75;
    // rockThreshold += simplexNoise2d(vPosition.xz * 15.0) * 0.02;
    
    // float rockMix = vUpDot;
    // rockMix = 1.0 - step(rockThreshold,rockMix);
    
    // rockMix *= step(-0.06,vPosition.y);
    // color = mix(color,uColorRock,rockMix);
    
    csm_DiffuseColor = vec4(color,1.0);
     

}