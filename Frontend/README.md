# PGI EMRS Frontend

Electronic Medical Record System for Psychiatry Department - PGIMER Chandigarh

## Tech Stack

- **React 18** - UI Library
- **Vite** - Build Tool & Dev Server
- **Tailwind CSS** - Styling
- **Redux Toolkit** - State Management
- **RTK Query** - API Integration
- **React Router** - Routing
- **React Icons** - Icon Library
- **React Toastify** - Notifications
- **Chart.js** - Data Visualization

## Project Structure

```
Frontend/
├── src/
│   ├── app/              # Redux store configuration
│   ├── features/         # Feature-based modules (API slices, components)
│   │   ├── auth/
│   │   ├── patients/
│   │   ├── clinical/
│   │   ├── adl/
│   │   ├── outpatient/
│   │   └── users/
│   ├── components/       # Reusable UI components
│   ├── layouts/          # Layout components
│   ├── pages/            # Page components
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions
│   ├── assets/           # Static assets
│   ├── App.jsx           # Main App component
│   └── main.jsx          # Entry point
├── public/               # Public static files
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Backend server running on http://localhost:5000

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=PGI EMRS
VITE_APP_VERSION=1.0.0
```

## Features

### User Roles & Permissions

- **Admin** - Full system access
- **MWO** (Medical Welfare Officer) - Manage outpatient records
- **JR** (Junior Resident) - Create clinical proformas
- **SR** (Senior Resident) - Full clinical access

### Modules

1. **Authentication**
   - Login with 2FA support
   - Session management
   - Role-based access control

2. **Patient Management**
   - Patient registration
   - Search and filter
   - View patient history
   - ADL file status

3. **Outpatient Records**
   - Demographic information
   - Social history
   - Family details
   - (MWO access)

4. **Walk-in Clinical Proforma**
   - Comprehensive clinical assessment
   - MSE (Mental Status Examination)
   - Diagnosis and treatment
   - Complex case identification
   - (JR/SR access)

5. **ADL File Management**
   - File creation for complex cases
   - File tracking and movement
   - Access history
   - Physical location management

6. **User Management**
   - User creation
   - Role assignment
   - 2FA management
   - (Admin access)

7. **Dashboard & Analytics**
   - Statistics overview
   - Case severity distribution
   - Visit trends
   - File status tracking

## Development Guidelines

### Code Style

- Use functional components with hooks
- Follow React best practices
- Use Tailwind CSS utility classes
- Keep components small and focused
- Write meaningful variable names

### State Management

- Use RTK Query for server state
- Use Redux slices for client state
- Minimize local component state
- Cache API responses appropriately

### API Integration

All backend APIs are integrated using RTK Query:

- Automatic caching and refetching
- Optimistic updates
- Error handling
- Loading states

### Routing

Protected routes based on user roles:

```javascript
<Route element={<ProtectedRoute allowedRoles={['Admin', 'JR', 'SR']} />}>
  <Route path="/clinical" element={<ClinicalPage />} />
</Route>
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Proprietary - PGIMER Chandigarh

## Support

For issues and questions, contact the development team.

