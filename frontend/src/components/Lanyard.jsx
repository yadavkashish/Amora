/* eslint-disable react/no-unknown-property */
'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas, extend, useFrame } from '@react-three/fiber';
import { useGLTF, useTexture, Environment, Lightformer } from '@react-three/drei';
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

extend({ MeshLineGeometry, MeshLineMaterial });

export default function Lanyard({ position = [0, 0, 30], gravity = [0, -40, 0], fov = 20, transparent = true }) {
  return (
    <div className="relative w-full h-screen z-0">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="animate-floating-hearts w-full h-full bg-[url('/images/hearts.png')] bg-repeat opacity-10" />
      </div>

      <Canvas
        camera={{ position, fov }}
        gl={{ alpha: transparent }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color('#fff0f5'), transparent ? 0 : 1)}
      >
        <ambientLight intensity={Math.PI} color="#ffe4e6" />
        <Physics gravity={gravity} timeStep={1 / 60}>
          <Band />
        </Physics>
        <Environment blur={0.75}>
          <Lightformer intensity={3} color="#ffccd5" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="#ffafcc" position={[-1, 1, 3]} rotation={[0, 0, Math.PI / 2]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="#ffc8dd" position={[1, 1, 2]} rotation={[0, 0, Math.PI / 2]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={5} color="#ffb3c6" position={[0, 0, 10]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 5, 1]} />
        </Environment>
        <EffectComposer>
          <Bloom intensity={2.0} luminanceThreshold={0.2} luminanceSmoothing={0.8} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}

function Band({ maxSpeed = 50, minSpeed = 0 }) {
  const band = useRef(), fixed = useRef(), j1 = useRef(), j2 = useRef(), j3 = useRef(), card = useRef();
  const vec = new THREE.Vector3(), ang = new THREE.Vector3(), rot = new THREE.Vector3(), dir = new THREE.Vector3();
  const segmentProps = { type: 'dynamic', canSleep: true, colliders: false, angularDamping: 4, linearDamping: 4 };

  const { nodes } = useGLTF('/models/card.glb');
  const texture = useTexture('/textures/heart.png');

  const [curve] = useState(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()
  ]));

  const [dragged, drag] = useState(false);
  const [hovered, hover] = useState(false);
  const [isSmall, setIsSmall] = useState(() => typeof window !== 'undefined' && window.innerWidth < 1024);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.5, 0]]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => void (document.body.style.cursor = 'auto');
    }
  }, [hovered, dragged]);

  useEffect(() => {
    const handleResize = () => setIsSmall(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useFrame((state, delta) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z,
      });
    }

    if (fixed.current) {
      [j1, j2].forEach((ref) => {
        if (!ref.current.lerped)
          ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
        const clampedDistance = Math.max(
          0.1,
          Math.min(1, ref.current.lerped.distanceTo(ref.current.translation()))
        );
        ref.current.lerped.lerp(
          ref.current.translation(),
          delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed))
        );
      });

      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());

      band.current.geometry.setPoints(curve.getPoints(32));

      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());

      card.current.setAngvel({
        x: ang.x,
        y: 1.0,
        z: ang.z,
      });

      card.current.setAngularDamping(0.5);
    }
  });

  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  curve.curveType = 'chordal';

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 9]} ref={j1} {...segmentProps}><BallCollider args={[0.9]} /></RigidBody>
        <RigidBody position={[1, 9, 9]} ref={j2} {...segmentProps}><BallCollider args={[0.1]} /></RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}><BallCollider args={[0.1]} /></RigidBody>
        <RigidBody
          position={[2, 0, 0]}
          ref={card}
          {...segmentProps}
          type={dragged ? 'kinematicPosition' : 'dynamic'}
        >
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            rotation={[Math.PI / 2, (3 * Math.PI) / 2, 0]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e) => (e.target.releasePointerCapture(e.pointerId), drag(true))}
            onPointerDown={(e) => {
              e.target.setPointerCapture(e.pointerId),
              drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())))
            }}
          >
            <group>
              <mesh geometry={nodes.Heart_Heart_0.geometry} scale={1.05}>
                <shaderMaterial
                  attach="material"
                  transparent
                  side={THREE.BackSide}
                  uniforms={{
                    uTime: { value: 0 },
                    uColor: { value: new THREE.Color('#ffffff') }
                  }}
                  vertexShader={`
                    varying vec3 vNormal;
                    varying vec3 vWorldPosition;

                    void main() {
                      vNormal = normalize(normalMatrix * normal);
                      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                      vWorldPosition = worldPosition.xyz;
                      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                  `}
                  fragmentShader={`
                    varying vec3 vNormal;
                    varying vec3 vWorldPosition;

                    void main() {
                      float fresnel = pow(1.0 - dot(vNormal, normalize(vWorldPosition)), 3.0);
                      vec3 iridescence = vec3(0.6, 0.8, 1.0) + vec3(1.0, 0.8, 0.6) * fresnel;
                      gl_FragColor = vec4(iridescence, 0.25 + fresnel * 0.2);
                    }
                  `}
                />
              </mesh>
              <mesh
                geometry={nodes.Heart_Heart_0.geometry}
                material={new THREE.MeshStandardMaterial({
                  color: '#ff3366',
                  emissive: '#ff99aa',
                  emissiveIntensity: 2,
                  roughness: 0.5,
                  metalness: 0.6
                })}
                castShadow
                receiveShadow
              />
              <mesh
  geometry={nodes.Marble_Marble_0.geometry}
   scale={1.2} 
  material={new THREE.MeshStandardMaterial({
    color: 'grey',
    emissive: 'grey',          // Add a soft pink glow
    emissiveIntensity: 1.5,       // Adjust glow intensity
    transparent: true,
    opacity: 0.7,
    roughness: 0.9,
    metalness: 0.7
  })}
  castShadow
  receiveShadow
/>

            </group>
          </group>
        </RigidBody>
      </group>

      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="#ff6b81"
          depthTest={false}
          resolution={isSmall ? [1000, 2000] : [1000, 1000]}
          useMap
          map={texture}
          repeat={[-1, 0.5]}
          lineWidth={1}
          transparent
          opacity={1}
        />
      </mesh>
    </>
  );
}
