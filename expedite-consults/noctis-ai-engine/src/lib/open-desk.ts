/** Opens the staff console in its own tab, on the sign-in page. The clinic tab stays put. */
export function openDeskConsole() {
  const tab = window.open("/desk/login", "vibetok-desk");
  tab?.focus();
}
