import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  await dbConnect();

  try {
    const creator = await User.findOne({ username, role: 'creator' })
      .select('name username profileImage bio displayFollowerCount paymentDetails isVerified');

    if (!creator) {
      return NextResponse.json({ message: 'Creator not found' }, { status: 404 });
    }

    return NextResponse.json(creator);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
