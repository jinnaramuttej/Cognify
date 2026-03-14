/**
 * Playlist API Routes
 * 
 * GET /api/playlist - Get user's playlists
 * POST /api/playlist - Create new playlist
 * PATCH /api/playlist - Update playlist
 * DELETE /api/playlist - Delete playlist
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { nanoid } from 'nanoid';

// ============================================================
// Types
// ============================================================

interface CreatePlaylistRequest {
  userId: string;
  name: string;
  description?: string;
  subject?: string;
  grade?: string;
  isPublic?: boolean;
}

interface UpdatePlaylistRequest {
  playlistId: string;
  name?: string;
  description?: string;
  isPublic?: boolean;
}

interface AddItemRequest {
  playlistId: string;
  resourceType: string;
  resourceId: string;
  resourceName: string;
  resourceThumbnail?: string;
}

interface ReorderRequest {
  playlistId: string;
  itemIds: string[];
}

interface PlaylistResponse {
  success: boolean;
  playlist?: any;
  playlists?: any[];
  error?: string;
}

// ============================================================
// GET Handler - Get Playlists
// ============================================================

export async function GET(
  request: NextRequest
): Promise<NextResponse<PlaylistResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const playlistId = searchParams.get('playlistId');
    const shareCode = searchParams.get('shareCode');
    
    if (shareCode) {
      // Get shared playlist
      const playlist = await db.playlist.findUnique({
        where: { shareCode },
        include: {
          items: {
            orderBy: { sortOrder: 'asc' },
          },
        },
      });
      
      if (!playlist) {
        return NextResponse.json({
          success: false,
          error: 'Playlist not found',
        }, { status: 404 });
      }
      
      // Increment view count
      await db.playlist.update({
        where: { id: playlist.id },
        data: { viewCount: { increment: 1 } },
      });
      
      return NextResponse.json({
        success: true,
        playlist,
      });
    }
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'userId is required',
      }, { status: 400 });
    }
    
    if (playlistId) {
      // Get specific playlist
      const playlist = await db.playlist.findFirst({
        where: {
          id: playlistId,
          userId,
        },
        include: {
          items: {
            orderBy: { sortOrder: 'asc' },
          },
        },
      });
      
      if (!playlist) {
        return NextResponse.json({
          success: false,
          error: 'Playlist not found',
        }, { status: 404 });
      }
      
      return NextResponse.json({
        success: true,
        playlist,
      });
    }
    
    // Get all user playlists
    const playlists = await db.playlist.findMany({
      where: { userId },
      include: {
        items: {
          select: {
            id: true,
            resourceType: true,
            resourceId: true,
            resourceName: true,
            progress: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json({
      success: true,
      playlists,
    });
    
  } catch (error) {
    console.error('[Playlist] GET Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get playlists',
    }, { status: 500 });
  }
}

// ============================================================
// POST Handler - Create Playlist / Add Item / Reorder
// ============================================================

export async function POST(
  request: NextRequest
): Promise<NextResponse<PlaylistResponse>> {
  try {
    const body = await request.json();
    
    // Create new playlist
    if ('name' in body && 'userId' in body) {
      const { userId, name, description, subject, grade, isPublic }: CreatePlaylistRequest = body;
      
      const playlist = await db.playlist.create({
        data: {
          userId,
          name,
          description,
          subject,
          grade,
          isPublic: isPublic || false,
          shareCode: isPublic ? nanoid(8).toUpperCase() : null,
          itemCount: 0,
          viewCount: 0,
          copyCount: 0,
          order: 0,
        },
      });
      
      return NextResponse.json({
        success: true,
        playlist,
      });
    }
    
    // Add item to playlist
    if ('playlistId' in body && 'resourceId' in body) {
      const { playlistId, resourceType, resourceId, resourceName, resourceThumbnail }: AddItemRequest = body;
      
      // Get current max sort order
      const items = await db.playlistItem.findMany({
        where: { playlistId },
        select: { sortOrder: true },
        orderBy: { sortOrder: 'desc' },
        take: 1,
      });
      
      const sortOrder = items.length > 0 ? items[0].sortOrder + 1 : 0;
      
      const item = await db.playlistItem.create({
        data: {
          playlistId,
          resourceType,
          resourceId,
          resourceName,
          resourceThumbnail,
          sortOrder,
          progress: 0,
        },
      });
      
      // Update item count
      await db.playlist.update({
        where: { id: playlistId },
        data: { itemCount: { increment: 1 } },
      });
      
      return NextResponse.json({
        success: true,
        playlist: item,
      });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Invalid request body',
    }, { status: 400 });
    
  } catch (error) {
    console.error('[Playlist] POST Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create playlist',
    }, { status: 500 });
  }
}

// ============================================================
// PATCH Handler - Update Playlist / Reorder Items
// ============================================================

export async function PATCH(
  request: NextRequest
): Promise<NextResponse<PlaylistResponse>> {
  try {
    const body = await request.json();
    
    // Reorder items
    if ('itemIds' in body) {
      const { playlistId, itemIds }: ReorderRequest = body;
      
      // Update sort orders in transaction
      for (let i = 0; i < itemIds.length; i++) {
        await db.playlistItem.update({
          where: { id: itemIds[i] },
          data: { sortOrder: i },
        });
      }
      
      return NextResponse.json({ success: true });
    }
    
    // Update playlist
    if ('playlistId' in body) {
      const { playlistId, name, description, isPublic }: UpdatePlaylistRequest = body;
      
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (isPublic !== undefined) {
        updateData.isPublic = isPublic;
        updateData.shareCode = isPublic ? nanoid(8).toUpperCase() : null;
      }
      
      const playlist = await db.playlist.update({
        where: { id: playlistId },
        data: updateData,
      });
      
      return NextResponse.json({
        success: true,
        playlist,
      });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Invalid request body',
    }, { status: 400 });
    
  } catch (error) {
    console.error('[Playlist] PATCH Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update playlist',
    }, { status: 500 });
  }
}

// ============================================================
// DELETE Handler - Delete Playlist / Remove Item
// ============================================================

export async function DELETE(
  request: NextRequest
): Promise<NextResponse<{ success: boolean; error?: string }>> {
  try {
    const { searchParams } = new URL(request.url);
    const playlistId = searchParams.get('playlistId');
    const itemId = searchParams.get('itemId');
    
    if (!playlistId) {
      return NextResponse.json({
        success: false,
        error: 'playlistId is required',
      }, { status: 400 });
    }
    
    if (itemId) {
      // Remove item from playlist
      await db.playlistItem.delete({
        where: { id: itemId },
      });
      
      // Update item count
      await db.playlist.update({
        where: { id: playlistId },
        data: { itemCount: { decrement: 1 } },
      });
      
      return NextResponse.json({ success: true });
    }
    
    // Delete entire playlist
    await db.playlist.delete({
      where: { id: playlistId },
    });
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('[Playlist] DELETE Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete playlist',
    }, { status: 500 });
  }
}
