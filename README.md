# Mandalart Planner

*Read this in other languages: [한국어](README_ko.md)*

A comprehensive web application implementing the Mandalart planning methodology for goal setting and achievement tracking. The Mandalart technique uses a structured 9-box framework to break down goals into actionable sub-goals and tasks.

## 🎯 About Mandalart

Mandalart is a goal-setting framework that originated in Japan, popularized by baseball player Shohei Ohtani. It uses a 3x3 grid structure where:
- The center cell contains your main goal
- The surrounding 8 cells contain sub-goals or supporting elements
- Each sub-goal can be expanded into its own 3x3 grid for detailed action planning

## ✨ Key Features

### 📊 Hierarchical Goal Management
- **3-Level Hierarchy**: Main goals → Sub-goals → Action items
- **Interactive Grid**: Navigate through 3x3 grid structures intuitively
- **Visual Progress Tracking**: Real-time completion percentage across all levels
- **Color-Coded Organization**: Customize cells with predefined color schemes

### 🎨 Modern User Experience
- **Mobile-First Design**: Optimized for both mobile and desktop usage
- **Touch Interactions**: Long-press context menus for mobile devices
- **Smooth Animations**: Framer Motion powered transitions and interactions
- **Dark/Light Mode**: Theme support with system preference detection

### 🔐 User Management
- **Secure Authentication**: Supabase-powered user authentication
- **Personal Data**: Each user manages their own private mandalarts
- **Session Management**: Persistent login across browser sessions

### 📱 Cross-Platform Support
- **Responsive Design**: Adapts seamlessly to different screen sizes
- **PWA Ready**: Progressive Web App capabilities
- **iOS Safe Areas**: Proper handling of device notches and home indicators

## 🛠️ Technology Stack

