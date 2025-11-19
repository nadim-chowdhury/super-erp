# Super ERP - Enterprise Resource Planning System

A modern, production-ready ERP (Enterprise Resource Planning) system built with Next.js, Tailwind CSS, shadcn UI, and Redux Toolkit. This comprehensive solution provides all essential business management features with a clean, minimalist UI and full responsiveness.

## 🚀 Features

### Core Modules

- **Dashboard** - Real-time analytics, metrics, and business insights
- **Inventory Management** - Track products, stock levels, and inventory status
- **Sales & Orders** - Manage customer orders, track sales, and monitor order status
- **Customers** - Comprehensive customer relationship management
- **Suppliers** - Vendor and supplier management system
- **Products** - Product catalog and management
- **Employees** - HR and workforce management
- **Finance** - Financial transactions, income, expenses, and profit tracking
- **Reports** - Comprehensive business reports and analytics
- **Settings** - User preferences, theme customization, and account settings

### Technical Features

- ✅ **Next.js 16** with App Router
- ✅ **TypeScript** for type safety
- ✅ **Redux Toolkit** for state management
- ✅ **Tailwind CSS** for styling
- ✅ **shadcn UI** components
- ✅ **Dark/Light Mode** support
- ✅ **Fully Responsive** design for all devices
- ✅ **Demo Data** simulation for all modules
- ✅ **Production Ready** codebase
- ✅ **Modern UI/UX** with minimal animations

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd super-erp
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

```
super-erp/
├── app/                    # Next.js app router pages
│   ├── page.tsx           # Dashboard
│   ├── inventory/         # Inventory module
│   ├── sales/             # Sales module
│   ├── customers/         # Customers module
│   ├── suppliers/         # Suppliers module
│   ├── products/          # Products module
│   ├── employees/         # Employees module
│   ├── finance/           # Finance module
│   ├── reports/           # Reports module
│   └── settings/          # Settings module
├── components/
│   ├── layout/            # Layout components (Sidebar, Header)
│   ├── providers/         # Context providers (Redux, Theme)
│   └── ui/                # shadcn UI components
├── lib/
│   ├── store/             # Redux store and slices
│   ├── data/              # Demo data generators
│   └── utils.ts           # Utility functions
└── public/                 # Static assets
```

## 🎨 Design System

The project uses a consistent design system with:
- **Color Palette**: Uses CSS variables for theming
- **Typography**: Geist Sans and Geist Mono fonts
- **Components**: shadcn UI components with custom styling
- **Responsive Breakpoints**: Mobile-first approach
- **Dark Mode**: Full dark mode support

## 📱 Responsive Design

All pages are fully responsive and optimized for:
- 📱 Mobile devices (320px+)
- 📱 Tablets (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large screens (1280px+)

## 🛠️ Tech Stack

- **Framework**: Next.js 16
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn UI
- **State Management**: Redux Toolkit
- **Icons**: Lucide React
- **Theme**: next-themes
- **Data Generation**: @faker-js/faker

## 📊 State Management

The application uses Redux Toolkit with the following slices:
- `dashboardSlice` - Dashboard data and analytics
- `inventorySlice` - Inventory management
- `salesSlice` - Sales and orders
- `customersSlice` - Customer data
- `suppliersSlice` - Supplier data
- `productsSlice` - Product catalog
- `employeesSlice` - Employee management
- `financeSlice` - Financial transactions

## 🎯 Demo Data

All modules include realistic demo data generated using Faker.js:
- Products with categories, pricing, and stock levels
- Customers with contact information and order history
- Suppliers with purchase history
- Orders with multiple items and statuses
- Employees with departments and positions
- Financial transactions with income and expenses

## 🚀 Production Build

To create a production build:

```bash
npm run build
npm start
```

## 📝 License

This project is available for commercial use and can be sold as a product.

## 🤝 Contributing

This is a commercial project. For support or customization requests, please contact the project owner.

## 📧 Support

For questions or support, please refer to the project documentation or contact the development team.

---

Built with ❤️ using Next.js, Tailwind CSS, and shadcn UI
