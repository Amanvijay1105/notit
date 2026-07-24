import {
  pgTable,
  pgEnum,
  uuid,
  timestamp,
  text,
  integer,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core";

// ============================================================
// ENUMS
// ============================================================

export const pricingPlanInterval = pgEnum("pricing_plan_interval", [
  "day",
  "week",
  "month",
  "year",
]);

export const pricingType = pgEnum("pricing_type", ["one_time", "recurring"]);

export const subscriptionStatus = pgEnum("subscription_status", [
  "trialing",
  "active",
  "canceled",
  "incomplete",
  "incomplete_expired",
  "past_due",
  "unpaid",
]);

// ============================================================
// USERS
// ============================================================

export const users = pgTable("users", {
  id: uuid("id").primaryKey().notNull(),

  fullName: text("full_name"),

  avatarUrl: text("avatar_url"),

  billingAddress: jsonb("billing_address"),

  paymentMethod: jsonb("payment_method"),

  email: text("email"),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    mode: "string",
  }),
});

// ============================================================
// WORKSPACES
// ============================================================

export const workspaces = pgTable("workspaces", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),

  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "string",
  })
    .defaultNow()
    .notNull(),

  workspaceOwner: uuid("workspace_owner").notNull(),

  title: text("title").notNull(),

  iconId: text("icon_id").notNull(),

  data: text("data"),

  inTrash: text("in_trash"),

  logo: text("logo"),

  bannerUrl: text("banner_url"),
});

// ============================================================
// FOLDERS
// ============================================================

export const folders = pgTable("folders", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),

  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "string",
  })
    .defaultNow()
    .notNull(),

  title: text("title").notNull(),

  iconId: text("icon_id").notNull(),

  data: text("data"),

  inTrash: text("in_trash"),

  bannerUrl: text("banner_url"),

  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, {
      onDelete: "cascade",
    }),
});

// ============================================================
// FILES
// ============================================================

export const files = pgTable("files", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),

  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "string",
  })
    .defaultNow()
    .notNull(),

  title: text("title").notNull(),

  iconId: text("icon_id").notNull(),

  data: text("data"),

  inTrash: text("in_trash"),

  bannerUrl: text("banner_url"),

  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, {
      onDelete: "cascade",
    }),

  folderId: uuid("folder_id")
    .notNull()
    .references(() => folders.id, {
      onDelete: "cascade",
    }),
});

// ============================================================
// COLLABORATORS
// ============================================================

export const collaborators = pgTable("collaborators", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),

  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, {
      onDelete: "cascade",
    }),

  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "string",
  })
    .defaultNow()
    .notNull(),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),
});

// ============================================================
// PRODUCTS
// ============================================================

export const products = pgTable("products", {
  id: uuid("id").primaryKey().notNull(),

  active: boolean("active"),

  name: text("name"),

  description: text("description"),

  image: text("image"),

  metadata: jsonb("metadata"),
});

// ============================================================
// PRICES
// ============================================================

export const prices = pgTable("prices", {
  id: text("id").primaryKey().notNull(),

  productId: uuid("product_id").references(() => products.id, {
    onDelete: "cascade",
  }),

  active: boolean("active"),

  description: text("description"),

  unitAmount: integer("unit_amount"),

  currency: text("currency"),

  type: pricingType("type"),

  interval: pricingPlanInterval("interval"),

  intervalCount: integer("interval_count"),

  trialPeriodDays: integer("trial_period_days"),

  metadata: jsonb("metadata"),
});

// ============================================================
// SUBSCRIPTIONS
// ============================================================

export const subscriptions = pgTable("subscriptions", {
  id: text("id").primaryKey().notNull(),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),

  status: subscriptionStatus("status"),

  metadata: jsonb("metadata"),

  priceId: text("price_id").references(() => prices.id),

  razorpayOrderId: text("razorpay_order_id"),

  razorpayPaymentId: text("razorpay_payment_id"),

  quantity: integer("quantity"),

  cancelAtPeriodEnd: boolean("cancel_at_period_end"),

  created: timestamp("created", {
    withTimezone: true,
    mode: "string",
  })
    .defaultNow()
    .notNull(),

  currentPeriodStart: timestamp("current_period_start", {
    withTimezone: true,
    mode: "string",
  })
    .defaultNow()
    .notNull(),

  currentPeriodEnd: timestamp("current_period_end", {
    withTimezone: true,
    mode: "string",
  })
    .defaultNow()
    .notNull(),

  endedAt: timestamp("ended_at", {
    withTimezone: true,
    mode: "string",
  }),

  cancelAt: timestamp("cancel_at", {
    withTimezone: true,
    mode: "string",
  }),

  canceledAt: timestamp("canceled_at", {
    withTimezone: true,
    mode: "string",
  }),

  trialStart: timestamp("trial_start", {
    withTimezone: true,
    mode: "string",
  }),

  trialEnd: timestamp("trial_end", {
    withTimezone: true,
    mode: "string",
  }),
});
