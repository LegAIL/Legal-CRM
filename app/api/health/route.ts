
import { NextResponse } from 'next/server';

// Health check endpoint for Google App Engine
export async function GET() {
  try {
    // Basic health check - can be extended to check database connectivity
    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0'
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: 'Health check failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Also handle HEAD requests for health checks
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
