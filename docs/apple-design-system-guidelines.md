# Apple Design System Guidelines

## 🎯 **Design Principles**

### **1. Clarity & Simplicity**
- Clean, uncluttered interfaces
- Clear visual hierarchy
- Minimal use of decorative elements
- Focus on content and functionality

### **2. Consistency**
- Unified interaction patterns
- Consistent spacing and typography
- Standardized component behavior
- Predictable user experience

### **3. Accessibility**
- High contrast ratios (minimum 4.5:1)
- Clear focus indicators
- Adequate touch targets (minimum 44px)
- Semantic HTML structure

## 🎨 **Color System**

### **Primary Colors**
```css
/* Apple Blue - Primary brand color */
--apple-blue: #007AFF;
--apple-blue-hover: #0056CC;

/* Apple Grays - Text and backgrounds */
--apple-gray-1: #F5F5F7;  /* Light backgrounds */
--apple-gray-2: #E5E5E7;  /* Borders, dividers */
--apple-gray-3: #D1D1D6;  /* Disabled states */
--apple-gray-4: #8E8E93;  /* Secondary text */
--apple-gray-5: #636366;  /* Body text */
--apple-gray-6: #48484A;  /* Headings */
--apple-gray-7: #1D1D1F;  /* Primary text */
```

### **Semantic Colors**
```css
/* Success - Green */
--success: #34C759;
--success-hover: #30D158;

/* Warning - Orange */
--warning: #FF9500;
--warning-hover: #FF9F0A;

/* Error - Red */
--error: #FF3B30;
--error-hover: #FF453A;

/* Info - Blue */
--info: #007AFF;
--info-hover: #0056CC;
```

## 📝 **Typography**

### **Font Stack**
```css
font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif;
```

### **Font Weights**
- **Regular**: 400 (body text)
- **Medium**: 500 (emphasis, buttons)
- **Semibold**: 600 (headings, labels)
- **Bold**: 700 (strong emphasis)

### **Text Sizes**
```css
/* Headings */
--text-xs: 0.75rem;    /* 12px - Captions */
--text-sm: 0.875rem;   /* 14px - Body small */
--text-base: 1rem;     /* 16px - Body */
--text-lg: 1.125rem;   /* 18px - Headings */
--text-xl: 1.25rem;    /* 20px - Large headings */
--text-2xl: 1.5rem;    /* 24px - Page titles */
--text-3xl: 1.875rem;  /* 30px - Hero titles */
```

### **Text Colors**
```css
/* Primary text */
.text-apple-gray-7  /* #1D1D1F */

/* Secondary text */
.text-apple-gray-5  /* #636366 */

/* Muted text */
.text-apple-gray-4  /* #8E8E93 */

/* Disabled text */
.text-apple-gray-3  /* #D1D1D6 */
```

## 📏 **Spacing System**

### **8px Grid System**
```css
/* Spacing scale */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
```

### **Component Spacing**
```css
/* Card padding */
--card-padding-sm: 0.75rem;   /* 12px */
--card-padding-md: 1rem;      /* 16px */
--card-padding-lg: 1.5rem;    /* 24px */
--card-padding-xl: 2rem;      /* 32px */

/* Button padding */
--button-padding-sm: 0.5rem 0.75rem;   /* 8px 12px */
--button-padding-md: 0.75rem 1rem;     /* 12px 16px */
--button-padding-lg: 1rem 1.5rem;      /* 16px 24px */
```

## 🎭 **Interactive Elements**

### **Buttons**

#### **Primary Button**
```css
.btn-primary {
  @apply bg-apple-blue text-white font-medium px-4 py-2 rounded-apple;
  @apply hover:bg-blue-600 transition-colors duration-200;
  @apply focus:outline-none focus:ring-2 focus:ring-apple-blue/50;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}
```

#### **Secondary Button**
```css
.btn-secondary {
  @apply bg-apple-gray-2 text-apple-gray-7 font-medium px-4 py-2 rounded-apple;
  @apply hover:bg-apple-gray-3 transition-colors duration-200;
  @apply focus:outline-none focus:ring-2 focus:ring-apple-gray-4/50;
  @apply border border-apple-gray-3;
}
```

#### **Ghost Button**
```css
.btn-ghost {
  @apply bg-transparent text-apple-blue font-medium px-4 py-2 rounded-apple;
  @apply hover:bg-apple-blue/10 transition-colors duration-200;
  @apply focus:outline-none focus:ring-2 focus:ring-apple-blue/50;
}
```

