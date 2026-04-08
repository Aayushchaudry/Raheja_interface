import { useEffect, useRef, useState, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment } from '@react-three/drei'
import * as THREE from 'three'
import { useAppStore } from '../store/useAppStore'
import { useAudio } from '../hooks/useAudio'
import { Screen } from '../types'
import { COLORS } from '../utils/constants'
import gsap from 'gsap'

// Fallback procedural skyscraper if no model
function ProceduralSkyscraper({ progress }: { progress: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const wireRef = useRef<THREE.LineSegments>(null)

  const geometry = useMemo(() => {
    const geo = new THREE.BoxGeometry(1, 4, 1, 4, 16, 4)
    // Slightly taper the top
    const pos = geo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i)
      const taper = 1 - (y + 2) / 4 * 0.15
      pos.setX(i, pos.getX(i) * taper)
      pos.setZ(i, pos.getZ(i) * taper)
    }
    pos.needsUpdate = true
    geo.computeVertexNormals()
    return geo
  }, [])

  const wireGeometry = useMemo(() => new THREE.WireframeGeometry(geometry), [geometry])

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003
      // Reveal texture based on progress
      const mat = meshRef.current.material as THREE.MeshStandardMaterial
      mat.opacity = progress
    }
    if (wireRef.current) {
      wireRef.current.rotation.y += 0.003
      const mat = wireRef.current.material as THREE.LineBasicMaterial
      mat.opacity = 1 - progress * 0.7
    }
  })

  return (
    <group>
      {/* Wireframe */}
      <lineSegments ref={wireRef} geometry={wireGeometry}>
        <lineBasicMaterial color={COLORS.gold} transparent opacity={1} />
      </lineSegments>

      {/* Textured mesh */}
      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial
          color="#8CAACC"
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

// Converging gold lines
function GoldLines({ active }: { active: boolean }) {
  const linesRef = useRef<THREE.Group>(null)
  const lines = useMemo(() => {
    const arr: { start: THREE.Vector3; end: THREE.Vector3; speed: number }[] = []
    for (let i = 0; i < 50; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = 8 + Math.random() * 4
      arr.push({
        start: new THREE.Vector3(Math.cos(angle) * radius, (Math.random() - 0.5) * 6, Math.sin(angle) * radius),
        end: new THREE.Vector3(0, (Math.random() - 0.5) * 2, 0),
        speed: 1.5 + Math.random() * 1.5,
      })
    }
    return arr
  }, [])

  const progressRef = useRef(0)

  useFrame((_, delta) => {
    if (!active || !linesRef.current) return
    progressRef.current = Math.min(progressRef.current + delta * 0.5, 1)

    linesRef.current.children.forEach((child, i) => {
      const line = lines[i]
      const mesh = child as THREE.Line
      const geo = mesh.geometry as THREE.BufferGeometry
      const pos = geo.attributes.position
      const t = Math.min(progressRef.current * line.speed, 1)

      const currentX = line.start.x + (line.end.x - line.start.x) * t
      const currentY = line.start.y + (line.end.y - line.start.y) * t
      const currentZ = line.start.z + (line.end.z - line.start.z) * t

      pos.setXYZ(1, currentX, currentY, currentZ)
      pos.needsUpdate = true
    })
  })

  return (
    <group ref={linesRef}>
      {lines.map((line, i) => {
        const points = [line.start.clone(), line.start.clone()]
        const geo = new THREE.BufferGeometry().setFromPoints(points)
        return (
          <line key={i} geometry={geo}>
            <lineBasicMaterial color={COLORS.gold} transparent opacity={0.6} />
          </line>
        )
      })}
    </group>
  )
}

function Scene({ phase }: { phase: number }) {
  const [textureProgress, setTextureProgress] = useState(0)

  useEffect(() => {
    if (phase >= 2) {
      // Animate texture reveal
      gsap.to({ val: 0 }, {
        val: 1,
        duration: 2,
        delay: 0.5,
        ease: 'power1.inOut',
        onUpdate: function () {
          setTextureProgress(this.targets()[0].val)
        },
      })
    }
  }, [phase])

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <pointLight position={[0, 3, 0]} color={COLORS.gold} intensity={2} />

      <GoldLines active={phase >= 0} />
      <ProceduralSkyscraper progress={textureProgress} />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
        enableDamping
      />
      <Environment preset="city" />
    </>
  )
}

export default function Screen6LuxeReveal() {
  const setScreen = useAppStore((s) => s.setScreen)
  const { play, stop } = useAudio()
  const [phase, setPhase] = useState(0)
  const [showText, setShowText] = useState(false)

  useEffect(() => {
    play('constructionLayers')

    // Phase timeline
    const timers = [
      setTimeout(() => setPhase(1), 1500),   // Wireframe forming
      setTimeout(() => {
        setPhase(2)
        play('grandReveal')
      }, 3000),   // Start texture
      setTimeout(() => setShowText(true), 6500),  // Show headline
      setTimeout(() => {
        play('luxeAmbient')
      }, 7000),
      setTimeout(() => {
        setScreen(Screen.CTA)
      }, 13000),  // Auto-advance
    ]

    return () => {
      timers.forEach(clearTimeout)
      stop('constructionLayers')
      stop('grandReveal')
    }
  }, [play, stop, setScreen])

  return (
    <div className="w-full h-full bg-charcoal relative overflow-hidden screen-enter">
      {/* 3D Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [3, 2, 5], fov: 45 }}>
          <Scene phase={phase} />
        </Canvas>
      </div>

      {/* Text overlay */}
      {showText && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-end pb-24 pointer-events-none">
          <h1
            className="font-display text-6xl tracking-[0.2em] uppercase"
            style={{
              color: COLORS.gold,
              textShadow: `0 0 30px rgba(212,175,55,0.4)`,
              animation: 'screenFadeIn 1s ease-out forwards',
            }}
          >
            Proven Trust. Refined.
          </h1>
          <p
            className="mt-4 font-display text-xl italic tracking-wider text-pearl/80"
            style={{ animation: 'screenFadeIn 1s ease-out 0.5s forwards', opacity: 0 }}
          >
            Step into your first true sanctuary of vision.
          </p>
        </div>
      )}
    </div>
  )
}
