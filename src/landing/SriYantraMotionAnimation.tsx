/**
 * Sri Yantra particle motion (React Three Fiber).
 * `drive="page"` — window scroll drives shaders (Sravanam landing).
 * `drive="time"` — idle loop without scroll.
 * `drive="scroll"` — drei's ScrollControls (embedded tall canvas).
 */

import { PerspectiveCamera, ScrollControls, useScroll } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import type { CSSProperties, MutableRefObject, PointerEvent } from 'react'
import { Suspense, useCallback, useMemo, useRef } from 'react'
import * as THREE from 'three'

import {
  generateSriYantraPositions,
  SRI_YANTRA_PARTICLE_TIERS,
  type SriYantraMotionQuality,
} from './sriYantraGeometry'
import { sandFragmentShader, sandVertexShader } from './sriYantraShaders'

export { SRI_YANTRA_PARTICLE_TIERS, type SriYantraMotionQuality }

const CAMERA_DEFAULT: [number, number, number] = [0, 0, 4]
const CANVAS_DPR: [number, number] = [1, 2]

/** Opaque canvas clear — additive particles are nearly invisible on light parchment without a dark buffer. */
const CANVAS_BG = 0x14110e

export type SriYantraMotionAnimationProps = {
  className?: string
  style?: CSSProperties
  particleCount?: number
  quality?: SriYantraMotionQuality
  drive?: 'page' | 'scroll' | 'time'
  scrollPages?: number
  scrollDamping?: number
  infiniteScroll?: boolean
  cameraPosition?: [number, number, number]
  cameraFov?: number
  dpr?: number | [number, number]
}

type ScrollMetrics = {
  velocity: number
  speed: number
  normalizedSpeed: number
  direction: -1 | 0 | 1
  isScrolling: boolean
}

type InteractionState = {
  pointer: THREE.Vector2
  hover: number
  hoverTarget: number
  pulse: number
}

export function useSriYantraInteraction() {
  const interactionRef = useRef<InteractionState>({
    pointer: new THREE.Vector2(0, 0),
    hover: 0,
    hoverTarget: 0,
    pulse: 0,
  })

  const handlePointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width
    const y = (event.clientY - bounds.top) / bounds.height

    interactionRef.current.pointer.x = x * 2 - 1
    interactionRef.current.pointer.y = -(y * 2 - 1)
  }, [])

  const handlePointerEnter = useCallback(() => {
    interactionRef.current.hoverTarget = 1
  }, [])

  const handlePointerLeave = useCallback(() => {
    interactionRef.current.hoverTarget = 0
  }, [])

  const handlePointerDown = useCallback(() => {
    interactionRef.current.pulse = 1
  }, [])

  return {
    interactionRef,
    handlePointerMove,
    handlePointerEnter,
    handlePointerLeave,
    handlePointerDown,
  }
}

