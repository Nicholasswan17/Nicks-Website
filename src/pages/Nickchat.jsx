import { useState, useEffect } from 'react'
import {
  HMSRoomProvider,
  useHMSActions,
  useHMSStore,
  useVideo,
  selectIsConnectedToRoom,
  selectPeers,
  selectIsLocalAudioEnabled,
  selectIsLocalVideoEnabled,
  selectIsPeerVideoEnabled,
} from '@100mslive/react-sdk'
import { supabase } from '../supabase'
import '../styles/nickchat.css'

const TEMPLATE_ID = '69a249696cb1ece855eac284'

// ── Video Tile ───────────────────────────────────────────────────────────────

function VideoTile({ peer, avatarUrl }) {
  const { videoRef } = useVideo({ trackId: peer.videoTrack })
  const isVideoEnabled = useHMSStore(selectIsPeerVideoEnabled(peer.id))
  const hasVideo = !!peer.videoTrack && isVideoEnabled

  return (
    <div className="video-tile">
      <video
        ref={videoRef}
        autoPlay
        muted={peer.isLocal}
        playsInline
        style={{ display: hasVideo ? 'block' : 'none', width: '100%', height: '100%', objectFit: 'cover' }}
      />
      {!hasVideo && (
        <div className="video-fallback">
          {avatarUrl ? (
            <img src={avatarUrl} alt={peer.name} className="tile-avatar" />
          ) : (
            <div className="tile-initials">
              {peer.name?.charAt(0).toUpperCase() || '?'}
            </div>
          )}
        </div>
      )}
      <span className="peer-name">{peer.name}</span>
    </div>
  )
}

// ── Video Room ───────────────────────────────────────────────────────────────

function VideoRoom({ user, roomId, onLeave, peerAvatars, onInCallChange, onPeerJoin }) {
  const hmsActions = useHMSActions()
  const isConnected = useHMSStore(selectIsConnectedToRoom)
  const peers = useHMSStore(selectPeers)
  const isAudioOn = useHMSStore(selectIsLocalAudioEnabled)
  const isVideoOn = useHMSStore(selectIsLocalVideoEnabled)
  const [joining, setJoining] = useState(false)

  // Fetch avatar for each peer when they join
  useEffect(() => {
    peers.forEach(peer => {
      if (peer.name) onPeerJoin(peer.name)
    })
  }, [peers, onPeerJoin])

  // Tell parent when we're live so navbar can guard navigation
  useEffect(() => {
    onInCallChange(isConnected)
    return () => onInCallChange(false)
  }, [isConnected, onInCallChange])

  // Leave on unmount (e.g. forced navigation)
  useEffect(() => {
    return () => {
      if (isConnected) hmsActions.leave()
    }
  }, [isConnected, hmsActions])

  const joinRoom = async () => {
    setJoining(true)
    try {
      const { data, error } = await supabase.functions.invoke('smooth-action', {
        body: { roomId, role: 'host', userId: user.id, userName: user.name }
      })
      if (error) throw error
      await hmsActions.join({ userName: user.name, authToken: data.token })
    } catch (err) {
      if (err.name === 'DeviceInUse') {
        alert('Your camera/mic is in use by another app. Please close it and try again.')
      } else {
        console.error('Failed to join:', err)
      }
    }
    setJoining(false)
  }

  const leaveRoom = async () => {
    await hmsActions.leave()
    onLeave()
  }

  if (!isConnected) {
    return (
      <div className="video-join">
        <img src="/SillySausageBruno-removebg-preview.png" alt="Bruno" className="chat-bruno" />
        <h2>Room: {roomId}</h2>
        <p>Bruno has reserved your seat. Don't keep him waiting.</p>
        <button className="btn-primary" onClick={joinRoom} disabled={joining}>
          {joining ? 'Joining...' : 'Join Video Call'}
        </button>
        <button className="btn-secondary" onClick={onLeave} style={{ marginTop: '1rem' }}>
          Back
        </button>
      </div>
    )
  }

  return (
    <div className="video-room">
      <div className="video-grid">
        {peers.map(peer => (
          <VideoTile key={peer.id} peer={peer} avatarUrl={peerAvatars[peer.name] || null} />
        ))}
      </div>
      <div className="video-controls">
        <div className="room-code-wrap">
          <span className="room-code-label">Room:</span>
          <span className="room-code-id">{roomId}</span>
          <button
            className="room-code-copy"
            onClick={() => {
              navigator.clipboard.writeText(roomId)
                .then(() => alert('Room code copied!'))
            }}
            title="Copy room code"
          >
            📋
          </button>
        </div>
        <button className={`ctrl-btn ${isAudioOn ? 'on' : 'off'}`} onClick={() => hmsActions.setLocalAudioEnabled(!isAudioOn)}>
          {isAudioOn ? '🎤' : '🔇'}
        </button>
        <button className={`ctrl-btn ${isVideoOn ? 'on' : 'off'}`} onClick={() => hmsActions.setLocalVideoEnabled(!isVideoOn)}>
          {isVideoOn ? '📷' : '🚫'}
        </button>
        <button className="ctrl-btn leave" onClick={leaveRoom}>🚪 Leave</button>
      </div>
    </div>
  )
}