### Frontend
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - Latest React with concurrent features
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS 4.0](https://tailwindcss.com/)** - Modern utility-first styling
- **[Framer Motion](https://www.framer.com/motion/)** - Advanced animations

### Backend & Services
- **[Supabase](https://supabase.com/)** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication & user management
  - Real-time subscriptions
  - Row Level Security (RLS)

### UI Components & Libraries
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautifully designed components
- **[Lucide React](https://lucide.dev/)** - Modern icon library
- **[Sonner](https://sonner.emilkowal.ski/)** - Toast notifications
- **[React Hook Form](https://react-hook-form.com/)** - Performant forms with validation

### Development Tools
- **[ESLint](https://eslint.org/)** - Code linting and formatting
- **[Turbopack](https://turbo.build/pack)** - Ultra-fast bundler for development
- **Path Aliases** - Clean imports with `@/` prefix

## 🏗️ Project Architecture

### Directory Structure
```
src/
├── app/                    # Next.js App Router
│   ├── (dashboard)/       # Protected dashboard routes
│   │   └── app/           # Main application pages
│   ├── auth/              # Authentication pages
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── animations/        # Framer Motion components
│   ├── auth/              # Authentication components
│   ├── dashboard/         # Dashboard-specific components
│   ├── landing/           # Landing page components
│   ├── layout/            # Layout components
│   └── ui/                # Reusable UI components
├── hooks/                 # Custom React hooks
├── services/              # API service layer
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
└── lib/                   # Third-party library configurations
```

### Core Components

#### MandalartGrid
The main 3x3 grid component that displays cells in their traditional Mandalart layout.
- Handles cell positioning and navigation
- Manages visual states (empty, completed, active)
- Supports touch and mouse interactions

#### MandalartCell
Individual cell component with rich functionality:
- Topic and memo text display
- Color customization
- Completion status toggle
- Context menu for actions (edit, delete, mark complete)

#### CellEditorForm
Modal form for creating and editing cells:
- Topic and memo input fields
- Color palette selection
- Form validation with Zod
- Auto-save functionality

#### Navigation System
Breadcrumb-based navigation between hierarchy levels:
- Back navigation to parent levels
- Visual path indication
- Deep-linking support

### Data Architecture

#### Core Data Model
```typescript
interface MandalartCell {
  id: string;                    // Unique identifier
  topic: string;                 // Cell title/subject
  memo?: string;                 // Additional notes
  color?: string;                // Background color
  imageUrl?: string;             // Optional image
  isCompleted: boolean;          // Completion status
  parentId?: string | null;      // Parent cell reference
  depth: number;                 // Hierarchy level (0-2)
  position: number;              // Grid position (1-9)
  mandalartId?: string;          // Root mandalart reference
  children?: MandalartCell[];    // Child cells (UI only)
  progressInfo?: {               // Progress tracking
    totalCells: number;
    completedCells: number;
    progressPercentage: number;
  };
}
```

#### Database Schema
- **mandalarts** - Root mandalart records
- **mandalart_cells** - Individual cell data
- **user_profiles** - Extended user information
- RLS policies ensure data privacy

### Service Layer Architecture

#### MandalartService Class
Centralized API service handling all Supabase operations:
- CRUD operations for cells and mandalarts
- Real-time data synchronization
- Progress calculation via database functions
- Error handling and retry logic

#### Custom Hooks
- **useMandalart** - Main data management and state
- **useMandalartNavigation** - Navigation between cells
- **useCellOperations** - Cell CRUD operations
- **useFormState** - Form state management

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project
- Git for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/mandalart-planner.git
   cd mandalart-planner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create `.env.local` file in the root directory:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Optional: Database direct connection for migrations
   DATABASE_URL=your_postgres_connection_string
   ```

4. **Database Setup**
   
   Run the SQL schema from `docs/Supabase-DB-Schema.md` in your Supabase SQL editor to create:
   - Tables (mandalarts, mandalart_cells, user_profiles)
   - RLS policies for data security
   - Database functions for progress calculation

5. **Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

6. **Sample Data (Optional)**
   ```bash
   npm run sample-data
   ```

### Production Deployment

#### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

#### Environment Variables for Production
```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
```

## 📚 Development Guide

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality
- `npm run sample-data` - Insert sample data for development

### Key Development Concepts

#### Virtual IDs
Temporary cells use `virtual-${timestamp}` IDs during creation before being persisted to the database.

#### Progress Calculation
Real-time progress tracking uses Supabase RPC functions to efficiently calculate completion percentages across the hierarchy.

#### Mobile Optimization
- Touch target sizes follow accessibility guidelines (44px minimum)
- Long-press interactions for context menus
- Safe area handling for iOS devices
- Responsive breakpoints for different screen sizes

#### Animation System
- Framer Motion for page transitions
- Custom Tailwind animation utilities
- Reduced motion support for accessibility

### Code Style Guidelines

#### TypeScript
- Strict mode enabled for type safety
- Interface definitions in `src/types/`
- Path aliases for clean imports (`@/components/...`)

#### Component Structure
- Functional components with hooks
- Props interfaces defined inline or in types file
- Consistent naming conventions (PascalCase for components)

#### Styling
- Tailwind CSS utility classes
- Custom design tokens in `tailwind.config.js`
- OKLCH color space for modern color management

## 🔧 API Reference

### Core Service Methods

#### MandalartService
```typescript
// Fetch mandalart with full hierarchy
await mandalartAPI.fetchMandalartWithHierarchy(mandalartId)

// Create new cell
await mandalartAPI.createCell(cellData)

// Update existing cell
await mandalartAPI.updateCell(cellId, updates)

// Delete cell and children
await mandalartAPI.deleteCell(cellId)

// Calculate progress
await mandalartAPI.calculateProgress(rootCellId)
```

### Database Functions

#### Progress Calculation
```sql
SELECT calculate_mandalart_progress(root_cell_id)
```

#### Cell Hierarchy Queries
```sql
SELECT * FROM get_cell_hierarchy(parent_cell_id)
```

## 🎨 Design System

### Color Palette
The application uses a sophisticated color system based on OKLCH color space:

#### Cell Colors
- **Red**: `oklch(69% 0.18 22)` - High priority/urgent items
- **Orange**: `oklch(75% 0.15 65)` - Medium priority items  
- **Yellow**: `oklch(80% 0.13 85)` - Low priority/ideas
- **Green**: `oklch(68% 0.15 152)` - Completed/success items
- **Blue**: `oklch(69% 0.17 230)` - Information/learning goals
- **Purple**: `oklch(69% 0.15 290)` - Creative/personal goals
- **Pink**: `oklch(72% 0.15 340)` - Relationship/social goals
- **Indigo**: `oklch(69% 0.17 264)` - Professional/career goals

### Typography
- **Primary Font**: Pretendard (Korean-optimized)
- **Monospace Font**: JetBrains Mono
- **Responsive Typography**: Fluid scaling across breakpoints

### Spacing & Layout
- **8px Base Unit**: Consistent spacing system
- **Touch Targets**: Minimum 44px for accessibility
- **Safe Areas**: iOS device compatibility
- **Responsive Breakpoints**: xs(360px), sm(640px), md(768px), lg(1024px), xl(1280px), 2xl(1536px)

## 🧪 Testing Strategy

### Unit Testing
- Component testing with React Testing Library
- Hook testing with @testing-library/react-hooks
- Service layer testing with Jest

### Integration Testing
- API endpoint testing
- Database operation testing
- Authentication flow testing

### E2E Testing
- Critical user journeys
- Cross-browser compatibility
- Mobile device testing

## 🚀 Performance Optimizations

### Frontend Optimizations
- **Code Splitting**: Automatic with Next.js App Router
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: Built-in bundle analyzer
- **Caching**: Aggressive caching strategies

### Database Optimizations
- **Indexing**: Optimized database indexes
- **RLS Policies**: Efficient row-level security
- **Query Optimization**: Minimized database round trips
- **Real-time**: Selective real-time subscriptions

## 🔒 Security Considerations

### Authentication & Authorization
- JWT-based authentication via Supabase
- Row Level Security (RLS) policies
- Protected routes with middleware
- Session management

### Data Protection
- Input validation and sanitization
- XSS protection
- CSRF protection
- SQL injection prevention (via Supabase ORM)

### Privacy
- User data isolation
- No data sharing between users
- Secure environment variable handling

## 📖 Additional Documentation

For more detailed information, refer to the `docs/` directory:

- **[TypeScript Type Definitions](docs/TypeScript-정의.md)** - Complete type system documentation
- **[Services & Hooks Implementation](docs/Services-Hooks-구현.md)** - Service layer and custom hooks
- **[Supabase Database Schema](docs/Supabase-DB-Schema.md)** - Database design and setup
- **[Cell Page Structure](docs/Cell-Page-구조.md)** - Component architecture details
- **[Implementation Records](docs/구현_기록/)** - Development history and decisions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript strict mode
- Write tests for new features
- Update documentation for API changes
- Follow existing code style and conventions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Mandalart Methodology** - Originally developed in Japan
- **Shohei Ohtani** - Popularized the technique in modern goal setting
- **Open Source Community** - For the amazing tools and libraries used

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/mandalart-planner/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/mandalart-planner/discussions)
- **Documentation**: See `docs/` directory for detailed guides

---

**Built with ❤️ using Next.js and Supabase**