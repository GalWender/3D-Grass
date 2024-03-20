#include ../includes/utils.glsl

uniform vec3 uColorLight;
uniform vec3 uColorWaterDeep;
uniform vec3 uColorWaterSurface;
uniform vec3 uGrassBaseColor;
uniform vec3 uColorSand;
uniform vec3 uColorSnow;
uniform vec3 uColorRock;

varying vec3 vPosition;
varying vec3 vNormal;
varying float vUpDot;


void main () {

    vec3 normal = normalize(vNormal);
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    // vec3 color = uColorLight;
    
    vec3 light = vec3(0.0);
    vec3 color = vec3(0.0);

     light += ambientLight(
        vec3(1.0), // Light color
        0.8       // Light intensity
    );

     light += directionalLight(
        vec3(1.0), // Light color
        1.0,                 // Light intensity,
        normal,              // Normal
        vec3(6.25* 3.0, 3.0, 4.0 * 3.0), // Light position
        viewDirection,       // View direction
        20.0                 // Specular power
    );

    float surfaceWaterMix = smoothstep(-1.0,-0.1,vPosition.y);
    color = mix(uColorWaterDeep,uColorWaterSurface,surfaceWaterMix);
    float sandMix = step(-0.1,vPosition.y);
    color = mix(color,uColorSand,sandMix);
    float grassMix = step(-0.06,vPosition.y);
    color = mix(color,uGrassBaseColor,grassMix);

    float rockThreshold = 0.06;
    rockThreshold += simplexNoise2d(vPosition.xz * 15.0) * 0.06;
    
    float rockMix = step(rockThreshold,vPosition.y);
    color = mix(color,uColorRock,rockMix);
    
    color *= light;
    gl_FragColor = vec4(color * vUpDot,1.0);
    // gl_FragColor = vec4(color,1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
