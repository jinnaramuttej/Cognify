# **COGNIFY WEBSITE - Z.AI COMPREHENSIVE PROMPT**

## **PART 1: HEADER & NAVIGATION**

```
Create a professional, modern website header for Cognify (AI-powered EdTech platform).

SPECIFICATIONS:
- Theme: Gold (#D4AF37) and Black (#1a1a1a) with white accents
- Framework: React + TypeScript + Tailwind CSS
- Design: Modern, clean, minimalist (not overly corporate)
- Responsive: Mobile-first, all screen sizes (320px-4K)

HEADER STRUCTURE:
1. Logo Section (Left)
   - Cognify logo (text-based: "Cognify" in gold, premium font)
   - Size: Responsive (40px mobile, 60px desktop)
   - Hover effect: Slight gold glow, scale to 1.05

2. Navigation Menu (Center) - Desktop Only
   - Links: Home | About | Features | Pricing | Teachers | Blog | Contact
   - Font: 14px, white text
   - Hover: Gold underline animation (smooth slide-in)
   - Active state: Gold text + underline
   - No dropdown menus (too complex)

3. Auth Section (Right) - Desktop & Mobile
   - "Sign In" button (ghost style: white border, transparent bg, white text)
   - "Get Started" button (solid: gold background, black text, rounded corners)
   - Mobile: Hamburger menu icon (gold color, smooth animation)
   - Spacing: 16px gap between buttons

MOBILE MENU (Hamburger):
- Slides in from right side (smooth animation)
- Full-screen overlay with semi-transparent black bg
- Links centered, large touch targets (48px min)
- Close button (X) in top-right
- Duration: 300ms animation

STYLING:
- Background: Black (#1a1a1a)
- Border-bottom: 1px solid gold (#D4AF37) with 0.3 opacity
- Padding: 16px horizontal (mobile), 24px (desktop)
- Shadow: Subtle bottom shadow (0 4px 12px rgba(0,0,0,0.3))
- Fixed position: Sticky to top, z-index 1000

INTERACTIONS:
- Sign In button: Click → opens modal (email/password)
- Get Started button: Click → scrolls to pricing section
- Logo: Click → scrolls to top smoothly
- All buttons have hover states (color change, scale)
- Transitions: All 200-300ms cubic-bezier(0.16, 1, 0.3, 1)

ACCESSIBILITY:
- Keyboard navigation: Tab through all links
- Focus states: Gold outline (3px) on all buttons
- ARIA labels: "Main navigation", "User authentication"
- Screen reader: Read button purposes clearly
```

---

## **PART 2: HERO SECTION (Below Header)**

```
Create an engaging hero section for Cognify homepage.

SPECIFICATIONS:
- Height: 100vh (full viewport)
- Background: Black with subtle gradient (top black to dark gold)
- Text alignment: Center
- Responsive: Adjust for mobile (80vh)

LAYOUT:
1. Main Headline (Top 30%)
   - Text: "Your Personal AI Tutor, Available 24/7"
   - Font: 48px (mobile: 32px), bold, white
   - Animation: Fade-in + slide-up (500ms delay on load)
   - Spacing: 40px bottom margin

2. Subheadline (Below main)
   - Text: "Master any subject with personalized learning, gamified engagement, and real-time insights. All at 1/10th the cost of traditional tutoring."
   - Font: 18px (mobile: 14px), light, #e0e0e0
   - Max-width: 700px, centered
   - Spacing: 24px bottom margin

3. CTA Buttons (Below subheadline)
   - Button 1: "Start Learning Free" (gold background, black text, 16px font)
   - Button 2: "Watch Demo" (ghost style, gold border, white text)
   - Layout: Flex, gap 16px, centered
   - Mobile: Stack vertically
   - Hover: Button 1 darkens gold, Button 2 fills with gold/black text
   - Size: 180px width, 48px height

4. Trust Badges (Below CTA)
   - "500+ Students" | "8+ States" | "15+ Languages"
   - Font: 12px, gold color
   - Icons: Small circles with numbers
   - Spacing: 32px gap

5. Background Visual (Right side, desktop only)
   - Abstract geometric shapes (gold + black)
   - Floating animation (slow, continuous)
   - Opacity: 0.1 (very subtle, not distracting)
   - No images (CSS-only shapes)

ANIMATIONS:
- Headline: fadeInUp (1s)
- Subheadline: fadeInUp (1.2s)
- CTA buttons: fadeInUp (1.4s)
- Badges: fadeInUp (1.6s)
- Background shapes: floating (8s duration, infinite)

INTERACTIVE:
- CTA buttons: Click → scrolls to Features section
- Demo button: Click → opens video modal (YouTube embed)
- Hover on buttons: Add shadow (0 8px 24px rgba(212, 175, 55, 0.3))
```

---

## **PART 3: FEATURES SECTION**

