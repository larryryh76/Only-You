import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Message from '@/models/Message';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const otherUserId = searchParams.get('userId');
  const userId1 = searchParams.get('userId1');
  const userId2 = searchParams.get('userId2');

  const isAdmin = session.user.role === 'admin';

  await dbConnect();

  try {
    let query = {};
    if (isAdmin && userId1 && userId2) {
      query = {
        $or: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 },
        ],
      };
    } else if (otherUserId) {
      const currentUserId = session.user.id;
      query = {
        $or: [
          { senderId: currentUserId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: currentUserId },
        ],
      };
    } else {
      return NextResponse.json({ message: 'userId or userId1/userId2 required' }, { status: 400 });
    }

    const messages = await Message.find(query).sort({ createdAt: 1 });
    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const { receiverId, content } = await req.json();
    const senderId = session.user.id;

    await dbConnect();

    const message = await Message.create({
      senderId,
      receiverId,
      content,
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
