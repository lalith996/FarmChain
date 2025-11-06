'use client';

import { useEffect, useRef } from 'react';
import { anime } from '@/lib/anime-config';

const technologies = [
  { name: 'Blockchain', icon: '⛓️', color: 'from-blue-400 to-blue-600' },
  { name: 'Smart Contracts', icon: '📝', color: 'from-purple-400 to-purple-600' },
  { name: 'IPFS', icon: '🗄️', color: 'from-green-400 to-green-600' },
  { name: 'Web3', icon: '🌐', color: 'from-orange-400 to-orange-600' },
  { name: 'AI/ML', icon: '🤖', color: 'from-pink-400 to-pink-600' },
  { name: 'IoT', icon: '📡', color: 'from-teal-400 to-teal-600' },
];

export function TechnologySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const techRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Animate tech items
            if (techRef.current) {
              anime({
                targets: techRef.current.children,
                scale: [0, 1],
                opacity: [0, 1],
                rotate: [180, 0],
                duration: 1200,
                delay: anime.stagger(100, { start: 300 }),
                easing: 'easeOutElastic(1, .6)',
              });
            }

            // Start canvas animation
            animateCanvas();

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const animateCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const nodes: any[] = [];
    const nodeCount = 50;

    // Create nodes
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: Math.random() * 3 + 1,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw nodes
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#10b981';
        ctx.fill();
      });

      // Draw connections
      nodes.forEach((node1, i) => {
        nodes.slice(i + 1).forEach((node2) => {
          const dx = node1.x - node2.x;
          const dy = node1.y - node2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(node1.x, node1.y);
            ctx.lineTo(node2.x, node2.y);
            ctx.strokeStyle = `rgba(16, 185, 129, ${1 - distance / 150})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();
  };

  return (
    <section
      id="technology"
      ref={sectionRef}
      className="py-32 bg-gray-900 relative overflow-hidden"
    >
      {/* Canvas Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-30"
      ></canvas>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-block px-6 py-2 bg-green-500/20 text-green-400 rounded-full font-semibold mb-6">
            🚀 Technology Stack
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Built with{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-400">
              Cutting-Edge
            </span>
            <br />
            Technology
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Leveraging the latest in blockchain, AI, and distributed systems
          </p>
        </div>

        {/* Technology Grid */}
        <div ref={techRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {technologies.map((tech, index) => (
            <div
              key={index}
              className="group relative bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-green-500 transition-all duration-300 cursor-pointer"
            >
              <div className="text-center">
                <div className="text-5xl mb-4 group-hover:scale-125 transition-transform duration-300">
                  {tech.icon}
                </div>
                <div className="text-white font-semibold">{tech.name}</div>
              </div>

              {/* Glow Effect */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${tech.color} opacity-0 group-hover:opacity-20 rounded-2xl blur-xl transition-opacity duration-300`}
              ></div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-5xl mb-4">⚡</div>
            <h3 className="text-2xl font-bold text-white mb-2">Lightning Fast</h3>
            <p className="text-gray-400">Transactions confirmed in seconds</p>
          </div>
          <div className="text-center">
            <div className="text-5xl mb-4">🔒</div>
            <h3 className="text-2xl font-bold text-white mb-2">Ultra Secure</h3>
            <p className="text-gray-400">Military-grade encryption</p>
          </div>
          <div className="text-center">
            <div className="text-5xl mb-4">🌍</div>
            <h3 className="text-2xl font-bold text-white mb-2">Globally Scalable</h3>
            <p className="text-gray-400">Built for worldwide adoption</p>
          </div>
        </div>
      </div>
    </section>
  );
}
