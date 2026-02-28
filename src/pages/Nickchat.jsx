import { useState } from 'react'
import {
  HMSRoomProvider,
  useHMSActions,
  useHMSStore,
  useVideo,
  selectIsConnectedToRoom,
  selectPeers,
  selectIsLocalAudioEnabled,
  selectIsLocalVideoEnabled,
} from '@100mslive/react-sdk'
import { supabase } from '../supabase'
import '../styles/nickchat.css'

const APP_SUBDOMAIN = 'nicholasswan17-videoconf-1248'
const TEMPLATE_ID = '69a249696cb1ece855eac284'

function VideoTile({ peer }) {
  const { videoRef } = useVideo({ trackId: peer.videoTrack })
  return (
    <div className="video-tile">
      <video ref={videoRef} autoPlay muted={peer.isLocal} playsInline />
      <span className="peer-name">{peer.name}</span>
    </div>
  )
}

function VideoRoom({ user, roomId, onLeave }) {
  const hmsActions = useHMSActions()
  const isConnected = useHMSStore(selectIsConnectedToRoom)
  const peers = useHMSStore(selectPeers)
  const isAudioOn = useHMSStore(selectIsLocalAudioEnabled)
  const isVideoOn = useHMSStore(selectIsLocalVideoEnabled)
  const [joining, setJoining] = useState(false)

  const joinRoom = async () => {
    setJoining(true)
    try {
      const { data, error } = await supabase.functions.invoke('smooth-action', {
        body: {
          roomId,
          role: 'host',
          userId: user.id,
          userName: user.name,
        }
      })
      if (error) throw error
  
      await hmsActions.join({
        userName: user.name,
        authToken: data.token,
      })
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
        <img src="/CuteBruno.png" alt="Bruno" className="chat-bruno" />
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
          <VideoTile key={peer.id} peer={peer} />
        ))}
      </div>
      <div className="video-controls">
        <button
          className={`ctrl-btn ${isAudioOn ? 'on' : 'off'}`}
          onClick={() => hmsActions.setLocalAudioEnabled(!isAudioOn)}
        >
          {isAudioOn ? '🎤' : '🔇'}
        </button>
        <button
          className={`ctrl-btn ${isVideoOn ? 'on' : 'off'}`}
          onClick={() => hmsActions.setLocalVideoEnabled(!isVideoOn)}
        >
          {isVideoOn ? '📷' : '🚫'}
        </button>
        <button className="ctrl-btn leave" onClick={leaveRoom}>
          🚪 Leave
        </button>
      </div>
    </div>
  )
}

function ChatLobby({ user, onJoinRoom }) {
  const [roomId, setRoomId] = useState('')
  const [creating, setCreating] = useState(false)

  const createRoom = async () => {
    setCreating(true)
    try {
      const { data, error } = await supabase.functions.invoke('smooth-action', {
        body: {
          createRoom: true,
          templateId: TEMPLATE_ID,
        }
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
        <img src="/CuteBruno.png" alt="Bruno" className="chat-bruno" />
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
            <button
              className="btn-primary"
              onClick={() => onJoinRoom(roomId)}
              disabled={!roomId}
              style={{ marginTop: '0.75rem' }}
            >
              Join Call
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Nickchat({ user }) {
  const [activeRoom, setActiveRoom] = useState(null)

  return (
    <HMSRoomProvider>
      <div className="nickchat">
        {activeRoom ? (
          <VideoRoom
            user={user}
            roomId={activeRoom}
            onLeave={() => setActiveRoom(null)}
          />
        ) : (
          <ChatLobby user={user} onJoinRoom={setActiveRoom} />
        )}
      </div>
    </HMSRoomProvider>
  )
}