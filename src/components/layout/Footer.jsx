import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Facebook,
  Heart,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Store,
  Twitter,
  Youtube,
} from 'lucide-react';
import { useStoreSettingsStore } from '../../store';
import { formatStoreAddress, isExternalStoreLink } from '../../utils/storeSettings';
import { cn } from '../../utils';
import { getButtonRadiusClass, resolveFooterLayout } from '../../utils/themeHelpers';

const SmartStoreLink = ({ to, newTab = false, className, children, ...props }) => {
  if (isExternalStoreLink(to)) {
    return (
      <a href={to} className={className} target={newTab ? '_blank' : undefined} rel={newTab ? 'noreferrer' : undefined} {...props}>
        {children}
      </a>
    );
  }

  return (
    <Link to={to} className={className} target={newTab ? '_blank' : undefined} rel={newTab ? 'noreferrer' : undefined} {...props}>
      {children}
    </Link>
  );
};
const socialStyles = {
  Facebook: "hover:bg-[#1877F2] hover:border-[#1877F2] hover:text-white",
  Instagram:
    "hover:bg-gradient-to-tr hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7] hover:border-transparent hover:text-white",
  "Twitter / X": "hover:bg-black hover:border-black hover:text-white",
  YouTube: "hover:bg-[#FF0000] hover:border-[#FF0000] hover:text-white",
  TikTok: "hover:bg-[#000000] hover:border-[#000000] hover:text-white",
  Pinterest: "hover:bg-[#E60023] hover:border-[#E60023] hover:text-white",
};

const DARK_FOOTER_LAYOUTS = new Set([
  'detailed',
  'simple',
  'editorial',
  'card',
  'minimal-dark',
  'luxe',
  'split-dark',
  'showcase',
]);

const COMPACT_FOOTER_LAYOUTS = new Set([
  'minimal',
  'compact',
  'stacked',
  'pill',
  'centered',
]);

