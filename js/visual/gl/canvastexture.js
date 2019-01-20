
let CanvasTexture = new function() {
    let mesh;
    this.setUp  = () => {
        let c = Canvas.canvas;
        let glCanvasTexture = new THREE.CanvasTexture(c);
        glCanvasTexture.minFilter = THREE.LinearFilter;

        // Plane with screen size
        // https://gist.github.com/ayamflow/96a1f554c3f88eef2f9d0024fc42940f
        var aspect = c.width / c.height;
        var vFov = Scene.glCamera.fov * Math.PI / 180;
        let height = 2 * Math.tan(vFov / 2) * ( Scene.glCamera.position.z);
        let width =  height * aspect;
        
        let geo = new THREE.PlaneGeometry(width, height);        

       
        let mat = new THREE.MeshBasicMaterial({map: glCanvasTexture, transparent: true});
        //mat = new THREE.MeshBasicMaterial({color: "red"});
        mesh = new THREE.Mesh(geo, mat);
        mesh.material.depthTest = false;

        mesh.renderOrder = 999;
        mesh.position.z = -150;
        mesh.onBeforeRender = function( renderer ) { glCanvasTexture.needsUpdate =true; renderer.clearDepth(); };
    
        Scene.glScene.add(mesh);
    }

    this.setSize = (size) => {
        const div = 1000*1000*10;
        const s = 1 + (size/div);
        if(mesh)
            mesh.scale.set(s,s,1);
    }

}
