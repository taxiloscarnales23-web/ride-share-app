import { describe, it, expect, beforeEach } from 'vitest';
import { ChatService } from '../server/chat-service';
import { SearchFiltersService, SearchFilters, RideOption } from '../server/search-filters';
import { DriverPerformanceService } from '../server/driver-performance';

describe('Chat Service', () => {
  let chatService: ChatService;

  beforeEach(() => {
    chatService = new ChatService();
  });

  it('should create conversation', () => {
    const conv = chatService.getOrCreateConversation(
      'ride_123',
      'driver_1',
      'John Driver',
      'rider_1',
      'Jane Rider'
    );

    expect(conv.rideId).toBe('ride_123');
    expect(conv.driverId).toBe('driver_1');
    expect(conv.riderId).toBe('rider_1');
  });

  it('should send message', () => {
    chatService.getOrCreateConversation('ride_123', 'driver_1', 'John', 'rider_1', 'Jane');
    const msg = chatService.sendMessage('ride_123', 'driver_1', 'driver', 'John', 'I am 5 minutes away');

    expect(msg.message).toBe('I am 5 minutes away');
    expect(msg.senderType).toBe('driver');
  });

  it('should get messages', () => {
    chatService.getOrCreateConversation('ride_123', 'driver_1', 'John', 'rider_1', 'Jane');
    chatService.sendMessage('ride_123', 'driver_1', 'driver', 'John', 'Message 1');
    chatService.sendMessage('ride_123', 'rider_1', 'rider', 'Jane', 'Message 2');

    const messages = chatService.getMessages('ride_123');
    expect(messages.length).toBe(2);
  });

  it('should mark message as read', () => {
    chatService.getOrCreateConversation('ride_123', 'driver_1', 'John', 'rider_1', 'Jane');
    const msg = chatService.sendMessage('ride_123', 'driver_1', 'driver', 'John', 'Test');

    chatService.markAsRead('ride_123', msg.id, 'rider_1');
    const messages = chatService.getMessages('ride_123');
    expect(messages[0].read).toBe(true);
  });

  it('should search messages', () => {
    chatService.getOrCreateConversation('ride_123', 'driver_1', 'John', 'rider_1', 'Jane');
    chatService.sendMessage('ride_123', 'driver_1', 'driver', 'John', 'I am arriving soon');
    chatService.sendMessage('ride_123', 'rider_1', 'rider', 'Jane', 'Thank you');

    const results = chatService.searchMessages('ride_123', 'arriving');
    expect(results.length).toBe(1);
    expect(results[0].message).toContain('arriving');
  });

  it('should delete message', () => {
    chatService.getOrCreateConversation('ride_123', 'driver_1', 'John', 'rider_1', 'Jane');
    const msg = chatService.sendMessage('ride_123', 'driver_1', 'driver', 'John', 'Delete me');

    const deleted = chatService.deleteMessage('ride_123', msg.id, 'driver_1');
    expect(deleted).toBe(true);
    expect(chatService.getMessages('ride_123').length).toBe(0);
  });
});

describe('Search Filters Service', () => {
  let searchService: SearchFiltersService;
  let mockRides: RideOption[];

  beforeEach(() => {
    searchService = new SearchFiltersService();
    mockRides = [
      {
        id: 'ride_1',
        driverId: 'driver_1',
        driverName: 'John',
        driverRating: 4.8,
        vehicleType: 'sedan',
        rideType: 'economy',
        estimatedFare: 15,
        estimatedTime: 10,
        distance: 5,
        accessibility: { wheelchairAccessible: false, petFriendly: false, wifiAvailable: false },
        driverPreferences: {}
      },
      {
        id: 'ride_2',
        driverId: 'driver_2',
        driverName: 'Jane',
        driverRating: 4.5,
        vehicleType: 'suv',
        rideType: 'comfort',
        estimatedFare: 25,
        estimatedTime: 12,
        distance: 8,
        accessibility: { wheelchairAccessible: true, petFriendly: true, wifiAvailable: true },
        driverPreferences: {}
      }
    ];
  });

  it('should filter by price range', () => {
    const filters: SearchFilters = {
      priceRange: { min: 10, max: 20 }
    };

    const result = searchService.applyFilters(mockRides, filters);
    expect(result.length).toBe(1);
    expect(result[0].estimatedFare).toBe(15);
  });

  it('should filter by ride type', () => {
    const filters: SearchFilters = {
      rideType: 'comfort'
    };

    const result = searchService.applyFilters(mockRides, filters);
    expect(result.length).toBe(1);
    expect(result[0].rideType).toBe('comfort');
  });

  it('should filter by accessibility', () => {
    const filters: SearchFilters = {
      accessibility: {
        wheelchairAccessible: true,
        petFriendly: false,
        wifiAvailable: false
      }
    };

    const result = searchService.applyFilters(mockRides, filters);
    expect(result.length).toBe(1);
    expect(result[0].accessibility.wheelchairAccessible).toBe(true);
  });

  it('should sort by price', () => {
    const result = searchService.sortRides(mockRides, 'price');
    expect(result[0].estimatedFare).toBe(15);
    expect(result[1].estimatedFare).toBe(25);
  });

  it('should sort by rating', () => {
    const result = searchService.sortRides(mockRides, 'rating');
    expect(result[0].driverRating).toBe(4.8);
    expect(result[1].driverRating).toBe(4.5);
  });

  it('should calculate match score', () => {
    const filters: SearchFilters = {
      rideType: 'economy',
      priceRange: { min: 10, max: 20 }
    };

    const score = searchService.calculateMatchScore(mockRides[0], filters);
    expect(score).toBe(100); // Perfect match
  });

  it('should get available filter options', () => {
    const options = searchService.getAvailableFilterOptions();
    expect(options.rideTypes).toContain('economy');
    expect(options.vehicleTypes).toContain('sedan');
    expect(options.languages).toContain('English');
  });
});

