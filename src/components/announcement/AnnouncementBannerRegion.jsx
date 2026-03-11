import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnnouncements, getAnnouncementSurfacesForPath } from '../../hooks/useAnnouncements';
import { AnnouncementBanner } from './AnnouncementBanner';

export const AnnouncementBannerRegion = ({
  surfaces,
  sectionIds = [],
  compact = false,
  placement = 'surface',
  rotationMs,
  dismissible = true,
  className = '',
}) => {
  const location = useLocation();
  const resolvedSurfaces = useMemo(() => {
    if (Array.isArray(surfaces) && surfaces.length > 0) {
      return surfaces;
    }

    return getAnnouncementSurfacesForPath(location.pathname);
  }, [location.pathname, surfaces]);

  const {
    currentAnnouncement,
    announcements,
    currentIndex,
    dismissAnnouncement,
  } = useAnnouncements({
    surfaces: resolvedSurfaces,
    styles: ['BANNER'],
    sectionIds,
    rotationMs,
    excludeDismissed: dismissible,
  });

  if (!currentAnnouncement) return null;

  return (
    <div className={className}>
      <AnnouncementBanner
        announcement={currentAnnouncement}
        compact={compact}
        placement={placement}
        onClose={dismissible ? () => dismissAnnouncement(currentAnnouncement) : null}
        carouselState={announcements.length > 1
          ? { currentIndex, total: announcements.length }
          : null}
      />
      {placement !== 'header' && placement !== 'dropdown' && announcements.length > 1 && (
        <div className="mt-3 flex items-center justify-center gap-2">
          {announcements.map((announcement, index) => (
            <span
              key={announcement.id}
              className={`h-1.5 rounded-full transition-all ${index === currentIndex ? 'w-8 bg-slate-900' : 'w-1.5 bg-slate-300'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AnnouncementBannerRegion;
