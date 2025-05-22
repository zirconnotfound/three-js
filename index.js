import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import * as dat from "dat.gui";

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(4, 2, 2);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Light
const light = new THREE.DirectionalLight(0xffffff, 2.5);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0xffffff, 100);
scene.add(ambientLight);

// Exposure
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.5;

// Load GLB Model
let model, pivot;

const loader = new GLTFLoader();
loader.load(
  "dm_doi.glb",
  function (gltf) {
    gltf.scene.scale.set(0.5, 0.5, 0.5);

    // Center model
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const center = box.getCenter(new THREE.Vector3());
    gltf.scene.position.sub(center); // shift to origin

    // Wrap in pivot group
    pivot = new THREE.Group();
    pivot.add(gltf.scene);
    scene.add(pivot);

    model = gltf.scene;
  },
  undefined,
  function (error) {
    console.error("Error loading GLB:", error);
  }
);

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
  if (pivot) {
    pivot.rotation.y += settings.rotateSpeed;
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();

// Resize handler
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const pmremGenerator = new THREE.PMREMGenerator(renderer);
const env = new RoomEnvironment();
const envMap = pmremGenerator.fromScene(env).texture;
scene.environment = envMap;
scene.background = new THREE.Color(0xeeeeee); // or use scene.background = envMap;

const settings = {
  exposure: 1.5,
  rotateSpeed: 0.01,
  ambientIntensity: 1.5,
  directionalIntensity: 2,
};
const gui = new dat.GUI();
gui
  .add(settings, "exposure", 0.1, 3)
  .onChange((v) => (renderer.toneMappingExposure = v));
gui.add(settings, "rotateSpeed", 0, 0.1);
gui
  .add(settings, "ambientIntensity", 0, 5)
  .onChange((v) => (ambientLight.intensity = v));
gui
  .add(settings, "directionalIntensity", 0, 5)
  .onChange((v) => (directionalLight.intensity = v));
