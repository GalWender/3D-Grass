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

// const BLADE_WIDTH = 0.1
const BLADE_HEIGHT = 0.8
const BLADE_HEIGHT_VARIATION = 0.6
const BLADE_VERTEX_COUNT = 7
const SURFACE_SIZE = 30
const GRASS_COUNT = 100000

const { perlinTexture } = textureService.loadTexture()

function computeBlade() {
    const height = BLADE_HEIGHT + Math.random() * BLADE_HEIGHT_VARIATION
    // const yaw = Math.random() * Math.PI * 2
    // const yawVec = [Math.sin(yaw), 0, -Math.cos(yaw)]
    const scaleX = 0.03
    const scaleY = 0.08 * height

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
    const vertID = new Uint8Array(GRASS_COUNT);

    const geo = new THREE.BufferGeometry()

    for (let i = 0; i < GRASS_COUNT; i++) {
        const surfaceMin = (SURFACE_SIZE / 2) * -1
        const surfaceMax = SURFACE_SIZE / 2

        const x = utilService.getRandomDoubleInclusive(surfaceMin, surfaceMax)
        const y = utilService.getRandomDoubleInclusive(surfaceMin, surfaceMax)


        uvs.push(
            ...Array.from({ length: 15 }).flatMap(() => [
                utilService.interpolate(x, surfaceMin, surfaceMax, 0, 1),
                utilService.interpolate(y, surfaceMin, surfaceMax, 0, 1)
            ])
        )

        let angle = Math.random() * 360
        const blade = computeBlade()
        positions.push(...blade.positions)
        for (let j = 0; j < 15; j++) {
            offsets.push(x, 0, y)
            angles.push(angle)
        }
        vertID[i] = i;
    }
    console.log(angles);
    console.log(positions);

    geo.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(positions), 3)
    )
    geo.setAttribute('vertIndex', new THREE.Uint8BufferAttribute(vertID, 1));
    geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2))
    geo.setAttribute('offsets', new THREE.BufferAttribute(new Float32Array(offsets), 3))
    geo.setAttribute('angle', new THREE.BufferAttribute(new Float32Array(angles), 1));
    geo.computeVertexNormals()

    return geo
}

function createGrassMaterial() {
    return new THREE.ShaderMaterial({
        vertexShader: grassVertexShader,
        fragmentShader: grassFragmentShader,
        uniforms: {
            uLog: new THREE.Uniform(0),
            uTime: new THREE.Uniform(0),
            uWind: new THREE.Uniform(new THREE.Vector2(1.0, 1.0)),
            uPerlinTexture: new THREE.Uniform(perlinTexture)
        },
        // wireframe:true,
        side: THREE.DoubleSide
    })
}

function createGrassGrid() {
    return new THREE.GridHelper(SURFACE_SIZE, SURFACE_SIZE)
}