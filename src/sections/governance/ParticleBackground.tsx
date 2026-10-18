"use client";

import React, { useRef, useEffect } from 'react';
import { startVisibleLoop } from '@/lib/visible-loop';

interface Particle {
    x: number;
    y: number;
    length: number;
    thickness: number;
    color: string;
    speedX: number;
    speedY: number;
    angle: number;
    life: number;
    maxLife: number;
    isStatic: boolean; // Static particles stay, dynamic ones fade
}

const COLORS = [
    '#6b7a6e', // accent sage
    '#7a8b99', // accent slate
    '#e6e6e6', // canvas media
    '#202020', // charcoal hover
    '#c9cbc4', // canvas mid-tone
];

export const ParticleBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: 0, y: 0, active: false, velocity: 0, lastX: 0, lastY: 0 });
    const particlesRef = useRef<Particle[]>([]);

    const createParticle = (x: number, y: number, isStatic = false): Particle => {
        const angle = Math.random() * Math.PI * 2;
        // Ultra-high base speeds
        const speed = isStatic ? Math.random() * 3 + 2 : Math.random() * 8 + 6;
        return {
            x,
            y,
            length: Math.random() * 25 + 15, // Longer dashes for "cyclone" look
            thickness: Math.random() * 2.5 + 1.5,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            speedX: Math.cos(angle) * speed,
            speedY: Math.sin(angle) * speed,
            angle: angle,
            life: 1,
            maxLife: 1,
            isStatic,
        };
    };

    const initParticles = (width: number, height: number) => {
        const particles: Particle[] = [];
        const count = 120; // High density
        for (let i = 0; i < count; i++) {
            particles.push(createParticle(Math.random() * width, Math.random() * height, true));
        }
        particlesRef.current = particles;
    };

    const update = (width: number, height: number) => {
        const mouse = mouseRef.current;

        // Default vortex center logic
        const centerX = mouse.active ? mouse.x : width / 2;
        const centerY = mouse.active ? mouse.y : height / 2;

        particlesRef.current = particlesRef.current.filter((p) => {
            // 1. Vortex Physics (Always Orbital)
            const dx = centerX - p.x;
            const dy = centerY - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Radius of influence (Entire section)
            const radius = Math.max(width, height);
            const force = Math.max(0, (radius - dist) / radius);
            const easeForce = force * force;

            // Radial Pull (Keeps them from flying away)
            const pull = p.isStatic ? 0.3 : 1.5;
            p.speedX += (dx / dist) * easeForce * pull;
            p.speedY += (dy / dist) * easeForce * pull;

            // Tangential Swirl (Constant orbital motion)
            const swirl = p.isStatic ? 1.2 : 2.5;
            p.speedX += (dy / dist) * easeForce * swirl;
            p.speedY -= (dx / dist) * easeForce * swirl;

            // 2. Extra "Chaos" drift
            p.speedX += Math.sin(Date.now() * 0.002 + p.y * 0.01) * 0.05;
            p.speedY += Math.cos(Date.now() * 0.002 + p.x * 0.01) * 0.05;

            // 3. Friction & Speed Cap (Ultra high performance)
            const maxSpeed = p.isStatic ? 12 : 35;
            const currentSpeed = Math.sqrt(p.speedX * p.speedX + p.speedY * p.speedY);

            if (currentSpeed > maxSpeed) {
                p.speedX = (p.speedX / currentSpeed) * maxSpeed;
                p.speedY = (p.speedY / currentSpeed) * maxSpeed;
            }

            // Smooth friction
            p.speedX *= 0.98;
            p.speedY *= 0.98;

            // 4. Movement & Automatic Heading
            p.x += p.speedX;
            p.y += p.speedY;

            // Always face movement direction
            p.angle = Math.atan2(p.speedY, p.speedX);

            // 5. Lifespan for dynamical trails
            if (!p.isStatic) {
                p.life -= 0.012;
            }

            // 6. Wrap around screen (with large buffer)
            const margin = 150;
            if (p.x < -margin) p.x = width + margin;
            if (p.x > width + margin) p.x = -margin;
            if (p.y < -margin) p.y = height + margin;
            if (p.y > height + margin) p.y = -margin;

            return p.isStatic || p.life > 0;
        });
    };

    const render = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        ctx.clearRect(0, 0, width, height);

        particlesRef.current.forEach((p) => {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle);

            ctx.beginPath();
            ctx.moveTo(-p.length / 2, 0);
            ctx.lineTo(p.length / 2, 0);

            ctx.strokeStyle = p.color;
            ctx.lineWidth = p.thickness;
            ctx.lineCap = 'round';

            const baseAlpha = p.isStatic ? 0.5 : 1.0;
            ctx.globalAlpha = p.isStatic ? baseAlpha : p.life * baseAlpha;

            ctx.stroke();
            ctx.restore();
        });
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let w = 0;
        let h = 0;

        const resize = () => {
            const parent = canvas.parentElement;
            if (parent) {
                w = canvas.width = parent.offsetWidth;
                h = canvas.height = parent.offsetHeight;
                if (particlesRef.current.length === 0) {
                    initParticles(w, h);
                }
            }
            loop.redraw();
        };

        window.addEventListener('resize', resize);

        // Runs only while the canvas is on screen and the tab is visible.
        const loop = startVisibleLoop(canvas, () => {
            update(w, h);
            render(ctx, w, h);
        });
        resize();

        const onMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const dx = x - mouseRef.current.lastX;
            const dy = y - mouseRef.current.lastY;
            const vel = Math.sqrt(dx * dx + dy * dy);

            mouseRef.current = {
                x, y, active: true, velocity: vel, lastX: x, lastY: y
            };

            if (vel > 2 && loop.running()) {
                const count = Math.min(Math.floor(vel / 0.8), 15);
                for (let i = 0; i < count; i++) {
                    particlesRef.current.push(createParticle(x, y, false));
                }
            }
        };

        const onMouseLeave = () => {
            mouseRef.current.active = false;
        };

        window.addEventListener('mousemove', onMouseMove);
        canvas.addEventListener('mouseleave', onMouseLeave);

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', onMouseMove);
            loop.stop();
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none z-0"
        />
    );
};
