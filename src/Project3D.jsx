import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Html, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

const towers = [
  { id: 'A', position: [-6.5, 0, 5.8], rotation: [0, Math.PI, 0], width: 11.8, depth: 4, units: 4, base: 'commercial' },
  { id: 'B', position: [6.5, 0, 5.8], rotation: [0, Math.PI, 0], width: 11.8, depth: 4, units: 4, base: 'commercial' },
  { id: 'C', position: [6.5, 0, -5.8], rotation: [0, 0, 0], width: 11.8, depth: 4, units: 4, base: 'residential' },
  { id: 'D', position: [-6.5, 0, -5.8], rotation: [0, 0, 0], width: 11.8, depth: 4, units: 4, base: 'residential' },
  { id: 'E', position: [-14.3, 0, 1.8], rotation: [0, Math.PI / 2, 0], width: 9.6, depth: 4.4, units: 3, base: 'amenity' },
]

const floorLabels = ['Planta baja', 'Nivel 1', 'Nivel 2', 'Nivel 3', 'Roof garden']

const facade = {
  stone: '#e7dfce',
  stoneShade: '#d1c5b2',
  olive: '#596b24',
  oliveDark: '#364919',
  glass: '#46615e',
  frame: '#806b4c',
  lattice: '#d8cebb',
}

function Box({ position, scale, color, roughness = 0.8, metalness = 0, ...props }) {
  return (
    <mesh position={position} scale={scale} castShadow receiveShadow {...props}>
      <boxGeometry />
      <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
    </mesh>
  )
}

function Plant({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.1, 0.4, 8]} />
        <meshStandardMaterial color="#765d3d" />
      </mesh>
      <mesh position={[0, 0.55, 0]} castShadow>
        <dodecahedronGeometry args={[0.34, 0]} />
        <meshStandardMaterial color="#527340" roughness={1} />
      </mesh>
    </group>
  )
}

function Tree({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.75, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.18, 1.5, 8]} />
        <meshStandardMaterial color="#705237" />
      </mesh>
      <mesh position={[0, 1.75, 0]} castShadow>
        <icosahedronGeometry args={[0.8, 1]} />
        <meshStandardMaterial color="#45683d" roughness={1} />
      </mesh>
      <mesh position={[0.35, 1.45, 0.18]} castShadow>
        <icosahedronGeometry args={[0.55, 1]} />
        <meshStandardMaterial color="#597b45" roughness={1} />
      </mesh>
    </group>
  )
}

function BalconyFurniture({ x, y, z }) {
  return (
    <group position={[x, y, z]}>
      <Box position={[0, 0.22, 0]} scale={[0.72, 0.08, 0.45]} color="#8e6b48" />
      <Box position={[-0.52, 0.24, 0]} scale={[0.34, 0.45, 0.34]} color="#b49a78" />
      <Box position={[0.52, 0.24, 0]} scale={[0.34, 0.45, 0.34]} color="#b49a78" />
    </group>
  )
}

function Screen({ position, height = 1.1 }) {
  return (
    <group position={position}>
      {[-0.3, -0.18, -0.06, 0.06, 0.18, 0.3].map((x) => (
        <Box key={x} position={[x, 0, 0]} scale={[0.035, height, 0.07]} color="#283a35" metalness={0.2} />
      ))}
    </group>
  )
}

function FacadeLattice({ position, height = 1.12 }) {
  return (
    <group position={position}>
      {[-0.3, -0.2, -0.1, 0, 0.1, 0.2, 0.3].map((x) => (
        <Box
          key={x}
          position={[x, 0, 0]}
          scale={[0.035, height, 0.055]}
          color={facade.lattice}
          roughness={0.92}
        />
      ))}
      <Box position={[0, height / 2 - 0.04, 0]} scale={[0.7, 0.055, 0.055]} color={facade.lattice} />
      <Box position={[0, -height / 2 + 0.04, 0]} scale={[0.7, 0.055, 0.055]} color={facade.lattice} />
    </group>
  )
}

function FoliageCluster({ position, scale = 1 }) {
  const leaves = [
    [-0.34, 0.02, 0, 0.26],
    [-0.12, 0.08, 0.03, 0.32],
    [0.14, 0.04, -0.02, 0.28],
    [0.36, 0.1, 0.02, 0.24],
  ]

  return (
    <group position={position} scale={scale}>
      {leaves.map(([x, y, z, size], index) => (
        <mesh key={x} position={[x, y, z]} scale={[1, 0.78, 0.72]} castShadow>
          <icosahedronGeometry args={[size, 1]} />
          <meshStandardMaterial
            color={index % 2 === 0 ? '#536b2b' : '#748642'}
            roughness={1}
          />
        </mesh>
      ))}
    </group>
  )
}

