import { useMemo, useState } from 'react';
import { Layers3, LayoutTemplate, MousePointerClick, PanelTop, Sparkles } from 'lucide-react';
import {
  ANNOUNCEMENT_TEMPLATE_GROUPS,
  ANNOUNCEMENT_TEMPLATES,
  getAnnouncementTemplate,
  getAnnouncementTemplatesForGroup,
} from '../../utils/announcementTemplates';

const STYLE_LABELS = {
  BANNER: 'Banner',
  POPUP: 'Popup',
  MODAL: 'Modal',
  SLIDE_IN: 'Slide in',
  STICKY: 'Sticky',
};

const LOCATION_LABELS = {
  HEADER: 'Header bar',
  CATEGORY_DROPDOWN: 'Category dropdown',
  HOMEPAGE: 'Homepage',
  PRODUCT_PAGES: 'Product pages',
  CHECKOUT: 'Checkout',
  ALL: 'All pages',
  CATEGORIES: 'Categories',
  SECTION: 'Section',
};

export const AnnouncementTemplateLibrary = ({
  selectedTemplateKey,
  onSelectTemplate,
}) => {
  const [activeGroup, setActiveGroup] = useState('all');
  const selectedTemplate = useMemo(
    () => getAnnouncementTemplate(selectedTemplateKey),
    [selectedTemplateKey]
  );
  const templates = useMemo(
    () => getAnnouncementTemplatesForGroup(activeGroup),
    [activeGroup]
  );

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-700">
              <LayoutTemplate className="h-3.5 w-3.5" />
              Template library
            </div>
            <h3 className="mt-3 text-lg font-semibold text-slate-950">{ANNOUNCEMENT_TEMPLATES.length} structured announcement templates</h3>
            <p className="mt-1 text-sm text-slate-600">
              Pick a placement-aware starting point instead of assembling fields manually.
            </p>
          </div>

          <div className="hidden rounded-2xl bg-slate-50 px-4 py-3 text-right sm:block">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Selected</p>
            <p className="mt-1 font-semibold text-slate-950">{selectedTemplate.label}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {ANNOUNCEMENT_TEMPLATE_GROUPS.map((group) => (
            <button
              key={group.id}
              type="button"
              onClick={() => setActiveGroup(group.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeGroup === group.id
                  ? 'bg-slate-950 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {group.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {templates.map((template) => {
          const selected = template.key === selectedTemplate.key;

          return (
            <button
              key={template.key}
              type="button"
              onClick={() => onSelectTemplate(template.key)}
              className={`rounded-[24px] border p-4 text-left transition-all ${
                selected
                  ? 'border-violet-500 bg-violet-50 shadow-sm shadow-violet-200/40'
                  : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-950">{template.label}</p>
                  <p className="mt-1 text-sm text-slate-600">{template.description}</p>
                </div>
                {selected && (
                  <span className="rounded-full bg-violet-600 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
                    Active
                  </span>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1">
                  <PanelTop className="h-3.5 w-3.5" />
                  {LOCATION_LABELS[template.displayLocation]}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1">
                  <Layers3 className="h-3.5 w-3.5" />
                  {STYLE_LABELS[template.displayStyle]}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1">
                  <MousePointerClick className="h-3.5 w-3.5" />
                  {template.variant}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {template.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-slate-950 px-2.5 py-1 text-[11px] font-medium text-white"
                  >
                    <Sparkles className="h-3 w-3" />
                    {tag}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AnnouncementTemplateLibrary;
