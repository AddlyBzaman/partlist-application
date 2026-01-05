export interface ClientConnection {
  userId: string;
  response: any; // NextResponse for SSE
}

export class NotificationService {
  private static instance: NotificationService;
  private connections: Map<string, Set<any>> = new Map();

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  addConnection(userId: string, response: any) {
    if (!this.connections.has(userId)) {
      this.connections.set(userId, new Set());
    }
    this.connections.get(userId)!.add(response);
  }

  removeConnection(userId: string, response: any) {
    const userConnections = this.connections.get(userId);
    if (userConnections) {
      userConnections.delete(response);
      if (userConnections.size === 0) {
        this.connections.delete(userId);
      }
    }
  }

  broadcast(type: string, data: any, targetUserId?: string) {
    const message = JSON.stringify({ type, data, timestamp: new Date().toISOString() });

    if (targetUserId) {
      // Send to specific user
      const userConnections = this.connections.get(targetUserId);
      if (userConnections) {
        userConnections.forEach(response => {
          try {
            response.write(`data: ${message}\n\n`);
          } catch (error) {
            this.removeConnection(targetUserId, response);
          }
        });
      }
    } else {
      // Broadcast to all users
      this.connections.forEach((userConnections, userId) => {
        userConnections.forEach(response => {
          try {
            response.write(`data: ${message}\n\n`);
          } catch (error) {
            this.removeConnection(userId, response);
          }
        });
      });
    }
  }

  notifyPartListSaved(data: any) {
    this.broadcast('PART_LIST_SAVED', data);
  }

  notifyPartListUpdated(data: any) {
    this.broadcast('PART_LIST_UPDATED', data);
  }

  notifyPartListDeleted(data: any) {
    this.broadcast('PART_LIST_DELETED', data);
  }

  getActiveUsers(): string[] {
    return Array.from(this.connections.keys());
  }

  getConnectionCount(): number {
    let total = 0;
    this.connections.forEach(connections => {
      total += connections.size;
    });
    return total;
  }
}
