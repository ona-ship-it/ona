# ONVGUI Production Components Inventory

## 📁 Component Structure

### `/src/app/` - Application Core
```
├── ClientWrapper.tsx      # Content wrapper with sidebar margins
├── HomeClient.tsx         # Client-side home page logic
├── globals.css           # Global styles with theme system
├── head.tsx              # HTML head configuration
├── layout.tsx            # Root layout with theme provider
└── page.tsx              # Main homepage with ONVGUI branding
```

### `/src/components/` - Reusable Components
```
├── AuthButtons.tsx       # Supabase authentication buttons
├── Comments.tsx          # Comment system component
├── FeaturedSection.tsx   # Homepage featured content
├── GoogleSignIn.tsx      # Google OAuth integration
├── MobileTopBar.tsx      # Mobile navigation bar
├── Navigation.tsx        # Main navigation component
├── OnaguiLogo.tsx        # ONVGUI interactive logo
├── OnaguiSymbol.tsx      # ONVGUI brand symbol
├── PageTitle.tsx         # Dynamic page titles
├── ProfilePopup.tsx      # User profile management
├── Sidebar.tsx           # Collapsible navigation sidebar
├── ThemeContext.tsx      # Theme management context
└── ThemeToggle.tsx       # Theme switching component
```

## 🎨 Component Details

### Core Layout Components

#### `ClientWrapper.tsx`
- **Purpose:** Wraps main content with proper margins for sidebar
- **Features:** Responsive flex layout, minimum height handling
- **Dependencies:** React

#### `layout.tsx`
- **Purpose:** Root application layout
- **Features:** Theme provider integration, sidebar inclusion
- **Dependencies:** ThemeProvider, Sidebar, ClientWrapper

#### `page.tsx`
- **Purpose:** Main homepage with ONVGUI branding
- **Features:** Interactive hover cards, animated background
- **Cards:** Giveaways, Fundraise, Raffles, Marketplace

### Navigation Components

#### `Navigation.tsx`
- **Purpose:** Main navigation bar
- **Features:** Search functionality, responsive design, theme integration
- **Components:** OnaguiLogo, AuthButtons, ProfilePopup, ThemeToggle

#### `Sidebar.tsx`
- **Purpose:** Collapsible navigation sidebar
- **Features:** Icon tooltips, local storage persistence, responsive behavior
- **Navigation Items:** Dashboard, Assets, Orders, Account, Referral, Rewards, Settings

### Authentication Components

#### `AuthButtons.tsx`
- **Purpose:** Authentication state management
- **Features:** Login/logout buttons, user state detection
- **Integration:** Supabase auth helpers

#### `ProfilePopup.tsx`
- **Purpose:** User profile management popup
- **Features:** User info display, navigation links, sign out functionality
- **Navigation:** Dashboard, Assets, Orders, Account, Referral, Rewards Hub, Settings

#### `GoogleSignIn.tsx`
- **Purpose:** Google OAuth integration
- **Features:** Social login functionality
- **Integration:** Supabase OAuth

### Branding Components

#### `OnaguiLogo.tsx`
- **Purpose:** Interactive ONVGUI logo
- **Features:** Hover effects, theme-aware styling
- **Animation:** Text color transitions

#### `OnaguiSymbol.tsx`
- **Purpose:** ONVGUI brand symbol
- **Features:** Scalable vector graphics
- **Usage:** Icon representation

### Theme System

#### `ThemeContext.tsx`
- **Purpose:** Global theme management
- **Features:** Theme state, persistence, switching logic
- **Themes:** Default (green), White, Darker

#### `ThemeToggle.tsx`
- **Purpose:** Theme switching interface
- **Features:** Dynamic icons, smooth transitions
- **Icons:** Theme-specific SVG icons

### Content Components

#### `FeaturedSection.tsx`
- **Purpose:** Homepage featured content
- **Features:** Responsive layout, content highlighting

#### `PageTitle.tsx`
- **Purpose:** Dynamic page title management
- **Features:** SEO optimization, consistent styling

#### `Comments.tsx`
- **Purpose:** Comment system functionality
- **Features:** User interaction, content management

## 🔧 Configuration Files

### `globals.css`
- **Adaptive Colors:** Light/dark theme variables
- **Tailwind Integration:** Base, components, utilities
- **Custom Properties:** CSS variables for theming
- **Responsive Design:** Mobile-first approach

### `next.config.js`
- **Image Domains:** Localhost configuration
- **Environment Variables:** Custom key support
- **Build Optimization:** Production settings

### `tailwind.config.js`
- **Theme Extension:** Custom colors and spacing
- **Component Classes:** Utility extensions
- **Responsive Breakpoints:** Mobile-first design

## 📊 Component Dependencies

### External Dependencies
- **React 18+:** Core framework
- **Next.js 15.5.5:** Application framework
- **Tailwind CSS:** Styling system
- **Supabase:** Authentication and backend
- **TypeScript:** Type safety

### Internal Dependencies
```
Navigation → OnaguiLogo, AuthButtons, ProfilePopup, ThemeToggle
Sidebar → ThemeContext (for theme-aware styling)
ProfilePopup → Supabase auth helpers
AuthButtons → Supabase auth helpers
ThemeToggle → ThemeContext
Layout → ThemeProvider, Sidebar, ClientWrapper
Page → Navigation, PageTitle, FeaturedSection, GoogleSignIn
```

## 🎯 Component Status

### ✅ Production Ready
- All components fully implemented
- Theme system operational
- Authentication integrated
- Responsive design complete
- Performance optimized

### 🔄 Integration Points
- **Supabase:** Authentication and user management
- **Theme System:** Consistent styling across components
- **Navigation:** Unified routing and user experience
- **Responsive Design:** Mobile and desktop compatibility

---

**Inventory Complete:** All production components documented and archived  
**Last Updated:** January 2025