function ResidentialFacade({ y, width, depth, units, side, furnished = false }) {
  const bay = width / units
  const z = side * (depth / 2)

  return (
    <group>
      <Box
        position={[0, y - 0.7, z + side * 0.55]}
        scale={[width + 0.35, 0.13, 1.12]}
        color={facade.stoneShade}
      />
      {Array.from({ length: units }).map((_, index) => {
        const x = -width / 2 + bay / 2 + index * bay
        const latticeX = x + (index % 2 === 0 ? bay * 0.31 : -bay * 0.31)
        const glassX = x + (index % 2 === 0 ? -bay * 0.08 : bay * 0.08)

        return (
          <group key={`${side}-${x}`}>
            <Box
              position={[glassX, y + 0.03, z + side * 0.07]}
              scale={[bay * 0.67, 1.06, 0.08]}
              color={facade.glass}
              metalness={0.36}
              roughness={0.08}
            />
            <Box
              position={[glassX, y + 0.57, z + side * 0.12]}
              scale={[bay * 0.7, 0.09, 0.11]}
              color={facade.frame}
            />
            <Box
              position={[glassX, y - 0.51, z + side * 0.12]}
              scale={[bay * 0.7, 0.09, 0.11]}
              color={facade.frame}
            />
            <Box
              position={[glassX, y + 0.03, z + side * 0.12]}
              scale={[0.055, 1.06, 0.11]}
              color={facade.frame}
            />
            <FacadeLattice
              position={[latticeX, y + 0.03, z + side * 0.18]}
              height={1.12}
            />
            <Box
              position={[x, y - 0.4, z + side * 1.08]}
              scale={[bay - 0.15, 0.62, 0.08]}
              color={facade.olive}
              roughness={0.72}
            />
            <Box
              position={[x, y - 0.72, z + side * 0.61]}
              scale={[bay - 0.08, 0.1, 1.2]}
              color={facade.stone}
            />
            <FoliageCluster
              position={[
                x + (index % 2 === 0 ? bay * 0.16 : -bay * 0.16),
                y - 0.02,
                z + side * 1.04,
              ]}
              scale={0.82}
            />
            <FoliageCluster
              position={[
                x + (index % 2 === 0 ? -bay * 0.27 : bay * 0.27),
                y - 0.12,
                z + side * 1.04,
              ]}
              scale={0.58}
            />
            {furnished && (
              <>
                <BalconyFurniture x={x} y={y - 0.52} z={z + side * 0.82} />
                <Plant
                  position={[x - bay * 0.36, y - 0.5, z + side * 0.94]}
                  scale={0.3}
                />
              </>
            )}
          </group>
        )
      })}
    </group>
  )
}

function TowerEFacade({ y, width, depth, units }) {
  const bay = width / units

  return (
    <group>
      {[-1, 1].map((side) => {
        const z = side * (depth / 2)
        return (
          <group key={`facade-${side}`}>
            {Array.from({ length: units }).map((_, index) => {
              const x = -width / 2 + bay / 2 + index * bay
              return (
                <group key={`${side}-${x}`}>
                  <Box
                    position={[x, y + 0.03, z + side * 0.07]}
                    scale={[bay * 0.68, 1.06, 0.08]}
                    color={facade.glass}
                    metalness={0.36}
                    roughness={0.08}
                  />
                  <Box
                    position={[x, y + 0.57, z + side * 0.12]}
                    scale={[bay * 0.7, 0.09, 0.11]}
                    color={facade.frame}
                  />
                  <Box
                    position={[x, y - 0.51, z + side * 0.12]}
                    scale={[bay * 0.7, 0.09, 0.11]}
                    color={facade.frame}
                  />
                  <FacadeLattice
                    position={[x + (index % 2 === 0 ? bay * 0.3 : -bay * 0.3), y + 0.03, z + side * 0.18]}
                    height={1.12}
                  />
                </group>
              )
            })}
          </group>
        )
      })}

      {[-1, 1].map((side) => {
        const x = side * (width / 2)
        return (
          <group key={`terrace-${side}`}>
            <Box
              position={[x + side * 0.58, y - 0.7, 0]}
              scale={[1.22, 0.13, depth + 0.25]}
              color={facade.stone}
            />
            <Box
              position={[x + side * 1.12, y - 0.4, 0]}
              scale={[0.08, 0.62, depth + 0.12]}
              color={facade.olive}
            />
            <Box
              position={[x + side * 0.07, y + 0.03, 0]}
              scale={[0.08, 1.06, depth * 0.68]}
              color={facade.glass}
              metalness={0.36}
              roughness={0.08}
            />
            <Box
              position={[x + side * 0.12, y + 0.03, 0]}
              scale={[0.11, 1.06, 0.055]}
              color={facade.frame}
            />
            <FoliageCluster
              position={[x + side * 1.07, y - 0.06, -depth * 0.2]}
              scale={0.72}
            />
            <FoliageCluster
              position={[x + side * 1.07, y - 0.12, depth * 0.24]}
              scale={0.58}
            />
          </group>
        )
      })}
    </group>
  )
}

