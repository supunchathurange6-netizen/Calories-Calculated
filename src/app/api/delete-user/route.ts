import { NextRequest, NextResponse } from 'next/server';
import { deleteUser } from '@/ai/flows/delete-user-flow';

export async function POST(req: NextRequest) {
  try {
    const { uid } = await req.json();

    if (!uid || typeof uid !== 'string') {
      return NextResponse.json({ message: 'User ID is required and must be a string' }, { status: 400 });
    }

    const result = await deleteUser({ uid });

    if (result.success) {
      return NextResponse.json({ message: result.message }, { status: 200 });
    } else {
      // Provide a more specific status code if possible
      if (result.message.includes('not found')) {
        return NextResponse.json({ message: result.message }, { status: 404 });
      }
      return NextResponse.json({ message: result.message }, { status: 500 });
    }
  } catch (error: any) {
    console.error('API Error deleting user:', error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
