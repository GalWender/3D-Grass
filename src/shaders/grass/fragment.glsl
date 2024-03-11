// uniform sampler2D uPerlinTexture;
// uniform float uTime;

// varying vec3 vPosition;
// varying vec2 vUv;
// varying vec3 vNormal;

// vec3 darkGreen = vec3(0.0, 0.4, 0.0);
// vec3 lightGreen = vec3(0.2, 0.6, 0.3);

// vec3 green = vec3(0.0, 0.5, 0.0);
// vec3 yellow = vec3(0.8, 0.8, 0.0);

// void main() {
//     vec3 color = mix(green, yellow, vPosition.y);
//     vec2 uvTimeShift = vec2(vUv.x + uTime * 0.08, vUv.y); // Add time to the x-coordinate
//     color = mix(color, texture2D(uPerlinTexture, uvTimeShift).rgb, 0.3); // Use the shifted UV 
    

//     float lighting = normalize(dot(vNormal, vec3(10)));
//     gl_FragColor = vec4(color + lighting * 0.03, 1.0);

//     // #include <tonemapping_fragment>
//     // #include <colorspace_fragment>
// }

uniform sampler2D uPerlinTexture;
uniform float uTime;

varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vNormal;

vec3 darkGreen = vec3(0.0, 0.4, 0.0);
vec3 lightGreen = vec3(0.2, 0.6, 0.3);

vec3 green = vec3(0.0, 0.5, 0.0);
vec3 yellow = vec3(0.8, 0.8, 0.0);

// void main() {
//     vec3 color = mix(green, yellow, vPosition.y);
//     vec2 uvTimeShift = vec2(fract(vUv.x + uTime * 0.08), fract(vUv.y)); // Add time to the x-coordinate and use fract to make it seamless
//     color = mix(color, texture2D(uPerlinTexture, uvTimeShift).rgb, 0.3); // Use the shifted UV 

//     float lighting = normalize(dot(vNormal, vec3(10)));
//     gl_FragColor = vec4(color + lighting * 0.03, 1.0);

//     // #include <tonemapping_fragment>
//     // #include <colorspace_fragment>
// }

void main() {
    vec3 color = mix(green, yellow, vPosition.y);
    vec2 uvTimeShift = vec2(vUv.x + uTime * 0.08, vUv.y); // Add time to the x-coordinate

    // Create a 4D vector for the Perlin noise
    vec4 perlinPos = vec4(uvTimeShift, 0.0, 0.0);
    perlinPos.zw += vec2(1.0);
    perlinPos.zw *= vec2(1.0) - uvTimeShift.xy;

    // Get the Perlin noise color
    vec3 perlinColor = texture2D(uPerlinTexture, perlinPos.xy).rgb;

    color = mix(color, perlinColor, 0.3); // Use the Perlin noise color

    float lighting = normalize(dot(vNormal, vec3(10)));
    gl_FragColor = vec4(color + lighting * 0.03, 1.0);

    // #include <tonemapping_fragment>
    // #include <colorspace_fragment>
}