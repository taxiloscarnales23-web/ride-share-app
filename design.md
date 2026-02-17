# RideShare App - Mobile Interface Design

## Overview
A ride-sharing application with separate interfaces for riders and drivers, featuring real-time ride matching, GPS tracking, and cash-only payments. The app follows Apple Human Interface Guidelines (HIG) for iOS-native feel and supports one-handed usage in portrait orientation (9:16).

---

## Screen List

### Rider Interface
1. **Auth Screens**
   - Login/Sign Up
   - Phone Verification
   - Profile Setup

2. **Main Rider Screens**
   - Home (Map with ride request)
   - Ride Details (During active ride)
   - Ride History
   - Profile & Settings
   - Payment Info (Cash confirmation)

3. **Modal/Sheet Screens**
   - Destination Search
   - Ride Confirmation
   - Driver Details
   - Ride Rating & Feedback

### Driver Interface
1. **Auth Screens**
   - Login/Sign Up
   - Phone Verification
   - Vehicle Registration
   - Driver License Verification

2. **Main Driver Screens**
   - Home (Map with available rides)
   - Ride Details (During active ride)
   - Earnings Dashboard
   - Ride History
   - Profile & Settings
   - Vehicle Management

3. **Modal/Sheet Screens**
   - Ride Acceptance
   - Navigation to Pickup
   - Navigation to Destination
   - Earnings Summary

---

## Primary Content and Functionality

### Rider Home Screen
- **Map View**: Full-screen map with current location pinned
- **Ride Request Button**: Large, prominent "Request Ride" button at bottom
- **Quick Info**: Current location address, estimated wait time
- **Active Ride Status**: If a ride is active, shows driver info, ETA, and live tracking
- **Destination Input**: Search bar at top for entering destination
- **Ride History**: Quick access to recent rides (swipe or tap)

### Rider Ride Confirmation Sheet
- **Pickup Location**: Clearly displayed with address
- **Destination**: Clearly displayed with address
- **Estimated Fare**: Estimated cost based on distance (cash payment note)
- **Ride Type**: Standard ride option
- **Confirm Button**: Large primary button to confirm request

### Rider Active Ride Screen
- **Live Map**: Real-time tracking of driver location and route
- **Driver Card**: Driver name, photo, vehicle info, rating
- **ETA**: Time to pickup and time to destination
- **Driver Contact**: Call/message driver button
- **Cancel Ride**: Option to cancel with confirmation

### Rider Payment Screen (Cash)
- **Fare Amount**: Total amount due
- **Payment Method**: "Cash" clearly indicated
- **Instructions**: "Pay driver in cash at destination"
- **Tip Option**: Optional tip amount entry (or skip)
- **Confirm Payment**: Button to complete ride

### Driver Home Screen
- **Map View**: Full-screen map with current location
- **Availability Toggle**: Switch to go online/offline
- **Available Rides**: List of nearby ride requests (cards showing pickup location, destination, estimated distance)
- **Earnings Today**: Quick earnings summary
- **Status Indicator**: Shows if online, offline, or on a ride

### Driver Ride Acceptance Sheet
- **Pickup Location**: Address and map preview
- **Destination**: Address (if available)
- **Passenger Info**: Name, rating, photo
- **Estimated Earnings**: Fare estimate
- **Accept/Decline Buttons**: Large action buttons

### Driver Active Ride Screen
- **Navigation**: Turn-by-turn navigation to pickup, then to destination
- **Passenger Info**: Name, photo, rating
- **Pickup/Dropoff Status**: Current step indicator
- **Contact Passenger**: Call/message button
- **Earnings**: Real-time earnings display

### Driver Earnings Dashboard
- **Today's Earnings**: Total earnings for the day
- **Ride Count**: Number of completed rides
- **Average Rating**: Driver's current rating
- **Weekly/Monthly Stats**: Earnings breakdown by period
- **Ride History**: Detailed list of completed rides with earnings

---

## Key User Flows

### Rider: Requesting a Ride
1. Rider opens app → Home screen (map visible)
2. Rider taps "Request Ride" button
3. Destination search sheet appears → Rider enters destination
4. Ride confirmation sheet shows → Pickup, destination, estimated fare
5. Rider taps "Confirm" → Ride request sent
6. Matching screen shows loading → "Finding driver..."
7. Driver accepted → Driver details card appears with live tracking
8. Driver arrives → Pickup status updates
9. Ride starts → Navigation to destination begins
10. Destination reached → Payment screen (cash amount due)
11. Rider confirms payment → Ride complete, rating screen appears
12. Rider rates driver → Returns to home screen

