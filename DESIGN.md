---
name: Fleet Telematics & Workshop OS
colors:
  surface: '#031427'
  surface-dim: '#031427'
  surface-bright: '#2a3a4f'
  surface-container-lowest: '#000f21'
  surface-container-low: '#0b1c30'
  surface-container: '#102034'
  surface-container-high: '#1b2b3f'
  surface-container-highest: '#26364a'
  on-surface: '#d3e4fe'
  on-surface-variant: '#c6c6cd'
  inverse-surface: '#d3e4fe'
  inverse-on-surface: '#213145'
  outline: '#909097'
  outline-variant: '#45464d'
  surface-tint: '#bec6e0'
  primary: '#bec6e0'
  on-primary: '#283044'
  primary-container: '#0f172a'
  on-primary-container: '#798098'
  inverse-primary: '#565e74'
  secondary: '#b4c5ff'
  on-secondary: '#002a78'
  secondary-container: '#0053db'
  on-secondary-container: '#cdd7ff'
  tertiary: '#ffb95f'
  on-tertiary: '#472a00'
  tertiary-container: '#251400'
  on-tertiary-container: '#b47300'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#031427'
  on-background: '#d3e4fe'
  surface-variant: '#26364a'
typography:
  display:
    fontFamily: Geist
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: '0'
  body-lg:
    fontFamily: JetBrains Mono
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: '0'
  body-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  data-metric:
    fontFamily: JetBrains Mono
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.03em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.08em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 1.5rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style

This design system delivers a high-precision, technical command environment engineered for fleet operations directors, master mechanics, and shop engineers. The aesthetic fuses industrial telemetry with executive mission-control discipline: unapologetically dense, rigorously structured, and zero-distraction.

### Personality & Tone
- **Precision Engineering:** Every coordinate, diagnostic trouble code (DTC), and VIN string is treated as mission-critical data.
- **Vigilant & Authoritative:** High-contrast tactical feedback where telemetry states (operational, service required, critical halt) command instant cognitive comprehension.
- **Instrumental Modernity:** Combines the structural austerity of modern aviation displays with responsive enterprise SaaS workflows.

### Design Movement
The interface relies on **Technical Industrialism with Tonal Layering**. It avoids decorative gradients and playful embellishments, employing hairline borders (1px), deep slate structural shells, micro-indicators, and dedicated monospaced readouts for sensor telemetry and hardware IDs.

## Colors

The palette is engineered for low-light command rooms and high-glare garage tablets, maximizing contrast and color meaning without inducing eye strain.

### Palette Roles
- **Base Canvas & Structural Surfaces (`#0F172A` - `#020617`):** Deep, non-reflective slate anchoring the primary canvas, sidebars, and docking bays.
- **Active Accent & Focus (`#2563EB` / Cobalt Electric):** Used for interactive triggers, focused inputs, active tabs, and live telemetry ping indicators.
- **Warning & Preventative Alert (`#F59E0B` / Amber Service):** Reserved strictly for preventative maintenance intervals, sensor anomalies, and pending workshop approvals.
- **Operational Nominal (`#10B981` / Emerald Status):** Signals online systems, valid CAN-bus loops, road-ready vehicles, and cleared inspections.
- **Critical Diagnostics (`#EF4444` / Crimson Fault):** High-priority alerts for engine MIL illumination, safety brake system faults, and offline asset disconnects.
- **Muted Structural Neutral (`#64748B` / Slate 500):** Guides, dividers, inactive states, and unit annotations (e.g., `km/h`, `bar`, `V`, `RPM`).

## Typography

The typographic hierarchy enforces a division between administrative architecture and raw vehicular telemetry.

- **Geist (Headlines & Global Controls):** Used for platform navigation, sectional headers, operational modals, and structural summaries. Delivers neutral clarity and optimal kerning at compact optical sizes.
- **JetBrains Mono (Body, Tables, VINs, Metrics, Micro-labels):** Applied to telemetry data, fault logs, timestamps, mechanical readouts, and tabular entries. Ensures column-aligned numbers, non-ambiguous characters (such as distinguishing `0` from `O` and `1` from `l` in 17-character VIN strings), and uniform data flow.
- **Uppercase Hierarchy:** Micro-labels, unit parameters, status badges, and column headers must always be rendered in `uppercase` with tracking set between `+0.04em` and `+0.08em` for rapid technical scanning.

## Layout & Spacing

This design system utilizes a high-density, multi-panel layout designed to maximize screen real estate across multi-monitor dispatch terminals and ruggedized workshop tablets.

### Grid & Canvas Structure
- **Desktop (1280px+):** 12-column variable grid with compact 1rem (`16px`) gutters. Margins scale to 1.5rem (`24px`). Panels sit in fixed-ratio telemetry zones (e.g., Fleet Map 7-col, Live Log 5-col).
- **Tablet / Rugged Workshop Slate (768px - 1279px):** 8-column layout with 1rem gutters. Detail panes shift from side-by-side to collapsible bottom sheets or tabbed master-detail views.
- **Mobile Handheld Diagnostic (320px - 767px):** 4-column layout with 0.75rem (`12px`) gutters and 1rem (`16px`) margins. Sidebars collapse to a bottom tab rail; metric cards collapse to double-column or single-column stacked telemetry cards.