function GroundLevel({ width, depth, units, type, visible }) {
  if (!visible) return null
  const bays = Math.max(3, Math.round(width / 2.2))
  const residential = type === 'residential'
  const amenity = type === 'amenity'
  return (
    <group>
      <Box position={[0, 0.75, 0]} scale={[width, 1.5, depth]} color={facade.stone} />
      {[-1, 1].map((side) => (
        <group key={side}>
          <Box
            position={[0, 1.48, side * (depth / 2 + 0.22)]}
            scale={[width + 0.35, 0.16, 0.48]}
            color={facade.olive}
          />
          {Array.from({ length: amenity ? 3 : residential ? units : bays }).map((_, index, items) => {
            const count = items.length
            const x = -width / 2 + width / count / 2 + index * width / count
            const panelWidth = width / count - 0.2
            return (
              <group key={`${side}-${x}`}>
                <Box
                  position={[x, 0.76, side * (depth / 2 + 0.03)]}
                  scale={[panelWidth, 1.24, 0.07]}
                  color={amenity ? '#566963' : facade.glass}
                  metalness={0.4}
                  roughness={0.08}
                />
                <Box
                  position={[x - width / count / 2 + 0.05, 0.76, side * (depth / 2 + 0.13)]}
                  scale={[0.08, 1.5, 0.1]}
                  color={facade.frame}
                />
                <Box
                  position={[x, 0.12, side * (depth / 2 + 0.13)]}
                  scale={[panelWidth, 0.08, 0.1]}
                  color={facade.frame}
                />
                {amenity && (
                  <Screen
                    position={[x, 0.78, side * (depth / 2 + 0.17)]}
                    height={1.05}
                  />
                )}
              </group>
            )
          })}
        </group>
      ))}
    </group>
  )
}

function ResidentialLevel({ floor, width, depth, units, selected, visible, sideTerraces = false }) {
  if (!visible) return null
  const y = 1.65 + floor * 1.45
  return (
    <group>
      <Box
        position={[0, y, 0]}
        scale={[width, 1.32, depth]}
        color={selected ? '#f1eadc' : facade.stone}
      />
      {sideTerraces ? (
        <TowerEFacade y={y} width={width} depth={depth} units={units} />
      ) : (
        <>
          <ResidentialFacade y={y} width={width} depth={depth} units={units} side={1} furnished />
          <ResidentialFacade y={y} width={width} depth={depth} units={units} side={-1} />
        </>
      )}
    </group>
  )
}

function RoofTerraces({ width, depth, units, visible }) {
  if (!visible) return null
  const bay = width / units
  const divisions = Array.from({ length: units + 1 })
  return (
    <group position={[0, 6.25, 0]}>
      <Box position={[0, 0, 0]} scale={[width + 0.16, 0.14, depth + 0.12]} color={facade.stone} />
      <Box position={[0, 0.48, -depth / 2 + 0.08]} scale={[width, 0.95, 0.14]} color={facade.stoneShade} />
      <Box position={[0, 0.48, depth / 2 - 0.08]} scale={[width, 0.95, 0.14]} color={facade.oliveDark} />
      {divisions.map((_, index) => {
        const x = -width / 2 + index * bay
        return (
          <Box
            key={`division-${index}`}
            position={[x, 0.72, -0.15]}
            scale={[0.12, 1.45, depth - 0.45]}
            color={facade.stoneShade}
          />
        )
      })}
      {Array.from({ length: units }).map((_, index) => {
        const x = -width / 2 + bay / 2 + index * bay
        return (
          <group key={x}>
            {index % 2 === 0 && (
              <group>
                <Box position={[x - bay * 0.3, 1.18, 0.42]} scale={[0.06, 0.08, 1.55]} color="#394640" />
                <Box position={[x + bay * 0.3, 1.18, 0.42]} scale={[0.06, 0.08, 1.55]} color="#394640" />
                {[-0.42, -0.21, 0, 0.21, 0.42].map((ratio) => (
                  <Box
                    key={ratio}
                    position={[x, 1.15, 0.42 + ratio * 1.4]}
                    scale={[bay * 0.62, 0.05, 0.045]}
                    color="#394640"
                  />
                ))}
              </group>
            )}
            <BalconyFurniture x={x} y={0.16} z={0.3} />
            <Plant position={[x + bay * 0.32, 0.08, -0.65]} scale={0.44} />
          </group>
        )
      })}
    </group>
  )
}