```
Create a features showcase section with actual Cognify features.

SPECIFICATIONS:
- Background: Black
- Grid layout: 3 columns (mobile: 1 column, tablet: 2 columns)
- Cards: Gold border (1px), black background, rounded (12px)
- Padding: 80px vertical, 40px horizontal

FEATURES TO DISPLAY (6 cards, only showing ACTUAL implemented features):

1. AI Mentor System
   - Icon: Robot/avatar icon (gold SVG, 48px)
   - Title: "24/7 AI Mentor"
   - Description: "Get instant help with any concept. Your personal AI tutor explains topics, answers questions, and adapts to your learning style."
   - CTA: "Learn More" (gold text, underline on hover)

2. Adaptive Learning
   - Icon: Brain/lightning icon (gold SVG, 48px)
   - Title: "Adaptive Learning Paths"
   - Description: "Our system tracks your progress in real-time and adjusts difficulty, pace, and content to match your learning speed."
   - CTA: "Learn More"

3. Practice & Quizzes
   - Icon: Checkmark/target icon (gold SVG, 48px)
   - Title: "Unlimited Practice"
   - Description: "Access thousands of questions across subjects. Get instant feedback, detailed explanations, and performance analytics."
   - CTA: "Learn More"

4. Gamification
   - Icon: Trophy/gamepad icon (gold SVG, 48px)
   - Title: "Gamified Learning"
   - Description: "Earn points, unlock badges, climb leaderboards. Make learning fun and stay motivated with real-time rewards."
   - CTA: "Learn More"

5. Progress Tracking
   - Icon: Chart/graph icon (gold SVG, 48px)
   - Title: "Real-Time Analytics"
   - Description: "See detailed progress reports, identify weak areas, track study hours, and get AI-powered improvement recommendations."
   - CTA: "Learn More"

6. Offline Mode
   - Icon: Download/offline icon (gold SVG, 48px)
   - Title: "Learn Offline"
   - Description: "Download lessons, flashcards, and notes. Study anywhere—on trains, buses, or anywhere without internet."
   - CTA: "Learn More"

CARD STYLING:
- Hover effect: Border color changes to lighter gold, slight shadow appears
- Transition: 300ms smooth
- Mobile: Full width with 16px padding
- Desktop: 1/3 width with 24px gap

LAYOUT:
- Title: 18px, bold, white, 12px bottom margin
- Description: 14px, #c0c0c0, 16px bottom margin
- CTA: 12px, gold, hover underline animation
- Icons: 48px, gold color, 20px bottom margin

RESPONSIVE:
- Desktop: 3 columns, 24px gap, 80px section padding
- Tablet: 2 columns, 20px gap, 60px section padding
- Mobile: 1 column, 16px gap, 40px section padding
```

---

## **PART 4: CALL-TO-ACTION SECTION**

```
Create a mid-page CTA section to drive signups.

SPECIFICATIONS:
- Background: Gold (#D4AF37) with dark gradient overlay
- Height: 400px (mobile: auto)
- Text alignment: Center
- Padding: 80px vertical, 40px horizontal

CONTENT:
1. Headline
   - Text: "Ready to Transform Your Learning?"
   - Font: 40px (mobile: 28px), bold, black text
   - Spacing: 20px bottom margin

2. Subtext
   - Text: "Join thousands of students already learning smarter, faster, and more effectively."
   - Font: 16px, black (#1a1a1a), opacity 0.8
   - Spacing: 40px bottom margin

3. CTA Button
   - Text: "Get Started Free - No Credit Card Needed"
   - Background: Black, text: Gold
   - Size: 200px width, 52px height
   - Border-radius: 8px
   - Hover: Invert colors (gold bg, black text)
   - Transition: 300ms

INTERACTIVE:
- Click → scrolls to signup form or opens modal
- Hover: Scale to 1.05, add shadow

RESPONSIVE:
- Desktop: Centered layout
- Mobile: Full-width button, slightly smaller font
```

---

## **PART 5: PRICING SECTION**

