import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDateTime, sanitize, sanitizeHtml } from "@/lib/utils";

import type { Reply } from "@helpdesk/core";
import { SenderType } from "@helpdesk/core";

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
    <div className="flex flex-col gap-3 p-4">
      {replies.map((reply) => (
        <Card
          key={reply.id}
          size="sm"
          className={reply.senderType === SenderType.Customer ? "bg-gray-50" : ""}
        >
          <CardHeader className="flex-row items-center gap-2 border-b pb-3">
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
          </CardHeader>
          <CardContent>
            {reply.bodyHtml ? (
              <div
                className="prose prose-sm max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(reply.bodyHtml) }}
              />
            ) : (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                {sanitize(reply.body)}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
