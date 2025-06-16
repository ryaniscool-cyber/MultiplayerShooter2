const socket = io();
const canvas = document.getElementById("gameCanvas");

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas });

renderer.setSize(window.innerWidth, window.innerHeight);

// Player cube
const player = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0x00ff00 })
);
scene.add(player);

// Other players
const others = {};

// Bullets
const bullets = [];

// Camera setup
camera.position.z = 5;

// Movement
const keys = {};
window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup', e => keys[e.key] = false);

// Shoot on space
window.addEventListener('keydown', e => {
  if (e.key === ' ') {
    const bullet = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.2, 0.5),
      new THREE.MeshBasicMaterial({ color: 0xffff00 })
    );
    bullet.position.copy(player.position);
    bullets.push(bullet);
    scene.add(bullet);
  }
});

// Socket events
socket.on("players", data => {
  for (let id in data) {
    if (id !== socket.id) {
      if (!others[id]) {
        const cube = new THREE.Mesh(
          new THREE.BoxGeometry(1, 1, 1),
          new THREE.MeshBasicMaterial({ color: 0xff0000 })
        );
        scene.add(cube);
        others[id] = cube;
      }
      others[id].position.set(data[id].x, data[id].y, data[id].z);
    }
  }

  // Remove disconnected players
  for (let id in others) {
    if (!data[id]) {
      scene.remove(others[id]);
      delete others[id];
    }
  }
});

// Animate loop
function animate() {
  requestAnimationFrame(animate);

  // Movement
  if (keys["w"]) player.position.z -= 0.1;
  if (keys["s"]) player.position.z += 0.1;
  if (keys["a"]) player.position.x -= 0.1;
  if (keys["d"]) player.position.x += 0.1;

  // Bullets move forward
  bullets.forEach(bullet => bullet.position.z -= 0.2);

  // Send player position
  socket.emit("update", {
    x: player.position.x,
    y: player.position.y,
    z: player.position.z
  });

  renderer.render(scene, camera);
}
animate();

