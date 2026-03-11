import { useEffect, useMemo, useState } from 'react';
import { Edit, Image as ImageIcon, Plus, Save, Trash2, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { sectionAPI, uploadAPI } from '../../services/api';
import { resolveMediaUrl, isImageValue } from '../../utils/mediaHelpers';
import {
  HOMEPAGE_SECTION_TONE_OPTIONS,
  HOMEPAGE_SECTION_TYPE_OPTIONS,
  HOMEPAGE_SECTION_TYPES,
  createHomepageSectionContent,
  createHomepageSectionItem,
  getHomepageSectionTypeLabel,
  normalizeHomepageSection,
  normalizeHomepageSectionContent,
  normalizeHomepageSectionType,
} from '../../utils/homepageSections';

const getItems = (response) => response?.data?.data?.items || [];

const createFormState = (type = HOMEPAGE_SECTION_TYPES.PRODUCT_GRID) => ({
  name: '',
  slug: '',
  description: '',
  icon: '',
  type,
  sortOrder: 0,
  isActive: true,
  content: createHomepageSectionContent(type),
});

const toFormState = (section) => {
  const normalized = normalizeHomepageSection(section);
  return {
    name: normalized.name || '',
    slug: normalized.slug || '',
    description: normalized.description || '',
    icon: normalized.icon || '',
    type: normalized.type,
    sortOrder: normalized.sortOrder || 0,
    isActive: normalized.isActive !== false,
    content: normalizeHomepageSectionContent(normalized.type, normalized.content),
  };
};

const summarizeSection = (section) => {
  const type = normalizeHomepageSectionType(section.type);
  const itemCount = section.content?.items?.length || 0;

  if (type === HOMEPAGE_SECTION_TYPES.PRODUCT_GRID) return 'Product-linked homepage grid';
  if (type === HOMEPAGE_SECTION_TYPES.PROMO) return `${section.content?.buttonText || 'No primary CTA'} promo block`;
  if (type === HOMEPAGE_SECTION_TYPES.MEDIA_GRID) return `${itemCount} media item${itemCount === 1 ? '' : 's'}`;
  if (type === HOMEPAGE_SECTION_TYPES.TESTIMONIALS) return `${itemCount} manual testimonial${itemCount === 1 ? '' : 's'}${itemCount ? '' : ' plus review fallback'}`;
  if (type === HOMEPAGE_SECTION_TYPES.MARQUEE) return `${itemCount} marquee label${itemCount === 1 ? '' : 's'}${itemCount ? '' : ' plus live fallback'}`;
  return `${section.content?.buttonText || 'CTA'} conversion block`;
};

const Field = ({ label, children, hint }) => (
  <div>
    <label className="mb-2 block text-sm font-medium text-slate-700">{label}</label>
    {children}
    {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
  </div>
);

const TextInput = ({ value, onChange, placeholder, type = 'text' }) => (
  <input
    autoFocus
    type={type}
    value={value}
    onChange={(event) => onChange(type === 'number' ? Number(event.target.value) || 0 : event.target.value)}
    placeholder={placeholder}
    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
  />
);

const TextArea = ({ value, onChange, placeholder, rows = 3 }) => (
  <textarea
    rows={rows}
    value={value}
    onChange={(event) => onChange(event.target.value)}
    placeholder={placeholder}
    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
  />
);

const ImageField = ({ label, value, onChange, placeholder = 'https://example.com/image.png or /uploads/sections/example.png', hint }) => {
  const [uploading, setUploading] = useState(false);

  const onUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const response = await uploadAPI.uploadImage(file, 'sections');
      const imageUrl = response?.data?.data?.url;
      if (!imageUrl) throw new Error('Missing image URL');
      onChange(imageUrl);
      toast.success('Image uploaded');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <Field label={label} hint={hint}>
      <div className="space-y-3">
        <TextInput value={value} onChange={onChange} placeholder={placeholder} />
        <div className="flex flex-wrap gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
            <Upload className="h-4 w-4" />
            {uploading ? 'Uploading...' : 'Upload image'}
            <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={onUpload} />
          </label>
          {value && (
            <button type="button" onClick={() => onChange('')} className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">
              Remove
            </button>
          )}
        </div>
        <div className="flex h-28 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          {value && isImageValue(value) ? (
            <img src={resolveMediaUrl(value)} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="text-center text-slate-400">
              <ImageIcon className="mx-auto mb-2 h-5 w-5" />
              <p className="text-xs">No image preview</p>
            </div>
          )}
        </div>
      </div>
    </Field>
  );
};

