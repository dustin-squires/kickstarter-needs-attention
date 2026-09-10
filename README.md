# Kickstarter “Needs Attention” queue

## Problem

Creators can inspect detailed backer state, but finding the operationally important exceptions may require knowing which filters and statuses to check. That makes it easy to miss a backer who is blocking fulfillment or spend time reviewing a state that requires no action.

## Prototype

This prototype adds a “Needs Attention” queue to a fictional Kickstarter Pledge Manager. Pure domain rules derive attention reasons from synthetic backer and project state, then prioritize each backer as blocking fulfillment, needing creator action, waiting on the backer, or informational.

The queue supports priority filtering, name/email search, an optional informational view, and a selected-backer detail panel. Actions are simulated locally.

## Product principle

Not every unusual state should generate an alert. An active Pledge Over Time installment, for example, is intentionally hidden from the default queue and clearly says that no creator action is required when shown. The queue should reduce cognitive load instead of creating another notification surface.

## Scope and caveat

All data and business rules are synthetic and illustrative. This is a focused product-engineering exploration, not an attempt to reproduce Kickstarter’s internal logic. It has no backend, authentication, live Kickstarter integration, persistence, or real messaging/payment behavior.

## Architecture

The central logic lives in `src/domain/attention.ts` and is independent of React. It derives all applicable reasons for a backer, selects a primary reason by deterministic score, builds the queue, and calculates summary counts. UI components receive that derived state and handle only presentation and local interactions.

## Run locally

```sh
npm install
npm run dev
```

Run the focused rules suite and production build with:

```sh
npm test -- --run
npm run build
```

## What I would measure

- percentage of surfaced issues acted on
- time from issue creation to resolution
- use of manual backer filters before and after adoption
- support contacts related to Pledge Manager or fulfillment-status confusion
- false-positive and dismissed-issue rate
