# Web Interface Design Specification - Sanctum Configurator

## Overview

This document specifies the complete web interface design for the Sanctum Configurator, including both the Settings → Tools page and the main Chat interface. The design emphasizes a dark, professional aesthetic with Bootstrap-based components, smooth interactions, and comprehensive functionality.

---

## Settings → Tools Page

### Layout & Structure

The Settings page now uses a tabbed navigation system to properly separate master-level configuration from per-agent configuration:

```
┌────────────────────────────────────────────────────────────────────┐
│  [Athena ▼]                    Settings                    [← Chat] │
│  ───────────────────────────────────────────────────────────────── │
│  [Master] [Athena] [Monday] [Timbre] [SMCP]                       │
│  ───────────────────────────────────────────────────────────────── │
│                                                                      │
│  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐ │
│  │🧰  Install Tool    │  │💬  Chat Settings   │  │🛰️  Broca           │ │
│  │ Quick setup &      │  │ Model, voice,     │  │ Streams & tool I/O │ │
│  │ upgrades           │  │ safety, persona   │  │                    │ │
│  │                    │  │                   │  │                    │ │
│  │ [Open] [⋯]  ● OK   │  │ [Open] [⋯]  ● OK  │  │ [Open] [⋯]  ● OK   │ │
│  └───────────────────┘  └───────────────────┘  └───────────────────┘ │
│                                                                      │
│  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐ │
│  │🧠  Thalamus /      │  │🌙  Dream Agent     │  │🔌  SMCP Config     │ │
│  │    Cerebellum      │  │ Archives & recall │  │ MCP plugins/tools  │ │
│  │ Routing & memory   │  │ policies          │  │ scopes & health     │ │
│  │ inspectors         │  │                   │  │                    │ │
│  │ [Open] [⋯]  ● OK   │  │ [Open] [⋯]  ● OK  │  │ [Open] [⋯]  ● OK   │ │
│  └───────────────────┘  └───────────────────┘  └───────────────────┘ │
│                                                                      │
│  Tips: 1–6 to open • Enter = Open • Esc = Clear search • ? Help    │
└────────────────────────────────────────────────────────────────────┘
```

### Tab Navigation System

#### Master Tab (Global Configuration)
- **Global Venv Management**: Python interpreter, shared dependencies
- **System-wide Settings**: Base ports, paths, environment variables
- **Control Plane**: Optional registry, gateway, admin UI
- **Installation Tools**: Setup, upgrades, system health

#### Agent Tabs (Per-Prime Configuration)
- **Agent-specific Tools**: Broca2, Thalamus, Dream Agent, etc.
- **Module Configurations**: Individual .env files, ports, DB paths
- **Agent Plugins**: Per-agent plugin management
- **Local Settings**: Model preferences, voice settings, persona configs

#### SMCP Tab (Independent Service)
- **MCP Service**: Plugin management, service configuration
- **Service Health**: Status monitoring, logs, performance
- **Plugin Registry**: Available plugins, installation status

### Key Features

#### Tab-based Navigation
- **Active Tab**: Highlighted with accent color and border
- **Tab Switching**: Instant navigation between configuration levels
- **Context Awareness**: Each tab shows relevant tools and settings
- **Search Scope**: Search filters within the active tab context

#### Configuration Hierarchy
- **Master Level**: System-wide settings affecting all agents
- **Agent Level**: Individual Prime configurations and tools
- **Module Level**: Specific tool configurations within each agent
- **Service Level**: Independent services like SMCP

#### Agent Switching
- **Dropdown Header**: Shows current agent with dropdown menu
- **Tab Context**: Agent tabs automatically switch when changing agents
- **Page Refresh**: Switching agents refreshes the entire page to load new context
- **Loading State**: Brief "Loading [Agent]..." display during transition

#### Search & Filtering
- **Tab-scoped Search**: Live filtering within the active tab context
- **Results Counter**: Shows "n results" below search input
- **Clear Button**: ✕ button appears when search has content
- **Keyboard Shortcuts**: Esc clears search and refocuses input

#### Tool Cards
- **Card Density**: Optimized padding (1.25rem top/bottom, 1.5rem left/right)
- **Status Indicators**: Color-coded dots with hover tooltips
  - ● Green: Healthy
  - ● Orange: Degraded  
  - ● Red: Off
- **Status Tooltips**: Hover reveals status label (e.g., "● Healthy")
- **Actions**: Primary "Open" button + secondary "⋯" menu
- **Button Hierarchy**: "Open" is prominent, menu dots are reduced contrast

