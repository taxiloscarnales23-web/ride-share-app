import { describe, it, expect, beforeEach } from 'vitest';
import { RideSchedulingService } from '../server/ride-scheduling';
import { WalletService } from '../server/wallet';
import { EmergencySosService } from '../server/emergency-sos';

describe('Ride Scheduling Service', () => {
  let schedulingService: RideSchedulingService;

  beforeEach(() => {
    schedulingService = new RideSchedulingService();
  });

  it('should schedule a ride', () => {
    const scheduledTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const ride = schedulingService.scheduleRide(
      'rider_1',
      '123 Main St',
      '456 Oak Ave',
      scheduledTime,
      25,
      20,
      'Please wait at entrance'
    );

    expect(ride.riderId).toBe('rider_1');
    expect(ride.estimatedFare).toBe(25);
    expect(ride.status).toBe('scheduled');
  });

  it('should get scheduled ride', () => {
    const scheduledTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const ride = schedulingService.scheduleRide('rider_1', '123 Main St', '456 Oak Ave', scheduledTime, 25, 20);

    const retrieved = schedulingService.getScheduledRide(ride.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.id).toBe(ride.id);
  });

  it('should get rider scheduled rides', () => {
    const scheduledTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
    schedulingService.scheduleRide('rider_1', '123 Main St', '456 Oak Ave', scheduledTime, 25, 20);
    schedulingService.scheduleRide('rider_1', '789 Pine Rd', '321 Elm St', scheduledTime, 30, 25);

    const rides = schedulingService.getRiderScheduledRides('rider_1');
    expect(rides.length).toBe(2);
  });

  it('should confirm scheduled ride', () => {
    const scheduledTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const ride = schedulingService.scheduleRide('rider_1', '123 Main St', '456 Oak Ave', scheduledTime, 25, 20);

    const confirmed = schedulingService.confirmScheduledRide(ride.id, 'driver_1', 'John Driver');
    expect(confirmed!.status).toBe('confirmed');
    expect(confirmed!.driverId).toBe('driver_1');
  });

  it('should cancel scheduled ride', () => {
    const scheduledTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const ride = schedulingService.scheduleRide('rider_1', '123 Main St', '456 Oak Ave', scheduledTime, 25, 20);

    const cancelled = schedulingService.cancelScheduledRide(ride.id);
    expect(cancelled!.status).toBe('cancelled');
  });

  it('should reschedule ride', () => {
    const scheduledTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const ride = schedulingService.scheduleRide('rider_1', '123 Main St', '456 Oak Ave', scheduledTime, 25, 20);

    const newTime = new Date(Date.now() + 48 * 60 * 60 * 1000);
    const rescheduled = schedulingService.rescheduleRide(ride.id, newTime);
    expect(rescheduled!.scheduledTime).toEqual(newTime);
  });

  it('should get upcoming rides', () => {
    const scheduledTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
    schedulingService.scheduleRide('rider_1', '123 Main St', '456 Oak Ave', scheduledTime, 25, 20);

    const upcoming = schedulingService.getUpcomingRides('rider_1');
    expect(upcoming.length).toBe(1);
  });

  it('should get scheduling stats', () => {
    const scheduledTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
    schedulingService.scheduleRide('rider_1', '123 Main St', '456 Oak Ave', scheduledTime, 25, 20);

    const stats = schedulingService.getSchedulingStats('rider_1');
    expect(stats.totalScheduled).toBe(1);
    expect(stats.upcomingRides).toBe(1);
  });
});

