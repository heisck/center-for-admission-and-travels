# Admin Dashboard - Visual Guide

## What You'll See When You Open `/admin`

```
┌─────────────────────────────────────────────────────────────────────────┐
│                   🏢 Admin Dashboard                                     │
│         Edit your website content in real-time                          │
│                                                                         │
│  [↶] [↷] [↻ Reset]  │  [⬇ Export] [⬆ Import]                         │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ [Home] [About] [Packages] [Travel Tours] [Services]                     │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐  ┌──────────────────────────────────────────┐
│     EDITOR (Left)        │  │    LIVE PREVIEW (Right - Desktop Only)   │
│                          │  │                                          │
│ Content Statistics:      │  │ Shows how your changes look on the       │
│ • 4 Services            │  │ main website in real-time                │
│ • 2 Packages            │  │                                          │
│ • 4 Team Members        │  │ (Auto-updates as you edit)               │
│ • 6 Core Values         │  │                                          │
│                          │  │ On mobile: Click 👁 button to toggle    │
│ ┌────────────────────┐  │  └──────────────────────────────────────────┘
│ │ Hero Section       │  │
│ │ ┌────────────────┐ │  │
│ │ │ Title:         │ │  │
│ │ │ [Looking To ✏]│ │  │  ← Click to edit
│ │ │               │ │  │
│ │ │ Subtitle:      │ │  │
│ │ │ [& Enrich ✏]  │ │  │
│ │ │               │ │  │
│ │ │ Images: [ ] [ ]│ │  │  ← Add/Remove images
│ │ │ [ ] [⬆ Upload]│ │  │
│ │ └────────────────┘ │  │
│ │                    │  │
│ │ Services Cards:    │  │
│ │ [➕ Add Service]   │  │
│ │                    │  │
│ │ ┌──────────────┐  │  │
│ │ │ Study Abroad │  │  │
│ │ │ [edit ✏] [🗑] │  │  │
│ │ └──────────────┘  │  │
│ │                    │  │
│ │ ┌──────────────┐  │  │
│ │ │ Work Abroad  │  │  │
│ │ │ [edit ✏] [🗑] │  │  │
│ │ └──────────────┘  │  │
│ └────────────────────┘  │
└──────────────────────────┘
```

---

## Tab Layout - What's in Each Section

### 1️⃣ HOME TAB
```
┌─ Hero Section
│  ├─ Title (editable)
│  ├─ Subtitle (editable)
│  ├─ Description (multiline, editable)
│  ├─ CTA 1 Text (editable)
│  ├─ CTA 2 Text (editable)
│  ├─ Statistics (3 items, editable values)
│  └─ Hero Images (carousel, editable)
│
└─ Services (grid of service cards)
   ├─ Service 1: Study Abroad
   │  ├─ Title (editable)
   │  └─ Description (editable)
   ├─ Service 2: Work Abroad
   ├─ Service 3: Travel & Tours
   └─ Service 4: Global Network
```

### 2️⃣ ABOUT TAB
```
┌─ Hero Section
│  ├─ Title (editable)
│  ├─ Subtitle (editable)
│  └─ Image (editable)
│
├─ Mission Section
│  ├─ Title: "Our Mission" (editable)
│  ├─ Description (editable)
│  └─ Points (editable list, add/remove)
│
├─ Vision Section
│  ├─ Title: "Our Vision" (editable)
│  ├─ Description (editable)
│  └─ Points (editable list, add/remove)
│
├─ Core Values (add/remove/edit)
│  ├─ Integrity (editable)
│  ├─ Professionalism (editable)
│  ├─ Customer First (editable)
│  ├─ Transparency (editable)
│  ├─ Respect (editable)
│  └─ [➕ Add More]
│
└─ Team Members (add/remove/edit)
   ├─ George Owusu Ntim
   │  ├─ Role (editable)
   │  ├─ Photo (editable)
   │  └─ Bio (editable)
   ├─ Sadat Abdul Wahab
   ├─ Drake Nana Adjei Afram
   ├─ Esther Adjei Konamah
   └─ [➕ Add Team Member]
```

### 3️⃣ PACKAGES TAB
```
┌─ [➕ Add Package]
│
├─ Dubai Experience ▼
│  ├─ Name: Dubai Experience
│  ├─ Price: $1299
│  ├─ Duration: 6 Days
│  ├─ Category: Travel
│  ├─ Description (multiline)
│  ├─ Highlights (add/remove)
│  │  ├─ Burj Khalifa
│  │  ├─ Desert Safari
│  │  ├─ Dhow Cruise
│  │  └─ [➕ Add Highlight]
│  ├─ Itinerary (multiline)
│  ├─ Images (add/remove)
│  └─ [🗑 Delete]
│
├─ Europe Multi-City ▼
│  └─ (same structure)
│
└─ [➕ Add Package]
```

