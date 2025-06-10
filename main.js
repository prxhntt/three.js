let scene, camera, renderer, controls;
let planets = [];
let solarSystem;
let originalSpeeds = {};
let isPaused = false;
let darkMode = false;
let stars = [];


function init() {
    
    scene = new THREE.Scene();
    
   
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 100, 300);
    camera.lookAt(0, 0, 0);
    
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('scene-container').appendChild(renderer.domElement);
    

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; 
    controls.dampingFactor = 0.05;
    controls.minDistance = 50;
    controls.maxDistance = 1000; 
    controls.maxPolarAngle = Math.PI; 

    
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 1, 1);
    scene.add(directionalLight);
    
   
    createStars();
    
 
    createSolarSystem();
    

    createControls();
    
    
    window.addEventListener('resize', onWindowResize);
    document.getElementById('pause-btn').addEventListener('click', togglePause);
    document.getElementById('dark-mode').addEventListener('click', toggleDarkMode);
    
   
    animate();
}


function createStars() {
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1,
        transparent: true,
        opacity: 0.8
    });
    
    const starVertices = [];
    for (let i = 0; i < 5000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starVertices.push(x, y, z);
    }
    
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);
}


function createSolarSystem() {
    solarSystem = new THREE.Group();
    scene.add(solarSystem);
    
    planetData.forEach((planetInfo, index) => {
        const geometry = new THREE.SphereGeometry(planetInfo.radius, 32, 32);
        const material = new THREE.MeshPhongMaterial({ 
            color: planetInfo.color,
            shininess: 30
        });
        
        const planet = new THREE.Mesh(geometry, material);
        
        if (planetInfo.hasRing) {
            
            const ringGeometry = new THREE.RingGeometry(planetInfo.radius + 5, planetInfo.radius + 10, 32);
            const ringMaterial = new THREE.MeshPhongMaterial({
                color: 0xdddddd,
                side: THREE.DoubleSide
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = Math.PI / 2;
            planet.add(ring);
        }
        
        if (index !== 0) { 
            planet.position.x = planetInfo.distance;
            
            originalSpeeds[planetInfo.name] = planetInfo.speed;
            
        
            const orbitGeometry = new THREE.BufferGeometry();
            const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x555555 });
            
            const points = [];
            const segments = 64;
            for (let i = 0; i <= segments; i++) {
                const theta = (i / segments) * Math.PI * 2;
                points.push(new THREE.Vector3(
                    planetInfo.distance * Math.cos(theta),
                    0,
                    planetInfo.distance * Math.sin(theta)
                ));
            }
            
            orbitGeometry.setFromPoints(points);
            const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
            solarSystem.add(orbit);
        }
        
        planet.userData = { name: planetInfo.name, speed: planetInfo.speed, rotationSpeed: planetInfo.rotationSpeed || 0.005 };
        planets.push(planet);
        solarSystem.add(planet);
    });
}


function createControls() {
    const controlsContainer = document.getElementById('speed-controls');
    
    planets.forEach(planet => {
        if (planet.userData.name !== 'Sun') {
            const controlDiv = document.createElement('div');
            controlDiv.className = 'planet-control';
            
            const label = document.createElement('label');
            label.textContent = planet.userData.name;
            label.htmlFor = `speed-${planet.userData.name}`;
            
            const input = document.createElement('input');
            input.type = 'range';
            input.id = `speed-${planet.userData.name}`;
            input.min = '0';
            input.max = '0.2';
            input.step = '0.001';
            input.value = planet.userData.speed;
            
            input.addEventListener('input', (e) => {
                planet.userData.speed = parseFloat(e.target.value);
            });
            
            const speedValue = document.createElement('span');
            speedValue.textContent = ` (${planet.userData.speed.toFixed(3)})`;
            
            input.addEventListener('input', (e) => {
                speedValue.textContent = ` (${parseFloat(e.target.value).toFixed(3)})`;
            });
            
            controlDiv.appendChild(label);
            controlDiv.appendChild(input);
            controlDiv.appendChild(speedValue);
            controlsContainer.appendChild(controlDiv);
        }
    });
}


function animate() {
    requestAnimationFrame(animate);

    if (controls) controls.update();
    
    if (!isPaused) {
        planets.forEach(planet => {
            if (planet.userData.name !== 'Sun') {
              
                planet.position.x = Math.cos(planet.userData.speed * Date.now() / 1000) * planetData.find(p => p.name === planet.userData.name).distance;
                planet.position.z = Math.sin(planet.userData.speed * Date.now() / 1000) * planetData.find(p => p.name === planet.userData.name).distance;
            }
            
            
            planet.rotation.y += planet.userData.rotationSpeed;
        });
    }
    
    renderer.render(scene, camera);
}


function togglePause() {
    isPaused = !isPaused;
    document.getElementById('pause-btn').textContent = isPaused ? 'Resume' : 'Pause';
}


function toggleDarkMode() {
    darkMode = !darkMode;
    document.body.classList.toggle('dark-mode');
    document.getElementById('dark-mode').textContent = darkMode ? 'Light Mode' : 'Dark Mode';
}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}


document.addEventListener('DOMContentLoaded', init);