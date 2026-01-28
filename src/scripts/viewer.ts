import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';

interface ViewerConfig {
  container: string;
  photos: string[];
  thumbnailStrip?: string;
}

export function initViewer(config: ViewerConfig) {
  const { container: containerId, photos, thumbnailStrip: stripId } = config;

  const container = document.getElementById(containerId);
  const loadingEl = document.getElementById('loading');
  const thumbnailStrip = stripId ? document.getElementById(stripId) : null;

  if (!container) return;

  let currentIndex = 0;

  // Scene setup
  const scene = new THREE.Scene();

  // Camera
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 0.1);

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  container.appendChild(renderer.domElement);

  // VR Button
  const vrButton = VRButton.createButton(renderer);
  vrButton.style.bottom = '100px';
  document.body.appendChild(vrButton);

  // Sphere geometry (inverted for viewing from inside)
  const geometry = new THREE.SphereGeometry(500, 60, 40);
  geometry.scale(-1, 1, 1);

  // Material
  const textureLoader = new THREE.TextureLoader();
  const material = new THREE.MeshBasicMaterial();
  const sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);

  // Load photo
  function loadPhoto(index: number) {
    if (index < 0 || index >= photos.length) return;

    currentIndex = index;

    if (loadingEl) loadingEl.style.display = 'block';

    textureLoader.load(
      photos[index],
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        if (material.map) material.map.dispose();
        material.map = texture;
        material.needsUpdate = true;
        if (loadingEl) loadingEl.style.display = 'none';
      },
      undefined,
      (error) => {
        console.error('Error loading texture:', error);
        if (loadingEl) loadingEl.textContent = 'Error loading image';
      }
    );

    // Update thumbnail selection
    if (thumbnailStrip) {
      thumbnailStrip.querySelectorAll('.thumbnail').forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
      });
    }
  }

  // Create thumbnails
  if (thumbnailStrip && photos.length > 0) {
    photos.forEach((photo, index) => {
      const thumb = document.createElement('div');
      thumb.className = 'thumbnail' + (index === 0 ? ' active' : '');
      thumb.innerHTML = `<img src="${photo}" alt="Photo ${index + 1}">`;
      thumb.addEventListener('click', () => loadPhoto(index));
      thumbnailStrip.appendChild(thumb);
    });
  }

  // OrbitControls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.rotateSpeed = -0.25;
  controls.minDistance = 0.1;
  controls.maxDistance = 0.1;

  // Zoom via FOV
  let fov = 75;
  const minFov = 30;
  const maxFov = 100;

  function onWheel(event: WheelEvent) {
    event.preventDefault();
    fov += event.deltaY * 0.05;
    fov = Math.max(minFov, Math.min(maxFov, fov));
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }

  renderer.domElement.addEventListener('wheel', onWheel, { passive: false });

  // Touch zoom (pinch)
  let touchStartDistance = 0;
  let touchStartFov = fov;

  function getTouchDistance(touches: TouchList) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  renderer.domElement.addEventListener('touchstart', (event) => {
    if (event.touches.length === 2) {
      touchStartDistance = getTouchDistance(event.touches);
      touchStartFov = fov;
    }
  }, { passive: true });

  renderer.domElement.addEventListener('touchmove', (event) => {
    if (event.touches.length === 2) {
      const distance = getTouchDistance(event.touches);
      const scale = touchStartDistance / distance;
      fov = touchStartFov * scale;
      fov = Math.max(minFov, Math.min(maxFov, fov));
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  }, { passive: true });

  // Window resize
  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  window.addEventListener('resize', onWindowResize);

  // Keyboard navigation
  document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      loadPhoto(currentIndex - 1);
    } else if (event.key === 'ArrowRight') {
      loadPhoto(currentIndex + 1);
    }
  });

  // Animation loop
  function animate() {
    controls.update();
    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(animate);

  // Load first photo
  if (photos.length > 0) {
    loadPhoto(0);
  }

  return {
    loadPhoto,
    getCurrentIndex: () => currentIndex,
    getPhotoCount: () => photos.length
  };
}
