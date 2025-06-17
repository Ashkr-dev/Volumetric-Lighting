import GUI from "lil-gui";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import lightRaysVertexShader from "./shaders/LightRays/vertex.glsl";
import lightRaysFragmentShader from "./shaders/LightRays/fragment.glsl";
import particlesVertexShader from "./shaders/Particles/vertex.glsl";
import particlesFragmentShader from "./shaders/Particles/fragment.glsl";

/**
 * Base
 */
const gui = new GUI({ width: 400 });
const canvas = document.querySelector("canvas.webgl");
const scene = new THREE.Scene();

/**
 * Loaders
 */
const textureLoader = new THREE.TextureLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("draco/");
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

/**
 * Textures
 */
const perlinTexture = textureLoader.load("./perlin.png");
const bakedTexture = textureLoader.load("Baked.jpg");
bakedTexture.flipY = false;
bakedTexture.colorSpace = THREE.SRGBColorSpace;

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(4, 2, 4);
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Materials
 */
const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture });

const rayMaterial = new THREE.ShaderMaterial({
  vertexShader: lightRaysVertexShader,
  fragmentShader: lightRaysFragmentShader,
  wireframe: false,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  side: THREE.FrontSide,
  uniforms: {
    uPerlinTexture: new THREE.Uniform(perlinTexture),
    uLightColor: new THREE.Uniform(new THREE.Color(1.0, 0.9, 0.7)),
    uTime: new THREE.Uniform(0.0),
    uLightDirection: new THREE.Uniform(
      new THREE.Vector3(-1, -1, -1).normalize()
    ),
    uCameraPosition: new THREE.Uniform(camera.position),
    uLightPosition: new THREE.Uniform(new THREE.Vector3(0, 5, 5)),
  },
});

gui.add(rayMaterial, "transparent");
gui.add(rayMaterial, "wireframe");
gui.add(rayMaterial, "depthWrite");

gui.addColor(rayMaterial.uniforms.uLightColor, "value").name("Light Color");
gui
  .add(rayMaterial.uniforms.uLightDirection.value, "x", -1, 1, 0.001)
  .name("Light Direction X");
gui
  .add(rayMaterial.uniforms.uLightDirection.value, "y", -1, 1, 0.001)
  .name("Light Direction Y");
gui
  .add(rayMaterial.uniforms.uLightDirection.value, "z", -1, 1, 0.001)
  .name("Light Direction Z");
gui
  .add(rayMaterial.uniforms.uLightPosition.value, "x", -10, 10, 0.1)
  .name("Light Position X");
gui
  .add(rayMaterial.uniforms.uLightPosition.value, "y", -10, 10, 0.1)
  .name("Light Position Y");
gui
  .add(rayMaterial.uniforms.uLightPosition.value, "z", -10, 10, 0.1)
  .name("Light Position Z");

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Fog for depth and realism (optional)
 */
// scene.fog = new THREE.FogExp2(0xffffff, 0.07);

/**
 * Helpers
 */
let rayBox;
function getRandomInBox() {
  const x = THREE.MathUtils.lerp(rayBox.min.x, rayBox.max.x, Math.random());
  const y = THREE.MathUtils.lerp(rayBox.min.y, rayBox.max.y, Math.random());
  const z = THREE.MathUtils.lerp(rayBox.min.z, rayBox.max.z, Math.random());
  return new THREE.Vector3(x, y, z);
}

/**
 * Particles
 */
let particles;

function addParticles() {
  const count = 500;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const p = getRandomInBox();
    positions[i * 3 + 0] = p.x;
    positions[i * 3 + 1] = p.y;
    positions[i * 3 + 2] = p.z;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const particleMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: new THREE.Uniform(0.0),
      uSize: new THREE.Uniform(2.5),
      uColor: new THREE.Uniform(new THREE.Color(1.0, 0.9, 0.7)),
    },
    vertexShader: particlesVertexShader,
    fragmentShader: particlesFragmentShader,
  });

  particles = new THREE.Points(geometry, particleMaterial);
  scene.add(particles);

  gui.addColor(particleMaterial.uniforms.uColor, "value").name("Particle Color"); 
  gui.add(particleMaterial.uniforms.uSize, "value", 0, 10, 0.1).name("Particle Size");
}

/**
 * Model
 */
let ray;

gltfLoader.load("VolumetricLighting.glb", (gltf) => {
  gltf.scene.children.forEach((child) => {
    child.material = bakedMaterial;
  });

  ray = gltf.scene.children.find((child) => child.name === "ray");
  ray.material = rayMaterial;
  scene.add(gltf.scene);

  rayBox = new THREE.Box3().setFromObject(ray);
  addParticles(); // Particles only after ray is loaded
});

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  rayMaterial.uniforms.uTime.value = elapsedTime;
  if (particles) {
    particles.material.uniforms.uTime.value = elapsedTime;
  }

  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

tick();
