import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { registerSchema } from "@inventory/types";
import { Logo } from "@inventory/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { useRegister } from "@/hooks/useAuth";

export default function RegisterPage() {
  const registerUser = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(registerSchema) });

  const onSubmit = (data) => registerUser.mutate(data);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <Logo className="h-10 w-10 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">Create your account</h1>
          <p className="text-sm text-muted-foreground">Start tracking your inventory in minutes</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
          <FormField label="Full name" htmlFor="name" error={errors.name?.message} required>
            <Input id="name" placeholder="Jane Cooper" {...register("name")} />
          </FormField>

          <FormField label="Email" htmlFor="email" error={errors.email?.message} required>
            <Input id="email" type="email" placeholder="you@company.com" {...register("email")} />
          </FormField>

          <FormField label="Password" htmlFor="password" error={errors.password?.message} required>
            <Input id="password" type="password" placeholder="At least 6 characters" {...register("password")} />
          </FormField>

          <Button type="submit" className="w-full" disabled={registerUser.isPending}>
            {registerUser.isPending ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
