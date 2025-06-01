import {
  WebSocketGateway as NestWebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@NestWebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'], // Support both WebSocket and polling for mobile
  pingTimeout: 60000, // Increased timeout for mobile connections
  pingInterval: 25000, // More frequent pings for mobile
})
export class AppWebSocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(AppWebSocketGateway.name);
  private connectedClients: Map<
    string,
    { socket: Socket; platform: 'mobile' | 'web' }
  > = new Map();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      const platform = (client.handshake.auth.platform as 'mobile' | 'web') || 'web';

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      client.data.userId = payload.sub;
      client.data.platform = platform;
      this.connectedClients.set(payload.sub, { socket: client, platform });

      this.logger.log(`Client connected: ${payload.sub} (${platform})`);

      // Send initial connection success
      client.emit('connection_success', {
        userId: payload.sub,
        platform,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    if (client.data.userId) {
      this.connectedClients.delete(client.data.userId);
      this.logger.log(
        `Client disconnected: ${client.data.userId} (${client.data.platform})`,
      );
    }
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, room: string) {
    client.join(room);
    this.logger.log(`Client ${client.data.userId} joined room: ${room}`);
    return { event: 'joinRoom', data: { room } };
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(client: Socket, room: string) {
    client.leave(room);
    this.logger.log(`Client ${client.data.userId} left room: ${room}`);
    return { event: 'leaveRoom', data: { room } };
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: { room: string; message: string }) {
    const messageData = {
      userId: client.data.userId,
      message: payload.message,
      timestamp: new Date(),
      platform: client.data.platform,
    };

    this.server.to(payload.room).emit('message', messageData);
    return { event: 'message', data: { room: payload.room } };
  }

  // Platform-specific notification methods
  sendNotification(
    userId: string,
    title: string,
    message: string,
    platform: 'mobile' | 'web' = 'mobile',
    type?: string,
    data?: Record<string, any>,
  ) {
    const client = this.connectedClients.get(userId);
    if (client && (!platform || client.platform === platform)) {
      client.socket.emit('notification', {
        title,
        message,
        platform: client.platform,
        timestamp: new Date(),
        type,
        data,
      });
    }
  }

  // Send to all platforms
  sendNotificationToAllPlatforms(
    userId: string,
    notification: {
      title: string;
      message: string;
      type?: string;
      data?: Record<string, any>;
    },
  ) {
    const client = this.connectedClients.get(userId);
    if (client) {
      client.socket.emit('notification', {
        ...notification,
        platform: client.platform,
        timestamp: new Date(),
      });
    }
  }

  broadcastToRoom(
    room: string,
    event: string,
    data: any,
    platform?: 'mobile' | 'web',
  ) {
    const roomData = this.server.sockets.adapter.rooms.get(room);
    if (roomData) {
      roomData.forEach((socketId) => {
        const socket = this.server.sockets.sockets.get(socketId);
        if (socket && (!platform || socket.data.platform === platform)) {
          socket.emit(event, {
            ...data,
            platform: socket.data.platform,
            timestamp: new Date(),
          });
        }
      });
    }
  }

  broadcastToAll(event: string, data: any, platform?: 'mobile' | 'web') {
    this.server.emit(event, {
      ...data,
      timestamp: new Date(),
      platform,
    });
  }

  // Mobile-specific methods
  sendMobilePushNotification(
    userId: string,
    notification: {
      title: string;
      message: string;
      type?: string;
      data?: Record<string, any>;
    },
  ) {
    this.sendNotification(
      userId,
      notification.title,
      notification.message,
      'mobile',
      notification.type,
      notification.data,
    );
  }

  // Web-specific methods
  sendWebNotification(
    userId: string,
    notification: {
      title: string;
      message: string;
      type?: string;
      data?: Record<string, any>;
    },
  ) {
    this.sendNotification(
      userId,
      notification.title,
      notification.message,
      'web',
      notification.type,
      notification.data,
    );
  }

  // Place-related events
  notifyNewPlace(place: any) {
    this.server.emit('newPlace', place);
  }
  notifyActivity(activity: any) {
    this.server.emit('activity', activity);
  }
  notifyPayment(payment: any) {
    this.server.emit('payment', payment);
  }
  notifyPlaceUpdate(place: any) {
    this.server.emit('placeUpdate', place);
  }
  notifyPlaceDelete(placeId: string) {
    this.server.emit('placeDelete', placeId);
  }
}