// ── Chat Lobby ───────────────────────────────────────────────────────────────

function ChatLobby({ user, onJoinRoom, avatarUrl }) {
  const [roomId, setRoomId] = useState('')
  const [creating, setCreating] = useState(false)

  const createRoom = async () => {
    setCreating(true)
    try {
      const { data, error } = await supabase.functions.invoke('smooth-action', {
        body: { createRoom: true, templateId: TEMPLATE_ID }
      })
      if (error) throw error
      onJoinRoom(data.roomId)
    } catch (err) {
      console.error('Failed to create room:', err)
    }
    setCreating(false)
  }

  return (
    <div className="chat-lobby">
      <div className="chat-lobby-inner">
        <div className="chat-profile-strip">
          {avatarUrl ? (
            <img src={avatarUrl} alt={user.name} className="chat-strip-avatar" />
          ) : (
            <div className="chat-strip-initial">{user.name?.charAt(0).toUpperCase() || '?'}</div>
          )}
          <div className="chat-strip-info">
            <span className="chat-strip-name">{user.displayName || user.name}</span>
            <span className="chat-strip-hint">your profile pic shows in calls when camera is off</span>
          </div>
        </div>

        <h1>Nickchat</h1>
        <p className="chat-sub">Bruno can't join the call. He doesn't have thumbs. Everyone else can.</p>

        <div className="chat-options">
          <div className="chat-card">
            <h3>🎥 Start a Call</h3>
            <p>Create a new video room and invite your mates.</p>
            <button className="btn-primary" onClick={createRoom} disabled={creating}>
              {creating ? 'Creating...' : 'Start Video Call'}
            </button>
          </div>
          <div className="chat-card">
            <h3>🔗 Join a Call</h3>
            <p>Have a room ID? Enter it below.</p>
            <input
              className="room-input"
              placeholder="Enter room ID..."
              value={roomId}
              onChange={e => setRoomId(e.target.value)}
            />
            <button className="btn-primary" onClick={() => onJoinRoom(roomId)} disabled={!roomId} style={{ marginTop: '0.75rem' }}>
              Join Call
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Root ─────────────────────────────────────────────────────────────────────

export default function Nickchat({ user, avatarUrl, onAvatarUpdate, onInCallChange }) {
  const [activeRoom, setActiveRoom] = useState(null)
  const [peerAvatars, setPeerAvatars] = useState({})

  // Seed own avatar into peer map
  useEffect(() => {
    if (avatarUrl) {
      setPeerAvatars(prev => ({ ...prev, [user.displayName || user.name]: avatarUrl }))
    }
  }, [avatarUrl, user.name, user.displayName])

  const fetchPeerAvatar = async (peerName) => {
    // Skip if we already have it
    if (peerAvatars[peerName]) return
    const { data } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('display_name', peerName)
      .single()
    if (data?.avatar_url) {
      setPeerAvatars(prev => ({ ...prev, [peerName]: data.avatar_url }))
    }
  }

  return (
    <HMSRoomProvider>
      <div className="nickchat">
        {activeRoom ? (
          <VideoRoom
            user={user}
            roomId={activeRoom}
            onLeave={() => { setActiveRoom(null); onInCallChange(false) }}
            peerAvatars={peerAvatars}
            onInCallChange={onInCallChange}
            onPeerJoin={fetchPeerAvatar}
          />
        ) : (
          <ChatLobby user={user} onJoinRoom={setActiveRoom} avatarUrl={avatarUrl} />
        )}
      </div>
    </HMSRoomProvider>
  )
}