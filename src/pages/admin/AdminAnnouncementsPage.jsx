import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
  AlertTriangle,
  Archive,
  Bell,
  CheckCircle2,
  Clock3,
  Copy,
  Eye,
  Gift,
  Megaphone,
  Package,
  Pencil,
  Plus,
  Power,
  Search,
  Send,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { announcementAPI } from '../../services/api';
import { AdvancedAnnouncementFields } from '../../components/admin/AdvancedAnnouncementFields';
import { AnnouncementTemplateLibrary } from '../../components/admin/AnnouncementTemplateLibrary';
import { AnnouncementBanner } from '../../components/announcement';
import {
  ANNOUNCEMENT_LOCATION_OPTIONS,
  ANNOUNCEMENT_TYPE_OPTIONS,
  ROLE_TO_TARGET_AUDIENCE,
  createEmptyAnnouncement,
  deserializeAnnouncementForForm,
  formatDate,
  formatDateTime,
  getAnnouncementStatus,
  normalizeAnnouncement,
  serializeAnnouncementForApi,
  validateAnnouncementForm,
} from '../../utils/announcements';
import {
  createAnnouncementFromTemplate,
  getAnnouncementTemplate,
  getDefaultAnnouncementTemplateKey,
} from '../../utils/announcementTemplates';
import {
  applyAnnouncementPlacementConstraints,
  getAnnouncementFieldCharacterCount,
  getAnnouncementPlacementRule,
} from '../../utils/announcementConstraints';
import { resolveMediaUrl } from '../../utils/mediaHelpers';

const TYPE_META = {
  INFO: { label: 'Information', icon: Bell, shell: 'from-slate-600 to-slate-500' },
  PROMOTION: { label: 'Promotion', icon: Gift, shell: 'from-rose-500 to-orange-500' },
  PRODUCT: { label: 'Product', icon: Package, shell: 'from-blue-600 to-cyan-500' },
  MAINTENANCE: { label: 'Maintenance', icon: AlertTriangle, shell: 'from-amber-500 to-orange-500' },
  FEATURE: { label: 'Feature', icon: CheckCircle2, shell: 'from-emerald-500 to-teal-500' },
};

const STATUS_META = {
  active: { label: 'Active', tone: 'bg-emerald-50 text-emerald-700' },
  scheduled: { label: 'Scheduled', tone: 'bg-blue-50 text-blue-700' },
  draft: { label: 'Draft', tone: 'bg-slate-100 text-slate-700' },
  expired: { label: 'Expired', tone: 'bg-rose-50 text-rose-700' },
};

const AdminAnnouncementsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [editor, setEditor] = useState({ open: false, mode: 'create', announcementId: null });
  const [formAnnouncement, setFormAnnouncement] = useState(createEmptyAnnouncement());
  const [formErrors, setFormErrors] = useState({});
  const [showTemplatePicker, setShowTemplatePicker] = useState(true);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const customizeSectionRef = useRef(null);
  const placementRule = useMemo(() => (
    getAnnouncementPlacementRule(formAnnouncement.displayLocation, formAnnouncement.displayStyle)
  ), [formAnnouncement.displayLocation, formAnnouncement.displayStyle]);

  const requestParams = useMemo(() => ({
    page: '1',
    limit: '200',
    search: deferredSearchQuery.trim() || undefined,
    type: typeFilter !== 'all' ? typeFilter.toUpperCase() : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    displayLocation: locationFilter !== 'all' ? locationFilter : undefined,
    sort: 'priority-desc',
  }), [deferredSearchQuery, locationFilter, statusFilter, typeFilter]);

  const loadAnnouncements = useCallback(async (params) => {
    setLoading(true);
    try {
      const response = await announcementAPI.getAnnouncements(params);
      setAnnouncements(response?.data?.data?.items || []);
    } catch (error) {
      console.error('Failed to load announcements:', error);
      toast.error('Failed to load announcements');
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnnouncements(requestParams);
  }, [loadAnnouncements, requestParams]);

  const normalizedAnnouncements = useMemo(() => {
    return announcements
      .map((rawAnnouncement) => {
        const announcement = normalizeAnnouncement(rawAnnouncement);
        return {
          ...announcement,
          status: getAnnouncementStatus(announcement),
          targetAudience: ROLE_TO_TARGET_AUDIENCE[announcement.targetRole] || 'all',
        };
      });
  }, [announcements]);

  useEffect(() => {
    if (!selectedAnnouncementId) return;
    if (normalizedAnnouncements.some((announcement) => announcement.id === selectedAnnouncementId)) return;
    setSelectedAnnouncementId(null);
  }, [normalizedAnnouncements, selectedAnnouncementId]);

  const stats = useMemo(() => {
    return {
      total: normalizedAnnouncements.length,
      active: normalizedAnnouncements.filter((item) => item.status === 'active').length,
      scheduled: normalizedAnnouncements.filter((item) => item.status === 'scheduled').length,
      expired: normalizedAnnouncements.filter((item) => item.status === 'expired').length,
    };
  }, [normalizedAnnouncements]);

  const previewAnnouncement = useMemo(() => {
    const payload = serializeAnnouncementForApi(formAnnouncement);
    return normalizeAnnouncement({
      ...payload,
      id: 'preview-announcement',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }, [formAnnouncement]);

  const topIssues = useMemo(() => {
    return normalizedAnnouncements
      .filter((announcement) => announcement.status !== 'expired')
      .slice(0, 3);
  }, [normalizedAnnouncements]);

  const selectedTemplate = useMemo(() => {
    return getAnnouncementTemplate(previewAnnouncement.templateKey, previewAnnouncement);
  }, [previewAnnouncement]);

  const applyFormUpdate = useCallback((updater) => {
    setFormAnnouncement((current) => {
      const nextAnnouncement = typeof updater === 'function' ? updater(current) : updater;
      const constrainedAnnouncement = applyAnnouncementPlacementConstraints(nextAnnouncement);
      const previousPlacementKey = `${current.displayLocation}:${current.displayStyle}`;
      const nextPlacementKey = `${constrainedAnnouncement.displayLocation}:${constrainedAnnouncement.displayStyle}`;

      if (previousPlacementKey !== nextPlacementKey) {
        return {
          ...constrainedAnnouncement,
          templateKey: getDefaultAnnouncementTemplateKey(
            constrainedAnnouncement.displayLocation,
            constrainedAnnouncement.displayStyle
          ),
        };
      }

      return constrainedAnnouncement;
    });
  }, []);

  const openCreateEditor = (templateKey = null, templateOverrides = {}) => {
    setEditor({ open: true, mode: 'create', announcementId: null });
    setShowTemplatePicker(true);
    const nextAnnouncement = templateKey
      ? createAnnouncementFromTemplate(templateKey, templateOverrides)
      : createEmptyAnnouncement(templateOverrides);
    setFormAnnouncement(applyAnnouncementPlacementConstraints(createEmptyAnnouncement(nextAnnouncement)));
    setFormErrors({});
  };

  const openEditEditor = (announcement) => {
    setEditor({ open: true, mode: 'edit', announcementId: announcement.id });
    setShowTemplatePicker(false);
    setFormAnnouncement(applyAnnouncementPlacementConstraints(deserializeAnnouncementForForm(announcement)));
    setFormErrors({});
  };

  const closeEditor = () => {
    setEditor({ open: false, mode: 'create', announcementId: null });
    setShowTemplatePicker(true);
    setFormAnnouncement(createEmptyAnnouncement());
    setFormErrors({});
  };

  const reloadAnnouncements = async () => {
    await loadAnnouncements(requestParams);
  };

  const scrollToCustomizeSection = useCallback(() => {
    window.requestAnimationFrame(() => {
      customizeSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

  const applyTemplateToEditor = (templateKey) => {
    const templateValues = createAnnouncementFromTemplate(templateKey);
    applyFormUpdate((current) => ({
      ...current,
      ...templateValues,
      templateKey,
      startDate: current.startDate,
      endDate: current.endDate || templateValues.endDate || '',
      targetAudience: current.targetAudience,
      isActive: current.isActive,
      sectionId: current.displayLocation === 'SECTION'
        ? (current.sectionId || templateValues.sectionId || '')
        : (templateValues.sectionId || ''),
    }));
    setShowTemplatePicker(false);
    setFormErrors({});
    scrollToCustomizeSection();
  };

  const handleSaveAnnouncement = async () => {
    const nextErrors = validateAnnouncementForm(formAnnouncement);
    setFormErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error(Object.values(nextErrors)[0]);
      return;
    }

    setSaving(true);
    try {
      const payload = serializeAnnouncementForApi(formAnnouncement);

      if (editor.mode === 'edit' && editor.announcementId) {
        await announcementAPI.updateAnnouncement(editor.announcementId, payload);
        toast.success('Announcement updated');
      } else {
        await announcementAPI.createAnnouncement(payload);
        toast.success('Announcement created');
      }

      await reloadAnnouncements();
      closeEditor();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to save announcement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (announcementId) => {
    try {
      await announcementAPI.deleteAnnouncement(announcementId);
      await reloadAnnouncements();
      toast.success('Announcement deleted');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete announcement');
    }
  };

  const handleToggleActive = async (announcement) => {
    try {
      await announcementAPI.updateAnnouncement(announcement.id, { isActive: !announcement.isActive });
      await reloadAnnouncements();
      toast.success(announcement.isActive ? 'Announcement paused' : 'Announcement activated');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update announcement status');
    }
  };

  const handleDuplicate = (announcement) => {
    const duplicatedAnnouncement = deserializeAnnouncementForForm(announcement);
    openCreateEditor(null, {
      ...duplicatedAnnouncement,
      title: `${announcement.title} Copy`,
      isActive: false,
    });
  };

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-slate-50">
      <div className="border-b border-slate-100 bg-white">
        <div className="container mx-auto px-4 py-8 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-700">
                <Sparkles className="h-3.5 w-3.5" />
                Announcement control center
              </div>
              <h1 className="text-3xl font-bold text-slate-950" style={{ fontFamily: 'var(--font-display)' }}>
                Announcements
              </h1>
              <p className="mt-2 max-w-2xl text-slate-600">
                Schedule, target, preview, and recover announcements across the header bar, category dropdown, homepage, product pages, checkout, category pages, and section slots.
              </p>
            </div>

            <button
              type="button"
              onClick={() => openCreateEditor()}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/35"
            >
              <Plus className="h-4 w-4" />
              New announcement
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Total" value={stats.total} icon={Megaphone} iconClass="text-slate-400" />
            <StatCard title="Active now" value={stats.active} icon={CheckCircle2} iconClass="text-emerald-500" />
            <StatCard title="Scheduled" value={stats.scheduled} icon={Clock3} iconClass="text-blue-500" />
            <StatCard title="Expired" value={stats.expired} icon={Archive} iconClass="text-rose-500" />
          </div>

          {topIssues.length > 0 && (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-950 p-5 text-white">
              <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
                <Eye className="h-4 w-4" />
                Highest priority live queue
              </div>
              <div className="mt-4 grid gap-3 lg:grid-cols-3">
                {topIssues.map((announcement) => (
                  <div key={announcement.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="text-xs uppercase tracking-[0.18em] text-white/50">{announcement.displayLocation.replace(/_/g, ' ')}</span>
                      <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium">P{announcement.priority}</span>
                    </div>
                    <h3 className="font-semibold">{announcement.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-white/65">{announcement.content || 'No supporting content'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="border-b border-slate-100 bg-white">
        <div className="container mx-auto px-4 py-4 lg:px-8">
          <div className="flex flex-col gap-4 xl:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title or content..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 outline-none transition-all focus:border-violet-500 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:flex">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition-all focus:border-violet-500 focus:bg-white"
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="scheduled">Scheduled</option>
                <option value="draft">Draft</option>
                <option value="expired">Expired</option>
              </select>
              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition-all focus:border-violet-500 focus:bg-white"
              >
                <option value="all">All types</option>
                {ANNOUNCEMENT_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                value={locationFilter}
                onChange={(event) => setLocationFilter(event.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition-all focus:border-violet-500 focus:bg-white"
              >
                <option value="all">All locations</option>
                {ANNOUNCEMENT_LOCATION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 lg:px-8">
        {loading ? (
          <div className="py-16 text-center text-slate-500">Loading announcements...</div>
        ) : normalizedAnnouncements.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <Megaphone className="h-8 w-8 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-950">No announcements found</h2>
            <p className="mt-2 text-slate-600">Adjust the filters or create a new announcement to populate the storefront.</p>
          </div>
        ) : (
          <div className="grid gap-5 xl:grid-cols-2">
            {normalizedAnnouncements.map((announcement) => {
              const selected = selectedAnnouncementId === announcement.id;
              const typeMeta = TYPE_META[announcement.type] || TYPE_META.INFO;
              const statusMeta = STATUS_META[announcement.status] || STATUS_META.draft;
              const TypeIcon = typeMeta.icon;

              return (
                <div key={announcement.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <div className="p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${typeMeta.shell}`}>
                          <TypeIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-slate-950">{announcement.title}</h3>
                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusMeta.tone}`}>
                              {statusMeta.label}
                            </span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                            <span className="rounded-full bg-slate-100 px-2.5 py-1">{typeMeta.label}</span>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1">{announcement.displayLocation.replace(/_/g, ' ')}</span>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1">{announcement.displayStyle.replace(/_/g, ' ')}</span>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1">Priority {announcement.priority}</span>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 capitalize">
                              Audience {announcement.targetAudience.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedAnnouncementId(selected ? null : announcement.id)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                        >
                          <Eye className="h-4 w-4" />
                          Details
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditEditor(announcement)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicate(announcement)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                        >
                          <Copy className="h-4 w-4" />
                          Duplicate
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(announcement)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                        >
                          <Power className="h-4 w-4" />
                          {announcement.isActive ? 'Pause' : 'Activate'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(announcement.id)}
                          className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </div>

                    <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">
                      {announcement.content || 'No supporting content provided.'}
                    </p>

                    <div className="mt-4 grid gap-3 text-sm text-slate-500 sm:grid-cols-2">
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Start</p>
                        <p className="mt-1 font-medium text-slate-900">{formatDateTime(announcement.startsAt, 'Immediate')}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">End</p>
                        <p className="mt-1 font-medium text-slate-900">{formatDateTime(announcement.endsAt, 'No end date')}</p>
                      </div>
                    </div>

                    {selected && (
                      <div className="mt-5 space-y-4 border-t border-slate-100 pt-5">
                        <AnnouncementBanner announcement={announcement} compact />
                        <div className="grid gap-3 text-sm sm:grid-cols-2">
                          <DetailCard label="Created" value={formatDateTime(announcement.createdAt)} />
                          <DetailCard label="Last updated" value={formatDateTime(announcement.updatedAt)} />
                          <DetailCard label="Countdown" value={announcement.countdownEnabled ? 'Enabled' : 'Disabled'} />
                          <DetailCard label="Section target" value={announcement.sectionId || 'Not section-targeted'} />
                          <DetailCard label="Button text" value={announcement.buttonText || 'Not set'} />
                          <DetailCard label="Button link" value={announcement.buttonLink || 'Not set'} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {editor.open && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-sm sm:p-4 lg:p-6">
          <div className="flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-[32px] bg-white shadow-2xl shadow-slate-950/30">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">
                    {editor.mode === 'edit' ? 'Edit flow' : 'Create flow'}
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-950">
                    {editor.mode === 'edit' ? 'Update announcement' : 'Build a new announcement'}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Preview the exact announcement shape before publishing it to the storefront.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeEditor}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="grid min-w-0 flex-1 overflow-hidden lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
              <div className="min-w-0 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
                <div className="space-y-5">
                  <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">Step 1</p>
                        <h3 className="mt-2 text-lg font-semibold text-slate-950">Choose a template</h3>
                        <p className="mt-1 text-sm text-slate-600">
                          Pick the closest starting point, then continue to customization.
                        </p>
                      </div>
                      {!showTemplatePicker && (
                        <button
                          type="button"
                          onClick={() => setShowTemplatePicker(true)}
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                        >
                          Change template
                        </button>
                      )}
                    </div>

                    {showTemplatePicker ? (
                      <div className="mt-5">
                        <AnnouncementTemplateLibrary
                          selectedTemplateKey={formAnnouncement.templateKey}
                          onSelectTemplate={applyTemplateToEditor}
                        />
                      </div>
                    ) : (
                      <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Selected template</p>
                            <h4 className="mt-2 text-lg font-semibold text-slate-950">{selectedTemplate.label}</h4>
                            <p className="mt-1 text-sm text-slate-600">{selectedTemplate.description}</p>
                          </div>
                          <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-violet-700">
                            {selectedTemplate.variant}
                          </span>
                        </div>
                      </div>
                    )}
                  </section>

                  <section ref={customizeSectionRef} className="space-y-5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">Step 2</p>
                      <h3 className="mt-2 text-lg font-semibold text-slate-950">Customize the announcement</h3>
                    </div>

                  <FieldGroup
                    label={placementRule.fields.title.label}
                    error={formErrors.title}
                    hint={placementRule.helpText}
                    counter={`${getAnnouncementFieldCharacterCount(formAnnouncement.title)}/${placementRule.fields.title.maxLength}`}
                  >
                    <input
                      type="text"
                      value={formAnnouncement.title}
                      maxLength={placementRule.fields.title.maxLength}
                      onChange={(event) => applyFormUpdate((current) => ({ ...current, title: event.target.value }))}
                      placeholder={formAnnouncement.displayLocation === 'HEADER'
  ? 'Enter one concise top-bar message'
  : formAnnouncement.displayLocation === 'CATEGORY_DROPDOWN'
    ? 'Enter a dropdown highlight headline'
    : 'Enter announcement title'}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition-all focus:border-violet-500 focus:bg-white"
                    />
                  </FieldGroup>

                  {placementRule.fields.content.enabled ? (
                    <FieldGroup
                      label="Content"
                      error={formErrors.content}
                      counter={`${getAnnouncementFieldCharacterCount(formAnnouncement.content)}/${placementRule.fields.content.maxLength}`}
                    >
                      <textarea
                        rows={5}
                        value={formAnnouncement.content}
                        maxLength={placementRule.fields.content.maxLength}
                        onChange={(event) => applyFormUpdate((current) => ({ ...current, content: event.target.value }))}
                        placeholder="Explain the message, urgency, or CTA"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition-all focus:border-violet-500 focus:bg-white"
                      />
                    </FieldGroup>
                  ) : (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                      Supporting content is disabled for this placement. The top bar only renders one line of text.
                    </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-2">
                    <FieldGroup label="Type">
                      <select
                        value={formAnnouncement.type}
                        onChange={(event) => applyFormUpdate((current) => ({ ...current, type: event.target.value }))}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition-all focus:border-violet-500 focus:bg-white"
                      >
                        {ANNOUNCEMENT_TYPE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </FieldGroup>

                    <FieldGroup label="Target audience">
                      <select
                        value={formAnnouncement.targetAudience}
                        onChange={(event) => applyFormUpdate((current) => ({ ...current, targetAudience: event.target.value }))}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition-all focus:border-violet-500 focus:bg-white"
                      >
                        <option value="all">All visitors</option>
                        <option value="customers">Customers</option>
                        <option value="admins">Admins</option>
                      </select>
                    </FieldGroup>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FieldGroup label="Display location">
                      <select
                        value={formAnnouncement.displayLocation}
                        onChange={(event) => {
                          const nextLocation = event.target.value;
                          applyFormUpdate((current) => ({
                            ...current,
                            displayLocation: nextLocation,
                            displayStyle: current.displayStyle,
                            templateKey: getDefaultAnnouncementTemplateKey(
                              nextLocation,
                              current.displayStyle
                            ),
                          }));
                        }}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition-all focus:border-violet-500 focus:bg-white"
                      >
                        {ANNOUNCEMENT_LOCATION_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </FieldGroup>

                    <FieldGroup label="Priority (0-100)">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formAnnouncement.priority}
                        onChange={(event) => applyFormUpdate((current) => ({ ...current, priority: event.target.value }))}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition-all focus:border-violet-500 focus:bg-white"
                      />
                    </FieldGroup>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FieldGroup label="Start date">
                      <input
                        type="datetime-local"
                        value={formAnnouncement.startDate}
                        onChange={(event) => applyFormUpdate((current) => ({ ...current, startDate: event.target.value }))}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition-all focus:border-violet-500 focus:bg-white"
                      />
                    </FieldGroup>

                    <FieldGroup label="End date" error={formErrors.endDate}>
                      <input
                        type="datetime-local"
                        value={formAnnouncement.endDate}
                        onChange={(event) => applyFormUpdate((current) => ({ ...current, endDate: event.target.value }))}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition-all focus:border-violet-500 focus:bg-white"
                      />
                    </FieldGroup>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">Publishing state</p>
                        <p className="text-xs text-slate-500">Inactive announcements stay saved as drafts.</p>
                      </div>
                      <label className="inline-flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={formAnnouncement.isActive}
                          onChange={(event) => applyFormUpdate((current) => ({ ...current, isActive: event.target.checked }))}
                          className="h-4 w-4 rounded text-violet-600"
                        />
                        <span className="text-sm font-medium text-slate-900">Active</span>
                      </label>
                    </div>

                    <AdvancedAnnouncementFields
                      announcement={formAnnouncement}
                      setAnnouncement={applyFormUpdate}
                      placementRule={placementRule}
                    />

                    {(formErrors.displayStyle || formErrors.sectionId || formErrors.button || formErrors.imageUrl || formErrors.customCss || formErrors.countdownEnabled) && (
                      <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                        {formErrors.displayStyle
                          || formErrors.sectionId
                          || formErrors.button
                          || formErrors.imageUrl
                          || formErrors.customCss
                          || formErrors.countdownEnabled}
                      </div>
                    )}
                  </div>
                  </section>
                </div>
              </div>

              <div className="overflow-y-auto border-t border-slate-100 bg-slate-50 px-4 py-5 sm:px-6 sm:py-6 lg:border-l lg:border-t-0">
                <div className="sticky top-0 space-y-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">Live preview</p>
                    <h3 className="mt-2 text-xl font-bold text-slate-950">What shoppers will actually see</h3>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Selected template</p>
                        <h4 className="mt-2 text-lg font-semibold text-slate-950">{selectedTemplate.label}</h4>
                        <p className="mt-1 text-sm text-slate-600">{selectedTemplate.description}</p>
                      </div>
                      <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-violet-700">
                        {selectedTemplate.variant}
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {selectedTemplate.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <AnnouncementPreview announcement={previewAnnouncement} />

                  <div className="rounded-3xl border border-slate-200 bg-white p-5">
                    <p className="text-sm font-semibold text-slate-950">Deployment checks</p>
                    <div className="mt-4 space-y-3 text-sm">
                      <CheckLine
                        label={`Status: ${getAnnouncementStatus(previewAnnouncement)}`}
                        ok={Object.keys(formErrors).length === 0}
                      />
                      <CheckLine
                        label={`Start: ${formatDate(formAnnouncement.startDate, 'Immediate')}`}
                        ok
                      />
                      <CheckLine
                        label={`End: ${formatDate(formAnnouncement.endDate, 'No end date')}`}
                        ok={!formAnnouncement.countdownEnabled || Boolean(formAnnouncement.endDate)}
                      />
                      <CheckLine
                        label={`Placement: ${previewAnnouncement.displayLocation.replace(/_/g, ' ')} / ${previewAnnouncement.displayStyle.replace(/_/g, ' ')}`}
                        ok={
                          !(previewAnnouncement.displayLocation === 'SECTION' && previewAnnouncement.displayStyle !== 'BANNER')
                          && !(previewAnnouncement.displayLocation === 'HEADER' && previewAnnouncement.displayStyle !== 'BANNER')
                        }
                      />
                      <CheckLine
                        label={`Audience: ${(formAnnouncement.targetAudience || 'all').replace('_', ' ')}`}
                        ok
                      />
                      <CheckLine
                        label={`Template: ${selectedTemplate.label}`}
                        ok={Boolean(formAnnouncement.templateKey)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 px-6 py-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeEditor}
                  className="rounded-2xl bg-slate-100 px-5 py-3 font-medium text-slate-700 transition-colors hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAnnouncement}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/35 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Send className="h-4 w-4" />
                  {saving ? 'Saving...' : editor.mode === 'edit' ? 'Save changes' : 'Create announcement'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AnnouncementPreview = ({ announcement }) => {
  const template = getAnnouncementTemplate(announcement.templateKey, announcement);
  const imageUrl = resolveMediaUrl(announcement.imageUrl || '');

  if (announcement.displayStyle === 'BANNER') {
    return (
      <AnnouncementBanner
        announcement={announcement}
        compact={announcement.displayLocation === 'HEADER'}
        placement={announcement.displayLocation === 'HEADER' ? 'header' : 'surface'}
      />
    );
  }

  return (
    <div className="relative min-h-[320px] overflow-hidden rounded-[32px] border border-slate-200 bg-slate-950 p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_35%)]" />
      {announcement.displayStyle === 'STICKY' ? (
        <div className="absolute inset-x-4 bottom-4 rounded-[28px] bg-gradient-to-r from-slate-950 via-violet-950 to-slate-900 p-5 text-white shadow-xl">
          <p className="font-semibold">{announcement.title || 'Sticky announcement title'}</p>
          <p className="mt-2 text-sm text-white/70">{announcement.content || 'Sticky announcements stay attached to the viewport.'}</p>
        </div>
      ) : announcement.displayStyle === 'SLIDE_IN' ? (
        <div className="absolute bottom-4 right-4 w-full max-w-[300px] rounded-[28px] bg-white p-5 shadow-xl">
          <p className="pr-10 font-semibold text-slate-950">{announcement.title || 'Slide-in announcement title'}</p>
          <p className="mt-2 text-sm text-slate-600">{announcement.content || 'Slide-in announcements appear without blocking the page.'}</p>
        </div>
      ) : (
        <div className={`absolute left-1/2 top-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[28px] bg-white shadow-2xl ${announcement.displayStyle === 'MODAL' ? 'max-w-2xl' : 'max-w-lg'}`}>
          {imageUrl ? (
            <div className="h-36 w-full overflow-hidden">
              <img
                src={imageUrl}
                alt={announcement.title || 'Announcement creative'}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="h-36 w-full bg-slate-200" />
          )}
          <div className="p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">{template.label}</p>
            <h4 className="mt-2 text-2xl font-bold text-slate-950">{announcement.title || 'Modal headline'}</h4>
            <p className="mt-3 text-sm text-slate-600">
              {announcement.content || 'Popup and modal announcements are best for urgent campaigns or operational notices.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const CheckLine = ({ label, ok }) => (
  <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${ok ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
      {ok ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
    </div>
    <span className="text-slate-700">{label}</span>
  </div>
);

const FieldGroup = ({ label, error, hint, counter, children }) => (
  <div>
    <div className="mb-2 flex items-center justify-between gap-3">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="flex items-center gap-3">
        {counter && <span className="text-xs text-slate-400">{counter}</span>}
        {error && <span className="text-xs font-medium text-rose-600">{error}</span>}
      </div>
    </div>
    {children}
    {hint && <p className="mt-2 text-xs text-slate-500">{hint}</p>}
  </div>
);

const DetailCard = ({ label, value }) => (
  <div className="rounded-2xl bg-slate-50 p-4">
    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{label}</p>
    <p className="mt-1 font-medium text-slate-900">{value}</p>
  </div>
);

const StatCard = ({ title, value, icon, iconClass }) => {
  const IconComponent = icon;

  return (
    <div className="rounded-3xl bg-slate-50 p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-slate-500">{title}</span>
        <IconComponent className={`h-4 w-4 ${iconClass}`} />
      </div>
      <p className="text-3xl font-bold text-slate-950">{value}</p>
    </div>
  );
};

export default AdminAnnouncementsPage;
