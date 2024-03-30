import * as THREE from 'three'
import grassFragmentShader from '../shaders/grass/fragment.glsl'
import grassVertexShader from '../shaders/grass/vertex.glsl'
import { utilService } from './util.js'
import { textureService } from './textures.js'

export const grassService = {
    createGrassGeometry,
    createGrassMaterial,
    createGrassGrid,
}

const BLADE_WIDTH = 0.1
const BLADE_HEIGHT = 0.8
const BLADE_HEIGHT_VARIATION = 0.6
const BLADE_VERTEX_COUNT = 15
const SURFACE_SIZE = 10
const GRASS_COUNT = 150000

const { perlinTexture } = textureService.loadTexture()

function computeBlade() {
    const height = BLADE_HEIGHT + Math.random() * BLADE_HEIGHT_VARIATION
    // const yaw = Math.random() * Math.PI * 2
    // const yawVec = [Math.sin(yaw), 0, -Math.cos(yaw)]
    // const scaleX = 0.03
    // const scaleY = 0.08 * height
    const scaleX = 0.005
    const scaleY = 0.01 * height
    // const scaleX = 1
    // const scaleY = 1 * height

    // // Randomize blade orientation

    const positions = [
        -1.0 * scaleX, 0 * scaleY, 0,
        1.0 * scaleX, 0 * scaleY, 0,
        1.0 * scaleX, 2.0 * scaleY, 0,

        1.0 * scaleX, 2.0 * scaleY, 0,
        -1.0 * scaleX, 2.0 * scaleY, 0,
        -1.0 * scaleX, 0 * scaleY, 0,

        -1.0 * scaleX, 2.0 * scaleY, 0,
        1.0 * scaleX, 2.0 * scaleY, 0,
        (1.0 - 0.2) * scaleX, 4.0 * scaleY, 0,

        (1.0 - 0.2) * scaleX, 4.0 * scaleY, 0,
        (-1.0 + 0.2) * scaleX, 4.0 * scaleY, 0,
        -1.0 * scaleX, 2.0 * scaleY, 0,

        (-1.0 + 0.2) * scaleX, 4.0 * scaleY, 0,
        (1.0 - 0.2) * scaleX, 4.0 * scaleY, 0,
        0 * scaleX, 7.0 * scaleY, 0,
    ]

    return {
        positions,
    }
}

