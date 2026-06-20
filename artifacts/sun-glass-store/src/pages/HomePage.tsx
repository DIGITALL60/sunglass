import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";

export default function HomePage() {
  const [textIndex, setTextIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const titles = [
    "¡TU DOSIS DIARIA DE DIVERSION TE ESPERA ACA!",
    "COLECCIONA MOMENTOS, ACUMULA PERSONAJES."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % titles.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      if (videoRef.current.currentTime >= videoRef.current.duration - 1) {
        videoRef.current.currentTime = 0;
        videoRef.current.play();
      }
    }
  };

  return (
    <>
      <SEO />
      <div className="min-h-[100dvh] flex items-center justify-center relative overflow-hidden">
        {/* Background video */}
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          onTimeUpdate={handleTimeUpdate}
          className="absolute inset-0 w-full h-full object-cover scale-[1.15]"
          style={{ imageRendering: "auto" }}
          src="/sun.mp4"
        />

        {/* Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20 pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-3xl mx-auto pt-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="flex flex-col items-center gap-4 px-6 py-8 sm:px-10 sm:py-10 rounded-3xl"
            style={{
              background: "rgba(0, 0, 0, 0.35)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              border: "1px solid rgba(255,0,153,0.15)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.25), inset 0 0 30px rgba(255,0,153,0.02)",
            }}
          >
            <div className="flex items-center justify-center text-center w-full min-h-[100px] sm:min-h-[120px]">
              <AnimatePresence mode="wait">
                <motion.h1
                  key={textIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="font-orbitron font-black leading-[1.25] text-white notranslate"
                  translate="no"
                  style={{
                    fontSize: "clamp(1.4rem, 5.5vw, 2.8rem)",
                    textShadow: "0 2px 20px rgba(255,0,153,0.5), 0 0 40px rgba(255,0,153,0.2)",
                    letterSpacing: "0.02em",
                  }}
                >
                  {titles[textIndex]}
                </motion.h1>
              </AnimatePresence>
            </div>

            <p
              className="text-white/80 font-medium"
              style={{
                fontSize: "clamp(0.9rem, 2.5vw, 1.15rem)",
                textShadow: "0 1px 8px rgba(0,0,0,0.6)",
                maxWidth: "38ch",
              }}
            >
              Diversión, estilo y todo lo que te gusta..
            </p>

            <Link href="/tienda">
              <Button
                size="lg"
                className="h-12 sm:h-14 px-6 sm:px-10 text-xs sm:text-sm font-orbitron tracking-[0.2em] bg-primary text-white hover:bg-primary/85 hover:shadow-[0_0_40px_rgba(255,0,153,0.8)] transition-all duration-300 border-0 rounded-full"
              >
                EXPLORAR PRODUCTOS Y NOVEDADES
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </>
  );
}
