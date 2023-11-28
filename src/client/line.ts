import * as THREE from 'three';
import {ColorRepresentation, LineBasicMaterial, Texture} from "three";
const MeshLine = require('three.meshline').MeshLine;
const MeshLineMaterial = require('three.meshline').MeshLineMaterial;

export class Line {
    points: Array<THREE.Vector3> = [];
    curve:THREE.Mesh = new THREE.Mesh();
    material:any = new MeshLineMaterial({});
    texture: THREE.Texture = new Texture();
    options: any = {}

    constructor(points: Array<THREE.Vector3>=[], texture:THREE.Texture=new THREE.Texture(), color:THREE.Color=new THREE.Color(0x000000)) {
        this.texture = texture
        this.options = {
            map: this.texture,
            useMap: false,
            color: 0x000000,
            opacity: 1,//params.strokes ? .5 : 1,
            dashArray: 0.05,
            dashOffset: 0,
            dashRatio: 0,
            // resolution: resolution,
            sizeAttenuation: false,
            lineWidth: 0.1,
            // depthWrite: false,
            // depthTest: !false, //useMap
            // alphaTest: false ? .5 : 0, //useMap
            transparent: true,
            side: THREE.DoubleSide
        }
        this.makeLine(points)
    }

    public makeLine(inp:Array<THREE.Vector3>):THREE.Mesh {
        let geometry = new THREE.BufferGeometry().setFromPoints(inp);
        const line = new MeshLine();

        // @ts-ignore
        line.setGeometry(geometry, function(p) { return 1/70})//*Math.sin(p*2*Math.PI)});
        let color = new THREE.Color(0xee5511);
        this.material = new MeshLineMaterial(this.options);
        this.curve = new THREE.Mesh(line, this.material);
        return this.curve;
    }

    public update() {
        return this.makeLine(this.points)
    }
}