function BuildingWing({ tower, activeTower, level, onSelect }) {
  const selected = activeTower === tower.id
  const showAll = level === 'all'

  return (
    <group
      position={tower.position}
      rotation={tower.rotation}
      onClick={(event) => {
        event.stopPropagation()
        onSelect(tower.id)
      }}
    >
      <GroundLevel
        width={tower.width}
        depth={tower.depth}
        units={tower.units}
        type={tower.base}
        visible={showAll || level === 0}
      />
      {[1, 2, 3].map((floor) => (
        <ResidentialLevel
          key={floor}
          floor={floor}
          width={tower.width}
          depth={tower.depth}
          units={tower.units}
          selected={selected}
          visible={showAll || level === floor}
          sideTerraces={tower.id === 'E'}
        />
      ))}
      <RoofTerraces
        width={tower.width}
        depth={tower.depth}
        units={tower.units}
        visible={showAll || level === 4}
      />
      {selected && (
        <>
          <mesh position={[0, 3.5, 0]}>
            <boxGeometry args={[tower.width + 0.45, 7.1, tower.depth + 0.6]} />
            <meshBasicMaterial color="#d7ff52" transparent opacity={0.08} depthWrite={false} />
          </mesh>
          <Html position={[0, 8.05, 0]} center distanceFactor={15}>
            <div className="tower-label">
              <span>Bloque</span>
              <strong>{tower.id}</strong>
            </div>
          </Html>
        </>
      )}
    </group>
  )
}

function ProjectBase() {
  return (
    <group>
      <Box position={[-0.8, -0.55, 0]} scale={[31, 0.9, 18.8]} color="#d2d0ca" />
      <Box position={[-0.8, -0.08, 0]} scale={[30, 0.12, 17.8]} color="#bdbbb4" />
      <Box position={[0, 0.02, 0]} scale={[24.2, 0.08, 6.4]} color="#73815d" />
      <Box position={[0, 0.07, 0]} scale={[2.25, 0.12, 5.8]} color="#d5cbb9" />
      {[-2.25, -0.75, 0.75, 2.25].map((z) => (
        <Box key={`path-${z}`} position={[0, 0.14, z]} scale={[1.78, 0.05, 0.82]} color="#b5aa97" />
      ))}
      {[
        [-9, 0, 0], [-5.8, 0, -1.6], [-2.8, 0, 1.7], [2.8, 0, -1.7],
        [5.8, 0, 1.6], [9, 0, 0], [-7.4, 0, 1.7], [7.4, 0, -1.7],
      ].map((position, index) => <Tree key={index} position={position} scale={0.68 + index % 3 * 0.08} />)}
      {[-7.4, -4.2, 4.2, 7.4].map((x, index) => (
        <group key={x} position={[x, 0, index % 2 === 0 ? 1.25 : -1.25]}>
          <Box position={[0, 0.32, 0]} scale={[1.35, 0.16, 0.48]} color="#836d51" />
          <Box position={[0, 0.62, -0.2]} scale={[1.35, 0.58, 0.12]} color="#836d51" />
          <Box position={[-0.55, 0.14, 0]} scale={[0.12, 0.28, 0.42]} color="#4d5149" />
          <Box position={[0.55, 0.14, 0]} scale={[0.12, 0.28, 0.42]} color="#4d5149" />
        </group>
      ))}
      <Box position={[0, -0.72, 9]} scale={[13.2, 0.42, 1.5]} color="#aeadab" />
      <Box position={[-15.2, 0.55, 6.5]} scale={[1.7, 1.1, 1.4]} color="#dedbd2" />
      <Screen position={[-15.2, 0.6, 7.25]} height={1} />
    </group>
  )
}

