import { useEffect, useMemo, useState, useEffectEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock3, Megaphone, ShieldCheck, Sparkles, Ticket, X, Zap } from 'lucide-react';
import {
  getAnnouncementScopeClassName,
  getAnnouncementScopedCss,
  getCountdownParts,
  isExternalAnnouncementLink,
  normalizeAnnouncement,
} from '../../utils/announcements';
import { getAnnouncementTemplate } from '../../utils/announcementTemplates';
import { resolveMediaUrl } from '../../utils/mediaHelpers';

const THEME_STYLES = {
  amethyst: {
    shell: 'from-violet-700 via-indigo-700 to-fuchsia-700 text-white',
    badge: 'bg-white/14 text-white/85',
    soft: 'bg-white/10 text-white/80',
    button: 'bg-white text-slate-950 hover:bg-slate-100',
  },
  amber: {
    shell: 'from-amber-400 via-orange-400 to-amber-500 text-slate-950',
    badge: 'bg-slate-950/10 text-slate-950',
    soft: 'bg-slate-950/8 text-slate-900/80',
    button: 'bg-slate-950 text-white hover:bg-slate-800',
  },
  ember: {
    shell: 'from-rose-600 via-orange-500 to-amber-400 text-white',
    badge: 'bg-white/14 text-white/90',
    soft: 'bg-white/10 text-white/82',
    button: 'bg-white text-rose-700 hover:bg-rose-50',
  },
  emerald: {
    shell: 'from-emerald-700 via-teal-600 to-cyan-500 text-white',
    badge: 'bg-white/14 text-white/88',
    soft: 'bg-white/10 text-white/80',
    button: 'bg-white text-emerald-700 hover:bg-emerald-50',
  },
  graphite: {
    shell: 'from-slate-950 via-slate-900 to-slate-800 text-white',
    badge: 'bg-white/14 text-white/82',
    soft: 'bg-white/10 text-white/78',
    button: 'bg-white text-slate-950 hover:bg-slate-100',
  },
  ocean: {
    shell: 'from-sky-700 via-blue-700 to-cyan-500 text-white',
    badge: 'bg-white/14 text-white/88',
    soft: 'bg-white/10 text-white/80',
    button: 'bg-white text-sky-700 hover:bg-sky-50',
  },
  sky: {
    shell: 'from-sky-500 via-blue-500 to-indigo-500 text-white',
    badge: 'bg-white/14 text-white/88',
    soft: 'bg-white/10 text-white/80',
    button: 'bg-white text-sky-700 hover:bg-sky-50',
  },
  sunset: {
    shell: 'from-fuchsia-700 via-rose-600 to-orange-500 text-white',
    badge: 'bg-white/14 text-white/88',
    soft: 'bg-white/10 text-white/80',
    button: 'bg-white text-rose-700 hover:bg-rose-50',
  },
};

const AnnouncementAction = ({ buttonLink, buttonText, className, withIcon = true }) => {
  if (!buttonText || !buttonLink) return null;

  const buttonClassName = `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${className}`;

  if (isExternalAnnouncementLink(buttonLink)) {
    return (
      <a href={buttonLink} target="_blank" rel="noreferrer" className={buttonClassName}>
        {buttonText}
        {withIcon && <ArrowRight className="h-4 w-4" />}
      </a>
    );
  }

  return (
    <Link to={buttonLink} className={buttonClassName}>
      {buttonText}
      {withIcon && <ArrowRight className="h-4 w-4" />}
    </Link>
  );
};

const AnnouncementCardAction = ({ buttonLink, buttonText, className }) => {
  if (!buttonText || !buttonLink) return null;

  const buttonClassName = `inline-flex w-fit items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${className}`;

  if (isExternalAnnouncementLink(buttonLink)) {
    return (
      <a href={buttonLink} target="_blank" rel="noreferrer" className={buttonClassName}>
        {buttonText}
        <ArrowRight className="h-3.5 w-3.5" />
      </a>
    );
  }

  return (
    <Link to={buttonLink} className={buttonClassName}>
      {buttonText}
      <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  );
};

