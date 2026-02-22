import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Post from '@/models/Post';
import Subscription from '@/models/Subscription';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const creatorId = searchParams.get('creatorId');

  if (!creatorId) return NextResponse.json({ message: 'creatorId required' }, { status: 400 });

  await dbConnect();

  try {
    let isSubscribed = false;
    if (session) {
      const subscription = await Subscription.findOne({
        userId: (session.user as any).id,
        creatorId,
        status: 'active',
      });
      isSubscribed = !!subscription || (session.user as any).id === creatorId || (session.user as any).role === 'admin';
    }

    const posts = await Post.find({ creatorId }).sort({ createdAt: -1 });

    const filteredPosts = posts.map(post => {
      if (post.isPremium && !isSubscribed) {
        return {
          ...post.toObject(),
          content: 'Content hidden. Subscribe to view.',
          mediaUrl: null,
          isLocked: true,
        };
      }
      return { ...post.toObject(), isLocked: false };
    });

    return NextResponse.json(filteredPosts);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'creator') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { content, mediaUrl, isPremium } = await req.json();
    const creatorId = (session.user as any).id;

    await dbConnect();

    const post = await Post.create({
      creatorId,
      content,
      mediaUrl,
      isPremium: isPremium ?? true,
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