### Driver: Accepting and Completing a Ride
1. Driver opens app → Home screen (map, online toggle)
2. Driver taps "Go Online" → Becomes available for rides
3. Ride request notification appears → Card with pickup/destination
4. Driver taps "Accept" → Ride accepted, navigation to pickup begins
5. Driver navigates to pickup location (turn-by-turn)
6. Driver arrives at pickup → Status changes to "Arrived at pickup"
7. Passenger gets in → Driver taps "Passenger Boarded"
8. Navigation to destination begins
9. Driver arrives at destination → Status changes to "Arrived at destination"
10. Driver taps "Trip Complete" → Earnings confirmation screen
11. Passenger pays cash → Driver confirms payment received
12. Driver rates passenger → Returns to home screen, ready for next ride

### Payment Flow (Cash)
1. Ride completes → Payment screen appears
2. Screen shows: Total fare amount, "Cash Payment" indicator
3. Rider sees instructions: "Pay driver in cash at destination"
4. Rider confirms payment method → "Cash" locked in
5. Driver sees payment method in app → Knows to collect cash
6. After transaction, both confirm payment received
7. Ride marked as complete

---

## Color Choices

### Brand Colors
- **Primary**: `#0a7ea4` (Teal/Blue) - Action buttons, highlights, active states
- **Secondary**: `#f59e0b` (Amber) - Warnings, driver availability, earnings highlights
- **Success**: `#22c55e` (Green) - Completed rides, successful payments, positive feedback
- **Error**: `#ef4444` (Red) - Cancellations, issues, negative feedback

### Neutral Colors
- **Background**: `#ffffff` (Light) / `#151718` (Dark)
- **Surface**: `#f5f5f5` (Light) / `#1e2022` (Dark) - Cards, sheets
- **Foreground**: `#11181c` (Light) / `#ecedee` (Dark) - Primary text
- **Muted**: `#687076` (Light) / `#9ba1a6` (Dark) - Secondary text
- **Border**: `#e5e7eb` (Light) / `#334155` (Dark) - Dividers, borders

### Semantic Colors
- **Driver Online**: `#22c55e` (Green)
- **Driver Offline**: `#687076` (Gray)
- **Ride Active**: `#0a7ea4` (Blue)
- **Ride Completed**: `#22c55e` (Green)
- **Ride Cancelled**: `#ef4444` (Red)
- **Cash Payment**: `#f59e0b` (Amber)

---

## Layout Principles

### Safe Area & One-Handed Usage
- All interactive elements positioned within thumb reach (bottom 2/3 of screen)
- Primary action buttons at bottom of screen for easy thumb access
- Status information at top, non-critical details in middle
- Minimum touch target: 44×44 pt

### Navigation Structure
- **Tab-based navigation** for main sections (Rider: Home, History, Profile | Driver: Home, Earnings, Profile)
- **Modal sheets** for ride confirmation, payment, and feedback
- **Full-screen modals** for authentication and detailed views
- **Back button** in header for navigation hierarchy

### Map Integration
- Full-screen map as primary view for both rider and driver
- Overlay cards for ride info (non-blocking)
- Pinch-to-zoom enabled
- Current location always visible with blue dot

---

## Interaction Patterns

### Button States
- **Default**: Solid color, full opacity
- **Pressed**: Scale 0.97, slight opacity reduction
- **Disabled**: Reduced opacity (0.5), no interaction
- **Loading**: Spinner overlay, disabled state

### Feedback
- Haptic feedback on button press (light impact)
- Toast notifications for errors and confirmations
- Loading spinners for async operations
- Success checkmark animations on completion

### Gestures
- **Swipe up** on ride cards to see more details
- **Swipe down** on sheets to dismiss
- **Long press** on ride history for options (cancel, report, etc.)
- **Pinch** on map to zoom in/out
- **Tap** on map to set destination (rider)

---

## Accessibility Considerations

- High contrast text (WCAG AA compliant)
- Large touch targets (minimum 44×44 pt)
- VoiceOver support for all interactive elements
- Clear labels for all buttons and inputs
- Dark mode support with proper color contrast
- Text size respects system settings
