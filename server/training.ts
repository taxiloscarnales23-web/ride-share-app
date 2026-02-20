/**
 * Driver Training and Certification Module
 * Manages training courses, certifications, and compliance requirements
 */

export type CertificationLevel = "basic" | "advanced" | "expert";
export type TrainingStatus = "not_started" | "in_progress" | "completed" | "expired";

export interface TrainingCourse {
  courseId: string;
  title: string;
  description: string;
  level: CertificationLevel;
  durationMinutes: number;
  modules: TrainingModule[];
  passingScore: number;
  certificateValidityDays: number;
}

export interface TrainingModule {
  moduleId: string;
  title: string;
  content: string;
  videoUrl?: string;
  duration: number;
  quiz: QuizQuestion[];
}

export interface QuizQuestion {
  questionId: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface DriverCertification {
  certId: string;
  driverId: string;
  courseId: string;
  status: TrainingStatus;
  enrolledDate: Date;
  completedDate?: Date;
  expiryDate?: Date;
  score?: number;
  certificateUrl?: string;
}

export interface DriverTrainingProgress {
  progressId: string;
  driverId: string;
  courseId: string;
  completedModules: string[];
  currentModuleId: string;
  overallProgress: number;
  lastUpdated: Date;
}

export interface TrainingRecord {
  recordId: string;
  driverId: string;
  certifications: DriverCertification[];
  totalCoursesCompleted: number;
  trainingHours: number;
  lastTrainingDate: Date;
  complianceStatus: "compliant" | "non_compliant" | "warning";
}

export class TrainingService {
  private courses: Map<string, TrainingCourse> = new Map();
  private certifications: Map<string, DriverCertification> = new Map();
  private progress: Map<string, DriverTrainingProgress> = new Map();
  private records: Map<string, TrainingRecord> = new Map();

  constructor() {
    this.initializeDefaultCourses();
  }

  /**
   * Initialize default training courses
   */
  private initializeDefaultCourses(): void {
    const basicCourse: TrainingCourse = {
      courseId: "course_basic",
      title: "Basic Driver Safety",
      description: "Essential safety and compliance training for all drivers",
      level: "basic",
      durationMinutes: 120,
      modules: [
        {
          moduleId: "mod_1",
          title: "Traffic Laws and Regulations",
          content: "Overview of traffic laws and local regulations",
          duration: 30,
          quiz: [
            {
              questionId: "q1",
              question: "What is the speed limit in residential areas?",
              options: ["20 mph", "35 mph", "50 mph", "65 mph"],
              correctAnswer: 0,
              explanation: "Speed limits in residential areas are typically 20-25 mph",
            },
          ],
        },
        {
          moduleId: "mod_2",
          title: "Vehicle Maintenance",
          content: "Regular maintenance and safety checks",
          duration: 30,
          quiz: [
            {
              questionId: "q2",
              question: "How often should tire pressure be checked?",
              options: ["Monthly", "Quarterly", "Annually", "Never"],
              correctAnswer: 0,
              explanation: "Tire pressure should be checked monthly for safety",
            },
          ],
        },
        {
          moduleId: "mod_3",
          title: "Customer Service",
          content: "Professional customer interaction and communication",
          duration: 30,
          quiz: [
            {
              questionId: "q3",
              question: "What is the best approach to handle a difficult passenger?",
              options: [
                "Stay calm and professional",
                "Argue with them",
                "End the ride immediately",
                "Ignore them",
              ],
              correctAnswer: 0,
              explanation: "Always maintain professionalism and composure",
            },
          ],
        },
        {
          moduleId: "mod_4",
          title: "Emergency Procedures",
          content: "How to handle emergencies and accidents",
          duration: 30,
          quiz: [
            {
              questionId: "q4",
              question: "What should you do first in case of an accident?",
              options: [
                "Check for injuries and call emergency services",
                "Leave the scene",
                "Take photos only",
                "Wait for police",
              ],
              correctAnswer: 0,
              explanation: "Always prioritize safety and call emergency services first",
            },
          ],
        },
      ],
      passingScore: 80,
      certificateValidityDays: 365,
    };

    const advancedCourse: TrainingCourse = {
      courseId: "course_advanced",
      title: "Advanced Driver Skills",
      description: "Advanced techniques for experienced drivers",
      level: "advanced",
      durationMinutes: 180,
      modules: [
        {
          moduleId: "mod_adv_1",
          title: "Defensive Driving",
          content: "Advanced defensive driving techniques",
          duration: 45,
          quiz: [],
        },
        {
          moduleId: "mod_adv_2",
          title: "Route Optimization",
          content: "Efficient route planning and navigation",
          duration: 45,
          quiz: [],
        },
        {
          moduleId: "mod_adv_3",
          title: "Passenger Psychology",
          content: "Understanding and managing passenger expectations",
          duration: 45,
          quiz: [],
        },
        {
          moduleId: "mod_adv_4",
          title: "Accessibility and Inclusivity",
          content: "Serving passengers with disabilities",
          duration: 45,
          quiz: [],
        },
      ],
      passingScore: 85,
      certificateValidityDays: 730,
    };

    this.courses.set(basicCourse.courseId, basicCourse);
    this.courses.set(advancedCourse.courseId, advancedCourse);
  }

