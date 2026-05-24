import { createReplySchema } from "@helpdesk/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";

const api = axios.create({ withCredentials: true });

type ReplyFormData = z.infer<typeof createReplySchema>;

interface Props {
  ticketId: number;
}

export function ReplyForm({ ticketId }: Props) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReplyFormData>({
    resolver: zodResolver(createReplySchema),
  });

  const replyMutation = useMutation({
    mutationFn: async (data: ReplyFormData) => {
      await api.post(`/api/tickets/${ticketId}/replies`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets", String(ticketId), "replies"] });
      reset();
    },
  });

  return (
    <form
      onSubmit={handleSubmit((data) => {
        replyMutation.mutateAsync(data).catch(() => {});
      })}
      className="space-y-3 px-6 py-4"
    >
      <textarea
        {...register("body")}
        rows={4}
        placeholder="Write a reply..."
        disabled={replyMutation.isPending}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
      />
      {errors.body && (
        <p className="text-xs text-red-600">{errors.body.message}</p>
      )}
      {replyMutation.isError && (
        <p className="text-xs text-red-600">Failed to send reply. Please try again.</p>
      )}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={replyMutation.isPending}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {replyMutation.isPending ? "Sending…" : "Send reply"}
        </button>
      </div>
    </form>
  );
}
