export default class Painter {
  constructor(width, height) {
    // eslint-disable-next-line no-undef
    this.scene = new THREE.Scene();
    // eslint-disable-next-line no-undef
    this.camera = new THREE.OrthographicCamera(width / - 2, width / 2, height / 2, height / - 2, -1000, 1000);
    // eslint-disable-next-line no-undef
    this.renderer = new THREE.WebGLRenderer({ 
      preserveDrawingBuffer: true,
      antialias: true
    });
    // this.renderer.setPixelRatio(window.devicePixelRatio || 1);
    this.renderer.setPixelRatio(2);
    this.renderer.setSize(width, height);
    this.maxAnisotropy = this.renderer.capabilities.getMaxAnisotropy();
  }

  add(sprite, name) {
    sprite.name = name;
    this.scene.add(sprite);
  }

  remove(name) {
    const selectedObject = this.scene.getObjectByName(name);
    this.scene.remove(selectedObject);
  }

  getDomElement() {
    return this.renderer.domElement;
  }

  render() {
    const {renderer, scene, camera} = this;
    renderer.render(scene, camera);
  }
}