const AnnouncementChips = ({ announcement, template, themeStyles, timeLeft }) => (
  <div className="mb-3 flex flex-wrap items-center gap-2">
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${themeStyles.badge}`}>
      <Megaphone className="h-3.5 w-3.5" />
      {template.label}
    </span>
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${themeStyles.soft}`}>
      {template.variant === 'trust' ? <ShieldCheck className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
      {announcement.type}
    </span>
    {timeLeft && (
      <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${themeStyles.soft}`}>
        <Clock3 className="h-3.5 w-3.5" />
        {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
      </span>
    )}
  </div>
);

const BannerImage = ({ announcement }) => {
  const imageUrl = resolveMediaUrl(announcement.imageUrl || '');
  if (!imageUrl) return null;

  return (
    <div className="min-h-[200px] w-full overflow-hidden rounded-[24px] border border-white/20 bg-white/10 sm:min-h-[240px] lg:min-h-[280px] xl:min-h-[320px]">
      <img
        src={imageUrl}
        alt={announcement.title || 'Announcement creative'}
        className="h-full w-full object-contain"
        loading="lazy"
      />
    </div>
  );
};

const InlineCloseButton = ({ onClose, className = '' }) => {
  if (!onClose) return null;

  return (
    <button
      type="button"
      onClick={onClose}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-current transition-colors hover:bg-white/20 ${className}`}
      aria-label="Dismiss announcement"
    >
      <X className="h-4 w-4" />
    </button>
  );
};

