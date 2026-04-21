// convert to UTC from local time
export const toUTC = (date: Date): Date => {
  return new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);
};

// convert from UTC to local time
export const fromUTC = (date: Date): Date => {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
};
