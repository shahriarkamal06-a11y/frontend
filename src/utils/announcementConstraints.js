const STYLE_RULES = {
  BANNER: {
    titleMaxLength: 120,
    contentMaxLength: 180,
    buttonTextMaxLength: 24,
    buttonLinkMaxLength: 500,
    imageUrlMaxLength: 1000,
    customCssMaxLength: 2000,
    contentEnabled: true,
    imageUrlEnabled: true,
    countdownEnabled: true,
    customCssEnabled: true,
  },
  POPUP: {
    titleMaxLength: 120,
    contentMaxLength: 320,
    buttonTextMaxLength: 28,
    buttonLinkMaxLength: 500,
    imageUrlMaxLength: 1000,
    customCssMaxLength: 2000,
    contentEnabled: true,
    imageUrlEnabled: true,
    countdownEnabled: true,
    customCssEnabled: true,
  },
  MODAL: {
    titleMaxLength: 120,
    contentMaxLength: 360,
    buttonTextMaxLength: 28,
    buttonLinkMaxLength: 500,
    imageUrlMaxLength: 1000,
    customCssMaxLength: 2000,
    contentEnabled: true,
    imageUrlEnabled: true,
    countdownEnabled: true,
    customCssEnabled: true,
  },
  SLIDE_IN: {
    titleMaxLength: 100,
    contentMaxLength: 160,
    buttonTextMaxLength: 24,
    buttonLinkMaxLength: 500,
    imageUrlMaxLength: 1000,
    customCssMaxLength: 2000,
    contentEnabled: true,
    imageUrlEnabled: false,
    countdownEnabled: true,
    customCssEnabled: true,
  },
  STICKY: {
    titleMaxLength: 100,
    contentMaxLength: 160,
    buttonTextMaxLength: 24,
    buttonLinkMaxLength: 500,
    imageUrlMaxLength: 1000,
    customCssMaxLength: 2000,
    contentEnabled: true,
    imageUrlEnabled: false,
    countdownEnabled: true,
    customCssEnabled: true,
  },
};

const LOCATION_RULES = {
  HEADER: {
    allowedStyles: ['BANNER'],
    titleLabel: 'Announcement text',
    titleMaxLength: 90,
    buttonTextMaxLength: 18,
    contentEnabled: false,
    imageUrlEnabled: false,
    countdownEnabled: false,
    customCssEnabled: false,
    helpText: 'Top announcement bars support one line of text and one optional button.',
  },
  CATEGORY_DROPDOWN: {
    allowedStyles: ['BANNER'],
    titleMaxLength: 120,
    contentMaxLength: 180,
    buttonTextMaxLength: 24,
    contentEnabled: true,
    imageUrlEnabled: true,
    countdownEnabled: true,
    customCssEnabled: true,
    helpText: 'Category dropdown announcements appear only inside the categories dropdown menu.',
  },
  SECTION: {
    allowedStyles: ['BANNER'],
    requireSectionId: true,
  },
};

function normalizeKey(value, fallback) {
  const normalized = String(value || fallback).toUpperCase();
  if (normalized === 'HEADER_DROPDOWN') return 'CATEGORY_DROPDOWN';
  return normalized;
}

function buildFieldRule(locationRule, styleRule, fieldName, defaults = {}) {
  const locationEnabled = locationRule[`${fieldName}Enabled`];
  const styleEnabled = styleRule[`${fieldName}Enabled`];
  const locationMaxLength = locationRule[`${fieldName}MaxLength`];
  const styleMaxLength = styleRule[`${fieldName}MaxLength`];

  return {
    enabled: locationEnabled ?? styleEnabled ?? defaults.enabled ?? true,
    maxLength: locationMaxLength ?? styleMaxLength ?? defaults.maxLength ?? null,
    label: defaults.label || fieldName,
    required: Boolean(defaults.required),
    singleLine: defaults.singleLine !== false,
  };
}

export function getAnnouncementPlacementRule(displayLocation = 'HEADER', displayStyle = 'BANNER') {
  const normalizedLocation = normalizeKey(displayLocation, 'HEADER');
  const locationRule = LOCATION_RULES[normalizedLocation] || {};
  const normalizedStyle = normalizeKey(displayStyle, 'BANNER');
  const resolvedStyle = (locationRule.allowedStyles || []).includes(normalizedStyle)
    ? normalizedStyle
    : (locationRule.allowedStyles?.[0] || normalizedStyle);
  const styleRule = STYLE_RULES[resolvedStyle] || STYLE_RULES.BANNER;

  return {
    displayLocation: normalizedLocation,
    displayStyle: resolvedStyle,
    allowedStyles: locationRule.allowedStyles || [resolvedStyle],
    requireSectionId: Boolean(locationRule.requireSectionId),
    helpText: locationRule.helpText || '',
    fields: {
      title: buildFieldRule(locationRule, styleRule, 'title', {
        label: locationRule.titleLabel || 'Title',
        required: true,
      }),
      content: buildFieldRule(locationRule, styleRule, 'content', {
        label: 'Content',
      }),
      buttonText: buildFieldRule(locationRule, styleRule, 'buttonText', {
        label: 'Button text',
      }),
      buttonLink: buildFieldRule(locationRule, styleRule, 'buttonLink', {
        label: 'Button link',
        singleLine: true,
      }),
      imageUrl: buildFieldRule(locationRule, styleRule, 'imageUrl', {
        label: 'Image URL',
        singleLine: true,
      }),
      customCss: buildFieldRule(locationRule, styleRule, 'customCss', {
        label: 'Custom CSS',
        singleLine: false,
      }),
      sectionId: {
        enabled: Boolean(locationRule.requireSectionId),
        maxLength: 100,
        label: 'Target section',
        required: Boolean(locationRule.requireSectionId),
        singleLine: true,
      },
      countdownEnabled: {
        enabled: locationRule.countdownEnabled ?? styleRule.countdownEnabled ?? true,
      },
    },
  };
}

export function applyAnnouncementPlacementConstraints(announcement = {}) {
  const constrainedAnnouncement = {
    ...announcement,
  };
  const placementRule = getAnnouncementPlacementRule(
    constrainedAnnouncement.displayLocation,
    constrainedAnnouncement.displayStyle
  );

  constrainedAnnouncement.displayLocation = placementRule.displayLocation;
  constrainedAnnouncement.displayStyle = placementRule.displayStyle;
  constrainedAnnouncement.title = normalizeSingleLineText(constrainedAnnouncement.title);
  constrainedAnnouncement.buttonText = normalizeSingleLineText(constrainedAnnouncement.buttonText);

  if (!placementRule.fields.content.enabled) {
    constrainedAnnouncement.content = '';
  }

  if (!placementRule.fields.imageUrl.enabled) {
    constrainedAnnouncement.imageUrl = '';
  }

  if (!placementRule.fields.countdownEnabled.enabled) {
    constrainedAnnouncement.countdownEnabled = false;
  }

  if (!placementRule.fields.sectionId.enabled) {
    constrainedAnnouncement.sectionId = '';
  }

  if (!placementRule.fields.customCss.enabled) {
    constrainedAnnouncement.customCss = '';
  }

  return constrainedAnnouncement;
}

export function normalizeSingleLineText(value) {
  if (typeof value !== 'string') return value ?? '';
  return value.replace(/\s+/g, ' ').trimStart();
}

export function getAnnouncementFieldCharacterCount(value) {
  if (typeof value !== 'string') return 0;
  return value.length;
}