describe('Wallet Service', () => {
  let walletService: WalletService;

  beforeEach(() => {
    walletService = new WalletService();
  });

  it('should initialize wallet', () => {
    const wallet = walletService.initializeWallet('rider_1');
    expect(wallet.userId).toBe('rider_1');
    expect(wallet.balance).toBe(0);
  });

  it('should add credits', () => {
    walletService.initializeWallet('rider_1');
    const txn = walletService.addCredits('rider_1', 50, 'Promo credit');

    expect(txn).not.toBeNull();
    expect(txn!.amount).toBe(50);
    expect(walletService.getWallet('rider_1')!.balance).toBe(50);
  });

  it('should deduct for ride', () => {
    walletService.initializeWallet('rider_1');
    walletService.addCredits('rider_1', 100, 'Initial credit');

    const txn = walletService.deductForRide('rider_1', 25, 'ride_123');
    expect(txn).not.toBeNull();
    expect(walletService.getWallet('rider_1')!.balance).toBe(75);
  });

  it('should not deduct if insufficient balance', () => {
    walletService.initializeWallet('rider_1');
    walletService.addCredits('rider_1', 20, 'Initial credit');

    const txn = walletService.deductForRide('rider_1', 50, 'ride_123');
    expect(txn).toBeNull();
  });

  it('should apply promo code', () => {
    walletService.initializeWallet('rider_1');
    const txn = walletService.applyPromoCode('rider_1', 'SAVE20', 20);

    expect(txn).not.toBeNull();
    expect(walletService.getWallet('rider_1')!.balance).toBe(20);
  });

  it('should process refund', () => {
    walletService.initializeWallet('rider_1');
    walletService.addCredits('rider_1', 100, 'Initial credit');
    walletService.deductForRide('rider_1', 25, 'ride_123');

    const refund = walletService.processRefund('rider_1', 25, 'ride_123', 'Driver cancelled');
    expect(refund).not.toBeNull();
    expect(walletService.getWallet('rider_1')!.balance).toBe(100);
  });

  it('should get transaction history', () => {
    walletService.initializeWallet('rider_1');
    walletService.addCredits('rider_1', 50, 'Credit 1');
    walletService.addCredits('rider_1', 30, 'Credit 2');

    const history = walletService.getTransactionHistory('rider_1');
    expect(history.length).toBe(2);
  });

  it('should get spending summary', () => {
    walletService.initializeWallet('rider_1');
    walletService.addCredits('rider_1', 100, 'Initial credit');
    walletService.deductForRide('rider_1', 25, 'ride_1');
    walletService.deductForRide('rider_1', 30, 'ride_2');

    const summary = walletService.getSpendingSummary('rider_1');
    expect(summary.totalSpent).toBe(55);
    expect(summary.currentBalance).toBe(45);
    expect(summary.totalRides).toBe(2);
  });

  it('should check sufficient balance', () => {
    walletService.initializeWallet('rider_1');
    walletService.addCredits('rider_1', 50, 'Credit');

    expect(walletService.hasSufficientBalance('rider_1', 30)).toBe(true);
    expect(walletService.hasSufficientBalance('rider_1', 60)).toBe(false);
  });

  it('should get wallet statistics', () => {
    walletService.initializeWallet('rider_1');
    walletService.initializeWallet('rider_2');
    walletService.addCredits('rider_1', 100, 'Credit');

    const stats = walletService.getWalletStats();
    expect(stats.totalUsers).toBe(2);
    expect(stats.totalBalance).toBe(100);
  });
});