function Rug({ position, scale, color = '#c8b79f' }) {
  return <Box position={position} scale={scale} color={color} roughness={1} />
}

function Bed({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      <Box position={[0, 0.28, 0]} scale={[2.15, 0.38, 2.75]} color="#d9d2c5" />
      <Box position={[0, 0.52, -1.18]} scale={[2.25, 0.75, 0.16]} color="#806f5e" />
      <Box position={[-0.52, 0.53, -0.72]} scale={[0.88, 0.16, 0.55]} color="#f3efe6" />
      <Box position={[0.52, 0.53, -0.72]} scale={[0.88, 0.16, 0.55]} color="#f3efe6" />
      <Box position={[0, 0.5, 0.34]} scale={[1.9, 0.12, 1.15]} color="#aab48d" />
    </group>
  )
}

function Sofa({ position, rotation = [0, 0, 0], color = '#d8d0c1' }) {
  return (
    <group position={position} rotation={rotation}>
      <Box position={[0, 0.35, 0]} scale={[2.45, 0.55, 0.85]} color={color} />
      <Box position={[0, 0.72, -0.36]} scale={[2.45, 0.7, 0.18]} color={color} />
      <Box position={[-1.12, 0.57, 0]} scale={[0.2, 0.58, 0.88]} color={color} />
      <Box position={[1.12, 0.57, 0]} scale={[0.2, 0.58, 0.88]} color={color} />
    </group>
  )
}

function DiningTable({ position, seats = 6 }) {
  return (
    <group position={position}>
      <Box position={[0, 0.68, 0]} scale={[2.45, 0.12, 1.05]} color="#92765c" />
      <Box position={[-0.85, 0.33, 0]} scale={[0.1, 0.68, 0.1]} color="#5f554a" />
      <Box position={[0.85, 0.33, 0]} scale={[0.1, 0.68, 0.1]} color="#5f554a" />
      {Array.from({ length: seats }).map((_, index) => {
        const side = index < seats / 2 ? -1 : 1
        const column = index % (seats / 2)
        const x = (column - (seats / 2 - 1) / 2) * 0.82
        return (
          <group key={index} position={[x, 0, side * 0.84]}>
            <Box position={[0, 0.38, 0]} scale={[0.46, 0.12, 0.46]} color="#b7a58e" />
            <Box position={[0, 0.68, side * 0.18]} scale={[0.46, 0.58, 0.1]} color="#b7a58e" />
          </group>
        )
      })}
    </group>
  )
}

function SpiralStair({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.35, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 2.7, 12]} />
        <meshStandardMaterial color="#3e4944" />
      </mesh>
      {Array.from({ length: 14 }).map((_, index) => {
        const angle = index * 0.48
        return (
          <Box
            key={index}
            position={[Math.cos(angle) * 0.55, 0.16 + index * 0.18, Math.sin(angle) * 0.55]}
            rotation={[0, -angle, 0]}
            scale={[1.15, 0.1, 0.32]}
            color="#8a7359"
          />
        )
      })}
    </group>
  )
}

function RoomLabel({ position, children }) {
  return (
    <Html position={position} center distanceFactor={11}>
      <span className="room-label">{children}</span>
    </Html>
  )
}

