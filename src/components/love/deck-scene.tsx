"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type DeckSceneProps = {
  activeIndex: number;
  total: number;
};

export function DeckScene({ activeIndex, total }: DeckSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeIndexRef = useRef(activeIndex);
  const totalRef = useRef(total);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
    totalRef.current = total;
  }, [activeIndex, total]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setClearColor("#f7f7f4", 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#f7f7f4");

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0.4, 7);

    const group = new THREE.Group();
    group.position.set(0.9, -0.1, 0);
    group.rotation.set(0.02, -0.12, 0.02);
    scene.add(group);

    const ambient = new THREE.AmbientLight("#ffffff", 1.7);
    const directional = new THREE.DirectionalLight("#ffffff", 2.4);
    directional.position.set(3, 4, 4);
    scene.add(ambient, directional);

    const cardGeometry = new THREE.BoxGeometry(4.2, 2.72, 0.045);
    const activeMaterial = new THREE.MeshStandardMaterial({
      color: "#ffffff",
      roughness: 0.78,
      metalness: 0.03,
    });
    const restingMaterial = new THREE.MeshStandardMaterial({
      color: "#e7e4dc",
      roughness: 0.78,
      metalness: 0.03,
    });
    const railGeometry = new THREE.BoxGeometry(4.55, 0.08, 0.22);
    const railMaterial = new THREE.MeshStandardMaterial({
      color: "#1f1f1d",
      roughness: 0.65,
    });

    const cardCount = Math.max(total, 1);
    const cards = Array.from({ length: cardCount }, (_, index) => {
      const mesh = new THREE.Mesh(
        cardGeometry,
        index === activeIndexRef.current ? activeMaterial : restingMaterial,
      );
      const offset = index - cardCount / 2;
      mesh.position.set(
        (index - activeIndexRef.current) * 0.018,
        offset * 0.015,
        -index * 0.13 + (index === activeIndexRef.current ? 0.2 : 0),
      );
      mesh.rotation.set(offset * 0.012, offset * 0.024, offset * 0.012);
      group.add(mesh);
      return mesh;
    });

    const rail = new THREE.Mesh(railGeometry, railMaterial);
    rail.position.set(0, -1.58, -0.28);
    rail.rotation.set(-0.08, 0, 0);
    group.add(rail);

    const resize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (width === 0 || height === 0) return;

      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    const timer = new THREE.Timer();
    let frameId = 0;

    const animate = () => {
      timer.update();
      const elapsed = timer.getElapsed();
      const active = activeIndexRef.current;
      const totalSlides = Math.max(totalRef.current, 1);

      for (const [index, card] of cards.entries()) {
        const isActive = index === active;
        card.material = isActive ? activeMaterial : restingMaterial;
        card.position.x += ((index - active) * 0.018 - card.position.x) * 0.08;
        card.position.z +=
          (-index * 0.13 + (isActive ? 0.2 : 0) - card.position.z) * 0.08;
      }

      group.rotation.y +=
        ((active - totalSlides / 2) * -0.025 +
          Math.sin(elapsed * 0.4) * 0.035 -
          group.rotation.y) *
        0.04;
      group.rotation.x +=
        (Math.sin(elapsed * 0.32) * 0.025 - group.rotation.x) * 0.04;
      group.position.y = Math.sin(elapsed * 0.55) * 0.05;

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      cardGeometry.dispose();
      activeMaterial.dispose();
      restingMaterial.dispose();
      railGeometry.dispose();
      railMaterial.dispose();
      renderer.dispose();
    };
  }, [total]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="block size-full"
    />
  );
}
