import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SendMessageParams {
  title: string;
  message: string;
  targetRoles: string[];
}

interface Message {
  id: string;
  sender_id: string;
  title: string;
  message: string;
  target_roles: string[];
  sent_at: string;
  created_at: string;
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, message, targetRoles }: SendMessageParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("messages")
        .insert({
          sender_id: user.id,
          title,
          message,
          target_roles: targetRoles,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      toast.success("Feed post sent successfully!");
    },
    onError: (error) => {
      toast.error("Failed to send message");
      console.error(error);
    },
  });
}

export function useMessageHistory() {
  return useQuery({
    queryKey: ["messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("sent_at", { ascending: false });

      if (error) throw error;
      return data as Message[];
    },
  });
}

export const roleGroups = [
  { value: "all", label: "All" },
  { value: "labor_team", label: "Labor Team" },
  { value: "leadership", label: "Leadership" },
  { value: "cno", label: "CNO" },
  { value: "director", label: "Directors" },
  { value: "nurse_manager", label: "Nurse Managers" },
];
