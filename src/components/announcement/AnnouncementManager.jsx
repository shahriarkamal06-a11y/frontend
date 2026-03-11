import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnnouncements, getAnnouncementSurfacesForPath } from '../../hooks/useAnnouncements';
import { AnnouncementPopup } from './AnnouncementPopup';

export const AnnouncementManager = () => {
  const location = useLocation();
  const surfaces = useMemo(() => {
    const resolvedSurfaces = getAnnouncementSurfacesForPath(location.pathname);
    return Array.from(new Set(['HEADER', ...resolvedSurfaces]));
  }, [location.pathname]);
  const { currentAnnouncement, dismissAnnouncement } = useAnnouncements({
    surfaces,
    styles: ['POPUP', 'MODAL', 'SLIDE_IN', 'STICKY'],
    rotationMs: 0,
    excludeDismissed: true,
  });

  if (!currentAnnouncement) return null;

  return (
    <AnnouncementPopup
      announcement={currentAnnouncement}
      onClose={() => dismissAnnouncement(currentAnnouncement)}
    />
  );
};

export default AnnouncementManager;
