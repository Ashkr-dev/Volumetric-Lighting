uniform vec3 uColor;

varying float vFade;

void main() {
    float d = distance(gl_PointCoord, vec2(0.5));
    float alpha = smoothstep(0.5, 0.0, d) * vFade;
    gl_FragColor = vec4(uColor, alpha);
}