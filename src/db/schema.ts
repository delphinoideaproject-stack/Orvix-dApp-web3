import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, numeric } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const submissions = pgTable('submissions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  submissionId: text('submission_id').notNull().unique(),
  contractAddress: text('contract_address').notNull(),
  name: text('name').notNull(),
  symbol: text('symbol').notNull(),
  decimals: text('decimals').notNull(),
  totalSupply: text('total_supply').notNull(),
  buyTax: text('buy_tax'),
  sellTax: text('sell_tax'),
  transferTax: text('transfer_tax'),
  mint: text('mint').notNull(),
  burn: text('burn').notNull(),
  adminControl: text('admin_control').notNull(),
  initialLpAmount: text('initial_lp_amount').notNull(),
  plannedLpSupply: text('planned_lp_supply').notNull(),
  basePair: text('base_pair').notNull(),
  description: text('description').notNull(),
  projectName: text('project_name').notNull(),
  website: text('website').notNull(),
  x: text('x'),
  telegram: text('telegram'),
  discord: text('discord'),
  email: text('email'),
  github: text('github'),
  tokenIcon: text('token_icon'),
  banners: text('banners'),
  ownerAddress: text('owner_address').notNull(),
  premiumTxHash: text('premium_tx_hash').notNull(),
  addLpTxHash: text('add_lp_tx_hash').notNull(),
  lockLpTxHash: text('lock_lp_tx_hash').notNull(),
  status: text('status').default('pending_review').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  submissions: many(submissions),
}));

export const submissionsRelations = relations(submissions, ({ one }) => ({
  author: one(users, {
    fields: [submissions.userId],
    references: [users.id],
  }),
}));
