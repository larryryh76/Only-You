import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
  await dbConnect();
  try {
    const creators = await User.find({ role: 'creator', isVerified: true })
      .select('name username profileImage bio displayFollowerCount');
    return NextResponse.json(creators);
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, email, password, username, bio, displayFollowerCount } = body;

    if (!name || !email || !password || !username) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return NextResponse.json({ message: 'User or username already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const creator = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'creator',
      username,
      bio,
      displayFollowerCount,
      isVerified: true,
    });

    return NextResponse.json({ message: 'Creator created successfully', creatorId: creator._id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