const ItemsEditor = ({ type, items, addItem, updateItem, removeItem }) => {
  if (![HOMEPAGE_SECTION_TYPES.MEDIA_GRID, HOMEPAGE_SECTION_TYPES.TESTIMONIALS, HOMEPAGE_SECTION_TYPES.MARQUEE].includes(type)) {
    return null;
  }

  return (
    <div className="space-y-4 rounded-[24px] border border-slate-200 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-950">Section items</p>
          <p className="text-xs text-slate-500">
            {type === HOMEPAGE_SECTION_TYPES.MEDIA_GRID && 'Upload screenshots, UGC, or social proof images for the slider.'}
            {type === HOMEPAGE_SECTION_TYPES.TESTIMONIALS && 'Leave empty to fall back to live store reviews.'}
            {type === HOMEPAGE_SECTION_TYPES.MARQUEE && 'Leave empty to fall back to live collection names.'}
          </p>
        </div>
        <button type="button" onClick={addItem} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
          <Plus className="h-4 w-4" />
          {type === HOMEPAGE_SECTION_TYPES.MEDIA_GRID ? 'Add media' : 'Add item'}
        </button>
      </div>

      {items.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
          {type === HOMEPAGE_SECTION_TYPES.MEDIA_GRID ? 'No media uploaded yet.' : 'No items configured.'}
        </div>
      )}

      {items.map((item) => (
        <div key={item.id} className="space-y-3 rounded-2xl border border-slate-200 p-4">
          {type === HOMEPAGE_SECTION_TYPES.MARQUEE ? (
            <Field label="Label">
              <TextInput value={item.label} onChange={(value) => updateItem(item.id, 'label', value)} placeholder="New Arrivals" />
            </Field>
          ) : null}

          {type === HOMEPAGE_SECTION_TYPES.MEDIA_GRID ? (
            <>
              <ImageField
                label="Media"
                value={item.imageUrl}
                onChange={(value) => updateItem(item.id, 'imageUrl', value)}
                placeholder="https://example.com/chat.png or /uploads/sections/chat.png"
                hint="Upload screenshots, UGC, or social proof images."
              />
            </>
          ) : null}

          {type === HOMEPAGE_SECTION_TYPES.TESTIMONIALS ? (
            <>
              <Field label="Quote"><TextArea value={item.quote} onChange={(value) => updateItem(item.id, 'quote', value)} placeholder="Best shopping experience ever." /></Field>
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Author"><TextInput value={item.author} onChange={(value) => updateItem(item.id, 'author', value)} placeholder="Jane Doe" /></Field>
                <Field label="Role"><TextInput value={item.role} onChange={(value) => updateItem(item.id, 'role', value)} placeholder="Verified buyer" /></Field>
                <Field label="Rating"><TextInput type="number" value={item.rating} onChange={(value) => updateItem(item.id, 'rating', value)} placeholder="5" /></Field>
              </div>
              <ImageField
                label="Avatar / image"
                value={item.imageUrl}
                onChange={(value) => updateItem(item.id, 'imageUrl', value)}
                placeholder="https://example.com/avatar.png or /uploads/sections/avatar.png"
                hint="Paste an avatar URL or upload an image."
              />
            </>
          ) : null}

          <button type="button" onClick={() => removeItem(item.id)} className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">
            Remove item
          </button>
        </div>
      ))}
    </div>
  );
};

