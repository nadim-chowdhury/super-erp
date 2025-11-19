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

export interface Activity {
  id: string;
  type: "create" | "update" | "delete" | "system" | "comment" | "file";
  module:
    | "inventory"
    | "sales"
    | "customers"
    | "suppliers"
    | "products"
    | "employees"
    | "finance"
    | "system";
  action: string;
  description: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  entityId?: string;
  entityName?: string;
  entityType?: string;
  link?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export const generateActivities = (count: number = 100): Activity[] => {
  const users = [
    { id: "1", name: "John Doe", avatar: undefined },
    { id: "2", name: "Jane Smith", avatar: undefined },
    { id: "3", name: "Mike Johnson", avatar: undefined },
    { id: "4", name: "Sarah Williams", avatar: undefined },
    { id: "5", name: "David Brown", avatar: undefined },
  ];

  const modules: Activity["module"][] = [
    "inventory",
    "sales",
    "customers",
    "suppliers",
    "products",
    "employees",
    "finance",
    "system",
  ];

  const activityTemplates = {
    inventory: {
      create: [
        "Added new product {entityName} to inventory",
        "Created product {entityName} with SKU {sku}",
      ],
      update: [
        "Updated stock level for {entityName}",
        "Modified product details for {entityName}",
        "Changed status of {entityName} to {status}",
      ],
      delete: ["Removed {entityName} from inventory"],
      system: [
        "Low stock alert for {entityName}",
        "{entityName} is out of stock",
        "Reorder point reached for {entityName}",
      ],
    },
    sales: {
      create: [
        "Created new order #{orderNumber} for {customerName}",
        "New order placed: #{orderNumber}",
      ],
      update: [
        "Updated order #{orderNumber} status to {status}",
        "Order #{orderNumber} payment status changed to {paymentStatus}",
        "Modified order #{orderNumber}",
      ],
      delete: ["Cancelled order #{orderNumber}"],
      system: [
        "Order #{orderNumber} has been shipped",
        "Payment received for order #{orderNumber}",
        "Order #{orderNumber} delivered successfully",
      ],
    },
    customers: {
      create: [
        "Added new customer {entityName}",
        "Created customer profile for {entityName}",
      ],
      update: [
        "Updated customer information for {entityName}",
        "Modified customer {entityName} details",
      ],
      delete: ["Removed customer {entityName}"],
      system: [
        "Customer {entityName} reached VIP status",
        "New order from customer {entityName}",
      ],
    },
    suppliers: {
      create: [
        "Added new supplier {entityName}",
        "Created supplier profile for {entityName}",
      ],
      update: [
        "Updated supplier information for {entityName}",
        "Modified supplier {entityName} details",
      ],
      delete: ["Removed supplier {entityName}"],
      system: [
        "New purchase order from {entityName}",
        "Delivery received from {entityName}",
      ],
    },
    products: {
      create: [
        "Added new product {entityName} to catalog",
        "Created product {entityName}",
      ],
      update: [
        "Updated product {entityName}",
        "Modified product details for {entityName}",
      ],
      delete: ["Removed product {entityName} from catalog"],
      system: ["Product {entityName} price updated"],
    },
    employees: {
      create: [
        "Added new employee {entityName}",
        "Created employee profile for {entityName}",
      ],
      update: [
        "Updated employee information for {entityName}",
        "Modified employee {entityName} details",
      ],
      delete: ["Removed employee {entityName}"],
      system: [
        "Employee {entityName} status changed",
        "{entityName} completed onboarding",
      ],
    },
    finance: {
      create: [
        "Created new transaction: {description}",
        "Added {type} transaction for {amount}",
      ],
      update: [
        "Updated transaction {entityName}",
        "Modified transaction details",
      ],
      delete: ["Deleted transaction {entityName}"],
      system: [
        "Payment of ${amount} received",
        "Expense of ${amount} recorded",
        "Monthly financial report generated",
      ],
    },
    system: {
      create: ["System backup completed", "New user registered"],
      update: ["System settings updated", "Configuration changed"],
      delete: ["Old records archived"],
      system: [
        "System maintenance scheduled",
        "Database optimization completed",
        "Security update applied",
      ],
    },
  };

  const activities: Activity[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const module = faker.helpers.arrayElement(modules);
    const user = faker.helpers.arrayElement(users);
    const type = faker.helpers.arrayElement([
      "create",
      "update",
      "delete",
      "system",
    ] as const);
    const templates = activityTemplates[module][type];
    const template = faker.helpers.arrayElement(templates);

    // Generate entity data
    const entityName =
      module === "sales"
        ? `Order #${faker.string.numeric(6)}`
        : module === "finance"
        ? `Transaction ${faker.string.alphanumeric(8)}`
        : faker.commerce.productName();

    const entityId = faker.string.uuid();
    const orderNumber = faker.string.numeric(6);
    const customerName = faker.person.fullName();
    const sku = faker.string.alphanumeric(8).toUpperCase();
    const status = faker.helpers.arrayElement([
      "pending",
      "processing",
      "completed",
      "shipped",
      "delivered",
    ]);
    const paymentStatus = faker.helpers.arrayElement([
      "pending",
      "paid",
      "refunded",
    ]);
    const amount = faker.finance.amount({ min: 100, max: 10000 });
    const type_finance = faker.helpers.arrayElement(["income", "expense"]);

    // Replace placeholders in template
    let description = template
      .replace("{entityName}", entityName)
      .replace("{orderNumber}", orderNumber)
      .replace("{customerName}", customerName)
      .replace("{sku}", sku)
      .replace("{status}", status)
      .replace("{paymentStatus}", paymentStatus)
      .replace("{amount}", amount)
      .replace("{type}", type_finance);

    // Generate link based on module
    let link: string | undefined;
    switch (module) {
      case "inventory":
      case "products":
        link = `/${module}`;
        break;
      case "sales":
        link = "/sales";
        break;
      case "customers":
        link = "/customers";
        break;
      case "suppliers":
        link = "/suppliers";
        break;
      case "employees":
        link = "/employees";
        break;
      case "finance":
        link = "/finance";
        break;
      default:
        link = undefined;
    }

    // Generate timestamp (spread over last 7 days)
    const daysAgo = faker.number.int({ min: 0, max: 7 });
    const hoursAgo = faker.number.int({ min: 0, max: 23 });
    const minutesAgo = faker.number.int({ min: 0, max: 59 });
    const createdAt = new Date(now);
    createdAt.setDate(createdAt.getDate() - daysAgo);
    createdAt.setHours(createdAt.getHours() - hoursAgo);
    createdAt.setMinutes(createdAt.getMinutes() - minutesAgo);

    activities.push({
      id: faker.string.uuid(),
      type,
      module,
      action: `${type}_${module}`,
      description,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      entityId,
      entityName,
      entityType: module,
      link,
      metadata: {
        orderNumber: module === "sales" ? orderNumber : undefined,
        amount: module === "finance" ? amount : undefined,
        status: module === "sales" ? status : undefined,
      },
      createdAt: createdAt.toISOString(),
    });
  }

  // Sort by date (newest first)
  return activities.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  category: "document" | "image" | "report" | "spreadsheet" | "presentation" | "other";
  uploadedBy: string;
  uploadedAt: string;
  modifiedAt: string;
  version: number;
  status: "uploading" | "processing" | "completed" | "error";
  uploadProgress?: number;
  downloadProgress?: number;
  thumbnail?: string;
  description?: string;
  tags: string[];
  associatedEntity?: {
    type: "order" | "product" | "customer" | "supplier" | "employee" | "transaction";
    id: string;
    name: string;
  };
  permissions: {
    canView: boolean;
    canDownload: boolean;
    canDelete: boolean;
    canShare: boolean;
  };
  sharedWith?: string[];
  downloadUrl?: string;
}

export const generateFiles = (count: number = 50): FileItem[] => {
  const fileTypes = {
    document: ["pdf", "doc", "docx", "txt", "rtf"],
    image: ["jpg", "jpeg", "png", "gif", "svg", "webp"],
    report: ["pdf", "xlsx", "csv"],
    spreadsheet: ["xlsx", "xls", "csv"],
    presentation: ["pptx", "ppt"],
    other: ["zip", "rar", "7z"],
  };

  const categories: FileItem["category"][] = [
    "document",
    "image",
    "report",
    "spreadsheet",
    "presentation",
    "other",
  ];

  const users = [
    "John Doe",
    "Jane Smith",
    "Mike Johnson",
    "Sarah Williams",
    "David Brown",
  ];

  const entityTypes: NonNullable<FileItem["associatedEntity"]>["type"][] = [
    "order",
    "product",
    "customer",
    "supplier",
    "employee",
    "transaction",
  ];

  const files: FileItem[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const category = faker.helpers.arrayElement(categories);
    const fileExtension = faker.helpers.arrayElement(fileTypes[category]);
    const fileName = `${faker.system.fileName()}.${fileExtension}`;
    const fileSize = faker.number.int({ min: 1024, max: 50 * 1024 * 1024 }); // 1KB to 50MB
    const uploadedBy = faker.helpers.arrayElement(users);
    const version = faker.number.int({ min: 1, max: 5 });

    // Generate upload date (spread over last 30 days)
    const daysAgo = faker.number.int({ min: 0, max: 30 });
    const hoursAgo = faker.number.int({ min: 0, max: 23 });
    const uploadedAt = new Date(now);
    uploadedAt.setDate(uploadedAt.getDate() - daysAgo);
    uploadedAt.setHours(uploadedAt.getHours() - hoursAgo);

    const modifiedAt = new Date(uploadedAt);
    modifiedAt.setHours(modifiedAt.getHours() + faker.number.int({ min: 0, max: 48 }));

    // Generate tags
    const tagCount = faker.number.int({ min: 0, max: 4 });
    const tags = Array.from({ length: tagCount }, () => faker.word.noun());

    // Generate associated entity (50% chance)
    const hasEntity = faker.datatype.boolean();
    const associatedEntity = hasEntity
      ? {
          type: faker.helpers.arrayElement(entityTypes),
          id: faker.string.uuid(),
          name:
            entityTypes[0] === "order"
              ? `Order #${faker.string.numeric(6)}`
              : faker.commerce.productName(),
        }
      : undefined;

    files.push({
      id: faker.string.uuid(),
      name: fileName,
      type: fileExtension,
      size: fileSize,
      category,
      uploadedBy,
      uploadedAt: uploadedAt.toISOString(),
      modifiedAt: modifiedAt.toISOString(),
      version,
      status: "completed",
      description: faker.datatype.boolean() ? faker.lorem.sentence() : undefined,
      tags,
      associatedEntity,
      permissions: {
        canView: true,
        canDownload: true,
        canDelete: faker.datatype.boolean({ probability: 0.7 }),
        canShare: true,
      },
      sharedWith: faker.datatype.boolean({ probability: 0.3 })
        ? [faker.helpers.arrayElement(users)]
        : undefined,
      downloadUrl: `/api/files/${faker.string.uuid()}/download`,
    });
  }

  // Sort by upload date (newest first)
  return files.sort(
    (a, b) =>
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );
};

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: string; // ISO date string
  end: string; // ISO date string
  allDay: boolean;
  category:
    | "meeting"
    | "deadline"
    | "reminder"
    | "delivery"
    | "payment"
    | "appointment"
    | "other";
  color: string;
  location?: string;
  attendees?: string[];
  recurring?: {
    frequency: "daily" | "weekly" | "monthly" | "yearly";
    interval: number;
    endDate?: string;
  };
  associatedEntity?: {
    type: "order" | "customer" | "supplier" | "employee" | "transaction";
    id: string;
    name: string;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export const generateEvents = (count: number = 50): CalendarEvent[] => {
  const categories: CalendarEvent["category"][] = [
    "meeting",
    "deadline",
    "reminder",
    "delivery",
    "payment",
    "appointment",
    "other",
  ];

  const categoryColors: Record<CalendarEvent["category"], string> = {
    meeting: "#3b82f6", // blue
    deadline: "#ef4444", // red
    reminder: "#f59e0b", // amber
    delivery: "#10b981", // green
    payment: "#8b5cf6", // purple
    appointment: "#ec4899", // pink
    other: "#6b7280", // gray
  };

  const users = [
    "John Doe",
    "Jane Smith",
    "Mike Johnson",
    "Sarah Williams",
    "David Brown",
  ];

  const entityTypes: NonNullable<CalendarEvent["associatedEntity"]>["type"][] =
    ["order", "customer", "supplier", "employee", "transaction"];

  const events: CalendarEvent[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const category = faker.helpers.arrayElement(categories);
    const allDay = faker.datatype.boolean({ probability: 0.3 });
    const createdBy = faker.helpers.arrayElement(users);

    // Generate start date (within next 60 days)
    const daysFromNow = faker.number.int({ min: -30, max: 60 });
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() + daysFromNow);

    if (allDay) {
      startDate.setHours(0, 0, 0, 0);
    } else {
      startDate.setHours(
        faker.number.int({ min: 8, max: 18 }),
        faker.helpers.arrayElement([0, 15, 30, 45]),
        0,
        0
      );
    }

    // Generate end date (1-4 hours after start, or same day for all-day)
    const endDate = new Date(startDate);
    if (allDay) {
      endDate.setDate(endDate.getDate() + faker.number.int({ min: 0, max: 1 }));
    } else {
      endDate.setHours(
        startDate.getHours() + faker.number.int({ min: 1, max: 4 }),
        startDate.getMinutes(),
        0,
        0
      );
    }

    // Generate titles based on category
    const titles = {
      meeting: [
        `Meeting with ${faker.person.fullName()}`,
        `Team Standup`,
        `Client Review`,
        `Project Planning`,
      ],
      deadline: [
        `Order #${faker.string.numeric(6)} Due`,
        `Payment Deadline`,
        `Report Submission`,
        `Project Milestone`,
      ],
      reminder: [
        `Follow up with ${faker.person.fullName()}`,
        `Review Documents`,
        `Check Inventory`,
        `Send Invoice`,
      ],
      delivery: [
        `Delivery from ${faker.company.name()}`,
        `Order #${faker.string.numeric(6)} Delivery`,
        `Supplier Shipment`,
      ],
      payment: [
        `Payment Due: $${faker.finance.amount({ min: 100, max: 10000 })}`,
        `Invoice Payment`,
        `Supplier Payment`,
      ],
      appointment: [
        `Appointment with ${faker.person.fullName()}`,
        `Customer Visit`,
        `Site Inspection`,
      ],
      other: [
        `Task: ${faker.lorem.words(3)}`,
        `Reminder: ${faker.lorem.words(2)}`,
      ],
    };

    const title = faker.helpers.arrayElement(titles[category]);

    // Generate associated entity (40% chance)
    const hasEntity = faker.datatype.boolean({ probability: 0.4 });
    const associatedEntity = hasEntity
      ? {
          type: faker.helpers.arrayElement(entityTypes),
          id: faker.string.uuid(),
          name:
            entityTypes[0] === "order"
              ? `Order #${faker.string.numeric(6)}`
              : faker.person.fullName(),
        }
      : undefined;

    // Generate recurring (20% chance)
    const isRecurring = faker.datatype.boolean({ probability: 0.2 });
    const recurring = isRecurring
      ? {
          frequency: faker.helpers.arrayElement([
            "daily",
            "weekly",
            "monthly",
            "yearly",
          ] as const),
          interval: faker.number.int({ min: 1, max: 3 }),
          endDate: faker.date.future({ years: 1 }).toISOString(),
        }
      : undefined;

    // Generate attendees for meetings
    const attendees =
      category === "meeting"
        ? faker.helpers.arrayElements(users, { min: 1, max: 4 })
        : undefined;

    const createdAt = faker.date.recent({ days: 30 }).toISOString();
    const updatedAt = faker.date.recent({ days: 7 }).toISOString();

    events.push({
      id: faker.string.uuid(),
      title,
      description: faker.datatype.boolean({ probability: 0.6 })
        ? faker.lorem.sentence()
        : undefined,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      allDay,
      category,
      color: categoryColors[category],
      location: faker.datatype.boolean({ probability: 0.4 })
        ? faker.location.streetAddress()
        : undefined,
      attendees,
      recurring,
      associatedEntity,
      createdBy,
      createdAt,
      updatedAt,
    });
  }

  return events;
};

export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: "low" | "medium" | "high" | "urgent";
  assignees: string[];
  dueDate?: string;
  tags: string[];
  boardType: "orders" | "tasks" | "projects";
  metadata?: {
    orderNumber?: string;
    customerName?: string;
    amount?: number;
    projectId?: string;
    taskType?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const generateKanbanCards = (
  boardType: "orders" | "tasks" | "projects",
  count: number = 30
): KanbanCard[] => {
  const cards: KanbanCard[] = [];
  const now = new Date();

  const users = [
    "John Doe",
    "Jane Smith",
    "Mike Johnson",
    "Sarah Williams",
    "David Brown",
  ];

  const priorities: KanbanCard["priority"][] = ["low", "medium", "high", "urgent"];

  if (boardType === "orders") {
    const statuses = ["pending", "processing", "shipped", "delivered"];
    for (let i = 0; i < count; i++) {
      const status = faker.helpers.arrayElement(statuses);
      const orderNumber = `ORD-${faker.string.numeric(6)}`;
      const customerName = faker.person.fullName();
      const amount = parseFloat(faker.finance.amount({ min: 50, max: 5000 }));

      cards.push({
        id: faker.string.uuid(),
        title: `Order ${orderNumber}`,
        description: `Order for ${customerName}`,
        status,
        priority: faker.helpers.arrayElement(priorities),
        assignees: faker.helpers.arrayElements(users, { min: 1, max: 2 }),
        dueDate: (() => {
          const date = new Date();
          date.setDate(date.getDate() + faker.number.int({ min: 1, max: 30 }));
          return date.toISOString();
        })(),
        tags: [faker.commerce.department(), "order"],
        boardType: "orders",
        metadata: {
          orderNumber,
          customerName,
          amount,
        },
        createdAt: faker.date.recent({ days: 60 }).toISOString(),
        updatedAt: faker.date.recent({ days: 7 }).toISOString(),
      });
    }
  } else if (boardType === "tasks") {
    const statuses = ["todo", "in_progress", "review", "done"];
    const taskTypes = ["bug", "feature", "improvement", "documentation"];
    for (let i = 0; i < count; i++) {
      const status = faker.helpers.arrayElement(statuses);
      const taskType = faker.helpers.arrayElement(taskTypes);

      cards.push({
        id: faker.string.uuid(),
        title: faker.lorem.sentence({ min: 3, max: 6 }),
        description: faker.lorem.paragraph(),
        status,
        priority: faker.helpers.arrayElement(priorities),
        assignees: faker.helpers.arrayElements(users, { min: 1, max: 3 }),
        dueDate: (() => {
          const date = new Date();
          date.setDate(date.getDate() + faker.number.int({ min: 1, max: 14 }));
          return date.toISOString();
        })(),
        tags: [taskType, faker.word.noun()],
        boardType: "tasks",
        metadata: {
          taskType,
        },
        createdAt: faker.date.recent({ days: 30 }).toISOString(),
        updatedAt: faker.date.recent({ days: 5 }).toISOString(),
      });
    }
  } else {
    const statuses = ["planning", "active", "review", "completed"];
    for (let i = 0; i < count; i++) {
      const status = faker.helpers.arrayElement(statuses);
      const projectId = `PRJ-${faker.string.alphanumeric(6).toUpperCase()}`;

      cards.push({
        id: faker.string.uuid(),
        title: faker.company.catchPhrase(),
        description: faker.lorem.paragraph(),
        status,
        priority: faker.helpers.arrayElement(priorities),
        assignees: faker.helpers.arrayElements(users, { min: 2, max: 4 }),
        dueDate: (() => {
          const date = new Date();
          date.setDate(date.getDate() + faker.number.int({ min: 1, max: 90 }));
          return date.toISOString();
        })(),
        tags: [faker.word.noun(), "project"],
        boardType: "projects",
        metadata: {
          projectId,
        },
        createdAt: faker.date.recent({ days: 90 }).toISOString(),
        updatedAt: faker.date.recent({ days: 10 }).toISOString(),
      });
    }
  }

  return cards;
};

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

// Chat Types
export interface ChatUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: "online" | "offline" | "away";
  lastSeen?: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: "text" | "file" | "image";
  status: "sending" | "sent" | "delivered" | "read";
  attachments?: {
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
  createdAt: string;
  updatedAt?: string;
}

export interface Chat {
  id: string;
  type: "direct" | "group";
  name: string;
  avatar?: string;
  participants: string[];
  lastMessage?: {
    content: string;
    senderId: string;
    createdAt: string;
  };
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export function generateChatUsers(count: number = 10): ChatUser[] {
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    avatar: faker.image.avatar(),
    status: faker.helpers.arrayElement(["online", "offline", "away"]),
    lastSeen: faker.helpers.arrayElement([
      undefined,
      faker.date.recent({ days: 1 }).toISOString(),
    ]),
  }));
}