export const AnnouncementBanner = ({
  announcement: rawAnnouncement,
  onClose = null,
  compact = false,
  placement = 'surface',
  carouselState = null,
  className = '',
  showMeta,
}) => {
  const announcement = useMemo(() => normalizeAnnouncement(rawAnnouncement), [rawAnnouncement]);
  const metaEnabled = showMeta ?? Boolean(announcement.showMeta);
  const template = useMemo(
    () => getAnnouncementTemplate(announcement.templateKey, announcement),
    [announcement]
  );
  const themeStyles = THEME_STYLES[template.theme] || THEME_STYLES.graphite;
  const scopeClassName = useMemo(() => getAnnouncementScopeClassName(announcement), [announcement]);
  const scopedCss = useMemo(() => getAnnouncementScopedCss(announcement), [announcement]);
  const [timeLeft, setTimeLeft] = useState(() => getCountdownParts(announcement));

  const updateCountdown = useEffectEvent(() => {
    setTimeLeft(getCountdownParts(announcement));
  });

  useEffect(() => {
    updateCountdown();

    if (!announcement.countdownEnabled) return undefined;

    const timer = window.setInterval(() => {
      updateCountdown();
    }, 1000);

    return () => window.clearInterval(timer);
  }, [announcement.countdownEnabled, announcement.endsAt, announcement.id, announcement.updatedAt]);

  if (placement === 'header') {
    return (
      <div className={`announcement ${scopeClassName} relative overflow-hidden bg-gradient-to-r ${themeStyles.shell} ${className}`}>
        {scopedCss && <style>{scopedCss}</style>}
        <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'radial-gradient(circle at top left, white 0, transparent 32%)' }} />
        <div className="relative container mx-auto flex flex-col items-center gap-2 px-4 py-2.5 text-center sm:flex-row sm:justify-between sm:gap-3 sm:text-left lg:px-8">
          <div className="flex min-w-0 flex-1 flex-col items-center gap-2 sm:flex-row sm:items-center sm:gap-3">
            {carouselState?.total > 1 && (
              <span className={`hidden shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] sm:inline-flex ${themeStyles.badge}`}>
                {carouselState.currentIndex + 1}/{carouselState.total}
              </span>
            )}
            <p className="max-w-full text-center text-sm font-semibold text-current sm:text-left sm:text-[15px]">
              {announcement.title}
            </p>
          </div>

          <div className="flex w-full flex-wrap items-center justify-center gap-2 sm:w-auto sm:flex-nowrap sm:justify-end">
            {carouselState?.total > 1 && (
              <div className="hidden items-center gap-1.5 md:flex">
                {Array.from({ length: carouselState.total }).map((_, index) => (
                  <span
                    key={`header-indicator-${index}`}
                    className={`h-1.5 rounded-full transition-all ${
                      index === carouselState.currentIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/40'
                    }`}
                  />
                ))}
              </div>
            )}
            <AnnouncementAction
              buttonText={announcement.buttonText}
              buttonLink={announcement.buttonLink}
              className={`${themeStyles.button} px-3 py-1.5 text-xs sm:text-sm`}
              withIcon={false}
            />
            <InlineCloseButton onClose={onClose} className="h-8 w-8 sm:h-10 sm:w-10" />
          </div>
        </div>
        {carouselState?.total > 1 && (
          <div className="relative flex items-center justify-center gap-1.5 px-4 pb-2 md:hidden">
            {Array.from({ length: carouselState.total }).map((_, index) => (
              <span
                key={`header-mobile-indicator-${index}`}
                className={`h-1.5 rounded-full transition-all ${
                  index === carouselState.currentIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/40'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    );

  if (placement === 'dropdown' || template.variant === 'menu') {
    return (
      <div className={`announcement ${scopeClassName} relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}>
        {scopedCss && <style>{scopedCss}</style>}
        <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-slate-100/80" />
        <div className="relative flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              {metaEnabled && (
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                    {template.label}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {announcement.type}
                  </span>
                </div>
              )}
              <h4 className="text-sm font-semibold text-slate-900">{announcement.title}</h4>
            </div>
            <InlineCloseButton onClose={onClose} className="h-8 w-8 bg-slate-100 text-slate-600 hover:bg-slate-200" />
          </div>
          {announcement.content && (
            <p className="text-xs leading-5 text-slate-600">{announcement.content}</p>
          )}
          {(announcement.buttonText && announcement.buttonLink) && (
            <AnnouncementAction
              buttonText={announcement.buttonText}
              buttonLink={announcement.buttonLink}
              className="bg-slate-900 text-white hover:bg-slate-800 px-3 py-1.5 text-xs"
              withIcon={false}
            />
          )}
        </div>
      </div>
    );
  }

  }

  const baseClassName = `relative overflow-hidden rounded-[28px] bg-gradient-to-r ${themeStyles.shell} shadow-xl shadow-slate-950/10 ${className}`;

  if (template.variant === 'hero' || template.variant === 'editorial') {
    return (
      <div className={`announcement ${scopeClassName} ${baseClassName}`}>
        {scopedCss && <style>{scopedCss}</style>}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at top left, white 0, transparent 34%)' }} />
        <div className={`relative grid gap-5 px-5 py-5 sm:px-6 ${compact ? 'lg:grid-cols-1' : 'lg:grid-cols-[1.2fr_0.8fr] lg:items-center'}`}>
          <div className="min-w-0">
            {metaEnabled && (
              <AnnouncementChips announcement={announcement} template={template} themeStyles={themeStyles} timeLeft={timeLeft} />
            )}
            <h3 className={`${compact ? 'text-lg' : 'text-2xl'} font-bold tracking-tight`}>{announcement.title}</h3>
            {announcement.content && (
              <p className={`mt-3 max-w-3xl ${compact ? 'text-sm' : 'text-sm sm:text-base'} text-current/85`}>
                {announcement.content}
              </p>
            )}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <AnnouncementAction buttonText={announcement.buttonText} buttonLink={announcement.buttonLink} className={themeStyles.button} />
              <InlineCloseButton onClose={onClose} />
            </div>
          </div>
          {!compact && <BannerImage announcement={announcement} />}
        </div>
      </div>
    );
  }


  if (template.variant === 'feature-card') {
    return (
      <div className={`announcement ${scopeClassName} relative overflow-hidden rounded-[24px] ${compact ? 'min-h-[180px] p-5' : 'min-h-[220px] p-6'} shadow-xl ${className} bg-gradient-to-br ${themeStyles.shell}`}>
        {scopedCss && <style>{scopedCss}</style>}
        <div className="absolute right-4 top-4">
          <Zap className="h-8 w-8 text-amber-300" />
        </div>
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <h4 className="mb-1 text-lg font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
          {announcement.title}
        </h4>
        {announcement.content && (
          <p className="mb-4 text-sm text-white/75">{announcement.content}</p>
        )}
        <AnnouncementCardAction
          buttonText={announcement.buttonText}
          buttonLink={announcement.buttonLink}
          className={themeStyles.button}
        />
      </div>
    );
  }

  if (template.variant === 'coupon') {
    return (
      <div className={`announcement ${scopeClassName} ${baseClassName}`}>
        {scopedCss && <style>{scopedCss}</style>}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(110deg, rgba(255,255,255,0.18), transparent 40%)' }} />
        <div className={`relative flex flex-col gap-4 px-5 py-5 sm:px-6 ${compact ? 'lg:flex-row lg:items-center lg:justify-between' : 'lg:grid lg:grid-cols-[1fr_auto] lg:items-center'}`}>
          <div className="min-w-0">
            {metaEnabled && (
              <AnnouncementChips announcement={announcement} template={template} themeStyles={themeStyles} timeLeft={timeLeft} />
            )}
            <div className="flex flex-wrap items-center gap-3">
              <Ticket className="h-5 w-5" />
              <h3 className={`${compact ? 'text-lg' : 'text-xl'} font-bold tracking-tight`}>{announcement.title}</h3>
            </div>
            {announcement.content && <p className="mt-2 text-sm text-current/82">{announcement.content}</p>}
          </div>
          <div className="flex items-center gap-3">
            <AnnouncementAction buttonText={announcement.buttonText} buttonLink={announcement.buttonLink} className={themeStyles.button} />
            <InlineCloseButton onClose={onClose} />
          </div>
        </div>
      </div>
    );
  }

  if (template.variant === 'trust') {
    return (
      <div className={`announcement ${scopeClassName} ${baseClassName}`}>
        {scopedCss && <style>{scopedCss}</style>}
        <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(circle at bottom right, white 0, transparent 28%)' }} />
        <div className={`relative flex flex-col gap-4 px-5 py-5 sm:px-6 ${compact ? 'lg:flex-row lg:items-center lg:justify-between' : 'lg:grid lg:grid-cols-[1fr_auto] lg:items-center'}`}>
          <div className="min-w-0">
            {metaEnabled && (
              <AnnouncementChips announcement={announcement} template={template} themeStyles={themeStyles} timeLeft={timeLeft} />
            )}
            <h3 className={`${compact ? 'text-lg' : 'text-xl'} font-bold tracking-tight`}>{announcement.title}</h3>
            {announcement.content && <p className="mt-2 text-sm text-current/80">{announcement.content}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {metaEnabled && (
              <span className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium ${themeStyles.soft}`}>
                <ShieldCheck className="h-4 w-4" />
                Always visible reassurance
              </span>
            )}
            <AnnouncementAction buttonText={announcement.buttonText} buttonLink={announcement.buttonLink} className={themeStyles.button} />
            <InlineCloseButton onClose={onClose} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`announcement ${scopeClassName} ${baseClassName}`}>
      {scopedCss && <style>{scopedCss}</style>}
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at top left, white 0, transparent 32%)' }} />
      <div className={`relative flex flex-col gap-4 px-5 py-5 sm:px-6 ${compact ? 'lg:flex-row lg:items-center lg:justify-between' : 'lg:flex-row lg:items-end lg:justify-between'}`}>
        <div className="min-w-0">
          {metaEnabled && (
            <AnnouncementChips announcement={announcement} template={template} themeStyles={themeStyles} timeLeft={timeLeft} />
          )}
          <h3 className={`${compact ? 'text-lg' : 'text-xl'} font-bold tracking-tight`}>{announcement.title}</h3>
          {announcement.content && (
            <p className={`mt-2 max-w-3xl ${compact ? 'text-sm' : 'text-sm sm:text-base'} text-current/85`}>
              {announcement.content}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {(announcement.buttonText && announcement.buttonLink) && (
            <AnnouncementAction buttonText={announcement.buttonText} buttonLink={announcement.buttonLink} className={themeStyles.button} />
          )}
          <InlineCloseButton onClose={onClose} />
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBanner;
