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
		<div className='flex flex-col gap-3'>
			{replies.map((reply) => (
				<Card key={reply.id} size='sm' className={reply.senderType === SenderType.Customer ? 'bg-gray-50' : 'px-3'}>
					<CardHeader className='flex-row items-center gap-4 border-b pb-4'>
						<span className='text-sm font-medium text-gray-800'>{reply.authorName}</span>
						<span
							className={`rounded-full py-0.5 text-xs font-medium`}
						>{reply.senderType} - {formatDateTime(reply.createdAt)}
						</span>
					</CardHeader>
					<CardContent>
						{reply.bodyHtml ? (
							<div
								className='prose prose-sm max-w-none text-gray-700'
								dangerouslySetInnerHTML={{ __html: sanitizeHtml(reply.bodyHtml) }}
							/>
						) : (
							<p className='whitespace-pre-wrap text-sm leading-relaxed text-gray-700'>{sanitize(reply.body)}</p>
						)}
					</CardContent>
				</Card>
			))}
		</div>
	);
}
