uniform sampler2D uPerlinTexture;
uniform vec3 uGrassBaseColor;
uniform vec3 uGrassTipColor;
uniform float uTime;

varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vNormal;
varying float vElevation;

void main() {
    // float normalizedY = clamp(vPosition.y, -0.06, 0.2); // Ensure Y is between -0.06 and 1.0
    // vec3 color = mix(uGrassBaseColor, uGrassTipColor, 0.7);

    // // vec3 color = mix(uGrassBaseColor, uGrassTipColor, vPosition.y);
    vec3 color = mix(uGrassBaseColor, uGrassTipColor, (vPosition.y - vElevation) * 1.3);
    
    vec2 uvTimeShift = vec2(vUv.x + uTime * 0.02, vUv.y); // Add time to the x-coordinate
    color = mix(color, texture2D(uPerlinTexture, uvTimeShift).rgb, 0.07); // Use the shifted UV 

    if (vElevation < -0.06) {
        discard;
    }
    if (vElevation > 0.06) {
        discard;
    }

    float lighting = normalize(dot(vNormal, vec3(10)));
    gl_FragColor = vec4(color + lighting * 0.03, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}

// vec3 green = vec3(0.2, 0.6, 0.3);
// void main() {
//     // float elevation = smoothstep(-0.06, 0.2, vElevation);
//     // vec3 color = mix(uGrassBaseColor, uGrassTipColor, elevation);

//     // float gradient = smoothstep(0.0, 1.0, vPosition.y);
//     // vec3 color = mix(uGrassBaseColor, uGrassTipColor, gradient);
//     vec3 color = mix(green * 0.7, green, vPosition.y);

//     if (vElevation < -0.06) {
//         discard;
//     }
//     if (vElevation > 0.06) {
//         discard;
//     }

//     float lighting = normalize(dot(vNormal, vec3(10)));
//     gl_FragColor = vec4(color + lighting * 0.03, 1.0);

//     #include <tonemapping_fragment>
// }