export function generateChats(
  users: ChatUser[],
  count: number = 15
): Chat[] {
  const chatTypes: Array<"direct" | "group"> = ["direct", "group"];
  const sampleMessages = [
    "Hey, how are you?",
    "Can we schedule a meeting?",
    "I'll send you the report shortly",
    "Thanks for your help!",
    "Let me know if you need anything",
    "The project is on track",
    "I've reviewed the document",
    "Great work on this!",
    "Can you check this out?",
    "Looking forward to your feedback",
  ];

  return Array.from({ length: count }, () => {
    const type = faker.helpers.arrayElement(chatTypes);
    const participantCount =
      type === "group"
        ? faker.number.int({ min: 3, max: 8 })
        : faker.number.int({ min: 2, max: 2 });
    const selectedUsers = faker.helpers.arrayElements(
      users,
      participantCount
    );
    const participantIds = selectedUsers.map((u) => u.id);
    const lastMessageSender = faker.helpers.arrayElement(selectedUsers);
    const hasUnread = faker.datatype.boolean({ probability: 0.6 });

    return {
      id: faker.string.uuid(),
      type,
      name:
        type === "group"
          ? faker.company.name() + " Team"
          : selectedUsers[0].name,
      avatar: type === "group" ? undefined : selectedUsers[0].avatar,
      participants: participantIds,
      lastMessage: {
        content: faker.helpers.arrayElement(sampleMessages),
        senderId: lastMessageSender.id,
        createdAt: faker.date.recent({ days: 7 }).toISOString(),
      },
      unreadCount: hasUnread ? faker.number.int({ min: 1, max: 10 }) : 0,
      createdAt: faker.date.past({ years: 1 }).toISOString(),
      updatedAt: faker.date.recent({ days: 7 }).toISOString(),
    };
  });
}

