import { createServer } from 'http'
import { Server } from 'socket.io'

const httpServer = createServer()
const io = new Server(httpServer, {
  path: '/',
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  pingTimeout: 60000,
  pingInterval: 25000,
})

// ============================================
// TYPES
// ============================================

interface LeaderboardEntry {
  rank: number
  previousRank: number
  userId: string
  userName: string
  score: number
  accuracy: number
  streak: number
  badges: string[]
}

interface UserConnection {
  socketId: string
  userId: string
  rooms: string[]
}

interface LeaderboardUpdate {
  type: 'rank_change' | 'score_update' | 'new_entry' | 'streak_update' | 'competition_update'
  data: {
    userId?: string
    entries?: LeaderboardEntry[]
    changes?: {
      userId: string
      oldRank: number
      newRank: number
      scoreDelta: number
    }[]
  }
  timestamp: Date
}

interface NotificationPayload {
  type: 'rank_up' | 'rank_down' | 'badge_earned' | 'streak_milestone' | 'competition_start' | 'competition_end'
  title: string
  message: string
  data: Record<string, any>
}

// ============================================
// STATE
// ============================================

const connectedUsers = new Map<string, UserConnection>()
const leaderboardCache = new Map<string, LeaderboardEntry[]>()
const lastUpdateTime = new Map<string, Date>()

// ============================================
// HELPER FUNCTIONS
// ============================================

const generateId = () => Math.random().toString(36).substr(2, 9)

function getLeaderboardRoom(scope: string, scopeId?: string): string {
  return scopeId ? `leaderboard:${scope}:${scopeId}` : `leaderboard:${scope}`
}

async function broadcastLeaderboardUpdate(room: string, update: LeaderboardUpdate) {
  lastUpdateTime.set(room, new Date())
  io.to(room).emit('leaderboard-update', update)
}

// ============================================
// MOCK DATA GENERATORS (Replace with DB queries in production)
// ============================================

function generateMockLeaderboard(limit: number = 50): LeaderboardEntry[] {
  const names = [
    'Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Sneha Gupta', 'Vikram Singh',
    'Ananya Roy', 'Karthik Nair', 'Meera Iyer', 'Arjun Reddy', 'Divya Nair',
    'Rohan Verma', 'Kavita Singh', 'Saurabh Jain', 'Nisha Agarwal', 'Manish Yadav'
  ]

  const badgeOptions = ['speedster', 'perfectionist', 'streaker', 'genius', 'champion', 'warrior']
  
  return names.slice(0, limit).map((name, index) => ({
    rank: index + 1,
    previousRank: Math.max(1, index + 1 + Math.floor(Math.random() * 3) - 1),
    userId: `user-${index}`,
    userName: name,
    score: Math.round(2500 - index * 80 + Math.random() * 50),
    accuracy: Math.round(95 - index * 2 + Math.random() * 3),
    streak: Math.round(Math.random() * 20),
    badges: Math.random() > 0.5 ? [badgeOptions[Math.floor(Math.random() * badgeOptions.length)]] : []
  }))
}

// ============================================
// SOCKET EVENT HANDLERS
// ============================================

