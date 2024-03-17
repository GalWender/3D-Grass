import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
import GUI from 'lil-gui'
import { grassService } from './utils/grass'
import CustomShaderMaterial from 'three-custom-shader-material/vanilla'
import terrainVertexShader from './shaders/terrain/vertex.glsl'
import terrainFragmentShader from './shaders/terrain/fragment.glsl'

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
const perlinTexture = textureLoader.load('./textures/perlin/Perlin_noise.png')
perlinTexture.wrapS = THREE.RepeatWrapping
perlinTexture.wrapT = THREE.RepeatWrapping

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

// terrain 
const TerrainScale = 1
const terrainGeometry = new THREE.PlaneGeometry(30, 30, 500, 500)

// terrainGeometry.deleteAttribute('uv')
// terrainGeometry.deleteAttribute('normal')
terrainGeometry.rotateX(- Math.PI / 2)
const uniforms = {
    uColorWaterDeep: new THREE.Uniform(new THREE.Color('#002b3d')),
    uColorWaterSurface: new THREE.Uniform(new THREE.Color('#66a8ff')),
    uGrassBaseColor: new THREE.Uniform(new THREE.Color('#214c1a')),
    uColorSand: new THREE.Uniform(new THREE.Color('#ffe894')),
    uColorSnow: new THREE.Uniform(new THREE.Color('#ffffff')),
    uColorRock: new THREE.Uniform(new THREE.Color('#6d6d6d')),
}
const terrainMaterial = new THREE.ShaderMaterial({
    vertexShader: terrainVertexShader,
    fragmentShader: terrainFragmentShader,
    uniforms,
})

//watch threehourney shadow shader lesson with lighting
const terrainDepthMaterial = new THREE.ShaderMaterial({
    vertexShader: terrainVertexShader,
    fragmentShader: `
    void main() {
        gl_FragColor = vec4(vec3(gl_FragCoord.z), 1.0);
    }
`,
})

const terrianMesh = new THREE.Mesh(terrainGeometry,terrainMaterial)
terrianMesh.customDepthMaterial = terrainDepthMaterial
terrianMesh.receiveShadow = true
terrianMesh.castShadow = true
terrianMesh.scale.set(TerrainScale,TerrainScale,TerrainScale)
scene.add(terrianMesh)

//water 
// const waterMesh = new THREE.Mesh(
//     new THREE.PlaneGeometry(30,30,1,1),
//     new THREE.MeshPhysicalMaterial({
//         transmission:1,
//         roughness:0.3,
//     })
// )
// waterMesh.scale.set(TerrainScale,TerrainScale,TerrainScale)
// waterMesh.rotateX(-Math.PI /2)
// waterMesh.position.y = -0.1
// scene.add(waterMesh)


//grass
const grassGeometry = grassService.createGrassGeometry()
const grassMaterial = grassService.createGrassMaterial()
const grassMesh = new THREE.Mesh(grassGeometry, grassMaterial)
grassMesh.receiveShadow = true
grassMesh.castShadow = true
scene.add(grassMesh)


// grid floor
// const gridHelper = grassService.createGrassGrid()
// scene.add(gridHelper)

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 2)
directionalLight.position.set(6.25* 3, 3, 4 * 3)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.near = 0.1
directionalLight.shadow.camera.far = 30
directionalLight.shadow.camera.top = 8
directionalLight.shadow.camera.right = 8
directionalLight.shadow.camera.bottom = -8
directionalLight.shadow.camera.left = -8
scene.add(directionalLight)

const helper = new THREE.DirectionalLightHelper(directionalLight, 5);
scene.add(helper);

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
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.001, 100)
camera.position.set(0, 5, -25)
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

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()