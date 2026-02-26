import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'creator') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  const creator = await User.findById(session.user.id);
  return NextResponse.json(creator);
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'creator') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();
    await dbConnect();

    const updatedCreator = await User.findByIdAndUpdate(
      session.user.id,
      {
        name: data.name,
        bio: data.bio,
        location: data.location,
        website: data.website,
        profileImage: data.profileImage,
        coverImage: data.coverImage,
        subscriptionPrice: data.subscriptionPrice,
        paymentDetails: data.paymentDetails
      },
      { new: true }
    );

    return NextResponse.json(updatedCreator);
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
