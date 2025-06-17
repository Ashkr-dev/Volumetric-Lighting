uniform vec3 uLightColor;
uniform vec3 uCameraPosition;
uniform vec3 uLightDirection;
uniform float uTime;

varying vec3 vModelPosition;

void main() {
    // 1. Ray direction from camera to fragment
    vec3 rayDirection = normalize(vModelPosition - uCameraPosition);

    // 2. Light alignment (fade if not facing light direction)
    float alignment = dot(rayDirection, normalize(uLightDirection));
    alignment = smoothstep(0.0, 1.0, alignment); // smoother transition

    // 3. Distance-based falloff (like fog)
    float dist = length(vModelPosition - uCameraPosition);
    float fog = exp(-dist * 0.25); // tweak for softness

    // 4. Final Color (fade out on edges)
    float strength = alignment * fog;
    vec3 color = uLightColor * strength;

    gl_FragColor = vec4(color, strength * 0.5); // Lower alpha for realism
}
