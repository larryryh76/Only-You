import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'creator') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  const creator = await User.findById((session.user as any).id);
  return NextResponse.json(creator);
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'creator') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();
    await dbConnect();

    const updatedCreator = await User.findByIdAndUpdate(
      (session.user as any).id,
      {
        bio: data.bio,
        profileImage: data.profileImage,
        paymentDetails: data.paymentDetails
      },
      { new: true }
    );

    return NextResponse.json(updatedCreator);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
