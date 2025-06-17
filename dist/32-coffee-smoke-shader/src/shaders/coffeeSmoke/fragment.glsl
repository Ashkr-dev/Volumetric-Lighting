uniform float uTime;
uniform sampler2D uPerlinTexture;

varying vec2 vUv;

void main() {

    //Smoke UV
    vec2 smokeUv = vUv;
    smokeUv.x *= 0.5;
    smokeUv.y *= 0.3;
    smokeUv.y -= uTime * 0.03;

    //Smoke
    float smoke = texture2D(uPerlinTexture, smokeUv).r; 

    //Clamping or remaping
    smoke = smoothstep(0.4, 1.0, smoke);

    //Smoothing Edges
    // smoke = 1.0;
    smoke *= smoothstep(0.0, 0.1, vUv.x);  //Left
    smoke *= smoothstep(1.0, 0.9, vUv.x);  //Right
    smoke *= smoothstep(1.0, 0.4, vUv.y);  //Top
    smoke *= smoothstep(0.0, 0.1, vUv.y);  //Bottom

    //Final Color
    gl_FragColor = vec4(0.6, 0.3, 0.2, smoke);
    // gl_FragColor = vec4(1.0, 0, 0, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}