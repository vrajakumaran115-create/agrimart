import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";

export default function WelcomePopup() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let frameId: number;
    let timer: NodeJS.Timeout;

    const startConfetti = () => {
      try {
        // Initial big explosion
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.5 },
          colors: ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff69b4", "#ffd700", "#00ffff"],
          zIndex: 10001
        });

        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;

        const frame = () => {
          if (Date.now() > animationEnd) return;

          try {
            confetti({
              particleCount: 2,
              angle: 60,
              spread: 55,
              origin: { x: 0.4, y: 0.5 },
              colors: ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff69b4", "#ffd700", "#00ffff"],
              zIndex: 10001
            });
            confetti({
              particleCount: 2,
              angle: 120,
              spread: 55,
              origin: { x: 0.6, y: 0.5 },
              colors: ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff69b4", "#ffd700", "#00ffff"],
              zIndex: 10001
            });

            frameId = requestAnimationFrame(frame);
          } catch (err) {
            console.error("Confetti frame error:", err);
          }
        };
        
        frameId = requestAnimationFrame(frame);
      } catch (err) {
        console.error("Confetti initialization error:", err);
      }
    };

    // Delay slightly to ensure DOM is ready
    timer = setTimeout(startConfetti, 100);

    const autoCloseTimer = setTimeout(() => {
      setIsVisible(false);
    }, 4000);

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      clearTimeout(timer);
      clearTimeout(autoCloseTimer);
      try {
        confetti.reset();
      } catch (e) {}
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="welcome-popup-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-white/80 backdrop-blur-[2px] px-4"
        >
          <motion.div
            key="welcome-popup-content"
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, transition: { duration: 0.5 } }}
            className="bg-white p-8 rounded-3xl shadow-2xl border border-neutral-100 max-w-sm w-full text-center space-y-4"
          >
            <div className="text-5xl">🌱</div>
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
              Welcome to my <span className="text-green-600">AgriMart</span>
            </h1>
            <p className="text-neutral-500 font-medium text-sm">
              Connecting farmers to customers.
            </p>
            
            <div className="pt-2">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 3, ease: "linear" }}
                className="h-1 w-full bg-green-500 rounded-full origin-left"
              ></motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
