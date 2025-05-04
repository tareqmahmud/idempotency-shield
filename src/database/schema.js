import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const idempotencyKeys = sqliteTable("idempotency_keys", {
  id: integer("id").primaryKey({autoIncrement: true}),
  key: text("key").notNull(),
  createdAt: integer('created_at', {mode: "timestamp"}).$defaultFn(() => new Date())
})

export const payments = sqliteTable("payments", {
  id: integer("id").primaryKey({autoIncrement: true}),
  amount: integer("amount").notNull(),
  orderId: text("order_id").notNull(),
  status: text("status").notNull(),
})