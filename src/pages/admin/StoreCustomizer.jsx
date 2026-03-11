import { useState, useEffect } from 'react';
import {
  Palette, Layout, Type, Image, Monitor, Smartphone, Tablet,
  Eye, Save, RotateCcw, Download, Upload, Sparkles, Zap,
  Grid, List, Columns, Square, Circle, Triangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const StoreCustomizer = () => {
  const [activeSection, setActiveSection] = useState('theme');
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [customization, setCustomization] = useState({
    theme: {
      primaryColor: '#6366f1',
      secondaryColor: '#64748b',
      accentColor: '#f59e0b',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      borderRadius: 12,
      fontFamily: 'Inter',
      buttonStyle: 'rounded',
      shadowStyle: 'soft'
    },
    layout: {
      headerStyle: 'modern',
      navigationStyle: 'horizontal',
      footerStyle: 'detailed',
      productLayout: 'grid',
      sidebarPosition: 'left',
      containerWidth: 'wide'
    },
    branding: {
      logoUrl: '',
      faviconUrl: '',
      brandName: 'My Store',
      tagline: 'Quality products for everyone',
      heroImage: '',
      brandColors: ['#6366f1', '#f59e0b', '#10b981']
    },
    homepage: {
      heroSection: true,
      featuredProducts: true,
      categories: true,
      testimonials: false,
      newsletter: true,
      blog: false
    }
  });

  const colorPresets = [
    { name: 'Violet', colors: { primary: '#6366f1', accent: '#f59e0b', secondary: '#64748b' } },
    { name: 'Emerald', colors: { primary: '#10b981', accent: '#f59e0b', secondary: '#64748b' } },
    { name: 'Rose', colors: { primary: '#f43f5e', accent: '#f59e0b', secondary: '#64748b' } },
    { name: 'Blue', colors: { primary: '#3b82f6', accent: '#f59e0b', secondary: '#64748b' } },
    { name: 'Purple', colors: { primary: '#8b5cf6', accent: '#f59e0b', secondary: '#64748b' } },
    { name: 'Teal', colors: { primary: '#14b8a6', accent: '#f59e0b', secondary: '#64748b' } }
  ];

  const fontOptions = [
    { name: 'Inter', value: 'Inter, sans-serif' },
    { name: 'Poppins', value: 'Poppins, sans-serif' },
    { name: 'Roboto', value: 'Roboto, sans-serif' },
    { name: 'Open Sans', value: 'Open Sans, sans-serif' },
    { name: 'Montserrat', value: 'Montserrat, sans-serif' },
    { name: 'Playfair', value: 'Playfair Display, serif' }
  ];

  const handleChange = (section, field, value) => {
    setCustomization(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const applyColorPreset = (preset) => {
    setCustomization(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        primaryColor: preset.colors.primary,
        accentColor: preset.colors.accent,
        secondaryColor: preset.colors.secondary
      }
    }));
    setHasChanges(true);
    toast.success(`Applied ${preset.name} color scheme`);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setHasChanges(false);
      toast.success('Store customization saved successfully!');
    } catch (error) {
      toast.error('Failed to save customization');
    } finally {
      setIsLoading(false);
    }
  };

  const sections = [
    { id: 'theme', label: 'Theme & Colors', icon: Palette },
    { id: 'layout', label: 'Layout & Structure', icon: Layout },
    { id: 'branding', label: 'Branding & Assets', icon: Image },
    { id: 'homepage', label: 'Homepage Sections', icon: Grid }
  ];

  const PreviewFrame = () => (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg">
      <div className="bg-slate-100 px-4 py-3 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 bg-rose-400 rounded-full"></div>
          <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
          <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
        </div>
        <div className="flex-1 text-center">
          <div className="bg-white rounded-lg px-3 py-1 text-xs text-slate-600 inline-block">
            {customization.branding.brandName}.com
          </div>
        </div>
        <div className="flex gap-1">
          {['desktop', 'tablet', 'mobile'].map(device => (
            <button
              key={device}
              onClick={() => setPreviewDevice(device)}
              className={`p-2 rounded-lg transition-colors ${
                previewDevice === device 
                  ? 'bg-violet-100 text-violet-600' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {device === 'desktop' && <Monitor className="h-4 w-4" />}
              {device === 'tablet' && <Tablet className="h-4 w-4" />}
              {device === 'mobile' && <Smartphone className="h-4 w-4" />}
            </button>
          ))}
        </div>
      </div>
      
      <div className={`transition-all duration-300 ${
        previewDevice === 'mobile' ? 'max-w-sm mx-auto' :
        previewDevice === 'tablet' ? 'max-w-2xl mx-auto' : 'w-full'
      }`}>
        <div 
          className="min-h-96"
          style={{ 
            fontFamily: customization.theme.fontFamily,
            backgroundColor: customization.theme.backgroundColor,
            color: customization.theme.textColor
          }}
        >
          {/* Header */}
          <div 
            className="p-4 border-b"
            style={{ backgroundColor: customization.theme.primaryColor }}
          >
            <div className="flex items-center justify-between">
              <h1 className="text-white font-bold text-lg">
                {customization.branding.brandName}
              </h1>
              <div className="flex gap-4 text-white text-sm">
                <span>Home</span>
                <span>Products</span>
                <span>About</span>
                <span>Contact</span>
              </div>
            </div>
          </div>

          {/* Hero Section */}
          {customization.homepage.heroSection && (
            <div className="p-8 text-center" style={{ backgroundColor: customization.theme.backgroundColor }}>
              <h2 className="text-2xl font-bold mb-2">{customization.branding.tagline}</h2>
              <p className="text-slate-600 mb-4">Discover amazing products at great prices</p>
              <button 
                className="px-6 py-3 text-white font-medium rounded-lg"
                style={{ 
                  backgroundColor: customization.theme.accentColor,
                  borderRadius: `${customization.theme.borderRadius}px`
                }}
              >
                Shop Now
              </button>
            </div>
          )}

          {/* Products Grid */}
          {customization.homepage.featuredProducts && (
            <div className="p-6">
              <h3 className="font-bold text-lg mb-4">Featured Products</h3>
              <div className={`grid gap-4 ${
                customization.layout.productLayout === 'grid' ? 'grid-cols-3' : 'grid-cols-1'
              }`}>
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white border rounded-lg p-3">
                    <div className="bg-slate-200 h-24 rounded mb-2"></div>
                    <p className="font-medium text-sm">Product {i}</p>
                    <p className="text-slate-600 text-xs">$99.99</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Store Customizer</h1>
            <p className="text-slate-500 mt-1">Customize your store's appearance and layout</p>
          </div>
          <div className="flex items-center gap-3">
            {hasChanges && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-sm text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Unsaved changes
              </motion.span>
            )}
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading || !hasChanges}
              className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium rounded-xl shadow-lg shadow-violet-500/25 text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-all"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-6">
          {/* Section Navigation */}
          <div className="bg-white rounded-2xl border border-slate-100 p-2">
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 ${
                    activeSection === section.id
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <section.icon className="h-5 w-5" />
                  <span className="font-medium text-sm">{section.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Section Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-2xl border border-slate-100 p-6"
            >
              {activeSection === 'theme' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-4">Color Presets</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {colorPresets.map(preset => (
                        <button
                          key={preset.name}
                          onClick={() => applyColorPreset(preset)}
                          className="p-3 border border-slate-200 rounded-xl hover:border-violet-400 transition-all text-left"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex gap-1">
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.colors.primary }}></div>
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.colors.accent }}></div>
                            </div>
                            <span className="text-sm font-medium">{preset.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <ColorPicker
                      label="Primary Color"
                      value={customization.theme.primaryColor}
                      onChange={(value) => handleChange('theme', 'primaryColor', value)}
                    />
                    <ColorPicker
                      label="Accent Color"
                      value={customization.theme.accentColor}
                      onChange={(value) => handleChange('theme', 'accentColor', value)}
                    />
                    <ColorPicker
                      label="Background"
                      value={customization.theme.backgroundColor}
                      onChange={(value) => handleChange('theme', 'backgroundColor', value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Font Family</label>
                    <select
                      value={customization.theme.fontFamily}
                      onChange={(e) => handleChange('theme', 'fontFamily', e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none"
                    >
                      {fontOptions.map(font => (
                        <option key={font.name} value={font.value}>{font.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Border Radius: {customization.theme.borderRadius}px
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="24"
                      value={customization.theme.borderRadius}
                      onChange={(e) => handleChange('theme', 'borderRadius', parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                    />
                  </div>
                </div>
              )}

              {activeSection === 'branding' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Brand Name</label>
                    <input
                      type="text"
                      value={customization.branding.brandName}
                      onChange={(e) => handleChange('branding', 'brandName', e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Tagline</label>
                    <input
                      type="text"
                      value={customization.branding.tagline}
                      onChange={(e) => handleChange('branding', 'tagline', e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Logo URL</label>
                    <input
                      type="url"
                      value={customization.branding.logoUrl}
                      onChange={(e) => handleChange('branding', 'logoUrl', e.target.value)}
                      placeholder="https://..."
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Preview */}
        <div className="lg:col-span-2">
          <div className="sticky top-6">
            <PreviewFrame />
          </div>
        </div>
      </div>
    </div>
  );
};

const ColorPicker = ({ label, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-16 rounded-lg border border-slate-200 cursor-pointer"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none font-mono text-sm uppercase"
      />
    </div>
  </div>
);

export default StoreCustomizer;