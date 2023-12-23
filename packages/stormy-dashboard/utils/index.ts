export function openSidebar() {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.setProperty('--SideNavigation-slideIn', '1');
  }
}

export function closeSidebar() {
  if (typeof document !== 'undefined') {
    document.documentElement.style.removeProperty('--SideNavigation-slideIn');
    document.body.style.removeProperty('overflow');
  }
}

export function toggleSidebar() {
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const slideIn = window
      .getComputedStyle(document.documentElement)
      .getPropertyValue('--SideNavigation-slideIn');
    if (slideIn) {
      closeSidebar();
    } else {
      openSidebar();
    }
  }
}

export function formatCurrency(number: number) {
  return number.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
}

export function shortenObjectId(objectId: string) {
  // Check if the input is a valid ObjectId
  if (!/^[0-9a-fA-F]{24}$/.test(objectId)) {
    throw new Error('Invalid ObjectId');
  }

  // Take a substring of the ObjectId to shorten it
  return [
    objectId.substring(0, 4),
    objectId.substring(objectId.length - 3, objectId.length - 1),
  ].join('...');
}
