let scene, camera, renderer, controls;
let planets = [];

const AU_SCALE = 150;
const SUN_RADIUS = 10;
const planetData = [
    { name: 'Mercury', radius: 0.38, distance: 0.39, color: 0xAAAAAA, orbitalPeriod: 88 },
    { name: 'Venus', radius: 0.95, distance: 0.72, color: 0xFFD700, orbitalPeriod: 225 },
    { name: 'Earth', radius: 1.0, distance: 1.0, color: 0x0000FF, orbitalPeriod: 365 },
    { name: 'Mars', radius: 0.53, distance: 1.52, color: 0xFF4500, orbitalPeriod: 687 },
    { name: 'Jupiter', radius: 11.2, distance: 5.2, color: 0xFFA500, orbitalPeriod: 4333 },
    { name: 'Saturn', radius: 9.45, distance: 9.58, color: 0xD3D3D3, orbitalPeriod: 10759 },
    { name: 'Uranus', radius: 4.0, distance: 19.2, color: 0xADD8E6, orbitalPeriod: 30687 },
    { name: 'Neptune', radius: 3.88, distance: 30.05, color: 0x4169E1, orbitalPeriod: 60190 }
];

function degToRad(degrees) {
    return degrees * (Math.PI / 180);
}

function init() {
    scene = new THREE.Scene();
  
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position.set(0, AU_SCALE * 3, AU_SCALE * 3);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.maxDistance = AU_SCALE * 50;
    controls.minDistance = SUN_RADIUS * 2;

    const pointLight = new THREE.PointLight(0xFFFFFF, 2, 0, 2);
    scene.add(pointLight);

    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    const sunGeometry = new THREE.SphereGeometry(SUN_RADIUS, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xFDB813 });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    planetData.forEach(data => {
        const distance = data.distance * AU_SCALE;
        const planetRadius = data.radius * 2;

        const planetGeometry = new THREE.SphereGeometry(planetRadius, 32, 32);
        const planetMaterial = new THREE.MeshPhongMaterial({ color: data.color });
        const planet = new THREE.Mesh(planetGeometry, planetMaterial);
        planet.name = data.name;

        const planetOrbit = new THREE.Object3D();
        planetOrbit.add(planet);
        scene.add(planetOrbit);

        planet.position.set(distance, 0, 0);

        planets.push({
            mesh: planet,
            orbit: planetOrbit,
            distance: distance,
            orbitalPeriod: data.orbitalPeriod,
            initialAngle: Math.random() * Math.PI * 2
        });

        const segments = 128;
        const orbitGeometry = new THREE.BufferGeometry();
        const points = [];
        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            points.push(new THREE.Vector3(distance * Math.cos(theta), 0, distance * Math.sin(theta)));
        }
        orbitGeometry.setFromPoints(points);
        const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x555555 });
        const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
        scene.add(orbitLine);
    });

    document.getElementById('loading-screen').style.display = 'none';

    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    const currentTime = Date.now();
    const millisecondsPerDay = 24 * 60 * 60 * 1000;

    planets.forEach(planet => {
        const angularSpeed = (2 * Math.PI) / (planet.orbitalPeriod * millisecondsPerDay);
        const elapsedMilliseconds = currentTime - startTime;
        const currentAngle = planet.initialAngle + (angularSpeed * elapsedMilliseconds);
        planet.orbit.rotation.y = currentAngle;
    });

    controls.update();
    renderer.render(scene, camera);
}

let startTime;

window.onload = function () {
    init();
    startTime = Date.now();
    animate();
};
