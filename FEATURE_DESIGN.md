# Feature Design: Ratings, Tracking & Disputes

## 1. Driver Rating & Review System

### Database Schema
- **driverRatings table**: Store individual ratings from riders
  - id (PK)
  - rideId (FK to rides)
  - riderId (FK to riders)
  - driverId (FK to drivers)
  - overallRating (1-5 stars)
  - cleanliness (1-5)
  - safety (1-5)
  - communication (1-5)
  - review (text)
  - createdAt

### Features
- Riders can rate drivers 1-5 stars after ride completion
- Specific rating categories: cleanliness, safety, communication
- Optional written review
- Driver profile shows average rating and review count
- Riders can view all reviews for a driver before accepting ride
- Driver can respond to reviews (optional)

### UI Components
- Rating modal after ride completion (stars + categories)
- Driver profile card showing average rating and review count
- Driver details screen with full review list
- Review cards showing rider name, rating, review text, date

---

## 2. Vehicle Tracking with Real-time Location Display

### Database Schema
- **rideLocations table**: Track location history during active rides
  - id (PK)
  - rideId (FK to rides)
  - driverId (FK to drivers)
  - latitude (varchar)
  - longitude (varchar)
  - timestamp
  - accuracy (optional)

### Features
- Display driver's real-time location on rider's screen during active ride
- Show estimated arrival time based on current location
- Display route progress (distance remaining, time remaining)
- Update location every 5-10 seconds via WebSocket
- Show driver's vehicle info (make, model, color, license plate)
- Display driver's current speed (optional)

### UI Components
- Active ride screen with driver location marker
- Location update indicator (live/last updated time)
- Route progress bar showing distance/time remaining
- Driver vehicle card with live location badge
- Location history after ride completion

---

## 3. Dispute Resolution System

### Database Schema
- **disputes table**: Main dispute/ticket records
  - id (PK)
  - rideId (FK to rides)
  - riderId (FK to riders)
  - driverId (FK to drivers)
  - issueType (wrong_fare, unsafe_behavior, lost_item, vehicle_issue, other)
  - title (string)
  - description (text)
  - status (open, in_review, resolved, closed)
  - severity (low, medium, high)
  - createdAt
  - resolvedAt

- **disputeEvidence table**: Evidence/attachments for disputes
  - id (PK)
  - disputeId (FK to disputes)
  - evidenceType (photo, video, audio, document)
  - fileUrl (S3 URL)
  - uploadedAt

- **disputeResolutions table**: Resolution outcomes
  - id (PK)
  - disputeId (FK to disputes)
  - resolutionType (refund, credit, compensation, no_action)
  - amount (varchar)
  - reason (text)
  - resolvedBy (admin_id)
  - createdAt

### Features
- Riders/drivers can create dispute tickets for issues
- Issue categories: wrong fare, unsafe behavior, lost item, vehicle issue, other
- Upload evidence (photos, videos, documents)
- Real-time status tracking (open → in_review → resolved → closed)
- Admin review and resolution with automated compensation
- Refund/credit system for fare disputes
- Notification to both parties on status changes
- Dispute history for riders and drivers

### UI Components
- Dispute creation form with issue type, description, evidence upload
- Dispute list screen showing all open/resolved disputes
- Dispute detail screen with full history and resolution
- Evidence gallery for viewing uploaded files
- Resolution notification with compensation details
- Admin dashboard for dispute management

---

## Implementation Order
1. Add database tables for ratings, locations, and disputes
2. Implement Driver Rating service and API endpoints
3. Implement Vehicle Tracking service and WebSocket updates
4. Implement Dispute Resolution service and API endpoints
5. Create UI screens for all three features
6. Write comprehensive tests
7. Integration testing and bug fixes
