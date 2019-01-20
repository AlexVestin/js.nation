let Renderer = new function() {

    const TARGET_FPS = 60;
    const MS_DELAY = 1000 / TARGET_FPS;

    let renderer;

    this.setUp = function() {
        renderer = new THREE.WebGLRenderer({alpha: true})
        renderer.setSize($(document).width(), $(document).height());
        renderer.domElement.id = "canvas-gl";
        $("#content").append(renderer.domElement);
        this.updateSize();
        //requestAnimationFrame(render);
        Callbacks.addCallback(render)
    }

    let render = function() {
        if (!Config.drawParticles) {
            return;
        }

        //requestAnimationFrame(render);
        renderer.render(Scene.glScene, Scene.glCamera);
    }

    this.updateSize = function(width, height) {
        if(!width || !height) {
            renderer.setSize($(document).width(), $(document).height());
        }else {
            renderer.setSize(width, height);
        }
        
    }

}
