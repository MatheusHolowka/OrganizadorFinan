export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  currency: string;
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export type AccountType = 'CHECKING' | 'SAVINGS' | 'INVESTMENT' | 'CASH' | 'DIGITAL_WALLET' | 'OTHER';

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  initialBalance: number;
  currentBalance: number;
  color?: string;
  icon?: string;
  isArchived?: boolean;
}

export type CategoryType = 'INCOME' | 'EXPENSE';

export interface Category {
  id: string;
  userId?: string;
  name: string;
  type: CategoryType;
  color?: string;
  icon?: string;
  parentId?: string;
  children?: Category[];
}

export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  destinationAccountId?: string;
  categoryId?: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  description: string;
  notes?: string;
  date: string;
  paymentDate?: string;
  isReconciled: boolean;
  account?: Account;
  destinationAccount?: Account;
  category?: Category;
}

export type CardBrand = 'VISA' | 'MASTERCARD' | 'ELO' | 'AMEX' | 'HIPERCARD' | 'OTHER';
export type InvoiceStatus = 'OPEN' | 'CLOSED' | 'PAID' | 'OVERDUE';

export interface CreditCard {
  id: string;
  userId: string;
  name: string;
  brand: CardBrand;
  limit: number;
  availableLimit: number;
  currentInvoiceAmount: number;
  closingDay: number;
  dueDay: number;
  color?: string;
  lastDigits?: string;
  paymentAccountId?: string;
  paymentAccount?: Account;
  isArchived?: boolean;
  status?: string;
  currentInvoice?: CreditCardInvoice;
  invoices?: CreditCardInvoice[];
}

export interface CreditCardInvoice {
  id: string;
  creditCardId: string;
  referenceMonth: number;
  referenceYear: number;
  closingDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  status: InvoiceStatus;
  transactions?: CreditCardTransaction[];
  creditCard?: CreditCard;
}

export interface CreditCardTransaction {
  id: string;
  creditCardId: string;
  invoiceId: string;
  categoryId?: string;
  description: string;
  totalAmount: number;
  installmentAmount: number;
  installmentNumber: number;
  totalInstallments: number;
  installmentGroupId?: string;
  purchaseDate: string;
  category?: Category;
  invoice?: CreditCardInvoice;
}

export type VaultStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'IN_PROGRESS';
export type VaultMovementType = 'DEPOSIT' | 'WITHDRAW' | 'WITHDRAWAL';

export interface Vault {
  id: string;
  userId: string;
  title: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  remaining?: number;
  progress: number;
  deadline?: string;
  category?: string;
  color?: string;
  icon?: string;
  status: VaultStatus;
  isolatedFromDailyBalance: boolean;
  transactions?: VaultTransaction[];
}

export interface VaultTransaction {
  id: string;
  vaultId: string;
  accountId?: string;
  account?: Account;
  type: VaultMovementType;
  amount: number;
  description?: string;
  date: string;
}

export type ImportFormat = 'OFX' | 'CSV';
export type ImportStatus = 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface ImportItem {
  id: string;
  batchId: string;
  externalId?: string;
  date: string;
  amount: number;
  originalAmount: number;
  type: TransactionType;
  description: string;
  originalDescription?: string;
  suggestedCategoryName?: string;
  memo?: string;
  rawType?: string;
  isDuplicate: boolean;
  categoryId?: string;
  shouldImport?: boolean;
}

export interface ImportBatchPreview {
  batchId: string;
  filename: string;
  format: ImportFormat;
  isDuplicateBatch: boolean;
  totalItems: number;
  totalDuplicates?: number;
  items: ImportItem[];
}

export interface DashboardCardItem {
  id: string;
  name: string;
  brand: string;
  limit: number;
  availableLimit: number;
  usedLimit: number;
  usedPercentage: number;
  currentInvoiceAmount: number;
  closingDay: number;
  dueDay: number;
  color?: string;
}

export interface CategoryExpenseItem {
  name: string;
  color: string;
  amount: number;
  percentage: number;
}

export interface CashFlowPoint {
  monthLabel: string;
  income: number;
  expense: number;
  invoice: number;
}

export interface DashboardSummary {
  period: { month: number; year: number };
  summary: {
    totalRawBalance: number;
    isolatedFunds: number;
    dailyAvailableBalance: number;
    monthlyIncome: number;
    monthlyExpense: number;
    monthlyNet: number;
    totalOpenInvoices: number;
    totalVaultsSaved: number;
    totalCardLimit: number;
    totalCardUsed: number;
    totalCardAvailable: number;
    totalInvestments?: number;
    totalLoans?: number;
    netWorth?: number;
  };
  accounts: Account[];
  cards: DashboardCardItem[];
  categoryExpenses: CategoryExpenseItem[];
  cashFlowHistory: CashFlowPoint[];
  vaults: Vault[];
  recentTransactions: Transaction[];
  scope?: 'personal' | 'family';
}

export interface OpenFinanceInvestment {
  id: string;
  openFinanceConnectionId: string;
  pluggyInvestmentId?: string;
  name: string;
  code?: string;
  isin?: string;
  type?: string;
  subtype?: string;
  balance: number;
  amount: number;
  currencyCode?: string;
  rate?: number;
  rateType?: string;
  fixedAnnualRate?: number;
  dueDate?: string;
  issuer?: string;
  status?: string;
}

export interface OpenFinanceLoan {
  id: string;
  openFinanceConnectionId: string;
  pluggyLoanId?: string;
  contractNumber?: string;
  productName?: string;
  type?: string;
  contractAmount: number;
  outstandingBalance: number;
  currencyCode?: string;
  dueDate?: string;
  totalInstallments?: number;
  paidInstallments?: number;
  dueInstallments?: number;
  cet?: number;
  interestRate?: number;
}

export interface OpenFinanceConnection {
  id: string;
  userId: string;
  itemId: string;
  connectorId: number;
  connectorName: string;
  connectorColor?: string;
  connectorImageUrl?: string;
  status: string;
  executionStatus?: string;
  errorCode?: string;
  lastUpdatedAt?: string;
  consentExpiresAt?: string;
  createdAt: string;
  accounts?: Account[];
  creditCards?: CreditCard[];
  investments?: OpenFinanceInvestment[];
  loans?: OpenFinanceLoan[];
}