function SriYantraSparkPoints({
  scrollRef,
  scrollMetricsRef,
  interactionRef,
  particleCount,
}: {
  scrollRef: MutableRefObject<number>
  scrollMetricsRef: MutableRefObject<ScrollMetrics>
  interactionRef: MutableRefObject<InteractionState>
  particleCount: number
}) {
  const meshRef = useRef<THREE.Points | null>(null)
  const materialRef = useRef<THREE.ShaderMaterial | null>(null)
  const spinRef = useRef(0)

  const geometry = useMemo(() => {
    const data = generateSriYantraPositions(particleCount)
    const g = new THREE.BufferGeometry()
    const targetCopy = new Float32Array(data.positions)
    g.setAttribute('position', new THREE.BufferAttribute(data.positions, 3))
    g.setAttribute('aTargetPosition', new THREE.BufferAttribute(targetCopy, 3))
    g.setAttribute('aStartPosition', new THREE.BufferAttribute(data.startPositions, 3))
    g.setAttribute('aColor', new THREE.BufferAttribute(data.colors, 3))
    g.setAttribute('aScale', new THREE.BufferAttribute(data.scales, 1))
    g.setAttribute('aPhase', new THREE.BufferAttribute(data.phases, 1))
    return g
  }, [particleCount])

  useFrame((state, delta) => {
    const scrollProgress = scrollRef.current
    const scrollMetrics = scrollMetricsRef.current
    const interaction = interactionRef.current

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
      materialRef.current.uniforms.uScrollProgress.value = scrollProgress
      materialRef.current.uniforms.uVelocity.value = scrollMetrics.normalizedSpeed
      materialRef.current.uniforms.uHover.value = interaction.hover
      materialRef.current.uniforms.uPulse.value = interaction.pulse
      materialRef.current.uniforms.uPointer.value.set(interaction.pointer.x, interaction.pointer.y)
    }

    if (meshRef.current) {
      const tunnelDampen = scrollProgress > 0.75 ? 1.0 - Math.min((scrollProgress - 0.75) / 0.1, 1.0) : 1.0

      spinRef.current += delta * (0.15 + scrollMetrics.normalizedSpeed * 0.75) * tunnelDampen
      meshRef.current.rotation.z = spinRef.current * tunnelDampen

      const tilt = interaction.hover * 0.35 * tunnelDampen
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, interaction.pointer.y * tilt, 0.08)
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, interaction.pointer.x * tilt, 0.08)

      const scale = 1 + interaction.pulse * 0.03 * tunnelDampen
      meshRef.current.scale.setScalar(scale)
    }
  })

  return (
    <points ref={meshRef} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={sandVertexShader}
        fragmentShader={sandFragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uScrollProgress: { value: 0 },
          uExplosion: { value: 0 },
          uVelocity: { value: 0 },
          uHover: { value: 0 },
          uPulse: { value: 0 },
          uPointer: { value: new THREE.Vector2(0, 0) },
        }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

function SceneContent({
  interactionRef,
  scrollProgressRef,
  scrollMetricsRef,
  particleCount,
}: {
  interactionRef: MutableRefObject<InteractionState>
  scrollProgressRef: MutableRefObject<number>
  scrollMetricsRef: MutableRefObject<ScrollMetrics>
  particleCount: number
}) {
  return (
    <>
      <SriYantraSparkPoints
        scrollRef={scrollProgressRef}
        scrollMetricsRef={scrollMetricsRef}
        interactionRef={interactionRef}
        particleCount={particleCount}
      />
      <ambientLight intensity={0.32} color="#b8a078" />
      <pointLight position={[5, 5, 5]} intensity={0.45} color="#e8c86a" />
      <pointLight position={[-5, -5, 5]} intensity={0.38} color="#a67c3a" />
      <pointLight position={[0, 0, 10]} intensity={0.55} color="#f2e6d4" />
    </>
  )
}

function MotionSceneScroll({
  interactionRef,
  scrollProgressRef,
  particleCount,
}: {
  interactionRef: MutableRefObject<InteractionState>
  scrollProgressRef: MutableRefObject<number>
  particleCount: number
}) {
  const scroll = useScroll()
  const scrollMetricsRef = useRef<ScrollMetrics>({
    velocity: 0,
    speed: 0,
    normalizedSpeed: 0,
    direction: 0,
    isScrolling: false,
  })

  useFrame((_, delta) => {
    const offset = scroll.offset
    const prevOffset = scrollProgressRef.current

    let deltaOffset = offset - prevOffset
    if (Math.abs(deltaOffset) > 0.45) deltaOffset = 0

    const velocity = deltaOffset / Math.max(delta, 0.001)
    const speed = Math.abs(velocity)
    const normalizedSpeed = Math.min(speed * 2, 1)

    scrollProgressRef.current = offset
    scrollMetricsRef.current = {
      velocity,
      speed,
      normalizedSpeed,
      direction: velocity > 0.01 ? 1 : velocity < -0.01 ? -1 : 0,
      isScrolling: speed > 0.001,
    }

    const interaction = interactionRef.current
    interaction.hover += (interaction.hoverTarget - interaction.hover) * 0.08
    interaction.pulse = Math.max(0, interaction.pulse - delta * 0.9)
  }, -1)

  return (
    <SceneContent
      interactionRef={interactionRef}
      scrollProgressRef={scrollProgressRef}
      scrollMetricsRef={scrollMetricsRef}
      particleCount={particleCount}
    />
  )
}

function MotionSceneTime({
  interactionRef,
  scrollProgressRef,
  particleCount,
}: {
  interactionRef: MutableRefObject<InteractionState>
  scrollProgressRef: MutableRefObject<number>
  particleCount: number
}) {
  const scrollMetricsRef = useRef<ScrollMetrics>({
    velocity: 0,
    speed: 0,
    normalizedSpeed: 0,
    direction: 0,
    isScrolling: false,
  })
  const prevProgressRef = useRef(0)

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const offset = (Math.sin(t * 0.22) * 0.5 + 0.5) * 0.82 + 0.09

    const prevOffset = prevProgressRef.current
    let deltaOffset = offset - prevOffset
    if (Math.abs(deltaOffset) > 0.45) deltaOffset = 0
    prevProgressRef.current = offset
    scrollProgressRef.current = offset

    const velocity = deltaOffset / Math.max(delta, 0.001)
    const speed = Math.abs(velocity)
    const normalizedSpeed = Math.min(speed * 2, 1)

    scrollMetricsRef.current = {
      velocity,
      speed,
      normalizedSpeed,
      direction: velocity > 0.01 ? 1 : velocity < -0.01 ? -1 : 0,
      isScrolling: speed > 0.001,
    }

    const interaction = interactionRef.current
    interaction.hover += (interaction.hoverTarget - interaction.hover) * 0.08
    interaction.pulse = Math.max(0, interaction.pulse - delta * 0.9)
  }, -1)

  return (
    <SceneContent
      interactionRef={interactionRef}
      scrollProgressRef={scrollProgressRef}
      scrollMetricsRef={scrollMetricsRef}
      particleCount={particleCount}
    />
  )
}

