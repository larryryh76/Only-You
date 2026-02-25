import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    const isConnected = mongoose.connection.readyState === 1;

    return NextResponse.json({
      status: isConnected ? 'healthy' : 'unhealthy',
      database: isConnected ? 'connected' : 'disconnected',
      readyState: mongoose.connection.readyState,
    }, { status: isConnected ? 200 : 503 });
  } catch (error: unknown) {
    return NextResponse.json({
      status: 'unhealthy',
      database: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 503 });
  }
}