const AdminSectionManagement = () => {
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [formData, setFormData] = useState(createFormState());
  const sortedSections = useMemo(
    () => [...sections].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)),
    [sections]
  );

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    try {
      setIsLoading(true);
      const response = await sectionAPI.getSections();
      setSections(getItems(response).map(normalizeHomepageSection));
    } catch (error) {
      console.error('Error loading sections:', error);
      toast.error('Failed to load sections');
    } finally {
      setIsLoading(false);
    }
  };

  const updateContent = (field, value) => {
    setFormData((current) => ({ ...current, content: { ...current.content, [field]: value } }));
  };

  const addItem = () => {
    setFormData((current) => ({
      ...current,
      content: { ...current.content, items: [...(current.content.items || []), createHomepageSectionItem(current.type)] },
    }));
  };

  const updateItem = (itemId, field, value) => {
    setFormData((current) => ({
      ...current,
      content: {
        ...current.content,
        items: (current.content.items || []).map((item) => (item.id === itemId ? { ...item, [field]: value } : item)),
      },
    }));
  };

  const removeItem = (itemId) => {
    setFormData((current) => ({
      ...current,
      content: {
        ...current.content,
        items: (current.content.items || []).filter((item) => item.id !== itemId),
      },
    }));
  };

  const onTypeChange = (nextType) => {
    setFormData((current) => ({
      ...current,
      type: nextType,
      content: normalizeHomepageSectionContent(nextType, current.content),
    }));
  };

  const openCreate = () => {
    setEditingSection(null);
    setFormData(createFormState());
    setShowModal(true);
  };

  const openEdit = (section) => {
    setEditingSection(section);
    setFormData(toFormState(section));
    setShowModal(true);
  };

  const saveSection = async (event) => {
    event.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Section name is required');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      slug: formData.slug.trim(),
      description: formData.description.trim(),
      icon: formData.icon.trim(),
      type: formData.type,
      sortOrder: Number(formData.sortOrder) || 0,
      isActive: formData.isActive,
      content: normalizeHomepageSectionContent(formData.type, formData.content),
    };

    try {
      if (editingSection) {
        await sectionAPI.updateSection(editingSection.id, payload);
        toast.success('Section updated successfully');
      } else {
        await sectionAPI.createSection(payload);
        toast.success('Section created successfully');
      }

      setShowModal(false);
      setEditingSection(null);
      setFormData(createFormState());
      loadSections();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to save section');
    }
  };

  const deleteSection = async (sectionId) => {
    if (!window.confirm('Delete this homepage section?')) return;
    try {
      await sectionAPI.deleteSection(sectionId);
      toast.success('Section deleted successfully');
      loadSections();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete section');
    }
  };

  const toggleSection = async (section) => {
    try {
      await sectionAPI.updateSection(section.id, { isActive: !section.isActive });
      toast.success('Section status updated');
      loadSections();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update section status');
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-violet-600" />
          <p className="text-slate-600">Loading sections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white p-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-950">Section Management</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">
              Manage all homepage body sections here, not just product rows.
            </p>
          </div>
          <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white">
            <Plus className="h-4 w-4" />
            Add Section
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sortedSections.map((section) => (
            <div key={section.id} className="rounded-[28px] border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                    {section.icon && isImageValue(section.icon) ? (
                      <img src={resolveMediaUrl(section.icon)} alt={section.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{section.icon || 'SEC'}</span>
                    )}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-slate-950">{section.name}</h2>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">{getHomepageSectionTypeLabel(section.type)}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{section.slug}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleSection(section)}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${section.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}
                >
                  {section.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>

              <p className="mt-4 text-sm text-slate-600">{section.description || 'No description provided yet.'}</p>
              <div className="mt-4 rounded-2xl bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Summary</p>
                <p className="mt-1 text-sm text-slate-700">{summarizeSection(section)}</p>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                <span>Sort: {section.sortOrder}</span>
                <span>Tone: {section.content?.tone || 'slate'}</span>
              </div>

              <div className="mt-5 flex gap-2">
                <button type="button" onClick={() => openEdit(section)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
                <button type="button" onClick={() => deleteSection(section.id)} className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/45 p-4 lg:items-center">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-[32px] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-950">{editingSection ? 'Edit Homepage Section' : 'Add Homepage Section'}</h2>
                <p className="mt-1 text-sm text-slate-500">Configure the section structure and the content it should render.</p>
              </div>
              <button type="button" onClick={() => setShowModal(false)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={saveSection} className="max-h-[calc(92vh-82px)] overflow-y-auto px-6 py-6">
              <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="space-y-6">
                  <div className="rounded-[24px] border border-slate-200 p-5">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Name"><TextInput value={formData.name} onChange={(value) => setFormData((current) => ({ ...current, name: value }))} placeholder="What Our Customers Say" /></Field>
                      <Field label="Type" hint={HOMEPAGE_SECTION_TYPE_OPTIONS.find((option) => option.value === formData.type)?.description}>
                        <select value={formData.type} onChange={(event) => onTypeChange(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10">
                          {HOMEPAGE_SECTION_TYPE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                      </Field>
                    </div>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <Field label="Slug" hint="Used as the homepage section identifier."><TextInput value={formData.slug} onChange={(value) => setFormData((current) => ({ ...current, slug: value }))} placeholder="customer-testimonials" /></Field>
                      <Field label="Sort Order"><TextInput type="number" value={formData.sortOrder} onChange={(value) => setFormData((current) => ({ ...current, sortOrder: value }))} placeholder="80" /></Field>
                    </div>
                    <div className="mt-4">
                      <Field label="Description"><TextArea value={formData.description} onChange={(value) => setFormData((current) => ({ ...current, description: value }))} placeholder="Explain the section purpose." rows={4} /></Field>
                    </div>
                    <label className="mt-4 inline-flex items-center gap-3 text-sm text-slate-700">
                      <input type="checkbox" checked={formData.isActive} onChange={(event) => setFormData((current) => ({ ...current, isActive: event.target.checked }))} className="h-4 w-4 rounded text-violet-600" />
                      Active
                    </label>
                  </div>

                  <div className="rounded-[24px] border border-slate-200 p-5">
                    <div className="grid gap-4 md:grid-cols-2">
                      <ImageField
                        label="Section icon / image"
                        value={formData.icon}
                        onChange={(value) => setFormData((current) => ({ ...current, icon: value }))}
                        placeholder="https://example.com/icon.png, /uploads/sections/icon.png, or a short text label"
                        hint="Use a real image URL/path or leave a short text token like TESTI."
                      />
                      <div className="space-y-4">
                        <Field label="Badge / eyebrow"><TextInput value={formData.content.badge} onChange={(value) => updateContent('badge', value)} placeholder="Testimonials" /></Field>
                        <Field label="Tone">
                          <select value={formData.content.tone} onChange={(event) => updateContent('tone', event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10">
                            {HOMEPAGE_SECTION_TONE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                          </select>
                        </Field>
                        {(formData.type === HOMEPAGE_SECTION_TYPES.PROMO || formData.type === HOMEPAGE_SECTION_TYPES.CTA) && (
                          <ImageField
                            label="Background image"
                            value={formData.content.imageUrl}
                            onChange={(value) => updateContent('imageUrl', value)}
                            placeholder="https://example.com/background.jpg or /uploads/sections/background.jpg"
                            hint="Paste an image URL/path or upload a background image."
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {[HOMEPAGE_SECTION_TYPES.PRODUCT_GRID, HOMEPAGE_SECTION_TYPES.PROMO, HOMEPAGE_SECTION_TYPES.CTA].includes(formData.type) && (
                    <div className="rounded-[24px] border border-slate-200 p-5">
                      <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Primary Button Text"><TextInput value={formData.content.buttonText} onChange={(value) => updateContent('buttonText', value)} placeholder="Shop now" /></Field>
                        <Field label="Primary Button Link"><TextInput value={formData.content.buttonLink} onChange={(value) => updateContent('buttonLink', value)} placeholder="/products" /></Field>
                        {[HOMEPAGE_SECTION_TYPES.PROMO, HOMEPAGE_SECTION_TYPES.CTA].includes(formData.type) && (
                          <>
                            <Field label="Secondary Button Text"><TextInput value={formData.content.secondaryButtonText} onChange={(value) => updateContent('secondaryButtonText', value)} placeholder="Learn more" /></Field>
                            <Field label="Secondary Button Link"><TextInput value={formData.content.secondaryButtonLink} onChange={(value) => updateContent('secondaryButtonLink', value)} placeholder="/about" /></Field>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  <ItemsEditor type={formData.type} items={formData.content.items || []} addItem={addItem} updateItem={updateItem} removeItem={removeItem} />
                </div>

                <div className="space-y-6">
                  <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Preview Summary</p>
                    <h3 className="mt-2 text-xl font-semibold text-slate-950">{formData.name || 'Untitled section'}</h3>
                    <p className="mt-1 text-sm text-slate-500">{getHomepageSectionTypeLabel(formData.type)}</p>
                    <p className="mt-4 text-sm text-slate-600">{formData.description || 'Add a description to explain this section.'}</p>
                    <div className="mt-4 rounded-2xl bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Render mode</p>
                      <p className="mt-1 text-sm text-slate-700">{summarizeSection({ ...formData, content: normalizeHomepageSectionContent(formData.type, formData.content) })}</p>
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-slate-200 bg-white p-5">
                    <p className="text-sm font-semibold text-slate-950">Announcement Review</p>
                    <p className="mt-2 text-sm text-slate-600">
                      Section-targeted announcements can now attach to every homepage section type, not only product grids.
                    </p>
                  </div>

                  {formData.type === HOMEPAGE_SECTION_TYPES.PRODUCT_GRID && (
                    <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-5">
                      <p className="text-sm font-semibold text-amber-900">Product section guard</p>
                      <p className="mt-2 text-sm text-amber-800">
                        Product assignments follow this slug. Changing the slug now updates linked products automatically; converting it to a non-product section is blocked until products are reassigned.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-medium text-slate-700">
                  Cancel
                </button>
                <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white">
                  <Save className="h-4 w-4" />
                  {editingSection ? 'Update section' : 'Create section'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSectionManagement;
