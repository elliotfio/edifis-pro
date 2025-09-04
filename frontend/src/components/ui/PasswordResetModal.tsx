import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { usePasswordReset } from "@/api/queries/authQueries";
import { motion } from "framer-motion";

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
}

export function PasswordResetModal({ isOpen, onClose, defaultEmail = "" }: PasswordResetModalProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [resetResult, setResetResult] = useState<{
    message: string;
    tempPassword?: string;
    note?: string;
  } | null>(null);

  const { mutate: requestPasswordReset, isPending } = usePasswordReset();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    requestPasswordReset(email, {
      onSuccess: (data) => {
        setResetResult(data);
      },
      onError: (error) => {
        console.error('Erreur lors de la réinitialisation:', error);
        setResetResult({
          message: "Une erreur est survenue. Veuillez réessayer plus tard."
        });
      },
    });
  };

  const handleClose = () => {
    setEmail(defaultEmail);
    setResetResult(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Réinitialiser le mot de passe">
      <div className="space-y-4">
        {!resetResult ? (
          <motion.form 
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Entrez votre adresse email pour recevoir un nouveau mot de passe temporaire.
              </p>
              <Input
                label="Adresse email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                disabled={isPending}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                disabled={isPending}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isPending}
                disabled={isPending || !email.trim()}
                loadingText="Réinitialisation..."
              >
                Réinitialiser
              </Button>
            </div>
          </motion.form>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">{resetResult.message}</p>
              {resetResult.tempPassword && (
                <div className="mt-3 p-3 bg-white border border-green-300 rounded">
                  <p className="text-sm text-gray-600 mb-2">Mot de passe temporaire :</p>
                  <p className="font-mono text-lg font-bold text-green-700 bg-gray-50 p-2 rounded border">
                    {resetResult.tempPassword}
                  </p>
                  {resetResult.note && (
                    <p className="text-xs text-orange-600 mt-2">
                      <strong>Important :</strong> {resetResult.note}
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                variant="primary"
                onClick={handleClose}
              >
                Fermer
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </Modal>
  );
}


