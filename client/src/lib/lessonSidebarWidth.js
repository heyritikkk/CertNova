export const LESSON_SIDEBAR_WIDTH_KEY = 'certnova-lesson-sidebar-width';
export const LESSON_SIDEBAR_DEFAULT = 220;
export const LESSON_SIDEBAR_MIN = 56;
export const LESSON_SIDEBAR_MAX = 480;
export const LESSON_SIDEBAR_COLLAPSED = 56;
export const LESSON_SIDEBAR_NARROW = 120;

export function loadLessonSidebarWidth() {
  try {
    const n = Number.parseInt(localStorage.getItem(LESSON_SIDEBAR_WIDTH_KEY), 10);
    if (Number.isFinite(n) && n >= LESSON_SIDEBAR_MIN && n <= LESSON_SIDEBAR_MAX) {
      return n;
    }
  } catch {
    /* ignore */
  }
  return LESSON_SIDEBAR_DEFAULT;
}

export function saveLessonSidebarWidth(px) {
  try {
    localStorage.setItem(LESSON_SIDEBAR_WIDTH_KEY, String(Math.round(px)));
  } catch {
    /* ignore */
  }
}

export function clampSidebarWidth(px) {
  return Math.min(LESSON_SIDEBAR_MAX, Math.max(LESSON_SIDEBAR_MIN, px));
}

export function isSidebarCollapsed(width) {
  return width <= LESSON_SIDEBAR_COLLAPSED + 8;
}
