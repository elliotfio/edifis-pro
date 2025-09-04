import { useLogin } from "@/api/queries/authQueries"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { PasswordResetModal } from "@/components/ui/PasswordResetModal"
import { loginSchema, type LoginFormData } from "@/validators/loginValidator"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { useState } from "react"
import type { BruteForceError } from "@/types/authType"

export default function Login() {
  const [bruteForceError, setBruteForceError] = useState<BruteForceError | null>(null);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [currentEmail, setCurrentEmail] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const { mutate: loginUser } = useLogin();

  const onSubmit = async (data: LoginFormData) => {
    setBruteForceError(null);
    setCurrentEmail(data.email);
    
    try {
      await new Promise((resolve, reject) => {
        loginUser(data, {
          onSuccess: () => {
            setBruteForceError(null);
            resolve(true);
          },
          onError: (error: any) => {
            // Gérer les erreurs de brute force
            if (error?.response?.status === 429 || error?.response?.status === 423) {
              const errorData = error.response.data as BruteForceError;
              setBruteForceError(errorData);
            }
            reject(error);
          },
        });
      });
    } catch (error) {
      console.error(error);
    }
  }

  const handlePasswordReset = () => {
    setShowPasswordReset(true);
  }

  const emailValue = watch("email");

  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="text-5xl font-bold uppercase text-primary">Edifis</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <Input
                label="Email"
                error={errors.email?.message}
                {...register("email")}
              />
              <Input
                label="Mot de passe"
                error={errors.password?.message}
                {...register("password")}
              />
            </div>

            {/* Afficher les erreurs de brute force */}
            {bruteForceError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg border ${
                  bruteForceError.requiresPasswordReset 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-orange-50 border-orange-200'
                }`}
              >
                <p className={`text-sm ${
                  bruteForceError.requiresPasswordReset 
                    ? 'text-red-700' 
                    : 'text-orange-700'
                }`}>
                  {bruteForceError.message}
                </p>
                {bruteForceError.requiresPasswordReset && (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    className="mt-3"
                    onClick={handlePasswordReset}
                  >
                    Réinitialiser le mot de passe
                  </Button>
                )}
              </motion.div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isSubmitting}
              disabled={isSubmitting || (bruteForceError?.requiresPasswordReset === true)}
              loadingText="Connexion en cours..."
            >
              Se connecter
            </Button>
          </form>
        </motion.div>
      </div>
      
      {/* Modal de réinitialisation du mot de passe */}
      <PasswordResetModal
        isOpen={showPasswordReset}
        onClose={() => setShowPasswordReset(false)}
        defaultEmail={emailValue || currentEmail}
      />
    </div>
  )
}
