import { useEffect, useMemo, useState, useEffectEvent } from 'react';
import { Link } from 'react-router-dom';
import { Clock3, ShieldCheck, Sparkles, Ticket, X } from 'lucide-react';
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
    accent: 'text-violet-700',
    accentSoft: 'bg-violet-50 text-violet-700',
    button: 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-violet-500/25',
    border: 'border-violet-200',
  },
  amber: {
    accent: 'text-amber-700',
    accentSoft: 'bg-amber-50 text-amber-800',
    button: 'bg-slate-950 text-white hover:bg-slate-800',
    border: 'border-amber-200',
  },
  ember: {
    accent: 'text-rose-700',
    accentSoft: 'bg-rose-50 text-rose-700',
    button: 'bg-gradient-to-r from-rose-600 to-orange-500 text-white hover:shadow-lg hover:shadow-rose-500/25',
    border: 'border-rose-200',
  },
  emerald: {
    accent: 'text-emerald-700',
    accentSoft: 'bg-emerald-50 text-emerald-700',
    button: 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/25',
    border: 'border-emerald-200',
  },
  graphite: {
    accent: 'text-slate-800',
    accentSoft: 'bg-slate-100 text-slate-700',
    button: 'bg-slate-950 text-white hover:bg-slate-800',
    border: 'border-slate-200',
  },
  ocean: {
    accent: 'text-sky-700',
    accentSoft: 'bg-sky-50 text-sky-700',
    button: 'bg-gradient-to-r from-sky-600 to-blue-600 text-white hover:shadow-lg hover:shadow-sky-500/25',
    border: 'border-sky-200',
  },
  sky: {
    accent: 'text-blue-700',
    accentSoft: 'bg-blue-50 text-blue-700',
    button: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/25',
    border: 'border-blue-200',
  },
  sunset: {
    accent: 'text-fuchsia-700',
    accentSoft: 'bg-fuchsia-50 text-fuchsia-700',
    button: 'bg-gradient-to-r from-fuchsia-600 to-rose-500 text-white hover:shadow-lg hover:shadow-fuchsia-500/25',
    border: 'border-fuchsia-200',
  },
};

const AnnouncementLink = ({ announcement, onClose, className }) => {
  if (!announcement.buttonText || !announcement.buttonLink) return null;

  if (isExternalAnnouncementLink(announcement.buttonLink)) {
    return (
      <a
        href={announcement.buttonLink}
        target="_blank"
        rel="noreferrer"
        onClick={onClose}
        className={className}
      >
        {announcement.buttonText}
      </a>
    );
  }

  return (
    <Link to={announcement.buttonLink} onClick={onClose} className={className}>
      {announcement.buttonText}
    </Link>
  );
};