const renderSocialIcon = (social) => {
  if (social.icon) {
    const Icon = social.icon;
    return <Icon className="h-4 w-4" />;
  }

  return (
    <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">
      {social.shortLabel || social.label.slice(0, 1)}
    </span>
  );
};

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const store = useStoreSettingsStore((state) => state.store);
  const theme = useStoreSettingsStore((state) => state.theme);
  const footerLayout = resolveFooterLayout(theme?.footerLayout || 'detailed');
  const buttonRadiusClass = getButtonRadiusClass(theme?.buttonStyle);
  const isDarkFooter = DARK_FOOTER_LAYOUTS.has(footerLayout);
  const isCompactFooter = COMPACT_FOOTER_LAYOUTS.has(footerLayout);
  const storeName = store.name || 'Store';
  const address = formatStoreAddress(store.address);
  const currentYear = new Date().getFullYear();
  const footerConfig = store.footer || {};
  const legalLinks = (footerConfig.legalLinks || []).filter((link) => link.isVisible !== false);
  const linkGroups = (footerConfig.linkGroups || []).filter((group) => group.links?.length);
  const tagline = footerConfig.tagline || store.description || 'Discover curated products, secure checkout, and reliable support.';
  const bottomText = footerConfig.bottomText || 'All rights reserved.';
  const showSocialLinks = footerConfig.showSocialLinks !== false;
  const showContactInfo = footerConfig.showContactInfo !== false;
  const showLegalLinks = footerConfig.showLegalLinks !== false;

  const socialLinks = [
    { icon: Facebook, href: store.socialLinks?.facebook, label: 'Facebook' },
    { icon: Twitter, href: store.socialLinks?.twitter, label: 'Twitter' },
    { icon: Instagram, href: store.socialLinks?.instagram, label: 'Instagram' },
    { icon: Youtube, href: store.socialLinks?.youtube, label: 'YouTube' },
    { href: store.socialLinks?.tiktok, label: 'TikTok', shortLabel: 'TT' },
    { href: store.socialLinks?.pinterest, label: 'Pinterest', shortLabel: 'P' },
  ].filter((item) => Boolean(item.href));

  const handleNewsletterSubmit = (event) => {
    event.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
    window.setTimeout(() => setSubscribed(false), 3000);
  };

  const brandBlock = (
    <BrandBlock
      store={store}
      storeName={storeName}
      tagline={tagline}
      socialLinks={showSocialLinks ? socialLinks : []}
      footerLayout={footerLayout}
      dark={isDarkFooter}
    />
  );

  const contactBlock = (
    <ContactBlock
      address={address}
      email={store.email}
      phone={store.phone}
      showContactInfo={showContactInfo}
      dark={isDarkFooter}
    />
  );

  const groupsBlock = (
    <>
      {linkGroups.map((group) => (
        <FooterLinkColumn
          key={group.id}
          title={group.title}
          links={group.links}
          dark={isDarkFooter}
          compact={isCompactFooter}
        />
      ))}
    </>
  );

  const legalBlock = showLegalLinks && legalLinks.length > 0 && (
    <div className={cn(
      'flex flex-wrap gap-4',
      isDarkFooter ? 'text-slate-400' : 'text-slate-500'
    )}>
      {legalLinks.map((link) => (
        <SmartStoreLink
          key={link.id}
          to={link.to}
          newTab={link.newTab}
          className={cn(
            'text-sm transition-colors',
            isDarkFooter ? 'hover:text-white' : 'hover:text-primary-700'
          )}
        >
          {link.label}
        </SmartStoreLink>
      ))}
    </div>
  );

  if (footerLayout === 'minimal') {
    return (
      <footer className="border-t border-slate-200 bg-white">
        <div className="container mx-auto flex flex-col gap-4 px-4 py-6 lg:px-8 md:flex-row md:items-center md:justify-between">
          {brandBlock}
          {legalBlock}
          <p className="flex items-center gap-1 text-sm text-slate-500">
            {'\u00A9'} {currentYear} {storeName}. {bottomText}
            <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
          </p>
        </div>
      </footer>
    );
  }


  if (footerLayout === 'minimal-dark') {
    return (
      <footer className="border-t border-white/10 bg-slate-950 text-white">
        <div className="container mx-auto flex flex-col gap-4 px-4 py-6 lg:px-8 md:flex-row md:items-center md:justify-between">
          {brandBlock}
          {legalBlock}
          <p className="flex items-center gap-1 text-sm text-slate-400">
            {'©'} {currentYear} {storeName}. {bottomText}
            <Heart className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          </p>
        </div>
      </footer>
    );
  }

  if (footerLayout === 'compact') {
    return (
      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="container mx-auto space-y-5 px-4 py-8 lg:px-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            {brandBlock}
            <div className="grid gap-6 md:grid-cols-2">
              {groupsBlock}
            </div>
          </div>
          <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
            <p>{'\u00A9'} {currentYear} {storeName}. {bottomText}</p>
            {legalBlock}
          </div>
        </div>
      </footer>
    );
  }


  if (footerLayout === 'newsletter') {
    return (
      <footer className="bg-slate-50">
        <div className="container mx-auto space-y-10 px-4 py-12 lg:px-8">
          {footerConfig.newsletterEnabled !== false && (
            <NewsletterCard
              title={footerConfig.newsletterTitle}
              description={footerConfig.newsletterDescription}
              email={email}
              setEmail={setEmail}
              subscribed={subscribed}
              handleNewsletterSubmit={handleNewsletterSubmit}
              buttonRadiusClass={buttonRadiusClass}
            />
          )}
          <div className="grid gap-8 lg:grid-cols-[1.1fr_repeat(3,minmax(0,1fr))]">
            {brandBlock}
            {groupsBlock}
            {contactBlock}
          </div>
          <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
            <p>{'©'} {currentYear} {storeName}. {bottomText}</p>
            {legalBlock}
          </div>
        </div>
      </footer>
    );
  }

  if (footerLayout === 'centered') {
    return (
      <footer className="border-t border-slate-200 bg-white">
        <div className="container mx-auto space-y-8 px-4 py-12 text-center lg:px-8">
          <div className="mx-auto max-w-2xl">{brandBlock}</div>
          {footerConfig.newsletterEnabled !== false && (
            <div className="mx-auto max-w-3xl">
              <NewsletterCard
                title={footerConfig.newsletterTitle}
                description={footerConfig.newsletterDescription}
                email={email}
                setEmail={setEmail}
                subscribed={subscribed}
                handleNewsletterSubmit={handleNewsletterSubmit}
                buttonRadiusClass={buttonRadiusClass}
              />
            </div>
          )}
          <div className="flex flex-wrap items-start justify-center gap-8">
            {groupsBlock}
          </div>
          <div className="mx-auto max-w-md">{contactBlock}</div>
          <div className="space-y-3 border-t border-slate-200 pt-6 text-sm text-slate-500">
            <p>{'©'} {currentYear} {storeName}. {bottomText}</p>
            <div className="flex justify-center">{legalBlock}</div>
          </div>
        </div>
      </footer>
    );
  }

  if (footerLayout === 'pill') {
    return (
      <footer className="bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-[1400px] rounded-[48px] border border-slate-200 bg-white shadow-lg">
          <div className="container mx-auto space-y-8 px-6 py-10 lg:px-10">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_repeat(3,minmax(0,1fr))]">
              {brandBlock}
              {groupsBlock}
              {contactBlock}
            </div>
            <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
              <p>{'©'} {currentYear} {storeName}. {bottomText}</p>
              {legalBlock}
            </div>
          </div>
        </div>
      </footer>
    );
  }

  if (footerLayout === 'boxed') {
    return (
      <footer className="bg-slate-100 px-4 py-12">
        <div className="mx-auto max-w-[1400px] rounded-[36px] border border-slate-200 bg-white shadow-xl">
          <div className="container mx-auto space-y-8 px-6 py-10 lg:px-10">
            {footerConfig.newsletterEnabled !== false && (
              <NewsletterCard
                title={footerConfig.newsletterTitle}
                description={footerConfig.newsletterDescription}
                email={email}
                setEmail={setEmail}
                subscribed={subscribed}
                handleNewsletterSubmit={handleNewsletterSubmit}
                buttonRadiusClass={buttonRadiusClass}
              />
            )}
            <div className="grid gap-8 lg:grid-cols-[1.2fr_repeat(3,minmax(0,1fr))]">
              {brandBlock}
              {groupsBlock}
              {contactBlock}
            </div>
            <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
              <p>{'©'} {currentYear} {storeName}. {bottomText}</p>
              {legalBlock}
            </div>
          </div>
        </div>
      </footer>
    );
  }

  if (footerLayout === 'simple') {
    return (
      <footer className="border-t border-slate-200 bg-slate-950 text-white">
        <div className="container mx-auto space-y-10 px-4 py-12 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            {brandBlock}
            <div className="space-y-5">{groupsBlock}</div>
            {contactBlock}
          </div>
          <div className="flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
            <p>{'\u00A9'} {currentYear} {storeName}. {bottomText}</p>
            {legalBlock}
          </div>
        </div>
      </footer>
    );
  }

  if (footerLayout === 'columns') {
    return (
      <footer className="border-t border-slate-200 bg-white">
        <div className="container mx-auto space-y-8 px-4 py-12 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_repeat(3,minmax(0,1fr))]">
            {brandBlock}
            {groupsBlock}
            {contactBlock}
          </div>
          <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
            <p>{'\u00A9'} {currentYear} {storeName}. {bottomText}</p>
            {legalBlock}
          </div>
        </div>
      </footer>
    );
  }

  if (footerLayout === 'grid') {
    return (
      <footer className="bg-slate-100">
        <div className="container mx-auto space-y-8 px-4 py-12 lg:px-8">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <FooterCard>{brandBlock}</FooterCard>
            {linkGroups.map((group) => (
              <FooterCard key={group.id}>
                <FooterLinkColumn title={group.title} links={group.links} />
              </FooterCard>
            ))}
            <FooterCard>{contactBlock}</FooterCard>
          </div>
          <div className="flex flex-col gap-3 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
            <p>{'\u00A9'} {currentYear} {storeName}. {bottomText}</p>
            {legalBlock}
          </div>
        </div>
      </footer>
    );
  }

  if (footerLayout === 'stacked') {
    return (
      <footer className="border-t border-slate-200 bg-white">
        <div className="container mx-auto space-y-8 px-4 py-12 text-center lg:px-8">
          <div className="mx-auto max-w-2xl">{brandBlock}</div>
          <div className="flex flex-wrap items-start justify-center gap-8">
            {groupsBlock}
          </div>
          <div className="mx-auto max-w-md">{contactBlock}</div>
          <div className="space-y-3 border-t border-slate-200 pt-6 text-sm text-slate-500">
            <p>{'\u00A9'} {currentYear} {storeName}. {bottomText}</p>
            <div className="flex justify-center">{legalBlock}</div>
          </div>
        </div>
      </footer>
    );
  }

  if (footerLayout === 'card') {
    return (
      <footer className="bg-slate-950 px-4 pb-4 pt-12 lg:px-8">
        <div className="mx-auto max-w-[1400px] rounded-[32px] border border-white/10 bg-slate-900 text-white shadow-2xl shadow-slate-950/30">
          <div className="container mx-auto space-y-10 px-6 py-10 lg:px-10">
            {footerConfig.newsletterEnabled !== false && (
              <NewsletterCard
                title={footerConfig.newsletterTitle}
                description={footerConfig.newsletterDescription}
                email={email}
                setEmail={setEmail}
                subscribed={subscribed}
                handleNewsletterSubmit={handleNewsletterSubmit}
                buttonRadiusClass={buttonRadiusClass}
                dark
              />
            )}
            <div className="grid gap-5 lg:grid-cols-[1.2fr_repeat(3,minmax(0,1fr))]">
              <FooterCard dark>{brandBlock}</FooterCard>
              {linkGroups.map((group) => (
                <FooterCard key={group.id} dark>
                  <FooterLinkColumn title={group.title} links={group.links} dark />
                </FooterCard>
              ))}
              <FooterCard dark>{contactBlock}</FooterCard>
            </div>
            <div className="flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
              <p>{'\u00A9'} {currentYear} {storeName}. {bottomText}</p>
              {legalBlock}
            </div>
          </div>
        </div>
      </footer>
    );
  }

  if (footerLayout === 'split') {
    return (
      <footer className="border-t border-slate-200 bg-white">
        <div className="container mx-auto space-y-8 px-4 py-12 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1.4fr]">
            <div className="space-y-6">
              {brandBlock}
              {contactBlock}
            </div>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {groupsBlock}
            </div>
          </div>
          <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
            <p>{'\u00A9'} {currentYear} {storeName}. {bottomText}</p>
            {legalBlock}
          </div>
        </div>
      </footer>
    );
  }


  if (footerLayout === 'split-dark') {
    return (
      <footer className="border-t border-white/10 bg-slate-950 text-white">
        <div className="container mx-auto space-y-8 px-4 py-12 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1.4fr]">
            <div className="space-y-6">
              {brandBlock}
              {contactBlock}
            </div>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {groupsBlock}
            </div>
          </div>
          <div className="flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
            <p>{'©'} {currentYear} {storeName}. {bottomText}</p>
            {legalBlock}
          </div>
        </div>
      </footer>
    );
  }

  if (footerLayout === 'showcase') {
    return (
      <footer className="bg-slate-950 text-white">
        <div className="container mx-auto space-y-10 px-4 py-12 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
            <div className="space-y-6">
              {brandBlock}
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Featured</p>
                <h3 className="mt-3 text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                  Featured Collections
                </h3>
                <p className="mt-2 text-sm text-slate-300">{tagline}</p>
                <Link
                  to="/products"
                  className="mt-4 inline-flex w-fit items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-100"
                >
                  Explore deals
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {groupsBlock}
            </div>
          </div>
          <div className="flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
            <p>{'©'} {currentYear} {storeName}. {bottomText}</p>
            {legalBlock}
          </div>
        </div>
      </footer>
    );
  }

  if (footerLayout === 'editorial') {
    return (
      <footer className="bg-stone-950 text-white">
        <div className="container mx-auto space-y-10 px-4 py-14 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-end">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.3em] text-stone-400">Editorial Footer</p>
              <h2 className="max-w-2xl text-4xl font-bold tracking-tight text-white" style={{ fontFamily: 'var(--font-display)' }}>
                {storeName}
              </h2>
              <p className="max-w-xl text-sm leading-relaxed text-stone-300">{tagline}</p>
            </div>
            {footerConfig.newsletterEnabled !== false && (
              <NewsletterCard
                title={footerConfig.newsletterTitle}
                description={footerConfig.newsletterDescription}
                email={email}
                setEmail={setEmail}
                subscribed={subscribed}
                handleNewsletterSubmit={handleNewsletterSubmit}
                buttonRadiusClass={buttonRadiusClass}
                dark
              />
            )}
          </div>
          <div className="grid gap-8 lg:grid-cols-[1fr_repeat(3,minmax(0,1fr))]">
            {contactBlock}
            {groupsBlock}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-300">Follow</h3>
              {showSocialLinks && socialLinks.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {socialLinks.map((social) => (
                    <a key={social.label} href={social.href} target="_blank" rel="noreferrer" aria-label={social.label} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-stone-300 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white">
                      {renderSocialIcon(social)}
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-stone-400">Add social links in store settings to show them here.</p>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-stone-400 md:flex-row md:items-center md:justify-between">
            <p>{'\u00A9'} {currentYear} {storeName}. {bottomText}</p>
            {legalBlock}
          </div>
        </div>
      </footer>
    );
  }


  if (footerLayout === 'luxe') {
    return (
      <footer className="bg-[#0b0f1a] text-amber-50">
        <div className="container mx-auto space-y-10 px-4 py-14 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-start">
            <div className="space-y-6">
              {brandBlock}
              <div className="rounded-3xl border border-amber-400/20 bg-amber-400/5 p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-amber-200/70">Luxe Promise</p>
                <p className="mt-2 text-sm text-amber-100/80">White-glove support and curated drops for members.</p>
                <Link
                  to="/products"
                  className="mt-4 inline-flex w-fit items-center gap-2 rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-300"
                >
                  Shop the edit
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
            {footerConfig.newsletterEnabled !== false && (
              <NewsletterCard
                title={footerConfig.newsletterTitle}
                description={footerConfig.newsletterDescription}
                email={email}
                setEmail={setEmail}
                subscribed={subscribed}
                handleNewsletterSubmit={handleNewsletterSubmit}
                buttonRadiusClass={buttonRadiusClass}
                dark
              />
            )}
          </div>
          <div className="grid gap-8 lg:grid-cols-[1fr_repeat(3,minmax(0,1fr))]">
            {contactBlock}
            {groupsBlock}
          </div>
          <div className="flex flex-col gap-3 border-t border-amber-500/20 pt-6 text-sm text-amber-200/70 md:flex-row md:items-center md:justify-between">
            <p>{'©'} {currentYear} {storeName}. {bottomText}</p>
            {legalBlock}
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="relative overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-500 to-transparent" />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full blur-3xl" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary-500) 24%, transparent)' }} />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full blur-3xl" style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 20%, transparent)' }} />
      </div>

      <div className="relative container mx-auto space-y-12 px-4 pb-8 pt-16 lg:px-8">
        {footerConfig.newsletterEnabled !== false && (
          <NewsletterCard
            title={footerConfig.newsletterTitle}
            description={footerConfig.newsletterDescription}
            email={email}
            setEmail={setEmail}
            subscribed={subscribed}
            handleNewsletterSubmit={handleNewsletterSubmit}
            buttonRadiusClass={buttonRadiusClass}
            dark
            glass
          />
        )}

        <div className="grid grid-cols-2 gap-8 lg:grid-cols-5 lg:gap-12">
          <div className="col-span-2 lg:col-span-1">{brandBlock}</div>
          {groupsBlock}
          <div className="col-span-2 md:col-span-1">{contactBlock}</div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/5 pt-8 md:flex-row md:items-center md:justify-between">
          <p className="flex items-center gap-1 text-sm text-slate-500">
            {'\u00A9'} {currentYear} {storeName}. {bottomText}
            <Heart className="inline h-3.5 w-3.5 fill-rose-500 text-rose-500" />
          </p>
          {legalBlock}
        </div>
      </div>
    </footer>
  );
};

const BrandBlock = ({ store, storeName, tagline, socialLinks, footerLayout, dark = false }) => (
  <div className={cn('space-y-4', (footerLayout === 'stacked' || footerLayout === 'centered') && 'items-center text-center')}>
    <Link to="/" className="flex items-center gap-3">
      {store.logoUrl ? (
        <img src={store.logoUrl} alt={storeName} className="h-10 w-10 rounded-xl object-cover" />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ backgroundColor: 'var(--color-primary-600)' }}>
          <Store className="h-5 w-5" />
        </div>
      )}
      <span
        className={cn(
          'text-xl font-bold',
          dark ? 'text-white' : 'text-slate-900'
        )}
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {storeName}
      </span>
    </Link>

    <p className={cn(
      'text-sm leading-relaxed',
      dark ? 'text-slate-400' : 'text-slate-500'
    )}>
      {tagline}
    </p>

    {/* {socialLinks.length > 0 && (
      <div className="flex flex-wrap gap-3">
        {socialLinks.map((social) => (
          <a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noreferrer"
            aria-label={social.label}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-xl border transition-all',
              ['simple', 'detailed', 'editorial', 'card'].includes(footerLayout)
                ? 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10 hover:text-white'
                : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-900'
            )}
          >
            {renderSocialIcon(social)}
          </a>
        ))}
      </div>
    )} */}
    {socialLinks.length > 0 && (
      <div className="flex flex-wrap gap-4">
        {socialLinks.map((social) => (
          <a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noreferrer"
            aria-label={social.label}
            className={cn(
              'group relative flex h-11 w-11 items-center justify-center rounded-xl border backdrop-blur-md transition-all duration-300',
              dark ? 'border-white/10 bg-white/5 text-slate-300' : 'border-slate-200 bg-white text-slate-600',
              'hover:-translate-y-1 hover:scale-110 hover:text-white',
              socialStyles[social.label]
            )}
          >
            {/* glow effect */}
            <span className="absolute inset-0 rounded-xl opacity-0 blur-md transition-all duration-300 group-hover:opacity-50 bg-current"></span>

            {/* icon */}
            <span className="relative z-10 transition-transform duration-300 group-hover:rotate-6">
              {renderSocialIcon(social)}
            </span>

            {/* tooltip */}
            <span className="pointer-events-none absolute -top-9 rounded-md bg-black/80 px-2 py-1 text-xs text-white opacity-0 transition-all duration-200 group-hover:opacity-100">
              {social.label}
            </span>
          </a>
        ))}
      </div>
    )}
  </div>
);

const FooterLinkColumn = ({ title, links = [], dark = false, compact = false }) => (
  <div className="space-y-4">
    <h3 className={cn('text-sm font-semibold uppercase tracking-[0.18em]', dark ? 'text-slate-300' : 'text-slate-700')}>
      {title}
    </h3>
    <ul className={cn(compact ? 'space-y-2' : 'space-y-2.5')}>
      {links.filter((link) => link.isVisible !== false).map((link) => (
        <li key={link.id}>
          <SmartStoreLink
            to={link.to}
            newTab={link.newTab}
            className={cn(
              'group flex items-center gap-1 text-sm transition-colors',
              dark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-primary-700'
            )}
          >
            <ArrowRight className="h-3 w-3 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
            <span>{link.label}</span>
          </SmartStoreLink>
        </li>
      ))}
    </ul>
  </div>
);

const ContactBlock = ({ address, email, phone, showContactInfo, dark = false }) => {
  if (!showContactInfo) return null;

  return (
    <div className="space-y-4">
      <h3 className={cn('text-sm font-semibold uppercase tracking-[0.18em]', dark ? 'text-slate-300' : 'text-slate-700')}>
        Contact
      </h3>
      <ul className="space-y-3">
        {email && (
          <li className={cn('flex items-center gap-3 text-sm', dark ? 'text-slate-400' : 'text-slate-500')}>
            <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', dark ? 'bg-white/5' : 'bg-slate-100')}>
              <Mail className="h-3.5 w-3.5" />
            </div>
            <span>{email}</span>
          </li>
        )}
        {phone && (
          <li className={cn('flex items-center gap-3 text-sm', dark ? 'text-slate-400' : 'text-slate-500')}>
            <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', dark ? 'bg-white/5' : 'bg-slate-100')}>
              <Phone className="h-3.5 w-3.5" />
            </div>
            <span>{phone}</span>
          </li>
        )}
        {address && (
          <li className={cn('flex items-start gap-3 text-sm', dark ? 'text-slate-400' : 'text-slate-500')}>
            <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', dark ? 'bg-white/5' : 'bg-slate-100')}>
              <MapPin className="h-3.5 w-3.5" />
            </div>
            <span>{address}</span>
          </li>
        )}
        {!email && !phone && !address && (
          <li className={cn('text-sm', dark ? 'text-slate-400' : 'text-slate-500')}>
            Contact details will appear here when configured.
          </li>
        )}
      </ul>
    </div>
  );
};

