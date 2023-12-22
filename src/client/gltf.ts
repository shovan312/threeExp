import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const gltfLoader:GLTFLoader = new GLTFLoader();
export function loadGltf( path:string){
    return new Promise(function(resolve, reject){
        var progress=undefined;
        gltfLoader.load( path, resolve, progress, reject);
    });
}
