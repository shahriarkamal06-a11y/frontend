import { useEffect, useState } from 'react';
import { Code2, Image, Layout, Link as LinkIcon, Timer } from 'lucide-react';
import { sectionAPI } from '../../services/api';
import { resolveMediaUrl } from '../../utils/mediaHelpers';
import {
  getHomepageSectionTypeLabel,
  normalizeHomepageSection,
} from '../../utils/homepageSections';

export const AdvancedAnnouncementFields = ({ announcement, setAnnouncement, placementRule }) => {
  const [sections, setSections] = useState([]);
  const sectionOnlyBannerPlacement = announcement.displayLocation === 'SECTION';
  const dropdownOnlyBannerPlacement = announcement.displayLocation === 'CATEGORY_DROPDOWN';
  const previewImageUrl = announcement.imageUrl ? resolveMediaUrl(announcement.imageUrl) : '';
  const previewImageAlt = announcement.title ? `${announcement.title} preview` : 'Announcement preview image';

  useEffect(() => {
    const loadSections = async () => {
      try {
        const response = await sectionAPI.getSections({ activeOnly: true });
        const sectionItems = response?.data?.data?.items || response?.data?.data || [];
        const normalizedItems = Array.isArray(sectionItems)
          ? sectionItems
            .map(normalizeHomepageSection)
            .filter((section) => section.isActive !== false)
          : [];
        setSections(normalizedItems);
      } catch (error) {
        console.error('Failed to load sections:', error);
        setSections([]);
      }
    };

    loadSections();
  }, []);

  useEffect(() => {
    if ((!sectionOnlyBannerPlacement && !dropdownOnlyBannerPlacement) || announcement.displayStyle === 'BANNER') return;
    setAnnouncement((current) => ({ ...current, displayStyle: 'BANNER' }));
  }, [announcement.displayStyle, dropdownOnlyBannerPlacement, sectionOnlyBannerPlacement, setAnnouncement]);

  return (
    <>
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          <Layout className="mr-1 inline h-4 w-4" />
          Display Style
        </label>
        <select
          value={announcement.displayStyle}
          onChange={(event) => setAnnouncement((current) => ({ ...current, displayStyle: event.target.value }))}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition-all focus:border-violet-500 focus:bg-white"
        >
          {['BANNER', 'POPUP', 'MODAL', 'SLIDE_IN', 'STICKY'].map((style) => (
            <option
              key={style}
              value={style}
              disabled={!placementRule.allowedStyles.includes(style)}
            >
              {style.replace('_', ' ')}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-slate-500">Choose how this announcement should appear on the storefront.</p>
        {(sectionOnlyBannerPlacement || dropdownOnlyBannerPlacement || announcement.displayLocation === 'HEADER') && announcement.displayStyle !== 'BANNER' && (
          <p className="mt-2 text-xs text-amber-600">
            {announcement.displayLocation === 'HEADER'
              ? 'Top announcement bars only support the banner display style.'
              : announcement.displayLocation === 'CATEGORY_DROPDOWN'
                ? 'Category dropdown announcements only support the banner display style.'
                : 'Section placements only support the banner display style.'}
          </p>
        )}
      </div>

      {placementRule.fields.imageUrl.enabled && (
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            <Image className="mr-1 inline h-4 w-4" />
            Image URL
          </label>
          <input
            type="url"
            placeholder="https://example.com/banner.jpg"
            value={announcement.imageUrl}
            maxLength={placementRule.fields.imageUrl.maxLength}
            onChange={(event) => setAnnouncement((current) => ({ ...current, imageUrl: event.target.value }))}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition-all focus:border-violet-500 focus:bg-white"
          />
          <p className="mt-1 text-xs text-slate-500">Useful for popup, modal, or larger banner announcements with supporting creative.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            <LinkIcon className="mr-1 inline h-4 w-4" />
            Button Text
          </label>
          <input
            type="text"
            placeholder="Shop now"
            value={announcement.buttonText}
            maxLength={placementRule.fields.buttonText.maxLength}
            onChange={(event) => setAnnouncement((current) => ({ ...current, buttonText: event.target.value }))}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition-all focus:border-violet-500 focus:bg-white"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Button Link</label>
          <input
            type="text"
            placeholder="/products or https://example.com"
            value={announcement.buttonLink}
            maxLength={placementRule.fields.buttonLink.maxLength}
            onChange={(event) => setAnnouncement((current) => ({ ...current, buttonLink: event.target.value }))}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition-all focus:border-violet-500 focus:bg-white"
          />
        </div>
      </div>

      {placementRule.fields.countdownEnabled.enabled && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <input
            type="checkbox"
            id="countdown"
            checked={announcement.countdownEnabled}
            onChange={(event) => setAnnouncement((current) => ({ ...current, countdownEnabled: event.target.checked }))}
            className="h-4 w-4 rounded text-violet-600"
          />
          <label htmlFor="countdown" className="flex-1">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-slate-900">Enable Countdown Timer</span>
            </div>
            <p className="mt-0.5 text-xs text-slate-600">Requires an end date. Useful for flash sales and limited-time drops.</p>
          </label>
        </div>
      )}

      {announcement.displayLocation === 'SECTION' && (
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Target Section</label>
          <select
            value={announcement.sectionId}
            onChange={(event) => setAnnouncement((current) => ({ ...current, sectionId: event.target.value }))}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition-all focus:border-violet-500 focus:bg-white"
          >
            <option value="">Select a section...</option>
            {sections.map((section) => (
              <option key={section.id} value={section.id}>
                {(section.title || section.name || 'Untitled section')} ({getHomepageSectionTypeLabel(section.type)})
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-500">
            {sections.length === 0 ? 'No homepage sections found yet.' : 'This banner will render directly above the chosen homepage section.'}
          </p>
        </div>
      )}

      <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <input
          type="checkbox"
          id="showMeta"
          checked={Boolean(announcement.showMeta)}
          onChange={(event) => setAnnouncement((current) => ({ ...current, showMeta: event.target.checked }))}
          className="h-4 w-4 rounded text-violet-600"
        />
        <label htmlFor="showMeta" className="flex-1">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-900">Show template label & badges</span>
          </div>
          <p className="mt-0.5 text-xs text-slate-600">Turn this on if you want shoppers to see template tags like the template label or helper badges.</p>
        </label>
      </div>

      {placementRule.fields.customCss.enabled && (
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            <Code2 className="mr-1 inline h-4 w-4" />
            Custom CSS
          </label>
          <textarea
            rows={4}
            placeholder=".announcement { letter-spacing: 0.04em; }"
            value={announcement.customCss || ''}
            maxLength={placementRule.fields.customCss.maxLength}
            onChange={(event) => setAnnouncement((current) => ({ ...current, customCss: event.target.value }))}
            className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition-all focus:border-violet-500 focus:bg-white"
          />
          <p className="mt-1 text-xs text-slate-500">Stored with the record for custom storefront styling hooks.</p>
        </div>
      )}

      {announcement.displayStyle === 'POPUP' && (
        <div className="rounded-lg border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-4">
          <p className="mb-2 text-xs font-medium text-violet-900">Popup snapshot</p>
          <div className="rounded-lg bg-white p-4 shadow-lg">
            {previewImageUrl ? (
              <div className="mb-3 overflow-hidden rounded-lg border border-slate-200">
                <img src={previewImageUrl} alt={previewImageAlt} className="h-32 w-full object-cover" loading="lazy" />
              </div>
            ) : (
              <div className="mb-3 flex h-32 items-center justify-center rounded-lg bg-slate-100">
                <Image className="h-8 w-8 text-slate-400" />
              </div>
            )}
            <h3 className="mb-1 font-bold text-slate-900">{announcement.title || 'Your title here'}</h3>
            <p className="mb-3 text-sm text-slate-600">{announcement.content || 'Your content here...'}</p>
            {announcement.countdownEnabled && (
              <div className="mb-3 rounded bg-rose-50 py-2 text-center">
                <p className="text-xs font-mono text-rose-600">2d 14h 32m 15s</p>
              </div>
            )}
            {announcement.buttonText && (
              <button type="button" className="w-full rounded-lg bg-violet-600 py-2 text-sm font-medium text-white">
                {announcement.buttonText}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AdvancedAnnouncementFields;
