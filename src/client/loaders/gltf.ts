import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

const gltfLoader:GLTFLoader = new GLTFLoader();
export function loadGltf( path:string){
    return new Promise(function(resolve, reject){
        var progress=undefined;
        gltfLoader.load( path, resolve, progress, reject);
    });
}

const objLoader:OBJLoader = new OBJLoader();
export function loadObj( path:string){
    return new Promise(function(resolve, reject){
        var progress=undefined;
        objLoader.load( path, resolve, progress, reject);
    });
}
