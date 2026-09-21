import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Group,
  LineSegments,
  LineBasicMaterial,
  EdgesGeometry,
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  TorusGeometry,
  Shape,
  ExtrudeGeometry,
  type BufferGeometry,
} from 'three';

type IconKind = 'founded' | 'facility' | 'projects' | 'withstand';

const AMBER = 0xffcc2a;
const AMBER_DIM = 0xc98f1c;

function edges(geometry: BufferGeometry, color: number, opacity = 1): LineSegments {
  return new LineSegments(
    new EdgesGeometry(geometry),
    new LineBasicMaterial({ color, transparent: opacity < 1, opacity })
  );
}

// A gear — torus rim, radial teeth, cylindrical hub. Stands in for
// "production commenced": the plant turning over for the first time.
function buildFounded(): Group {
  const group = new Group();
  group.add(edges(new TorusGeometry(0.6, 0.14, 8, 20), AMBER));
  const teeth = 10;
  for (let i = 0; i < teeth; i++) {
    const angle = (i / teeth) * Math.PI * 2;
    const tooth = edges(new BoxGeometry(0.14, 0.22, 0.14), AMBER, 0.85);
    tooth.position.set(Math.cos(angle) * 0.76, Math.sin(angle) * 0.76, 0);
    tooth.rotation.z = angle;
    group.add(tooth);
  }
  const hub = edges(new CylinderGeometry(0.2, 0.2, 0.32, 12), AMBER_DIM);
  hub.rotation.x = Math.PI / 2;
  group.add(hub);
  return group;
}

// Three stacked panel enclosures, shrinking toward the top — the shop
// floor's footprint, standing in for the manufacturing facility.
function buildFacility(): Group {
  const group = new Group();
  const sizes = [0.92, 0.72, 0.52];
  sizes.forEach((s, i) => {
    const box = edges(new BoxGeometry(s, 0.3, s), AMBER, 1 - i * 0.18);
    box.position.y = i * 0.34 - 0.36;
    group.add(box);
  });
  return group;
}

// A rocket — cone nose, cylinder body, two fins — for projects delivered.
function buildProjects(): Group {
  const group = new Group();
  const nose = edges(new ConeGeometry(0.28, 0.5, 10), AMBER);
  nose.position.y = 0.56;
  group.add(nose);
  group.add(edges(new CylinderGeometry(0.28, 0.28, 0.7, 10), AMBER));
  const finGeo = new BoxGeometry(0.08, 0.34, 0.46);
  for (const x of [-0.32, 0.32]) {
    const fin = edges(finGeo, AMBER_DIM, 0.9);
    fin.position.set(x, -0.9, 0);
    group.add(fin);
  }
  return group;
}

// A lightning bolt (extruded outline) ringed by a thin torus — the surge
// a short-circuit test puts through the panel, and the CPRI test ring.
function buildWithstand(): Group {
  const group = new Group();
  const shape = new Shape();
  shape.moveTo(0.05, 1);
  shape.lineTo(-0.25, 0.15);
  shape.lineTo(0.02, 0.15);
  shape.lineTo(-0.15, -1);
  shape.lineTo(0.3, -0.05);
  shape.lineTo(0.02, -0.05);
  shape.closePath();
  const boltGeo = new ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: false });
  boltGeo.center();
  boltGeo.scale(0.85, 0.85, 0.85);
  group.add(edges(boltGeo, AMBER));

  const ring = edges(new TorusGeometry(0.62, 0.025, 8, 28), AMBER_DIM, 0.65);
  ring.rotation.x = Math.PI / 2;
  group.add(ring);
  return group;
}

const builders: Record<IconKind, () => Group> = {
  founded: buildFounded,
  facility: buildFacility,
  projects: buildProjects,
  withstand: buildWithstand,
};

interface Instance {
  renderer: WebGLRenderer;
  scene: Scene;
  camera: PerspectiveCamera;
  group: Group;
  canvas: HTMLCanvasElement;
  active: boolean;
}

/**
 * Mounts a tiny rotating wireframe icon into every
 * `canvas[data-stat-icon]` on the page. One WebGL context per canvas —
 * fine at this scale (4 icons, ~56px each). Static single-frame render
 * when the visitor prefers reduced motion; animation otherwise, paused
 * via IntersectionObserver whenever a canvas scrolls out of view.
 */
export function initStatIcons(): void {
  const canvases = document.querySelectorAll<HTMLCanvasElement>('canvas[data-stat-icon]');
  if (!canvases.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const instances: Instance[] = [];

  canvases.forEach((canvas) => {
    const kind = canvas.dataset.statIcon as IconKind;
    const build = builders[kind];
    if (!build) return;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch {
      return;
    }

    const size = canvas.clientWidth || 56;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(size, size, false);

    const scene = new Scene();
    const camera = new PerspectiveCamera(40, 1, 0.1, 10);
    camera.position.set(0, 0, 3.1);

    const group = build();
    group.rotation.x = -0.2;
    scene.add(group);
    renderer.render(scene, camera);

    instances.push({ renderer, scene, camera, group, canvas, active: !prefersReducedMotion });
  });

  if (!instances.length || prefersReducedMotion) return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const inst = instances.find((i) => i.canvas === entry.target);
        if (inst) inst.active = entry.isIntersecting;
      }
    },
    { threshold: 0.15 }
  );
  instances.forEach((inst) => observer.observe(inst.canvas));

  window.addEventListener('resize', () => {
    for (const inst of instances) {
      const size = inst.canvas.clientWidth || 56;
      inst.renderer.setSize(size, size, false);
    }
  });

  function tick(now: number) {
    for (const inst of instances) {
      if (!inst.active) continue;
      inst.group.rotation.y = now * 0.00035;
      inst.renderer.render(inst.scene, inst.camera);
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
