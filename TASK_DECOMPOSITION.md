# TASK DECOMPOSITION — HW3: High-Concurrency Flash-Sale E-Commerce Engine

## 1. Project Overview

**Scenario:** Vietnam Mega-Sale — 11.11 Flash Sale Simulation

**Objective:** Build a simple flash-sale engine with an accurate countdown timer and an inventory reservation state machine.

### Architectural Constraints

- Use Vanilla HTML5, modern CSS, and ES6+ JavaScript only.
- No jQuery, Bootstrap, Tailwind, or external script CDNs.
- Prefer semantic HTML over generic `<div>` containers.
- Use `const` by default and `let` only when reassignment is required.
- Never render unescaped user input with `innerHTML`.
- Use a mobile-first approach and verify the 375px viewport first.
- Use atomic commits following Conventional Commits.

## 2. Work Breakdown Structure (WBS)

| WBS ID | Task | Deliverable | Commit Type |
|---|---|---|---|
| 1.0 | Project Setup | Project structure and `TASK_DECOMPOSITION.md` | `docs` |
| 2.0 | Semantic HTML | Flash-sale product, countdown, inventory, and checkout controls | `feat` |
| 3.0 | Mobile-First CSS | Responsive layout verified at 375px | `feat` |
| 4.0 | Anti-Drift Timer | `anti-drift-timer.js` using `Date.now()` and `requestAnimationFrame()` | `feat` |
| 5.0 | Inventory State Machine | Reservation, lock expiry, checkout, and inventory updates | `feat` |
| 6.0 | UI Integration | Connect timer and inventory states to the interface | `feat` |
| 7.0 | Testing and Fixes | Verify countdown accuracy, reservation expiry, and checkout behavior | `test` / `fix` |
| 8.0 | AI Failure Audit | `AI_FAILURE_AUDIT.md` documenting at least 3 AI flaws, their detection, and fixes | `docs` |
| 9.0 | Final Verification | Review requirements, Git history, and responsive behavior | `docs` |

## 3. Inventory State Machine

| Current State | Event | Next State |
|---|---|---|
| Available | Reserve stock | Reserved |
| Reserved | Lock expires | Available |
| Reserved | Checkout succeeds | Purchased |
| Reserved | Checkout fails or is cancelled | Available |

**Rules:**
- Inventory must never become negative.
- A reservation must have an expiry time.
- Expired reservations cannot complete checkout.
- Each reservation may release stock only once.

## 4. Anti-Drift Timer Requirements

- Calculate the deadline using `Date.now() + durationMs`.
- Calculate remaining time from the deadline on every animation frame.
- Stop updating when the countdown reaches zero.
- Return a cleanup function to cancel the animation frame.
- Test the timer after background-tab pauses and delayed frames.

## 5. Commit Plan

Create at least 8 discrete commits:

1. `docs: add HW3 task decomposition`
2. `feat(html): add semantic flash sale interface`
3. `feat(css): add mobile-first sale layout`
4. `feat(timer): implement anti-drift countdown`
5. `feat(inventory): add reservation state machine`
6. `feat(ui): connect countdown and inventory controls`
7. `test(engine): verify timer and inventory behavior`
8. `docs: add AI failure mode audit`
9. `fix(engine): address issues found during final verification`

Each commit must contain one logical change. Do not combine the entire project into a single commit.

## 6. Acceptance Criteria

- [ ] Countdown uses `Date.now()` rather than decrementing a counter.
- [ ] Timer cleanup cancels the scheduled animation frame.
- [ ] Inventory reservation, expiry, and checkout work correctly.
- [ ] Inventory never becomes negative or releases the same reservation twice.
- [ ] User input is handled safely without unsafe `innerHTML` rendering.
- [ ] Layout works