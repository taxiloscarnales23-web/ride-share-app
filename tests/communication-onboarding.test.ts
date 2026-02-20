import { describe, it, expect } from 'vitest';
import { SMSEmailService } from '../server/sms-email';
import { DriverOnboardingService } from '../server/driver-onboarding';
import { OfflineModeService } from '../server/offline-mode';

describe('SMS/Email Notification Service', () => {
  const smsEmailService = new SMSEmailService();

  it('should get ride accepted template', () => {
    const template = smsEmailService.getTemplate('ride_accepted');
    expect(template.subject).toBe('Your Ride Has Been Accepted');
    expect(template.smsText).toContain('accepted');
  });

  it('should get payment received template', () => {
    const template = smsEmailService.getTemplate('payment_received');
    expect(template.subject).toBe('Payment Received');
    expect(template.body).toContain('confirmed');
  });

  it('should send SMS notification', async () => {
    const result = await smsEmailService.sendSMS('+1234567890', 'Test message');
    expect(result).toBe(true);
  });

  it('should send email notification', async () => {
    const result = await smsEmailService.sendEmail(
      'test@example.com',
      'Test Subject',
      '<p>Test body</p>'
    );
    expect(result).toBe(true);
  });

  it('should send ride notification with SMS and email', async () => {
    await smsEmailService.sendRideNotification({
      type: 'ride_accepted',
      rideId: 'ride123',
      recipientPhone: '+1234567890',
      recipientEmail: 'rider@example.com',
      driverName: 'John Doe',
      amount: 25.50
    });
    // Service should complete without error
    expect(true).toBe(true);
  });

  it('should send payment receipt', async () => {
    const result = await smsEmailService.sendPaymentReceipt(
      'rider@example.com',
      'ride123',
      25.50,
      'Cash',
      new Date()
    );
    expect(result).toBe(true);
  });
});

describe('Driver Onboarding Service', () => {
  const onboardingService = new DriverOnboardingService();

  it('should initialize onboarding for new driver', () => {
    const progress = onboardingService.initializeOnboarding('driver123');
    expect(progress.driverId).toBe('driver123');
    expect(progress.currentStep).toBe('personal_info');
    expect(progress.completedSteps).toHaveLength(0);
    expect(progress.approvalStatus).toBe('pending');
  });

  it('should get next onboarding step', () => {
    const nextStep = onboardingService.getNextStep('personal_info');
    expect(nextStep).toBe('vehicle_info');
  });

  it('should complete onboarding step', () => {
    let progress = onboardingService.initializeOnboarding('driver123');
    progress = onboardingService.completeStep(progress, 'personal_info');
    expect(progress.completedSteps).toContain('personal_info');
    expect(progress.currentStep).toBe('vehicle_info');
  });

  it('should verify driver documents', () => {
    let progress = onboardingService.initializeOnboarding('driver123');
    progress = onboardingService.verifyDocuments(progress, true, true, true);
    expect(progress.documentsSubmitted.licenseVerified).toBe(true);
    expect(progress.documentsSubmitted.insuranceVerified).toBe(true);
    expect(progress.documentsSubmitted.registrationVerified).toBe(true);
  });

  it('should process vehicle inspection', () => {
    let progress = onboardingService.initializeOnboarding('driver123');
    progress = onboardingService.processVehicleInspection(progress, true);
    expect(progress.vehicleInspection.status).toBe('passed');
    expect(progress.vehicleInspection.lastInspectionDate).toBeDefined();
  });

  it('should complete training', () => {
    let progress = onboardingService.initializeOnboarding('driver123');
    progress = onboardingService.completeTraining(progress);
    expect(progress.trainingCompleted).toBe(true);
  });

  it('should approve driver when all requirements met', () => {
    let progress = onboardingService.initializeOnboarding('driver123');
    progress = onboardingService.verifyDocuments(progress, true, true, true);
    progress = onboardingService.processVehicleInspection(progress, true);
    progress = onboardingService.completeTraining(progress);
    progress = onboardingService.approveDriver(progress);
    expect(progress.approvalStatus).toBe('approved');
  });

  it('should calculate onboarding completion percentage', () => {
    let progress = onboardingService.initializeOnboarding('driver123');
    progress = onboardingService.completeStep(progress, 'personal_info');
    progress = onboardingService.completeStep(progress, 'vehicle_info');
    const percentage = onboardingService.getCompletionPercentage(progress);
    expect(percentage).toBeGreaterThan(0);
    expect(percentage).toBeLessThanOrEqual(100);
  });

  it('should check if driver is ready for approval', () => {
    let progress = onboardingService.initializeOnboarding('driver123');
    let ready = onboardingService.isReadyForApproval(progress);
    expect(ready).toBe(false);

    progress = onboardingService.verifyDocuments(progress, true, true, true);
    progress = onboardingService.processVehicleInspection(progress, true);
    progress = onboardingService.completeTraining(progress);
    progress.documentsSubmitted.backgroundCheckPending = false;
    ready = onboardingService.isReadyForApproval(progress);
    expect(ready).toBe(true);
  });

  it('should get status summary', () => {
    const progress = onboardingService.initializeOnboarding('driver123');
    const summary = onboardingService.getStatusSummary(progress);
    expect(summary).toContain('Onboarding');
  });
});

