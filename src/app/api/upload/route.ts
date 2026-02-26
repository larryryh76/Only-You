import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ message: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // In a real app, we would upload to S3 or Vercel Blob.
    // For this sandbox, we'll return a Base64 string as the "URL".
    // Or we could save it to public/uploads/ if we had a persistent volume.
    // Since Next.js dev server might not pick up new files in public/ during runtime,
    // Base64 is safer for immediate display in this environment.

    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

    return NextResponse.json({ url: base64 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
