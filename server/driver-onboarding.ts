/**
 * Driver Onboarding Service
 * Manages driver signup, verification, and compliance requirements
 */

export type OnboardingStep = 
  | 'personal_info'
  | 'vehicle_info'
  | 'documents'
  | 'background_check'
  | 'vehicle_inspection'
  | 'training'
  | 'approval';

export interface OnboardingProgress {
  driverId: string;
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  documentsSubmitted: {
    licenseVerified: boolean;
    insuranceVerified: boolean;
    registrationVerified: boolean;
    backgroundCheckPending: boolean;
  };
  vehicleInspection: {
    status: 'pending' | 'passed' | 'failed';
    lastInspectionDate?: Date;
  };
  trainingCompleted: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected';
}

export class DriverOnboardingService {
  /**
   * Initialize onboarding for new driver
   */
  initializeOnboarding(driverId: string): OnboardingProgress {
    return {
      driverId,
      currentStep: 'personal_info',
      completedSteps: [],
      documentsSubmitted: {
        licenseVerified: false,
        insuranceVerified: false,
        registrationVerified: false,
        backgroundCheckPending: false
      },
      vehicleInspection: {
        status: 'pending'
      },
      trainingCompleted: false,
      approvalStatus: 'pending'
    };
  }

  /**
   * Get next step in onboarding process
   */
  getNextStep(currentStep: OnboardingStep): OnboardingStep | null {
    const steps: OnboardingStep[] = [
      'personal_info',
      'vehicle_info',
      'documents',
      'background_check',
      'vehicle_inspection',
      'training',
      'approval'
    ];

    const currentIndex = steps.indexOf(currentStep);
    return currentIndex < steps.length - 1 ? steps[currentIndex + 1] : null;
  }

  /**
   * Mark step as completed
   */
  completeStep(progress: OnboardingProgress, step: OnboardingStep): OnboardingProgress {
    if (!progress.completedSteps.includes(step)) {
      progress.completedSteps.push(step);
    }

    const nextStep = this.getNextStep(step);
    if (nextStep) {
      progress.currentStep = nextStep;
    }

    return progress;
  }

  /**
   * Verify driver documents
   */
  verifyDocuments(
    progress: OnboardingProgress,
    licenseValid: boolean,
    insuranceValid: boolean,
    registrationValid: boolean
  ): OnboardingProgress {
    progress.documentsSubmitted = {
      licenseVerified: licenseValid,
      insuranceVerified: insuranceValid,
      registrationVerified: registrationValid,
      backgroundCheckPending: true
    };

    if (licenseValid && insuranceValid && registrationValid) {
      progress = this.completeStep(progress, 'documents');
    }

    return progress;
  }

  /**
   * Process vehicle inspection
   */
  processVehicleInspection(
    progress: OnboardingProgress,
    passed: boolean
  ): OnboardingProgress {
    progress.vehicleInspection = {
      status: passed ? 'passed' : 'failed',
      lastInspectionDate: new Date()
    };

    if (passed) {
      progress = this.completeStep(progress, 'vehicle_inspection');
    }

    return progress;
  }

  /**
   * Mark training as completed
   */
  completeTraining(progress: OnboardingProgress): OnboardingProgress {
    progress.trainingCompleted = true;
    return this.completeStep(progress, 'training');
  }

  /**
   * Approve driver for platform
   */
  approveDriver(progress: OnboardingProgress): OnboardingProgress {
    if (
      progress.documentsSubmitted.licenseVerified &&
      progress.documentsSubmitted.insuranceVerified &&
      progress.documentsSubmitted.registrationVerified &&
      progress.vehicleInspection.status === 'passed' &&
      progress.trainingCompleted
    ) {
      progress.approvalStatus = 'approved';
      progress = this.completeStep(progress, 'approval');
    }

    return progress;
  }

  /**
   * Reject driver application
   */
  rejectDriver(progress: OnboardingProgress, reason: string): OnboardingProgress {
    progress.approvalStatus = 'rejected';
    console.log(`Driver ${progress.driverId} rejected: ${reason}`);
    return progress;
  }

  /**
   * Get onboarding completion percentage
   */
  getCompletionPercentage(progress: OnboardingProgress): number {
    const totalSteps = 7; // personal_info, vehicle_info, documents, background_check, vehicle_inspection, training, approval
    return Math.round((progress.completedSteps.length / totalSteps) * 100);
  }

  /**
   * Check if driver is ready for approval
   */
  isReadyForApproval(progress: OnboardingProgress): boolean {
    return (
      progress.documentsSubmitted.licenseVerified &&
      progress.documentsSubmitted.insuranceVerified &&
      progress.documentsSubmitted.registrationVerified &&
      progress.vehicleInspection.status === 'passed' &&
      progress.trainingCompleted &&
      !progress.documentsSubmitted.backgroundCheckPending
    );
  }

  /**
   * Get onboarding status summary
   */
  getStatusSummary(progress: OnboardingProgress): string {
    const percentage = this.getCompletionPercentage(progress);
    const ready = this.isReadyForApproval(progress);

    if (progress.approvalStatus === 'approved') {
      return 'Approved - Ready to drive';
    }
    if (progress.approvalStatus === 'rejected') {
      return 'Application rejected';
    }
    if (ready) {
      return 'Ready for approval review';
    }
    return `Onboarding ${percentage}% complete`;
  }
}

export const driverOnboardingService = new DriverOnboardingService();