#### Responsive Design
- **Desktop**: 3-up grid layout
- **Medium Screens**: 2-up layout at max-width: 1200px
- **Mobile**: 1-up layout with adjusted padding

#### Keyboard Navigation
- **Number Keys**: 1-6 to open corresponding tools
- **Enter**: Opens first visible tool
- **Escape**: Clears search and refocuses
- **Tab Navigation**: Ctrl+1-5 to switch between tabs

---

## Chat Interface

### Layout & Structure

The Chat interface provides a full-bleed conversation experience with fixed-height scrolling:

```
┌────────────────────────────────────────────────────────────────────┐
│  [Athena ▼]                    Chat                        [⚙ Settings] │
│  ───────────────────────────────────────────────────────────────── │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  [A] Athena                                                    │ │
│  │  [bubble] Hey Mark—ready when you are. I can help you...      │ │
│  │  [Today, 2:30 PM] [Copy] [Share]                              │ │
│  │                                                                 │ │
│  │  [R] rizzn                                                     │ │
│  │  [bubble] Let's test the composer and see how it feels.       │ │
│  │  [Today, 2:31 PM] [Copy] [Share]                              │ │
│  │                                                                 │ │
│  │  [⚙] Tool                                                      │ │
│  │  [TOOL OUTPUT] ✓ Sanctum kernel installed successfully...     │ │
│  │  [Today, 2:32 PM] [Copy All]                                  │ │
│  │                                                                 │ │
│  │  [A] Athena                                                    │ │
│  │  [bubble] I received your message...                           │ │
│  │  [Today, 2:33 PM] [Copy] [Share]                              │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  [Message Athena…] [📎] [🎙️] [Send]                           │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  [New ↓] ← Jump to bottom button (appears when scrolled up)        │
└────────────────────────────────────────────────────────────────────┘
```

### Key Features

#### Agent Switching
- **Dropdown Header**: Shows current agent with dropdown menu
- **Conversation Refresh**: Switching agents clears transcript and starts fresh
- **Loading State**: Spinner + "Loading [Agent]..." in dropdown button
- **Page Title Update**: Browser tab shows "Chat with [Agent] - Sanctum"
- **Avatar Update**: Assistant avatar letter changes to match new agent

#### Message System
- **User Messages**: Right-aligned, gray bubbles with "R" avatar and "rizzn" name
- **Assistant Messages**: Left-aligned, darker bubbles with agent initial and name
- **Tool Output**: Special styling with tool chip header and "Copy All" button
- **Message Actions**: Copy and Share buttons with hover tooltips
- **Timestamps**: Subtle timestamps that appear on hover, positioned inline with actions

#### Message Actions
- **Copy Button**: Copies message content with visual feedback (checkmark)
- **Share Button**: Uses Web Share API with fallback to clipboard
- **Copy All Button**: For tool output messages
- **Visual Feedback**: Success state with checkmark icon for 2 seconds
- **Icon-Only Design**: No text labels, just SVG icons for clean appearance

#### Layout & Scrolling
- **Fixed Height**: Chat area maintains viewport height, doesn't expand page
- **Internal Scrolling**: Transcript scrolls independently within fixed container
- **Jump to Bottom**: "New ↓" button appears when >200px from bottom
- **Auto-scroll**: New messages automatically scroll to bottom
- **Scroll Position**: Page loads showing most recent messages

#### Composer
- **Auto-expand**: Textarea grows up to 120px height, then scrolls
- **Keyboard Shortcuts**: Enter sends, Shift+Enter new line, Escape focuses
- **Sticky Footer**: Composer stays at bottom with subtle shadow
- **Focus Ring**: Subtle blue focus state with slight lift animation

#### Avatars & Identity
- **Avatar System**: 32px circular avatars with initials/emoji
- **User Avatar**: "R" for rizzn, right-aligned
- **Assistant Avatar**: Agent initial (A, M, T), left-aligned
- **Tool Avatar**: ⚙ emoji for tool output
- **Avatar Names**: Small text below avatars for identification

#### Timestamps
- **Format**: "Today, 2:30 PM", "Yesterday, 3:15 PM", "Dec 15, 4:20 PM"
- **Position**: Inline with copy/share buttons to save space
- **Visibility**: Hidden by default, appears on hover
- **Subtle Design**: Small, dim text that doesn't clutter interface

---

## Design System

### Color Palette

