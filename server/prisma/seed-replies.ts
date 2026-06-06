import "dotenv/config";
import { prisma } from "../src/db";

const TICKET_ID = 184;
const AGENT_ID = "33352ad6-00d1-49fe-8e40-5d0bc69980b2";
const AGENT_NAME = "test";

const replies = [
  {
    senderType: "Customer" as const,
    authorName: "Jordan Mitchell",
    body: `Hi there,

I wanted to follow up on the issue I reported earlier about table sorting not persisting after a page refresh.
This is causing a significant problem for our team because we frequently need to reload pages during our workflow.

Every single time I refresh the browser, the table resets to its default sort order, which is by date ascending.
We usually work with data sorted by priority descending, and having to re-apply that sort every session is frustrating.

I've tried this on multiple browsers — Chrome, Firefox, and Edge — and the behavior is the same across all of them.
I also tested on a different computer entirely, so it doesn't seem to be a local cache issue.

Our team has about 30 people who use this feature daily, so the impact is quite wide.
Could you please look into this? Even a workaround would be helpful in the short term.

I'd also like to understand whether this is a known issue and if there's a timeline for a fix.
Thank you for your time and I look forward to your response.

Best regards,
Jordan`,
  },
  {
    senderType: "Agent" as const,
    authorName: AGENT_NAME,
    body: `Hi Jordan,

Thank you for reaching out and for the detailed description of the issue — it really helps us narrow things down.

I can confirm that this is a known issue that was introduced in our v3.2.1 release about two weeks ago.
The sorting state was previously stored in localStorage, but a recent refactor inadvertently removed that persistence logic.

I've already flagged your report to our frontend engineering team and linked it to the internal ticket tracking this bug.
You're not alone — we've received a handful of similar reports from other enterprise customers this week.

In the meantime, here is a workaround you can share with your team:
You can append a query parameter to the URL to force a specific sort order. For example:
  https://app.example.com/data?sort=priority&order=desc

Bookmarking that URL will restore the sort state each time the page loads.
It's not perfect, but it should reduce friction for your team until the fix is deployed.

Our engineering team is targeting a patch release for early next week. I'll send you a notification as soon as it goes live.
Please don't hesitate to reach out if you have any other questions in the meantime.

Best,
${AGENT_NAME}`,
  },
  {
    senderType: "Customer" as const,
    authorName: "Jordan Mitchell",
    body: `Hi ${AGENT_NAME},

Thank you so much for the quick response and for confirming the root cause.
It's reassuring to know that the engineering team is already aware of it and working on a fix.

I shared the URL workaround with my team and most of them were able to get it working.
However, a few colleagues ran into an issue where the query parameters don't seem to be respected when navigating
from another internal link. The sort resets to default again once they click a link from the dashboard.

Is there a way to make the URL parameters persist across internal navigation as well?
Or perhaps a browser extension or config option that could help in the interim?

Also, I wanted to mention that we noticed a secondary issue: when we export the table data to CSV,
the exported file always uses the default sort order rather than the currently applied one.
This makes the export less useful since we have to re-sort it in Excel afterward.

I'm not sure if that's related to the same bug or a separate issue entirely.
Could you log that as a separate bug report or investigate whether it's connected?

Looking forward to the patch next week. Please do keep us updated on the timeline.

Thanks again,
Jordan`,
  },
  {
    senderType: "Agent" as const,
    authorName: AGENT_NAME,
    body: `Hi Jordan,

Great to hear the workaround helped most of your team — and thank you for flagging those two additional issues.

Regarding the URL parameters not persisting across internal navigation:
This is actually a separate issue from the localStorage bug. Our internal router currently strips query parameters
during client-side navigation as part of a URL normalization step. I've added a note about this to the bug report.

The engineering team will need to evaluate whether fixing this is in scope for the same patch release,
or whether it requires a separate story. I'll update you as soon as I have clarity on that.

For the CSV export issue — I tested this myself and can reproduce it. You're right that the export always
reflects the default sort rather than the active one. I've opened a separate bug ticket for this: #BUG-4821.
It's been assigned to the same engineer handling the sort persistence issue, so there's a good chance
both fixes land in the same release.

In the meantime, one workaround for the CSV export is to manually sort the downloaded file in Excel.
I know that's an extra step, but it's the best we can offer until the fix is in place.

I'll proactively reach out the moment the patch goes live and confirm both issues are resolved.
Thank you for your patience and for providing such clear and detailed reports — it genuinely speeds up our process.

Best,
${AGENT_NAME}`,
  },
  {
    senderType: "Customer" as const,
    authorName: "Jordan Mitchell",
    body: `Hi ${AGENT_NAME},

Thank you for opening the separate bug ticket for the CSV export issue — that's much appreciated.
I'll keep an eye on both #BUG-4821 and the sort persistence fix.

I wanted to update you: I did some additional testing this morning and discovered something interesting.
The sort persistence issue does NOT occur when using our staging environment, only in production.
This suggests that there might be an environment-specific configuration difference causing the problem.

I'm running Chrome 124 on Windows 11, in case that's useful information for the engineers.
My colleague on macOS using Safari also experiences the same issue, so it's cross-platform.

One more thing — our IT department mentioned they've recently deployed a Content Security Policy (CSP)
header change across the company. Could that be interfering with localStorage access? I'm not a developer,
so I'm not sure if that's even possible, but I wanted to mention it just in case.

Also, is there any way to get early access to the patch build so we can test it in our staging environment
before it goes to production? We'd like to verify the fix before it reaches our users.

We're happy to provide detailed feedback if that's helpful for your QA process.
Just let us know what you need from our side.

Thanks,
Jordan`,
  },
  {
    senderType: "Agent" as const,
    authorName: AGENT_NAME,
    body: `Hi Jordan,

This is very helpful — thank you for the additional investigation.

The fact that staging works but production doesn't is a great lead. I've passed that observation directly
to the engineer assigned to this bug, and they're already looking into environment-level differences.
One likely culprit is our production CDN caching a stale version of the JavaScript bundle, which could
explain why the fix that landed in staging hasn't propagated to production yet.

Regarding the CSP question — it's actually a smart thing to mention. A strict CSP can in some configurations
restrict access to localStorage, particularly with certain iframe or cross-origin policies. However, in your
case, I'd expect you'd see console errors rather than silent failure. That said, I've asked our engineer
to check the CSP headers in production just to rule it out.

For early access to the patch build — yes, absolutely. We have a beta channel program where enterprise
customers can opt into pre-release builds for staging testing. I'm going to flag your account for inclusion.
You should receive an email within one business day with instructions on how to enable the beta channel
in your staging environment.

I'll also set up a brief 20-minute call with our QA lead and the assigned engineer once the patch is ready,
so we can walk through the testing together if you'd like that level of support.

Thank you again for being so thorough in your reporting. It genuinely makes a difference.

Best,
${AGENT_NAME}`,
  },
  {
    senderType: "Customer" as const,
    authorName: "Jordan Mitchell",
    body: `Hi ${AGENT_NAME},

The beta channel access sounds great — I'll watch for that email. And yes, a 20-minute call with the QA
lead and engineer would be very helpful. Please go ahead and set that up whenever the patch is ready.

I wanted to share another update from our side. After your message about the CDN cache, our IT team did a
hard cache purge on our end (Ctrl+Shift+R) and also cleared all browser caches. The issue persists even after
a full cache clear, so it doesn't appear to be a client-side caching problem.

We also tested using a private/incognito window with no extensions enabled. The problem still occurs there,
which effectively rules out any browser extension interference.

I also noticed that the issue affects not just the main data table but also the secondary audit log table
on the same page. Both reset their sort state on refresh. I'm not sure if they share the same persistence
logic in your codebase, but I thought it was worth mentioning.

One of our developers on staff had a look at the browser's network requests and noticed that on page load,
there's a request to /api/user-preferences that returns a 200 but with an empty object body.
Could that endpoint be responsible for loading saved sort preferences? If so, it might be returning nothing
when it should be returning saved state.

Sorry for all the detail — I just want to help resolve this as quickly as possible.

Best,
Jordan`,
  },
  {
    senderType: "Agent" as const,
    authorName: AGENT_NAME,
    body: `Hi Jordan,

No need to apologize — this level of detail is extremely valuable and has actually unlocked a new lead.

Your developer's observation about the /api/user-preferences endpoint returning an empty object is spot on.
I've just checked with our backend team, and it turns out the preferences migration that was supposed to
ship alongside the v3.2.1 release was accidentally excluded from the deployment. The database table
for user preferences exists, but the columns for sort state were never added to production.

This explains why staging works (the migration ran there) but production does not.
The engineering team is preparing an emergency migration to run on the production database,
and it will be accompanied by the frontend fix to write and read from that endpoint correctly.

You're also correct that the audit log table shares the same persistence logic — so both tables should be
fixed by the same patch. I've confirmed this with the engineer.

I'm going to escalate the priority of this issue given the production data gap.
Our target is now end of business today for the migration and tomorrow morning for the full frontend patch.

I'll send you a follow-up the moment the migration completes so your team can begin re-testing.
Thank you — your developer's observation potentially saved us days of debugging.

Best,
${AGENT_NAME}`,
  },
  {
    senderType: "Customer" as const,
    authorName: "Jordan Mitchell",
    body: `Hi ${AGENT_NAME},

Wow, I'm glad that detail was useful! Please pass along my thanks to the team for escalating this.

I wanted to let you know that end of business today works fine for us. Our team has been managing with
the URL workaround, and while it's not ideal, it's not blocking anyone from doing their work.

Just to confirm our understanding of the fix:
1. A database migration will add the missing columns to the user-preferences table in production.
2. A frontend patch will update the UI to correctly write to and read from /api/user-preferences.
3. Both the main data table and the audit log table will have their sort state persisted.
4. The CSV export will reflect the active sort order.

Did I capture that correctly? I want to make sure we're testing the right things when the beta build arrives.

Also, should we expect any data loss or disruption during the database migration window?
Our team uses the application fairly heavily during business hours, and I want to give them a heads-up
if there's going to be any downtime or degraded performance.

Finally, is there a status page we can monitor for the deployment? I'll share it with our team.

Thanks again for all your help on this. Really appreciate it.

Best,
Jordan`,
  },
  {
    senderType: "Agent" as const,
    authorName: AGENT_NAME,
    body: `Hi Jordan,

Your summary is accurate — that's exactly what the fix covers. Well captured.

On the database migration: it's a non-destructive, additive migration (adding nullable columns only),
so there will be no data loss and no planned downtime. The migration typically completes in under 30 seconds
on our production database at this table size. We run it with a zero-downtime strategy using an online
schema change tool, so your team should experience no interruption during business hours.

The only thing users might notice is that the first time they apply a sort after the patch, it will be
written to the database. From that point forward, it will persist across refreshes automatically.
Existing sort preferences won't be pre-populated (since there's no historical data to restore),
but all future preferences will be saved and respected.

Yes, we have a public status page at status.example.com — I'll make sure the deployment is listed there
with a maintenance window notification at least an hour in advance.

I'll be sending two notifications:
  1. When the database migration completes (no action needed on your end).
  2. When the full frontend patch is deployed and ready for your testing.

The beta channel access email should land in your inbox within the next couple of hours.
Let me know if you don't receive it and I'll manually add your account to the program.

Thank you again for your patience and collaboration throughout this process.

Best,
${AGENT_NAME}`,
  },
  {
    senderType: "Customer" as const,
    authorName: "Jordan Mitchell",
    body: `Hi ${AGENT_NAME},

Thank you for the detailed clarification on the migration process — very reassuring to know it's non-destructive.

I received the beta channel email and followed the instructions to enable it on our staging environment.
The patch is showing as version 3.2.2-beta.1. I've begun testing and here are my initial findings:

Sort persistence: WORKING ✓ — both the main data table and audit log table now retain their sort state
across full page refreshes. This is exactly what we needed.

CSV export sort: PARTIALLY WORKING — the CSV export now reflects the active sort for the main table,
but the audit log table's export still uses the default sort. This might be a separate code path that
was missed in the fix.

URL parameter navigation: STILL BROKEN — navigating from the dashboard to the data table via an internal
link still resets the sort. Since the new version reads from user preferences instead of URL params,
I expected this to be resolved automatically, but it seems the preference isn't being read on navigation.

I want to emphasize that the core fix is working and represents a major improvement.
These are relatively minor issues by comparison. But since you have the engineers' attention, it might
be worth addressing them in the same release rather than shipping a follow-up patch.

Let me know if you need me to provide console logs, HAR files, or any other diagnostic information.

Thanks,
Jordan`,
  },
  {
    senderType: "Agent" as const,
    authorName: AGENT_NAME,
    body: `Hi Jordan,

Thank you for the thorough and structured testing — this is exactly what we needed from the beta.

I've relayed your findings to the engineering team immediately. Here's their response to each point:

Sort persistence: Confirmed working as expected. The migration and frontend changes are functioning correctly.

CSV export for audit log: The engineer identified the issue. The audit log table uses a separate export
service that was not included in the initial fix scope. They're adding a fix for that now and it will be
included in the final 3.2.2 release. ETA: later today.

URL parameter navigation / preference not read on navigation: This is the trickiest one. The preference
is stored and retrieved correctly on full page loads, but during client-side navigation, the component
mounts with a default state before the async preference fetch completes. The engineer is implementing
an initializing state that will defer rendering the table until the preference is loaded.

Given these findings, we're adjusting the release to be 3.2.2-beta.2 tomorrow morning, with all three
fixes included. The final stable release will be 3.2.2, scheduled for the day after pending your sign-off.

Would you be able to run the same test suite against beta.2 when it's available?
Your feedback has been invaluable in making this release solid. Thank you.

Best,
${AGENT_NAME}`,
  },
  {
    senderType: "Customer" as const,
    authorName: "Jordan Mitchell",
    body: `Hi ${AGENT_NAME},

Absolutely — I'm happy to test beta.2 when it's available. Just let me know when it's on the beta channel
and I'll run the same tests plus anything additional you'd like me to check.

I also wanted to flag one more observation from today's testing session.
When multiple browser tabs are open to the same table and a user changes the sort in one tab, the other
tabs don't pick up the change until they're manually refreshed. This means users with multiple tabs open
might see inconsistent sort states across their sessions.

I understand this might be more complex to solve and could be out of scope for 3.2.2.
I'm raising it mostly for awareness — it would be great to have it tracked even if it's a future story.

On a positive note, I tested the feature with our heaviest users today (the ones who were most affected),
and they all confirmed the fix resolves their day-to-day frustration. So the core improvement is absolutely
noticeable and appreciated, even while we work through the edge cases.

Our team is optimistic. Please pass along our thanks to the engineers working on this.
They've been responsive and the communication from your side has been excellent throughout.

Looking forward to beta.2.

Best,
Jordan`,
  },
  {
    senderType: "Agent" as const,
    authorName: AGENT_NAME,
    body: `Hi Jordan,

I'll absolutely pass along your kind words to the engineering team — it means a lot to hear that the fix
is making a real difference for your heaviest users.

The cross-tab sync observation is a great catch. You're right that it's a more complex problem — it would
require either WebSocket-based push updates or a polling mechanism to keep preference state in sync across
tabs. I've created a new feature request ticket #FEAT-2240 to track this, and linked your account to it
so you'll receive updates as it's prioritized and worked on.

For now, a simple workaround is to encourage users to stick to a single tab for the data table workflow,
or to use the browser's "duplicate tab" feature (Ctrl+L, Ctrl+D) rather than opening a fresh session,
since the duplicated tab inherits the current page state.

Good news on beta.2: the engineering team worked late last night and the build has just been promoted
to the beta channel. You should see version 3.2.2-beta.2 in your staging environment after a hard refresh.

Specific things to verify in beta.2:
  1. Sort persistence (should still be working)
  2. Audit log CSV export sort order (should now be fixed)
  3. Sort preference loaded correctly on internal navigation from the dashboard
  4. Any regressions in other table interactions (pagination, filtering, column visibility)

Take your time — there's no pressure. The stable release window is flexible.

Thank you again, Jordan.

Best,
${AGENT_NAME}`,
  },
  {
    senderType: "Customer" as const,
    authorName: "Jordan Mitchell",
    body: `Hi ${AGENT_NAME},

I've tested beta.2 and I'm happy to report that all three issues are now resolved:

Sort persistence: ✓ Still working perfectly across full page refreshes.
Audit log CSV export: ✓ The exported file now reflects the active sort order. Tested with multiple sort
  configurations and all of them produced the correctly sorted CSV.
Internal navigation sort: ✓ Navigating from the dashboard to the data table now correctly loads the saved
  sort preference. The initializing state approach works well — there's a very brief loading indicator which
  feels natural and appropriate.

Regressions: I tested pagination, column visibility toggles, and filtering in combination with active sorts.
No regressions found. Everything behaved as expected.

I'm happy to sign off on this for the 3.2.2 stable release from our end.
This has been one of the best support experiences I've had — responsive, collaborative, and well-managed.

One small aesthetic note (not a blocker): the loading indicator during the preference fetch is a full-page
spinner. It might feel more polished if it were a skeleton state for the table instead. But again,
completely non-blocking for this release.

Please go ahead with the stable release. I'll monitor our production environment after the upgrade
and report back if anything unexpected comes up.

Thank you to you and the entire team.

Best,
Jordan`,
  },
  {
    senderType: "Agent" as const,
    authorName: AGENT_NAME,
    body: `Hi Jordan,

This is wonderful news — thank you for the thorough and clear sign-off.

I've relayed your approval to the release team and 3.2.2 is now queued for production deployment.
The release window is tonight at 11:00 PM UTC, during our standard low-traffic maintenance window.
You'll see it reflected on the status page, and I'll send a confirmation email once it's complete.

Your note about the full-page spinner vs. skeleton state is excellent UX feedback.
I've added it to the UI polish backlog with your name as the source — the product team reviews that
backlog in their weekly sprint planning and it's likely to be picked up in an upcoming release.

A few post-deployment things to keep in mind:
  1. Existing users will see their sort preference default to the system default on first load after upgrade,
     since there's no historical preference data to restore. This is expected and only happens once.
  2. If any user reports that their preference isn't persisting after the upgrade, a single hard refresh
     (Ctrl+Shift+R) should resolve any edge-case caching issues.
  3. Your account has been flagged for priority support for the next 30 days while you monitor the rollout.

It's been a genuine pleasure working through this with you. Your developer's insight about the preferences
endpoint and your detailed beta testing directly shaped the quality of this release.

I'll be in touch tonight with the deployment confirmation. Thank you, Jordan.

Best,
${AGENT_NAME}`,
  },
  {
    senderType: "Customer" as const,
    authorName: "Jordan Mitchell",
    body: `Hi ${AGENT_NAME},

I received the deployment confirmation last night and checked the production environment first thing this morning.

I'm pleased to report that 3.2.2 is working correctly in production. All 30 members of our team have been
using it throughout the morning and no one has reported any issues. The sort preferences are persisting
exactly as expected, and the CSV exports are reflecting the correct sort order.

A few of my colleagues specifically mentioned that they noticed the improvement without me prompting them —
which I think is a good sign that the fix addresses a genuinely felt pain point.

The one-time default sort on first load after the upgrade was exactly as you described. Users who had an
active session saw their default sort once, and after re-applying their preference, it persisted correctly.
No one needed a hard refresh, which is great.

I do want to flag one very minor issue I noticed personally. When I navigate to the table and the preference
is loading, if I click a column header to manually sort before the preference loads, the preference
sometimes overwrites my manual selection about half a second later. It's a very brief and rare race condition,
but it did catch me off guard. No urgency on a fix, just wanted it on your radar.

Overall — outstanding outcome. I'll close the loop with my manager and let them know the issue is resolved.
Thank you sincerely for the exceptional support throughout this process.

Best,
Jordan`,
  },
  {
    senderType: "Agent" as const,
    authorName: AGENT_NAME,
    body: `Hi Jordan,

This is the best possible outcome — thank you for sharing the positive feedback from your team.
It's genuinely motivating to hear that users noticed the improvement on their own.

The race condition you described (preference overwriting a manual sort during the loading window) is a
real edge case and I want to make sure it's tracked properly. I've opened #BUG-4834 for it.
The engineer's initial assessment is that it's a relatively straightforward fix: the preference fetch should
check whether the user has already applied a manual sort during the load window before overwriting the state.
It's not critical but it's the kind of subtle UX issue that deserves a proper fix rather than being left in.

I'll make sure your account is notified when #BUG-4834 is resolved.

On my end, I'm going to mark this ticket as Resolved since the primary issues have all been addressed
and production is stable. However, please feel free to reply to this thread at any time if anything comes
up — the ticket will reopen automatically and land back in our queue.

Thank you again for being such an engaged and collaborative partner throughout this process.
Your detailed reporting, testing, and communication made this resolution significantly faster and better.
I'll be sharing this ticket internally as a model for customer collaboration.

Wishing you and your team a smooth experience going forward.

Best,
${AGENT_NAME}`,
  },
  {
    senderType: "Customer" as const,
    authorName: "Jordan Mitchell",
    body: `Hi ${AGENT_NAME},

Thank you so much — I really appreciate everything. And thank you for opening #BUG-4834 for the race condition.
It's a minor thing but it's good to know it'll be addressed properly.

I wanted to add a few more observations from our team's usage over the past couple of days,
just to give you a complete picture before we close out.

First, I noticed that the sort preference is shared across different data views. For example, if I sort the
"Active Orders" table by priority, and then navigate to the "Archived Orders" table, it also sorts by
priority — even though those two tables have different data structures and different meaningful defaults.
I would have expected each table view to have its own independent preference. Is that the intended behavior?

Second, one of our users reported that when they log out and log back in on a different browser,
their sort preference is not restored. I assume this is because the preference is stored client-side?
If so, is there a plan to make it server-side per user account rather than per browser?

Third — and this is purely a feature request — it would be wonderful if we could set a default sort
preference at the team or organization level, rather than each individual having to configure it personally.

None of these are urgent. Just passing them along for your product team's consideration.

Thanks again for everything.

Best,
Jordan`,
  },
  {
    senderType: "Agent" as const,
    authorName: AGENT_NAME,
    body: `Hi Jordan,

Thank you for the continued observations — this is all genuinely useful product feedback.

To answer your questions directly:

Shared sort preference across table views: This is actually a bug, not intended behavior. Each table view
is supposed to have an independent preference key. It appears the implementation used a generic key name
rather than a view-specific one. I've added this to #BUG-4834 as a related issue, and the engineer has
confirmed it's a one-line fix that will be included in the upcoming patch.

Cross-browser preference persistence: You're correct that currently preferences are stored server-side
per user account — they should persist across browsers and devices. If a user logs out and back in on a
different browser and doesn't see their preference restored, that's unexpected behavior. Could you ask
that user to test again and let me know if it's reproducible? It's possible it was a one-time anomaly
during the deployment window when the preference table was first being populated.

Organization-level default sort: This is a great feature request and one that's actually been discussed
internally. I've logged it as #FEAT-2251 and linked your account so you'll receive updates.
No promises on timeline, but it's now formally tracked.

Thank you for continuing to invest in making the product better for your team.
This level of feedback is what drives our roadmap in a meaningful direction.

I'll follow up once the patch for the shared-key bug is ready for your review.

Best,
${AGENT_NAME}`,
  },
];

async function seedReplies() {
  const ticket = await prisma.ticket.findUnique({ where: { id: TICKET_ID } });
  if (!ticket) {
    throw new Error(`Ticket ${TICKET_ID} not found`);
  }

  // Delete existing replies to avoid duplicates
  const deleted = await prisma.reply.deleteMany({ where: { ticketId: TICKET_ID } });
  console.log(`Deleted ${deleted.count} existing replies for ticket ${TICKET_ID}`);

  const baseDate = new Date("2025-05-01T09:00:00Z");
  const created = [];

  for (let i = 0; i < replies.length; i++) {
    const r = replies[i];
    const createdAt = new Date(baseDate.getTime() + i * 4 * 60 * 60 * 1000); // 4h apart

    const reply = await prisma.reply.create({
      data: {
        body: r.body,
        senderType: r.senderType,
        authorId: r.senderType === "Agent" ? AGENT_ID : null,
        authorName: r.authorName,
        ticketId: TICKET_ID,
        createdAt,
      },
    });
    created.push(reply.id);
    console.log(`Created reply ${i + 1}/20 [${r.senderType}] id=${reply.id}`);
  }

  console.log(`\nDone — ${created.length} replies created for ticket ${TICKET_ID}`);
}

seedReplies()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
