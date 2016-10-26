var scene = document.querySelector('a-scene');
var player = document.querySelector('.player');

scene.addEventListener('loaded', initializeScene);

var nodes = [];
var countMax = 0;

var waypoints = [];

function initializeScene() {
  var startPosition = new THREE.Vector3(0, 2, 0);
  player.setAttribute('position', startPosition);

  var loader = new THREE.ColladaLoader();

  loader.load('assets/models/SM_World.dae', function (collada) {
    var model = collada.scene;
    var modelChildren = model.children[1].children;

    countMax = modelChildren.length;

    for (var i = 0; i < modelChildren.length; i++) {
      var modelChild = modelChildren[i];

      var node = {};
      node.position = modelChild.position;
      node.rotation = modelChild.rotation;

      nodes.push(node);
    }

    var modelChildren = model.children[4].children;

    for (var i = 0; i < modelChildren.length; i++) {
      var modelChild = modelChildren[i];

      var waypoint = {};
      waypoint.position = modelChild.position;
      waypoint.rotation = modelChild.rotation;

      waypoints.push(waypoint);
    }

    for (var i = 0; i < waypoints.length; i++) {
      var waypoint = waypoints[i];

      var position = new THREE.Vector3(waypoint.position.x, waypoint.position.z, -waypoint.position.y);
      var rotation = new THREE.Euler(waypoint.rotation.x, waypoint.rotation.z, waypoint.rotation.y, 'XYZ');

      createWaypoint(scene, waypoint, position, rotation);
      createWaypointBlob(scene, waypoint, position, rotation);
    }
  });

  createLogo();

  var requestURL = 'server/feed.php';
  var request = new XMLHttpRequest();
  request.open('GET', requestURL, true);

  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      var data = JSON.parse(request.responseText);

      var items = data['data'];

      var imageAspectMin = 0.65;
      var imageAspectMax = 2.35;

      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var node = nodes[i];

        var imageScale = 2;
        var imageAspect = item['cover']['aspect'];

        if (imageAspect < imageAspectMin) {
          imageAspect = imageAspectMin;
        }

        if (imageAspect > imageAspectMax) {
          imageAspect = imageAspectMax;
        }

        var imageWidth = imageScale;
        var imageHeight = imageScale / imageAspect;

        if (imageAspect > 1) {
          imageWidth = imageScale * imageAspect;
          imageHeight = imageScale;
        }

        var position = new THREE.Vector3(node.position.x, node.position.z, -node.position.y);
        var rotation = new THREE.Euler(node.rotation.x, -node.rotation.z, node.rotation.z, 'XYZ');

        position.y = position.y + 2;

        createFrame(scene, item, imageWidth, imageHeight, position, rotation);
        createPainting(scene, item, imageWidth, imageHeight, position, rotation);

        if (i >= countMax - 1) {
          return false;
        }
      }
    } else {
      // We reached our target server, but it returned an error
    }
  };

  request.onerror = function() {
    // There was a connection error of some sort
  };

  request.send();
}

function createLogo() {
  var loader = new THREE.ColladaLoader();

  loader.load('assets/models/SM_ArtStation.dae', function (collada) {
    var model = collada.scene;
    var object3D = model.children[0];

    var el = document.createElement('a-entity');

    el.setAttribute('position', new THREE.Vector3(0, 2.5, -20))
    el.setAttribute('logo', null);

    object3D.rotateX(Math.radians(270));

    var texture = new THREE.TextureLoader().load('assets/models/T_ArtStation.png');

    var material = new THREE.MeshPhongMaterial({
      color: 0xffa600,
      specular: 0xffffff,
      shininess: 15,
      emissive: 0xffa600,
      emissiveIntensity: 0.5,
      map: texture,
      shading: THREE.SmoothShading
    });

    object3D.children[0].material = material;

    el.setObject3D('object3D', object3D);
    scene.appendChild(el);
  });
}

function createWaypointBlob(scene, item, position, rotation) {
  var el = document.createElement('a-entity');

  var texture = new THREE.TextureLoader().load('assets/textures/T_Blob.png');

  var geometry = new THREE.PlaneGeometry(2.5, 2.5, 1);
  var material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    map: texture,
    side: THREE.FrontSide
  });
  material.transparent = true;
  var mesh = new THREE.Mesh(geometry, material);

  mesh.rotateX(Math.radians(-90));

  var position = new THREE.Vector3(position.x, position.y + 0.0015, position.z);

  el.setAttribute('position', position);

  el.setObject3D('mesh', mesh);
  scene.appendChild(el);
}

function createWaypoint(scene, item, position, rotation) {
  var el = document.createElement('a-entity');

  el.setAttribute('waypoint', null);

  var texture = new THREE.TextureLoader().load('assets/models/T_Waypoint.jpg');
  texture.minFilter = THREE.LinearFilter;

  var geometry = new THREE.CircleGeometry(0.75, 16);
  var material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    map: texture,
    side: THREE.FrontSide
  });
  var mesh = new THREE.Mesh(geometry, material);

  var position = new THREE.Vector3(position.x, position.y + 0.0025, position.z);

  mesh.rotateY(rotation.y);
  mesh.rotateX(Math.radians(-90));

  el.setAttribute('position', position);

  el.setObject3D('mesh', mesh);
  scene.appendChild(el);
}

function createFrame(scene, item, imageWidth, imageHeight, position, rotation) {
  var el = document.createElement('a-entity');

  var frameSize = 0.35;

  var geometry = new THREE.BoxGeometry(imageWidth + frameSize, imageHeight + frameSize, 0.05);
  var material = new THREE.MeshBasicMaterial({color: 0x101010, side: THREE.FrontSide});
  var mesh = new THREE.Mesh(geometry, material);

  mesh.position.set(position.x, position.y, position.z);

  mesh.rotateY(rotation.y);
  mesh.translateZ(-0.95);

  el.setObject3D('mesh', mesh);
  scene.appendChild(el);
}

function createPainting(scene, item, imageWidth, imageHeight, position, rotation) {
  var el = document.createElement('a-entity');

  var texture = new THREE.TextureLoader().load(item['cover']['medium_image_url']);
  texture.minFilter = THREE.LinearFilter;

  var geometry = new THREE.PlaneGeometry(imageWidth, imageHeight, 1);
  var material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.5,
    metalness: 0.25,
    map: texture,
    side: THREE.FrontSide
  });
  var mesh = new THREE.Mesh(geometry, material);

  mesh.position.set(position.x, position.y, position.z);

  mesh.rotateY(rotation.y);
  mesh.translateZ(-0.92);

  el.setObject3D('mesh', mesh);
  scene.appendChild(el);
}
