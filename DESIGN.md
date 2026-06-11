---
name: Lend & Lease Harmony
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#4c4451'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#7d7483'
  outline-variant: '#cec3d3'
  surface-tint: '#7b41b3'
  primary: '#2e0052'
  on-primary: '#ffffff'
  primary-container: '#4b0082'
  on-primary-container: '#ba7ef4'
  inverse-primary: '#ddb7ff'
  secondary: '#8234c6'
  on-secondary: '#ffffff'
  secondary-container: '#b86dfd'
  on-secondary-container: '#410070'
  tertiary: '#705d00'
  on-tertiary: '#ffffff'
  tertiary-container: '#c9a900'
  on-tertiary-container: '#4c3f00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#f0dbff'
  primary-fixed-dim: '#ddb7ff'
  on-primary-fixed: '#2c0050'
  on-primary-fixed-variant: '#622599'
  secondary-fixed: '#f1dbff'
  secondary-fixed-dim: '#deb7ff'
  on-secondary-fixed: '#2d0050'
  on-secondary-fixed-variant: '#680eac'
  tertiary-fixed: '#ffe16d'
  tertiary-fixed-dim: '#e9c400'
  on-tertiary-fixed: '#221b00'
  on-tertiary-fixed-variant: '#544600'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  display-lg:
    fontFamily: Montserrat
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Montserrat
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 40px
  margin-mobile: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The design system is built on the pillars of reliability, utility, and modern commerce. It targets a diverse demographic of renters and owners who value efficiency and trust. The visual style is **Corporate / Modern**, leaning heavily into high-end SaaS aesthetics to elevate the "rental" experience from a peer-to-peer transaction to a professional service.

The interface prioritizes clarity and breathing room to reduce cognitive load during the search and booking process. By combining deep, authoritative tones with expansive white space, the design system evokes a sense of security and premium quality, ensuring users feel confident when transacting on the platform.

## Colors

The palette is anchored by a deep Indigo Purple, symbolizing wisdom and authority. This is balanced by a secondary, more vibrant violet for interactive states and a tertiary Gold for high-priority accents like ratings, verified badges, or "Featured" ribbons.

- **Primary**: Used for core actions, branding, and active navigational states.
- **Secondary**: Used for hover states and secondary CTA buttons.
- **Neutral**: A clean range of cool grays. Surfaces use a crisp white, while backgrounds utilize a very light gray to provide subtle contrast for card elements.
- **Success/Error**: Standard semantic green and red are softened to fit the professional tone.

## Typography

This design system utilizes a dual-font strategy. **Montserrat** provides a bold, confident voice for headlines and brand-heavy moments, giving the platform a modern, startup feel. **Inter** handles all functional and body text, ensuring maximum readability for item descriptions, pricing, and technical details.

Hierarchy is maintained through weight rather than just size. Captions and labels use uppercase Inter with slight tracking to differentiate them from standard body text.

## Layout & Spacing

The system employs a **Fluid Grid** model based on a 12-column architecture for desktop and a 4-column architecture for mobile. A strict 4px/8px baseline rhythm ensures vertical consistency across all components.

- **Desktop**: 12 columns with 24px gutters. Content is centered within a 1280px max-width container.
- **Tablet**: 8 columns with 20px gutters. 
- **Mobile**: 4 columns with 16px gutters.
- **Padding**: Elements within cards should maintain a minimum of 16px internal padding (stack-md) to preserve the "clean and airy" brand promise.

## Elevation & Depth

To maintain a clean, modern look, this design system avoids heavy shadows. Depth is communicated through **Ambient Shadows** and **Tonal Layers**:

1.  **Level 0 (Floor)**: The main background color (#F8F9FA).
2.  **Level 1 (Card)**: Pure white (#FFFFFF) surfaces with a very soft, diffused shadow (0px 2px 4px rgba(0,0,0,0.05)).
3.  **Level 2 (Hover/Active)**: Slightly more pronounced shadow (0px 8px 16px rgba(0,0,0,0.08)) to indicate interactivity.
4.  **Level 3 (Overlays/Modals)**: Deep, diffused shadow with a 15% opacity primary color tint to keep the depth feeling "on-brand."

Low-contrast outlines (1px solid #E9ECEF) are used instead of shadows for form fields and list items to keep the UI from feeling cluttered.

## Shapes

The shape language is consistently **Rounded**, reflecting the approachable and friendly nature of a marketplace. 

- **Standard Buttons & Inputs**: 0.5rem (8px) corner radius.
- **Cards & Containers**: 1rem (16px) corner radius.
- **Search Bars & Badges**: 1.5rem (24px) or full pill-shape to draw focus and contrast against the more structural card elements.
- **Images**: Always feature a 12px corner radius to soften the visual impact of photography.

## Components

### Buttons
- **Primary**: Solid Deep Purple (#4B0082) with white text. 8px border radius.
- **Secondary**: White background with a 1px solid Deep Purple border.
- **Ghost**: No border, purple text; used for low-priority actions like "Cancel."

### Inputs & Fields
Text inputs use a light gray border (#DEE2E6) that transitions to Deep Purple on focus. Labels are always positioned above the field in `label-md` style.

### Cards
Rental item cards are the primary component. They feature a top-aligned image with a 12px radius, followed by 16px of padding for the title (Montserrat), price, and a star-rating badge in Tertiary Gold.

### Chips & Badges
Used for categories (e.g., "Tools", "Electronics") or status (e.g., "Available"). These should have a light tinted background of the primary color with a high-contrast text label.

### Additional Components
- **Booking Bar**: A sticky bottom component for mobile or a sidebar component for desktop that houses the date picker and the primary "Rent Now" CTA.
- **Trust Badges**: Small icons with `label-sm` text used to denote "Identity Verified" or "Insurance Covered" to reinforce the trustworthy brand pillar.