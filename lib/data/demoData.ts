import { faker } from "@faker-js/faker";

// Types
export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  status: "in_stock" | "low_stock" | "out_of_stock";
  supplier: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  status: "active" | "inactive";
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  productsCount: number;
  totalPurchases: number;
  status: "active" | "inactive";
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "refunded";
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  salary: number;
  status: "active" | "on_leave" | "terminated";
  hireDate: string;
}

export interface Transaction {
  id: string;
  type: "income" | "expense";
  category: string;
  description: string;
  amount: number;
  date: string;
  status: "completed" | "pending";
}

// Generate demo data
const categories = [
  "Electronics",
  "Clothing",
  "Food & Beverages",
  "Home & Garden",
  "Sports",
  "Books",
  "Toys",
  "Automotive",
];
const departments = [
  "Sales",
  "Marketing",
  "IT",
  "HR",
  "Finance",
  "Operations",
  "Customer Service",
  "Warehouse",
];
const positions = [
  "Manager",
  "Senior",
  "Junior",
  "Intern",
  "Director",
  "Specialist",
  "Coordinator",
];

export const generateProducts = (count: number = 100): Product[] => {
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    name: faker.commerce.productName(),
    sku: faker.string.alphanumeric(8).toUpperCase(),
    category: faker.helpers.arrayElement(categories),
    price: parseFloat(faker.commerce.price({ min: 10, max: 1000 })),
    cost: parseFloat(faker.commerce.price({ min: 5, max: 500 })),
    stock: faker.number.int({ min: 0, max: 500 }),
    minStock: faker.number.int({ min: 10, max: 50 }),
    status: "in_stock" as const,
    supplier: faker.company.name(),
    createdAt: faker.date.past({ years: 2 }).toISOString(),
  })).map((p) => ({
    ...p,
    status:
      p.stock === 0
        ? ("out_of_stock" as const)
        : p.stock < p.minStock
        ? ("low_stock" as const)
        : ("in_stock" as const),
  }));
};

export const generateCustomers = (count: number = 50): Customer[] => {
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    company: faker.datatype.boolean() ? faker.company.name() : undefined,
    address: faker.location.streetAddress({ useFullAddress: true }),
    totalOrders: faker.number.int({ min: 0, max: 100 }),
    totalSpent: parseFloat(faker.commerce.price({ min: 0, max: 50000 })),
    status: faker.helpers.arrayElement(["active", "inactive"] as const),
    createdAt: faker.date.past({ years: 3 }).toISOString(),
  }));
};

export const generateSuppliers = (count: number = 30): Supplier[] => {
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    name: faker.company.name(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    address: faker.location.streetAddress({ useFullAddress: true }),
    productsCount: faker.number.int({ min: 1, max: 50 }),
    totalPurchases: parseFloat(
      faker.commerce.price({ min: 1000, max: 100000 })
    ),
    status: faker.helpers.arrayElement(["active", "inactive"] as const),
    createdAt: faker.date.past({ years: 2 }).toISOString(),
  }));
};

export const generateOrders = (
  count: number = 200,
  customers: Customer[],
  products: Product[]
): Order[] => {
  return Array.from({ length: count }, () => {
    const customer = faker.helpers.arrayElement(customers);
    const itemCount = faker.number.int({ min: 1, max: 5 });
    const items: OrderItem[] = Array.from({ length: itemCount }, () => {
      const product = faker.helpers.arrayElement(products);
      const quantity = faker.number.int({ min: 1, max: 10 });
      const price = product.price;
      return {
        productId: product.id,
        productName: product.name,
        quantity,
        price,
        total: price * quantity,
      };
    });
    const total = items.reduce((sum, item) => sum + item.total, 0);

    return {
      id: faker.string.uuid(),
      orderNumber: `ORD-${faker.string.alphanumeric(8).toUpperCase()}`,
      customerId: customer.id,
      customerName: customer.name,
      items,
      total,
      status: faker.helpers.arrayElement([
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ] as const),
      paymentStatus: faker.helpers.arrayElement([
        "pending",
        "paid",
        "refunded",
      ] as const),
      createdAt: faker.date.past({ years: 1 }).toISOString(),
      updatedAt: faker.date.recent({ days: 30 }).toISOString(),
    };
  });
};

