import { NextRequest } from 'next/server';
import { NotificationService } from '@/lib/realtime/notificationService';

// Edge runtime config for Vercel
export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    // Get user ID from query params (temporary solution for demo)
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return new Response('User ID required', { status: 400 });
    }

    const notificationService = NotificationService.getInstance();

    // Create SSE response with Vercel optimizations
    const response = new Response(
      new ReadableStream({
        start(controller) {
          // Send initial connection message
          const initMessage = JSON.stringify({
            type: 'CONNECTION_ESTABLISHED',
            data: { userId, message: 'Connected to real-time updates' },
            timestamp: new Date().toISOString()
          });
          controller.enqueue(`data: ${initMessage}\n\n`);

          // Store connection
          const mockResponse = {
            write: (data: string) => {
              try {
                controller.enqueue(data);
              } catch (error) {
                // Connection closed
              }
            }
          };
          
          notificationService.addConnection(userId, mockResponse);

          // Cleanup on disconnect
          request.signal.addEventListener('abort', () => {
            notificationService.removeConnection(userId, mockResponse);
          });

          // Keep connection alive (Vercel optimization)
          const keepAlive = setInterval(() => {
            try {
              const ping = JSON.stringify({
                type: 'PING',
                timestamp: new Date().toISOString()
              });
              controller.enqueue(`data: ${ping}\n\n`);
            } catch (error) {
              clearInterval(keepAlive);
            }
          }, 30000); // Ping every 30 seconds
        }
      }),
      {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Cache-Control',
          'Access-Control-Allow-Methods': 'GET, OPTIONS'
        }
      }
    );

    return response;

  } catch (error) {
    console.error('Error in SSE connection:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
