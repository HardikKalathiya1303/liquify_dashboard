import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { z } from "zod";
import { 
  loginSchema,
  insertUserSchema,
  insertMutualFundSchema,
  insertLoanSchema,
  insertTransactionSchema,
  insertBankAccountSchema,
  insertKycDetailsSchema,
  loanApplicationSchema
} from "@shared/schema";
import { nanoid } from "nanoid";
import MemoryStore from "memorystore";

const MemorySessionStore = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "liquify-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production", maxAge: 24 * 60 * 60 * 1000 },
      store: new MemorySessionStore({ checkPeriod: 86400000 }),
    })
  );

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure Passport
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: "Incorrect password" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Auth middleware
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // API Routes
  // Authentication routes
  app.post("/api/auth/login", (req, res, next) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      passport.authenticate("local", (err: any, user: any, info: any) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.status(401).json({ message: info.message || "Authentication failed" });
        }
        req.logIn(user, (err) => {
          if (err) {
            return next(err);
          }
          
          // Return user without password
          const { password, ...userWithoutPassword } = user;
          return res.json({ user: userWithoutPassword });
        });
      })(req, res, next);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      next(error);
    }
  });

  app.post("/api/auth/register", async (req, res, next) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      // Create user
      const newUser = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
      });
      
      // Return user without password
      const { password, ...userWithoutPassword } = newUser;
      res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      next(error);
    }
  });

  app.get("/api/auth/session", (req, res) => {
    if (req.isAuthenticated()) {
      const { password, ...userWithoutPassword } = req.user as any;
      return res.json({ user: userWithoutPassword });
    }
    res.status(401).json({ message: "Not authenticated" });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Error during logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // User Dashboard data
  app.get("/api/dashboard", isAuthenticated, async (req, res, next) => {
    try {
      const userId = (req.user as any).id;
      
      // Get user loans
      const loans = await storage.getLoans(userId);
      
      // Get mutual funds
      const mutualFunds = await storage.getMutualFunds(userId);
      
      // Get recent transactions
      const transactions = await storage.getTransactions(userId, 5);
      
      // Get KYC status
      const kycDetails = await storage.getKycDetails(userId);
      
      // Calculate financial summary
      const totalBorrowed = loans.reduce((sum, loan) => sum + Number(loan.loanAmount), 0);
      const activeLoans = loans.filter(loan => loan.status === "active");
      const totalActiveLoans = activeLoans.length;
      const nextEmiDue = activeLoans.length > 0 
        ? activeLoans.reduce((closest, loan) => {
            if (!closest.nextEmiDate) return loan;
            if (!loan.nextEmiDate) return closest;
            return new Date(loan.nextEmiDate) < new Date(closest.nextEmiDate) ? loan : closest;
          }, activeLoans[0])
        : null;
      
      // Calculate available credit based on mutual fund value
      const totalMutualFundValue = mutualFunds.reduce((sum, fund) => sum + Number(fund.totalValue), 0);
      const availableCredit = Math.max(0, totalMutualFundValue * 0.7 - totalBorrowed);
      
      res.json({
        totalBorrowed,
        availableCredit, 
        activeLoans: totalActiveLoans,
        nextEmiDue: nextEmiDue 
          ? { 
              amount: nextEmiDue.emiAmount, 
              date: nextEmiDue.nextEmiDate,
              loanId: nextEmiDue.id,
              loanNumber: nextEmiDue.loanNumber
            } 
          : null,
        loans,
        mutualFunds,
        recentTransactions: transactions,
        kycStatus: kycDetails?.status || "not_submitted"
      });
    } catch (error) {
      next(error);
    }
  });

  // Loans routes
  app.get("/api/loans", isAuthenticated, async (req, res, next) => {
    try {
      const userId = (req.user as any).id;
      const loans = await storage.getLoans(userId);
      res.json(loans);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/loans/:id", isAuthenticated, async (req, res, next) => {
    try {
      const userId = (req.user as any).id;
      const loanId = parseInt(req.params.id);
      
      const loan = await storage.getLoan(loanId);
      if (!loan) {
        return res.status(404).json({ message: "Loan not found" });
      }
      
      if (loan.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized access to this loan" });
      }
      
      // Get collateral details
      const collateral = loan.collateralId 
        ? await storage.getMutualFund(loan.collateralId)
        : null;
      
      // Get loan transactions
      const transactions = await storage.getTransactionsByLoan(loanId);
      
      res.json({ ...loan, collateral, transactions });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/loans/apply", isAuthenticated, async (req, res, next) => {
    try {
      const userId = (req.user as any).id;
      const validatedData = loanApplicationSchema.parse(req.body);
      
      // Check if mutual fund exists and belongs to user
      const mutualFund = await storage.getMutualFund(validatedData.mutualFundId);
      if (!mutualFund) {
        return res.status(404).json({ message: "Mutual fund not found" });
      }
      
      if (mutualFund.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized access to this mutual fund" });
      }
      
      // Generate unique loan number
      const loanNumber = `LN${nanoid(6).toUpperCase()}`;
      
      // Calculate EMI amount
      const loanAmount = Number(validatedData.loanAmount);
      const interestRate = validatedData.interestRate;
      const tenure = validatedData.tenure;
      
      const monthlyInterestRate = interestRate / 1200; // Monthly interest rate
      const emiAmount = loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, tenure) / 
                        (Math.pow(1 + monthlyInterestRate, tenure) - 1);
      
      // Create loan with pending status
      const newLoan = await storage.createLoan({
        userId,
        loanNumber,
        loanType: validatedData.loanType,
        loanAmount: loanAmount.toString(),
        interestRate: interestRate.toString(),
        emiAmount: Math.round(emiAmount).toString(),
        tenure,
        collateralId: mutualFund.id,
        status: "pending", // Initial status is pending
        remainingEmis: tenure,
        totalEmis: tenure
      });
      
      res.status(201).json(newLoan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      next(error);
    }
  });

  app.post("/api/loans/:id/pay-emi", isAuthenticated, async (req, res, next) => {
    try {
      const userId = (req.user as any).id;
      const loanId = parseInt(req.params.id);
      
      const loan = await storage.getLoan(loanId);
      if (!loan) {
        return res.status(404).json({ message: "Loan not found" });
      }
      
      if (loan.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized access to this loan" });
      }
      
      if (loan.status !== "active") {
        return res.status(400).json({ message: "Can only pay EMI for active loans" });
      }
      
      if (!loan.remainingEmis || loan.remainingEmis <= 0) {
        return res.status(400).json({ message: "All EMIs have been paid" });
      }
      
      // Create transaction for EMI payment
      const newTransaction = await storage.createTransaction({
        userId,
        loanId,
        transactionType: "emi_payment",
        amount: loan.emiAmount,
        description: `EMI Payment for ${new Date().toLocaleString('default', { month: 'long' })}`
      });
      
      // Update loan remaining EMIs and next EMI date
      const remainingEmis = (loan.remainingEmis || 0) - 1;
      
      // Calculate next EMI date (1 month from now)
      const nextEmiDate = new Date();
      nextEmiDate.setMonth(nextEmiDate.getMonth() + 1);
      
      let updatedLoan = await storage.updateRemainingEmis(loanId, remainingEmis);
      
      // Update loan status if all EMIs are paid
      if (remainingEmis <= 0) {
        updatedLoan = await storage.updateLoanStatus(loanId, "closed");
      } else {
        updatedLoan = await storage.updateNextEmiDate(loanId, nextEmiDate);
      }
      
      res.json({ transaction: newTransaction, loan: updatedLoan });
    } catch (error) {
      next(error);
    }
  });

  // Mutual Funds routes
  app.get("/api/mutual-funds", isAuthenticated, async (req, res, next) => {
    try {
      const userId = (req.user as any).id;
      const mutualFunds = await storage.getMutualFunds(userId);
      res.json(mutualFunds);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/mutual-funds", isAuthenticated, async (req, res, next) => {
    try {
      const userId = (req.user as any).id;
      const validatedData = insertMutualFundSchema.parse({
        ...req.body,
        userId
      });
      
      const newMutualFund = await storage.createMutualFund(validatedData);
      res.status(201).json(newMutualFund);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      next(error);
    }
  });

  // Transactions routes
  app.get("/api/transactions", isAuthenticated, async (req, res, next) => {
    try {
      const userId = (req.user as any).id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const transactions = await storage.getTransactions(userId, limit);
      res.json(transactions);
    } catch (error) {
      next(error);
    }
  });

  // Bank Accounts routes
  app.get("/api/bank-accounts", isAuthenticated, async (req, res, next) => {
    try {
      const userId = (req.user as any).id;
      const bankAccounts = await storage.getBankAccounts(userId);
      res.json(bankAccounts);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/bank-accounts", isAuthenticated, async (req, res, next) => {
    try {
      const userId = (req.user as any).id;
      const validatedData = insertBankAccountSchema.parse({
        ...req.body,
        userId
      });
      
      const newBankAccount = await storage.createBankAccount(validatedData);
      res.status(201).json(newBankAccount);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      next(error);
    }
  });

  app.put("/api/bank-accounts/:id/default", isAuthenticated, async (req, res, next) => {
    try {
      const userId = (req.user as any).id;
      const accountId = parseInt(req.params.id);
      
      const updatedAccount = await storage.setDefaultBankAccount(accountId, userId);
      if (!updatedAccount) {
        return res.status(404).json({ message: "Bank account not found" });
      }
      
      res.json(updatedAccount);
    } catch (error) {
      next(error);
    }
  });

  // KYC routes
  app.get("/api/kyc", isAuthenticated, async (req, res, next) => {
    try {
      const userId = (req.user as any).id;
      const kycDetails = await storage.getKycDetails(userId);
      if (!kycDetails) {
        return res.status(404).json({ message: "KYC details not found" });
      }
      
      res.json(kycDetails);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/kyc", isAuthenticated, async (req, res, next) => {
    try {
      const userId = (req.user as any).id;
      
      // Check if KYC already exists
      const existingKyc = await storage.getKycDetails(userId);
      if (existingKyc) {
        return res.status(400).json({ message: "KYC details already submitted" });
      }
      
      const validatedData = insertKycDetailsSchema.parse({
        ...req.body,
        userId,
        status: "pending" // Initial status is always pending
      });
      
      const newKyc = await storage.createKycDetails(validatedData);
      res.status(201).json(newKyc);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      next(error);
    }
  });

  // Loan eligibility calculator endpoint
  app.post("/api/loan-eligibility", isAuthenticated, async (req, res, next) => {
    try {
      const { mutualFundValue, loanDuration, interestRate } = req.body;
      
      // Validate inputs
      if (!mutualFundValue || !loanDuration || !interestRate) {
        return res.status(400).json({ message: "Missing required parameters" });
      }
      
      // Calculate eligible loan amount (70% of mutual fund value)
      const eligibleAmount = Number(mutualFundValue) * 0.7;
      
      // Calculate EMI
      const monthlyInterestRate = Number(interestRate) / 1200; // Monthly interest rate
      const tenure = Number(loanDuration);
      
      const emiAmount = eligibleAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, tenure) / 
                        (Math.pow(1 + monthlyInterestRate, tenure) - 1);
      
      // Calculate total interest
      const totalRepayment = emiAmount * tenure;
      const totalInterest = totalRepayment - eligibleAmount;
      
      res.json({
        eligibleAmount: Math.round(eligibleAmount),
        emiAmount: Math.round(emiAmount),
        totalInterest: Math.round(totalInterest)
      });
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
