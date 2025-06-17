uniform float uTime;
uniform float uSize;
varying float vFade;

void main() {
    vec3 pos = position;
    pos.y += sin(uTime + position.x * 5.0) * 0.1;

    vFade = clamp(1.0 - length(pos) * 0.3, 0.0, 1.0);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    gl_PointSize = uSize / -mvPosition.z;
}