io.on('connection', (socket) => {
  console.log(`[CONNECT] Socket ${socket.id} connected`)

  // ============================================
  // USER AUTHENTICATION
  // ============================================
  
  socket.on('authenticate', (data: { userId: string }) => {
    const { userId } = data
    
    // Store user connection
    connectedUsers.set(socket.id, {
      socketId: socket.id,
      userId,
      rooms: []
    })
    
    socket.emit('authenticated', { 
      success: true, 
      userId,
      timestamp: new Date().toISOString()
    })
    
    console.log(`[AUTH] User ${userId} authenticated on socket ${socket.id}`)
  })

  // ============================================
  // LEADERBOARD SUBSCRIPTIONS
  // ============================================

  socket.on('subscribe-leaderboard', (data: { 
    scope: 'global' | 'subject' | 'grade' | 'institution',
    scopeId?: string,
    userId: string
  }) => {
    const { scope, scopeId, userId } = data
    const room = getLeaderboardRoom(scope, scopeId)
    
    // Join the room
    socket.join(room)
    
    // Update user's rooms
    const userConn = connectedUsers.get(socket.id)
    if (userConn) {
      userConn.rooms.push(room)
    }
    
    // Send current leaderboard
    const leaderboard = generateMockLeaderboard()
    leaderboardCache.set(room, leaderboard)
    
    socket.emit('leaderboard-init', {
      room,
      entries: leaderboard,
      timestamp: new Date().toISOString()
    })
    
    // Notify room about new subscriber
    socket.to(room).emit('user-subscribed', {
      userId,
      totalSubscribers: io.sockets.adapter.rooms.get(room)?.size || 1
    })
    
    console.log(`[SUBSCRIBE] User ${userId} subscribed to ${room}`)
  })

  socket.on('unsubscribe-leaderboard', (data: {
    scope: string,
    scopeId?: string
  }) => {
    const room = getLeaderboardRoom(data.scope, data.scopeId)
    socket.leave(room)
    
    const userConn = connectedUsers.get(socket.id)
    if (userConn) {
      userConn.rooms = userConn.rooms.filter(r => r !== room)
    }
    
    console.log(`[UNSUBSCRIBE] Socket ${socket.id} unsubscribed from ${room}`)
  })

  // ============================================
  // SCORE UPDATES
  // ============================================

  socket.on('score-update', (data: {
    userId: string
    userName: string
    pointsEarned: number
    accuracy: number
    testId?: string
  }) => {
    const { userId, userName, pointsEarned, accuracy } = data
    
    // Find rooms this user is in
    const userConn = connectedUsers.get(socket.id)
    if (!userConn) return
    
    // Broadcast to all leaderboard rooms the user is in
    for (const room of userConn.rooms) {
      const currentLeaderboard = leaderboardCache.get(room) || []
      
      // Find user in leaderboard
      const userIndex = currentLeaderboard.findIndex(e => e.userId === userId)
      
      if (userIndex !== -1) {
        const oldEntry = currentLeaderboard[userIndex]
        const newScore = oldEntry.score + pointsEarned
        
        // Update entry
        currentLeaderboard[userIndex] = {
          ...oldEntry,
          score: newScore,
          accuracy: Math.round((oldEntry.accuracy + accuracy) / 2)
        }
        
        // Re-sort leaderboard
        currentLeaderboard.sort((a, b) => b.score - a.score)
        
        // Update ranks
        currentLeaderboard.forEach((entry, idx) => {
          entry.previousRank = entry.rank
          entry.rank = idx + 1
        })
        
        // Save updated leaderboard
        leaderboardCache.set(room, currentLeaderboard)
        
        // Find rank changes
        const newEntry = currentLeaderboard.find(e => e.userId === userId)!
        const rankChange = oldEntry.rank - newEntry.rank
        
        // Broadcast update
        const update: LeaderboardUpdate = {
          type: 'score_update',
          data: {
            entries: currentLeaderboard.slice(0, 10), // Top 10
            changes: [{
              userId,
              oldRank: oldEntry.rank,
              newRank: newEntry.rank,
              scoreDelta: pointsEarned
            }]
          },
          timestamp: new Date()
        }
        
        io.to(room).emit('leaderboard-update', update)
        
        // Send personal notification if rank improved
        if (rankChange > 0) {
          socket.emit('notification', {
            type: 'rank_up',
            title: '🎉 Rank Up!',
            message: `You moved up ${rankChange} position${rankChange > 1 ? 's' : ''}! Now ranked #${newEntry.rank}`,
            data: { oldRank: oldEntry.rank, newRank: newEntry.rank }
          } as NotificationPayload)
        }
      }
      
      console.log(`[SCORE] User ${userId} earned ${pointsEarned} points in ${room}`)
    }
  })

  // ============================================
  // SQUAD UPDATES
  // ============================================

  socket.on('join-squad-room', (data: { squadId: string, userId: string }) => {
    const room = `squad:${data.squadId}`
    socket.join(room)
    
    const userConn = connectedUsers.get(socket.id)
    if (userConn) {
      userConn.rooms.push(room)
    }
    
    socket.emit('squad-room-joined', { squadId: data.squadId })
    socket.to(room).emit('squad-member-online', { userId: data.userId })
    
    console.log(`[SQUAD] User ${data.userId} joined squad room ${data.squadId}`)
  })

  socket.on('squad-score-update', (data: {
    squadId: string
    userId: string
    userName: string
    scoreEarned: number
    questionsAnswered: number
    accuracy: number
  }) => {
    const room = `squad:${data.squadId}`
    
    io.to(room).emit('squad-member-update', {
      userId: data.userId,
      userName: data.userName,
      scoreEarned: data.scoreEarned,
      questionsAnswered: data.questionsAnswered,
      accuracy: data.accuracy,
      timestamp: new Date().toISOString()
    })
    
    console.log(`[SQUAD] User ${data.userId} scored ${data.scoreEarned} in squad ${data.squadId}`)
  })

  // ============================================
  // COMPETITION EVENTS
  // ============================================

  socket.on('competition-start', (data: {
    competitionId: string
    competitionName: string
    endTime: Date
  }) => {
    const room = `competition:${data.competitionId}`
    
    io.emit('competition-notification', {
      type: 'competition_start',
      title: '🏆 Competition Started!',
      message: `${data.competitionName} has begun. Good luck!`,
      data: {
        competitionId: data.competitionId,
        endTime: data.endTime
      }
    })
    
    console.log(`[COMPETITION] Competition ${data.competitionId} started`)
  })

  socket.on('competition-join', (data: {
    competitionId: string
    userId: string
    userName: string
  }) => {
    const room = `competition:${data.competitionId}`
    socket.join(room)
    
    socket.to(room).emit('competition-participant-joined', {
      userId: data.userId,
      userName: data.userName,
      timestamp: new Date().toISOString()
    })
    
    console.log(`[COMPETITION] User ${data.userId} joined competition ${data.competitionId}`)
  })

  // ============================================
  // LIVE PRESENCE
  // ============================================

  socket.on('ping-presence', () => {
    socket.emit('pong-presence', { timestamp: Date.now() })
  })

  // ============================================
  // DISCONNECT
  // ============================================

  socket.on('disconnect', () => {
    const userConn = connectedUsers.get(socket.id)
    
    if (userConn) {
      // Notify rooms about user leaving
      for (const room of userConn.rooms) {
        socket.to(room).emit('user-disconnected', {
          userId: userConn.userId,
          timestamp: new Date().toISOString()
        })
      }
      
      connectedUsers.delete(socket.id)
      console.log(`[DISCONNECT] User ${userConn.userId} disconnected`)
    } else {
      console.log(`[DISCONNECT] Socket ${socket.id} disconnected`)
    }
  })

  socket.on('error', (error) => {
    console.error(`[ERROR] Socket ${socket.id}:`, error)
  })
})