describe('Emergency SOS Service', () => {
  let sosService: EmergencySosService;

  beforeEach(() => {
    sosService = new EmergencySosService();
  });

  it('should add emergency contact', () => {
    const contact = sosService.addEmergencyContact('rider_1', 'Mom', '+1234567890', 'Mother', 'primary');

    expect(contact.name).toBe('Mom');
    expect(contact.phone).toBe('+1234567890');
    expect(contact.priority).toBe('primary');
  });

  it('should get emergency contacts', () => {
    sosService.addEmergencyContact('rider_1', 'Mom', '+1234567890', 'Mother', 'primary');
    sosService.addEmergencyContact('rider_1', 'Dad', '+0987654321', 'Father', 'secondary');

    const contacts = sosService.getEmergencyContacts('rider_1');
    expect(contacts.length).toBe(2);
    expect(contacts[0].priority).toBe('primary');
  });

  it('should update emergency contact', () => {
    const contact = sosService.addEmergencyContact('rider_1', 'Mom', '+1234567890', 'Mother', 'primary');

    const updated = sosService.updateEmergencyContact('rider_1', contact.id, { phone: '+1111111111' });
    expect(updated!.phone).toBe('+1111111111');
  });

  it('should delete emergency contact', () => {
    const contact = sosService.addEmergencyContact('rider_1', 'Mom', '+1234567890', 'Mother', 'primary');

    const deleted = sosService.deleteEmergencyContact('rider_1', contact.id);
    expect(deleted).toBe(true);
    expect(sosService.getEmergencyContacts('rider_1').length).toBe(0);
  });

  it('should trigger SOS alert', () => {
    const alert = sosService.triggerSOSAlert('rider_1', 'ride_123', { latitude: 40.7128, longitude: -74.006 }, 'emergency', 'Help needed');

    expect(alert.status).toBe('active');
    expect(alert.alertType).toBe('emergency');
  });

  it('should resolve SOS alert', () => {
    const alert = sosService.triggerSOSAlert('rider_1', 'ride_123', { latitude: 40.7128, longitude: -74.006 }, 'emergency');

    const resolved = sosService.resolveSOSAlert(alert.id, 'operator_1');
    expect(resolved!.status).toBe('resolved');
  });

  it('should mark as false alarm', () => {
    const alert = sosService.triggerSOSAlert('rider_1', 'ride_123', { latitude: 40.7128, longitude: -74.006 }, 'emergency');

    const falseAlarm = sosService.markAsFalseAlarm(alert.id);
    expect(falseAlarm!.status).toBe('false_alarm');
  });

  it('should get active alerts', () => {
    sosService.triggerSOSAlert('rider_1', 'ride_123', { latitude: 40.7128, longitude: -74.006 }, 'emergency');
    sosService.triggerSOSAlert('rider_2', 'ride_456', { latitude: 40.7128, longitude: -74.006 }, 'accident');

    const active = sosService.getActiveAlerts();
    expect(active.length).toBe(2);
  });

  it('should get user SOS history', () => {
    sosService.triggerSOSAlert('rider_1', 'ride_123', { latitude: 40.7128, longitude: -74.006 }, 'emergency');
    sosService.triggerSOSAlert('rider_1', 'ride_456', { latitude: 40.7128, longitude: -74.006 }, 'accident');

    const history = sosService.getUserSOSHistory('rider_1');
    expect(history.length).toBe(2);
  });

  it('should contact emergency services', () => {
    const alert = sosService.triggerSOSAlert('rider_1', 'ride_123', { latitude: 40.7128, longitude: -74.006 }, 'emergency');

    const contacted = sosService.contactEmergencyServices(alert.id, 'medical_emergency');
    expect(contacted).toBe(true);
    expect(sosService.getSOSAlert(alert.id)!.emergencyServicesContacted).toBe(true);
  });

  it('should share location with contact', () => {
    const contact = sosService.addEmergencyContact('rider_1', 'Mom', '+1234567890', 'Mother', 'primary');

    const shared = sosService.shareLocationWithContact('rider_1', contact.id, { latitude: 40.7128, longitude: -74.006 });
    expect(shared).toBe(true);
  });

  it('should get safety statistics', () => {
    sosService.triggerSOSAlert('rider_1', 'ride_123', { latitude: 40.7128, longitude: -74.006 }, 'emergency');
    sosService.triggerSOSAlert('rider_2', 'ride_456', { latitude: 40.7128, longitude: -74.006 }, 'unsafe_driver');

    const stats = sosService.getSafetyStats();
    expect(stats.totalAlerts).toBe(2);
    expect(stats.activeAlerts).toBe(2);
  });

  it('should enable ride sharing', () => {
    const contact = sosService.addEmergencyContact('rider_1', 'Mom', '+1234567890', 'Mother', 'primary');

    const shared = sosService.enableRideSharing('rider_1', contact.id, 'ride_123');
    expect(shared).toBe(true);
  });
});