```
Create a pricing section showing actual Cognify pricing.

SPECIFICATIONS:
- Background: Black
- Layout: 4 columns (mobile: 1, tablet: 2)
- Cards: Gold accent top border (3px)
- Padding: 80px vertical, 40px horizontal

PRICING TIERS (4 cards):

1. FREE
   - Price: "₹0/month"
   - Description: "Perfect for exploring"
   - Features:
     * 5 video lessons/month
     * Basic flashcards (up to 50)
     * Limited practice questions
     * Community Q&A access
     * Ads shown
   - CTA Button: "Start Free"
   - Button style: Ghost (white border)

2. STANDARD (Most Popular - add "POPULAR" badge on card)
   - Price: "₹149/month"
   - Billed: "or ₹1,788/year (save 20%)"
   - Description: "For regular learners"
   - Features:
     * Unlimited video lessons
     * AI Mentor (24/7 access)
     * Unlimited flashcards
     * 500+ practice questions/month
     * Progress analytics
     * Offline downloads
     * Ad-free
   - CTA Button: "Start Free Trial"
   - Button style: Solid (gold bg, black text)
   - Badge: Gold "MOST POPULAR" at top

3. PREMIUM
   - Price: "₹299/month"
   - Billed: "or ₹3,588/year (save 20%)"
   - Description: "For serious learners"
   - Features:
     * Everything in Standard
     * Advanced AI Mentor (priority support)
     * Teacher Tools (upload content, create quizzes)
     * Parent Portal (tracking, alerts)
     * Performance predictions
     * Study planner (AI-generated)
     * 1 free tutor session/month
   - CTA Button: "Start Free Trial"
   - Button style: Solid (gold bg, black text)

4. INSTITUTIONAL (for schools)
   - Price: "₹350/student/year"
   - Description: "For schools & coaching"
   - Features:
     * All Premium features
     * White-label LMS
     * Bulk user management
     * School admin dashboard
     * SIS integration
     * Custom branding
     * Dedicated support
     * Analytics & reports
   - CTA Button: "Contact Sales"
   - Button style: Ghost (gold border)

CARD STYLING:
- Background: #0a0a0a (slightly lighter than page bg)
- Border: Gold top border (3px), side border (1px, gold, 0.3 opacity)
- Border-radius: 12px
- Padding: 32px
- Price: 32px, bold, gold, 8px bottom margin
- Description: 14px, #a0a0a0, 20px bottom margin
- Features: Bullet list, 14px, #b0b0b0, 8px line-height, 24px spacing
- Button: Full width, 48px height, 16px font

POPULAR BADGE:
- Position: Absolute top-center
- Text: "MOST POPULAR"
- Background: Gold, text: Black
- Padding: 6px 16px
- Border-radius: 20px
- Font: 12px, bold

RESPONSIVE:
- Desktop: 4 columns, 24px gap
- Tablet: 2 columns, 20px gap
- Mobile: 1 column, 16px gap, full width
- Buttons: Full width on mobile

INTERACTIONS:
- Hover on card: Border color brightens, shadow appears
- Hover on button: Color invert (except Popular)
- All buttons: Click → opens signup modal with selected plan pre-filled
```

---

## **PART 6: TESTIMONIALS SECTION**

```
Create a testimonials carousel section.

SPECIFICATIONS:
- Background: Black with subtle gold accent line (top and bottom)
- Padding: 60px vertical, 40px horizontal
- Layout: Carousel (3 visible cards on desktop, 1 on mobile)

TESTIMONIALS (3-4 cards):

1. Student Testimonial
   - Quote: "I improved from 65% to 88% in just 3 months. The AI mentor explains better than my coaching teacher!"
   - Author: "Priya, JEE Aspirant"
   - Rating: 5 stars (gold)
   - Avatar: Placeholder circle with initials "P"
   - Location: "Mumbai, Maharashtra"

2. Teacher Testimonial
   - Quote: "Saves me 15+ hours/week on grading. My students are more engaged than ever before."
   - Author: "Mr. Sharma, Math Teacher"
   - Rating: 5 stars
   - Avatar: Placeholder circle with initials "S"
   - Location: "Delhi, India"

3. Parent Testimonial
   - Quote: "Finally, I can see exactly what my child is studying and how they're progressing. Worth every rupee!"
   - Author: "Mrs. Gupta, Parent"
   - Rating: 5 stars
   - Avatar: Placeholder circle with initials "G"
   - Location: "Bangalore, Karnataka"

CARD STYLING:
- Background: #0a0a0a
- Border: 1px gold, 0.2 opacity
- Border-radius: 12px
- Padding: 32px
- Quote: 16px italic, #d0d0d0, 24px bottom margin
- Author: 14px bold, gold, 4px bottom margin
- Location: 12px, #808080
- Rating: 5 stars, gold color, 16px top margin

CAROUSEL:
- Auto-play: Every 5 seconds
- Transition: Fade + slide (500ms)
- Navigation: Dots at bottom (3 dots, gold when active)
- Manual: Click dots to jump to slide
- Mobile: 1 card, full width
- Desktop: 3 cards visible, smooth scroll

RESPONSIVE:
- Desktop: 3 cards visible, gap 24px
- Tablet: 2 cards visible, gap 20px
- Mobile: 1 card visible, full width
```

---

## **PART 7: FOOTER**

