import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const [textIndex, setTextIndex] = useState(0);
  const titles = [
    "¡TU DOSIS DIARIA DE DIVERSION TE ESPERA ACA!",
    "DIVERSION, ESTILO Y TODO LO QUE TE GUSTA"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % titles.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-[100dvh] flex items-center justify-center relative overflow-hidden">
      {/* Background video — max quality */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover scale-[1.15]"
        style={{ imageRendering: "auto" }}
        src="/sun.mp4"
      />

      {/* Very subtle full-screen vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-3xl mx-auto pt-20">
        {/* Dark frosted container around text */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="flex flex-col items-center gap-6 px-8 py-10 sm:px-14 sm:py-14 rounded-3xl"
          style={{
            background: "rgba(0, 0, 0, 0.42)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "1px solid rgba(255,0,153,0.25)",
            boxShadow: "0 8px 48px rgba(0,0,0,0.35), inset 0 0 60px rgba(255,0,153,0.04)",
          }}
        >
          <div className="h-[180px] sm:h-[160px] flex items-center justify-center relative w-full">
            <AnimatePresence mode="wait">
              <motion.h1
                key={textIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="font-orbitron font-black leading-[1.1] text-white absolute w-full"
                style={{
                  fontSize: "clamp(2rem, 6vw, 4.5rem)",
                  textShadow: "0 2px 30px rgba(255,0,153,0.65), 0 0 60px rgba(255,0,153,0.3)",
                  letterSpacing: "0.02em",
                }}
              >
                {titles[textIndex]}
              </motion.h1>
            </AnimatePresence>
          </div>

          <p
            className="text-white/90 font-medium"
            style={{
              fontSize: "clamp(1rem, 2.5vw, 1.35rem)",
              textShadow: "0 1px 8px rgba(0,0,0,0.6)",
              maxWidth: "38ch",
            }}
          >
            Diseño sin límites. Tecnología sin compromiso.
          </p>

          <Link href="/tienda">
            <Button
              size="lg"
              className="h-14 px-10 text-base font-orbitron tracking-[0.2em] bg-primary text-white hover:bg-primary/85 hover:shadow-[0_0_40px_rgba(255,0,153,0.8)] transition-all duration-300 border-0 rounded-full"
            >
              EXPLORAR PRODUCTOS Y NOVEDADES
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