describe('Driver Performance Service', () => {
  let performanceService: DriverPerformanceService;

  beforeEach(() => {
    performanceService = new DriverPerformanceService();
  });

  it('should initialize metrics', () => {
    const metrics = performanceService.initializeMetrics('driver_1');
    expect(metrics.driverId).toBe('driver_1');
    expect(metrics.totalRides).toBe(0);
    expect(metrics.averageRating).toBe(5.0);
  });

  it('should update metrics after ride', () => {
    performanceService.initializeMetrics('driver_1');
    performanceService.updateMetricsAfterRide('driver_1', 4.5, 20, true, true);

    const metrics = performanceService.getMetrics('driver_1');
    expect(metrics!.totalRides).toBe(1);
    expect(metrics!.totalEarnings).toBe(20);
  });

  it('should calculate performance rating', () => {
    performanceService.initializeMetrics('driver_1');
    performanceService.updateMetricsAfterRide('driver_1', 4.8, 20, true, true);

    const rating = performanceService.getPerformanceRating('driver_1');
    expect(rating).toBeGreaterThan(3);
    expect(rating).toBeLessThanOrEqual(5);
  });

  it('should assign performance badge', () => {
    performanceService.initializeMetrics('driver_1');
    // Complete multiple rides to build up rating
    for (let i = 0; i < 5; i++) {
      performanceService.updateMetricsAfterRide('driver_1', 4.9, 20, true, true);
    }

    const badge = performanceService.getPerformanceBadge('driver_1');
    expect(['Platinum', 'Gold', 'Silver', 'Bronze', 'Standard']).toContain(badge);
  });

  it('should set and track goals', () => {
    performanceService.initializeMetrics('driver_1');
    const deadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    performanceService.setGoal('driver_1', 'totalRides', 100, deadline);

    const goals = performanceService.getGoals('driver_1');
    expect(goals.length).toBe(1);
    expect(goals[0].targetValue).toBe(100);
  });

  it('should get earnings breakdown', () => {
    performanceService.initializeMetrics('driver_1');
    performanceService.updateMetricsAfterRide('driver_1', 4.5, 20, true, true);
    performanceService.updateMetricsAfterRide('driver_1', 4.8, 25, true, true);

    const breakdown = performanceService.getEarningsBreakdown('driver_1');
    expect(breakdown.totalEarnings).toBe(45);
    expect(breakdown.averagePerRide).toBe(22.5);
  });

  it('should get performance summary', () => {
    performanceService.initializeMetrics('driver_1');
    performanceService.updateMetricsAfterRide('driver_1', 4.8, 20, true, true);

    const summary = performanceService.getPerformanceSummary('driver_1');
    expect(summary.totalRides).toBe(1);
    expect(summary.totalEarnings).toBe(20);
    expect(summary.badge).toBeDefined();
  });

  it('should generate recommendations', () => {
    performanceService.initializeMetrics('driver_1');
    // Simulate poor performance
    const metrics = performanceService.getMetrics('driver_1')!;
    metrics.averageRating = 3.5;
    metrics.completionRate = 85;

    const summary = performanceService.getPerformanceSummary('driver_1');
    expect(summary.recommendations.length).toBeGreaterThan(0);
  });
});