const Countdown = ({ timeLeft, subtle = false }) => {
  if (!timeLeft) return null;

  return (
    <div className={`${subtle ? 'bg-white/12 text-white' : 'border border-slate-200 bg-slate-50 text-slate-700'} rounded-2xl px-4 py-3`}>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] opacity-80">Ends in</p>
      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          ['Days', timeLeft.days],
          ['Hours', timeLeft.hours],
          ['Mins', timeLeft.minutes],
          ['Secs', timeLeft.seconds],
        ].map(([label, value]) => (
          <div key={label}>
            <div className="text-xl font-bold">{value}</div>
            <div className="text-[11px] uppercase tracking-[0.14em] opacity-75">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Eyebrow = ({ template, themeStyles, announcement, showMeta }) => (
  showMeta ? (
    <div className="flex flex-wrap items-center gap-2">
      <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${themeStyles.accentSoft}`}>
        <Sparkles className="h-3.5 w-3.5" />
        {template.label}
      </span>
      <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
        {announcement.type}
      </span>
    </div>
  ) : null
);

const ModalBody = ({ announcement, template, themeStyles, timeLeft, onClose, scopeClassName, scopedCss, showMeta }) => {
  const showImage = Boolean(announcement.imageUrl) && template.variant !== 'operational' && template.variant !== 'checklist';
  const imageUrl = resolveMediaUrl(announcement.imageUrl || '');

  return (
    <div className={`announcement ${scopeClassName} relative w-full overflow-hidden rounded-[30px] bg-white shadow-2xl shadow-slate-950/30 animate-scale-in ${announcement.displayStyle === 'MODAL' ? 'max-w-3xl' : 'max-w-xl'}`}>
      {scopedCss && <style>{scopedCss}</style>}
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/85 text-slate-700 transition-colors hover:bg-white"
      >
        <X className="h-4 w-4" />
      </button>

      {showImage && imageUrl && (
        <div className={`w-full overflow-hidden bg-slate-100 ${announcement.displayStyle === 'MODAL' ? 'h-64 sm:h-72 lg:h-80' : 'h-48 sm:h-56 lg:h-64'}`}>
          <img
            src={imageUrl}
            alt={announcement.title || 'Announcement creative'}
            className="h-full w-full object-contain"
            loading="lazy"
          />
        </div>
      )}

      <div className="space-y-5 p-6 sm:p-8">
        <Eyebrow template={template} themeStyles={themeStyles} announcement={announcement} showMeta={showMeta} />

        <div className={template.variant === 'checklist' ? 'grid gap-4 lg:grid-cols-[1fr_0.8fr]' : ''}>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950">{announcement.title}</h2>
            {announcement.content && (
              <p className="mt-3 text-sm leading-6 text-slate-600">{announcement.content}</p>
            )}
          </div>

          {showMeta && template.variant === 'checklist' && (
            <div className={`rounded-[24px] border ${themeStyles.border} bg-slate-50 p-5`}>
              <p className={`text-sm font-semibold ${themeStyles.accent}`}>Recommended use</p>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <p>Explain one practical shopper concern.</p>
                <p>Keep the CTA focused on the next action.</p>
                <p>Use product-page overlays sparingly.</p>
              </div>
            </div>
          )}
        </div>

        {showMeta && template.variant === 'coupon' && (
          <div className={`rounded-[24px] border ${themeStyles.border} p-5`}>
            <div className="flex items-center gap-3">
              <Ticket className={`h-5 w-5 ${themeStyles.accent}`} />
              <p className="font-semibold text-slate-950">Coupon-led conversion prompt</p>
            </div>
            <p className="mt-2 text-sm text-slate-600">Pair this template with a strong first-order or seasonal offer.</p>
          </div>
        )}

        {showMeta && template.variant === 'operational' && (
          <div className={`rounded-[24px] border ${themeStyles.border} p-5`}>
            <div className="flex items-center gap-3">
              <ShieldCheck className={`h-5 w-5 ${themeStyles.accent}`} />
              <p className="font-semibold text-slate-950">Operational context</p>
            </div>
            <p className="mt-2 text-sm text-slate-600">Use this layout when shoppers need clarity more than persuasion.</p>
          </div>
        )}

        <Countdown timeLeft={timeLeft} />

        <div className="flex flex-wrap gap-3">
          <AnnouncementLink
            announcement={announcement}
            onClose={onClose}
            className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-all ${themeStyles.button}`}
          />
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export const AnnouncementPopup = ({ announcement: rawAnnouncement, onClose, showMeta }) => {
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

  if (announcement.displayStyle === 'POPUP' || announcement.displayStyle === 'MODAL') {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm animate-fade-in">
        <ModalBody
          announcement={announcement}
          template={template}
          themeStyles={themeStyles}
          timeLeft={timeLeft}
          onClose={onClose}
          scopeClassName={scopeClassName}
          scopedCss={scopedCss}
          showMeta={metaEnabled}
        />
      </div>
    );
  }

  if (announcement.displayStyle === 'SLIDE_IN') {
    return (
      <div className={`announcement ${scopeClassName} fixed bottom-5 right-5 z-[70] w-[min(380px,calc(100vw-24px))] overflow-hidden rounded-[28px] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-950/15 animate-slide-in-right`}>
        {scopedCss && <style>{scopedCss}</style>}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-4 w-4" />
        </button>
        <Eyebrow template={template} themeStyles={themeStyles} announcement={announcement} showMeta={metaEnabled} />
        <h3 className="mt-4 pr-10 text-lg font-bold tracking-tight text-slate-950">{announcement.title}</h3>
        {announcement.content && <p className="mt-2 text-sm text-slate-600">{announcement.content}</p>}
        <div className="mt-4 space-y-3">
          <Countdown timeLeft={timeLeft} />
          <AnnouncementLink
            announcement={announcement}
            onClose={onClose}
            className={`inline-flex w-full items-center justify-center rounded-full px-4 py-3 text-sm font-semibold transition-all ${themeStyles.button}`}
          />
        </div>
      </div>
    );
  }

  if (announcement.displayStyle === 'STICKY') {
    return (
      <div className={`announcement ${scopeClassName} fixed inset-x-0 bottom-0 z-[70] border-t border-white/10 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-4 text-white shadow-2xl shadow-slate-950/30 animate-slide-in-up`}>
        {scopedCss && <style>{scopedCss}</style>}
        <div className="container mx-auto flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            {metaEnabled && (
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90">
                  <Sparkles className="h-3.5 w-3.5" />
                  {template.label}
                </span>
                {template.variant === 'trust' && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Confidence layer
                  </span>
                )}
                {template.variant === 'community' && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">
                    <Clock3 className="h-3.5 w-3.5" />
                    Persistent campaign
                  </span>
                )}
              </div>
            )}
            <h3 className="text-lg font-bold tracking-tight">{announcement.title}</h3>
            {announcement.content && <p className="mt-1 text-sm text-white/75">{announcement.content}</p>}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Countdown timeLeft={timeLeft} subtle />
            <div className="flex items-center gap-3">
              <AnnouncementLink
                announcement={announcement}
                onClose={onClose}
                className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-slate-100"
              />
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AnnouncementPopup;
