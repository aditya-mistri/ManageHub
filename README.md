# CRM Dashboard Pro - TypeScript Migration

A modern CRM system built with TypeScript, featuring a Next.js frontend and Node.js backend with RabbitMQ integration.

## 🚀 Tech Stack

### Backend (TypeScript)
- **Node.js** with **Express.js**
- **TypeScript** for type safety
- **MongoDB** with **Mongoose**
- **RabbitMQ** for message queuing
- **JWT** authentication
- **Google OAuth 2.0**
- **Swagger** API documentation
- **AI Integration** (OpenAI, Gemini, Together AI)

### Frontend (Next.js + TypeScript)
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Zustand** for state management
- **Framer Motion** for animations
- **React Hot Toast** for notifications
- **Headless UI** for accessible components

## 📁 Project Structure

```
├── server-ts/                 # TypeScript Backend
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   ├── controllers/       # Route controllers
│   │   ├── middleware/        # Express middleware
│   │   ├── models/           # Mongoose models
│   │   ├── routes/           # API routes
│   │   ├── types/            # TypeScript type definitions
│   │   ├── utils/            # Utility functions
│   │   ├── consumer-service.ts # RabbitMQ consumer
│   │   └── index.ts          # Main server file
│   ├── dist/                 # Compiled JavaScript
│   ├── package.json
│   └── tsconfig.json
│
├── frontend-nextjs/          # Next.js Frontend
│   ├── src/
│   │   ├── app/              # Next.js App Router
│   │   ├── components/       # React components
│   │   ├── lib/              # Utility libraries
│   │   ├── store/            # Zustand stores
│   │   ├── types/            # TypeScript types
│   │   └── hooks/            # Custom React hooks
│   ├── public/               # Static assets
│   ├── package.json
│   ├── tsconfig.json
│   └── tailwind.config.ts
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+
- MongoDB
- RabbitMQ
- TypeScript

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd server-ts
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment setup:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Build and start:**
   ```bash
   # Development
   npm run dev:all  # Starts both API server and consumer

   # Production
   npm run build
   npm start
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend-nextjs
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment setup:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

## 🔧 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/crm-dashboard-pro
JWT_SECRET=your-super-secret-jwt-key
SESSION_SECRET=your-session-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
RABBITMQ_URL=amqp://localhost
CLIENT_URL=http://localhost:3000
OPENAI_API_KEY=your-openai-api-key
GEMINI_API_KEY=your-gemini-api-key
TOGETHER_API_KEY=your-together-api-key
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

## 🚀 Key Features

### ✅ Type Safety
- Full TypeScript implementation
- Shared type definitions
- Compile-time error checking
- Better IDE support and autocomplete

### ✅ Modern Architecture
- **Backend**: Express.js with TypeScript
- **Frontend**: Next.js 14 with App Router
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Database**: MongoDB with Mongoose

### ✅ Authentication & Authorization
- Google OAuth 2.0 integration
- JWT-based authentication
- Role-based access control (Admin/User)
- Secure session management

### ✅ Real-time Processing
- RabbitMQ message queuing
- Asynchronous data processing
- Event-driven architecture
- Scalable background jobs

### ✅ Campaign Management
- Rule-based audience segmentation
- Campaign creation and tracking
- AI-powered insights
- Performance analytics

### ✅ API Documentation
- Swagger/OpenAPI documentation
- Interactive API explorer
- Type-safe API client

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/register` - User registration
- `GET /api/auth/google` - Google OAuth
- `POST /api/auth/verify-token` - Token verification

### Customers
- `GET /api/customers` - List customers
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Orders
- `GET /api/orders` - List orders
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order
- `GET /api/orders/customer/:id` - Customer orders

### Campaigns
- `GET /api/campaigns` - List campaigns
- `POST /api/campaigns` - Create campaign
- `POST /api/campaigns/segments/preview` - Preview audience
- `POST /api/campaigns/:id/insight` - Generate AI insights

## 🔄 Migration Benefits

### From JavaScript to TypeScript:
1. **Type Safety**: Catch errors at compile time
2. **Better IDE Support**: Enhanced autocomplete and refactoring
3. **Self-Documenting Code**: Types serve as documentation
4. **Easier Refactoring**: Confident code changes
5. **Better Team Collaboration**: Clear interfaces and contracts

### From React to Next.js:
1. **Server-Side Rendering**: Better SEO and performance
2. **App Router**: Modern routing with layouts
3. **Built-in Optimization**: Image optimization, code splitting
4. **API Routes**: Full-stack capabilities
5. **Better Developer Experience**: Hot reloading, TypeScript support

## 🧪 Development Commands

### Backend
```bash
npm run dev          # Start development server
npm run consumer     # Start RabbitMQ consumer
npm run dev:all      # Start both server and consumer
npm run build        # Build TypeScript
npm run type-check   # Type checking only
npm run lint         # ESLint
```

### Frontend
```bash
npm run dev          # Start Next.js development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # ESLint
npm run type-check   # TypeScript checking
```

## 📈 Performance Improvements

1. **TypeScript Compilation**: Optimized builds
2. **Next.js Optimizations**: Automatic code splitting
3. **Image Optimization**: Next.js Image component
4. **Bundle Analysis**: Built-in bundle analyzer
5. **Caching**: Improved caching strategies

## 🔒 Security Enhancements

1. **Type-Safe API**: Prevents runtime errors
2. **Input Validation**: Express-validator with TypeScript
3. **JWT Security**: Typed JWT payloads
4. **CORS Configuration**: Proper origin handling
5. **Environment Variables**: Type-safe env config

## 🚀 Deployment

### Backend Deployment
```bash
npm run build
npm start
```

### Frontend Deployment
```bash
npm run build
npm start
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with proper TypeScript types
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

---

**Note**: This is a complete TypeScript migration of the original CRM Dashboard Pro project, providing better type safety, developer experience, and maintainability.