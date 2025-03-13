import { 
  users, 
  mutualFunds, 
  loans, 
  transactions, 
  bankAccounts, 
  kycDetails,
  type User, 
  type InsertUser, 
  type MutualFund, 
  type InsertMutualFund, 
  type Loan, 
  type InsertLoan, 
  type Transaction, 
  type InsertTransaction, 
  type BankAccount, 
  type InsertBankAccount, 
  type KycDetail, 
  type InsertKycDetail,
  type LoanApplication
} from "@shared/schema";
import { nanoid } from "nanoid";
import bcrypt from "bcrypt";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Mutual Fund operations
  getMutualFunds(userId: number): Promise<MutualFund[]>;
  getMutualFund(id: number): Promise<MutualFund | undefined>;
  createMutualFund(fund: InsertMutualFund): Promise<MutualFund>;
  
  // Loan operations
  getLoans(userId: number): Promise<Loan[]>;
  getLoan(id: number): Promise<Loan | undefined>;
  createLoan(loan: InsertLoan): Promise<Loan>;
  updateLoanStatus(id: number, status: string): Promise<Loan | undefined>;
  updateNextEmiDate(id: number, date: Date): Promise<Loan | undefined>;
  updateRemainingEmis(id: number, remainingEmis: number): Promise<Loan | undefined>;
  
  // Transaction operations
  getTransactions(userId: number, limit?: number): Promise<Transaction[]>;
  getTransactionsByLoan(loanId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Bank Account operations
  getBankAccounts(userId: number): Promise<BankAccount[]>;
  createBankAccount(account: InsertBankAccount): Promise<BankAccount>;
  setDefaultBankAccount(id: number, userId: number): Promise<BankAccount | undefined>;
  
  // KYC operations
  getKycDetails(userId: number): Promise<KycDetail | undefined>;
  createKycDetails(kyc: InsertKycDetail): Promise<KycDetail>;
  updateKycStatus(id: number, status: string): Promise<KycDetail | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private mutualFunds: Map<number, MutualFund>;
  private loans: Map<number, Loan>;
  private transactions: Map<number, Transaction>;
  private bankAccounts: Map<number, BankAccount>;
  private kycDetails: Map<number, KycDetail>;
  
  private currentUserId: number;
  private currentMutualFundId: number;
  private currentLoanId: number;
  private currentTransactionId: number;
  private currentBankAccountId: number;
  private currentKycId: number;

  constructor() {
    this.users = new Map();
    this.mutualFunds = new Map();
    this.loans = new Map();
    this.transactions = new Map();
    this.bankAccounts = new Map();
    this.kycDetails = new Map();
    
    this.currentUserId = 1;
    this.currentMutualFundId = 1;
    this.currentLoanId = 1;
    this.currentTransactionId = 1;
    this.currentBankAccountId = 1;
    this.currentKycId = 1;
    
    // Create default user and data for testing
    this.initializeTestData();
  }

  private async initializeTestData() {
    // Create a test user
    const hashedPassword = await bcrypt.hash("password123", 10);
    const testUser: InsertUser = {
      username: "johndoe",
      password: hashedPassword,
      fullName: "John Doe",
      email: "john@example.com",
      phoneNumber: "9876543210",
      isKycVerified: true
    };
    const user = await this.createUser(testUser);
    
    // Create mutual funds
    const fund1: InsertMutualFund = {
      userId: user.id,
      fundName: "HDFC Top 100 Mutual Fund",
      units: "25000",
      unitPrice: "18.50",
      totalValue: "462500"
    };
    const mf1 = await this.createMutualFund(fund1);
    
    const fund2: InsertMutualFund = {
      userId: user.id,
      fundName: "SBI Bluechip Fund",
      units: "12500",
      unitPrice: "22.80",
      totalValue: "285000"
    };
    const mf2 = await this.createMutualFund(fund2);
    
    // Create loans
    const loan1: InsertLoan = {
      userId: user.id,
      loanNumber: "LN78952",
      loanType: "Personal Loan",
      loanAmount: "250000",
      interestRate: "12",
      emiAmount: "22500",
      tenure: 12,
      collateralId: mf1.id,
      status: "active",
      approvalDate: new Date("2023-06-15"),
      nextEmiDate: new Date("2023-08-05"),
      remainingEmis: 4,
      totalEmis: 12
    };
    const createdLoan1 = await this.createLoan(loan1);
    
    const loan2: InsertLoan = {
      userId: user.id,
      loanNumber: "LN45621",
      loanType: "Education Loan",
      loanAmount: "128500",
      interestRate: "10.5",
      emiAmount: "10000",
      tenure: 20,
      collateralId: mf2.id,
      status: "active",
      approvalDate: new Date("2023-04-03"),
      nextEmiDate: new Date("2023-08-10"),
      remainingEmis: 14,
      totalEmis: 20
    };
    const createdLoan2 = await this.createLoan(loan2);
    
    // Create transactions
    const transaction1: InsertTransaction = {
      userId: user.id,
      loanId: createdLoan1.id,
      transactionType: "emi_payment",
      amount: "22500",
      description: "EMI Payment for August"
    };
    await this.createTransaction(transaction1);
    
    const transaction2: InsertTransaction = {
      userId: user.id,
      loanId: createdLoan2.id,
      transactionType: "loan_disbursement",
      amount: "128500",
      description: "Loan Disbursement",
      transactionDate: new Date("2023-07-22T11:42:00")
    };
    await this.createTransaction(transaction2);
    
    const transaction3: InsertTransaction = {
      userId: user.id,
      loanId: createdLoan1.id,
      transactionType: "emi_payment",
      amount: "22500",
      description: "EMI Payment for July",
      transactionDate: new Date("2023-07-05T10:08:00")
    };
    await this.createTransaction(transaction3);
    
    const transaction4: InsertTransaction = {
      userId: user.id,
      loanId: createdLoan2.id,
      transactionType: "emi_payment",
      amount: "10000",
      description: "EMI Payment for July",
      transactionDate: new Date("2023-07-03T14:35:00")
    };
    await this.createTransaction(transaction4);
    
    const transaction5: InsertTransaction = {
      userId: user.id,
      loanId: createdLoan2.id,
      transactionType: "fee",
      amount: "2570",
      description: "Processing Fee",
      transactionDate: new Date("2023-07-01T13:22:00")
    };
    await this.createTransaction(transaction5);
    
    // Create bank account
    const bankAccount: InsertBankAccount = {
      userId: user.id,
      accountNumber: "12345678901",
      bankName: "HDFC Bank",
      ifscCode: "HDFC0001234",
      isDefault: true
    };
    await this.createBankAccount(bankAccount);
    
    // Create KYC details
    const kycDetail: InsertKycDetail = {
      userId: user.id,
      idType: "Aadhaar",
      idNumber: "123456789012",
      addressProof: "Utility Bill",
      status: "verified"
    };
    await this.createKycDetails(kycDetail);
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }
  
  // Mutual Fund operations
  async getMutualFunds(userId: number): Promise<MutualFund[]> {
    return Array.from(this.mutualFunds.values()).filter(
      (fund) => fund.userId === userId
    );
  }
  
  async getMutualFund(id: number): Promise<MutualFund | undefined> {
    return this.mutualFunds.get(id);
  }
  
  async createMutualFund(fund: InsertMutualFund): Promise<MutualFund> {
    const id = this.currentMutualFundId++;
    const createdAt = new Date();
    const mutualFund: MutualFund = { ...fund, id, createdAt };
    this.mutualFunds.set(id, mutualFund);
    return mutualFund;
  }
  
  // Loan operations
  async getLoans(userId: number): Promise<Loan[]> {
    return Array.from(this.loans.values()).filter(
      (loan) => loan.userId === userId
    );
  }
  
  async getLoan(id: number): Promise<Loan | undefined> {
    return this.loans.get(id);
  }
  
  async createLoan(loan: InsertLoan): Promise<Loan> {
    const id = this.currentLoanId++;
    const createdAt = new Date();
    const newLoan: Loan = { ...loan, id, createdAt };
    this.loans.set(id, newLoan);
    return newLoan;
  }
  
  async updateLoanStatus(id: number, status: string): Promise<Loan | undefined> {
    const loan = this.loans.get(id);
    if (!loan) return undefined;
    
    const updatedLoan = { ...loan, status };
    this.loans.set(id, updatedLoan);
    return updatedLoan;
  }
  
  async updateNextEmiDate(id: number, date: Date): Promise<Loan | undefined> {
    const loan = this.loans.get(id);
    if (!loan) return undefined;
    
    const updatedLoan = { ...loan, nextEmiDate: date };
    this.loans.set(id, updatedLoan);
    return updatedLoan;
  }
  
  async updateRemainingEmis(id: number, remainingEmis: number): Promise<Loan | undefined> {
    const loan = this.loans.get(id);
    if (!loan) return undefined;
    
    const updatedLoan = { ...loan, remainingEmis };
    this.loans.set(id, updatedLoan);
    return updatedLoan;
  }
  
  // Transaction operations
  async getTransactions(userId: number, limit?: number): Promise<Transaction[]> {
    const transactions = Array.from(this.transactions.values())
      .filter((transaction) => transaction.userId === userId)
      .sort((a, b) => {
        return new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime();
      });
    
    if (limit) {
      return transactions.slice(0, limit);
    }
    
    return transactions;
  }
  
  async getTransactionsByLoan(loanId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter((transaction) => transaction.loanId === loanId)
      .sort((a, b) => {
        return new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime();
      });
  }
  
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const transactionDate = transaction.transactionDate || new Date();
    const newTransaction: Transaction = { ...transaction, id, transactionDate };
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }
  
  // Bank Account operations
  async getBankAccounts(userId: number): Promise<BankAccount[]> {
    return Array.from(this.bankAccounts.values()).filter(
      (account) => account.userId === userId
    );
  }
  
  async createBankAccount(account: InsertBankAccount): Promise<BankAccount> {
    const id = this.currentBankAccountId++;
    const createdAt = new Date();
    const newBankAccount: BankAccount = { ...account, id, createdAt };
    this.bankAccounts.set(id, newBankAccount);
    
    // If this is set as default, remove default from other accounts
    if (newBankAccount.isDefault) {
      for (const [accountId, existingAccount] of this.bankAccounts.entries()) {
        if (existingAccount.userId === account.userId && existingAccount.id !== id && existingAccount.isDefault) {
          this.bankAccounts.set(accountId, { ...existingAccount, isDefault: false });
        }
      }
    }
    
    return newBankAccount;
  }
  
  async setDefaultBankAccount(id: number, userId: number): Promise<BankAccount | undefined> {
    const account = this.bankAccounts.get(id);
    if (!account || account.userId !== userId) return undefined;
    
    // Set this account as default
    const updatedAccount = { ...account, isDefault: true };
    this.bankAccounts.set(id, updatedAccount);
    
    // Remove default from other accounts
    for (const [accountId, existingAccount] of this.bankAccounts.entries()) {
      if (existingAccount.userId === userId && existingAccount.id !== id && existingAccount.isDefault) {
        this.bankAccounts.set(accountId, { ...existingAccount, isDefault: false });
      }
    }
    
    return updatedAccount;
  }
  
  // KYC operations
  async getKycDetails(userId: number): Promise<KycDetail | undefined> {
    return Array.from(this.kycDetails.values()).find(
      (kyc) => kyc.userId === userId
    );
  }
  
  async createKycDetails(kyc: InsertKycDetail): Promise<KycDetail> {
    const id = this.currentKycId++;
    const submissionDate = new Date();
    const newKyc: KycDetail = { ...kyc, id, submissionDate, verificationDate: undefined };
    this.kycDetails.set(id, newKyc);
    return newKyc;
  }
  
  async updateKycStatus(id: number, status: string): Promise<KycDetail | undefined> {
    const kyc = this.kycDetails.get(id);
    if (!kyc) return undefined;
    
    const verificationDate = status === 'verified' ? new Date() : kyc.verificationDate;
    const updatedKyc = { ...kyc, status, verificationDate };
    this.kycDetails.set(id, updatedKyc);
    return updatedKyc;
  }
}

export const storage = new MemStorage();
