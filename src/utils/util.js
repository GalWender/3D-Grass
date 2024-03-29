export const utilService = {
    getRandomIntInclusive,
    getRandomDoubleInclusive,
    interpolate
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}

function getRandomDoubleInclusive(min, max) {
    return Math.random() * (max - min) + min;
}

function interpolate(val, oldMin, oldMax, newMin, newMax) {
    return ((val - oldMin) * (newMax - newMin)) / (oldMax - oldMin) + newMin
}