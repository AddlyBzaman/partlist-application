// Vercel-compatible real-time service using Node.js runtime
export class VercelRealtimeService {
  private static instance: VercelRealtimeService;
  private connections: Map<string, Set<any>> = new Map();

  static getInstance(): VercelRealtimeService {
    if (!this.instance) {
      this.instance = new VercelRealtimeService();
    }
    return this.instance;
  }

  addConnection(userId: string, response: any) {
    if (!this.connections.has(userId)) {
      this.connections.set(userId, new Set());
    }
    this.connections.get(userId)!.add(response);
    console.log(`Connection added for user ${userId}. Total connections: ${this.connections.size}`);
  }

  removeConnection(userId: string, response: any) {
    const userConnections = this.connections.get(userId);
    if (userConnections) {
      userConnections.delete(response);
      if (userConnections.size === 0) {
        this.connections.delete(userId);
      }
    }
    console.log(`Connection removed for user ${userId}. Total connections: ${this.connections.size}`);
  }

  broadcast(type: string, data: any) {
    const message = JSON.stringify({
      type,
      data,
      timestamp: new Date().toISOString()
    });

    let successCount = 0;
    let errorCount = 0;

    this.connections.forEach((userConnections, userId) => {
      userConnections.forEach((response) => {
        try {
          response.write(`data: ${message}\n\n`);
          successCount++;
        } catch (error) {
          errorCount++;
          // Connection closed, will be cleaned up
          this.removeConnection(userId, response);
        }
      });
    });

    console.log(`Broadcast ${type}: ${successCount} successful, ${errorCount} errors`);
  }

  getConnectionCount(): number {
    return this.connections.size;
  }

  // Get connection stats
  getStats() {
    const stats = {
      totalConnections: this.connections.size,
      userConnections: {} as Record<string, number>
    };

    this.connections.forEach((userConnections, userId) => {
      stats.userConnections[userId] = userConnections.size;
    });

    return stats;
  }
}
