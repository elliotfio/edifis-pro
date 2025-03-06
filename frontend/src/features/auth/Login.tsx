import { useLogin } from "@/api/queries/authQueries"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { loginSchema, type LoginFormData } from "@/validators/loginValidator"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const { mutate: loginUser } = useLogin();

  const onSubmit = async (data: LoginFormData) => {
    try {
      await new Promise((resolve, reject) => {
        loginUser(data, {
          onSuccess: () => resolve(true),
          onError: (error) => reject(error),
        });
      });
    } catch (error) {
      console.error(error);
    }
  }

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
                type="email"
                {...register("email")}
                error={errors.email?.message}
                placeholder="votre@email.com"
              />
              <Input
                label="Mot de passe"
                type="password"
                {...register("password")}
                error={errors.password?.message}
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isSubmitting}
              disabled={isSubmitting}
              loadingText="Connexion en cours..."
            >
              Se connecter
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
