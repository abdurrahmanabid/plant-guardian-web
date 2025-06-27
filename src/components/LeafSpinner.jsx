import React, { useEffect, useRef, useState } from "react";
import { Leaf, TreePine, Sprout } from "lucide-react";
import { useTranslation } from "react-i18next";

const LeafSpinner = ({ text }) => {
  const containerRef = useRef();
  const mainLeafRef = useRef();
  const orbitalLeavesRef = useRef();
  const particlesRef = useRef();
  const { t } = useTranslation("loading");

  text = text || t("main");

  useEffect(() => {
    let animationId;
    let startTime = Date.now();

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 50;

      // Main leaf breathing animation
      if (mainLeafRef.current) {
        const scale = 1 + Math.sin(elapsed * 0.08) * 0.15;
        const rotate = Math.sin(elapsed * 0.05) * 5;
        mainLeafRef.current.style.transform = `scale(${scale}) rotate(${rotate}deg)`;
        mainLeafRef.current.style.filter = `drop-shadow(0 0 ${
          15 + Math.sin(elapsed * 0.1) * 10
        }px rgba(34, 197, 94, 0.6))`;
      }

      // Orbital leaves
      if (orbitalLeavesRef.current) {
        const leaves = orbitalLeavesRef.current.children;
        for (let i = 0; i < leaves.length; i++) {
          const speed = 0.015 + i * 0.005;
          const radius = 80 + i * 20;
          const baseAngle = (i * Math.PI * 2) / leaves.length;
          const angle = elapsed * speed + baseAngle;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const leafRotation = angle * (180 / Math.PI) + 90;
          const sway = Math.sin(elapsed * 0.1 + i) * 10;

          leaves[i].style.transform = `translate(${x}px, ${y}px) rotate(${
            leafRotation + sway
          }deg)`;
          leaves[i].style.opacity = 0.6 + Math.sin(elapsed * 0.08 + i) * 0.4;
        }
      }

      // Floating particles (small leaves and sparkles)
      if (particlesRef.current) {
        const particles = particlesRef.current.children;
        for (let i = 0; i < particles.length; i++) {
          const speed = 0.008 + i * 0.003;
          const radius = 120 + i * 25;
          const angle = elapsed * speed + (i * Math.PI * 2) / particles.length;
          const x =
            Math.cos(angle) * radius + Math.sin(elapsed * 0.02 + i) * 20;
          const y =
            Math.sin(angle) * radius + Math.cos(elapsed * 0.03 + i) * 15;
          const opacity = 0.2 + Math.sin(elapsed * 0.06 + i) * 0.3;
          const scale = 0.3 + Math.sin(elapsed * 0.07 + i) * 0.2;
          const rotation = elapsed * 2 + i * 30;

          particles[
            i
          ].style.transform = `translate(${x}px, ${y}px) scale(${scale}) rotate(${rotation}deg)`;
          particles[i].style.opacity = opacity;
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-md bg-black/30">
      {/* Animated nature background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(22, 163, 74, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(21, 128, 61, 0.05) 0%, transparent 70%)
          `,
            animation: "natureFlow 15s ease-in-out infinite",
          }}
        />
      </div>

      {/* Main spinner container */}
      <div ref={containerRef} className="relative">
        {/* Outer energy ring */}
        <div className="absolute inset-0 w-72 h-72 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
          <div
            className="w-full h-full rounded-full bg-gradient-to-r from-green-400/20 via-emerald-400/30 to-lime-400/20 blur-xl"
            style={{
              animation: "leafPulse 3s ease-in-out infinite alternate",
            }}
          />
        </div>

        {/* Floating particles */}
        <div
          ref={particlesRef}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          {[...Array(16)].map((_, i) => (
            <div key={i} className="absolute">
              {i % 3 === 0 ? (
                <Leaf size={6} className="text-green-400/60" />
              ) : i % 3 === 1 ? (
                <div className="w-1 h-1 bg-green-400/50 rounded-full" />
              ) : (
                <Sprout size={4} className="text-lime-400/40" />
              )}
            </div>
          ))}
        </div>

        {/* Orbital leaves */}
        <div ref={orbitalLeavesRef} className="relative w-60 h-60">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute left-1/2 top-1/2">
              <Leaf
                size={16 + (i % 3) * 4}
                className={`text-green-${400 + (i % 3) * 100} drop-shadow-lg`}
                style={{
                  filter: `drop-shadow(0 0 8px rgba(34, 197, 94, 0.4))`,
                }}
              />
            </div>
          ))}
        </div>

        {/* Central main leaf */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div
            ref={mainLeafRef}
            className="relative w-24 h-24 rounded-full bg-gradient-to-br from-green-400/20 via-emerald-500/30 to-lime-400/20 flex items-center justify-center backdrop-blur-sm border border-green-400/20"
            style={{
              boxShadow: `
                0 0 30px rgba(34, 197, 94, 0.3),
                0 0 60px rgba(34, 197, 94, 0.1),
                inset 0 0 20px rgba(255, 255, 255, 0.05)
              `,
            }}
          >
            <Leaf size={40} className="text-green-400 drop-shadow-lg" />
          </div>
        </div>

        {/* Growth rings */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div
            className="w-48 h-48 border border-green-400/20 rounded-full"
            style={{
              animation: "growthRing 4s linear infinite",
            }}
          />
          <div
            className="absolute inset-4 border border-emerald-400/15 rounded-full"
            style={{
              animation: "growthRing 6s linear infinite reverse",
            }}
          />
        </div>
      </div>
      <div className="text-xl font-semibold mt-5">{text}</div>

      <style jsx>{`
        @keyframes natureFlow {
          0%,
          100% {
            transform: translateX(0) translateY(0) scale(1);
          }
          33% {
            transform: translateX(20px) translateY(-10px) scale(1.05);
          }
          66% {
            transform: translateX(-15px) translateY(15px) scale(0.95);
          }
        }

        @keyframes leafPulse {
          0% {
            transform: scale(1) rotate(0deg);
            opacity: 0.2;
          }
          100% {
            transform: scale(1.1) rotate(2deg);
            opacity: 0.4;
          }
        }

        @keyframes growthRing {
          0% {
            transform: scale(0.8) rotate(0deg);
            opacity: 0;
          }
          50% {
            opacity: 0.3;
          }
          100% {
            transform: scale(1.2) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default LeafSpinner;