function ApartmentC304() {
  const wall = '#eee9dd'
  const glass = '#7b9992'

  return (
    <group position={[0, 0, 0.5]}>
      <Box position={[0, -0.12, 0]} scale={[12.3, 0.22, 9.2]} color="#d6c9b6" />
      <Rug position={[0, 0.015, 0.65]} scale={[3.6, 0.035, 2.65]} color="#b9ad98" />

      <Box position={[-6.05, 1.45, 0]} scale={[0.18, 2.9, 9.2]} color={wall} />
      <Box position={[6.05, 1.45, 0]} scale={[0.18, 2.9, 9.2]} color={wall} />
      <Box position={[0, 1.45, -4.5]} scale={[12.3, 2.9, 0.18]} color={wall} />

      <Box position={[-3.2, 1.45, -2.1]} scale={[0.16, 2.9, 4.65]} color={wall} />
      <Box position={[3.1, 1.45, -1.75]} scale={[0.16, 2.9, 5.4]} color={wall} />
      <Box position={[4.55, 1.45, 0.85]} scale={[3, 2.9, 0.16]} color={wall} />
      <Box position={[4.55, 1.45, 2.35]} scale={[3, 2.9, 0.16]} color={wall} />
      <Box position={[-4.6, 1.45, 1.45]} scale={[2.9, 2.9, 0.16]} color={wall} />

      <Box position={[-4.55, 0.08, -3.72]} scale={[2.7, 0.12, 1.25]} color="#8fa174" />
      <Box position={[0, 0.08, -3.72]} scale={[2.9, 0.12, 1.25]} color="#8fa174" />
      <Box position={[4.5, 0.08, -3.72]} scale={[2.7, 0.12, 1.25]} color="#8fa174" />
      {[-4.55, 0, 4.5].map((x) => (
        <Box key={x} position={[x, 1.25, -4.38]} scale={[2.55, 2.35, 0.08]} color={glass} metalness={0.2} roughness={0.1} />
      ))}

      <Bed position={[-4.55, 0, -1.35]} rotation={[0, Math.PI / 2, 0]} />
      <Bed position={[4.55, 0, -1.25]} rotation={[0, -Math.PI / 2, 0]} />

      <Box position={[-4.9, 0.55, 0.95]} scale={[2.05, 1.1, 0.55]} color="#9b8b74" />
      <Box position={[4.85, 0.7, 3.2]} scale={[1.8, 1.4, 0.58]} color="#9b8b74" />

      <Sofa position={[0.2, 0, -1.25]} />
      <Box position={[0.2, 0.32, 0.05]} scale={[1.35, 0.28, 0.72]} color="#8d755e" />
      <DiningTable position={[0.15, 0, 1.75]} />

      <Box position={[0.25, 0.48, 3.82]} scale={[4.65, 0.92, 0.62]} color="#6d7a68" />
      <Box position={[0.25, 1.05, 4.03]} scale={[4.65, 0.12, 0.72]} color="#d6c8b5" />
      {[-1.45, -0.45, 0.55, 1.55].map((x) => (
        <Box key={x} position={[x, 0.62, 4.18]} scale={[0.05, 0.72, 0.05]} color="#2f3b36" />
      ))}

      <SpiralStair position={[-4.45, 0, 3.15]} />
      <Plant position={[-2.65, 0.05, 3.6]} scale={0.9} />

      <RoomLabel position={[-4.55, 2.7, -1.1]}>Recámara 02</RoomLabel>
      <RoomLabel position={[0, 2.7, 0.5]}>Área social</RoomLabel>
      <RoomLabel position={[4.55, 2.7, -1.1]}>Recámara 01</RoomLabel>
    </group>
  )
}

function RoofGardenC304() {
  return (
    <group>
      <Box position={[0, -0.12, 0]} scale={[8, 0.22, 8]} color="#c9bda9" />
      <Box position={[0, 0.3, -3.7]} scale={[8, 0.75, 0.6]} color="#526d42" />
      {[-3.1, -1.85, -0.6, 0.65, 1.9, 3.15].map((x, index) => (
        <Plant key={x} position={[x, 0.08, -3.45]} scale={0.85 + (index % 2) * 0.15} />
      ))}
      <Rug position={[-1.75, 0.02, 1.6]} scale={[3.5, 0.035, 2.4]} color="#a99a84" />
      <DiningTable position={[-1.75, 0, 1.6]} />
      <Rug position={[1.75, 0.02, -0.4]} scale={[3.3, 0.035, 2.4]} color="#d7cec0" />
      <Sofa position={[1.75, 0, -0.8]} color="#eee9df" />
      <Box position={[1.75, 0.3, 0.5]} scale={[1.2, 0.25, 0.7]} color="#8d755e" />
      <Box position={[-3.55, 0.5, -0.55]} scale={[0.55, 1, 2.2]} color="#7b8a72" />
      <SpiralStair position={[2.85, 0, 2.75]} />
      <RoomLabel position={[0, 2.8, -2.5]}>Roof garden · 64.36 m²</RoomLabel>
    </group>
  )
}

function InteriorCamera({ view, controlsRef }) {
  const { camera } = useThree()

  useEffect(() => {
    const cameras = {
      overview: { position: [12, 14, 16], target: [0, 0.7, 0] },
      living: { position: [7.5, 5.5, 10], target: [0, 0.7, 0.8] },
      bedrooms: { position: [12, 7.5, 3], target: [0, 0.7, -1.4] },
      roof: { position: [10, 11, 13], target: [0, 0.4, 0] },
    }
    camera.position.set(...cameras[view].position)
    controlsRef.current?.target.set(...cameras[view].target)
    controlsRef.current?.update()
  }, [camera, controlsRef, view])

  return null
}

