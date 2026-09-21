import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Group,
  Mesh,
  LineSegments,
  LineBasicMaterial,
  MeshStandardMaterial,
  EdgesGeometry,
  IcosahedronGeometry,
  OctahedronGeometry,
  TetrahedronGeometry,
  DodecahedronGeometry,
  AmbientLight,
  DirectionalLight,
  PointLight,
  type BufferGeometry,
} from 'three';

type IconKind = 'founded' | 'facility' | 'projects' | 'withstand';

const AMBER = 0xffcc2a;

// One faceted gem per stat — a single mesh rather than an assembly of
// parts, so it reads as one solid, polished object even at ~52px instead
// of a scatter of disconnected lines. Shape alone tells the four apart;
// material and lighting are identical across all of them.
const geometryBuilders: Record<IconKind, () => BufferGeometry> = {
  founded: () => new IcosahedronGeometry(0.82, 0),
  facility: () => new OctahedronGeometry(0.92, 0),
  projects: () => new TetrahedronGeometry(0.98, 0),
  withstand: () => new DodecahedronGeometry(0.76, 0),
};

function buildGem(kind: IconKind): Group {
  const geometry = geometryBuilders[kind]();
  const material = new MeshStandardMaterial({
    color: 0x2a2110,
    emissive: AMBER,
    emissiveIntensity: 0.32,
    metalness: 0.55,
    roughness: 0.3,
  });
  const mesh = new Mesh(geometry, material);

  const outline = new LineSegments(
    new EdgesGeometry(geometry),
    new LineBasicMaterial({ color: AMBER, transparent: true, opacity: 0.9 })
  );

  const group = new Group();
  group.add(mesh, outline);
  return group;
}

interface Instance {
  renderer: WebGLRenderer;
  scene: Scene;
  camera: PerspectiveCamera;
  group: Group;
  canvas: HTMLCanvasElement;
  active: boolean;
  speed: number;
}

/**
 * Mounts a tiny rotating gem icon into every `canvas[data-stat-icon]` on
 * the page. One WebGL context per canvas — fine at this scale (4 icons,
 * ~56px each). Static single-frame render when the visitor prefers
 * reduced motion; animation otherwise, paused via IntersectionObserver
 * whenever a canvas scrolls out of view.
 */
export function initStatIcons(): void {
  const canvases = document.querySelectorAll<HTMLCanvasElement>('canvas[data-stat-icon]');
  if (!canvases.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const instances: Instance[] = [];

  canvases.forEach((canvas, i) => {
    const kind = canvas.dataset.statIcon as IconKind;
    if (!geometryBuilders[kind]) return;

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
    scene.add(new AmbientLight(0xffffff, 0.55));
    const key = new DirectionalLight(0xfff2cc, 1.4);
    key.position.set(1.4, 1.6, 2);
    scene.add(key);
    const rim = new PointLight(AMBER, 0.9, 8);
    rim.position.set(-1.5, -0.8, 1.2);
    scene.add(rim);

    const camera = new PerspectiveCamera(38, 1, 0.1, 10);
    camera.position.set(0, 0, 3.3);

    const group = buildGem(kind);
    group.rotation.set(-0.35, 0.5, 0);
    scene.add(group);
    renderer.render(scene, camera);

    instances.push({
      renderer,
      scene,
      camera,
      group,
      canvas,
      active: !prefersReducedMotion,
      speed: 0.00022 + i * 0.00004,
    });
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
      inst.group.rotation.y = now * inst.speed;
      inst.group.rotation.x = -0.35 + Math.sin(now * 0.00018) * 0.12;
      inst.renderer.render(inst.scene, inst.camera);
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
