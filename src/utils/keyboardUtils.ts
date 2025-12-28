import { KeyboardEvent } from 'react';

/**
 * Handles keyboard events for buttons (Enter and Space keys)
 * Prevents default behavior and calls the action
 */
export function handleKeyboardAction(
  e: KeyboardEvent<HTMLElement>,
  action: () => void
): void {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    action();
  }
}

/**
 * Creates a keyboard event handler for a specific action
 */
export function createKeyboardHandler(action: () => void) {
  return (e: KeyboardEvent<HTMLElement>) => handleKeyboardAction(e, action);
}