### **Input Fields**
```css
.input-field {
  @apply w-full px-3 py-2 border border-apple-gray-3 rounded-apple;
  @apply bg-white text-apple-gray-7 font-sf;
  @apply focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:border-apple-blue;
  @apply placeholder:text-apple-gray-4;
  @apply disabled:bg-apple-gray-1 disabled:text-apple-gray-4;
}
```

### **Cards**
```css
.card {
  @apply bg-white rounded-apple-lg shadow-apple-sm;
  @apply border border-apple-gray-2;
  @apply transition-all duration-200;
}

.card-hover {
  @apply hover:shadow-apple-md hover:bg-apple-gray-1/30;
}
```

## 🎨 **Component Guidelines**

### **1. Action Buttons**
- **Size**: Minimum 44px touch target
- **Spacing**: 8px between buttons
- **Icons**: 16px for standard, 20px for large
- **Colors**: Blue for primary actions, red for destructive

### **2. Form Elements**
- **Labels**: Semibold, apple-gray-7
- **Inputs**: 16px height, proper focus states
- **Validation**: Clear error messages with red color
- **Help text**: Small, apple-gray-4

### **3. Navigation**
- **Active state**: Apple blue background or border
- **Hover state**: Subtle background change
- **Focus state**: Clear ring indicator

### **4. Data Display**
- **Tables**: Clean borders, proper spacing
- **Lists**: Consistent item spacing
- **Cards**: Subtle shadows, rounded corners

## 🔍 **Accessibility Requirements**

### **Color Contrast**
- **Normal text**: 4.5:1 minimum
- **Large text**: 3:1 minimum
- **UI components**: 3:1 minimum

### **Focus Indicators**
```css
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-apple-blue/50;
  @apply focus:ring-offset-2;
}
```

### **Touch Targets**
- **Minimum size**: 44px × 44px
- **Spacing**: 8px between interactive elements
- **Padding**: Adequate padding for easy tapping

## 🎯 **Page Layout Guidelines**

### **1. Page Headers**
```css
.page-header {
  @apply mb-6;
}

.page-title {
  @apply text-2xl font-sf-display font-semibold text-apple-gray-7;
}

.page-subtitle {
  @apply text-apple-gray-5 mt-1;
}
```

### **2. Content Sections**
```css
.content-section {
  @apply mb-8;
}

.section-title {
  @apply text-lg font-sf font-semibold text-apple-gray-7 mb-4;
}
```

### **3. Action Areas**
```css
.action-bar {
  @apply flex items-center justify-between mb-6;
  @apply p-4 bg-apple-gray-1/50 rounded-apple-lg;
}
```

## 📱 **Responsive Design**

### **Breakpoints**
```css
/* Mobile first approach */
--sm: 640px;   /* Small tablets */
--md: 768px;   /* Tablets */
--lg: 1024px;  /* Laptops */
--xl: 1280px;  /* Desktops */
--2xl: 1536px; /* Large screens */
```

### **Mobile Considerations**
- Touch-friendly button sizes
- Adequate spacing for touch
- Simplified navigation
- Optimized content layout

## 🎨 **Animation Guidelines**

### **Transitions**
```css
/* Standard transition */
.transition-standard {
  @apply transition-all duration-200 ease-out;
}

/* Fast transition */
.transition-fast {
  @apply transition-all duration-100 ease-out;
}

/* Slow transition */
.transition-slow {
  @apply transition-all duration-300 ease-out;
}
```

### **Hover Effects**
- **Subtle**: Background color change
- **Lift**: Shadow increase + slight translation
- **Scale**: Small scale transform (1.02)
- **Border**: Color change on border

## 🔧 **Implementation Checklist**

### **For Each Page/Component**
- [ ] Uses Apple color palette
- [ ] Follows 8px grid spacing
- [ ] Implements proper typography
- [ ] Has clear visual hierarchy
- [ ] Includes proper focus states
- [ ] Meets accessibility standards
- [ ] Uses consistent interaction patterns
- [ ] Implements responsive design
- [ ] Has smooth animations
- [ ] Follows Apple design principles

---

**This guide ensures all components and pages maintain consistency with Apple's design language while providing excellent usability and accessibility.** 