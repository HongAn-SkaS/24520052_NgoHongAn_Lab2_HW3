
import { createAntiDriftTimer } from "./anti-drift-timer.js";
import { createInventoryEngine } from "./inventory-engine.js";

const SALE_DURATION_MS = 60 * 1000;
const RESERVATION_DURATION_MS = 10 * 1000;
const INITIAL_STOCK = 10;

const countdownDisplay = document.querySelector("#countdown-display");
const saleStatus = document.querySelector("#sale-status");
const inventoryCount = document.querySelector("#inventory-count");
const inventoryStatus = document.querySelector("#inventory-status");
const reservationStatus = document.querySelector("#reservation-status");

const reserveButton = document.querySelector("#reserve-btn");
const checkoutButton = document.querySelector("#checkout-btn");
const cancelButton = document.querySelector("#cancel-btn");

const inventory = createInventoryEngine(
  INITIAL_STOCK,
  RESERVATION_DURATION_MS
);

let stopSaleTimer = null;
let reservationId = null;
let saleEnded = false;
let expiryCheckId = null;

function formatTime(remainingMs) {
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

function renderInventory(message = "") {
  const state = inventory.getState();

  inventoryCount.textContent = String(state.stock);

  if (state.status === "AVAILABLE") {
    reservationId = null;
    checkoutButton.disabled = true;
    cancelButton.disabled = true;
    reserveButton.disabled = saleEnded || state.stock === 0;

    if (state.stock === 0) {
      inventoryStatus.textContent = "Sold out.";
    } else if (message) {
      inventoryStatus.textContent = message;
    } else {
      inventoryStatus.textContent = "Items are available.";
    }

    reservationStatus.textContent = "No active reservation.";
    return;
  }

  reserveButton.disabled = true;
  checkoutButton.disabled = saleEnded;
  cancelButton.disabled = saleEnded;

  inventoryStatus.textContent = message || "Item reserved.";

  const expiresAt = state.reservation.expiresAt;
  const remainingMs = Math.max(0, expiresAt - Date.now());

  reservationStatus.textContent =
    `Reservation expires in ${(remainingMs / 1000).toFixed(1)} seconds.`;
}

function checkReservationExpiry() {
  if (reservationId === null) {
    return;
  }

  const state = inventory.getState();

  if (state.status === "AVAILABLE") {
    renderInventory("Reservation expired. Stock has been released.");
    return;
  }

  renderInventory();
}

function endSale() {
  if (saleEnded) {
    return;
  }

  saleEnded = true;

  if (stopSaleTimer !== null) {
    stopSaleTimer();
    stopSaleTimer = null;
  }

  if (expiryCheckId !== null) {
    clearInterval(expiryCheckId);
    expiryCheckId = null;
  }

  const state = inventory.getState();

  if (state.status === "RESERVED") {
    inventory.cancelReservation(state.reservation.id);
  }

  reservationId = null;
  countdownDisplay.textContent = "00:00:00";
  saleStatus.textContent = "Flash sale ended.";
  reserveButton.disabled = true;
  checkoutButton.disabled = true;
  cancelButton.disabled = true;

  renderInventory("The flash sale has ended.");
}

reserveButton.addEventListener("click", () => {
  if (saleEnded) {
    return;
  }

  const result = inventory.reserve();

  if (result.success) {
    reservationId = result.reservation.id;
  }

  renderInventory(result.message);
});

checkoutButton.addEventListener("click", () => {
  if (saleEnded || reservationId === null) {
    return;
  }

  const result = inventory.checkout(reservationId);

  if (result.success) {
    reservationId = null;
  }

  renderInventory(result.message);
});

cancelButton.addEventListener("click", () => {
  if (saleEnded || reservationId === null) {
    return;
  }

  const result = inventory.cancelReservation(reservationId);

  if (result.success) {
    reservationId = null;
  }

  renderInventory(result.message);
});

stopSaleTimer = createAntiDriftTimer(SALE_DURATION_MS, (remaining) => {
  countdownDisplay.textContent = formatTime(remaining);

  if (remaining === 0) {
    endSale();
  }
});

expiryCheckId = window.setInterval(checkReservationExpiry, 100);

renderInventory();
