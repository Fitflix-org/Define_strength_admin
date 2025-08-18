// Accessibility utilities for the admin panel

export const ARIA_LABELS = {
  // Navigation
  MAIN_NAV: 'Main navigation',
  USER_MENU: 'User account menu',
  LOGOUT: 'Sign out of account',
  
  // Dashboard
  DASHBOARD_STATS: 'Dashboard statistics',
  ANALYTICS_CHART: 'Analytics chart',
  
  // Data tables
  SEARCH_INPUT: 'Search items',
  FILTER_DROPDOWN: 'Filter options',
  SORT_BUTTON: 'Sort table column',
  PAGINATION: 'Table pagination',
  
  // Actions
  EDIT_ITEM: 'Edit item',
  DELETE_ITEM: 'Delete item',
  VIEW_DETAILS: 'View item details',
  CLOSE_MODAL: 'Close dialog',
  
  // Forms
  FORM_FIELD: 'Form field',
  REQUIRED_FIELD: 'Required form field',
  SUBMIT_BUTTON: 'Submit form',
  CANCEL_BUTTON: 'Cancel operation',
  
  // Status indicators
  LOADING: 'Loading content',
  ERROR_MESSAGE: 'Error message',
  SUCCESS_MESSAGE: 'Success message',
} as const;

export const KEYBOARD_SHORTCUTS = {
  ESC: 'Escape',
  ENTER: 'Enter',
  SPACE: ' ',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
} as const;

// Keyboard navigation helper
export const handleKeyboardNavigation = (
  event: React.KeyboardEvent,
  onEnter?: () => void,
  onEscape?: () => void
) => {
  switch (event.key) {
    case KEYBOARD_SHORTCUTS.ENTER:
      if (onEnter) {
        event.preventDefault();
        onEnter();
      }
      break;
    case KEYBOARD_SHORTCUTS.ESC:
      if (onEscape) {
        event.preventDefault();
        onEscape();
      }
      break;
  }
};

// Focus management utility
export const focusElement = (selector: string, delay = 0) => {
  setTimeout(() => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.focus();
    }
  }, delay);
};

// Screen reader announcement utility
export const announceToScreenReader = (message: string) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};