export function generateMessages(
  chatId: string,
  participants: string[],
  count: number = 50
): ChatMessage[] {
  const messageTypes: Array<"text" | "file" | "image"> = ["text", "text", "text", "file", "image"];
  const statuses: Array<"sending" | "sent" | "delivered" | "read"> = [
    "sent",
    "delivered",
    "read",
  ];

  return Array.from({ length: count }, (_, index) => {
    const type = faker.helpers.arrayElement(messageTypes);
    const senderId = faker.helpers.arrayElement(participants);
    const createdAt = faker.date.recent({ days: 30 }).toISOString();
    const isRecent = index < count - 5;

    let content = "";
    let attachments: ChatMessage["attachments"] = undefined;

    if (type === "text") {
      content = faker.helpers.arrayElement([
        "Hey, how are you?",
        "Can we schedule a meeting?",
        "I'll send you the report shortly",
        "Thanks for your help!",
        "Let me know if you need anything",
        "The project is on track",
        "I've reviewed the document",
        "Great work on this!",
        "Can you check this out?",
        "Looking forward to your feedback",
        faker.lorem.sentence(),
        faker.lorem.paragraph({ min: 1, max: 3 }),
      ]);
    } else if (type === "file") {
      content = "File attachment";
      attachments = [
        {
          name: faker.system.fileName(),
          url: "#",
          type: faker.system.mimeType(),
          size: faker.number.int({ min: 1000, max: 10000000 }),
        },
      ];
    } else if (type === "image") {
      content = "Image";
      attachments = [
        {
          name: "image.jpg",
          url: faker.image.url(),
          type: "image/jpeg",
          size: faker.number.int({ min: 100000, max: 5000000 }),
        },
      ];
    }

    return {
      id: faker.string.uuid(),
      chatId,
      senderId,
      content,
      type,
      status: isRecent
        ? faker.helpers.arrayElement(statuses)
        : ("read" as const),
      attachments,
      createdAt,
    };
  }).sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}
