varying vec3 vModelPosition;
varying vec2 vUv;

void main() {

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vModelPosition = modelPosition.xyz;

    // Final Position
    gl_Position = projectionMatrix * viewMatrix * modelPosition;

    // varyings
    vUv = uv;
}
