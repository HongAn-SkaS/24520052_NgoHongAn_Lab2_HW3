
import { createInventoryEngine } from "./inventory-engine.js";
import { createAntiDriftTimer } from "./anti-drift-timer.js";

const summary = document.querySelector("#test-summary");
const results = document.querySelector("#test-results");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  const item = document.createElement("li");

  item.textContent = `${condition ? "PASS" : "FAIL"}: ${message}`;
  results.append(item);

  if (condition) {
    passed += 1;
  } else {
    failed += 1;
  }
}

function testInventory() {
  const engine = createInventoryEngine(2, 100);

  const reservation = engine.reserve();

  assert(reservation.success, "Reserve available stock");
  assert(engine.getState().stock === 1, "Reservation reduces stock");

  const duplicate = engine.reserve();

  assert(!duplicate.success, "Reject a second active reservation");

  const checkout = engine.checkout(reservation.reservation.id);

  assert(checkout.success, "Checkout a valid reservation");
  assert(engine.getState().stock === 1, "Checkout does not restore stock");

  const cancelEngine = createInventoryEngine(1, 1000);
  const cancellable = cancelEngine.reserve();

  cancelEngine.cancelReservation(cancellable.reservation.id);

  assert(cancelEngine.getState().stock === 1, "Cancellation restores stock");

  const expiryEngine = createInventoryEngine(1, 20);
  expiryEngine.reserve();

  return new Promise((resolve) => {
    window.setTimeout(() => {
      const state = expiryEngine.getState();

      assert(state.stock === 1, "Expired reservation restores stock");
      assert(state.status === "AVAILABLE", "Expired reservation becomes available");

      resolve();
    }, 40);
  });
}

function testTimer() {
  return new Promise((resolve) => {
    let lastRemaining = Infinity;
    let completed = false;

    const stopTimer = createAntiDriftTimer(100, (remaining) => {
      assert(remaining <= lastRemaining, "Countdown does not increase");

      lastRemaining = remaining;

      if (remaining === 0 && !completed) {
        completed = true;
        stopTimer();

        assert(true, "Countdown reaches zero");
        resolve();
      }
    });
  });
}

async function runTests() {
  await testInventory();
  await testTimer();

  summary.textContent =
    `${passed} passed, ${failed} failed.`;

  if (failed > 0) {
    summary.textContent += " Please review the failed tests.";
  }
}

runTests();
