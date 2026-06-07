import type { Ticket } from "@/generated/prisma/client";
import { TicketCategory } from "@/generated/prisma/enums";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export const classifyTicketCategory = async (
  ticket: Pick<Ticket, "id" | "subject" | "body">
): Promise<TicketCategory | null> => {
  const result = await generateText({
    model: openai("gpt-5-nano"),
    messages: [
      {
        role: "user",
        content: `Classify this support email into exactly one of these categories: General_Question, Technical_Question, Refund_Request.\nSubject: ${ticket.subject}\nBody: ${ticket.body}\nReply with only the category name.`,
      },
    ],
  }).catch((error: unknown) => {
    console.error(`Failed to classify ticket ${ticket.id}:`, error);
    return null;
  });

  if (!result) return null;

  const { text } = result;
  if (Object.values(TicketCategory).includes(text.trim() as TicketCategory)) {
    return text.trim() as TicketCategory;
  }
  return null;
};