function InteriorModel({ view }) {
  const controlsRef = useRef()
  const roof = view === 'roof'

  return (
    <>
      <color attach="background" args={['#dfe3d8']} />
      <fog attach="fog" args={['#dfe3d8', 24, 48]} />
      <ambientLight intensity={1.45} />
      <directionalLight
        castShadow
        intensity={2.6}
        color="#fff0d2"
        position={[10, 15, 9]}
        shadow-mapSize={[2048, 2048]}
      />
      <InteriorCamera view={view} controlsRef={controlsRef} />
      {roof ? <RoofGardenC304 /> : <ApartmentC304 />}
      <ContactShadows position={[0, -0.24, 0]} opacity={0.42} scale={22} blur={2.5} far={18} />
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enablePan
        minDistance={5}
        maxDistance={30}
        minPolarAngle={0.28}
        maxPolarAngle={Math.PI / 2.12}
        target={[0, 0.7, 0]}
      />
    </>
  )
}

function SceneCamera({ view, controlsRef }) {
  const { camera } = useThree()
  useEffect(() => {
    const positions = {
      aerial: [25, 22, 27],
      front: [0, 10, 34],
      garden: [0, 7, 13],
    }
    camera.position.set(...positions[view])
    controlsRef.current?.target.set(0, 3.2, -0.8)
    controlsRef.current?.update()
  }, [camera, controlsRef, view])
  return null
}

function Model({ activeTower, level, onSelect, night, view }) {
  const controlsRef = useRef()
  const sceneRef = useRef()

  useFrame((_, delta) => {
    if (sceneRef.current && view === 'aerial') {
      sceneRef.current.rotation.y += delta * 0.018
    }
  })

  return (
    <>
      <color attach="background" args={[night ? '#071712' : '#d9ddd1']} />
      <fog attach="fog" args={[night ? '#071712' : '#d9ddd1', 28, 52]} />
      <ambientLight intensity={night ? 0.45 : 1.15} />
      <directionalLight
        castShadow
        intensity={night ? 1.8 : 2.8}
        color={night ? '#9db8ff' : '#fff0cd'}
        position={night ? [-8, 12, -5] : [10, 16, 8]}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={45}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
      />
      <SceneCamera view={view} controlsRef={controlsRef} />
      <group ref={sceneRef}>
        <ProjectBase />
        {towers.map((tower) => (
          <BuildingWing
            key={tower.id}
            tower={tower}
            activeTower={activeTower}
            level={level}
            onSelect={onSelect}
          />
        ))}
      </group>
      <ContactShadows position={[0, -0.28, 0]} opacity={0.55} scale={34} blur={2.5} far={20} />
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enablePan
        minDistance={11}
        maxDistance={46}
        minPolarAngle={0.25}
        maxPolarAngle={Math.PI / 2.08}
        target={[0, 3.2, -0.8]}
      />
    </>
  )
}