// ============================================
// PERIODIC UPDATES (Simulate live activity)
// ============================================

setInterval(() => {
  // Simulate random score updates for demo
  const rooms = Array.from(leaderboardCache.keys())
  
  if (rooms.length > 0) {
    const randomRoom = rooms[Math.floor(Math.random() * rooms.length)]
    const leaderboard = leaderboardCache.get(randomRoom)
    
    if (leaderboard && leaderboard.length > 0) {
      // Pick a random user to update
      const randomIndex = Math.floor(Math.random() * Math.min(5, leaderboard.length))
      const user = leaderboard[randomIndex]
      
      // Add small score change
      const scoreChange = Math.floor(Math.random() * 10) + 1
      user.score += scoreChange
      
      // Re-sort and update ranks
      leaderboard.sort((a, b) => b.score - a.score)
      leaderboard.forEach((entry, idx) => {
        entry.previousRank = entry.rank
        entry.rank = idx + 1
      })
      
      leaderboardCache.set(randomRoom, leaderboard)
      
      // Broadcast mini update
      io.to(randomRoom).emit('leaderboard-live-tick', {
        type: 'live_tick',
        data: {
          updatedUserId: user.userId,
          updatedUserName: user.userName,
          newScore: user.score,
          rank: user.rank,
          previousRank: user.previousRank
        },
        timestamp: new Date()
      })
    }
  }
}, 15000) // Every 15 seconds

// ============================================
// SERVER START
// ============================================

const PORT = 3004
httpServer.listen(PORT, () => {
  console.log(`🚀 Social Leaderboard WebSocket server running on port ${PORT}`)
})

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

process.on('SIGTERM', () => {
  console.log('Received SIGTERM signal, shutting down server...')
  httpServer.close(() => {
    console.log('Social Leaderboard server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('Received SIGINT signal, shutting down server...')
  httpServer.close(() => {
    console.log('Social Leaderboard server closed')
    process.exit(0)
  })
})
