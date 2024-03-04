import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
import GUI from 'lil-gui'
import { utilService } from './utils/util'
import grassFragmentShader from './shaders/grass/fragment.glsl'
import grassVertexShader from './shaders/grass/vertex.glsl'

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

//TextureLoader
const textureLoader = new THREE.TextureLoader()

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


const BLADE_WIDTH = 0.1
const BLADE_HEIGHT = 0.8
const BLADE_HEIGHT_VARIATION = 0.6
const BLADE_VERTEX_COUNT = 5
const BLADE_TIP_OFFSET = 0.1
const SURFACE_SIZE = 30
const GRASS_COUNT = 100000

function interpolate(val, oldMin, oldMax, newMin, newMax) {
    return ((val - oldMin) * (newMax - newMin)) / (oldMax - oldMin) + newMin
}

function computeBlade(center, index = 0) {
    const height = BLADE_HEIGHT + Math.random() * BLADE_HEIGHT_VARIATION
    const vIndex = index * BLADE_VERTEX_COUNT

    // Randomize blade orientation and tip angle
    const yaw = Math.random() * Math.PI * 2
    const yawVec = [Math.sin(yaw), 0, -Math.cos(yaw)]
    const bend = Math.random() * Math.PI * 2
    const bendVec = [Math.sin(bend), 0, -Math.cos(bend)]

    // Calc bottom, middle, and tip vertices
    const bl = yawVec.map((n, i) => n * (BLADE_WIDTH / 2) * 1 + center[i])
    const br = yawVec.map((n, i) => n * (BLADE_WIDTH / 2) * -1 + center[i])
    const tl = yawVec.map((n, i) => n * (BLADE_WIDTH / 4) * 1 + center[i])
    const tr = yawVec.map((n, i) => n * (BLADE_WIDTH / 4) * -1 + center[i])
    const tc = bendVec.map((n, i) => n * BLADE_TIP_OFFSET + center[i])

    // Attenuate height
    tl[1] += height / 2
    tr[1] += height / 2
    tc[1] += height

    return {
        positions: [...bl, ...br, ...tr, ...tl, ...tc],
        indices: [
            vIndex,
            vIndex + 1,
            vIndex + 2,
            vIndex + 2,
            vIndex + 4,
            vIndex + 3,
            vIndex + 3,
            vIndex,
            vIndex + 2
        ]
    }
}

class InstancedFloat16BufferAttribute extends THREE.InstancedBufferAttribute {

    constructor(array, itemSize, normalized, meshPerAttribute = 1) {

        super(new Uint16Array(array), itemSize, normalized, meshPerAttribute);

        this.isFloat16BufferAttribute = true;
    }
};

// function createGrassGeometry() {
//     const scalex = 0.1
//     const scaley = 0.15

//     const vertices = new Float32Array([
//         -1.0 * scalex, 0 * scaley, 0,     // v1
//         1.0 * scalex, 0 * scaley, 0,      // v2
//         1.0 * scalex, 2.0 * scaley, 0,       // v3

//         1.0 * scalex, 2.0 * scaley, 0,       // v4
//         -1.0 * scalex, 2.0 * scaley, 0,      // v5
//         -1.0 * scalex, 0 * scaley, 0,     // v6

//         -1.0 * scalex, 2.0 * scaley, 0,      // v7
//         1.0 * scalex, 2.0 * scaley, 0,       // v8
//         (1.0 - 0.1) * scalex, 4.0 * scaley, 0, // v9

//         (1.0 - 0.1) * scalex, 4.0 * scaley, 0, // v10
//         (-1.0 + 0.1) * scalex, 4.0 * scaley, 0, // v11
//         -1.0 * scalex, 2.0 * scaley, 0,      // v12

//         (-1.0 + 0.1) * scalex, 4.0 * scaley, 0, // v13
//         (1.0 - 0.1) * scalex, 4.0 * scaley, 0, // v14
//         (1.0 - 0.3) * scalex, 6.0 * scaley, 0,  // v15

//         (1.0 - 0.3) * scalex, 6.0 * scaley, 0, // v17
//         (-1.0 + 0.3) * scalex, 6.0 * scaley, 0, // v18
//         (-1.0 + 0.1) * scalex, 4.0 * scaley, 0, // v19

