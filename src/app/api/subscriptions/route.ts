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

    const subscription = await Subscription.create({
      userId: (session.user as any).id,
      creatorId,
      paymentMethod,
      paymentProof,
      status: 'pending',
    });

    return NextResponse.json(subscription, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const role = (session.user as any).role;
  const userId = (session.user as any).id;

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
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const role = (session.user as any).role;
  if (role !== 'creator' && role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { subscriptionId, status } = await req.json();
    await dbConnect();

    const updateData: any = { status };
    if (status === 'active') {
      updateData.startDate = new Date();
      updateData.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    }

    const subscription = await Subscription.findByIdAndUpdate(subscriptionId, updateData, { new: true });
    return NextResponse.json(subscription);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
