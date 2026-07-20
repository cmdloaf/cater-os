# Event Lifecycle

**Status:** initial draft. This is the document that most shapes the schema — read it before designing models.

## The core idea

**The Event is the single source of truth.**

Every operational document in Vero — quotation, contract, banquet event order,
operations checklist, payment schedule — is a *projection* of the Event, not an
independent record that happens to share some fields with it.

This is the whole product thesis. In the tools caterers use today, the quote is
a spreadsheet, the contract is a Word file, the BEO is a different spreadsheet
and the kitchen list is a printout. When the guest count changes from 120 to
145, someone has to remember all four. They don't. The kitchen cooks for 120.

In Vero, the guest count is a field on the Event. The quotation shows 145
because it reads from the Event. The BEO shows 145 for the same reason. There
is nothing to synchronise because there is only one number.

### What this implies for implementation

1. **Documents hold presentation and negotiation state, not duplicated facts.**
   A `Quotation` owns its version, its sent/viewed/accepted status, its expiry
   and its discount lines. It does not own the guest count, the venue or the date.
2. **Signed documents are the exception, and must snapshot.** The moment a
   contract is signed it becomes a legal record of what was agreed *at that
   moment*. From then on it must not change when the Event changes. Model this
   as an immutable snapshot written at signature time — not by making the whole
   document immutable, and not by copying fields eagerly before signature.
3. **Divergence is a feature, and needs surfacing.** When the Event changes
   after a contract is signed, that is a real business event: a change order,
   possibly a re-price. The system should detect the drift and prompt, never
   silently reconcile.

---

## The stages

```
Lead
  ↓
Inquiry
  ↓
Quotation
  ↓
Negotiation
  ↓
Confirmed
  ↓
Contract Signed
  ↓
Operations Planning
  ↓
Event Day
  ↓
Completed
```

### 1. Lead
An unqualified contact. A name and a way to reach them, possibly a date.
Nothing is committed on either side and most leads die here.

*Generates:* nothing.

### 2. Inquiry
The client has described what they want: a date, a rough headcount, an occasion,
a budget range. Enough to decide whether to pursue it and to check the date
against capacity.

*Generates:* nothing yet, but this is where date/capacity conflict detection matters.

### 3. Quotation
A priced proposal, assembled from packages and menu items. First point where
the Event has real financial content.

*Generates:* **Quotation** (versioned — v1, v2, … as the ask changes).

### 4. Negotiation
Back and forth. Headcount moves, items get added and dropped, discounts get
argued. Each round produces a new quotation version; superseded versions are
retained, never overwritten — you will need them when a client asks why the
price moved.

*Generates:* further Quotation versions.

### 5. Confirmed
The client has verbally accepted. The date is now held rather than merely
pencilled, and the business starts turning down conflicting work. Commercially
significant even though nothing is signed.

*Generates:* the accepted Quotation is marked as such; deposit terms are set.

### 6. Contract Signed
Formal agreement executed. Legally binding.

*Generates:* **Contract** (snapshotting the accepted quotation), and the
**Payment schedule** — deposit, interim payments, final balance.

> From here on, changes to the Event no longer flow silently into the Contract.
> See point 2 above.

### 7. Operations Planning
The shift from selling to executing. Staffing is assigned, timelines built,
equipment reserved, dietary requirements collected, kitchen prep scheduled.

*Generates:* **Event Order (BEO)** and the **Operations Checklist**.

The BEO is the document the kitchen and floor actually work from. It reads live
from the Event, which is exactly what makes the "kitchen cooked for 120" failure
impossible.

### 8. Event Day
Execution. Largely a mobile surface: checklist completion, timestamped
sign-offs, incident notes, final headcount capture.

*Generates:* checklist completion records and an actual-vs-planned record.

### 9. Completed
The event has happened. Final invoice, final payment, post-event review, and
the data feeds reporting: margin by event type, package performance, repeat
client behaviour.

*Generates:* **Final Invoice**, closes the payment schedule.

---

## Notes on modelling this

- **The stage is a field on Event, not a table of documents.** Which documents
  exist is a *consequence* of the stage, not the definition of it.
- **Transitions are not strictly linear.** Events get cancelled at any stage,
  postponed (same event, new date), and revived from dead months later. A rigid
  forward-only state machine will be wrong within the first month of real use.
  Allow backward transitions and record the history.
- **Every stage change is worth an audit record** — who, when, from what to what.
  This is cheap now and impossible to reconstruct later.
- **Cancellation is a parallel terminal state**, not a tenth stage. A cancelled
  event retains whichever stage it reached, because the cancellation terms
  usually depend on how far along it was.

## Open questions

- Do quotation versions belong to the Event or to a Quotation with revisions?
- Should Confirmed and Contract Signed collapse into one stage for businesses
  that don't use formal contracts for small events?
- Where do multi-day events and multi-session events (ceremony + reception) fit
  — one Event or several linked ones? This one has significant schema
  consequences and should be resolved before the Event model is written.