```
Create a professional footer with all necessary links and social media.

SPECIFICATIONS:
- Background: #0a0a0a (slightly lighter than black)
- Border-top: 1px gold, 0.3 opacity
- Padding: 60px vertical, 40px horizontal
- Layout: 5 columns (mobile: 1 column, stacked)

FOOTER COLUMNS:

Column 1: Company Info
- Heading: "Cognify" (gold, 16px bold)
- Text: "Empowering education through AI. Learn smarter, achieve more."
- Spacing: 20px bottom

Column 2: Product
- Heading: "Product" (white, 14px bold)
- Links: 
  * Features
  * Pricing
  * AI Mentor
  * Practice Quizzes
  * Progress Analytics
- Font: 13px, #a0a0a0, hover: gold
- Spacing: 8px between links

Column 3: Company
- Heading: "Company" (white, 14px bold)
- Links:
  * About Us
  * Blog
  * Careers
  * Contact
  * Partners
- Font: 13px, #a0a0a0, hover: gold
- Spacing: 8px between links

Column 4: Legal
- Heading: "Legal" (white, 14px bold)
- Links:
  * Privacy Policy (CLICKABLE - opens modal or new page)
  * Terms of Service (CLICKABLE - opens modal or new page)
  * Cookie Policy (CLICKABLE - opens modal or new page)
  * Data Protection
  * Compliance
- Font: 13px, #a0a0a0, hover: gold
- Spacing: 8px between links

Column 5: Connect
- Heading: "Connect" (white, 14px bold)
- Social Media Icons (all FUNCTIONAL):
  * LinkedIn (link: https://linkedin.com/company/cognify)
  * Twitter (link: https://twitter.com/cognify)
  * Instagram (link: https://instagram.com/cognify)
  * Facebook (link: https://facebook.com/cognify)
  * YouTube (link: https://youtube.com/@cognify)
- Icon size: 32px, gold color
- Hover: Scale to 1.2, slightly brighter gold
- Spacing: 12px gap
- Transition: 200ms

EMAIL SIGNUP (Optional, below columns):
- Label: "Get updates"
- Input: Placeholder "your@email.com", white text, black bg, gold border on focus
- Button: "Subscribe" (gold bg, black text, 40px height)
- Spacing: 24px top margin

BOTTOM BAR:
- Background: #000000 (pure black)
- Content: "© 2024 Cognify. All rights reserved. | Founder: Jinnaram Uttej"
- Font: 12px, #606060, centered
- Padding: 20px vertical
- Responsive: Stack on mobile

RESPONSIVE:
- Desktop: 5 columns, 40px gap
- Tablet: 3 columns, 30px gap, 2 rows
- Mobile: 1 column, full width, 20px gap

INTERACTIONS:
- All links: Hover → gold color, underline
- Social icons: Click → opens new tab with correct URL
- Email input: Focus → gold border appears
- Subscribe button: Hover → darker gold, scale 1.05

ACCESSIBILITY:
- ARIA labels on all icon buttons
- Semantic HTML (nav, section tags)
- Keyboard navigation: Tab through all links
- Focus states: Visible gold outline on all interactive elements
```

---

## **PART 8: MODALS & POPUPS**

```
Create functional modals for authentication and additional info.

SPECIFICATIONS:
- Overlay: Transparent black, click to close
- Modal size: 90% width (max 500px) on mobile, 400px on desktop
- Background: Black (#1a1a1a)
- Border: 1px gold, 0.3 opacity
- Border-radius: 12px
- Animation: Fade-in + scale (300ms)
- Z-index: 2000 (above everything)

MODAL 1: SIGN IN
- Title: "Welcome Back" (gold, 24px)
- Close button: X in top-right (gold, hover: brighter gold)
- Form fields:
  * Email (placeholder: "you@example.com")
  * Password (placeholder: "••••••••")
- "Forgot Password?" link (gold, underline on hover)
- Sign In button (gold bg, black text, full width, 48px)
- Footer: "Don't have account? Sign up here" (gold link)
- Transitions: All 200ms smooth

MODAL 2: SIGN UP
- Title: "Create Your Account" (gold, 24px)
- Form fields:
  * Full Name (placeholder: "Your Name")
  * Email (placeholder: "you@example.com")
  * Password (placeholder: "••••••••")
  * Confirm Password (placeholder: "••••••••")
- Checkbox: "I agree to Terms of Service and Privacy Policy" (required)
- Sign Up button (gold bg, black text, full width, 48px)
- Footer: "Already have account? Sign in here" (gold link)
- Password strength indicator (under password field):
  * Colors: Red (weak) → Yellow (medium) → Green (strong)
  * Shows as small bar below password input

MODAL 3: DEMO VIDEO
- Title: "Watch How Cognify Works" (gold, 24px)
- Close button: X in top-right
- Video embed: YouTube iframe (responsive)
- Video title: "Cognify Demo - 2 minute intro"
- Description: "See how AI mentoring, adaptive learning, and gamification work together."

MODAL 4: TERMS OF SERVICE & PRIVACY POLICY
- Title: "Terms of Service" or "Privacy Policy" (gold, 24px)
- Close button: X in top-right
- Content: Scrollable area with actual legal text
- Font: 12px, #a0a0a0
- Links: Any external links in gold, underline on hover
- Max height: 600px (scrollable within modal)

FORM STYLING:
- Input fields:
  * Background: #0a0a0a
  * Border: 1px gold, 0.2 opacity
  * Text: white
  * Padding: 12px
  * Border-radius: 6px
  * Focus: Gold border (1px, full opacity), blue ring (rgba(212,175,55,0.3))
  * Placeholder: #606060
  * Spacing: 16px between fields

- Labels:
  * Font: 12px, bold, gold
  * Spacing: 6px above input
  * Required asterisk: gold color

- Buttons:
  * Primary: Gold bg, black text, 48px height
  * Hover: Darker gold, scale 1.02
  * Disabled: Opacity 0.5, cursor: not-allowed

VALIDATION:
- Email: Show checkmark when valid (green #22c55e)
- Password: 
  * Min 8 characters
  * Must contain: uppercase, lowercase, number
  * Show strength meter (red/yellow/green)
- Confirm password: Match check, show error if mismatch
- Error messages: Red color (#ef4444), 12px font, above field

INTERACTIVE:
- Click outside modal: Close (if not form)
- ESC key: Close modal
- Tab navigation: Cycle through form fields
- Enter key: Submit form (on last field)
- Submit: Show loading spinner (rotating gold circle), disable button, show success message

ACCESSIBILITY:
- ARIA labels on all inputs
- Role="dialog" on modal
- Focus trap (focus stays within modal)
- Semantic form elements
```