### 4️⃣ TRAVEL TOURS TAB
```
┌─ Hero Section
│  ├─ Title (editable)
│  ├─ Description (multiline, editable)
│  ├─ Paragraph (multiline, editable)
│  └─ Image (editable)
│
├─ [➕ Add Featured Package]
│
├─ Dubai Experience ▼
│  ├─ Name (editable)
│  ├─ Description (editable)
│  ├─ Duration (editable)
│  ├─ Price (editable)
│  ├─ Highlights (editable list)
│  ├─ Image (editable)
│  └─ [🗑 Delete]
│
├─ European Tour ▼
│  └─ (same structure)
│
├─ Asia Explorer ▼
│  └─ (same structure)
│
└─ [➕ Add Featured Package]
```

### 5️⃣ SERVICES TAB
```
┌─ Study Abroad
│  ├─ Title: Study Abroad
│  ├─ Description: Your pathway...
│  └─ Sections:
│     ├─ University Selection ▼
│     │  ├─ Content (editable)
│     │  └─ Image (editable)
│     ├─ Application Assistance ▼
│     │  ├─ Content (editable)
│     │  └─ Image (editable)
│     └─ Visa Processing ▼
│        ├─ Content (editable)
│        └─ Image (editable)
│
├─ Work Abroad
│  └─ (similar structure)
│
├─ Travel & Tours
│  └─ (similar structure)
│
└─ Global Network
   └─ (similar structure)
```

---

## Common Workflows

### Workflow 1: Edit Hero Title
```
1. Go to Home tab
2. Find Hero Section
3. See: [Looking To ✏]  ← Click here
4. Type new title: "Dream & Explore"
5. Press Enter or click ✅
6. See live preview update instantly
```

### Workflow 2: Add New Team Member
```
1. Go to About tab
2. Scroll to Team Members
3. Click [➕ Add Team Member]
4. Fill in:
   - Name: "John Doe"
   - Role: "Tour Guide"
   - Bio: "Expert in..."
   - Photo: (upload image)
5. Confirm/Save
6. New member appears in list
```

### Workflow 3: Add Package Highlight
```
1. Go to Packages tab
2. Expand Dubai Experience ▼
3. Scroll to Highlights
4. See existing highlights
5. Click [➕ Add Highlight]
6. Type "New Attraction"
7. Done - appears in list
```

### Workflow 4: Undo a Mistake
```
1. Made a change you regret
2. Click [↶] Undo button
   OR Press Ctrl+Z
3. Change reverts instantly
4. Can click multiple times
5. Undo history is unlimited
```

### Workflow 5: Backup Your Work
```
1. Click [⬇ Export] button
2. JSON file downloads
3. Save it somewhere safe
4. Later if needed:
   - Click [⬆ Import]
   - Select JSON file
   - All data restored
```

---

## Interactive Elements Guide

### Text Fields (Single Line)
```
┌─────────────────────────┐
│ Click to edit →         │ ← Shows "Click to edit"
│                         │
│ [Looking To Travel✏]  ← While editing
│ ┌──────────────────┐   │
│ │New title here... │   │ ← Keyboard input
│ └──────────────────┘   │
│    [✅] [❌]           │ ← Save/Cancel buttons
└─────────────────────────┘
```

### Text Areas (Multiline)
```
┌──────────────────────────────┐
│ Description (click to edit)   │
│                              │
│ ┌────────────────────────┐  │
│ │ Welcome to our company │  │
│ │ where dreams come true.│  │ ← Multiple lines
│ │ We offer the best...   │  │
│ │                        │  │
│ └────────────────────────┘  │
│    [✅] [❌]                │
└──────────────────────────────┘
```

### Image Editor
```
┌────────────────────────┐
│ Hero Image             │
│ ┌──────────────────┐   │
│ │ [Current Image]  │   │
│ │  (preview)       │   │
│ └──────────────────┘   │
│                        │
│ Image URL:            │
│ [/images/hero.jpg  ]  │
│                        │
│ Or drag image here →  │
│                        │
│ [➕ Add Image]        │
│ [🗑 Remove]           │
└────────────────────────┘
```

### Expandable Cards
```
┌──────────────────────────┐
│ Dubai Experience ▼       │ ← Click to expand
│ $1299 • 6 Days           │
│ [✏] [🗑]                 │
└──────────────────────────┘

After clicking ▼:
┌──────────────────────────┐
│ Dubai Experience ▲       │ ← Click to collapse
│ $1299 • 6 Days           │
│ [✏] [🗑]                 │
├──────────────────────────┤
│ ┌────────────────────┐   │
│ │ Name:              │   │ ← Now editable
│ │ [Dubai Experience] │   │
│ │                    │   │
│ │ Price:             │   │
│ │ [$1299          ]  │   │
│ │                    │   │
│ │ Duration:          │   │
│ │ [6 Days         ]  │   │
│ │                    │   │
│ │ Highlights:        │   │
│ │ □ Burj Khalifa   │ │
│ │ □ Desert Safari  │ │
│ │ □ Dhow Cruise    │ │
│ │ [➕ Add]          │   │
│ │                    │   │
│ │ [⬆ Upload Image] │   │
│ │                    │   │
│ └────────────────────┘   │
└──────────────────────────┘
```

