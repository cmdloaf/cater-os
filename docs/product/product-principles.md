# Product Principles

**Status:** placeholder — the principles below are a first articulation and
should be revised against real user research.

## Purpose of this document

The decision rules that settle product arguments without re-litigating strategy
each time. If a feature debate can't be resolved by pointing at one of these,
either the principle is missing or the feature is unclear.

## Draft principles

### 1. Enter it once
Any fact a user types twice is a defect. Guest count, dietary requirements,
venue address — entered on the Event, appearing everywhere else. This is the
reason the product exists.

### 2. The Event is the source of truth
Documents are views of the Event, not copies. The only permitted exception is a
signed contract, which must freeze what was legally agreed. See
[../architecture/event-lifecycle.md](../architecture/event-lifecycle.md).

### 3. Match the operator's vocabulary
The domain has precise established terms — BEO, covers, service style, run of
show. Use them exactly. Inventing a cleaner-sounding vocabulary makes the
product feel like it was built by people who have not worked an event.

### 4. Operational surfaces are for people who are busy
The day-of views are used standing up, in a loud kitchen, on a phone, by someone
carrying something. Large targets, high contrast, offline tolerance, and no
interaction that punishes a mistake.

### 5. Never silently reconcile
When reality and the record disagree — the Event changed after the contract was
signed — surface it and ask. Automatic reconciliation of financially meaningful
data is a way of hiding a problem until it costs money.

### 6. AI drafts, humans commit
AI is good at first drafts, extraction from messy client emails, and noticing
anomalies. It is not permitted to be the last step before something legally or
financially binding. Every AI output has a human approval step.

### 7. Migration is the adoption cost
Every prospective customer already runs their business on spreadsheets they
trust. Import quality and the ability to run in parallel for a season matter
more than any individual feature.

## Related

- [roadmap.md](./roadmap.md)
- The `vero-ux` skill in `.claude/skills/` holds the interface-level principles
  that follow from these.