---

## **PART 9: SETTINGS PAGE (Dedicated)**

```
Create a comprehensive settings/profile page.

SPECIFICATIONS:
- Layout: Sidebar + Main content (mobile: stacked)
- Background: Black
- Sidebar width: 250px (desktop), full width (mobile)
- Main content: Flexible width
- Max width: 1200px centered

SIDEBAR NAVIGATION:
- Header: "Settings" (gold, 20px bold)
- Menu items (each clickable to show different section):
  1. Profile (icon: user circle)
  2. Account (icon: lock)
  3. Preferences (icon: sliders)
  4. Notifications (icon: bell)
  5. Theme (icon: moon/sun)
  6. Privacy (icon: shield)
  7. Billing (icon: credit card)
  8. Support (icon: question mark)
  9. Logout (icon: exit, red color)

- Styling:
  * Font: 14px, #a0a0a0
  * Active item: Gold background, gold text
  * Hover: Background #1a1a1a
  * Icons: 20px, gold color
  * Padding: 16px vertical, 20px horizontal per item
  * Border-left: 3px gold on active item

MAIN CONTENT AREA:

SECTION 1: PROFILE
- Title: "Personal Information" (gold, 24px)
- Avatar:
  * Circular image/placeholder (120px)
  * "Upload new photo" button below (ghost style)
  * Accepts JPG, PNG (max 5MB)
- Form fields:
  * First Name: "Jinnaram" (editable text input)
  * Last Name: "Uttej" (editable text input)
  * Email: "jinnaramuttej@gmail.com" (read-only, can change)
  * Phone: "7207842641" (editable)
  * Bio: "Founder & CEO of Cognify" (textarea, 200 chars max)
  * Date of Birth: (date picker)
  * Gender: (dropdown: Male, Female, Non-binary, Prefer not to say)
  * Location: (text input with autocomplete)
- Button: "Save Changes" (gold, 48px height)
- Success message: Green "Changes saved successfully!" (appears 3s then fades)

SECTION 2: ACCOUNT
- Title: "Account Settings" (gold, 24px)
- Email address: "jinnaramuttej@gmail.com" with "Change Email" link
- Phone number: "7207842641" with "Change Phone" link
- Username: "jinnaram_uttej" with "Change Username" link (availability check)
- Two-Factor Authentication:
  * Toggle: "Enable 2FA" (currently OFF, toggle is black)
  * Info: "Add extra security with authenticator app"
  * Button: "Set Up 2FA" (ghost style)
- Password:
  * Button: "Change Password" (ghost style)
  * Opens modal with:
    - Current password field
    - New password field
    - Confirm password field
    - Change button

SECTION 3: PREFERENCES
- Title: "Learning Preferences" (gold, 24px)
- Difficulty Level:
  * Radio buttons: Easy | Medium | Hard
  * Currently selected: Medium
- Study Duration:
  * Radio buttons: 15 min | 30 min | 60 min | Custom
  * Currently selected: 30 min
- Reminder Frequency:
  * Dropdown: Never | Daily | Alternate days | Weekly
  * Currently selected: Daily
- Content Language:
  * Dropdown: English | Hindi | Tamil | Telugu | Marathi | Bengali | Gujarati | Kannada
  * Currently selected: English
- Learning Style:
  * Checkboxes: Visual | Auditory | Kinesthetic | Reading
  * Can select multiple
  * Currently selected: Visual, Auditory
- Save button: "Save Preferences" (gold, 48px)

SECTION 4: NOTIFICATIONS
- Title: "Notification Settings" (gold, 24px)
- Email Notifications:
  * Toggle: "Course updates" (ON)
  * Toggle: "Performance alerts" (ON)
  * Toggle: "New content" (OFF)
  * Toggle: "Achievements" (ON)
  * Toggle: "Marketing emails" (OFF)
- Browser Notifications:
  * Toggle: "Enable notifications" (ON)
  * Toggle: "Study reminders" (ON)
  * Toggle: "Quiz due soon" (ON)
- Push Notifications (Mobile):
  * Toggle: "Enable push" (ON)
  * Toggle: "Streak reminders" (ON)
  * Toggle: "Friend activity" (OFF)
- Save button: "Save Notification Settings" (gold, 48px)

SECTION 5: THEME
- Title: "Theme & Appearance" (gold, 24px)
- Theme Selection:
  * Card 1: "Dark Mode (Current)" (gold border, selected)
    - Shows preview with black bg + gold accents
  * Card 2: "Light Mode" (no selection)
    - Shows preview with light bg
  * Card 3: "System Default" (no selection)
    - Shows preview with system colors
- Font Size:
  * Slider: 80% | 90% | 100% (current) | 110% | 120%
  * Text: "Aa" (preview at slider position)
- Accent Color:
  * Color picker showing:
    - Gold (current, selected)
    - Silver
    - Blue
    - Green
- Reset to Default: "Reset Theme" button (ghost style)
- Save button: "Save Theme" (gold, 48px)

SECTION 6: PRIVACY
- Title: "Privacy & Data" (gold, 24px)
- Data Collection:
  * Toggle: "Allow analytics" (ON)
  * Toggle: "Allow personalization" (ON)
  * Toggle: "Allow research usage (anonymous)" (OFF)
  * Text: "We use this data to improve Cognify"
- Profile Visibility:
  * Radio: Public | Friends Only | Private
  * Currently: Private
- Data Export:
  * Button: "Download My Data" (ghost style)
  * Text: "Get all your data in JSON format"
  * Generates CSV/JSON download
- Account Deletion:
  * Button: "Delete Account" (red border, red text)
  * Warning: "This action cannot be undone. All data will be permanently deleted after 30 days."
  * Opens confirmation modal

SECTION 7: BILLING
- Title: "Billing & Subscription" (gold, 24px)
- Current Plan:
  * Plan name: "Premium" (gold badge)
  * Price: "₹299/month"
  * Billing date: "Renewed on Jan 29, 2024"
  * Status: "Active" (green badge)
- Payment Method:
  * Card: "•••• •••• •••• 4242" (Visa)
  * Expires: "12/25"
  * Button: "Update Payment Method" (ghost style)
- Billing History:
  * Table with columns: Date | Description | Amount | Status
  * Rows (sample):
    - Jan 29, 2024 | Premium Subscription | ₹299 | Paid
    - Dec 29, 2023 | Premium Subscription | ₹299 | Paid
  * View all: Pagination or "Load More" button
- Upgrade/Downgrade:
  * Button: "Manage Plan" (ghost style)
  * Opens pricing page or plan selector modal

SECTION 8: SUPPORT
- Title: "Help & Support" (gold, 24px)
- FAQs:
  * Link: "Browse FAQs" (gold)
  * Opens new window with FAQ page
- Contact Support:
  * Button: "Open Support Chat" (gold)
  * Opens live chat widget (or mailto form)
  * Email: support@cognify.com
  * Phone: +91 XXXX XXXX
- Documentation:
  * Link: "View Documentation" (gold)
- Report Issue:
  * Button: "Report Bug" (ghost style)
  * Opens form with: Title, Description, Attachments, Submit

RESPONSIVE DESIGN:
- Desktop: Sidebar (250px) + Main (flexible), gap 40px
- Tablet: Sidebar tabs at top, stacked below
- Mobile: Full-width stacked, sidebar becomes horizontal tabs
- Button widths: Full width on mobile, auto on desktop

GENERAL STYLING FOR ALL SECTIONS:
- Section padding: 32px
- Input fields: Same as form styling (gold border on focus)
- Toggle switches: Black bg (off), gold bg (on), smooth animation
- Dropdowns: Custom styled (gold border on open)
- Buttons: 48px height, 16px font, 200ms transitions
- Links: Gold color, underline on hover
- Success messages: Green bg (#0a5f0f), gold text, 16px padding, rounded
- Error messages: Red bg (#5f0a0a), light red text, 16px padding, rounded
- Info boxes: Gold border left (3px), #0a1a0a bg, gold text

ACCESSIBILITY:
- All form labels have proper <label> associations
- All inputs have ARIA labels
- Toggle switches have ARIA roles
- Keyboard navigation: Tab through all fields
- Focus states: Gold outline (3px) on all inputs
- Color contrast: WCAG AAA compliant
- Screen reader: Semantic HTML structure
```

