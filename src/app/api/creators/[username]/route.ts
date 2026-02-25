import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  await dbConnect();

  try {
    const creator = await User.findOne({ username, role: 'creator' })
      .select('name username profileImage coverImage bio displayFollowerCount paymentDetails isVerified subscriptionPrice');

    if (!creator) {
      return NextResponse.json({ message: 'Creator not found' }, { status: 404 });
    }

    return NextResponse.json(creator);
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { username } = await params;
  try {
    const body = await req.json();
    await dbConnect();

    const updatedCreator = await User.findOneAndUpdate(
      { username, role: 'creator' },
      {
        $set: {
          name: body.name,
          bio: body.bio,
          profileImage: body.profileImage,
          coverImage: body.coverImage,
          subscriptionPrice: body.subscriptionPrice,
          isVerified: body.isVerified,
          displayFollowerCount: body.displayFollowerCount,
        }
      },
      { new: true }
    );

    if (!updatedCreator) {
      return NextResponse.json({ message: 'Creator not found' }, { status: 404 });
    }

    return NextResponse.json(updatedCreator);
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
