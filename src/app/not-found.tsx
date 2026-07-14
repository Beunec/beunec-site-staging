"use client";

import React, { useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, LayoutGrid, BookOpen, Users, ArrowRight } from "lucide-react";
import { HomeAmbientAudio } from "@/components/home/HomeAmbientAudio";

/* ─── Particle system (adapted from governance ParticleBackground) ─── */

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
    isStatic: boolean;
}

const COLORS = [
    "#6b7a6e",
    "#7a8b99",
    "#e6e2d8",
    "#252823",
    "#dfd9ce",
    "#141512",
];

function createParticle(x: number, y: number, isStatic = false): Particle {
    const angle = Math.random() * Math.PI * 2;
    const speed = isStatic ? Math.random() * 3 + 2 : Math.random() * 8 + 6;
    return {
        x,
        y,
        length: Math.random() * 25 + 15,
        thickness: Math.random() * 2.5 + 1.5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        speedX: Math.cos(angle) * speed,
        speedY: Math.sin(angle) * speed,
        angle,
        life: 1,
        maxLife: 1,
        isStatic,
    };
}

const FullscreenParticles: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: 0, y: 0, active: false, velocity: 0, lastX: 0, lastY: 0 });
    const particlesRef = useRef<Particle[]>([]);

    const initParticles = useCallback((w: number, h: number) => {
        const particles: Particle[] = [];
        for (let i = 0; i < 100; i++) {
            particles.push(createParticle(Math.random() * w, Math.random() * h, true));
        }
        particlesRef.current = particles;
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let w = 0, h = 0;

        const resize = () => {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
            if (particlesRef.current.length === 0) initParticles(w, h);
        };

        resize();
        window.addEventListener("resize", resize);

        const update = () => {
            const mouse = mouseRef.current;
            const cx = mouse.active ? mouse.x : w / 2;
            const cy = mouse.active ? mouse.y : h / 2;

            particlesRef.current = particlesRef.current.filter((p) => {
                const dx = cx - p.x;
                const dy = cy - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const radius = Math.max(w, h);
                const force = Math.max(0, (radius - dist) / radius);
                const ef = force * force;

                const pull = p.isStatic ? 0.3 : 1.5;
                p.speedX += (dx / dist) * ef * pull;
                p.speedY += (dy / dist) * ef * pull;

                const swirl = p.isStatic ? 1.2 : 2.5;
                p.speedX += (dy / dist) * ef * swirl;
                p.speedY -= (dx / dist) * ef * swirl;

                p.speedX += Math.sin(Date.now() * 0.002 + p.y * 0.01) * 0.05;
                p.speedY += Math.cos(Date.now() * 0.002 + p.x * 0.01) * 0.05;

                const maxSpd = p.isStatic ? 12 : 35;
                const curSpd = Math.sqrt(p.speedX ** 2 + p.speedY ** 2);
                if (curSpd > maxSpd) {
                    p.speedX = (p.speedX / curSpd) * maxSpd;
                    p.speedY = (p.speedY / curSpd) * maxSpd;
                }

                p.speedX *= 0.98;
                p.speedY *= 0.98;
                p.x += p.speedX;
                p.y += p.speedY;
                p.angle = Math.atan2(p.speedY, p.speedX);

                if (!p.isStatic) p.life -= 0.012;

                const m = 150;
                if (p.x < -m) p.x = w + m;
                if (p.x > w + m) p.x = -m;
                if (p.y < -m) p.y = h + m;
                if (p.y > h + m) p.y = -m;

                return p.isStatic || p.life > 0;
            });
        };

        const render = () => {
            ctx.clearRect(0, 0, w, h);
            particlesRef.current.forEach((p) => {
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.angle);
                ctx.beginPath();
                ctx.moveTo(-p.length / 2, 0);
                ctx.lineTo(p.length / 2, 0);
                ctx.strokeStyle = p.color;
                ctx.lineWidth = p.thickness;
                ctx.lineCap = "round";
                ctx.globalAlpha = p.isStatic ? 0.45 : p.life;
                ctx.stroke();
                ctx.restore();
            });
        };

        let frameId: number;
        const loop = () => {
            update();
            render();
            frameId = requestAnimationFrame(loop);
        };
        loop();

        const onMove = (e: MouseEvent) => {
            const x = e.clientX, y = e.clientY;
            const dx = x - mouseRef.current.lastX;
            const dy = y - mouseRef.current.lastY;
            const vel = Math.sqrt(dx * dx + dy * dy);
            mouseRef.current = { x, y, active: true, velocity: vel, lastX: x, lastY: y };
            if (vel > 2) {
                const count = Math.min(Math.floor(vel / 1), 12);
                for (let i = 0; i < count; i++) {
                    particlesRef.current.push(createParticle(x, y, false));
                }
            }
        };

        const onLeave = () => { mouseRef.current.active = false; };

        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseleave", onLeave);

        return () => {
            cancelAnimationFrame(frameId);
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseleave", onLeave);
        };
    }, [initParticles]);

    return <canvas ref={canvasRef} className="fixed inset-0 z-0" />;
};

/* ─── Navigation items ─── */

const NAV_ITEMS = [
    { label: "Home", href: "/", icon: Home },
    { label: "Aselius Platform", href: "/aselius-platform", icon: LayoutGrid },
    { label: "Resources", href: "/resources", icon: BookOpen },
    { label: "Company", href: "/company", icon: Users },
];

/* ─── 404 Page ─── */

export default function NotFound() {
    return (
        <div className="relative min-h-screen baap-page overflow-hidden flex flex-col items-center justify-center selection:bg-beunec-sage/30">
            {/* Particle Background */}
            <FullscreenParticles />

            {/* Gradient overlays for depth */}
            <div className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-b from-background/70 via-transparent to-background/90" />
            <div className="absolute inset-0 z-[1] pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_30%,color-mix(in_srgb,var(--bg-global)_60%,transparent))]" />

            {/* Content */}
            <div className="relative z-10 w-full max-w-3xl mx-auto px-6 py-16 flex flex-col items-center text-center">
                {/* Logo */}
                <motion.img
                    src="/assets/beunec-logo.png"
                    alt="Beunec"
                    className="w-14 h-14 rounded-2xl shadow-lg mb-10"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, type: "spring" }}
                />

                {/* 404 number */}
                <motion.h1
                    className="text-[10rem] md:text-[14rem] font-black leading-none tracking-tighter text-foreground/90 select-none"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                >
                    404
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    className="text-lg md:text-xl text-muted-foreground max-w-md mx-auto -mt-4 mb-4"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.25 }}
                >
                    This page has drifted beyond the orchestration layer.
                </motion.p>
                <motion.p
                    className="text-sm text-muted-foreground/70 mb-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.35 }}
                >
                    Don&apos;t worry — let&apos;s get you back on track.
                </motion.p>

                {/* Navigation Grid */}
                <motion.div
                    className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className="group flex flex-col items-center gap-2 p-4 rounded-2xl border border-border baap-interactive"
                        >
                            <Icon className="w-5 h-5 text-muted-foreground group-hover:text-accent-sage transition-colors duration-200" />
                            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-200">{label}</span>
                        </Link>
                    ))}
                </motion.div>

                {/* Primary CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.55 }}
                >
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-beunec-sage text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all duration-200"
                    >
                        Go to Home
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </motion.div>
            </div>

            {/* Bottom branding */}
            <div className="absolute bottom-6 z-10 text-center">
                <p className="text-[11px] text-muted-foreground">
                    © {new Date().getFullYear()} Beunec Technologies, Inc.
                </p>
            </div>

            <HomeAmbientAudio />
        </div>
    );
}
