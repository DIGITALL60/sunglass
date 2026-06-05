import { useState } from "react";
import { useLogin } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import logoPath from "@assets/f9a8c8eb-e8b8-48c1-9ca2-dde803a0afde_1780655788028.jpeg";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [, setLocation] = useLocation();

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        localStorage.setItem("admin_token", data.token);
        setLocation("/admin/dashboard");
      },
      onError: () => {
        setError(true);
        setTimeout(() => setError(false), 600);
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ data: { email: "admin@tienda.com", password } });
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,0,153,0.05),transparent_50%)]" />

      <motion.div
        className="w-full max-w-sm bg-card/80 backdrop-blur-xl border border-primary/20 p-8 rounded-2xl shadow-[0_0_40px_rgba(255,0,153,0.1)] z-10"
        animate={error ? { x: [-12, 12, -12, 12, -6, 6, 0] } : {}}
        transition={{ duration: 0.45 }}
      >
        <div className="flex flex-col items-center mb-8 gap-3">
          <img src={logoPath} alt="Sun Glass" className="w-20 h-20 rounded-full border-2 border-primary/40 shadow-[0_0_20px_rgba(255,0,153,0.3)]" />
          <h1 className="font-orbitron text-2xl font-bold text-primary">PANEL ADMIN</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label className="font-orbitron text-xs text-primary/70 tracking-widest">CONTRASEÑA</Label>
            <Input
              type="password"
              required
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-background/50 border-primary/30 h-12 focus-visible:ring-primary text-center tracking-widest text-lg"
              data-testid="input-password"
            />
          </div>

          {loginMutation.isError && (
            <p className="text-destructive text-center text-sm font-orbitron">Contraseña incorrecta</p>
          )}

          <Button
            type="submit"
            className="w-full h-12 font-orbitron tracking-widest bg-primary text-primary-foreground hover:bg-primary/80"
            disabled={loginMutation.isPending}
            data-testid="button-login"
          >
            {loginMutation.isPending ? "VERIFICANDO..." : "INGRESAR"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
