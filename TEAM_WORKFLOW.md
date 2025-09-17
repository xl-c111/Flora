# 🌸 Flora Marketplace - Team Workflow & Sprint Planning

**Team:** Anthony, Bevan, Xiaoling, and Lily | **Timeline:** 5-6 weeks

## 📋 Project Overview

Flora is a customer-focused flower marketplace with:

- **Guest checkout** for one-time purchases
- **User accounts** for subscription services
- **Flexible subscriptions** (recurring weekly/monthly + spontaneous)
- **Supabase Auth** for seamless login (email/password + Google)
- **Stripe payments** for secure transactions

---

## 🗓️ Sprint Planning (5-6 Weeks)

### **Week 1-2: Foundation & Core Setup**

**Goal:** Set up infrastructure, basic product browsing, and authentication

### **Week 3-4: Core Features & User Flow**

**Goal:** Complete purchase flows, subscription system, and order management

### **Week 5-6: Polish & Optional Features**

**Goal:** Add enhancements, testing, and deployment

---

## 👥 Team Assignments

### **Person 1: Database & Backend Architecture**

**Focus:** Database design, API infrastructure, and core backend services

#### Week 1-2 Tasks:

- [ ] **Database Setup**

  - Complete Prisma schema implementation
  - Create seed data for products and categories
  - Set up database migrations
  - Test database connections and queries

- [ ] **Core API Foundation**
  - Implement ProductService and ProductController
  - Create product browsing endpoints (`GET /api/products`)
  - Implement search and filtering logic
  - Set up API middleware (validation, error handling)

#### Week 3-4 Tasks:

- [ ] **Order System**
  - Implement OrderService and OrderController
  - Create order creation and management endpoints
  - Build guest checkout logic
  - Integrate with payment processing

#### Week 5-6 Tasks:

- [ ] **Advanced Features**
  - Email service integration
  - Order status tracking
  - Admin endpoints for order management

---

### **Person 2: Frontend UI & Product Experience**

**Focus:** Product browsing, search/filter, and overall user interface

#### Week 1-2 Tasks:

- [ ] **Product Browsing Interface**

  - Create HomePage component with product grid
  - Build ProductCard component
  - Implement ProductDetailModal/Page
  - Design and implement search/filter components

- [ ] **UI Component Library**
  - Create reusable Button, Input, Modal components
  - Set up consistent styling (CSS modules or Tailwind)
  - Implement loading states and error handling
  - Design responsive layouts

#### Week 3-4 Tasks:

- [ ] **Shopping Cart & Checkout UI**
  - Build CartSummary component
  - Create checkout flow pages
  - Implement purchase type selection (one-time vs subscription)
  - Design order confirmation pages

#### Week 5-6 Tasks:

- [ ] **Polish & Enhancement**
  - Product recommendations
  - Advanced filtering options
  - Mobile responsiveness improvements
  - Performance optimizations

---

### **Person 3: Authentication & User Management**

**Focus:** Supabase integration, user accounts, and subscription management

#### Week 1-2 Tasks:

- [ ] **Supabase Auth Setup**

  - Set up Supabase project and authentication
  - Implement login/register components
  - Create AuthContext for React
  - Integrate Google OAuth login

- [ ] **User Management**
  - Build user profile pages
  - Implement address management
  - Create UserService and UserController
  - Set up protected routes

#### Week 3-4 Tasks:

- [ ] **Subscription System**
  - Implement SubscriptionService and SubscriptionController
  - Build subscription management UI
  - Create recurring delivery logic
  - Implement spontaneous delivery feature

#### Week 5-6 Tasks:

- [ ] **User Experience Enhancement**
  - User preferences and recommendations
  - Subscription notifications
  - Account dashboard improvements

---

### **Person 4: Payments & Order Processing**

**Focus:** Stripe integration, order processing, and email notifications

#### Week 1-2 Tasks:

- [ ] **Payment Integration Setup**

  - Set up Stripe test environment
  - Implement PaymentService with Stripe SDK
  - Create payment processing endpoints
  - Build payment form components

- [ ] **Email Service**
  - Set up email service (SendGrid/Nodemailer)
  - Create email templates for order confirmations
  - Implement EmailService for notifications

#### Week 3-4 Tasks:

- [ ] **Order Processing**
  - Implement complete checkout flow
  - Handle payment confirmation and order updates
  - Build guest checkout without registration
  - Create order tracking functionality

#### Week 5-6 Tasks:

- [ ] **Testing & Deployment**
  - End-to-end testing of payment flows
  - Error handling and edge cases
  - Deployment setup and monitoring

---

## 🎯 Key Milestones & Demos

### **End of Week 2 Demo:**

