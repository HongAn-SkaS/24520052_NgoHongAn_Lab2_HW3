
/**
 * Manages flash-sale inventory and reservation lifecycle.
 *
 * States:
 * AVAILABLE -> RESERVED -> PURCHASED
 * RESERVED -> AVAILABLE (expiry or cancellation)
 */
export function createInventoryEngine(initialStock, lockDurationMs) {
  if (!Number.isInteger(initialStock) || initialStock < 0) {
    throw new Error("Initial stock must be a non-negative integer.");
  }

  if (!Number.isFinite(lockDurationMs) || lockDurationMs <= 0) {
    throw new Error("Lock duration must be a positive number.");
  }

  let stock = initialStock;
  let reservation = null;
  let nextReservationId = 1;

  function releaseExpiredReservation() {
    if (
      reservation !== null &&
      Date.now() >= reservation.expiresAt
    ) {
      reservation = null;
      stock += 1;
    }
  }

  function getState() {
    releaseExpiredReservation();

    return {
      stock,
      status: reservation === null
        ? "AVAILABLE"
        : "RESERVED",
      reservation: reservation === null
        ? null
        : { ...reservation }
    };
  }

  function reserve() {
    releaseExpiredReservation();

    if (stock <= 0) {
      return {
        success: false,
        message: "Out of stock."
      };
    }

    if (reservation !== null) {
      return {
        success: false,
        message: "An item is already reserved."
      };
    }

    stock -= 1;

    reservation = {
      id: nextReservationId,
      expiresAt: Date.now() + lockDurationMs
    };

    nextReservationId += 1;

    return {
      success: true,
      message: "Item reserved successfully.",
      reservation: { ...reservation }
    };
  }

  function checkout(reservationId) {
    releaseExpiredReservation();

    if (
      reservation === null ||
      reservation.id !== reservationId
    ) {
      return {
        success: false,
        message: "Reservation is invalid or expired."
      };
    }

    reservation = null;

    return {
      success: true,
      message: "Checkout completed.",
      status: "PURCHASED"
    };
  }

  function cancelReservation(reservationId) {
    releaseExpiredReservation();

    if (
      reservation === null ||
      reservation.id !== reservationId
    ) {
      return {
        success: false,
        message: "Reservation is invalid or expired."
      };
    }

    reservation = null;
    stock += 1;

    return {
      success: true,
      message: "Reservation cancelled."
    };
  }

  return {
    getState,
    reserve,
    checkout,
    cancelReservation
  };
}