  /**
   * Get available courses
   */
  getAvailableCourses(): TrainingCourse[] {
    return Array.from(this.courses.values());
  }

  /**
   * Get course details
   */
  getCourse(courseId: string): TrainingCourse | null {
    return this.courses.get(courseId) || null;
  }

  /**
   * Enroll driver in course
   */
  enrollDriver(driverId: string, courseId: string): DriverCertification | null {
    const course = this.courses.get(courseId);
    if (!course) return null;

    const certId = `cert_${Date.now()}`;
    const cert: DriverCertification = {
      certId,
      driverId,
      courseId,
      status: "in_progress",
      enrolledDate: new Date(),
    };

    this.certifications.set(certId, cert);

    // Initialize progress tracking
    const progressId = `prog_${Date.now()}`;
    const progress: DriverTrainingProgress = {
      progressId,
      driverId,
      courseId,
      completedModules: [],
      currentModuleId: course.modules[0]?.moduleId || "",
      overallProgress: 0,
      lastUpdated: new Date(),
    };

    this.progress.set(progressId, progress);

    return cert;
  }

  /**
   * Get driver certifications
   */
  getDriverCertifications(driverId: string): DriverCertification[] {
    return Array.from(this.certifications.values()).filter(
      (cert) => cert.driverId === driverId
    );
  }

  /**
   * Mark module as completed
   */
  completeModule(
    driverId: string,
    courseId: string,
    moduleId: string,
    quizScore: number
  ): boolean {
    let progressRecord = null;
    for (const prog of this.progress.values()) {
      if (prog.driverId === driverId && prog.courseId === courseId) {
        progressRecord = prog;
        break;
      }
    }

    if (!progressRecord) return false;

    const course = this.courses.get(courseId);
    if (!course) return false;

    if (!progressRecord.completedModules.includes(moduleId)) {
      progressRecord.completedModules.push(moduleId);
    }

    progressRecord.overallProgress = Math.round(
      (progressRecord.completedModules.length / course.modules.length) * 100
    );
    progressRecord.lastUpdated = new Date();

    return true;
  }

  /**
   * Complete course and generate certificate
   */
  completeCourse(
    driverId: string,
    courseId: string,
    finalScore: number
  ): DriverCertification | null {
    const course = this.courses.get(courseId);
    if (!course || finalScore < course.passingScore) return null;

    let cert = null;
    for (const c of this.certifications.values()) {
      if (c.driverId === driverId && c.courseId === courseId) {
        cert = c;
        break;
      }
    }

    if (!cert) return null;

    cert.status = "completed";
    cert.completedDate = new Date();
    cert.score = finalScore;
    cert.expiryDate = new Date(
      Date.now() + course.certificateValidityDays * 24 * 60 * 60 * 1000
    );
    cert.certificateUrl = `https://certificates.rideshare.com/${cert.certId}`;

    // Update or create training record
    let record = this.records.get(driverId);
    if (!record) {
      record = {
        recordId: `rec_${Date.now()}`,
        driverId,
        certifications: [],
        totalCoursesCompleted: 0,
        trainingHours: 0,
        lastTrainingDate: new Date(),
        complianceStatus: "compliant",
      };
      this.records.set(driverId, record);
    }

    record.certifications.push(cert);
    record.totalCoursesCompleted++;
    record.trainingHours += course.durationMinutes / 60;
    record.lastTrainingDate = new Date();

    return cert;
  }

  /**
   * Get driver training record
   */
  getTrainingRecord(driverId: string): TrainingRecord | null {
    return this.records.get(driverId) || null;
  }

  /**
   * Check if driver certification is valid
   */
  isCertificationValid(certId: string): boolean {
    const cert = this.certifications.get(certId);
    if (!cert || cert.status !== "completed" || !cert.expiryDate) return false;

    return cert.expiryDate > new Date();
  }

  /**
   * Get driver compliance status
   */
  getComplianceStatus(driverId: string): "compliant" | "non_compliant" | "warning" {
    const record = this.records.get(driverId);
    if (!record) return "non_compliant";

    const activeCerts = record.certifications.filter((cert) =>
      this.isCertificationValid(cert.certId)
    );

    if (activeCerts.length === 0) return "non_compliant";
    if (activeCerts.length < record.certifications.length) return "warning";

    return "compliant";
  }
}

export const trainingService = new TrainingService();