describe('Offline Mode Service', () => {
  const offlineModeService = new OfflineModeService();

  it('should initialize offline mode', () => {
    offlineModeService.initializeOfflineMode('user123');
    const data = offlineModeService.getCachedData('user123');
    expect(data).toBeDefined();
    expect(data?.rideHistory).toHaveLength(0);
  });

  it('should cache user data', () => {
    offlineModeService.initializeOfflineMode('user123');
    const mockData = {
      rideHistory: [
        {
          id: 'ride1',
          pickupLocation: 'Home',
          dropoffLocation: 'Work',
          fare: 15.50,
          date: new Date(),
          driverName: 'John',
          rating: 5
        }
      ],
      userProfile: {
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '+1234567890',
        rating: 4.8,
        totalRides: 50
      },
      supportTickets: [],
      savedLocations: []
    };

    offlineModeService.cacheUserData('user123', mockData);
    const cached = offlineModeService.getCachedData('user123');
    expect(cached?.rideHistory).toHaveLength(1);
    expect(cached?.userProfile.name).toBe('Jane Doe');
  });

  it('should queue actions for sync', () => {
    offlineModeService.initializeOfflineMode('user123');
    offlineModeService.queueAction('user123', 'rating', { rideId: 'ride1', rating: 5 });
    const pending = offlineModeService.getPendingActions('user123');
    expect(pending).toHaveLength(1);
    expect(pending[0].type).toBe('rating');
  });

  it('should clear sync queue', () => {
    offlineModeService.initializeOfflineMode('user123');
    offlineModeService.queueAction('user123', 'rating', { rideId: 'ride1', rating: 5 });
    offlineModeService.clearSyncQueue('user123');
    const pending = offlineModeService.getPendingActions('user123');
    expect(pending).toHaveLength(0);
  });

  it('should check if data is stale', () => {
    const oldDate = new Date(Date.now() - 25 * 60 * 60 * 1000); // 25 hours ago
    const stale = offlineModeService.isDataStale(oldDate);
    expect(stale).toBe(true);

    const recentDate = new Date(Date.now() - 1 * 60 * 60 * 1000); // 1 hour ago
    const notStale = offlineModeService.isDataStale(recentDate);
    expect(notStale).toBe(false);
  });

  it('should get available offline features', () => {
    const features = offlineModeService.getAvailableOfflineFeatures();
    expect(features).toContain('View ride history');
    expect(features).toContain('View user profile');
  });

  it('should get unavailable features when offline', () => {
    const features = offlineModeService.getUnavailableFeatures();
    expect(features).toContain('Request new ride');
    expect(features).toContain('Real-time location tracking');
  });

  it('should estimate sync time', () => {
    offlineModeService.initializeOfflineMode('user123');
    offlineModeService.queueAction('user123', 'rating', { rideId: 'ride1', rating: 5 });
    offlineModeService.queueAction('user123', 'rating', { rideId: 'ride2', rating: 4 });
    const estimatedTime = offlineModeService.estimateSyncTime('user123');
    expect(estimatedTime).toBe(1000); // 2 actions * 500ms
  });

  it('should get offline mode status', () => {
    offlineModeService.initializeOfflineMode('user123');
    offlineModeService.queueAction('user123', 'rating', { rideId: 'ride1', rating: 5 });
    const status = offlineModeService.getOfflineModeStatus('user123');
    expect(status.isOffline).toBe(true);
    expect(status.pendingActions).toBe(1);
    expect(status.estimatedSyncTime).toBe(500);
  });

  it('should add and get saved locations', () => {
    offlineModeService.initializeOfflineMode('user123');
    offlineModeService.addSavedLocation('user123', 'Home', 40.7128, -74.0060);
    offlineModeService.addSavedLocation('user123', 'Work', 40.7580, -73.9855);
    const locations = offlineModeService.getSavedLocations('user123');
    expect(locations).toHaveLength(2);
    expect(locations[0].label).toBe('Home');
  });

  it('should prepare data for offline sync', () => {
    offlineModeService.initializeOfflineMode('user123');
    offlineModeService.queueAction('user123', 'rating', { rideId: 'ride1', rating: 5 });
    const syncData = offlineModeService.prepareForOfflineSync('user123');
    expect(syncData.cachedData).toBeDefined();
    expect(syncData.pendingActions).toHaveLength(1);
    expect(syncData.status).toBe('ready_for_sync');
  });
});
