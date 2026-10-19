'use client';

import {
  Bounds,
  ContactShadows,
  Environment,
  Lightformer,
  OrbitControls,
  useGLTF,
  useProgress,
} from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Component, type ReactNode, Suspense, useState } from 'react';

export interface ModelSceneProps {
  readonly url: string;
  readonly autoRotate?: boolean;
}

function Model({ url }: { readonly url: string }) {
  // (path, useDraco, useMeshopt): models are compressed with meshopt by
  // `gltf-transform optimize`, whose decoder ships with three — no CDN needed.
  const { scene } = useGLTF(url, false, true);
  return <primitive object={scene} />;
}

/** DOM overlay (outside the Canvas): drei's progress store is global, so it works here too. */
function LoadingOverlay() {
  const { active, progress } = useProgress();
  if (!active) return null;
  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center">
      <div className="rounded-full bg-white/90 px-4 py-2 font-display text-sm font-bold whitespace-nowrap text-ink shadow">
        Đang tải mô hình… {Math.round(progress)}%
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
    <div className="grid h-full w-full place-items-center p-6 text-center text-sm text-white/80">
      <div className="max-w-md space-y-2">
        <p className="font-display text-lg font-bold text-white">{title}</p>
        <p>{children}</p>
      </div>
    </div>
  );
}

/**
 * Interactive 3D viewer: drag to orbit 360°, scroll/pinch to zoom.
 * Studio lighting is built from Lightformers (no HDRI download).
 */
export default function ModelScene({ url, autoRotate = true }: ModelSceneProps) {
  const [interacting, setInteracting] = useState(false);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  if (failedUrl === url) {
    return (
      <ErrorMessage title="Không tải được mô hình 3D">
        Kiểm tra file <code className="rounded bg-black/30 px-1.5 py-0.5">{url}</code> đã có trong{' '}
        <code>public/</code> hoặc trên CDN chưa.
      </ErrorMessage>
    );
  }

  return (
    // Outer boundary: WebGL unavailable. Inner boundary (inside the Canvas): the model failed to
    // load; it reports up and the message renders as plain DOM, never inside the WebGL scene.
    <>
      <ErrorBoundary
        fallback={
          <ErrorMessage title="Trình duyệt không hỗ trợ WebGL">
            Hãy thử Chrome, Edge hoặc Firefox bản mới.
          </ErrorMessage>
        }
      >
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: [6, 4.5, 6], fov: 35, near: 0.1, far: 200 }}
          gl={{ antialias: true, preserveDrawingBuffer: false }}
        >
          <color attach="background" args={['#1d4f63']} />
          <hemisphereLight args={['#fff6e6', '#2d5f70', 0.6]} />
          <directionalLight position={[5, 8, 4]} intensity={1.6} castShadow shadow-mapSize={[2048, 2048]} />
          <ErrorBoundary
            fallback={null}
            onError={() => {
              setFailedUrl(url);
            }}
          >
            <Suspense fallback={null}>
              <Bounds fit clip observe margin={1.15}>
                <Model url={url} />
              </Bounds>
            </Suspense>
          </ErrorBoundary>
          <Suspense fallback={null}>
            <ContactShadows position={[0, -0.001, 0]} opacity={0.45} scale={14} blur={2.4} far={6} />
            <Environment resolution={256}>
              <Lightformer form="rect" intensity={2} position={[0, 5, -6]} scale={[10, 4, 1]} />
              <Lightformer
                form="rect"
                intensity={1}
                position={[-6, 2, 2]}
                scale={[4, 8, 1]}
                rotation-y={Math.PI / 2}
              />
              <Lightformer form="ring" intensity={1.5} position={[6, 3, 4]} scale={3} />
            </Environment>
          </Suspense>
          <OrbitControls
            makeDefault
            autoRotate={autoRotate && !interacting}
            autoRotateSpeed={0.8}
            enablePan={false}
            minPolarAngle={0.25}
            maxPolarAngle={Math.PI / 2.05}
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
