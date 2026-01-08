// ===========================================
// REORDER UTILITY
// ===========================================

/**
 * Generic reorder utility for drag-and-drop operations
 * Moves an item from one position to another in an array
 * 
 * @param items - Array of items with an `id` property
 * @param fromIndex - Original position of the item
 * @param toIndex - New position for the item
 * @returns New array with items in the new order, plus array of IDs
 */
export function reorderItems<T extends { id: string }>(
  items: T[],
  fromIndex: number,
  toIndex: number
): { items: T[]; orderedIds: string[] } {
  const result = Array.from(items);
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);

  return {
    items: result,
    orderedIds: result.map((item) => item.id),
  };
}

/**
 * Calculate the new order for an item being moved
 * Useful for optimistic updates
 * 
 * @param items - Array of items with order property
 * @param itemId - ID of the item being moved
 * @param newIndex - New index position (0-based)
 * @returns Object mapping item IDs to their new order values
 */
export function calculateNewOrders<T extends { id: string; order: number }>(
  items: T[],
  itemId: string,
  newIndex: number
): Record<string, number> {
  const sorted = [...items].sort((a, b) => a.order - b.order);
  const currentIndex = sorted.findIndex((item) => item.id === itemId);

  if (currentIndex === -1) {
    throw new Error("Item not found");
  }

  if (currentIndex === newIndex) {
    // No change needed
    return {};
  }

  // Reorder the array
  const [removed] = sorted.splice(currentIndex, 1);
  sorted.splice(newIndex, 0, removed);

  // Calculate new orders (1-based)
  const newOrders: Record<string, number> = {};
  sorted.forEach((item, index) => {
    const newOrder = index + 1;
    if (item.order !== newOrder) {
      newOrders[item.id] = newOrder;
    }
  });

  return newOrders;
}

/**
 * Validate that a reorder operation is valid
 * Checks that all IDs exist and none are duplicated
 */
export function validateReorderIds(
  existingIds: string[],
  orderedIds: string[]
): { valid: boolean; error?: string } {
  const existingSet = new Set(existingIds);
  const orderedSet = new Set(orderedIds);

  // Check for duplicates in ordered IDs
  if (orderedIds.length !== orderedSet.size) {
    return { valid: false, error: "Duplicate IDs in order array" };
  }

  // Check that all ordered IDs exist
  for (const id of orderedIds) {
    if (!existingSet.has(id)) {
      return { valid: false, error: `ID ${id} does not exist` };
    }
  }

  // Check that all existing IDs are in ordered array
  for (const id of existingIds) {
    if (!orderedSet.has(id)) {
      return { valid: false, error: `ID ${id} missing from order array` };
    }
  }

  return { valid: true };
}
