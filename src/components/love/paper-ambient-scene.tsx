"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function PaperAmbientScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    renderer.setClearColor("#f7f2ea", 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(0, 0, 7);

    const group = new THREE.Group();
    scene.add(group);

    const ambient = new THREE.AmbientLight("#fffaf1", 2.2);
    const key = new THREE.DirectionalLight("#fff1df", 2);
    key.position.set(2.5, 3, 4);
    scene.add(ambient, key);

    const paperGeometry = new THREE.PlaneGeometry(5.8, 3.95, 16, 10);
    const paperMaterial = new THREE.MeshStandardMaterial({
      color: "#fffaf3",
      roughness: 0.92,
      metalness: 0,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
    });
    const paper = new THREE.Mesh(paperGeometry, paperMaterial);
    paper.rotation.set(-0.02, -0.08, -0.02);
    paper.position.set(0.1, 0.02, 0);
    group.add(paper);

    const dotGeometry = new THREE.SphereGeometry(0.018, 10, 10);
    const dotMaterial = new THREE.MeshBasicMaterial({
      color: "#e84a5f",
      transparent: true,
      opacity: 0.06,
    });
    const dots = Array.from({ length: 18 }, (_, index) => {
      const dot = new THREE.Mesh(dotGeometry, dotMaterial);
      dot.position.set(
        -2.7 + (index % 6) * 1.02,
        -1.7 + Math.floor(index / 6) * 1.15,
        -0.35 - index * 0.012,
      );
      dot.scale.setScalar(index % 4 === 0 ? 1.7 : 1);
      group.add(dot);
      return dot;
    });

    const render = () => {
      renderer.render(scene, camera);
    };

    const resize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (width === 0 || height === 0) return;

      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      render();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const timer = new THREE.Timer();
    let frameId = 0;

    if (reducedMotion) {
      render();

      return () => {
        resizeObserver.disconnect();
        paperGeometry.dispose();
        paperMaterial.dispose();
        dotGeometry.dispose();
        dotMaterial.dispose();
        renderer.dispose();
      };
    }

    const animate = () => {
      timer.update();
      const elapsed = timer.getElapsed();

      paper.rotation.y = -0.08 + Math.sin(elapsed * 0.28) * 0.018;
      paper.rotation.x = -0.02 + Math.cos(elapsed * 0.24) * 0.012;
      group.position.y = Math.sin(elapsed * 0.35) * 0.025;

      for (const [index, dot] of dots.entries()) {
        dot.position.y += Math.sin(elapsed * 0.4 + index) * 0.0008;
      }

      render();
      frameId = window.requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      paperGeometry.dispose();
      paperMaterial.dispose();
      dotGeometry.dispose();
      dotMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="love-ambient-canvas"
    />
  );
}
