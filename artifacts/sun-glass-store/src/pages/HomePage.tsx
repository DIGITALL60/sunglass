import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center relative overflow-hidden pt-20">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="font-orbitron text-5xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-primary drop-shadow-[0_0_20px_rgba(0,245,255,0.4)] mb-6">
            ACCESORIOS<br/>DEL FUTURO
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 font-medium max-w-2xl">
            Diseño sin límites. Tecnología sin compromiso.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          <Link href="/tienda">
            <Button size="lg" className="h-16 px-10 text-lg font-orbitron tracking-[0.2em] bg-primary text-primary-foreground hover:bg-primary hover:shadow-[0_0_30px_rgba(0,245,255,0.6)] transition-all duration-300">
              EXPLORAR COLECCIÓN
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
