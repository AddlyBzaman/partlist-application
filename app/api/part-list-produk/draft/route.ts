import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Node.js runtime for database operations (Edge doesn't support mysql2)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET - Load user's draft
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Get draft from database
    const [rows] = await db.query(
      'SELECT * FROM partlist_drafts WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1',
      [userId]
    );

    const drafts = rows as any[];
    if (drafts.length > 0) {
      const draft = drafts[0];
      return NextResponse.json({
        id: draft.id,
        user_id: draft.user_id,
        draft_data: JSON.parse(draft.draft_data),
        created_at: draft.created_at,
        updated_at: draft.updated_at
      });
    }

    return NextResponse.json(null);

  } catch (error) {
    console.error('Error loading draft:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Save/update user's draft
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, draftData } = body;

    if (!userId || !draftData) {
      return NextResponse.json({ error: 'User ID and draft data required' }, { status: 400 });
    }

    // Check if draft exists for this user
    const [existingDrafts] = await db.query(
      'SELECT id FROM partlist_drafts WHERE user_id = ?',
      [userId]
    );

    const existing = existingDrafts as any[];

    if (existing.length > 0) {
      // Update existing draft
      await db.query(
        'UPDATE partlist_drafts SET draft_data = ?, updated_at = NOW() WHERE user_id = ?',
        [JSON.stringify(draftData), userId]
      );
    } else {
      // Create new draft
      await db.query(
        'INSERT INTO partlist_drafts (user_id, draft_data, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
        [userId, JSON.stringify(draftData)]
      );
    }

    return NextResponse.json({ success: true, message: 'Draft saved successfully' });

  } catch (error) {
    console.error('Error saving draft:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Clear user's draft
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    await db.query('DELETE FROM partlist_drafts WHERE user_id = ?', [userId]);

    return NextResponse.json({ success: true, message: 'Draft deleted successfully' });

  } catch (error) {
    console.error('Error deleting draft:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
