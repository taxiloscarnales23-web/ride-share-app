/**
 * In-App Wallet Service
 * Manages user wallet, credits, and payment tracking
 */

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'ride_payment' | 'refund' | 'credit_added' | 'promo_applied' | 'withdrawal';
  amount: number;
  description: string;
  rideId?: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
}

export interface UserWallet {
  userId: string;
  balance: number;
  totalSpent: number;
  totalCredits: number;
  transactions: WalletTransaction[];
  createdAt: Date;
  updatedAt: Date;
}

export class WalletService {
  private wallets: Map<string, UserWallet> = new Map();
  private transactionHistory: Map<string, WalletTransaction[]> = new Map();

  /**
   * Initialize wallet for user
   */
  initializeWallet(userId: string): UserWallet {
    if (this.wallets.has(userId)) {
      return this.wallets.get(userId)!;
    }

    const wallet: UserWallet = {
      userId,
      balance: 0,
      totalSpent: 0,
      totalCredits: 0,
      transactions: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.wallets.set(userId, wallet);
    this.transactionHistory.set(userId, []);

    return wallet;
  }

  /**
   * Get user wallet
   */
  getWallet(userId: string): UserWallet | null {
    return this.wallets.get(userId) || null;
  }

  /**
   * Add credits to wallet
   */
  addCredits(userId: string, amount: number, description: string): WalletTransaction | null {
    const wallet = this.wallets.get(userId);
    if (!wallet) return null;

    const transaction: WalletTransaction = {
      id: `txn_${Date.now()}_${Math.random()}`,
      userId,
      type: 'credit_added',
      amount,
      description,
      timestamp: new Date(),
      status: 'completed'
    };

    wallet.balance += amount;
    wallet.totalCredits += amount;
    wallet.transactions.push(transaction);
    wallet.updatedAt = new Date();

    const history = this.transactionHistory.get(userId) || [];
    history.push(transaction);
    this.transactionHistory.set(userId, history);

    return transaction;
  }

  /**
   * Deduct from wallet for ride payment
   */
  deductForRide(userId: string, amount: number, rideId: string): WalletTransaction | null {
    const wallet = this.wallets.get(userId);
    if (!wallet || wallet.balance < amount) return null;

    const transaction: WalletTransaction = {
      id: `txn_${Date.now()}_${Math.random()}`,
      userId,
      type: 'ride_payment',
      amount,
      description: `Ride payment for ${rideId}`,
      rideId,
      timestamp: new Date(),
      status: 'completed'
    };

    wallet.balance -= amount;
    wallet.totalSpent += amount;
    wallet.transactions.push(transaction);
    wallet.updatedAt = new Date();

    const history = this.transactionHistory.get(userId) || [];
    history.push(transaction);
    this.transactionHistory.set(userId, history);

    return transaction;
  }

  /**
   * Apply promo code
   */
  applyPromoCode(userId: string, promoCode: string, discount: number): WalletTransaction | null {
    const wallet = this.wallets.get(userId);
    if (!wallet) return null;

    const transaction: WalletTransaction = {
      id: `txn_${Date.now()}_${Math.random()}`,
      userId,
      type: 'promo_applied',
      amount: discount,
      description: `Promo code ${promoCode} applied`,
      timestamp: new Date(),
      status: 'completed'
    };

    wallet.balance += discount;
    wallet.totalCredits += discount;
    wallet.transactions.push(transaction);
    wallet.updatedAt = new Date();

    const history = this.transactionHistory.get(userId) || [];
    history.push(transaction);
    this.transactionHistory.set(userId, history);

    return transaction;
  }

  /**
   * Process refund
   */
  processRefund(userId: string, amount: number, rideId: string, reason: string): WalletTransaction | null {
    const wallet = this.wallets.get(userId);
    if (!wallet) return null;

    const transaction: WalletTransaction = {
      id: `txn_${Date.now()}_${Math.random()}`,
      userId,
      type: 'refund',
      amount,
      description: `Refund for ride ${rideId}: ${reason}`,
      rideId,
      timestamp: new Date(),
      status: 'completed'
    };

    wallet.balance += amount;
    wallet.totalCredits += amount;
    wallet.transactions.push(transaction);
    wallet.updatedAt = new Date();

    const history = this.transactionHistory.get(userId) || [];
    history.push(transaction);
    this.transactionHistory.set(userId, history);

    return transaction;
  }

  /**
   * Get transaction history
   */
  getTransactionHistory(userId: string, limit: number = 50): WalletTransaction[] {
    const history = this.transactionHistory.get(userId) || [];
    return history.slice(-limit).reverse();
  }

  /**
   * Get spending summary
   */
  getSpendingSummary(userId: string): {
    totalSpent: number;
    totalCredits: number;
    currentBalance: number;
    averageRideSpent: number;
    totalRides: number;
  } {
    const wallet = this.wallets.get(userId);
    if (!wallet) {
      return {
        totalSpent: 0,
        totalCredits: 0,
        currentBalance: 0,
        averageRideSpent: 0,
        totalRides: 0
      };
    }

    const ridePayments = wallet.transactions.filter(t => t.type === 'ride_payment');
    const totalRides = ridePayments.length;
    const averageRideSpent = totalRides > 0 ? wallet.totalSpent / totalRides : 0;

    return {
      totalSpent: wallet.totalSpent,
      totalCredits: wallet.totalCredits,
      currentBalance: wallet.balance,
      averageRideSpent: Math.round(averageRideSpent * 100) / 100,
      totalRides
    };
  }

  /**
   * Get monthly spending
   */
  getMonthlySpendings(userId: string): Array<{ month: string; spent: number }> {
    const history = this.transactionHistory.get(userId) || [];
    const monthlyData: Map<string, number> = new Map();

    history.forEach(txn => {
      if (txn.type === 'ride_payment') {
        const date = new Date(txn.timestamp);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + txn.amount);
      }
    });

    return Array.from(monthlyData.entries())
      .map(([month, spent]) => ({ month, spent }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  /**
   * Check if user has sufficient balance
   */
  hasSufficientBalance(userId: string, amount: number): boolean {
    const wallet = this.wallets.get(userId);
    return wallet ? wallet.balance >= amount : false;
  }

  /**
   * Get wallet statistics
   */
  getWalletStats(): {
    totalUsers: number;
    totalBalance: number;
    totalTransactions: number;
    averageBalance: number;
  } {
    let totalBalance = 0;
    let totalTransactions = 0;

    this.wallets.forEach(wallet => {
      totalBalance += wallet.balance;
    });

    this.transactionHistory.forEach(history => {
      totalTransactions += history.length;
    });

    const totalUsers = this.wallets.size;
    const averageBalance = totalUsers > 0 ? totalBalance / totalUsers : 0;

    return {
      totalUsers,
      totalBalance: Math.round(totalBalance * 100) / 100,
      totalTransactions,
      averageBalance: Math.round(averageBalance * 100) / 100
    };
  }
}

export const walletService = new WalletService();
