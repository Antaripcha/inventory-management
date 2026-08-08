import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authApi } from "@/lib/resources/auth";
import { useAuthStore } from "@/store/authStore";

export function useCurrentUser() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const setUser = useAuthStore((s) => s.setUser);

  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await authApi.me();
      setUser(res.data.user);
      return res.data.user;
    },
    enabled: !!accessToken,
    retry: false,
  });
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (res) => {
      setAuth(res.data);
      toast.success(`Welcome back, ${res.data.user.name}`);
      navigate("/dashboard");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Login failed");
    },
  });
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (res) => {
      setAuth(res.data);
      toast.success("Account created successfully");
      navigate("/dashboard");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Registration failed");
    },
  });
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(refreshToken),
    onSettled: () => {
      clearAuth();
      queryClient.clear();
      toast.success("Logged out successfully");
      navigate("/login");
    },
  });
}