export default function Project3D() {
  const [activeTower, setActiveTower] = useState('A')
  const [level, setLevel] = useState('all')
  const [night, setNight] = useState(false)
  const [view, setView] = useState('aerial')
  const [experience, setExperience] = useState('project')
  const [interiorView, setInteriorView] = useState('overview')
  const interior = experience === 'interior'

  return (
    <section className="project-3d" id="maqueta">
      <div className="project-3d-head project-3d-reveal">
        <div>
          <p className="eyebrow light">{interior ? 'Visita una residencia' : 'Explora el conjunto'}</p>
          <h2>{interior ? 'Entra al C-304.' : 'AG117 en tres dimensiones.'}</h2>
        </div>
        <p>
          {interior
            ? 'Conoce una recreación conceptual basada en el plano arquitectónico: dos recámaras, área social, balcones y roof garden.'
            : 'Recorre una maqueta conceptual basada en las vistas arquitectónicas del proyecto: bloques perimetrales, balcones, terrazas y patio central.'}
        </p>
      </div>

      <div className="viewer-shell project-3d-reveal">
        <div className={interior ? 'viewer-canvas is-interior' : 'viewer-canvas'}>
          <Canvas
            shadows
            dpr={[1, 1.6]}
            camera={{ position: [25, 22, 27], fov: 38, near: 0.1, far: 120 }}
            gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
          >
            <Suspense fallback={null}>
              {interior ? (
                <InteriorModel view={interiorView} />
              ) : (
                <Model
                  activeTower={activeTower}
                  level={level}
                  onSelect={setActiveTower}
                  night={night}
                  view={view}
                />
              )}
            </Suspense>
          </Canvas>
          <button
            className="experience-switch"
            type="button"
            onClick={() => setExperience(interior ? 'project' : 'interior')}
          >
            <span>{interior ? 'Vista del conjunto' : 'Visita interior'}</span>
            <strong>{interior ? 'Volver a AG117' : 'Explorar C-304'}</strong>
          </button>
          <div className="viewer-instructions">
            <span className="mouse-icon" />
            Arrastra para girar · pellizca o usa la rueda para acercar
          </div>
          {!interior && <div className="compass"><span>N</span></div>}
        </div>

        <aside className={interior ? 'viewer-panel interior-panel' : 'viewer-panel'}>
          {interior ? (
            <>
              <div className="panel-block interior-intro">
                <span className="panel-kicker">Residencia muestra</span>
                <strong>C-304</strong>
                <p>Tipología C Roof Garden</p>
                <dl>
                  <div><dt>Interior</dt><dd>78.03 m²</dd></div>
                  <div><dt>Roof garden</dt><dd>64.36 m²</dd></div>
                  <div><dt>Total</dt><dd>153.37 m²</dd></div>
                </dl>
              </div>

              <div className="panel-block">
                <span className="panel-kicker">Explora cada espacio</span>
                <div className="interior-view-buttons">
                  {[
                    ['overview', 'Vista completa'],
                    ['living', 'Área social'],
                    ['bedrooms', 'Recámaras'],
                    ['roof', 'Roof garden'],
                  ].map(([id, label], index) => (
                    <button
                      key={id}
                      className={interiorView === id ? 'is-active' : ''}
                      type="button"
                      onClick={() => setInteriorView(id)}
                    >
                      <span>0{index + 1}</span>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="panel-tools">
                <button
                  className="back-to-project"
                  type="button"
                  onClick={() => setExperience('project')}
                >
                  Volver al conjunto
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="panel-block">
                <span className="panel-kicker">01 · Selecciona un bloque</span>
                <div className="tower-buttons">
                  {towers.map((tower) => (
                    <button
                      key={tower.id}
                      className={activeTower === tower.id ? 'is-active' : ''}
                      type="button"
                      onClick={() => setActiveTower(tower.id)}
                    >
                      {tower.id}
                    </button>
                  ))}
                </div>
                <div className="selected-tower-copy">
                  <strong>Bloque {activeTower}</strong>
                  <span>Residencias · Balcones · Roof garden</span>
                </div>
              </div>

              <div className="panel-block">
                <span className="panel-kicker">02 · Explora por nivel</span>
                <div className="level-buttons">
                  <button
                    className={level === 'all' ? 'is-active' : ''}
                    type="button"
                    onClick={() => setLevel('all')}
                  >
                    Edificio completo
                  </button>
                  {floorLabels.map((label, index) => (
                    <button
                      key={label}
                      className={level === index ? 'is-active' : ''}
                      type="button"
                      onClick={() => setLevel(index)}
                    >
                      <span>0{index}</span>{label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="panel-tools">
                <button
                  className="interior-cta"
                  type="button"
                  onClick={() => setExperience('interior')}
                >
                  <span>Nuevo recorrido</span>
                  Explorar departamento C-304
                </button>
                <div className="view-buttons">
                  {['aerial', 'front', 'garden'].map((item) => (
                    <button
                      key={item}
                      className={view === item ? 'is-active' : ''}
                      type="button"
                      onClick={() => setView(item)}
                    >
                      {item === 'aerial' ? 'Aérea' : item === 'front' ? 'Frente' : 'Patio'}
                    </button>
                  ))}
                </div>
                <button
                  className={night ? 'day-toggle is-night' : 'day-toggle'}
                  type="button"
                  onClick={() => setNight(!night)}
                  aria-label="Cambiar entre vista diurna y nocturna"
                >
                  <span />
                  {night ? 'Noche' : 'Día'}
                </button>
              </div>
            </>
          )}
        </aside>
      </div>
      <p className="model-disclaimer">
        Maqueta digital conceptual basada en los planos y renders disponibles.
        El interior C-304 representa la distribución arquitectónica; acabados,
        mobiliario y geometría final pueden presentar variaciones.
      </p>
    </section>
  )
}