- [ ] Product browsing works
- [ ] Basic authentication functional
- [ ] Database setup complete
- [ ] Payment setup verified

### **End of Week 4 Demo:**

- [ ] Complete guest checkout flow
- [ ] User registration and login
- [ ] Subscription creation working
- [ ] Order confirmation emails sent

### **End of Week 6 Demo:**

- [ ] Full feature set complete
- [ ] All purchase types working
- [ ] Subscription management functional
- [ ] Ready for production deployment

---

## 🛠️ Development Workflow

### **Daily Workflow:**

1. **Start Day:** Pull latest from `main` branch
2. **Create Branch:** `git checkout -b feature/your-feature-name`
3. **Develop:** Work in Dev Container for consistency
4. **Test:** Verify changes work locally
5. **Commit:** Clear commit messages
6. **Push:** Push branch and create Pull Request
7. **Review:** At least one team member reviews
8. **Merge:** Merge to main after approval

### **Communication:**

- **Daily Standups:** Quick progress check
- **Weekly Planning:** Review sprint progress and adjust
- **Blockers:** Communicate immediately in team chat
- **Demos:** End of each sprint show progress

---

## 📚 Key Resources & Documentation

### **Setup & Development:**

- **Main README:** [README.md](./README.md) - Project overview and setup
- **Dependencies:** [DEPENDENCIES.md](./DEPENDENCIES.md) - All project dependencies
- **Troubleshooting:** [DEVCONTAINER_TROUBLESHOOTING.md](./DEVCONTAINER_TROUBLESHOOTING.md)

### **Technical Documentation:**

- **API Endpoints:** [docs/API_ENDPOINTS.md](./docs/API_ENDPOINTS.md)
- **Database Schema:** [docs/DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md)
- **Component Guide:** [docs/COMPONENT_GUIDE.md](./docs/COMPONENT_GUIDE.md)
- **Supabase Setup:** [docs/SUPABASE_SETUP.md](./docs/SUPABASE_SETUP.md)

### **Environment Variables:**

```env
# Backend (.env)
DATABASE_URL="postgresql://flora_user:flora_password@localhost:5432/flora_db"
SUPABASE_URL="your-supabase-project-url"
SUPABASE_ANON_KEY="your-supabase-anon-key"
STRIPE_SECRET_KEY="sk_test_your-stripe-secret"
EMAIL_SERVICE_API_KEY="your-email-api-key"

# Frontend (.env)
VITE_API_URL="http://localhost:3001/api"
VITE_SUPABASE_URL="your-supabase-project-url"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_your-stripe-public"
```

---

## 🚦 Feature Priorities

### **MUST-HAVE (Core Flow):**

1. ✅ Product browsing with filtering
2. ✅ Product detail view/modal
3. ✅ Guest checkout (one-time purchase)
4. ✅ User registration/login (Supabase)
5. ✅ Subscription creation (recurring + spontaneous)
6. ✅ Order confirmation emails

### **SHOULD-HAVE (Week 5-6):**

1. 📦 Product bundles/collections
2. 🔔 Price alerts and notifications
3. 📍 Basic delivery tracking (hardcoded)
4. 🎨 Advanced UI polish and animations

### **COULD-HAVE (If Time Permits):**

1. 📊 User analytics and recommendations
2. 🎁 Gift options and messaging
3. 📱 PWA/mobile app features
4. 🔍 Advanced search with AI

---

## 🎨 Design System & Standards

### **Color Palette:**

```css
--primary: #10b981; /* Flora Green */
--secondary: #f59e0b; /* Warm Amber */
--accent: #ec4899; /* Flower Pink */
--neutral: #6b7280; /* Text Gray */
--background: #f9fafb; /* Clean White */
```

### **Typography:**

- **Headers:** Clean, modern sans-serif
- **Body:** Readable, accessible font sizes
- **Buttons:** Consistent sizing and states

### **Component Standards:**

- **Consistent naming:** PascalCase for components
- **Props interfaces:** Clear TypeScript definitions
- **Error states:** Graceful error handling
- **Loading states:** Smooth loading indicators

---

## 📞 Team Communication

### **When You're Stuck:**

1. **Check documentation** first
2. **Ask in team chat** immediately
3. **Share screen** if needed for debugging
4. **Update task status** so others know

### **Daily Updates:**

- **What did you complete yesterday?**
- **What will you work on today?**
- **Any blockers or questions?**

### **Weekly Reviews:**

- **Demo progress** to the team
- **Discuss any architectural decisions**
- **Plan next week's priorities**

---

**Let's build something amazing! 🌸🚀**

_Remember: Quality over quantity. Better to have a polished core experience than half-finished features._
