import { NextRequest } from 'next/server';
import { VercelRealtimeService } from '@/lib/realtime/vercel-realtime';

// Node.js runtime for compatibility with Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get user ID from query params
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return new Response('User ID required', { status: 400 });
    }

    const realtimeService = VercelRealtimeService.getInstance();

    // Create SSE response optimized for Vercel Edge
    const stream = new ReadableStream({
      start(controller) {
        // Send initial connection message
        const initMessage = JSON.stringify({
          type: 'CONNECTION_ESTABLISHED',
          data: { 
            userId, 
            message: 'Connected to real-time updates',
            platform: 'vercel-edge'
          },
          timestamp: new Date().toISOString()
        });
        controller.enqueue(`data: ${initMessage}\n\n`);

        // Mock response object for compatibility
        const mockResponse = {
          write: (data: string) => {
            try {
              controller.enqueue(data);
            } catch (error) {
              // Connection closed, cleanup will handle
            }
          }
        };
        
        // Add connection
        realtimeService.addConnection(userId, mockResponse);

        // Cleanup on disconnect
        const cleanup = () => {
          realtimeService.removeConnection(userId, mockResponse);
        };

        request.signal.addEventListener('abort', cleanup);

        // Keep connection alive with periodic pings
        const pingInterval = setInterval(() => {
          try {
            const ping = JSON.stringify({
              type: 'PING',
              timestamp: new Date().toISOString()
            });
            controller.enqueue(`data: ${ping}\n\n`);
          } catch (error) {
            clearInterval(pingInterval);
            cleanup();
          }
        }, 25000); // Ping every 25 seconds (Vercel limit is 30s)

        // Cleanup interval on disconnect
        request.signal.addEventListener('abort', () => {
          clearInterval(pingInterval);
        });
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control, Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'X-Accel-Buffering': 'no' // Disable buffering for real-time
      }
    });

  } catch (error) {
    console.error('Error in SSE connection:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
