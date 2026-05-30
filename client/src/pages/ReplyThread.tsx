import type { Reply } from "@helpdesk/core";
import { SenderType } from "@helpdesk/core";
import { formatDateTime } from "@/lib/utils";

interface ReplyThreadProps {
  replies: Reply[];
}

export function ReplyThread({ replies }: ReplyThreadProps) {
  if (replies.length === 0) {
    return (
      <div className="px-6 py-8 text-center text-sm text-gray-400">
        No replies yet.
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {replies.map((reply) => (
        <div
          key={reply.id}
          className={`px-6 py-4 ${reply.senderType === SenderType.Customer ? "bg-gray-50" : ""}`}
        >
          <div className="mb-1.5 flex items-center gap-2">
            <span className="text-sm font-medium text-gray-800">{reply.authorName}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                reply.senderType === SenderType.Agent
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {reply.senderType}
            </span>
            <span className="text-xs text-gray-400">{formatDateTime(reply.createdAt)}</span>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
            {reply.body}
          </p>
        </div>
      ))}
    </div>
  );
}
