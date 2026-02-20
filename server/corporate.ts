/**
 * Corporate Account Management Service
 * Manages business accounts, employee drivers, bulk bookings, and corporate billing
 */

export type CorporateAccountType = "startup" | "growth" | "enterprise";
export type EmployeeRole = "admin" | "manager" | "driver" | "viewer";

export interface CorporateAccount {
  accountId: string;
  companyName: string;
  accountType: CorporateAccountType;
  adminEmail: string;
  taxId: string;
  billingEmail: string;
  employees: string[];
  monthlyBudget: number;
  currentSpend: number;
  discountRate: number;
  createdAt: Date;
}

export interface EmployeeDriver {
  employeeId: string;
  accountId: string;
  name: string;
  email: string;
  role: EmployeeRole;
  driverId?: string;
  status: "active" | "inactive" | "suspended";
  joinDate: Date;
}

export interface CorporateRide {
  rideId: string;
  accountId: string;
  employeeId: string;
  pickupLocation: string;
  dropoffLocation: string;
  fare: number;
  corporateDiscount: number;
  finalFare: number;
  status: "completed" | "cancelled" | "pending";
  rideDate: Date;
}

export interface CorporateBilling {
  billingId: string;
  accountId: string;
  period: string; // YYYY-MM
  totalRides: number;
  totalFare: number;
  totalDiscount: number;
  totalAmount: number;
  status: "pending" | "paid" | "overdue";
  dueDate: Date;
  invoiceUrl?: string;
}

export interface ExpenseReport {
  reportId: string;
  accountId: string;
  employeeId: string;
  period: string;
  totalSpend: number;
  rideCount: number;
  averageFare: number;
  departmentCode?: string;
}

export class CorporateService {
  private accounts: Map<string, CorporateAccount> = new Map();
  private employees: Map<string, EmployeeDriver> = new Map();
  private rides: Map<string, CorporateRide> = new Map();
  private billings: Map<string, CorporateBilling> = new Map();
  private reports: Map<string, ExpenseReport> = new Map();

  /**
   * Create corporate account
   */
  createCorporateAccount(
    companyName: string,
    accountType: CorporateAccountType,
    adminEmail: string,
    taxId: string,
    billingEmail: string
  ): CorporateAccount {
    const accountId = `corp_${Date.now()}`;

    const discountRates: Record<CorporateAccountType, number> = {
      startup: 0.1, // 10%
      growth: 0.15, // 15%
      enterprise: 0.25, // 25%
    };

    const budgets: Record<CorporateAccountType, number> = {
      startup: 5000,
      growth: 25000,
      enterprise: 100000,
    };

    const account: CorporateAccount = {
      accountId,
      companyName,
      accountType,
      adminEmail,
      taxId,
      billingEmail,
      employees: [],
      monthlyBudget: budgets[accountType],
      currentSpend: 0,
      discountRate: discountRates[accountType],
      createdAt: new Date(),
    };

    this.accounts.set(accountId, account);
    return account;
  }

  /**
   * Add employee to corporate account
   */
  addEmployee(
    accountId: string,
    name: string,
    email: string,
    role: EmployeeRole
  ): EmployeeDriver | null {
    const account = this.accounts.get(accountId);
    if (!account) return null;

    const employeeId = `emp_${Date.now()}`;
    const employee: EmployeeDriver = {
      employeeId,
      accountId,
      name,
      email,
      role,
      status: "active",
      joinDate: new Date(),
    };

    this.employees.set(employeeId, employee);
    account.employees.push(employeeId);

    return employee;
  }

  /**
   * Get corporate account
   */
  getCorporateAccount(accountId: string): CorporateAccount | null {
    return this.accounts.get(accountId) || null;
  }

  /**
   * Get account employees
   */
  getAccountEmployees(accountId: string): EmployeeDriver[] {
    return Array.from(this.employees.values()).filter(
      (emp) => emp.accountId === accountId
    );
  }

