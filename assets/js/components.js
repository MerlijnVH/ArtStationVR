AFRAME.registerComponent('waypoint', {
  schema: {
    isActive: { type: 'boolean', default: false }
  },
  init: function() {
    this.el.addEventListener('raycaster-intersected', function (evt) {
      this.components['waypoint'].data.isActive = true;
    });

    this.el.addEventListener('raycaster-intersected-cleared', function (evt) {
      this.components['waypoint'].data.isActive = false;
    });
  },
  tick: function() {
    var speed = 0.015;
    var object3D = this.el.object3D;

    if (this.data.isActive) {
      if (object3D.scale.x < 1.5) {
        object3D.scale.x += speed;
        object3D.scale.z += speed;
      } else {
        var mesh = this.el.getObject3D('mesh');

        var color = new THREE.Color(0.5, 0.5, 0.5);
        mesh.material.color = color;

        var position = this.el.components['position'].data;
        var tempPosition = new THREE.Vector3(position.x, position.y + 2, position.z);

        player.setAttribute('position', tempPosition);
      }
    } else {
      if (object3D.scale.x > 1) {
        object3D.scale.x -= speed;
        object3D.scale.z -= speed;
      }
    }
  }
});

AFRAME.registerComponent('logo', {
  schema: {
    speed: { type: 'float', default: 1.0 }
  },
  init: function () {

  },
  tick: function() {
    var object3D = this.el.object3D;

    var speedScale = 0.005;
    var speed = this.data.speed * speedScale;

    object3D.rotation.y += speed;
  }
});
