import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
import GUI from 'lil-gui'
import { utilService } from './utils/util'

/**
 * Base
 */
// Debug
const gui = new GUI({ width: 325 })
const debugObject = {}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Loaders
const rgbeLoader = new RGBELoader()

/**
 * Environment map
 */
rgbeLoader.load('/spruit_sunrise.hdr', (environmentMap) => {
    environmentMap.mapping = THREE.EquirectangularReflectionMapping

    scene.background = environmentMap
    scene.backgroundBlurriness = 0.5
    scene.environment = environmentMap
})


//grass blades
// const positions = []
// const indexes = []
// const uvs = []
// const grassBladesInstances = 1024
// const grassPatchX = 10
// const grassPatchY = 0
// const grassPatchZ = 10
// const grassBladeVertices = 15

const M_TMP = new THREE.Matrix4();
const S_TMP = new THREE.Sphere();
const AABB_TMP = new THREE.Box3();


const GRASS_SEGMENTS_LOW = 1;
const GRASS_SEGMENTS_HIGH = 6;
const GRASS_VERTICES_LOW = (GRASS_SEGMENTS_LOW + 1) * 2;
const GRASS_VERTICES_HIGH = (GRASS_SEGMENTS_HIGH + 1) * 2;
const GRASS_LOD_DIST = 15;
const GRASS_MAX_DIST = 100;

const GRASS_PATCH_SIZE = 10;
const NUM_GRASS = GRASS_PATCH_SIZE * GRASS_PATCH_SIZE * 4;

const GRASS_WIDTH = 0.1;
const GRASS_HEIGHT = 1.5;

class InstancedFloat16BufferAttribute extends THREE.InstancedBufferAttribute {

    constructor(array, itemSize, normalized, meshPerAttribute = 1) {

        super(new Uint16Array(array), itemSize, normalized, meshPerAttribute);

        this.isFloat16BufferAttribute = true;
    }
};

function createGrassTile() { //square tile //LOD support
    // const vertices = (segments + 1) * 2;
    // const indices = [];

    // for (let i = 0; i < segments; ++i) {

    // }
    const scalex = 0.1
    const scaley = 0.15

    const vertices = new Float32Array([
        -1.0 * scalex, 0 * scaley, 0,     // v1
        1.0 * scalex, 0 * scaley, 0,      // v2
        1.0 * scalex, 2.0 * scaley, 0,       // v3

        1.0 * scalex, 2.0 * scaley, 0,       // v4
        -1.0 * scalex, 2.0 * scaley, 0,      // v5
        -1.0 * scalex, 0 * scaley, 0,     // v6

        -1.0 * scalex, 2.0 * scaley, 0,      // v7
        1.0 * scalex, 2.0 * scaley, 0,       // v8
        (1.0 - 0.1) * scalex, 4.0 * scaley, 0, // v9

        (1.0 - 0.1) * scalex, 4.0 * scaley, 0, // v10
        (-1.0 + 0.1) * scalex, 4.0 * scaley, 0, // v11
        -1.0 * scalex, 2.0 * scaley, 0,      // v12

        (-1.0 + 0.1) * scalex, 4.0 * scaley, 0, // v13
        (1.0 - 0.1) * scalex, 4.0 * scaley, 0, // v14
        (1.0 - 0.3) * scalex, 6.0 * scaley, 0,  // v15

        (1.0 - 0.3) * scalex, 6.0 * scaley, 0, // v17
        (-1.0 + 0.3) * scalex, 6.0 * scaley, 0, // v18
        (-1.0 + 0.1) * scalex, 4.0 * scaley, 0, // v19

        (-1.0 + 0.3) * scalex, 6.0 * scaley, 0, // v20
        (1.0 - 0.3) * scalex, 6.0 * scaley, 0, // v21
        (1.0 - 0.5) * scalex, 8.0 * scaley, 0,  // v22

        (1.0 - 0.5) * scalex, 8.0 * scaley, 0, // v23
        (-1.0 + 0.5) * scalex, 8.0 * scaley, 0, // v24
        (-1.0 + 0.3) * scalex, 6.0 * scaley, 0, // v25

        (-1.0 + 0.5) * scalex, 8.0 * scaley, 0, // v26
        (1.0 - 0.5) * scalex, 8.0 * scaley, 0, // v27
        0, 10.0 * scaley, 0,                  // v28
    ]);

    const offsets = [];
    for (let i = 0; i < NUM_GRASS; ++i) {
        //-5, 200
        offsets.push(utilService.getRandomDoubleInclusive(-GRASS_PATCH_SIZE * 0.5, GRASS_PATCH_SIZE * 20));
        offsets.push(utilService.getRandomDoubleInclusive(-GRASS_PATCH_SIZE * 0.5, GRASS_PATCH_SIZE * 20));
        offsets.push(0);
    }

    // const offsetsData = offsets.map(THREE.DataUtils.toHalfFloat);

    // const vertID = new Uint8Array(vertices * 2);
    // for (let i = 0; i < vertices * 2; ++i) {
    //     vertID[i] = i;
    // }

    const geo = new THREE.InstancedBufferGeometry();
    geo.instanceCount = NUM_GRASS;
    // geo.setAttribute('vertIndex', new THREE.Uint8BufferAttribute(vertID, 1));
    geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    // geo.setIndex(indices);
    // geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 1 + GRASS_PATCH_SIZE * 2);

    return geo;
}

const grassMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide })
const grassGeometry = createGrassTile();
console.log(grassGeometry);
// const tempGeo = new THREE.SphereGeometry(2, 15, 15)
const grassMesh = new THREE.InstancedMesh(grassGeometry, grassMaterial, NUM_GRASS);

const matrix = new THREE.Matrix4(); // Create a matrix to hold the instance transformation
let index = 0
for (let x = -(GRASS_PATCH_SIZE / 2); x < (GRASS_PATCH_SIZE / 2); x += 0.5) {
    for (let z = -(GRASS_PATCH_SIZE / 2); z < (GRASS_PATCH_SIZE / 2); z += 0.5) {
        const posX = x + 0.25 + utilService.getRandomDoubleInclusive(-0.2, 0.2) // Calculate x position based on grid coordinate
        const posZ = z + 0.25 + utilService.getRandomDoubleInclusive(-0.2, 0.2); // Calculate z position based on grid coordinate
        const posY = 0; // Assuming y-coordinate is always 0

        matrix.makeTranslation(posX, posY, posZ); // Set the translation of the matrix

        grassMesh.setMatrixAt(index, matrix); // Apply the transformation to the instance at index
        index++
    }
}

grassMesh.instanceMatrix.needsUpdate = true;

console.log(grassMesh);
scene.add(grassMesh)


//grid floor

const gridHelper = new THREE.GridHelper(GRASS_PATCH_SIZE, GRASS_PATCH_SIZE)
// gridHelper.rotation.x = Math.PI /2
scene.add(gridHelper)

/**
 * Placeholder
 */
const placeholder = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2, 5),
    new THREE.MeshPhysicalMaterial()
)
// scene.add(placeholder)
// objects


/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 2)
directionalLight.position.set(6.25, 3, 4)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.near = 0.1
directionalLight.shadow.camera.far = 30
directionalLight.shadow.camera.top = 8
directionalLight.shadow.camera.right = 8
directionalLight.shadow.camera.bottom = -8
directionalLight.shadow.camera.left = -8
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(sizes.pixelRatio)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.set(-10, 6, -2)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()