  /**
   * Record corporate ride
   */
  recordCorporateRide(
    accountId: string,
    employeeId: string,
    pickupLocation: string,
    dropoffLocation: string,
    fare: number
  ): CorporateRide | null {
    const account = this.accounts.get(accountId);
    const employee = this.employees.get(employeeId);

    if (!account || !employee || employee.accountId !== accountId) return null;

    // Check budget
    const corporateDiscount = fare * account.discountRate;
    const finalFare = fare - corporateDiscount;

    if (account.currentSpend + finalFare > account.monthlyBudget) {
      return null; // Budget exceeded
    }

    const rideId = `ride_${Date.now()}`;
    const ride: CorporateRide = {
      rideId,
      accountId,
      employeeId,
      pickupLocation,
      dropoffLocation,
      fare,
      corporateDiscount,
      finalFare,
      status: "completed",
      rideDate: new Date(),
    };

    this.rides.set(rideId, ride);
    account.currentSpend += finalFare;

    return ride;
  }

  /**
   * Get corporate rides
   */
  getCorporateRides(accountId: string): CorporateRide[] {
    return Array.from(this.rides.values()).filter(
      (ride) => ride.accountId === accountId
    );
  }

  /**
   * Generate monthly billing
   */
  generateMonthlyBilling(accountId: string): CorporateBilling | null {
    const account = this.accounts.get(accountId);
    if (!account) return null;

    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const monthRides = Array.from(this.rides.values()).filter(
      (ride) =>
        ride.accountId === accountId &&
        ride.rideDate.toISOString().startsWith(period)
    );

    const totalFare = monthRides.reduce((sum, ride) => sum + ride.fare, 0);
    const totalDiscount = monthRides.reduce(
      (sum, ride) => sum + ride.corporateDiscount,
      0
    );
    const totalAmount = monthRides.reduce((sum, ride) => sum + ride.finalFare, 0);

    const billingId = `bill_${Date.now()}`;
    const dueDate = new Date(now.getFullYear(), now.getMonth() + 1, 15);

    const billing: CorporateBilling = {
      billingId,
      accountId,
      period,
      totalRides: monthRides.length,
      totalFare,
      totalDiscount,
      totalAmount,
      status: "pending",
      dueDate,
    };

    this.billings.set(billingId, billing);
    return billing;
  }

  /**
   * Generate expense report
   */
  generateExpenseReport(
    accountId: string,
    employeeId: string,
    period: string
  ): ExpenseReport | null {
    const account = this.accounts.get(accountId);
    const employee = this.employees.get(employeeId);

    if (!account || !employee || employee.accountId !== accountId) return null;

    const employeeRides = Array.from(this.rides.values()).filter(
      (ride) =>
        ride.accountId === accountId &&
        ride.employeeId === employeeId &&
        ride.rideDate.toISOString().startsWith(period)
    );

    const totalSpend = employeeRides.reduce((sum, ride) => sum + ride.finalFare, 0);
    const averageFare =
      employeeRides.length > 0 ? totalSpend / employeeRides.length : 0;

    const reportId = `exp_${Date.now()}`;
    const report: ExpenseReport = {
      reportId,
      accountId,
      employeeId,
      period,
      totalSpend,
      rideCount: employeeRides.length,
      averageFare,
    };

    this.reports.set(reportId, report);
    return report;
  }

  /**
   * Update account budget
   */
  updateAccountBudget(accountId: string, newBudget: number): boolean {
    const account = this.accounts.get(accountId);
    if (!account) return false;

    account.monthlyBudget = newBudget;
    return true;
  }

  /**
   * Get account billing history
   */
  getAccountBillings(accountId: string): CorporateBilling[] {
    return Array.from(this.billings.values()).filter(
      (bill) => bill.accountId === accountId
    );
  }
}

export const corporateService = new CorporateService();
