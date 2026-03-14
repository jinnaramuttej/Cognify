/**
 * Offline Sync API Routes
 * 
 * GET /api/offline/sync - Get sync status
 * POST /api/offline/sync - Sync offline data
 * DELETE /api/offline/sync - Clear sync conflicts
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ============================================================
// Types
// ============================================================

interface SyncStatusResponse {
  success: boolean;
  status?: {
    lastSync: string | null;
    pendingItems: number;
    conflictItems: number;
    downloadedItems: number;
    totalBytes: number;
  };
  error?: string;
}

interface SyncRequest {
  userId: string;
  syncData?: Array<{
    resourceType: string;
    resourceId: string;
    dataType: string;
    data: any;
    clientVersion: number;
  }>;
}

interface SyncResponse {
  success: boolean;
  serverChanges?: Array<{
    resourceType: string;
    resourceId: string;
    dataType: string;
    data: any;
    serverVersion: number;
  }>;
  conflicts?: Array<{
    resourceType: string;
    resourceId: string;
    dataType: string;
    clientData: any;
    serverData: any;
  }>;
  error?: string;
}

// ============================================================
// GET Handler - Get Sync Status
// ============================================================

export async function GET(
  request: NextRequest
): Promise<NextResponse<SyncStatusResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'userId is required',
      }, { status: 400 });
    }
    
    // Get sync status from database
    const syncData = await db.userSyncData.findMany({
      where: { userId },
      select: {
        syncStatus: true,
        lastModified: true,
      },
    });
    
    const offlineContent = await db.offlineContent.findMany({
      where: { userId, status: 'completed' },
      select: {
        downloadedBytes: true,
      },
    });
    
    const pendingItems = syncData.filter(d => d.syncStatus === 'pending').length;
    const conflictItems = syncData.filter(d => d.syncStatus === 'conflict').length;
    const totalBytes = offlineContent.reduce((sum, c) => sum + c.downloadedBytes, 0);
    const lastSync = syncData.length > 0 
      ? syncData.reduce((latest, d) => 
          d.lastModified > latest ? d.lastModified : latest, 
          new Date(0)
        ).toISOString()
      : null;
    
    return NextResponse.json({
      success: true,
      status: {
        lastSync,
        pendingItems,
        conflictItems,
        downloadedItems: offlineContent.length,
        totalBytes,
      },
    });
    
  } catch (error) {
    console.error('[Offline Sync] GET Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get sync status',
    }, { status: 500 });
  }
}

// ============================================================
// POST Handler - Sync Data
// ============================================================

export async function POST(
  request: NextRequest
): Promise<NextResponse<SyncResponse>> {
  try {
    const body: SyncRequest = await request.json();
    const { userId, syncData } = body;
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'userId is required',
      }, { status: 400 });
    }
    
    const serverChanges: any[] = [];
    const conflicts: any[] = [];
    
    // Process each sync item
    if (syncData && syncData.length > 0) {
      for (const item of syncData) {
        const existing = await db.userSyncData.findUnique({
          where: {
            userId_resourceType_resourceId_dataType: {
              userId,
              resourceType: item.resourceType,
              resourceId: item.resourceId,
              dataType: item.dataType,
            },
          },
        });
        
        if (!existing) {
          // Create new
          await db.userSyncData.create({
            data: {
              userId,
              resourceType: item.resourceType,
              resourceId: item.resourceId,
              dataType: item.dataType,
              data: JSON.stringify(item.data),
              syncStatus: 'synced',
              serverVersion: 1,
            },
          });
        } else if (item.clientVersion >= existing.serverVersion) {
          // Client is newer or same - update
          await db.userSyncData.update({
            where: { id: existing.id },
            data: {
              data: JSON.stringify(item.data),
              syncStatus: 'synced',
              serverVersion: existing.serverVersion + 1,
              lastModified: new Date(),
            },
          });
        } else {
          // Conflict - server is newer
          conflicts.push({
            resourceType: item.resourceType,
            resourceId: item.resourceId,
            dataType: item.dataType,
            clientData: item.data,
            serverData: JSON.parse(existing.data),
          });
          
          // Mark as conflict
          await db.userSyncData.update({
            where: { id: existing.id },
            data: { syncStatus: 'conflict' },
          });
        }
      }
    }
    
    // Get server changes for client
    const pendingServer = await db.userSyncData.findMany({
      where: {
        userId,
        syncStatus: 'synced',
      },
      take: 50,
    });
    
    for (const item of pendingServer) {
      serverChanges.push({
        resourceType: item.resourceType,
        resourceId: item.resourceId,
        dataType: item.dataType,
        data: JSON.parse(item.data),
        serverVersion: item.serverVersion,
      });
    }
    
    return NextResponse.json({
      success: true,
      serverChanges,
      conflicts,
    });
    
  } catch (error) {
    console.error('[Offline Sync] POST Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to sync data',
    }, { status: 500 });
  }
}

// ============================================================
// DELETE Handler - Clear Conflicts
// ============================================================

export async function DELETE(
  request: NextRequest
): Promise<NextResponse<{ success: boolean; error?: string }>> {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const conflictId = searchParams.get('conflictId');
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'userId is required',
      }, { status: 400 });
    }
    
    if (conflictId) {
      // Delete specific conflict
      await db.userSyncData.delete({
        where: { id: conflictId },
      });
    } else {
      // Clear all conflicts for user
      await db.userSyncData.deleteMany({
        where: {
          userId,
          syncStatus: 'conflict',
        },
      });
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('[Offline Sync] DELETE Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to clear conflicts',
    }, { status: 500 });
  }
}