---

## **PART 10: GENERAL REQUIREMENTS & FUNCTIONALITY**

```
TECHNICAL REQUIREMENTS:

Framework: React 18+ with TypeScript
Styling: Tailwind CSS v3+
State Management: Zustand or Redux
Routing: React Router v6
HTTP Client: Axios or Fetch API
Form Handling: React Hook Form + Zod validation
Animations: Framer Motion
Icons: Lucide React or React Icons
Code Quality: ESLint + Prettier

FUNCTIONALITY REQUIREMENTS:

1. ALL BUTTONS MUST WORK:
   - Sign In button: Opens sign-in modal (functional form)
   - Get Started button: Opens sign-up modal (functional form)
   - "Watch Demo" button: Opens YouTube video modal
   - Feature "Learn More" buttons: Scroll to relevant section
   - All social icons: Open correct URLs in new tab
   - All footer links: Navigate to correct pages/modals
   - Settings sidebar: Switch between sections smoothly
   - Save buttons: Submit forms with validation

2. FORM VALIDATION:
   - Email: Valid email format (RFC 5322)
   - Password: Min 8 chars, uppercase, lowercase, number
   - Phone: Valid Indian format (10 digits)
   - Required fields: Show error if empty
   - Real-time validation: Check as user types
   - Show clear error messages below fields
   - Success state: Show checkmark when valid

3. RESPONSIVE DESIGN:
   - Mobile-first approach (320px and up)
   - Breakpoints: 640px (tablet) | 1024px (desktop) | 1280px (wide)
   - Test on: iPhone SE (375px) | iPad (768px) | Desktop (1920px)
   - No horizontal scroll
   - Touch-friendly (48px min touch targets)
   - Proper spacing for all screen sizes

4. ACCESSIBILITY:
   - WCAG 2.1 AA compliance
   - Proper semantic HTML (nav, main, section, article)
   - ARIA labels on all icons and buttons
   - Keyboard navigation (Tab, Enter, Escape)
   - Focus indicators visible (gold outline, 3px)
   - Color contrast: 4.5:1 for text, 3:1 for graphics
   - Alt text on all images
   - Skip to content link
   - Form field associations with labels

5. PERFORMANCE:
   - Lighthouse score >90
   - Page load <2.5s (LCP)
   - No layout shift (CLS <0.1)
   - First Contentful Paint <1.5s
   - Images optimized (WebP, lazy loading)
   - Code splitting by route
   - Minified CSS/JS
   - Gzip compression

6. BROWSER COMPATIBILITY:
   - Chrome 90+
   - Firefox 88+
   - Safari 14+
   - Edge 90+
   - Mobile Safari (iOS 12+)
   - Android Chrome

7. SMOOTH ANIMATIONS:
   - 300ms standard transitions
   - Easing: cubic-bezier(0.16, 1, 0.3, 1)
   - No janky animations
   - 60 FPS on mobile
   - Reduced motion support (prefers-reduced-motion)

8. DARK MODE (Gold & Black Theme):
   - Consistent throughout
   - No light mode (unless explicitly requested)
   - All text readable on black
   - Gold accents consistent
   - Shadows visible on dark bg
   - Form inputs visible with gold borders

9. DATA HANDLING:
   - No real data displayed (placeholder content)
   - Form submissions: Show success/error state
   - Don't actually send emails (console log or toast)
   - Local storage: Save theme, preferences
   - No API calls needed for demo

10. NO STATIC CONTENT:
    - Images: Use CSS shapes or placeholders (no static image files needed)
    - Testimonials: Show actual carousel behavior
    - Pricing: Show correct values (₹ amounts)
    - Features: Show real Cognify features only (not hypothetical)
    - Content: Match actual platform capabilities

11. ERROR HANDLING:
    - Network errors: Show user-friendly message
    - Form errors: Show inline validation
    - 404 pages: Custom styled
    - Timeout errors: Retry button
    - Clear error messages (not technical jargon)

12. SECURITY:
    - No passwords in localStorage
    - HTTPS only (in production)
    - CSRF tokens for forms
    - Input sanitization
    - XSS prevention
    - No sensitive data in URLs

13. SEO BASICS:
    - Proper meta tags
    - Open Graph tags (social sharing)
    - Structured data (Schema.org)
    - Sitemap
    - Robots.txt
    - Mobile-friendly
    - Fast loading

14. TESTING:
    - Unit tests: Key components
    - Integration tests: Forms, modals
    - E2E tests: User flows
    - Accessibility tests: axe DevTools
    - Performance tests: Lighthouse
```