### Spacing Density
Information density is kept high. Spacing values prioritize structured content grouping over excessive whitespace. Component padding adheres to an 8-point base with 4-point micro-increments (`0.25rem` to `2rem`).

## Elevation & Depth

To preserve technical precision and avoid visual mud, this design system suppresses diffuse ambient drop shadows in favor of **structural tonal layering and hairline low-contrast outlines**.

### Elevation Stack
- **Layer 0 (Canvas Base):** Deepest background (`#020617` / Slate 950). Hosts empty space and passive grid lines.
- **Layer 1 (Card & Module Shells):** Base panel fill (`#0F172A` / Slate 900) framed with a 1px solid border (`rgba(148, 163, 184, 0.12)`).
- **Layer 2 (Inset Wells & Table Data Rows):** Inset technical blocks (`#0B1120`) used inside cards for sensor graphs, data logs, and terminal outputs. Provides an indented instrumentation feel.
- **Layer 3 (Overlays, Floating Tooltips & Popovers):** Elevated contextual panels (`#1E293B`) framed with an electric focus border (`rgba(37, 99, 235, 0.4)`) and a restrained directional drop: `0px 4px 16px rgba(0, 0, 0, 0.6)`.

### Border Discipline
Never use decorative blurred shadows on telemetry surfaces. Depth must be communicated strictly via luminance stepping (lighter slate surfaces indicate higher interactivity or closer z-plane) and crisp 1px borders.

## Shapes

The interface implements **Soft Industrial Precision (`roundedness: 1`)**. 

- **Base Components (Inputs, Buttons, Micro-tags, Cards):** Built with `0.25rem` (`4px`) corner radiuses. This tight radius maintains the structural rigidity of diagnostic hardware terminals while avoiding completely razor-sharp raw corners.
- **Interior Insets & Badges:** Use `0.125rem` (`2px`) for status pills and micro-tags to retain dense rectangular telemetry characteristics.
- **Dialogs & Master Flyout Panels:** Maximize at `0.5rem` (`8px`) radius (`rounded-lg`).
- **No Circular/Pill Controls:** Never use pill buttons (`9999px`) or rounded floating action buttons; all controls must feel machined, calibrated, and architectural.

## Components

### Buttons
- **Primary:** Solid `#2563EB`, text `#FFFFFF` (Geist 13px, weight 600), 1px solid `#3B82F6`, border radius `4px`. Height: `32px` (compact) or `40px` (standard).
- **Technical / Secondary:** Dark slate fill `#1E293B`, text `#E2E8F0`, 1px border `rgba(148, 163, 184, 0.2)`. On hover: border `#64748B`, background `#334155`.
- **Destructive / Halt:** Deep crimson tint `#450A0A`, text `#F87171`, 1px border `#991B1B`.

### Micro-Tags & Status Badges
- Encased in 1px borders with monospaced uppercase labels (JetBrains Mono 10px / 600).
- **Operational:** Background `rgba(16, 185, 129, 0.1)`, text `#34D399`, border `rgba(16, 185, 129, 0.3)`. Prefixed with a green pulse dot indicator (`6px`).
- **Service Alert:** Background `rgba(245, 158, 11, 0.1)`, text `#FBBF24`, border `rgba(245, 158, 11, 0.3)`.
- **Critical Fault:** Background `rgba(239, 68, 68, 0.15)`, text `#F87171`, border `rgba(239, 68, 68, 0.4)`.

### Cards & Telemetry Containers
- Background `#0F172A`, border `1px solid rgba(148, 163, 184, 0.12)`.
- Header structured with 1px bottom divider, carrying vehicle nickname, unit ID, and operational badge.
- Body accommodates key-value telemetry pairs (e.g., `ODOMETER: 142,850 KM`, `OIL LIFE: 18%`).

### Data Tables (Mechanical & Electrical Specs)
- Header: Sticky `#0B1120`, font JetBrains Mono 11px uppercase, text `#64748B`.
- Rows: Height `36px`, cell padding `0.5rem 0.75rem`, borders `1px solid rgba(148, 163, 184, 0.08)`. Alternating row stripe using `rgba(255, 255, 255, 0.015)`.
- Numeric alignment: Right-aligned with tabular figures for instant comparative scanning.

### Input Fields & Selectors
- Background `#090D16`, text `#F8FAFC`, border `1px solid rgba(148, 163, 184, 0.2)`. Focus: border `#2563EB` with `0 0 0 1px #2563EB`. Font: JetBrains Mono 13px.

### Navigation & Sub-System Tabs
- Flat segmented tabs with 1px border separator. Active tab features a 2px high `#2563EB` top or bottom indicator bar and white text; inactive tabs use muted slate `#64748B`.