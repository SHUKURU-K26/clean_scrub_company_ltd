import { format, formatDistanceToNow, isToday } from 'date-fns';

export function formatDate(date, pattern = 'MMM d, yyyy') {
  return format(new Date(date), pattern);
}

export function formatDateTime(date) {
  return format(new Date(date), 'MMM d, yyyy · h:mm a');
}

export function formatRelative(date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function isDateToday(date) {
  return isToday(new Date(date));
}