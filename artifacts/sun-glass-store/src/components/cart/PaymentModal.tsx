import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle2 } from "lucide-react";
import { formatPrice } from "@/lib/format";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  onConfirm: (receiptUrl: string) => void;
}

export function PaymentModal({ isOpen, onClose, total, onConfirm }: PaymentModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [receiptUrl, setReceiptUrl] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setUploadError("");

    try {
      const file = files[0];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "sunglass_unsigned");

      const res = await fetch("https://api.cloudinary.com/v1_1/dafxkpvrx/image/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error?.message || "Error al subir imagen");
      }

      setReceiptUrl(data.secure_url);
    } catch (err: unknown) {
      console.error("[Upload] Error:", err);
      setUploadError(err instanceof Error ? err.message : "Error al subir imagen");
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card border-primary/30 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-orbitron text-primary text-xl text-center">
            FINALIZAR COMPRA
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            Total a transferir: <span className="font-bold text-lg text-primary">{formatPrice(total)}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="bg-secondary/50 p-4 rounded-xl border border-primary/20 text-sm space-y-2 text-center md:text-left">
            <h3 className="font-orbitron font-bold text-primary mb-3">DATOS BANCARIOS</h3>
            <p><strong>Alias:</strong> SUNVM33</p>
            <p className="break-all"><strong>CBU/CVU:</strong> 3840200500000010336661</p>
            <p><strong>Titular (Ualá):</strong> HEREDIA FIAMMA ELIZABETH</p>
          </div>

          <div className="space-y-3">
             <h3 className="font-orbitron font-bold text-sm text-center">SUBIR COMPROBANTE *</h3>
             <p className="text-xs text-muted-foreground text-center">Sube la captura de tu transferencia para poder confirmar y enviar el pedido por WhatsApp.</p>
             
             {!receiptUrl ? (
               <div
                 onClick={() => fileInputRef.current?.click()}
                 className={`border-2 border-dashed ${uploadError ? 'border-destructive' : 'border-primary/30'} rounded-xl p-6 flex flex-col items-center gap-3 cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all`}
               >
                 {uploading ? (
                   <div className="flex flex-col items-center gap-2 text-primary">
                     <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                     <span className="text-sm font-orbitron">Subiendo...</span>
                   </div>
                 ) : (
                   <>
                     <Upload className="w-8 h-8 text-primary/50" />
                     <p className="text-sm text-primary font-orbitron font-bold text-center">ELEGIR FOTO O PDF</p>
                   </>
                 )}
               </div>
             ) : (
               <div className="bg-primary/10 border border-primary/30 p-4 rounded-xl flex flex-col sm:flex-row items-center gap-3 justify-between">
                 <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    <span className="text-sm font-medium">Comprobante subido</span>
                 </div>
                 <Button variant="ghost" size="sm" onClick={() => setReceiptUrl("")} className="text-xs text-destructive hover:text-destructive shrink-0">Cambiar archivo</Button>
               </div>
             )}

             <input
               ref={fileInputRef}
               type="file"
               accept="image/*,application/pdf"
               className="hidden"
               onChange={handleFileChange}
             />
             
             {uploadError && <p className="text-destructive text-xs text-center">{uploadError}</p>}
          </div>

          <Button 
            className="w-full h-14 font-orbitron tracking-wider text-base bg-[#25D366] hover:bg-[#20ba59] text-white" 
            disabled={!receiptUrl || uploading}
            onClick={() => onConfirm(receiptUrl)}
          >
            CONFIRMAR Y ENVIAR
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