const NewsletterCard = ({ title, description, email, setEmail, subscribed, handleNewsletterSubmit, buttonRadiusClass, dark = false, glass = false }) => (
  <div
    className={cn(
      'rounded-3xl border p-8 md:p-12',
      glass ? 'border-white/10 backdrop-blur-sm' : dark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'
    )}
    style={glass ? {
      background: 'linear-gradient(135deg, color-mix(in srgb, var(--color-primary-500) 22%, transparent), rgba(15, 23, 42, 0.45))',
    } : undefined}
  >
    <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
      <div className="text-center md:text-left">
        <h3 className={cn('mb-2 text-2xl font-bold md:text-3xl', dark ? 'text-white' : 'text-slate-900')} style={{ fontFamily: 'var(--font-display)' }}>
          {title}
        </h3>
        <p className={cn('text-sm md:text-base', dark ? 'text-slate-300' : 'text-slate-500')}>{description}</p>
      </div>
      <form onSubmit={handleNewsletterSubmit} className="flex w-full gap-2 md:w-auto">
        <div className="relative flex-1 md:w-72">
          <Mail className={cn('absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2', dark ? 'text-slate-500' : 'text-slate-400')} />
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={cn(
              'w-full border py-3 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-slate-500',
              buttonRadiusClass,
              dark ? 'border-white/10 bg-white/10 text-white' : 'border-slate-200 bg-white text-slate-900'
            )}
          />
        </div>
        <button
          type="submit"
          className={cn(
            'flex items-center gap-2 px-6 py-3 text-sm font-medium text-white shadow-lg transition-all',
            buttonRadiusClass
          )}
          style={{ backgroundColor: 'var(--color-primary-600)' }}
        >
          {subscribed ? 'Subscribed!' : 'Subscribe'}
          {!subscribed && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>
    </div>
  </div>
);

const FooterCard = ({ children, dark = false }) => (
  <div className={cn('rounded-3xl border p-6 shadow-sm', dark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white')}>
    {children}
  </div>
);

export default Footer;
