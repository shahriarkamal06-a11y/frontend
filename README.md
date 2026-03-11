# EcomSaaS Frontend

A modern, enterprise-level eCommerce frontend built with React, Vite, and Tailwind CSS.

## 🚀 Features

### Core Features
- **Multi-Vendor Architecture** - Support for admin, vendor, and customer roles
- **Dynamic Theme System** - Fully customizable themes with CSS variables
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **State Management** - Zustand for efficient state management
- **Authentication** - JWT-based auth with refresh tokens
- **Shopping Cart** - Persistent cart with real-time updates
- **Wishlist** - Save products for later
- **Search & Filters** - Advanced product search and filtering
- **Payment Integration** - Stripe payment processing ready

### Technical Features
- **Modern React** - React 19 with hooks and functional components
- **TypeScript Ready** - Easy migration to TypeScript
- **Performance Optimized** - Code splitting and lazy loading
- **API Integration** - Axios with interceptors and error handling
- **Form Validation** - React Hook Form with Zod validation
- **Toast Notifications** - User-friendly notifications
- **Loading States** - Comprehensive loading and error states

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Basic UI components (Button, Input, etc.)
│   ├── layout/          # Layout components (Header, Footer)
│   ├── cart/            # Cart-related components
│   ├── product/         # Product-related components
│   └── common/          # Common components
├── pages/               # Page components
│   ├── public/          # Public pages (Home, Products, etc.)
│   ├── auth/            # Authentication pages
│   ├── customer/        # Customer dashboard pages
│   ├── admin/           # Admin dashboard pages
│   └── vendor/          # Vendor dashboard pages
├── store/               # Zustand store configuration
├── services/            # API services and HTTP client
├── utils/               # Utility functions
├── constants/           # Application constants
├── hooks/               # Custom React hooks
└── assets/              # Static assets
```

## 🛠️ Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```
   VITE_API_URL=http://localhost:3001/api
   VITE_APP_NAME=EcomSaaS
   VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key_here
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

## 🎨 Theme System

The application features a dynamic theme system that allows real-time customization:

### CSS Variables
All colors and styling properties are defined as CSS variables in `src/index.css`:
```css
:root {
  --color-primary-500: rgb(59 130 246);
  --color-secondary-500: rgb(100 116 139);
  --font-family: 'Inter', sans-serif;
  --border-radius: 8px;
}
```

### Theme Store
The theme store (`src/store/index.js`) manages theme state:
```javascript
const { currentTheme, setTheme, updateTheme } = useThemeStore();
```

### Applying Themes
Themes are applied using the `applyTheme` utility function that updates CSS variables dynamically.

## 🔐 Authentication

The authentication system supports:
- Login/Register with email and password
- JWT tokens with automatic refresh
- Role-based access control
- Social login integration ready
- Password reset functionality

### Usage
```javascript
const { user, login, logout, isAuthenticated } = useAuthStore();
```

## 🛒 Shopping Cart

The cart system features:
- Persistent storage
- Real-time updates
- Quantity management
- Coupon support
- Tax and shipping calculation

### Usage
```javascript
const { items, addItem, updateItem, removeItem, total } = useCartStore();
```

## 📱 Responsive Design

The application is fully responsive with:
- Mobile-first approach
- Tailwind CSS breakpoints
- Touch-friendly interactions
- Optimized mobile navigation

## 🔧 API Integration

API services are organized in `src/services/api.js`:
- Axios instance with interceptors
- Automatic token refresh
- Error handling
- Request/response transformation

### Usage
```javascript
import { productAPI, userAPI, orderAPI } from '../services/api';

const products = await productAPI.getProducts();
```

## 🎯 State Management

Using Zustand for state management:
- **Auth Store** - User authentication and profile
- **Cart Store** - Shopping cart state
- **Wishlist Store** - User wishlist
- **Theme Store** - Theme customization
- **UI Store** - UI state (modals, loading, etc.)

## 📋 Form Handling

Forms use React Hook Form with Zod validation:
```javascript
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
});
```

## 🚀 Performance

Performance optimizations include:
- Code splitting with React.lazy
- Image optimization
- Memoization of expensive operations
- Efficient re-renders with proper state management
- Bundle size optimization

## 🧪 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style
- ESLint configuration included
- Prettier formatting recommended
- Consistent naming conventions
- Component-based architecture

## 🔮 Future Enhancements

Planned features:
- Progressive Web App (PWA) support
- Offline functionality
- Advanced analytics
- Multi-language support
- Advanced search with Elasticsearch
- Real-time notifications
- Advanced admin dashboard

## 📚 Dependencies

### Core Dependencies
- **React 19** - UI library
- **React Router DOM** - Client-side routing
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework

### State & Data
- **Zustand** - State management
- **TanStack Query** - Server state management
- **Axios** - HTTP client

### Forms & Validation
- **React Hook Form** - Form handling
- **Zod** - Schema validation

### UI & UX
- **Lucide React** - Icon library
- **React Hot Toast** - Notifications
- **Framer Motion** - Animations
- **React Beautiful DnD** - Drag and drop

### Utilities
- **clsx** - Conditional classes
- **tailwind-merge** - Tailwind class merging
- **date-fns** - Date utilities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Contact the development team

---

Built with ❤️ for modern eCommerce businesses.