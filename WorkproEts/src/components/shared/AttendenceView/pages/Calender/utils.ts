import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
  } from 'date-fns';
  
  export function getCalendarDays(date: Date): Date[] {
    // Get the start and end of the month
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
  
    // Get the start of the first week and end of the last week
    // This ensures we include days from previous/next months to fill the calendar
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
  
    // Get all days in the interval
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }