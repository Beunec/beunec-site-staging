"use client";

import React, { useEffect, useRef } from 'react';
import { startVisibleLoop } from '@/lib/visible-loop';

interface DustParticle {
    x: number;
    y: number;
    radius: number;
    color: string;
    speedX: number;
    speedY: number;
    life: number;
    maxLife: number;
    isStatic: boolean;
    alpha: number;
    twinkleSpeed: number;
}

const COLORS = [
    '#e8eaed', // charcoal text
    '#6b7a6e', // accent sage
    '#7a8b99', // accent slate
    '#c9cbc4', // canvas mid-tone
    '#202020', // charcoal hover
];

export const HomeParticleBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: 0, y: 0, active: false, velocity: 0, lastX: 0, lastY: 0 });
    const particlesRef = useRef<DustParticle[]>([]);

    const createParticle = (x: number, y: number, isStatic = false): DustParticle => {
        const angle = Math.random() * Math.PI * 2;
        // High base speeds for cyclone effect
        const speed = isStatic ? Math.random() * 2 + 1.5 : Math.random() * 8 + 6;
        return {
            x,
            y,
            radius: Math.random() * 1.8 + 0.4, // Small dots like dust
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            speedX: Math.cos(angle) * speed,
            speedY: Math.sin(angle) * speed,
            life: 1,
            maxLife: 1,
            isStatic,
            alpha: Math.random() * 0.6 + 0.2,
            twinkleSpeed: Math.random() * 0.02 + 0.005,
        };
    };

    const initParticles = (width: number, height: number) => {
        const particles: DustParticle[] = [];
        const count = 220; // High density for small dust
        for (let i = 0; i < count; i++) {
            particles.push(createParticle(Math.random() * width, Math.random() * height, true));
        }
        particlesRef.current = particles;
    };

    const update = (width: number, height: number) => {
        const mouse = mouseRef.current;

        // Default vortex center logic (middle of screen when no mouse)
        const centerX = mouse.active ? mouse.x : width / 2;
        const centerY = mouse.active ? mouse.y : height / 2;

        particlesRef.current = particlesRef.current.filter((p) => {
            // 1. Vortex Physics (Always Orbital)
            const dx = centerX - p.x;
            const dy = centerY - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            const radius = Math.max(width, height) * 0.9;
            const force = Math.max(0, (radius - dist) / radius);
            const easeForce = force * force;

            // Radial Pull (Stay in field)
            const pull = p.isStatic ? 0.25 : 1.2;
            p.speedX += (dx / dist) * easeForce * pull;
            p.speedY += (dy / dist) * easeForce * pull;

            // Tangential Swirl (Constant orbital motion)
            const swirl = p.isStatic ? 1.0 : 2.8;
            p.speedX += (dy / dist) * easeForce * swirl;
            p.speedY -= (dx / dist) * easeForce * swirl;

            // 2. Twinkle Effect (Alpha oscillation)
            if (p.isStatic) {
                p.alpha += Math.sin(Date.now() * p.twinkleSpeed) * 0.01;
                p.alpha = Math.max(0.1, Math.min(0.8, p.alpha));
            }

            // 3. Friction & Speed Cap
            const maxSpeed = p.isStatic ? 14 : 35;
            const currentSpeed = Math.sqrt(p.speedX * p.speedX + p.speedY * p.speedY);

            if (currentSpeed > maxSpeed) {
                p.speedX = (p.speedX / currentSpeed) * maxSpeed;
                p.speedY = (p.speedY / currentSpeed) * maxSpeed;
            }

            p.speedX *= 0.982;
            p.speedY *= 0.982;

            // 4. Movement
            p.x += p.speedX;
            p.y += p.speedY;

            // 5. Lifespan for dynamical trails
            if (!p.isStatic) {
                p.life -= 0.012;
            }

            // 6. Wrap around screen
            const margin = 100;
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
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

            const baseAlpha = p.alpha;
            ctx.globalAlpha = p.isStatic ? baseAlpha : p.life * baseAlpha;
            ctx.fillStyle = p.color;

            ctx.fill();
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
                const count = Math.min(Math.floor(vel / 0.6), 18);
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
            className="absolute inset-0 pointer-events-none z-[1]"
        />
    );
};