export const generateEmployees = (count: number = 40): Employee[] => {
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    department: faker.helpers.arrayElement(departments),
    position: faker.helpers.arrayElement(positions),
    salary: faker.number.int({ min: 30000, max: 150000 }),
    status: faker.helpers.arrayElement([
      "active",
      "on_leave",
      "terminated",
    ] as const),
    hireDate: faker.date.past({ years: 5 }).toISOString(),
  }));
};

export const generateTransactions = (count: number = 300): Transaction[] => {
  const incomeCategories = ["Sales", "Services", "Interest", "Other Income"];
  const expenseCategories = [
    "Salaries",
    "Rent",
    "Utilities",
    "Marketing",
    "Inventory",
    "Maintenance",
    "Other Expenses",
  ];

  return Array.from({ length: count }, () => {
    const type = faker.helpers.arrayElement(["income", "expense"] as const);
    return {
      id: faker.string.uuid(),
      type,
      category: faker.helpers.arrayElement(
        type === "income" ? incomeCategories : expenseCategories
      ),
      description: faker.finance.transactionDescription(),
      amount: parseFloat(faker.finance.amount({ min: 10, max: 10000 })),
      date: faker.date.past({ years: 1 }).toISOString(),
      status: faker.helpers.arrayElement(["completed", "pending"] as const),
    };
  });
};

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: string;
  link?: string;
}

export const generateNotifications = (count: number = 15): Notification[] => {
  const notificationTemplates = [
    {
      type: "success" as const,
      titles: [
        "Order Completed",
        "Payment Received",
        "Inventory Updated",
        "Customer Added",
      ],
      messages: [
        "Order #{order} has been successfully completed",
        "Payment of ${amount} has been received",
        "Inventory levels have been updated",
        "New customer has been added to the system",
      ],
    },
    {
      type: "warning" as const,
      titles: [
        "Low Stock Alert",
        "Pending Payment",
        "Order Delayed",
        "Inventory Warning",
      ],
      messages: [
        "{product} is running low on stock",
        "Payment pending for order #{order}",
        "Order #{order} delivery has been delayed",
        "Multiple products are running low on stock",
      ],
    },
    {
      type: "error" as const,
      titles: [
        "Order Cancelled",
        "Payment Failed",
        "Stock Out",
        "System Error",
      ],
      messages: [
        "Order #{order} has been cancelled",
        "Payment processing failed for order #{order}",
        "{product} is out of stock",
        "System error detected, please check",
      ],
    },
    {
      type: "info" as const,
      titles: ["New Order", "System Update", "Report Generated", "Reminder"],
      messages: [
        "New order #{order} has been placed",
        "System update available",
        "Monthly report has been generated",
        "Reminder: Review pending tasks",
      ],
    },
  ];

  return Array.from({ length: count }, (_, index) => {
    const template = faker.helpers.arrayElement(notificationTemplates);
    const titleIndex = faker.number.int({
      min: 0,
      max: template.titles.length - 1,
    });
    const messageIndex = faker.number.int({
      min: 0,
      max: template.messages.length - 1,
    });

    const title = template.titles[titleIndex];
    let message = template.messages[messageIndex];

    // Replace placeholders
    message = message.replace(
      "{order}",
      faker.string.alphanumeric(8).toUpperCase()
    );
    message = message.replace(
      "{amount}",
      faker.commerce.price({ min: 50, max: 5000 })
    );
    message = message.replace("{product}", faker.commerce.productName());

    return {
      id: faker.string.uuid(),
      title,
      message,
      type: template.type,
      read: index > 4, // First 5 are unread
      createdAt: faker.date.recent({ days: 7 }).toISOString(),
      link: faker.datatype.boolean()
        ? `/${faker.helpers.arrayElement([
            "sales",
            "inventory",
            "customers",
            "finance",
          ])}`
        : undefined,
    };
  });
};