//         (-1.0 + 0.3) * scalex, 6.0 * scaley, 0, // v20
//         (1.0 - 0.3) * scalex, 6.0 * scaley, 0, // v21
//         (1.0 - 0.5) * scalex, 8.0 * scaley, 0,  // v22

//         (1.0 - 0.5) * scalex, 8.0 * scaley, 0, // v23
//         (-1.0 + 0.5) * scalex, 8.0 * scaley, 0, // v24
//         (-1.0 + 0.3) * scalex, 6.0 * scaley, 0, // v25

//         (-1.0 + 0.5) * scalex, 8.0 * scaley, 0, // v26
//         (1.0 - 0.5) * scalex, 8.0 * scaley, 0, // v27
//         0, 10.0 * scaley, 0,                  // v28
//     ]);

//     const geo = new THREE.InstancedBufferGeometry();
//     geo.instanceCount = NUM_GRASS;

//     const terrPosis = []
//     const angles = []
//     const indices = []
//     let index = 1
//     for (let i = 0; i < NUM_GRASS; i++) {
//         const posX = utilService.getRandomDoubleInclusive(-5, 5)
//         const posZ = utilService.getRandomDoubleInclusive(-5, 5)
//         const posY = 0.0

//         terrPosis.push(posX, posY, posZ)
//         let angle = Math.random() * 360;
//         angles.push(angle);
//         indices.push(index);
//         index++
//     }
//     geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
//     geo.setAttribute('terrPosi', new THREE.InstancedBufferAttribute(new Float32Array(terrPosis), 3))
//     geo.setAttribute('angle', new THREE.InstancedBufferAttribute(new Float32Array(angles), 1))
//     geo.setAttribute('indices', new THREE.InstancedBufferAttribute(new Float32Array(indices), 1))

//     return geo;
// }

function createGrassGeometry() {
    const positions = []
    const uvs = []
    const indices = []

    const geo = new THREE.BufferGeometry()

    for (let i = 0; i < GRASS_COUNT; i++) {
        const surfaceMin = (SURFACE_SIZE / 2) * -1
        const surfaceMax = SURFACE_SIZE / 2
        const radius = (SURFACE_SIZE / 2) * Math.random()
        const theta = Math.random() * 2 * Math.PI

        const x = radius * Math.cos(theta)
        const y = radius * Math.sin(theta)

        uvs.push(
            ...Array.from({ length: BLADE_VERTEX_COUNT }).flatMap(() => [
                interpolate(x, surfaceMin, surfaceMax, 0, 1),
                interpolate(y, surfaceMin, surfaceMax, 0, 1)
            ])
        )

        const blade = computeBlade([x, 0, y], i)
        positions.push(...blade.positions)
        indices.push(...blade.indices)
    }

    geo.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(positions), 3)
    )
    geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2))
    geo.setIndex(indices)
    geo.computeVertexNormals()

    return geo
}

const perlinTexture = textureLoader.load('./textures/perlin/Perlin_noise.png')
perlinTexture.wrapS = THREE.RepeatWrapping
perlinTexture.wrapT = THREE.RepeatWrapping

const grassGeometry = createGrassGeometry()

const grassMaterial = new THREE.ShaderMaterial({
    vertexShader: grassVertexShader,
    fragmentShader: grassFragmentShader,
    uniforms: {
        uTime: new THREE.Uniform(0),
        uPerlinTexture: new THREE.Uniform(perlinTexture)
    },
    // wireframe:true,
    side: THREE.DoubleSide
})
// const grassGeometry = new THREE.PlaneGeometry(15,15,15,15)
const grassMesh = new THREE.Mesh(grassGeometry, grassMaterial)
grassMesh.receiveShadow = true
grassMesh.castShadow = true



scene.add(grassMesh)


//grid floor

// const gridHelper = new THREE.GridHelper(SURFACE_SIZE, SURFACE_SIZE)
// // gridHelper.rotation.x = Math.PI /2
// scene.add(gridHelper)

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
camera.position.set(0, 6, -20)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
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
    grassMaterial.uniforms.uTime.value = elapsedTime
    
    // console.log(grassMaterial.uniforms.uTime.value);

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()