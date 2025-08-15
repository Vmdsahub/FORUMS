import { useState, useEffect, useCallback } from 'react';

interface WeeklyNewsletter {
  week: number;
  startDate: string;
  endDate: string;
  topics: any[];
}

interface UseWeekNavigationProps {
  newsletters: WeeklyNewsletter[];
  isAdmin?: boolean;
}

export function useWeekNavigation({ newsletters, isAdmin = false }: UseWeekNavigationProps) {
  const [currentWeek, setCurrentWeek] = useState(0);

  // Get ISO week number (same as backend)
  const getISOWeekNumber = useCallback((date: Date) => {
    const target = new Date(date.valueOf());
    const dayNumber = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNumber + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  }, []);

  // Get current real week number
  const getCurrentWeekNumber = useCallback(() => {
    return getISOWeekNumber(new Date());
  }, [getISOWeekNumber]);

  // Check if it's Sunday to trigger automatic week advance
  const isSunday = useCallback(() => {
    return new Date().getDay() === 0;
  }, []);

  // Auto-advance to current week on Sundays
  useEffect(() => {
    if (newsletters.length === 0) return;

    const currentRealWeek = getCurrentWeekNumber();
    
    // Find the index of the current week in newsletters array
    const currentWeekIndex = newsletters.findIndex(newsletter => newsletter.week === currentRealWeek);
    
    if (currentWeekIndex !== -1) {
      // If current week exists in newsletters, set it as active
      setCurrentWeek(currentWeekIndex);
    } else {
      // If current week doesn't exist, stay on most recent week (index 0)
      setCurrentWeek(0);
    }
  }, [newsletters, getCurrentWeekNumber]);

  // Check for week changes every hour (to catch Sunday transitions)
  useEffect(() => {
    const checkWeekChange = () => {
      if (newsletters.length === 0) return;

      const currentRealWeek = getCurrentWeekNumber();
      const currentNewsletterWeek = newsletters[currentWeek]?.week;

      // If current real week is different from displayed week, and it's Sunday, auto-advance
      if (currentRealWeek !== currentNewsletterWeek && isSunday()) {
        const newWeekIndex = newsletters.findIndex(newsletter => newsletter.week === currentRealWeek);
        if (newWeekIndex !== -1) {
          setCurrentWeek(newWeekIndex);
        }
      }
    };

    // Check immediately
    checkWeekChange();

    // Check every hour
    const interval = setInterval(checkWeekChange, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [newsletters, currentWeek, getCurrentWeekNumber, isSunday]);

  // Navigation function
  const navigateWeek = useCallback((direction: "prev" | "next") => {
    if (direction === "prev") {
      // Going to older weeks
      if (isAdmin) {
        // Admins can navigate to any week
        if (currentWeek < newsletters.length - 1) {
          setCurrentWeek(currentWeek + 1);
        }
      } else {
        // Users can only navigate to weeks with content
        const nextWeekIndex = currentWeek + 1;
        if (nextWeekIndex < newsletters.length && newsletters[nextWeekIndex]?.topics?.length > 0) {
          setCurrentWeek(nextWeekIndex);
        }
      }
    } else if (direction === "next") {
      // Going to newer weeks
      if (currentWeek > 0) {
        setCurrentWeek(currentWeek - 1);
      }
    }
  }, [currentWeek, newsletters, isAdmin]);

  // Check if navigation is possible
  const canNavigatePrev = useCallback(() => {
    console.log('DEBUG canNavigatePrev:', { isAdmin, currentWeek, newslettersLength: newsletters.length });
    if (isAdmin) {
      // Admins can always navigate if there's any potential week to go to
      // For prev (older weeks), we can navigate if we're not at the last index
      const canNav = newsletters.length > 1 && currentWeek < newsletters.length - 1;
      console.log('Admin canNavigatePrev result:', canNav);
      return canNav;
    } else {
      // Users can only go to weeks with content
      const nextWeekIndex = currentWeek + 1;
      return nextWeekIndex < newsletters.length && newsletters[nextWeekIndex]?.topics?.length > 0;
    }
  }, [currentWeek, newsletters, isAdmin]);

  const canNavigateNext = useCallback(() => {
    // Both admin and users can navigate to newer weeks if available
    return newsletters.length > 1 && currentWeek > 0;
  }, [currentWeek, newsletters]);

  // Get current newsletter
  const currentNewsletter = newsletters[currentWeek] || null;

  return {
    currentWeek,
    setCurrentWeek,
    navigateWeek,
    canNavigatePrev,
    canNavigateNext,
    currentNewsletter,
    getCurrentWeekNumber,
    isSunday
  };
}
