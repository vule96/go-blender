'use client';

import {
  ContactShadows,
  Environment,
  Lightformer,
  OrbitControls,
  useGLTF,
  useProgress,
} from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { Component, type ReactNode, Suspense, useLayoutEffect, useMemo, useState } from 'react';
import {
  Box3,
  type DirectionalLight,
  type OrthographicCamera,
  setConsoleFunction,
  Sphere,
  Vector3,
} from 'three';

import type { Daypart } from '@/shared/lib/daypart';

export interface ModelSceneProps {
  readonly url: string;
  readonly autoRotate?: boolean;
  readonly daypart?: Daypart;
}

/*
 * @react-three/fiber 9 (latest as of three r186) still creates a THREE.Clock,
 * which three deprecated in r183 in favour of THREE.Timer. Drop that single
 * warning until fiber moves to Timer; every other three.js message passes through.
 */
setConsoleFunction((type: 'log' | 'warn' | 'error', message: string, ...params: unknown[]) => {
  if (type === 'warn' && message.startsWith('THREE.Clock:')) return;
  console[type](message, ...params);
});

/** Light rigs that match the backdrop: warm sun by day, cool moonlight by night. */
const LIGHTING = {
  day: {
    sky: '#e3f3ff',
    ground: '#9cbf7e',
    ambient: 1.1,
    key: '#fff1da',
    keyIntensity: 2.1,
    environment: 1,
    contactShadow: 0.35,
  },
  night: {
    sky: '#7d93c9',
    ground: '#1d2b26',
    ambient: 0.55,
    key: '#b9cbff',
    keyIntensity: 0.9,
    environment: 0.3,
    contactShadow: 0.5,
  },
} as const satisfies Record<Daypart, unknown>;

type Lighting = (typeof LIGHTING)[Daypart];

/** Classic isometric view direction: 45° around, 35.26° above the horizon. */
const ISO_DIRECTION = new Vector3(1, 1, 1).normalize();
/** Share of the viewport (shorter side) the model's bounding sphere may fill. */
const FILL = 0.92;

/** The parts of OrbitControls the framing touches. */
interface ZoomableControls {
  readonly target: Vector3;
  minZoom: number;
  maxZoom: number;
  update(): void;
}

interface Framing {
  readonly center: Vector3;
  readonly radius: number;
  readonly floorY: number;
}

/**
 * Frames the camera on the model synchronously, before the first frame is
 * drawn: no fly-in animation, the model simply appears in place.
 */
function useIsometricFraming({ center, radius }: Framing) {
  // three.js objects are mutable by design: read them from the store inside the
  // effect instead of mutating values returned by a hook.
  const get = useThree((s) => s.get);
  const width = useThree((s) => s.size.width);
  const height = useThree((s) => s.size.height);
  const hasControls = useThree((s) => s.controls !== null);

  useLayoutEffect(() => {
    const state = get();
    const camera = state.camera as OrthographicCamera;
    camera.position.copy(center).addScaledVector(ISO_DIRECTION, radius * 6);
    camera.near = 0.1;
    camera.far = radius * 20;
    camera.zoom = (Math.min(width, height) * FILL) / (radius * 2);
    camera.lookAt(center);
    camera.updateProjectionMatrix();
    const controls = state.controls as unknown as ZoomableControls | null;
    if (controls) {
      controls.target.copy(center);
      controls.minZoom = camera.zoom * 0.6;
      controls.maxZoom = camera.zoom * 4;
      controls.update();
    }
    // The model and the sun never move (only the camera orbits), so the shadow
    // map is rendered once instead of every frame.
    state.gl.shadowMap.autoUpdate = false;
    state.gl.shadowMap.needsUpdate = true;
  }, [center, get, hasControls, height, radius, width]);
}

function Model({ url, lighting }: { readonly url: string; readonly lighting: Lighting }) {
  // (path, useDraco, useMeshopt): models are compressed with meshopt by
  // `gltf-transform optimize`, whose decoder ships with three — no CDN needed.
  const { scene } = useGLTF(url, false, true);

  const framing = useMemo<Framing>(() => {
    scene.traverse((o) => {
      o.castShadow = true;
      o.receiveShadow = true;
    });
    const box = new Box3().setFromObject(scene);
    const sphere = box.getBoundingSphere(new Sphere());
    return { center: sphere.center, radius: sphere.radius, floorY: box.min.y };
  }, [scene]);

  useIsometricFraming(framing);

  const { center, radius, floorY } = framing;
  return (
    <>
      <primitive object={scene} />
      <KeyLight center={center} radius={radius} color={lighting.key} intensity={lighting.keyIntensity} />
      {/* Soft shadow under the base: the diorama hovers in front of the backdrop. */}
      <ContactShadows
        position={[center.x, floorY - radius * 0.04, center.z]}
        opacity={lighting.contactShadow}
        scale={radius * 2.6}
        blur={2.8}
        far={radius * 0.5}
        resolution={512}
        frames={1}
      />
    </>
  );
}

interface KeyLightProps {
  readonly center: Vector3;
  readonly radius: number;
  readonly color: string;
  readonly intensity: number;
}

/** Sun or moon: the shadow-casting light, its shadow camera sized to the model. */
function KeyLight({ center, radius, color, intensity }: KeyLightProps) {
  const position = useMemo(
    () => center.clone().add(new Vector3(-0.6, 1.1, 0.8).normalize().multiplyScalar(radius * 3)),
    [center, radius],
  );
  return (
    <directionalLight
      ref={(light: DirectionalLight | null) => {
        if (!light) return;
        light.target.position.copy(center);
        light.target.updateMatrixWorld();
        const cam = light.shadow.camera;
        cam.left = -radius;
        cam.right = radius;
        cam.top = radius;
        cam.bottom = -radius;
        cam.near = 0.1;
        cam.far = radius * 6;
        cam.updateProjectionMatrix();
      }}
      position={position}
      intensity={intensity}
      color={color}
      castShadow
      shadow-mapSize={[1024, 1024]}
      shadow-bias={-0.0004}
      shadow-normalBias={0.02}
    />
  );
}

/** DOM overlay (outside the Canvas): drei's progress store is global, so it works here too. */
function LoadingOverlay() {
  const { active, progress } = useProgress();
  if (!active) return null;
  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center">
      <div className="rounded-full bg-white/95 px-4 py-1.5 font-display text-sm font-bold whitespace-nowrap text-ink tabular-nums shadow-md">
        Đang tải mô hình {Math.round(progress)}%
      </div>
    </div>
  );
}

interface BoundaryState {
  readonly error: Error | null;
}

interface BoundaryProps {
  readonly children: ReactNode;
  readonly fallback: ReactNode;
  readonly onError?: (error: Error) => void;
}

class ErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  override state: BoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error) {
    this.props.onError?.(error);
  }

  override render() {
    return this.state.error ? this.props.fallback : this.props.children;
  }
}

function ErrorMessage({ title, children }: { readonly title: string; readonly children: ReactNode }) {
  return (
    <div className="grid h-full w-full place-items-center p-6">
      <div className="max-w-sm rounded-2xl border-4 border-sand-300 bg-sand-50 p-4 text-[15px] text-ink shadow-xl">
        <p className="font-display text-lg font-bold">{title}</p>
        <p className="mt-1 text-ink-muted">{children}</p>
      </div>
    </div>
  );
}

/**
 * Interactive 3D viewer: an orthographic, isometric camera (like the models'
 * diorama style), drag to orbit 360°, scroll/pinch to zoom. The canvas is
 * transparent; the outdoor backdrop behind it is plain DOM/SVG.
 */
export default function ModelScene({ url, autoRotate = true, daypart = 'day' }: ModelSceneProps) {
  const lighting = LIGHTING[daypart];
  const [interacting, setInteracting] = useState(false);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  if (failedUrl === url) {
    return (
      <ErrorMessage title="Không tải được mô hình 3D">
        Không tìm thấy file <code className="break-all text-ink">{url}</code>. Đặt file vào thư mục{' '}
        <code className="text-ink">public</code> hoặc tải lên CDN.
      </ErrorMessage>
    );
  }

  return (
    // Outer boundary: WebGL unavailable. Inner boundary (inside the Canvas): the model failed to
    // load; it reports up and the message renders as plain DOM, never inside the WebGL scene.
    <>
      <ErrorBoundary
        fallback={
          <ErrorMessage title="Trình duyệt này không hiển thị được 3D">
            Mở trang bằng Chrome, Edge, Firefox hoặc Safari bản mới.
          </ErrorMessage>
        }
      >
        <Canvas
          orthographic
          shadows="percentage"
          dpr={[1, 2]}
          camera={{ position: [50, 50, 50], zoom: 10, near: 0.1, far: 1000 }}
          gl={{ antialias: true, alpha: true }}
        >
          <hemisphereLight color={lighting.sky} groundColor={lighting.ground} intensity={lighting.ambient} />
          <ErrorBoundary
            fallback={null}
            onError={() => {
              setFailedUrl(url);
            }}
          >
            <Suspense fallback={null}>
              <Model url={url} lighting={lighting} />
            </Suspense>
          </ErrorBoundary>
          <Suspense fallback={null}>
            <Environment resolution={256} environmentIntensity={lighting.environment}>
              <Lightformer
                form="rect"
                intensity={1.6}
                position={[0, 6, -8]}
                scale={[12, 5, 1]}
                color="#dff0ff"
              />
              <Lightformer
                form="rect"
                intensity={0.8}
                position={[-8, 3, 3]}
                scale={[5, 8, 1]}
                rotation-y={Math.PI / 2}
              />
            </Environment>
          </Suspense>
          <OrbitControls
            makeDefault
            autoRotate={autoRotate && !interacting}
            autoRotateSpeed={0.6}
            enablePan={false}
            // Stay close to the isometric angle: from a low three-quarter view to a steep bird's-eye.
            minPolarAngle={0.55}
            maxPolarAngle={1.25}
            onStart={() => {
              setInteracting(true);
            }}
          />
        </Canvas>
      </ErrorBoundary>
      <LoadingOverlay />
    </>
  );
}
