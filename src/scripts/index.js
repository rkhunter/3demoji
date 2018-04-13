import $ from 'jquery';
import * as THREE from 'three';
import { TimelineMax, Elastic } from 'gsap';

const evilEmoji = require('../assets/graphics/evil_o.png');
const wowEmoji = require('../assets/graphics/wow.png');
const OrbitControls = require('three-orbit-controls')(THREE);

// TODO: Injecting jQuery to Global for debugging. Remove later
window.$ = $;
window.jQuery = $;

let camera;
let controls;
let scene;
let renderer;
let mesh;
let geometry;
let material;

let time = 0;

const animate = () => {
  time += 1;
  material.uniforms.time.value = time;

  scene.rotation.x += (scene.destination.x - scene.rotation.x) * 0.05;
  scene.rotation.y += (scene.destination.y - scene.rotation.y) * 0.05;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

const init = () => {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  const container = $('#container').get(0);
  container.appendChild(renderer.domElement);

  // const camera =
  //   new THREE.PerspectiveCamera(
  //       VIEW_ANGLE,
  //       ASPECT,
  //       NEAR,
  //       FAR
  //   );
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.001, 100);
  camera.position.set(0, 0, 1);

  controls = new OrbitControls(camera, renderer.domElement);
  material = new THREE.ShaderMaterial({
    wireframe: true,
    extensions: {
      derivatives: '#extension GL_OES_standard_derivatives : enable',
    },
    uniforms: {
      time: {
        type: 'f',
        value: 0.0,
      },
      blend: {
        type: 'f',
        value: 0.0,
      },
      target: {
        type: 't',
        value: new THREE.TextureLoader().load(evilEmoji),
      },
      original: {
        type: 't',
        value: new THREE.TextureLoader().load(wowEmoji),
      },
    },
    vertexShader: $('#vertShader').text(),
    fragmentShader: $('#fragShader').text(),
    side: THREE.DoubleSide,
    transparent: true,
  });
  // PlaneGeometry(width : Float, height : Float, widthSegments : Integer, heightSegments : Integer)
  geometry = new THREE.PlaneGeometry(1, 1, 500, 500);

  mesh = new THREE.Mesh(geometry, material);

  scene.add(mesh);

  const blendTimeline = new TimelineMax({ paused: true }); // used for blending animation
  blendTimeline.to(material.uniforms.blend, 3, { value: 1, ease: Elastic.easeOut }, 0);
  // On Body Click transition emoji
  $('body').click(() => {
    // Determine flag, switch it in next block
    if ($('body').hasClass('blendTimelineReverse')) {
      // Do reverse animation
      blendTimeline.reverse();
    } else {
      // Animate in normal
      blendTimeline.play();
    }

    // Flag for future repetitive function exec
    $('body').toggleClass('blendTimelineReverse');
  });

  // Rotate on mouse move
  scene.destination = { x: 0, y: 0 };
  const mouseMove = (ev) => {
    const w = window.innerWidth;
    const wD2 = w / 2;
    const h = window.innerHeight;
    const hD2 = h / 2;

    // / (w / 2) for normalizing
    const x = (ev.clientX - wD2) / wD2;
    const y = (ev.clientY - hD2) / hD2;

    scene.destination = { x: y * 0.5, y: x * 0.5 };
  };

  $(window).mousemove(mouseMove);

  animate();
};

$(document).ready(init);