/** Window / document scroll → shader progress (landing CTA stays fixed in CSS). */
function MotionScenePage({
  interactionRef,
  scrollProgressRef,
  particleCount,
}: {
  interactionRef: MutableRefObject<InteractionState>
  scrollProgressRef: MutableRefObject<number>
  particleCount: number
}) {
  const scrollMetricsRef = useRef<ScrollMetrics>({
    velocity: 0,
    speed: 0,
    normalizedSpeed: 0,
    direction: 0,
    isScrolling: false,
  })
  const prevOffsetRef = useRef(0)

  useFrame((_, delta) => {
    const el = document.documentElement
    const maxScroll = Math.max(1, el.scrollHeight - window.innerHeight)
    const y = window.scrollY
    const offset = Math.min(1, Math.max(0, y / maxScroll))

    const prevOffset = prevOffsetRef.current
    let deltaOffset = offset - prevOffset
    if (Math.abs(deltaOffset) > 0.45) deltaOffset = 0
    prevOffsetRef.current = offset
    scrollProgressRef.current = offset

    const velocity = deltaOffset / Math.max(delta, 0.001)
    const speed = Math.abs(velocity)
    const normalizedSpeed = Math.min(speed * 2.5, 1)

    scrollMetricsRef.current = {
      velocity,
      speed,
      normalizedSpeed,
      direction: velocity > 0.01 ? 1 : velocity < -0.01 ? -1 : 0,
      isScrolling: speed > 0.001,
    }

    const interaction = interactionRef.current
    interaction.hover += (interaction.hoverTarget - interaction.hover) * 0.08
    interaction.pulse = Math.max(0, interaction.pulse - delta * 0.9)
  }, -1)

  return (
    <SceneContent
      interactionRef={interactionRef}
      scrollProgressRef={scrollProgressRef}
      scrollMetricsRef={scrollMetricsRef}
      particleCount={particleCount}
    />
  )
}

export function SriYantraMotionAnimation({
  className,
  style,
  particleCount: particleCountProp,
  quality = 'medium',
  drive = 'page',
  scrollPages = 4,
  scrollDamping = 0.15,
  infiniteScroll = true,
  cameraPosition = CAMERA_DEFAULT,
  cameraFov = 60,
  dpr = CANVAS_DPR,
}: SriYantraMotionAnimationProps) {
  const scrollProgressRef = useRef(0)
  const { interactionRef, handlePointerMove, handlePointerEnter, handlePointerLeave, handlePointerDown } =
    useSriYantraInteraction()

  const particleCount = particleCountProp ?? SRI_YANTRA_PARTICLE_TIERS[quality]

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '100%',
        ...style,
      }}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          cursor: 'crosshair',
          touchAction: 'pan-y',
        }}
      >
        <Canvas
          camera={{ position: cameraPosition, fov: cameraFov }}
          onCreated={({ gl, scene }) => {
            scene.background = new THREE.Color(CANVAS_BG)
            gl.setClearColor(CANVAS_BG, 1)
          }}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
          }}
          dpr={dpr}
          style={{ width: '100%', height: '100%', display: 'block' }}
        >
          <Suspense fallback={null}>
            <PerspectiveCamera makeDefault position={cameraPosition} fov={cameraFov} />
            {drive === 'scroll' ? (
              <ScrollControls pages={scrollPages} damping={scrollDamping} infinite={infiniteScroll}>
                <MotionSceneScroll
                  interactionRef={interactionRef}
                  scrollProgressRef={scrollProgressRef}
                  particleCount={particleCount}
                />
              </ScrollControls>
            ) : drive === 'page' ? (
              <MotionScenePage
                interactionRef={interactionRef}
                scrollProgressRef={scrollProgressRef}
                particleCount={particleCount}
              />
            ) : (
              <MotionSceneTime
                interactionRef={interactionRef}
                scrollProgressRef={scrollProgressRef}
                particleCount={particleCount}
              />
            )}
          </Suspense>
        </Canvas>
      </div>
    </div>
  )
}

export default SriYantraMotionAnimation
