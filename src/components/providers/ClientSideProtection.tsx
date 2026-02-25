"use client";

import { useEffect } from "react";

export function ClientSideProtection({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // 1. Disable React DevTools in production
        if (process.env.NODE_ENV === "production") {
            // @ts-ignore
            if (typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ === "object") {
                // @ts-ignore
                for (const [key, value] of Object.entries(window.__REACT_DEVTOOLS_GLOBAL_HOOK__)) {
                    // @ts-ignore
                    window.__REACT_DEVTOOLS_GLOBAL_HOOK__[key] = typeof value === "function" ? () => { } : null;
                }
            }
        }

        // 2. Suppress console messages in production
        if (process.env.NODE_ENV === "production") {
            const noOp = () => { };
            console.log = noOp;
            console.warn = noOp;
            console.error = noOp;
            console.info = noOp;
            console.debug = noOp;
        }

        // 2. Suppress Inspector/DevTools interaction (Basic protection)
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            return false;
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
            if (
                e.keyCode === 123 ||
                (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) ||
                (e.ctrlKey && e.keyCode === 85) ||
                (e.metaKey && e.altKey && (e.keyCode === 73 || e.keyCode === 74)) || // Mac Support
                (e.metaKey && e.keyCode === 85) // Mac Support
            ) {
                e.preventDefault();
                return false;
            }
        };

        // 5. Anti-debugger loop (Self-protection)
        if (process.env.NODE_ENV === "production") {
            const protection = () => {
                function x() {
                    debugger;
                }
                setInterval(x, 100);
            };
            // protection(); // This can be aggressive, maybe skip for now if not explicitly asked for extreme measures
        }

        // 6. Disable Dragging of assets (Protection for images/videos)
        const handleDragStart = (e: DragEvent) => {
            e.preventDefault();
            return false;
        };

        // Note: We only apply these in production to avoid making development frustrating
        if (process.env.NODE_ENV === "production") {
            document.addEventListener("contextmenu", handleContextMenu);
            document.addEventListener("keydown", handleKeyDown);
            document.addEventListener("dragstart", handleDragStart);
        }

        return () => {
            if (process.env.NODE_ENV === "production") {
                document.removeEventListener("contextmenu", handleContextMenu);
                document.removeEventListener("keydown", handleKeyDown);
                document.removeEventListener("dragstart", handleDragStart);
            }
        };
    }, []);

    return <>{children}</>;
}
