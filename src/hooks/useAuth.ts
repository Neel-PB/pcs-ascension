// Re-export from AuthContext for backwards compatibility
// All components using useAuth() will now use the centralized context
export { useAuthContext as useAuth } from "@/contexts/AuthContext";
