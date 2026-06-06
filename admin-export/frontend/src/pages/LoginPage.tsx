import { useState } from "react";
import { api } from "../lib/api";

const S = {
  page: { minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f9fafb" } as const,
  card: { background:"#fff", border:"1px solid #e5e7eb", borderRadius:16, padding:40, width:"100%", maxWidth:380, boxShadow:"0 4px 24px rgba(0,0,0,0.08)" } as const,
  logo: { textAlign:"center" as const, marginBottom:32 },
  title: { fontSize:22, fontWeight:700, color:"#FF0099", letterSpacing:2, marginTop:12 },
  label: { display:"block", fontSize:12, fontWeight:600, color:"#6b7280", marginBottom:6, letterSpacing:1 },
  input: { width:"100%", padding:"10px 14px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:15, outline:"none", background:"#f9fafb" } as const,
  btn: { width:"100%", padding:"12px 0", background:"#FF0099", color:"#fff", border:"none", borderRadius:8, fontSize:15, fontWeight:700, cursor:"pointer", letterSpacing:2, marginTop:8 } as const,
  error: { color:"#ef4444", fontSize:13, textAlign:"center" as const, marginTop:8 },
};

export default function LoginPage({ onLogin }: { onLogin: (token: string) => void }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { token } = await api.login("admin@tienda.com", password);
      onLogin(token);
    } catch {
      setError("Contraseña incorrecta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={S.logo}>
          <div style={{ fontSize:40 }}>🌸</div>
          <div style={S.title}>PANEL ADMIN</div>
          <div style={{ fontSize:12, color:"#9ca3af", marginTop:4 }}>Sun Glass Accesorios</div>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom:20 }}>
            <label style={S.label}>CONTRASEÑA</label>
            <input
              type="password"
              required
              autoFocus
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={S.input}
              placeholder="••••••••••"
            />
          </div>
          {error && <p style={S.error}>{error}</p>}
          <button type="submit" disabled={loading} style={S.btn}>
            {loading ? "VERIFICANDO..." : "INGRESAR"}
          </button>
        </form>
      </div>
    </div>
  );
}
