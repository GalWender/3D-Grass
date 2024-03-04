uniform sampler2D uPerlinTexture;

varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vNormal;

vec3 green = vec3(0.02, 0.2, 0.01);

void main() {
    vec3 color = mix(green * 0.5, green, vPosition.y);
    color = mix(color, texture2D(uPerlinTexture, vUv).rgb, 0.13);

    float lighting = normalize(dot(vNormal, vec3(10)));
    gl_FragColor = vec4(color + lighting * 0.03, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }