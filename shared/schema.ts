import { pgTable, text, serial, integer, boolean, timestamp, numeric, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  phoneNumber: text("phone_number"),
  isKycVerified: boolean("is_kyc_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const mutualFunds = pgTable("mutual_funds", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  fundName: text("fund_name").notNull(),
  units: numeric("units").notNull(),
  unitPrice: numeric("unit_price").notNull(),
  totalValue: numeric("total_value").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const loans = pgTable("loans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  loanNumber: text("loan_number").notNull().unique(),
  loanType: text("loan_type").notNull(),
  loanAmount: numeric("loan_amount").notNull(),
  interestRate: numeric("interest_rate").notNull(),
  emiAmount: numeric("emi_amount").notNull(),
  tenure: integer("tenure").notNull(), // in months
  collateralId: integer("collateral_id").references(() => mutualFunds.id),
  status: text("status").notNull(), // active, closed, pending
  approvalDate: timestamp("approval_date"),
  nextEmiDate: timestamp("next_emi_date"),
  remainingEmis: integer("remaining_emis"),
  totalEmis: integer("total_emis").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  loanId: integer("loan_id").references(() => loans.id),
  transactionType: text("transaction_type").notNull(), // emi_payment, loan_disbursement, fee
  amount: numeric("amount").notNull(),
  transactionDate: timestamp("transaction_date").defaultNow(),
  description: text("description"),
});

export const bankAccounts = pgTable("bank_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  accountNumber: text("account_number").notNull(),
  bankName: text("bank_name").notNull(),
  ifscCode: text("ifsc_code").notNull(),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const kycDetails = pgTable("kyc_details", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  idType: text("id_type").notNull(),
  idNumber: text("id_number").notNull(),
  addressProof: text("address_proof"),
  status: text("status").notNull(), // pending, verified, rejected
  submissionDate: timestamp("submission_date").defaultNow(),
  verificationDate: timestamp("verification_date"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertMutualFundSchema = createInsertSchema(mutualFunds).omit({
  id: true,
  createdAt: true,
});

export const insertLoanSchema = createInsertSchema(loans).omit({
  id: true,
  createdAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  transactionDate: true,
});

export const insertBankAccountSchema = createInsertSchema(bankAccounts).omit({
  id: true,
  createdAt: true,
});

export const insertKycDetailsSchema = createInsertSchema(kycDetails).omit({
  id: true,
  submissionDate: true,
  verificationDate: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type MutualFund = typeof mutualFunds.$inferSelect;
export type InsertMutualFund = z.infer<typeof insertMutualFundSchema>;

export type Loan = typeof loans.$inferSelect;
export type InsertLoan = z.infer<typeof insertLoanSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type BankAccount = typeof bankAccounts.$inferSelect;
export type InsertBankAccount = z.infer<typeof insertBankAccountSchema>;

export type KycDetail = typeof kycDetails.$inferSelect;
export type InsertKycDetail = z.infer<typeof insertKycDetailsSchema>;

// Login schema
export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginCredentials = z.infer<typeof loginSchema>;

// Loan application schema
export const loanApplicationSchema = z.object({
  mutualFundId: z.number(),
  loanAmount: z.string().or(z.number()),
  loanType: z.string(),
  tenure: z.number(),
  interestRate: z.number(),
  interestType: z.enum(["fixed", "floating"]).optional(),
  bankAccountId: z.number().optional(),
  purpose: z.string().optional(),
});

export type LoanApplication = z.infer<typeof loanApplicationSchema>;
