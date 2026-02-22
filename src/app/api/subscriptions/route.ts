import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Subscription from '@/models/Subscription';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const { creatorId, paymentMethod, paymentProof } = await req.json();
    await dbConnect();

    const existingPending = await Subscription.findOne({
      userId: session.user.id,
      creatorId,
      status: 'pending'
    });

    if (existingPending) {
      return NextResponse.json({ message: 'You already have a pending subscription request' }, { status: 400 });
    }

    const subscription = await Subscription.create({
      userId: session.user.id,
      creatorId,
      paymentMethod,
      paymentProof,
      status: 'pending',
    });

    return NextResponse.json(subscription, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const role = session.user.role;
  const userId = session.user.id;

  await dbConnect();

  try {
    let query = {};
    if (role === 'creator') {
      query = { creatorId: userId };
    } else if (role === 'admin') {
      query = {};
    } else {
      query = { userId };
    }

    const subscriptions = await Subscription.find(query)
      .populate('userId', 'name email')
      .populate('creatorId', 'name username');

    return NextResponse.json(subscriptions);
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const role = session.user.role;
  if (role !== 'creator' && role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { subscriptionId, status } = await req.json();
    await dbConnect();

    const updateData: { status: string; startDate?: Date; endDate?: Date } = { status };
    if (status === 'active') {
      updateData.startDate = new Date();
      updateData.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    }

    const subscription = await Subscription.findByIdAndUpdate(subscriptionId, updateData, { new: true });
    return NextResponse.json(subscription);
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
