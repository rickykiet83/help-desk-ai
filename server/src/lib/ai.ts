import Anthropic from "@anthropic-ai/sdk";
import { TicketCategory } from "@/generated/prisma/enums";

const client = new Anthropic();

export async function classifyTicketCategory(
  subject: string,
  body: string
): Promise<TicketCategory | null> {
  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 20,
      messages: [
        {
          role: "user",
          content: `Classify this support email into exactly one of these categories: General_Question, Technical_Question, Refund_Request.\nSubject: ${subject}\nBody: ${body}\nReply with only the category name.`,
        },
      ],
    });
    const text = (response.content[0] as { text: string }).text.trim();
    if (Object.values(TicketCategory).includes(text as TicketCategory)) {
      return text as TicketCategory;
    }
  } catch {
    // fall through — category is optional on Ticket
  }
  return null;
}
