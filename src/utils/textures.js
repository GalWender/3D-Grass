import * as THREE from 'three'

export const textureService = {
    loadTexture
}


function loadTexture() {
    const textureLoader = new THREE.TextureLoader()
    
    const perlinTexture = textureLoader.load('./src/textures/perlin/Perlin_noise.png')
    perlinTexture.wrapS = THREE.RepeatWrapping
    perlinTexture.wrapT = THREE.RepeatWrapping

    return {perlinTexture}

}