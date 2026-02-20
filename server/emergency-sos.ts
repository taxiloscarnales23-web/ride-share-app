/**
 * Emergency SOS Service
 * Handles emergency alerts and safety features
 */

export interface EmergencyContact {
  id: string;
  userId: string;
  name: string;
  phone: string;
  relationship: string;
  priority: 'primary' | 'secondary' | 'tertiary';
  createdAt: Date;
}

export interface SOSAlert {
  id: string;
  userId: string;
  rideId: string;
  location: { latitude: number; longitude: number };
  timestamp: Date;
  status: 'active' | 'resolved' | 'false_alarm';
  alertType: 'emergency' | 'unsafe_driver' | 'accident' | 'harassment' | 'other';
  description?: string;
  contactsNotified: string[];
  emergencyServicesContacted: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export class EmergencySosService {
  private emergencyContacts: Map<string, EmergencyContact[]> = new Map();
  private sosAlerts: Map<string, SOSAlert> = new Map();
  private activeAlerts: Set<string> = new Set();
  private sosSubscribers: Set<Function> = new Set();

  /**
   * Add emergency contact
   */
  addEmergencyContact(
    userId: string,
    name: string,
    phone: string,
    relationship: string,
    priority: 'primary' | 'secondary' | 'tertiary' = 'secondary'
  ): EmergencyContact {
    const contact: EmergencyContact = {
      id: `contact_${Date.now()}_${Math.random()}`,
      userId,
      name,
      phone,
      relationship,
      priority,
      createdAt: new Date()
    };

    const contacts = this.emergencyContacts.get(userId) || [];
    contacts.push(contact);
    this.emergencyContacts.set(userId, contacts);

    return contact;
  }

  /**
   * Get emergency contacts
   */
  getEmergencyContacts(userId: string): EmergencyContact[] {
    const contacts = this.emergencyContacts.get(userId) || [];
    return contacts.sort((a, b) => {
      const priorityOrder = { primary: 0, secondary: 1, tertiary: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Update emergency contact
   */
  updateEmergencyContact(
    userId: string,
    contactId: string,
    updates: Partial<EmergencyContact>
  ): EmergencyContact | null {
    const contacts = this.emergencyContacts.get(userId);
    if (!contacts) return null;

    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return null;

    Object.assign(contact, updates);
    return contact;
  }

  /**
   * Delete emergency contact
   */
  deleteEmergencyContact(userId: string, contactId: string): boolean {
    const contacts = this.emergencyContacts.get(userId);
    if (!contacts) return false;

    const index = contacts.findIndex(c => c.id === contactId);
    if (index === -1) return false;

    contacts.splice(index, 1);
    return true;
  }

  /**
   * Trigger SOS alert
   */
  triggerSOSAlert(
    userId: string,
    rideId: string,
    location: { latitude: number; longitude: number },
    alertType: 'emergency' | 'unsafe_driver' | 'accident' | 'harassment' | 'other',
    description?: string
  ): SOSAlert {
    const alert: SOSAlert = {
      id: `sos_${Date.now()}_${Math.random()}`,
      userId,
      rideId,
      location,
      timestamp: new Date(),
      status: 'active',
      alertType,
      description,
      contactsNotified: [],
      emergencyServicesContacted: false
    };

    this.sosAlerts.set(alert.id, alert);
    this.activeAlerts.add(alert.id);

    // Notify emergency contacts
    this.notifyEmergencyContacts(userId, alert);

    // Notify subscribers
    this.notifySOSSubscribers(alert);

    return alert;
  }

  /**
   * Notify emergency contacts
   */
  private notifyEmergencyContacts(userId: string, alert: SOSAlert): void {
    const contacts = this.getEmergencyContacts(userId);

    contacts.forEach(contact => {
      // In real implementation, send SMS/call
      console.log(`[SOS] Notifying ${contact.name} at ${contact.phone}`);
      console.log(`[SOS] Alert: ${alert.alertType} - Location: ${alert.location.latitude}, ${alert.location.longitude}`);
      alert.contactsNotified.push(contact.id);
    });
  }

  /**
   * Contact emergency services
   */
  contactEmergencyServices(alertId: string, emergencyType: string): boolean {
    const alert = this.sosAlerts.get(alertId);
    if (!alert) return false;

    // In real implementation, contact 911/emergency services
    console.log(`[EMERGENCY] Contacting emergency services for ${emergencyType}`);
    console.log(`[EMERGENCY] Location: ${alert.location.latitude}, ${alert.location.longitude}`);
    console.log(`[EMERGENCY] Ride ID: ${alert.rideId}`);

    alert.emergencyServicesContacted = true;

    return true;
  }

  /**
   * Resolve SOS alert
   */
  resolveSOSAlert(alertId: string, resolvedBy: string): SOSAlert | null {
    const alert = this.sosAlerts.get(alertId);
    if (!alert) return null;

    alert.status = 'resolved';
    alert.resolvedAt = new Date();
    alert.resolvedBy = resolvedBy;
    this.activeAlerts.delete(alertId);

    return alert;
  }

  /**
   * Mark as false alarm
   */
  markAsFalseAlarm(alertId: string): SOSAlert | null {
    const alert = this.sosAlerts.get(alertId);
    if (!alert) return null;

    alert.status = 'false_alarm';
    alert.resolvedAt = new Date();
    this.activeAlerts.delete(alertId);

    return alert;
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): SOSAlert[] {
    const alerts: SOSAlert[] = [];
    this.activeAlerts.forEach(alertId => {
      const alert = this.sosAlerts.get(alertId);
      if (alert) alerts.push(alert);
    });
    return alerts;
  }

  /**
   * Get user's SOS history
   */
  getUserSOSHistory(userId: string): SOSAlert[] {
    return Array.from(this.sosAlerts.values())
      .filter(alert => alert.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get SOS alert details
   */
  getSOSAlert(alertId: string): SOSAlert | null {
    return this.sosAlerts.get(alertId) || null;
  }

  /**
   * Subscribe to SOS alerts
   */
  subscribeToSOSAlerts(callback: (alert: SOSAlert) => void): () => void {
    this.sosSubscribers.add(callback);

    return () => {
      this.sosSubscribers.delete(callback);
    };
  }

  /**
   * Notify SOS subscribers
   */
  private notifySOSSubscribers(alert: SOSAlert): void {
    this.sosSubscribers.forEach(callback => callback(alert));
  }

  /**
   * Share location with emergency contact
   */
  shareLocationWithContact(userId: string, contactId: string, location: { latitude: number; longitude: number }): boolean {
    const contacts = this.emergencyContacts.get(userId);
    if (!contacts) return false;

    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return false;

    // In real implementation, send location link via SMS
    console.log(`[LOCATION SHARE] Sharing location with ${contact.name}`);
    console.log(`[LOCATION SHARE] Coordinates: ${location.latitude}, ${location.longitude}`);

    return true;
  }

  /**
   * Get safety statistics
   */
  getSafetyStats(): {
    totalAlerts: number;
    activeAlerts: number;
    resolvedAlerts: number;
    falseAlarms: number;
    alertsByType: Record<string, number>;
  } {
    const alerts = Array.from(this.sosAlerts.values());

    const alertsByType: Record<string, number> = {
      emergency: 0,
      unsafe_driver: 0,
      accident: 0,
      harassment: 0,
      other: 0
    };

    alerts.forEach(alert => {
      alertsByType[alert.alertType]++;
    });

    return {
      totalAlerts: alerts.length,
      activeAlerts: this.activeAlerts.size,
      resolvedAlerts: alerts.filter(a => a.status === 'resolved').length,
      falseAlarms: alerts.filter(a => a.status === 'false_alarm').length,
      alertsByType
    };
  }

  /**
   * Enable ride sharing with trusted contact
   */
  enableRideSharing(userId: string, contactId: string, rideId: string): boolean {
    const contacts = this.emergencyContacts.get(userId);
    if (!contacts) return false;

    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return false;

    // In real implementation, send ride details and real-time location
    console.log(`[RIDE SHARING] Sharing ride ${rideId} with ${contact.name}`);
    console.log(`[RIDE SHARING] Contact will receive real-time location updates`);

    return true;
  }
}

export const emergencySosService = new EmergencySosService();