function createGrassGeometry() {
    const positions = []
    const uvs = []
    const angles = []
    const offsets = []
    // const vertID = new Uint8Array(GRASS_COUNT);

    const geo = new THREE.BufferGeometry()

    for (let i = 0; i < GRASS_COUNT; i++) {
        const surfaceMin = (SURFACE_SIZE / 2) * -1
        const surfaceMax = SURFACE_SIZE / 2

        const x = utilService.getRandomDoubleInclusive(surfaceMin, surfaceMax)
        const y = utilService.getRandomDoubleInclusive(surfaceMin, surfaceMax)


        uvs.push(
            ...Array.from({ length: BLADE_VERTEX_COUNT }).flatMap(() => [
                utilService.interpolate(x, surfaceMin, surfaceMax, 0, 1),
                utilService.interpolate(y, surfaceMin, surfaceMax, 0, 1)
            ])
        )

        const angle = Math.random() * 360
        const blade = computeBlade()
        positions.push(...blade.positions)
        for (let j = 0; j < BLADE_VERTEX_COUNT; j++) {
            offsets.push(x, 0, y)
            angles.push(angle)
        }
    }

    // const GRASS_PER_CELL = 170; // Number of grass blades per cell
    // console.log(GRASS_PER_CELL * (SURFACE_SIZE / 0.4) * (SURFACE_SIZE / 0.4) * 45);
    // let index = 0
    // for (let x = -(SURFACE_SIZE / 2); x < (SURFACE_SIZE / 2); x += 0.4) {
    //     for (let z = -(SURFACE_SIZE / 2); z < (SURFACE_SIZE / 2); z += 0.4) {
    //         for (let i = 0; i < GRASS_PER_CELL; i++) {
    //             // const posX = x + 0.25 + utilService.getRandomDoubleInclusive(-0.15, 0.15); // Calculate x position based on grid coordinate
    //             // const posZ = z + 0.25 + utilService.getRandomDoubleInclusive(-0.15, 0.15); // Calculate z position based on grid coordinate
    //             const posX = x + 0.25 + utilService.getRandomDoubleInclusive(-0.15, 0.15); // Calculate x position based on grid coordinate
    //             const posZ = z + 0.25 + utilService.getRandomDoubleInclusive(-0.15, 0.15); // Calculate z position based on grid coordinate
    //             const posY = 0; // Assuming y-coordinate is always 0
    
    //             uvs.push(
    //                 ...Array.from({ length: 15 }).flatMap(() => [
    //                     utilService.interpolate(posX, -(SURFACE_SIZE / 2), (SURFACE_SIZE / 2), 0, 1),
    //                     utilService.interpolate(posZ, -(SURFACE_SIZE / 2), (SURFACE_SIZE / 2), 0, 1)
    //                 ])
    //             );
    
    //             const angle = Math.random() * 360;
    //             const blade = computeBlade();
    //             positions.push(...blade.positions);
    //             for (let j = 0; j < 15; j++) {
    //                 offsets.push(posX, posY, posZ);
    //                 angles.push(angle);
    //             }
    //             index+=15
    //             // vertID[i] = i;
    //         }
    //     }
    // }
    // const GRASS_PER_CELL = 170; // Number of grass blades per cell
    // console.log(GRASS_PER_CELL * (SURFACE_SIZE / 0.4) * (SURFACE_SIZE / 0.4) * 45);
    // let grassCount = 0
    // let vertexCount = 0
    // for (let x = -(SURFACE_SIZE / 2); x < (SURFACE_SIZE / 2); x += 0.05) {
    //     for (let z = -(SURFACE_SIZE / 2); z < (SURFACE_SIZE / 2); z += 0.05) {
    //         // for (let i = 0; i < GRASS_PER_CELL; i++) {
    //             // const posX = x + 0.25 + utilService.getRandomDoubleInclusive(-0.15, 0.15); // Calculate x position based on grid coordinate
    //             // const posZ = z + 0.25 + utilService.getRandomDoubleInclusive(-0.15, 0.15); // Calculate z position based on grid coordinate
    //             const posX = x + (Math.random() - 0.5) * 0.05 // Calculate x position based on grid coordinate
    //             const posZ = z + (Math.random() - 0.5) * 0.05// Calculate z position based on grid coordinate
    //             const posY = 0; // Assuming y-coordinate is always 0
    
    //             uvs.push(
    //                 ...Array.from({ length: 15 }).flatMap(() => [
    //                     utilService.interpolate(posX, -(SURFACE_SIZE / 2), (SURFACE_SIZE / 2), 0, 1),
    //                     utilService.interpolate(posZ, -(SURFACE_SIZE / 2), (SURFACE_SIZE / 2), 0, 1)
    //                 ])
    //             );
    
    //             const angle = Math.random() * 360;                          
    //             const blade = computeBlade();
    //             positions.push(...blade.positions);
    //             for (let j = 0; j < 15; j++) {
    //                 offsets.push(posX, posY, posZ);
    //                 angles.push(angle);
    //             }
    //             grassCount+=1
    //             vertexCount+=15
    //             // vertID[i] = i;
    //         // }
    //     }
    // }
    // console.log('grass amount: ',grassCount);
    // console.log('vertices count:',vertexCount);

    geo.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(positions, 3)
    )
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    geo.setAttribute('offsets', new THREE.Float32BufferAttribute(offsets, 3))
    geo.setAttribute('angle', new THREE.Float32BufferAttribute(angles, 1));
    geo.computeVertexNormals()

    return geo
}

function createGrassMaterial() {
    const uniforms = {
        uGrassBaseColor: new THREE.Uniform(new THREE.Color('#214c1a')),
        uGrassTipColor: new THREE.Uniform(new THREE.Color('#F6F193'))
    }
    return new THREE.ShaderMaterial({
        vertexShader: grassVertexShader,
        fragmentShader: grassFragmentShader,
        uniforms: {
            ...uniforms,
            uTime: new THREE.Uniform(0),
            uWind: new THREE.Uniform(new THREE.Vector2(1.0, 1.0)),
            uPerlinTexture: new THREE.Uniform(perlinTexture)
        },
        // wireframe:true,
        side: THREE.DoubleSide
    })
}

function createGrassGrid() {
    // return new THREE.GridHelper(SURFACE_SIZE, SURFACE_SIZE)
    const geo = new THREE.PlaneGeometry(SURFACE_SIZE, SURFACE_SIZE, SURFACE_SIZE, SURFACE_SIZE)
    const mat = new THREE.MeshBasicMaterial({color: '#007010'})
    const mesh = new THREE.Mesh(geo,mat)
    mesh.receiveShadow = true
    mesh.rotation.x = -Math.PI /2
    return mesh
}