---

## Header Controls

```
┌────────────────────────────────────────────────────────┐
│  Admin Dashboard                                       │
│  Edit your website content in real-time               │
│                                                       │
│  [↶] [↷] | [↻ Reset] | [⬇ Export] [⬆ Import]       │
│  Undo Redo   Reset      Download    Upload            │
│                                                       │
│  Tooltip:                                             │
│  ↶ = Undo last change (Ctrl+Z)                       │
│  ↷ = Redo change (Ctrl+Y)                            │
│  ↻ = Reset everything to defaults                     │
│  ⬇ = Backup as JSON file                             │
│  ⬆ = Restore from JSON file                          │
└────────────────────────────────────────────────────────┘
```

---

## State Indicators

### Button States
```
ENABLED (can use):
┌─────────┐
│ [↶] Undo│  ← Full opacity, clickable
└─────────┘

DISABLED (can't use):
┌─────────┐
│ [↶] Undo│  ← Faded/grayed out, not clickable
└─────────┘  (at history start)
```

### Editing States
```
NORMAL:
Title: "Looking To Travel"  ← Gray text

EDITING:
Title: "Looking To Travel✏" ← Has edit icon

FOCUSED:
┌──────────────────────┐
│ Looking To Travel    │  ← Input focused
└──────────────────────┘
   [✅] [❌]           ← Save/Cancel buttons visible
```

---

## Responsive Behavior

### Desktop (1024px+)
```
┌─────────────────────────────────────┐
│           Header                    │
├──────────────┬──────────────────────┤
│              │                      │
│   Editor     │   Live Preview       │
│   (Left)     │   (Right)            │
│              │                      │
│  50% Width   │   50% Width          │
│              │                      │
└──────────────┴──────────────────────┘
```

### Tablet (768px - 1024px)
```
┌──────────────────┐
│     Header       │
├──────────────────┤
│                  │
│   Editor         │
│   (Full Width)   │
│                  │
│ [👁 Toggle View] │
│ (Preview hidden) │
└──────────────────┘
```

### Mobile (< 768px)
```
┌──────────────┐
│    Header    │
├──────────────┤
│   Editor     │
│ (Full Width) │
│              │
├──────────────┤
│[👁 Preview ] │
│(Floating Btn)│
│              │
└──────────────┘

Click button to see:
┌──────────────┐
│   Preview    │
│ (Full Width) │
└──────────────┘
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                   AdminProvider Context                 │
│                                                         │
│  ┌──────────────┐         ┌──────────────────────────┐ │
│  │ Mock Data    │         │ History Stack (Undo/Redo)│ │
│  │              │         │                          │ │
│  │ - Home       │ ◄──────►│ [State 1]              │ │
│  │ - About      │         │ [State 2]              │ │
│  │ - Packages   │         │ [State 3] ◄─ Current   │ │
│  │ - Travel     │         │ [State 4]              │ │
│  │ - Services   │         │ [State 5]              │ │
│  └──────────────┘         └──────────────────────────┘ │
│         ▲                                               │
│         │                                               │
│         └──────────────────┬──────────────────────────┘ │
│                            │                            │
└────────────────────────────┼────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │ Update Functions│
                    │                 │
                    │ updateHomeHero()│
                    │ updateAbout()   │
                    │ updatePackages()│
                    │ updateTravelTours
                    │ ... etc         │
                    └────────┬────────┘
                             │
                    ┌────────▼──────────┐
                    │  Editor Components│
                    │                   │
                    │ AdminHomeEditor   │
                    │ AdminAboutEditor  │
                    │ AdminPackagesEdtr │
                    │ etc...            │
                    └───────────────────┘
```

---

## Success Messages (Visual)

When you successfully:

### Save Change
```
[✅] Shows green checkmark
Text color changes to confirmed
Live preview updates instantly
```

### Delete Item
```
[🗑] Item fades out
Removed from list
Can undo with Ctrl+Z
```

### Export Data
```
[⬇] File downloads
Shows notification
File name: website-content.json
```

### Import Data
```
[⬆] Dialog opens
Select file
Data loads instantly
All previous changes replaced
```

---

**The visual interface is professional, modern, and matches your main website design!**

Visit `/admin` to see it in action.
