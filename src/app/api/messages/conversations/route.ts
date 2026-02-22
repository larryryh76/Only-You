import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Message from '@/models/Message';
import User from '@/models/User';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const currentUserId = session.user.id;
  const isAdmin = session.user.role === 'admin';

  await dbConnect();

  try {
    if (isAdmin) {
      // Admin sees all messages grouped by unique pairs
      const allMessages = await Message.find().sort({ createdAt: -1 });
      const pairs = new Map();

      allMessages.forEach(msg => {
        const ids = [msg.senderId.toString(), msg.receiverId.toString()].sort();
        const key = ids.join('-');
        if (!pairs.has(key)) {
          pairs.set(key, msg);
        }
      });

      const conversationList = await Promise.all(Array.from(pairs.entries()).map(async ([key, lastMsg]) => {
        const [id1, id2] = key.split('-');
        const users = await User.find({ _id: { $in: [id1, id2] } }).select('name username role');
        return {
          users,
          lastMessage: lastMsg,
        };
      }));

      return NextResponse.json(conversationList);
    }

    // Regular user sees their own conversations
    const messages = await Message.find({
      $or: [{ senderId: currentUserId }, { receiverId: currentUserId }],
    }).sort({ createdAt: -1 });

    const contactIds = new Set<string>();
    messages.forEach((msg) => {
      if (msg.senderId.toString() !== currentUserId) contactIds.add(msg.senderId.toString());
      if (msg.receiverId.toString() !== currentUserId) contactIds.add(msg.receiverId.toString());
    });

    const contacts = await User.find({ _id: { $in: Array.from(contactIds) } })
      .select('name username profileImage role');

    const conversations = contacts.map(contact => {
      const lastMsg = messages.find(m =>
        m.senderId.toString() === contact._id.toString() ||
        m.receiverId.toString() === contact._id.toString()
      );
      return {
        user: contact,
        lastMessage: lastMsg,
      };
    });

    return NextResponse.json(conversations);
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
