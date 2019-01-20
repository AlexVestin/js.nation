

let GLBackground = new function() {
    const WHITELISTED_DOMAINS = ["i.imgur.com", "i.redd.it", "i.reddituploads.com"];

    let staticUrls = [
        "u9muu7r", "elUmrNS", "TcA4IsQ", "PaMnxZn", "P7hwlaN", 
        "I5O4QWi", "fT4bxpb", "U7Bx7FQ", "Qujelxk", "KAHqXM2", 
        "laGeYSO", "HdsWnkU", "xEanEAB", "NG3moRJ", "31E8sfB",  
        "XGiYXHs", "QBAbrBJ", "uclwgUc", "koPzyZ1", "8VfPY96"  
    ];

    const vertexShader = [
        "varying vec2 vUv;",
        "void main() {",
            "vUv = uv;",
            "gl_Position =   projectionMatrix * modelViewMatrix * vec4(position,1.0);",
        "}",
    ].join("\n");

    const fragmentShader = [
        "uniform sampler2D texture1;",
        "varying vec2 vUv;",

        "void main() {",
            "vec2 pos  = vUv;",
            "if(pos.x < 0.5) {",
                "pos.x = pos.x * 2.;",
            "}else {",
                "pos.x =  1. - (pos.x -0.5) * 2.;",
            "}",
            "gl_FragColor = texture2D(texture1, pos);",
        "}"
    ].join("\n");


    this.setBackground = function(url1, url2) {
        // CORS error on the reddit urls 
        let url = "https://images.pexels.com/photos/240040/pexels-photo-240040.jpeg"
        const textureLoader = new THREE.TextureLoader()
        textureLoader.crossOrigin = "";
        textureLoader.load(url, (texture) => {
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.generateMipMaps = false;

            var material = new THREE.ShaderMaterial( {
                uniforms: { texture1: {type: "t", value: texture } },
                vertexShader,
                fragmentShader,
            });
            
            // Plane with screen size
            // https://gist.github.com/ayamflow/96a1f554c3f88eef2f9d0024fc42940f
            let c = Canvas.canvas;    
            var aspect = c.width / c.height;
            var vFov = Scene.glCamera.fov * Math.PI / 180;
            let height = 2 * Math.tan(vFov / 2) * ( Scene.glCamera.position.z);
            let width =  (height * aspect);

            const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
            Scene.glScene.add(mesh);

           
            //Scene.glScene.background = texture;
        })
    }
    
    
    let handleRedditFail = function() {
        console.error("The client doesn't want to talk to the Reddit API today. Falling back to Imgur...");
        loadImgurBackground();
    }

    let loadImgurBackground = function(allowFallback = true) {
        $.ajax({
            url: "https://api.imgur.com/3/gallery/r/" + Config.backgroundSubreddit.toLowerCase() + "/0",
            method: "GET",
            headers: {
                Authorization: "Client-ID 0428dcb72fbc5da",
                Accept: "application/json"
            },
            data: {
                image: localStorage.dataBase64,
                type: "base64"
            },
            success: handleImgurData,
            error: allowFallback ? handleImgurFail : null
        });
    }
    
    let handleImgurData = function(result) {
        let posts = result.data;
        Util.shuffle(posts);
        let post;
        let found = false;
        for (let i = 0; i < posts.length; i++) {
            post = posts[i];
            if (post.width >= 2560) {
                found = true;
                break;
            }
        }

        if (!found) {
            console.error("Imgur has failed to offer an image satisfactory to the client; falling back to static "
                    + "background.");
            loadImgurBackground();
        }

        let id = result.data[Math.floor(Math.random() * result.data.length)].id;
        this.setBackground("http://i.imgur.com/" + id + ".jpg", "http://i.imgur.com/" + id + "m.jpg");
    }

    this.loadRedditBackground = function(allowFallback = true) {
        $.ajax({
            url: "https://www.reddit.com/r/" + Config.backgroundSubreddit + "/.json",
            method: "GET",
            success: handleRedditData,
            error: allowFallback ? handleRedditFail : null
        });
    }

    let handleRedditData = (result) => {
        let posts = result.data.children;
        Util.shuffle(posts);
        let post;
        let found = false;
        for (let i = 0; i < posts.length; i++) {
            post = posts[i];
            if (WHITELISTED_DOMAINS.indexOf(post.data.domain) != -1  && post.data.preview.images[0].source.width >= 2560) {
                found = true;
                break;
            }
        }

        if (!found) {
            console.error("Reddit has failed to offer an image satisfactory to the client; falling back to Imgur.");
            loadImgurBackground();
        }

        let smol = post.data.preview.images[0].resolutions[1].url.replaceAll("&amp;", "&");
        let full = post.data.url.replaceAll("&amp;", "&");
        console.log(this);
        this.setBackground(full, smol);
    }
}