```css
:root {
  --bg-page: #212121;        /* Main background */
  --bg-surface: #303030;     /* Cards, headers, composer */
  --fg: #f9f9fa;            /* Primary text */
  --fg-dim: #c7c7c9;        /* Secondary text, timestamps */
  --bubble-user: #3a3a3a;   /* User message bubbles */
  --bubble-assistant: #252525; /* Assistant message bubbles */
  --bubble-tool: #1f1f1f;   /* Tool output bubbles */
  --border-subtle: #3b3b3b; /* Borders, dividers */
  --ring: #8ab4f8;          /* Focus rings, accents */
}
```

### Typography

- **Font Stack**: `"Inter", system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`
- **Primary Text**: 16px base, `#f9f9fa`
- **Secondary Text**: 14px, `#c7c7c9`
- **Timestamps**: 12px, `#c7c7c9`
- **Avatar Names**: 11px, `#c7c7c9`

### Spacing & Layout

- **Header Height**: 52px
- **Message Spacing**: 1rem (16px) between message groups
- **Bubble Padding**: 1rem (16px) internal padding
- **Avatar Width**: 60px (32px avatar + spacing)
- **Max Bubble Width**: 720px for messages, 1000px for tool output
- **Container Padding**: 1.25rem (20px) horizontal, 1rem (16px) vertical

### Interactive Elements

#### Buttons
- **Primary**: Blue background with hover lift effect
- **Secondary**: Reduced opacity (0.6) with hover state
- **Message Actions**: 24px × 24px with 12px icons
- **Hover Effects**: Opacity increase + slight upward movement

#### Focus States
- **Focus Ring**: 2px blue outline with 2px offset
- **Input Focus**: Blue border + subtle shadow + upward movement
- **Button Focus**: Consistent outline styling

#### Transitions
- **Duration**: 0.2s ease for most interactions
- **Hover States**: Smooth opacity and transform changes
- **Loading States**: Spinner animations with Bootstrap classes

---

## Accessibility Features

### Keyboard Navigation
- **Tab Order**: Logical flow through interactive elements
- **Shortcuts**: Enter, Escape, number keys for common actions
- **Focus Management**: Clear focus indicators and logical flow

### Screen Reader Support
- **ARIA Labels**: Proper labeling for buttons and interactive elements
- **Live Regions**: Transcript updates announced to screen readers
- **Status Messages**: Loading states and feedback communicated

### Visual Accessibility
- **Contrast**: All text meets WCAG AA contrast requirements
- **Focus Indicators**: Clear, visible focus states
- **Hover States**: Additional visual feedback for interactive elements

---

## Responsive Behavior

### Breakpoints
- **Desktop**: 1200px+ (3-up grid, full features)
- **Medium**: 768px-1199px (2-up grid, adjusted spacing)
- **Mobile**: <768px (1-up grid, compact layout)

### Mobile Adaptations
- **Touch Targets**: Minimum 44px for interactive elements
- **Spacing**: Reduced padding and margins for small screens
- **Typography**: Slightly smaller text sizes for mobile
- **Icons**: Reduced icon sizes for mobile interfaces

---

## Performance Considerations

### Loading States
- **Agent Switching**: Brief loading indicators during transitions
- **Message Actions**: Immediate visual feedback for user actions
- **Page Transitions**: Smooth loading states for better perceived performance

### Animation Performance
- **CSS Transitions**: Hardware-accelerated transforms and opacity
- **Smooth Scrolling**: Native scroll behavior with custom jump-to-bottom
- **Hover Effects**: Lightweight CSS transitions for responsive feel

---

## Implementation Notes

### Bootstrap Integration
- **Grid System**: Bootstrap 5 responsive grid classes
- **Components**: Dropdowns, buttons, forms, utilities
- **Customization**: CSS variables override Bootstrap defaults
- **Responsive**: Bootstrap breakpoints with custom adjustments

### JavaScript Functionality
- **Event Handling**: Comprehensive event listeners for all interactions
- **State Management**: Clean state transitions for agent switching
- **Clipboard API**: Modern clipboard integration with fallbacks
- **Web Share API**: Native sharing with graceful degradation

### CSS Architecture
- **CSS Variables**: Centralized color and spacing management
- **Component Classes**: Modular CSS for maintainability
- **Responsive Design**: Mobile-first approach with progressive enhancement
- **Performance**: Optimized selectors and minimal repaints

This specification represents the complete, implemented design that has been thoroughly tested and refined through iterative development.












