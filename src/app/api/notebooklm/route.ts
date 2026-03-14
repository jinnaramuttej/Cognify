import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { userId, noteId, noteTitle, noteContent } = await req.json();

    if (!userId || !noteId || !noteTitle || !noteContent) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if note exists
    const { data: existingNote } = await supabase
      .from('Note')
      .select('id')
      .eq('id', noteId)
      .single();

    if (existingNote) {
      return NextResponse.json({ error: 'Note already exists' }, { status: 409 });
    }

    // Map to Supabase structure
    const { data: note, error } = await supabase
      .from('Note')
      .insert({
        id: noteId,
        userId,
        title: noteTitle,
        content: noteContent,
        plainText: false
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      message: 'Note created successfully',
      data: note
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  const { data: notes, error } = await supabase
    .from('Note')
    .select('*, flashcards:Flashcard(*)')
    .eq('userId', userId)
    .order('createdAt', { ascending: false });

  if (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }

  return NextResponse.json({ notes });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const noteId = searchParams.get('noteId');

  if (!noteId) {
    return NextResponse.json({ error: 'Note ID is required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('Note')
    .delete()
    .eq('id', noteId);

  if (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }

  return NextResponse.json({ message: 'Note deleted successfully' }, { status: 200 });
}
