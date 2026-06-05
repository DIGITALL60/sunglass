import { useState } from "react";
import { useLogin } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
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
        setTimeout(() => setError(false), 500);
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ data: { email, password } });
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,245,255,0.05),transparent_50%)]" />

      <motion.div 
        className="w-full max-w-md bg-card/80 backdrop-blur-xl border border-primary/20 p-8 rounded-2xl shadow-[0_0_40px_rgba(0,245,255,0.1)] z-10"
        animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        <div className="text-center mb-8">
          <h1 className="font-orbitron text-3xl font-bold text-primary mb-2">SG ADMIN</h1>
          <p className="text-muted-foreground text-sm tracking-widest uppercase">System Access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="font-orbitron text-xs text-primary/80">EMAIL</Label>
            <Input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background/50 border-primary/30 h-12 focus-visible:ring-primary"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="font-orbitron text-xs text-primary/80">PASSWORD</Label>
            <Input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-background/50 border-primary/30 h-12 focus-visible:ring-primary"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 font-orbitron tracking-widest bg-primary text-primary-foreground hover:bg-primary/80 glow-hover"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "VERIFICANDO..." : "INGRESAR"}
          </Button>
          
          {loginMutation.isError && (
            <p className="text-destructive text-center text-sm font-orbitron mt-4">Acceso denegado</p>
          )}
        </form>
      </motion.div>
    </div>
  );
}
