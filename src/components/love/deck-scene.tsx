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

    let renderer: THREE.WebGLRenderer;

    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
      });
    } catch {
      return;
    }

    renderer.setClearColor("#f8f4ec", 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0.4, 7);

    const group = new THREE.Group();
    group.position.set(1.25, -0.02, 0);
    group.rotation.set(0.02, -0.18, 0.02);
    scene.add(group);

    const ambient = new THREE.AmbientLight("#ffffff", 1.7);
    const directional = new THREE.DirectionalLight("#fff6e8", 2.6);
    directional.position.set(3, 4, 4);
    scene.add(ambient, directional);

    const cardGeometry = new THREE.BoxGeometry(3.8, 2.45, 0.055);
    const activeMaterial = new THREE.MeshStandardMaterial({
      color: "#ffffff",
      roughness: 0.78,
      metalness: 0.03,
    });
    const restingMaterial = new THREE.MeshStandardMaterial({
      color: "#d9d2c3",
      roughness: 0.78,
      metalness: 0.03,
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

    const resize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (width === 0 || height === 0) return;

      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    const timer = new THREE.Timer();
    let frameId = 0;

    if (reducedMotion) {
      renderer.render(scene, camera);

      return () => {
        resizeObserver.disconnect();
        cardGeometry.dispose();
        activeMaterial.dispose();
        restingMaterial.dispose();
        renderer.dispose();
      };
    }

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
