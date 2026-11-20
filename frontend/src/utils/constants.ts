export const ROLES = { ADMIN: 'ADMIN', LIBRARIAN: 'LIBRARIAN', STUDENT: 'STUDENT' };
export const FINE_PER_DAY = 2;
export const MAX_BORROW_DAYS = 14;
export const GREETING = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};
