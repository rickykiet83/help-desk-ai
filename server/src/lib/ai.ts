import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

interface ReplyForSummary {
  senderType: string;
  authorName: string;
  body: string;
}

export async function summarizeTicket(
  subject: string,
  body: string,
  replies: ReplyForSummary[]
): Promise<string> {
  const conversation = replies
    .map((r) => `[${r.senderType} — ${r.authorName}]: ${r.body}`)
    .join("\n\n");

  const content = `Subject: ${subject}\n\nOriginal message:\n${body}${conversation ? `\n\nConversation:\n${conversation}` : ""}`;

  const { text } = await generateText({
    model: openai("gpt-5-nano"),
    messages: [
      {
        role: "user",
        content: `Summarize this support ticket and its conversation in 2-4 concise sentences. Focus on the customer's issue, any steps taken, and current status.\n\n${content}\n\nSummary:`,
      },
    ],
  });

  return text.trim();
}
