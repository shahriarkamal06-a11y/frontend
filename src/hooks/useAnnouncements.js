import { useEffect, useMemo, useState, useEffectEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { announcementAPI } from '../services/api';
import {
  filterAnnouncements,
  readDismissedAnnouncementTokens,
  resolveAnnouncementSurfaces,
  writeDismissedAnnouncementTokens,
  getAnnouncementDismissalToken,
} from '../utils/announcements';
import { useAuthStore } from '../store';
import { useInitialData } from '../ssr/initial-data';

export const useAnnouncements = ({
  surfaces = [],
  styles,
  sectionIds = [],
  limit = 100,
  rotationMs = 5000,
  excludeDismissed = false,
} = {}) => {
  const user = useAuthStore((state) => state.user);
  const initialData = useInitialData();
  const initialAnnouncements = useMemo(() => {
    if (!Array.isArray(initialData?.announcements)) {
      return undefined;
    }
    return initialData.announcements;
  }, [initialData?.announcements]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissedTokens, setDismissedTokens] = useState(() => readDismissedAnnouncementTokens());

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['announcements-feed', limit],
    queryFn: async () => {
      const response = await announcementAPI.getAnnouncements({
        limit: String(limit),
        sort: 'priority-desc',
      });
      return response?.data?.data?.items || [];
    },
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    initialData: initialAnnouncements,
    initialDataUpdatedAt: initialAnnouncements ? Date.now() : undefined,
  });

  const announcements = useMemo(() => {
    return filterAnnouncements(data || [], {
      surfaces,
      styles,
      sectionIds,
      viewerRole: user?.role || null,
      dismissedTokens: excludeDismissed ? dismissedTokens : [],
    });
  }, [data, dismissedTokens, excludeDismissed, sectionIds, styles, surfaces, user?.role]);

  const rotateAnnouncement = useEffectEvent(() => {
    setCurrentIndex((previousIndex) => {
      if (announcements.length <= 1) return 0;
      return (previousIndex + 1) % announcements.length;
    });
  });

  useEffect(() => {
    if (announcements.length <= 1 || !Number.isFinite(rotationMs) || rotationMs <= 0) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      rotateAnnouncement();
    }, rotationMs);

    return () => window.clearInterval(timer);
  }, [announcements.length, rotationMs]);

  const dismissAnnouncement = (announcement) => {
    if (!announcement || !excludeDismissed) return;

    const dismissalToken = getAnnouncementDismissalToken(announcement);
    const nextTokens = Array.from(new Set([...dismissedTokens, dismissalToken]));
    setDismissedTokens(nextTokens);
    writeDismissedAnnouncementTokens(nextTokens);
  };

  const safeCurrentIndex = currentIndex < announcements.length ? currentIndex : 0;

  return {
    announcements,
    currentAnnouncement: announcements[safeCurrentIndex] || null,
    currentIndex: safeCurrentIndex,
    loading: isLoading || isFetching,
    hasAnnouncements: announcements.length > 0,
    dismissAnnouncement,
    refetch,
  };
};

export const getAnnouncementSurfacesForPath = (pathname) => resolveAnnouncementSurfaces(pathname);
