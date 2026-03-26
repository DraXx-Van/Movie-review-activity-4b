---
description: Apply a premium, standout UI style to any web project — warm amber/copper glassmorphism theme
---

# Premium UI Style Guide

When the user asks for a "very good UI" or "premium UI", apply this design system.

## Color Palette

```css
--bg:       #0a0a0b;                    /* deep black background */
--surface:  rgba(18, 18, 20, 0.85);     /* card/sidebar surface (translucent for glass) */
--glass:    rgba(255, 255, 255, 0.03);  /* subtle glass tint */
--border:   rgba(255, 175, 64, 0.08);   /* faint warm border */
--border2:  rgba(255, 175, 64, 0.15);   /* hover/active border */
--text:     #e0dcd5;                    /* warm off-white text */
--muted:    #6b6560;                    /* subdued labels */
--accent:   #f5a623;                    /* primary amber accent */
--accent2:  #e8833a;                    /* secondary copper accent */
--glow:     rgba(245, 166, 35, 0.12);  /* ambient glow */
--up:       #34d399;                    /* success/positive */
--down:     #f87171;                    /* error/negative */
```

## Fonts

```html
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet"/>
```

- **Headings & Body**: `'Space Grotesk', sans-serif`
- **Monospace (labels, code, data)**: `'JetBrains Mono', monospace`

## Core Techniques

### 1. Glassmorphism Cards
```css
.card {
  background: var(--surface);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--border);
  border-radius: 14px;
}
```

### 2. Animated Background Mesh
```css
body::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 0;
  background:
    radial-gradient(ellipse 80% 50% at 20% 10%, rgba(245,166,35,0.06), transparent 60%),
    radial-gradient(ellipse 60% 40% at 80% 80%, rgba(232,131,58,0.04), transparent 50%);
  animation: bgShift 12s ease-in-out infinite alternate;
  pointer-events: none;
}

@keyframes bgShift {
  0%   { opacity: 0.6; transform: scale(1); }
  100% { opacity: 1;   transform: scale(1.1); }
}
```

### 3. Subtle Grid Overlay
```css
body::after {
  content: '';
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(rgba(245,166,35,0.015) 1px, transparent 1px),
    linear-gradient(90deg, rgba(245,166,35,0.015) 1px, transparent 1px);
  background-size: 60px 60px;
  pointer-events: none;
}
```

### 4. Gradient Accent Text
```css
.accent-text {
  background: linear-gradient(135deg, #fff 40%, var(--accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### 5. Shimmer Animation
```css
@keyframes shimmer {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.15); }
}
.shimmer { animation: shimmer 3s ease-in-out infinite; }
```

### 6. Gradient Border Glow (for icons/badges)
```css
.glow-border::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(135deg, var(--accent), transparent, var(--accent2));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0.4;
}
```

### 7. Card Hover Lift
```css
.card:hover {
  border-color: var(--border2);
  transform: translateY(-2px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 8. Top-Edge Accent Line (on hero cards)
```css
.hero::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
  opacity: 0.5;
}
```

### 9. Pulsing Status Dot
```css
.status-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--up);
  box-shadow: 0 0 8px rgba(52,211,153,0.5);
  animation: pulse 2s ease-in-out infinite;
}
```

### 10. Sidebar Active Glow
```css
.sidebar-item.active {
  border-left-color: var(--accent);
  background: linear-gradient(90deg, rgba(245,166,35,0.08), transparent);
}
.sidebar-item.active::after {
  /* left edge amber glow */
  box-shadow: 0 0 12px rgba(245,166,35,0.4);
}
```

## Design Principles

1. **Never use plain colors** — always use gradients, rgba, or HSL-tuned values
2. **Glassmorphism everywhere** — translucent surfaces + backdrop-filter blur
3. **Warm over cool** — amber/copper stands out vs. generic blue/cyan
4. **Micro-animations** — hover lifts, shimmer, breathing backgrounds
5. **Monospace for data** — JetBrains Mono for labels, values, and technical text
6. **Hierarchy through opacity** — muted labels → normal text → bright headings → gradient hero
7. **Always responsive** — mobile-friendly with sidebar → horizontal scroll conversion