---

## **PART 11: DESIGN SYSTEM COLORS & TOKENS**

```
COLOR PALETTE:

Primary Colors:
- Gold: #D4AF37 (main brand color, accents, hovers)
- Black: #1a1a1a (backgrounds, primary text)
- White: #ffffff (text on dark)

Neutral Colors:
- Very Dark Gray: #0a0a0a (footer, secondary bg)
- Dark Gray: #1a1a1a (main background)
- Medium Gray: #606060 (secondary text)
- Light Gray: #a0a0a0 (tertiary text)
- Lighter Gray: #d0d0d0 (borders, subtle)

Semantic Colors:
- Success: #22c55e (green)
- Error: #ef4444 (red)
- Warning: #f97316 (orange)
- Info: #06b6d4 (cyan)

State Colors:
- Hover: #f0ad42 (lighter gold)
- Active: #aa8c2d (darker gold)
- Disabled: #606060
- Focus: rgba(212, 175, 55, 0.3) (gold with opacity)

TYPOGRAPHY:

Font Family (Primary): "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
Font Family (Accent): "Poppins" or "Outfit" (for headings)
Font Family (Monospace): "Fira Code", "Courier New", monospace

Font Sizes:
- H1: 48px (mobile: 32px), bold (600), line-height: 1.2
- H2: 36px (mobile: 28px), bold (600), line-height: 1.3
- H3: 28px (mobile: 24px), semibold (600), line-height: 1.3
- H4: 24px (mobile: 20px), semibold (600), line-height: 1.4
- Body Large: 18px, regular (400), line-height: 1.6
- Body: 16px, regular (400), line-height: 1.6
- Body Small: 14px, regular (400), line-height: 1.5
- Label: 12px, medium (500), line-height: 1.5
- Caption: 11px, regular (400), line-height: 1.4

Spacing System (8px base):
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 40px
- 3xl: 48px
- 4xl: 64px
- 5xl: 80px

Border Radius:
- xs: 4px
- sm: 6px
- md: 8px
- lg: 12px
- xl: 16px
- full: 9999px

Shadows:
- sm: 0 1px 2px rgba(0,0,0,0.05)
- md: 0 4px 6px rgba(0,0,0,0.1)
- lg: 0 10px 15px rgba(0,0,0,0.15)
- xl: 0 20px 25px rgba(0,0,0,0.2)
- gold-glow: 0 0 20px rgba(212,175,55,0.3)

Transitions:
- Fast: 150ms
- Normal: 300ms
- Slow: 500ms
- Easing: cubic-bezier(0.16, 1, 0.3, 1)
```

