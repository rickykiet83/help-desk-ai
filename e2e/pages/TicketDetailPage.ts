import { type Locator, type Page, expect } from "@playwright/test";

/**
 * Page Object Model for /tickets/:id — the ticket detail page.
 *
 * Covers:
 *  - Ticket subject heading (h1)
 *  - Status badge in the metadata row
 *  - "Back to tickets" navigation link
 *  - Message card section heading and body
 *  - "From" metadata label
 *  - UpdateTicket panel selects (Status, Category, Assigned to)
 *  - Reply thread container and "No replies yet." empty state
 */
export class TicketDetailPage {
  readonly page: Page;

  // ---------------------------------------------------------------------------
  // Header area
  // ---------------------------------------------------------------------------

  /** The ticket subject rendered as an <h1>. */
  readonly heading: Locator;

  /**
   * Status badge in the metadata row beneath the h1.
   * The badge text matches the status string ("Open", "Resolved", "Closed").
   */
  readonly statusBadge: Locator;

  /** "Back to tickets" link rendered by <BackLink>. */
  readonly backLink: Locator;

  // ---------------------------------------------------------------------------
  // Message card
  // ---------------------------------------------------------------------------

  /** "Message" section heading inside the message card. */
  readonly messageHeading: Locator;

  /** The ticket body paragraph inside the message card. */
  readonly messageBody: Locator;

  // ---------------------------------------------------------------------------
  // Left metadata column ("From" / "Created")
  // ---------------------------------------------------------------------------

  /**
   * The "From" label (uppercase, small text).
   * Use `.locator('..').locator('xpath=following-sibling::*[1]')` on the
   * sibling if you need the value — but for presence checks this locator
   * is sufficient.
   */
  readonly fromLabel: Locator;

  // ---------------------------------------------------------------------------
  // UpdateTicket panel selects (right column)
  // ---------------------------------------------------------------------------

  /** Status <select> — identified by its associated <label>. */
  readonly statusSelect: Locator;

  /** Category <select> — identified by its associated <label>. */
  readonly categorySelect: Locator;

  /** "Assigned to" <select> — identified by its associated <label>. */
  readonly assignedToSelect: Locator;

  // ---------------------------------------------------------------------------
  // Reply thread
  // ---------------------------------------------------------------------------

  /**
   * The reply thread container — the outer wrapper <div> that holds
   * either the replies or the "No replies yet." message.
   * Scoped to the replies section inside the page.
   */
  readonly replyThreadContainer: Locator;

  /** Empty-state text shown when no replies exist. */
  readonly noRepliesText: Locator;

  constructor(page: Page) {
    this.page = page;

    this.heading = page.getByRole("heading", { level: 1 });

    // The status badge sits in the inline-flex row directly beneath the h1.
    // Scope to the h1's parent div to exclude ReplyThread sender-type badges.
    this.statusBadge = page
      .getByRole("heading", { level: 1 })
      .locator("xpath=following-sibling::div[1]")
      .locator("span.rounded-full");

    this.backLink = page.getByRole("link", { name: /back to tickets/i });

    this.messageHeading = page.getByText("Message", { exact: true });

    // The message body is inside the message card, below the sender sub-header.
    // It is the only <p> with `whitespace-pre-wrap` in the message section.
    this.messageBody = page.locator("p.whitespace-pre-wrap").first();

    this.fromLabel = page.getByText("From", { exact: true }).first();

    this.statusSelect = page.getByLabel("Status");
    this.categorySelect = page.getByLabel("Category");
    this.assignedToSelect = page.getByLabel("Assigned to");

    // The reply thread section wrapper — contains the "Replies" heading row
    // and the ReplyThread component output.
    this.replyThreadContainer = page.locator(
      "div.rounded-lg.border.border-gray-200.bg-white",
      { has: page.getByText(/^Replies/) }
    );

    this.noRepliesText = page.getByText("No replies yet.");
  }

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------

  /**
   * Navigate directly to a ticket detail page by ID and wait for the
   * ticket subject h1 to appear (skeleton replaced by real content).
   */
  async goto(ticketId: number) {
    await this.page.goto(`/tickets/${ticketId}`);
    await expect(this.heading).toBeVisible();
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /**
   * Return the current text of the status badge.
   * Useful for asserting the badge updated after a status change.
   */
  async getStatusBadgeText(): Promise<string> {
    return (await this.statusBadge.textContent()) ?? "";
  }

  /**
   * Return the value currently selected in the Status <select>.
   * Mirrors `getStatusBadgeText` but reads from the control, not the badge.
   */
  async getStatusSelectValue(): Promise<string> {
    return this.statusSelect.inputValue();
  }
}
