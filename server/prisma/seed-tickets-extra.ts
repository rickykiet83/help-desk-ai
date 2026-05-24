import "dotenv/config";
import { TicketStatus, TicketCategory } from "../src/generated/prisma/enums";
import { prisma } from "../src/db";

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(Math.floor(Math.random() * 14) + 7);
  d.setMinutes(Math.floor(Math.random() * 60));
  return d;
}

const extra = [
  {
    subject: "How do I reset 2FA if I lost my phone?",
    body: "I lost my phone and can no longer receive 2FA codes. How do I regain access to my account?",
    status: TicketStatus.Open,
    category: TicketCategory.Technical_Question,
    senderName: "Aaron Blake",
    senderEmail: "aaron.blake@gmail.com",
    createdAt: daysAgo(1),
  },
  {
    subject: "Refund — ordered wrong product variant",
    body: "I ordered the 256GB model but meant to order 512GB. Can I exchange or get a refund to reorder?",
    status: TicketStatus.Open,
    category: TicketCategory.Refund_Request,
    senderName: "Brigitte Morel",
    senderEmail: "brigitte.morel@outlook.fr",
    createdAt: daysAgo(2),
  },
  {
    subject: "Autocomplete suggestions showing outdated data",
    body: "The search autocomplete still shows products we discontinued 6 months ago. Very confusing for customers.",
    status: TicketStatus.Closed,
    category: TicketCategory.Technical_Question,
    senderName: "Ivan Petrov",
    senderEmail: "ivan.petrov@shop.ru",
    createdAt: daysAgo(62),
  },
  {
    subject: "Do you have SOC 2 certification?",
    body: "Our security team requires SOC 2 Type II compliance before we can proceed with purchase. Do you have this?",
    status: TicketStatus.Resolved,
    category: TicketCategory.General_Question,
    senderName: "Katherine Young",
    senderEmail: "k.young@securityco.com",
    createdAt: daysAgo(33),
  },
  {
    subject: "Payment failed but was charged on credit card",
    body: "The checkout said payment failed, but my bank shows a pending charge of $89. Please investigate.",
    status: TicketStatus.Open,
    category: TicketCategory.Refund_Request,
    senderName: "Omar Farouk",
    senderEmail: "omar.farouk@eg.com",
    createdAt: daysAgo(1),
  },
  {
    subject: "Scroll position resets when navigating back",
    body: "After clicking into a product and pressing Back, the page always jumps to the top instead of restoring scroll position.",
    status: TicketStatus.Closed,
    category: TicketCategory.Technical_Question,
    senderName: "Tina Park",
    senderEmail: "tina.park@kr.net",
    createdAt: daysAgo(48),
  },
  {
    subject: "Can I get a printed receipt mailed to me?",
    body: "I need a physical paper receipt for expense reimbursement. Can you mail one, or is PDF the only option?",
    status: TicketStatus.Resolved,
    category: TicketCategory.General_Question,
    senderName: "George Bailey",
    senderEmail: "george.bailey@post.com",
    createdAt: daysAgo(27),
  },
  {
    subject: "Notifications not appearing in correct language",
    body: "My account is set to French but push notifications arrive in English. All other UI is in French correctly.",
    status: TicketStatus.Open,
    category: TicketCategory.Technical_Question,
    senderName: "Marie Leclerc",
    senderEmail: "marie.leclerc@quebec.ca",
    createdAt: daysAgo(3),
  },
  {
    subject: "Refund for subscription — no longer using the product",
    body: "Our company pivoted and we no longer need this tool. We have 8 months remaining. Can we get a prorated refund?",
    status: TicketStatus.Open,
    category: TicketCategory.Refund_Request,
    senderName: "Startup Team",
    senderEmail: "accounts@pivotco.io",
    createdAt: daysAgo(4),
  },
  {
    subject: "Table sorting not persisting after page refresh",
    body: "I sort the table by date and navigate away, then come back — the sort resets to default every time.",
    status: TicketStatus.Open,
    category: TicketCategory.Technical_Question,
    senderName: "Alex Turner",
    senderEmail: "alex.turner@devuser.com",
    createdAt: daysAgo(1),
  },
  {
    subject: "How to set up team permissions and roles?",
    body: "We have junior and senior staff. I want juniors to view but not edit. How do I configure role-based permissions?",
    status: TicketStatus.Resolved,
    category: TicketCategory.General_Question,
    senderName: "Pham Thi Lan",
    senderEmail: "lan.pham@vn.com",
    createdAt: daysAgo(10),
  },
  {
    subject: "Wrong tax rate applied on invoice",
    body: "I am in Texas (8.25% tax) but my invoice shows 10%. Can this be corrected and the difference refunded?",
    status: TicketStatus.Open,
    category: TicketCategory.Refund_Request,
    senderName: "Josh Harrington",
    senderEmail: "josh.h@texas.us",
    createdAt: daysAgo(2),
  },
  {
    subject: "Cannot print order confirmation page",
    body: "When I use Ctrl+P on the order confirmation page, the layout breaks completely. The PDF is unusable.",
    status: TicketStatus.Closed,
    category: TicketCategory.Technical_Question,
    senderName: "Dorothy Evans",
    senderEmail: "dorothy.evans@senior.com",
    createdAt: daysAgo(75),
  },
];

async function seed() {
  console.log(`Seeding ${extra.length} additional tickets...`);
  await prisma.ticket.createMany({ data: extra });
  const total = await prisma.ticket.count();
  console.log(`Done. Total tickets in DB: ${total}`);
}

seed()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