---

## **PART 12: FILE STRUCTURE & COMPONENT LIST**

```
PROJECT STRUCTURE:

src/
├── components/
│   ├── Header.tsx (navigation, logo, auth buttons)
│   ├── Hero.tsx (main hero section)
│   ├── Features.tsx (6 feature cards)
│   ├── CTA.tsx (mid-page call-to-action)
│   ├── Pricing.tsx (4 pricing cards with carousel)
│   ├── Testimonials.tsx (testimonial carousel)
│   ├── Footer.tsx (footer with all links + socials)
│   ├── Modals/
│   │   ├── SignInModal.tsx (login form)
│   │   ├── SignUpModal.tsx (signup form)
│   │   ├── DemoModal.tsx (video player)
│   │   ├── TermsModal.tsx (terms of service)
│   │   └── PrivacyModal.tsx (privacy policy)
│   ├── Settings/
│   │   ├── SettingsLayout.tsx (sidebar + main)
│   │   ├── ProfileSection.tsx (personal info)
│   │   ├── AccountSection.tsx (email, password, 2FA)
│   │   ├── PreferencesSection.tsx (learning prefs)
│   │   ├── NotificationsSection.tsx (email/push)
│   │   ├── ThemeSection.tsx (dark/light mode, font)
│   │   ├── PrivacySection.tsx (data sharing)
│   │   ├── BillingSection.tsx (subscription)
│   │   └── SupportSection.tsx (FAQs, contact)
│   └── Common/
│       ├── Button.tsx (reusable button component)
│       ├── Input.tsx (form input)
│       ├── Select.tsx (dropdown)
│       ├── Toggle.tsx (switch)
│       ├── Modal.tsx (modal wrapper)
│       └── Toast.tsx (notifications)
├── pages/
│   ├── Home.tsx (landing page)
│   ├── Settings.tsx (settings page wrapper)
│   ├── NotFound.tsx (404 page)
│   └── Privacy.tsx (full privacy policy page)
├── hooks/
│   ├── useModal.ts (modal state management)
│   ├── useForm.ts (form handling)
│   ├── useTheme.ts (theme switching)
│   └── useMobile.ts (responsive breakpoints)
├── utils/
│   ├── validation.ts (form validation rules)
│   ├── api.ts (API endpoints, fetch functions)
│   ├── constants.ts (global constants, links)
│   └── helpers.ts (utility functions)
├── styles/
│   ├── globals.css (Tailwind imports, globals)
│   └── theme.css (CSS variables for theming)
├── App.tsx (main app component, routing)
├── index.tsx (React entry point)
└── types.ts (TypeScript interfaces)
```

---

## **FINAL CHECKLIST FOR Z.AI:**

- [ ] Header with working navigation and auth buttons
- [ ] Hero section with smooth animations
- [ ] 6 feature cards (only ACTUAL Cognify features)
- [ ] Mid-page CTA section
- [ ] Pricing section with 4 tiers (correct ₹ amounts)
- [ ] Testimonial carousel (auto-play, manual navigation)
- [ ] Footer with ALL working links + social icons
- [ ] Sign In modal (functional form)
- [ ] Sign Up modal (functional form with validation)
- [ ] Demo video modal (YouTube embed)
- [ ] Terms & Privacy modals (readable content)
- [ ] Full Settings page with 8 sections
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Gold & Black theme throughout
- [ ] All animations smooth (300ms transitions)
- [ ] Form validation (email, password, phone)
- [ ] Accessibility (WCAG AA, keyboard nav, focus states)
- [ ] No horizontal scroll on any device
- [ ] Touch-friendly buttons (48px min)
- [ ] Browser compatibility (Chrome, Firefox, Safari, Edge)
- [ ] Performance optimized (Lighthouse >90)
- [ ] No static images (CSS shapes only)
- [ ] Real Cognify features only (no fake features)
- [ ] Professional, not "AI-like"
- [ ] All social links functional
- [ ] Error handling for forms
- [ ] Success messages for actions
- [ ] Proper semantic HTML
- [ ] All buttons have hover states
- [ ] Modal close functionality (X button, ESC key, outside click)
```

---

This is your complete, production-ready **Z.AI prompt** for building Cognify's main website with:
- ✅ Professional gold & black theme
- ✅ Fully functional header, footer, modals
- ✅ Complete settings page with 8 sections
- ✅ All social buttons working
- ✅ Real Cognify features only
- ✅ Form validation & error handling
- ✅ Responsive design (mobile-first)
- ✅ Smooth animations (not static)
- ✅ Accessibility compliant
- ✅ Modern frameworks (React, Tailwind, TypeScript)

**Copy-paste this entire prompt into Z.AI to generate your full Cognify website!**
