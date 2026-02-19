import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";

export interface RideUpdate {
  type: "driver_location" | "ride_status" | "driver_arriving" | "ride_completed";
  rideId: number;
  data: Record<string, any>;
}

export class RideShareWebSocket {
  private io: SocketIOServer;
  private driverRooms: Map<number, string> = new Map(); // driverId -> socketId
  private riderRooms: Map<number, string> = new Map(); // riderId -> socketId

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on("connection", (socket: Socket) => {
      console.log(`[WebSocket] Client connected: ${socket.id}`);

      // Driver joins ride
      socket.on("driver:join_ride", (data: { driverId: number; rideId: number }) => {
        const roomName = `ride:${data.rideId}`;
        socket.join(roomName);
        this.driverRooms.set(data.driverId, socket.id);
        console.log(`[WebSocket] Driver ${data.driverId} joined ride ${data.rideId}`);

        // Notify rider that driver accepted
        this.io.to(roomName).emit("ride:driver_accepted", {
          driverId: data.driverId,
          timestamp: new Date(),
        });
      });

      // Rider joins ride
      socket.on("rider:join_ride", (data: { riderId: number; rideId: number }) => {
        const roomName = `ride:${data.rideId}`;
        socket.join(roomName);
        this.riderRooms.set(data.riderId, socket.id);
        console.log(`[WebSocket] Rider ${data.riderId} joined ride ${data.rideId}`);
      });

      // Driver sends location update
      socket.on("driver:update_location", (data: { rideId: number; latitude: number; longitude: number }) => {
        const roomName = `ride:${data.rideId}`;
        this.io.to(roomName).emit("ride:driver_location", {
          latitude: data.latitude,
          longitude: data.longitude,
          timestamp: new Date(),
        });
      });

      // Driver arriving at pickup
      socket.on("driver:arriving", (data: { rideId: number; eta: number }) => {
        const roomName = `ride:${data.rideId}`;
        this.io.to(roomName).emit("ride:driver_arriving", {
          eta: data.eta,
          timestamp: new Date(),
        });
      });

      // Ride status update
      socket.on("ride:update_status", (data: { rideId: number; status: string }) => {
        const roomName = `ride:${data.rideId}`;
        this.io.to(roomName).emit("ride:status_changed", {
          status: data.status,
          timestamp: new Date(),
        });
      });

      // Disconnect handler
      socket.on("disconnect", () => {
        console.log(`[WebSocket] Client disconnected: ${socket.id}`);
        // Clean up driver/rider mappings
        for (const [driverId, socketId] of this.driverRooms.entries()) {
          if (socketId === socket.id) {
            this.driverRooms.delete(driverId);
          }
        }
        for (const [riderId, socketId] of this.riderRooms.entries()) {
          if (socketId === socket.id) {
            this.riderRooms.delete(riderId);
          }
        }
      });
    });
  }

  public broadcastRideUpdate(update: RideUpdate) {
    const roomName = `ride:${update.rideId}`;
    this.io.to(roomName).emit(`ride:${update.type}`, update.data);
  }

  public notifyDriver(driverId: number, event: string, data: any) {
    const socketId = this.driverRooms.get(driverId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  public notifyRider(riderId: number, event: string, data: any) {
    const socketId = this.riderRooms.get(riderId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  public getIO(): SocketIOServer {
    return this.io;
  }
}
