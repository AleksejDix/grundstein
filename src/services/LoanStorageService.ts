export interface StoredLoan {
  id: string;
  name: string;
  loanAmount: number;
  interestRate: number;
  termMonths: number;
  startDate: string;
  extraPayments: Record<number, number>;
  extraPaymentRights: number; // percentage
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoanCalculationResult {
  currentBalance: number;
  remainingPayments: number;
  remainingInterest: number;
  monthlyPayment: number;
  debtFreeDate: string;
  totalPaid: number;
  totalInterestPaid: number;
}

export interface LoanOverview extends StoredLoan {
  calculated: LoanCalculationResult;
}

export class LoanStorageService {
  private readonly STORAGE_KEY = "mortgage_loans";

  /**
   * Get all stored loans
   */
  getAllLoans(): StoredLoan[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return [];

    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error("Error parsing stored loans:", error);
      return [];
    }
  }

  /**
   * Save a loan (create or update)
   */
  saveLoan(
    loan: Omit<StoredLoan, "id" | "createdAt" | "updatedAt">
  ): StoredLoan {
    const loans = this.getAllLoans();
    const now = new Date().toISOString();

    const savedLoan: StoredLoan = {
      ...loan,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
    };

    loans.push(savedLoan);
    this.saveLoans(loans);

    return savedLoan;
  }

  /**
   * Update an existing loan
   */
  updateLoan(
    id: string,
    updates: Partial<Omit<StoredLoan, "id" | "createdAt">>
  ): StoredLoan | null {
    const loans = this.getAllLoans();
    const loanIndex = loans.findIndex((loan) => loan.id === id);

    if (loanIndex === -1) return null;

    const updatedLoan: StoredLoan = {
      ...loans[loanIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    loans[loanIndex] = updatedLoan;
    this.saveLoans(loans);

    return updatedLoan;
  }

  /**
   * Delete a loan
   */
  deleteLoan(id: string): boolean {
    const loans = this.getAllLoans();
    const filteredLoans = loans.filter((loan) => loan.id !== id);

    if (filteredLoans.length === loans.length) return false;

    this.saveLoans(filteredLoans);
    return true;
  }

  /**
   * Get a specific loan by ID
   */
  getLoan(id: string): StoredLoan | null {
    const loans = this.getAllLoans();
    return loans.find((loan) => loan.id === id) || null;
  }

  /**
   * Calculate current loan metrics
   */
  calculateLoanMetrics(loan: StoredLoan): LoanCalculationResult {
    // Calculate how many months have elapsed since loan start
    const startDate = new Date(loan.startDate);
    const currentDate = new Date();
    const monthsElapsed = Math.max(
      0,
      (currentDate.getFullYear() - startDate.getFullYear()) * 12 +
        (currentDate.getMonth() - startDate.getMonth())
    );

    if (monthsElapsed === 0) {
      return this.getInitialLoanMetrics(loan);
    }

    // Calculate proper remaining balance using amortization
    const monthlyRate = loan.interestRate / 100 / 12;

    // Calculate monthly payment using loan formula
    const monthlyPayment =
      (loan.loanAmount *
        (monthlyRate * Math.pow(1 + monthlyRate, loan.termMonths))) /
      (Math.pow(1 + monthlyRate, loan.termMonths) - 1);

    let balance = loan.loanAmount;
    let totalInterestPaid = 0;

    // Simulate each month of payments
    for (
      let month = 1;
      month <= Math.min(monthsElapsed, loan.termMonths);
      month++
    ) {
      // Calculate interest for this month
      const monthlyInterest = balance * monthlyRate;
      totalInterestPaid += monthlyInterest;

      // Calculate principal payment
      const principalPayment = monthlyPayment - monthlyInterest;

      // Add any extra payment for this month
      const extraPayment = loan.extraPayments[month] || 0;

      // Update balance
      balance = Math.max(0, balance - principalPayment - extraPayment);

      // Break if loan is paid off
      if (balance === 0) break;
    }

    // Calculate remaining metrics
    let remainingPayments = 0;
    let remainingInterest = 0;

    if (balance > 0) {
      // Calculate remaining payments using loan formula
      remainingPayments = Math.ceil(
        -Math.log(1 - (balance * monthlyRate) / monthlyPayment) /
          Math.log(1 + monthlyRate)
      );

      const totalRemainingPayments = remainingPayments * monthlyPayment;
      remainingInterest = Math.max(0, totalRemainingPayments - balance);
    }

    // Calculate debt-free date
    const debtFreeDate = new Date(currentDate);
    debtFreeDate.setMonth(debtFreeDate.getMonth() + remainingPayments);

    const totalPaid =
      monthlyPayment * Math.min(monthsElapsed, loan.termMonths) +
      Object.values(loan.extraPayments).reduce(
        (sum, amount) => sum + amount,
        0
      );

    return {
      currentBalance: balance,
      remainingPayments,
      remainingInterest,
      monthlyPayment,
      debtFreeDate:
        balance > 0
          ? debtFreeDate.toLocaleDateString("de-DE", {
              month: "short",
              year: "numeric",
            })
          : "Paid off!",
      totalPaid,
      totalInterestPaid,
    };
  }

  /**
   * Get overview of all loans with calculations
   */
  getLoanOverview(): LoanOverview[] {
    const loans = this.getAllLoans();
    return loans.map((loan) => ({
      ...loan,
      calculated: this.calculateLoanMetrics(loan),
    }));
  }

  /**
   * Get total debt summary across all loans
   */
  getTotalDebtSummary(): {
    totalCurrentBalance: number;
    totalMonthlyPayments: number;
    totalRemainingInterest: number;
    totalRemainingPayments: number;
    averageDebtFreeDate: string;
    totalLoans: number;
  } {
    const overview = this.getLoanOverview();

    if (overview.length === 0) {
      return {
        totalCurrentBalance: 0,
        totalMonthlyPayments: 0,
        totalRemainingInterest: 0,
        totalRemainingPayments: 0,
        averageDebtFreeDate: "No loans",
        totalLoans: 0,
      };
    }

    const totals = overview.reduce(
      (acc, loan) => {
        acc.totalCurrentBalance += loan.calculated.currentBalance;
        acc.totalMonthlyPayments += loan.calculated.monthlyPayment;
        acc.totalRemainingInterest += loan.calculated.remainingInterest;
        acc.totalRemainingPayments += loan.calculated.remainingPayments;
        return acc;
      },
      {
        totalCurrentBalance: 0,
        totalMonthlyPayments: 0,
        totalRemainingInterest: 0,
        totalRemainingPayments: 0,
      }
    );

    // Calculate average debt-free date (simplified)
    const averageRemainingMonths = Math.round(
      totals.totalRemainingPayments / overview.length
    );
    const avgDebtFreeDate = new Date();
    avgDebtFreeDate.setMonth(
      avgDebtFreeDate.getMonth() + averageRemainingMonths
    );

    return {
      ...totals,
      averageDebtFreeDate: avgDebtFreeDate.toLocaleDateString("de-DE", {
        month: "short",
        year: "numeric",
      }),
      totalLoans: overview.length,
    };
  }

  /**
   * Initialize with user's specific loan scenarios
   */
  initializeUserLoans(): void {
    // Only initialize if no loans exist
    if (this.getAllLoans().length > 0) return;

    // Loan 1: €100k at 5.6% for 7 years, €17k extra in month 2, started 01.01.2021
    this.saveLoan({
      name: "Primary Mortgage",
      loanAmount: 100000,
      interestRate: 5.6,
      termMonths: 7 * 12,
      startDate: "2021-01-01",
      extraPayments: { 2: 17000 },
      extraPaymentRights: 100,
      notes: "Swiss mortgage with €17k extra payment in February",
    });

    // Loan 2: €15k at 8% for 10 years, €184 extra every month, started 01.01.2023
    const monthlyExtraPayments: Record<number, number> = {};
    for (let month = 1; month <= 120; month++) {
      // 10 years
      monthlyExtraPayments[month] = 184;
    }

    this.saveLoan({
      name: "Personal Loan",
      loanAmount: 15000,
      interestRate: 8.0,
      termMonths: 10 * 12,
      startDate: "2023-01-01",
      extraPayments: monthlyExtraPayments,
      extraPaymentRights: 100,
      notes: "€184 extra payment every month",
    });
  }

  /**
   * Create loan scenario for analysis (potential €70k loan)
   */
  createScenarioLoan(): StoredLoan {
    return {
      id: "scenario-70k",
      name: "Potential New Loan",
      loanAmount: 70000,
      interestRate: 7.2,
      termMonths: 7 * 12, // Assuming 7 years like primary mortgage
      startDate: "2025-08-01",
      extraPayments: {},
      extraPaymentRights: 100,
      notes: "Scenario analysis for potential €70k loan",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  private getInitialLoanMetrics(loan: StoredLoan): LoanCalculationResult {
    const monthlyRate = loan.interestRate / 100 / 12;
    const monthlyPayment =
      (loan.loanAmount *
        (monthlyRate * Math.pow(1 + monthlyRate, loan.termMonths))) /
      (Math.pow(1 + monthlyRate, loan.termMonths) - 1);

    const totalPayments = monthlyPayment * loan.termMonths;
    const totalInterest = totalPayments - loan.loanAmount;

    const debtFreeDate = new Date(loan.startDate);
    debtFreeDate.setMonth(debtFreeDate.getMonth() + loan.termMonths);

    return {
      currentBalance: loan.loanAmount,
      remainingPayments: loan.termMonths,
      remainingInterest: totalInterest,
      monthlyPayment,
      debtFreeDate: debtFreeDate.toLocaleDateString("de-DE", {
        month: "short",
        year: "numeric",
      }),
      totalPaid: 0,
      totalInterestPaid: 0,
    };
  }

  private saveLoans(loans: StoredLoan[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(loans));
  }

  private generateId(): string {
    return "loan_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
  }
}
