import { relations } from 'drizzle-orm';

import {
  products,
  prices,
} from '../../../migrations/schema';

// Dont Delete!!!
export const productsRelations = relations(products, ({ many }) => ({
  prices: many(prices),
}));

export const pricesRelations = relations(prices, ({ one }) => ({
  product: one(products, {
    fields: [prices.productId],
    references: [products.id],
  }),
}));