import * as THREE from 'three'
import perlinTex from '../textures/perlin/Perlin_noise.png'

export const textureService = {
    loadTexture
}


function loadTexture() {
    const textureLoader = new THREE.TextureLoader()
    
    const perlinTexture = textureLoader.load(perlinTex)
    perlinTexture.wrapS = THREE.RepeatWrapping
    perlinTexture.wrapT = THREE.RepeatWrapping

    return {perlinTexture}

}