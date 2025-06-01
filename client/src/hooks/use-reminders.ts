import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Reminder, InsertReminder } from "@shared/schema";

export function useReminders() {
  const queryClient = useQueryClient();

  const { data: reminders = [], isLoading } = useQuery<Reminder[]>({
    queryKey: ["/api/reminders"],
  });

  const createReminderMutation = useMutation({
    mutationFn: async (reminder: InsertReminder) => {
      const response = await apiRequest("POST", "/api/reminders", reminder);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
    },
  });

  const updateReminderMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Reminder> }) => {
      const response = await apiRequest("PATCH", `/api/reminders/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
    },
  });

  const deleteReminderMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/reminders/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
    },
  });

  const createReminder = async (reminder: InsertReminder) => {
    return createReminderMutation.mutateAsync(reminder);
  };

  const updateReminder = async (id: number, updates: Partial<Reminder>) => {
    return updateReminderMutation.mutateAsync({ id, updates });
  };

  const deleteReminder = async (id: number) => {
    return deleteReminderMutation.mutateAsync(id);
  };

  return {
    reminders,
    createReminder,
    updateReminder,
    deleteReminder,
    isLoading,
  };
}
