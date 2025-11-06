'use client';

import { useRef, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap-config';

interface Node {
  id: number;
  x: number;
  y: number;
  label: string;
}

export function BlockchainViz() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const nodes: Node[] = [
    { id: 1, x: 150, y: 200, label: 'Farm' },
    { id: 2, x: 350, y: 150, label: 'Processor' },
    { id: 3, x: 550, y: 200, label: 'Distributor' },
    { id: 4, x: 750, y: 150, label: 'Retailer' },
    { id: 5, x: 950, y: 200, label: 'Consumer' },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 1100;
    canvas.height = 400;

    let animationFrame: number;
    let progress = 0;

    const drawConnections = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;

      for (let i = 0; i < nodes.length - 1; i++) {
        const start = nodes[i];
        const end = nodes[i + 1];

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();

        // Draw animated particle
        const particleProgress = (progress + i * 0.2) % 1;
        const particleX = start.x + (end.x - start.x) * particleProgress;
        const particleY = start.y + (end.y - start.y) * particleProgress;

        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(particleX, particleY, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw nodes
      nodes.forEach((node) => {
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Draw labels
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.x, node.y + 60);
      });

      progress += 0.01;
      animationFrame = requestAnimationFrame(drawConnections);
    };

    drawConnections();

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  useGSAP(() => {
    gsap.from(containerRef.current, {
      opacity: 0,
      y: 100,
      duration: 1,
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 80%',
      },
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-5xl font-bold text-center mb-4 text-white">
          Blockchain Network
        </h2>
        <p className="text-xl text-center text-gray-300 mb-16">
          Watch transactions flow through the supply chain in real-time
        </p>

        <div className="bg-gray-800 rounded-2xl p-8 overflow-x-auto">
          <canvas ref={canvasRef} className="mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="text-center">
            <div className="text-5xl mb-4">⚡</div>
            <h3 className="text-2xl font-bold text-white mb-2">Fast</h3>
            <p className="text-gray-400">Transactions confirmed in seconds</p>
          </div>
          <div className="text-center">
            <div className="text-5xl mb-4">🔒</div>
            <h3 className="text-2xl font-bold text-white mb-2">Secure</h3>
            <p className="text-gray-400">Immutable blockchain records</p>
          </div>
          <div className="text-center">
            <div className="text-5xl mb-4">🌐</div>
            <h3 className="text-2xl font-bold text-white mb-2">Transparent</h3>
            <p className="text-gray-400">Full visibility for all stakeholders</p>
          </div>
        </div>
      </div>
    </div>
  );
}
