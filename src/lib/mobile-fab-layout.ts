/** Shared bottom offsets for mobile floating actions (above tab bar / compare tray). */

export const MOBILE_TAB_BAR = "4rem";
export const MOBILE_COMPARE_TRAY = "3.25rem";

/** CSS calc for FABs sitting above bottom nav only. */
export const mobileFabAboveNav =
  "bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))]";

/** CSS calc when compare tray is visible above the tab bar. */
export const mobileFabAboveNavAndCompare =
  "bottom-[calc(8rem+env(safe-area-inset-bottom,0px))]";

export function mobileFabBottomClass(hasCompareTray: boolean): string {
  return hasCompareTray ? mobileFabAboveNavAndCompare : mobileFabAboveNav;
}
