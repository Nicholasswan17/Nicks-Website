import { useState, useEffect, useRef, useCallback } from 'react'
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
  selectHMSMessages,
  selectIsLocalScreenShared,
  selectPeerScreenSharing,
  selectRecordingState,
} from '@100mslive/react-sdk'
import { supabase } from '../supabase'
import '../styles/nickchat.css'

const TEMPLATE_ID = '69a249696cb1ece855eac284'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime()
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return new Date(ts).toLocaleDateString()
}

function Avatar({ url, name, size = 40, online = false }) {
  return (
    <div className="nc-avatar-wrap" style={{ width: size, height: size }}>
      {url ? (
        <img src={url} alt={name} className="nc-avatar-img" style={{ width: size, height: size }} />
      ) : (
        <div className="nc-avatar-init" style={{ width: size, height: size, fontSize: size * 0.4 }}>
          {name?.charAt(0).toUpperCase() || '?'}
        </div>
      )}
      {online && <span className="nc-online-dot" />}
    </div>
  )
}

// ─── Recording Indicator ─────────────────────────────────────────────────────

function RecordingIndicator() {
  const recordingState = useHMSStore(selectRecordingState)
  const isRecording =
    recordingState?.server?.running ||
    recordingState?.browser?.running ||
    recordingState?.hls?.running

  if (!isRecording) return null

  return (
    <div className="recording-indicator" title="This call is being recorded">
      <span className="rec-dot" />
      REC
    </div>
  )
}

// ─── Screen Share Tile ────────────────────────────────────────────────────────

function ScreenShareTile({ peer }) {
  const { videoRef } = useVideo({ trackId: peer.auxiliaryTracks?.[0] })

  return (
    <div className="video-tile screen-share-tile">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }}
      />
      <span className="peer-name screen-share-label">
        🖥️ {peer.isLocal ? 'Your screen' : `${peer.name}'s screen`}
      </span>
    </div>
  )
}

// ─── Video Tile ───────────────────────────────────────────────────────────────

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
          <Avatar url={avatarUrl} name={peer.name} size={80} />
        </div>
      )}
      <span className="peer-name">{peer.name}{peer.isLocal ? ' (You)' : ''}</span>
    </div>
  )
}

// ─── In-Call Chat Panel ───────────────────────────────────────────────────────

function CallChatPanel({ user }) {
  const hmsActions   = useHMSActions()
  const messages     = useHMSStore(selectHMSMessages)
  const [input, setInput]     = useState('')
  const [open, setOpen]       = useState(false)
  const [unread, setUnread]   = useState(0)
  const bottomRef             = useRef()
  const prevCountRef          = useRef(messages.length)

  useEffect(() => {
    if (!open && messages.length > prevCountRef.current) {
      setUnread(u => u + (messages.length - prevCountRef.current))
    }
    prevCountRef.current = messages.length
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const send = () => {
    if (!input.trim()) return
    hmsActions.sendBroadcastMessage(input.trim())
    setInput('')
  }

  return (
    <>
      <button
        className={`call-chat-toggle ${open ? 'open' : ''}`}
        onClick={() => { setOpen(o => !o); setUnread(0) }}
        title="Call Chat"
      >
        💬
        {unread > 0 && <span className="call-chat-badge">{unread}</span>}
      </button>

      {open && (
        <div className="call-chat-panel">
          <div className="call-chat-header">
            <span>Call Chat</span>
            <button onClick={() => setOpen(false)}>✕</button>
          </div>
          <div className="call-chat-messages">
            {messages.length === 0 && (
              <p className="call-chat-empty">No messages yet. Say something.</p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`call-chat-msg ${m.senderName === user.name ? 'mine' : ''}`}>
                <span className="call-msg-sender">{m.senderName === user.name ? 'You' : m.senderName}</span>
                <span className="call-msg-text">{m.message}</span>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="call-chat-input-row">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Message the call..."
            />
            <button onClick={send}>➤</button>
          </div>
        </div>
      )}
    </>
  )
}

// ─── Video Room ───────────────────────────────────────────────────────────────

function VideoRoom({ user, roomId, chatRoomId, onLeave, peerAvatars, onInCallChange }) {
  const hmsActions        = useHMSActions()
  const isConnected       = useHMSStore(selectIsConnectedToRoom)
  const peers             = useHMSStore(selectPeers)
  const isAudioOn         = useHMSStore(selectIsLocalAudioEnabled)
  const isVideoOn         = useHMSStore(selectIsLocalVideoEnabled)
  const isScreenSharing   = useHMSStore(selectIsLocalScreenShared)
  const screenSharingPeer = useHMSStore(selectPeerScreenSharing)
  const recordingState    = useHMSStore(selectRecordingState)

  const [joining, setJoining]                   = useState(false)
  const [screenShareErr, setScreenShareErr]     = useState('')
  const [recordingLoading, setRecordingLoading] = useState(false)
  const [toast, setToast]                       = useState('')

  const isRecording =
    recordingState?.server?.running ||
    recordingState?.browser?.running ||
    recordingState?.hls?.running

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3500)
  }

  useEffect(() => {
    onInCallChange(isConnected)
    return () => onInCallChange(false)
  }, [isConnected, onInCallChange])

  useEffect(() => () => { if (isConnected) hmsActions.leave() }, [isConnected, hmsActions])

  // Notify when recording starts from another peer
  const prevRecording = useRef(isRecording)
  useEffect(() => {
    if (!prevRecording.current && isRecording) showToast('🔴 Recording started')
    if (prevRecording.current && !isRecording) showToast('⏹ Recording stopped')
    prevRecording.current = isRecording
  }, [isRecording])

  const joinRoom = async () => {
    setJoining(true)
    try {
      const { data, error } = await supabase.functions.invoke('smooth-action', {
        body: { roomId, role: 'host', userId: user.id, userName: user.displayName || user.name }
      })
      if (error) throw error
      await hmsActions.join({ userName: user.displayName || user.name, authToken: data.token })
    } catch (err) {
      if (err.name === 'DeviceInUse') {
        alert('Your camera/mic is in use by another app.')
      } else {
        console.error('Failed to join:', err)
      }
    }
    setJoining(false)
  }

  const leaveRoom = async () => {
    if (isScreenSharing) await hmsActions.setScreenShareEnabled(false)
    await hmsActions.leave()
    onLeave()
  }

  const toggleScreenShare = async () => {
    setScreenShareErr('')
    try {
      await hmsActions.setScreenShareEnabled(!isScreenSharing)
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setScreenShareErr('Screen share permission denied.')
      } else {
        setScreenShareErr('Could not start screen share.')
      }
    }
  }

  // Toggle server-side recording via Supabase edge function
  const toggleRecording = async () => {
    setRecordingLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('smooth-action', {
        body: {
          recording:   true,
          action:      isRecording ? 'stop' : 'start',
          roomId,
          chatRoomId,                      // so webhook knows where to post the link
          userId:      user.id,
        }
      })
      if (error) throw error
      if (!isRecording) {
        showToast('🔴 Recording started — link will appear in chat when done')
      } else {
        showToast('⏹ Recording stopped — processing, link coming soon')
      }
    } catch (err) {
      console.error('Recording toggle failed:', err)
      showToast('❌ Recording failed. Check your 100ms plan.')
    }
    setRecordingLoading(false)
  }

  if (!isConnected) {
    return (
      <div className="video-join">
        <img src="/SillySausageBruno-removebg-preview.png" alt="Bruno" className="chat-bruno" />
        <h2>Room: <code>{roomId}</code></h2>
        <p>Bruno has reserved your seat. Don't keep him waiting.</p>
        <button className="btn-primary" onClick={joinRoom} disabled={joining}>
          {joining ? 'Joining...' : '📹 Join Video Call'}
        </button>
        <button className="btn-secondary" onClick={onLeave} style={{ marginTop: '1rem' }}>
          ← Back
        </button>
      </div>
    )
  }

  const isAnySharingScreen = !!screenSharingPeer

  return (
    <div className="video-room">

      {/* ── Top bar: recording indicator + screen share banner ── */}
      <div className="video-top-bar">
        <RecordingIndicator />
        {isScreenSharing && (
          <div className="screen-share-banner">
            🖥️ You are sharing your screen
            <button className="screen-share-stop-btn" onClick={toggleScreenShare}>Stop sharing</button>
          </div>
        )}
      </div>

      {/* ── Video grid ── */}
      <div className={`video-grid ${isAnySharingScreen ? 'has-screenshare' : ''}`}>
        {screenSharingPeer && <ScreenShareTile peer={screenSharingPeer} />}
        {peers.map(peer => (
          <VideoTile key={peer.id} peer={peer} avatarUrl={peerAvatars[peer.name] || null} />
        ))}
      </div>

      {screenShareErr && <div className="screen-share-error">{screenShareErr}</div>}

      {/* ── Toast notification ── */}
      {toast && <div className="call-toast">{toast}</div>}

      {/* ── Controls ── */}
      <div className="video-controls">
        <button
          className={`ctrl-btn ${isAudioOn ? 'on' : 'off'}`}
          onClick={() => hmsActions.setLocalAudioEnabled(!isAudioOn)}
          title={isAudioOn ? 'Mute mic' : 'Unmute mic'}
        >
          {isAudioOn ? '🎤' : '🔇'}
        </button>
        <button
          className={`ctrl-btn ${isVideoOn ? 'on' : 'off'}`}
          onClick={() => hmsActions.setLocalVideoEnabled(!isVideoOn)}
          title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
        >
          {isVideoOn ? '📷' : '🚫'}
        </button>
        <button
          className={`ctrl-btn ${isScreenSharing ? 'screen-sharing' : 'on'}`}
          onClick={toggleScreenShare}
          title={isScreenSharing ? 'Stop sharing screen' : 'Share your screen'}
        >
          {isScreenSharing ? '🛑' : '🖥️'}
        </button>

        {/* ── Record Button ── */}
        <button
          className={`ctrl-btn ${isRecording ? 'recording' : 'on'}`}
          onClick={toggleRecording}
          disabled={recordingLoading}
          title={isRecording ? 'Stop recording' : 'Start recording'}
        >
          {recordingLoading ? '⏳' : isRecording ? '⏹' : '⏺'}
        </button>

        <CallChatPanel user={user} />
        <button className="ctrl-btn leave" onClick={leaveRoom}>🚪 Leave</button>
      </div>
    </div>
  )
}

// ─── Friends Panel ────────────────────────────────────────────────────────────

function FriendsPanel({ user, onOpenDM }) {
  const [friends, setFriends]     = useState([])
  const [pending, setPending]     = useState([])
  const [searchQ, setSearchQ]     = useState('')
  const [searchRes, setSearchRes] = useState([])
  const [searching, setSearching] = useState(false)
  const [profiles, setProfiles]   = useState({})

  const loadFriendData = useCallback(async () => {
    const { data: rows } = await supabase
      .from('friends').select('*').or(`requester.eq.${user.id},addressee.eq.${user.id}`)
    if (!rows) return
    const accepted = rows.filter(r => r.status === 'accepted')
    const incoming = rows.filter(r => r.status === 'pending' && r.addressee === user.id)
    const ids = [...new Set([
      ...accepted.map(r => r.requester === user.id ? r.addressee : r.requester),
      ...incoming.map(r => r.requester),
    ])]
    if (ids.length) {
      const { data: profs } = await supabase
        .from('profiles').select('id, display_name, avatar_url, is_online').in('id', ids)
      const map = {}
      profs?.forEach(p => { map[p.id] = p })
      setProfiles(map)
    }
    setFriends(accepted)
    setPending(incoming)
  }, [user.id])

  useEffect(() => {
    loadFriendData()
    const ch = supabase.channel('friends-panel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friends' }, loadFriendData)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [loadFriendData])

  const search = async () => {
    if (!searchQ.trim()) return
    setSearching(true)
    const { data } = await supabase.from('profiles')
      .select('id, display_name, avatar_url').ilike('display_name', `%${searchQ}%`).neq('id', user.id).limit(8)
    setSearchRes(data || [])
    setSearching(false)
  }

  const sendRequest   = async (toId) => {
    await supabase.from('friends').insert({ requester: user.id, addressee: toId, status: 'pending' })
    setSearchRes(prev => prev.filter(p => p.id !== toId))
  }
  const acceptRequest = async (row) => {
    await supabase.from('friends').update({ status: 'accepted' }).eq('id', row.id)
    loadFriendData()
  }
  const declineRequest = async (row) => {
    await supabase.from('friends').delete().eq('id', row.id)
    loadFriendData()
  }

  return (
    <div className="friends-panel">
      {pending.length > 0 && (
        <div className="friends-section">
          <div className="friends-section-title">Pending ({pending.length})</div>
          {pending.map(row => {
            const p = profiles[row.requester]
            return (
              <div key={row.id} className="friend-row">
                <Avatar url={p?.avatar_url} name={p?.display_name} size={34} />
                <span className="friend-name">{p?.display_name || '...'}</span>
                <button className="friend-accept-btn" onClick={() => acceptRequest(row)}>✓</button>
                <button className="friend-decline-btn" onClick={() => declineRequest(row)}>✕</button>
              </div>
            )
          })}
        </div>
      )}
      <div className="friends-section">
        <div className="friends-section-title">Friends ({friends.length})</div>
        {friends.length === 0 && <p className="sidebar-empty">No friends yet. Search to add some.</p>}
        {friends.map(row => {
          const oid = row.requester === user.id ? row.addressee : row.requester
          const p = profiles[oid]
          return (
            <div key={row.id} className="friend-row">
              <Avatar url={p?.avatar_url} name={p?.display_name} size={34} online={p?.is_online} />
              <span className="friend-name">{p?.display_name || '...'}</span>
              <button className="friend-dm-btn" onClick={() => onOpenDM(oid, p)}>💬</button>
            </div>
          )
        })}
      </div>
      <div className="friends-search">
        <input className="modal-input" placeholder="Search Nicktopians..." value={searchQ}
          onChange={e => setSearchQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} />
        <button className="btn-secondary" onClick={search} disabled={searching}>{searching ? '...' : 'Search'}</button>
        {searchRes.map(p => (
          <div key={p.id} className="friend-row">
            <Avatar url={p.avatar_url} name={p.display_name} size={34} />
            <span className="friend-name">{p.display_name}</span>
            <button className="friend-add-btn" onClick={() => sendRequest(p.id)}>+ Add</button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Chat Room View ───────────────────────────────────────────────────────────

function ChatRoomView({ user, room, otherProfile, onBack, onJoinCall }) {
  const [messages, setMessages]             = useState([])
  const [input, setInput]                   = useState('')
  const [senderProfiles, setSenderProfiles] = useState({})
  const [memberCount, setMemberCount]       = useState(null)
  const [renaming, setRenaming]             = useState(false)
  const [renameVal, setRenameVal]           = useState(room.name || '')
  const [startingCall, setStartingCall]     = useState(false)
  const bottomRef = useRef()
  const inputRef  = useRef()

  const saveRename = async () => {
    if (!renameVal.trim()) return
    await supabase.from('chat_rooms').update({ name: renameVal.trim() }).eq('id', room.id)
    room.name = renameVal.trim()
    setRenaming(false)
  }

  const startCall = async () => {
    setStartingCall(true)
    try {
      const { data, error } = await supabase.functions.invoke('smooth-action', {
        body: { createRoom: true, templateId: TEMPLATE_ID }
      })
      if (error) throw error
      await supabase.from('messages').insert({
        room_id: room.id, sender_id: user.id, content: data.roomId, type: 'call',
      })
      onJoinCall(data.roomId, room.id)  // pass chat room id for recording webhook
    } catch (err) { console.error('Failed to start call:', err) }
    setStartingCall(false)
  }

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('messages').select('*')
        .eq('room_id', room.id).order('created_at', { ascending: true }).limit(100)
      setMessages(data || [])
      if (room.is_group) {
        const { count } = await supabase.from('room_members')
          .select('*', { count: 'exact', head: true }).eq('room_id', room.id)
        setMemberCount(count)
      }
      const ids = [...new Set((data || []).map(m => m.sender_id))]
      if (ids.length) {
        const { data: profs } = await supabase.from('profiles')
          .select('id, display_name, avatar_url').in('id', ids)
        const map = {}
        profs?.forEach(p => { map[p.id] = p })
        setSenderProfiles(map)
      }
    }
    load()
    const ch = supabase.channel(`room-${room.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${room.id}` },
        async (payload) => {
          const msg = payload.new
          setMessages(prev => [...prev, msg])
          if (!senderProfiles[msg.sender_id]) {
            const { data } = await supabase.from('profiles')
              .select('id, display_name, avatar_url').eq('id', msg.sender_id).single()
            if (data) setSenderProfiles(prev => ({ ...prev, [data.id]: data }))
          }
        })
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [room.id])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async () => {
    const text = input.trim()
    if (!text) return
    setInput('')
    await supabase.from('messages').insert({ room_id: room.id, sender_id: user.id, content: text })
    inputRef.current?.focus()
  }

  const roomName = room.is_group
    ? (room.name || 'Group Chat')
    : (otherProfile?.display_name || (user.id === room.created_by ? room.dm_name : room.dm_name_reverse) || 'DM')

  return (
    <div className="chat-room-view">
      <div className="chat-room-header">
        <button className="chat-back-btn" onClick={onBack}>←</button>
        {!room.is_group && otherProfile && <Avatar url={otherProfile.avatar_url} name={otherProfile.display_name} size={34} />}
        {room.is_group && <span className="chat-room-icon">👥</span>}
        <div style={{ flex: 1 }}>
          {room.is_group && renaming ? (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input className="profile-name-input" value={renameVal}
                onChange={e => setRenameVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveRename()} autoFocus />
              <button className="profile-save-btn" onClick={saveRename}>Save</button>
              <button className="profile-cancel-btn" onClick={() => setRenaming(false)}>Cancel</button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="chat-room-name">{roomName}</span>
              {room.is_group && <button className="profile-edit-btn" onClick={() => setRenaming(true)}>✏️</button>}
            </div>
          )}
          {!room.is_group && otherProfile && <span className="chat-room-sub">Direct Message</span>}
          {room.is_group && !renaming && <span className="chat-room-sub">Group · {memberCount ?? '...'} members</span>}
        </div>
        <button className="chat-call-btn" onClick={startCall} disabled={startingCall} title="Start video call">
          {startingCall ? '⏳ Starting...' : '📹 Video Call'}
        </button>
      </div>

      <div className="chat-messages-area">
        {messages.length === 0 && (
          <div className="chat-msgs-empty">
            <img src="/SillySausageBruno-removebg-preview.png" alt="Bruno" style={{ width: 80, opacity: 0.5 }} />
            <p>No messages yet. Break the silence.</p>
          </div>
        )}
        {messages.map((msg, i) => {
          const mine    = msg.sender_id === user.id
          const profile = senderProfiles[msg.sender_id]
          const prev    = messages[i - 1]
          const grouped = prev && prev.sender_id === msg.sender_id &&
            (new Date(msg.created_at) - new Date(prev.created_at)) < 120000
          return (
            <div key={msg.id} className={`chat-msg-row ${mine ? 'mine' : 'theirs'} ${grouped ? 'grouped' : ''}`}>
              {!grouped && !mine && <Avatar url={profile?.avatar_url} name={profile?.display_name} size={28} />}
              {grouped && !mine && <div style={{ width: 28 }} />}
              <div className="chat-msg-bubble-wrap">
                {!grouped && !mine && <span className="chat-msg-sender">{profile?.display_name || '...'}</span>}
                {msg.type === 'recording' ? (() => {
                  let rec = {}
                  try { rec = JSON.parse(msg.content) } catch {}
                  return (
                    <div className="chat-recording-card">
                      <span>🎬</span>
                      <div>
                        <span className="chat-call-card-title">Call Recording</span>
                        <span className="chat-call-card-sub">{new Date(rec.recordedAt).toLocaleString()}</span>
                      </div>
                      <a href={rec.url} target="_blank" rel="noreferrer" className="chat-call-join-btn">
                        ⬇ Download
                      </a>
                    </div>
                  )
                })() : msg.type === 'call' ? (
                  <div className="chat-call-card">
                    <span>📹</span>
                    <div>
                      <span className="chat-call-card-title">Video Call</span>
                      <span className="chat-call-card-sub">{mine ? 'You started a call' : `${profile?.display_name || '...'} started a call`}</span>
                    </div>
                    <button className="chat-call-join-btn" onClick={() => onJoinCall(msg.content)}>Join</button>
                  </div>
                ) : (
                  <div className="chat-msg-bubble">{msg.content}</div>
                ) }
                {!grouped && <span className="chat-msg-time">{timeAgo(msg.created_at)}</span>}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-row">
        <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()} placeholder={`Message ${roomName}...`} />
        <button className="chat-send-btn" onClick={send} disabled={!input.trim()}>➤</button>
      </div>
    </div>
  )
}

// ─── Group Room Creator ───────────────────────────────────────────────────────

function CreateGroupModal({ user, onCreated, onClose }) {
  const [name, setName]                       = useState('')
  const [selected, setSelected]               = useState([])
  const [creating, setCreating]               = useState(false)
  const [localFriends, setLocalFriends]       = useState([])
  const [localProfiles, setLocalProfiles]     = useState({})
  const [error, setError]                     = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: rows } = await supabase.from('friends').select('*')
        .or(`requester.eq.${user.id},addressee.eq.${user.id}`).eq('status', 'accepted')
      if (!rows?.length) return
      setLocalFriends(rows)
      const ids = rows.map(r => r.requester === user.id ? r.addressee : r.requester)
      const { data: profs } = await supabase.from('profiles')
        .select('id, display_name, avatar_url').in('id', ids)
      const map = {}
      profs?.forEach(p => { map[p.id] = p })
      setLocalProfiles(map)
    }
    load()
  }, [user.id])

  const toggle = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const create = async () => {
    if (!name.trim()) return setError('Give your group a name.')
    if (selected.length === 0) return setError('Add at least one friend.')
    setCreating(true)
    try {
      const { data: room } = await supabase.from('chat_rooms')
        .insert({ name: name.trim(), is_group: true, created_by: user.id }).select().single()
      const members = [user.id, ...selected].map(uid => ({ room_id: room.id, user_id: uid }))
      await supabase.from('room_members').insert(members)
      onCreated(room)
    } catch { setError('Failed to create group.') }
    setCreating(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h3>New Group</h3>
        <input className="modal-input" placeholder="Group name..." value={name} onChange={e => setName(e.target.value)} />
        <div className="modal-sub">Add friends</div>
        <div className="modal-friend-list">
          {localFriends.length === 0 && <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>No friends yet.</p>}
          {localFriends.map(row => {
            const oid = row.requester === user.id ? row.addressee : row.requester
            const p = localProfiles[oid]
            return (
              <div key={oid} className={`modal-friend-item ${selected.includes(oid) ? 'sel' : ''}`} onClick={() => toggle(oid)}>
                <input type="checkbox" checked={selected.includes(oid)} readOnly />
                <Avatar url={p?.avatar_url} name={p?.display_name} size={28} />
                {p?.display_name || '...'}
              </div>
            )
          })}
        </div>
        {error && <p style={{ color: '#e74c3c', fontSize: '0.82rem', marginBottom: '0.75rem' }}>{error}</p>}
        <div className="modal-btns">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={create} disabled={creating}>{creating ? 'Creating...' : 'Create Group'}</button>
        </div>
      </div>
    </div>
  )
}

// ─── Chat Lobby / Main ────────────────────────────────────────────────────────

function ChatLobby({ user, onJoinRoom, avatarUrl, onInCallChange }) {
  const [tab, setTab]                   = useState('chats')
  const [rooms, setRooms]               = useState([])
  const [friends, setFriends]           = useState([])
  const [profiles, setProfiles]         = useState({})
  const [dmProfiles, setDmProfiles]     = useState({})
  const [activeRoom, setActiveRoom]     = useState(null)
  const [otherProfile, setOtherProfile] = useState(null)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [callRoomId, setCallRoomId]     = useState('')
  const [creating, setCreating]         = useState(false)

  useEffect(() => {
    const markOnline = () =>
      supabase.from('profiles').upsert({ id: user.id, is_online: true, last_seen: new Date().toISOString() })
    markOnline()
    const t = setInterval(markOnline, 30000)
    const markOffline = () =>
      supabase.from('profiles').upsert({ id: user.id, is_online: false, last_seen: new Date().toISOString() })
    window.addEventListener('beforeunload', markOffline)
    return () => { clearInterval(t); markOffline(); window.removeEventListener('beforeunload', markOffline) }
  }, [user.id])

  const loadRooms = useCallback(async () => {
    const { data: memberships } = await supabase.from('room_members').select('room_id').eq('user_id', user.id)
    if (!memberships?.length) return setRooms([])
    const roomIds = memberships.map(m => m.room_id)
    const { data: roomData } = await supabase.from('chat_rooms').select('*')
      .in('id', roomIds).order('created_at', { ascending: false })
    setRooms(roomData || [])
    const dmRooms = (roomData || []).filter(r => !r.is_group)
    if (dmRooms.length) {
      const { data: allMembers } = await supabase.from('room_members')
        .select('room_id, user_id').in('room_id', dmRooms.map(r => r.id))
      const otherIds = {}
      allMembers?.forEach(m => { if (m.user_id !== user.id) otherIds[m.room_id] = m.user_id })
      const uniqueIds = [...new Set(Object.values(otherIds))]
      if (uniqueIds.length) {
        const { data: profs } = await supabase.from('profiles')
          .select('id, display_name, avatar_url').in('id', uniqueIds)
        const profileMap = {}
        profs?.forEach(p => { profileMap[p.id] = p })
        const dmProfileMap = {}
        Object.entries(otherIds).forEach(([roomId, userId]) => { dmProfileMap[roomId] = profileMap[userId] })
        setDmProfiles(dmProfileMap)
      }
    }
  }, [user.id])

  const loadFriends = useCallback(async () => {
    const { data: rows } = await supabase.from('friends').select('*')
      .or(`requester.eq.${user.id},addressee.eq.${user.id}`).eq('status', 'accepted')
    setFriends(rows || [])
    const ids = [...new Set((rows || []).map(r => r.requester === user.id ? r.addressee : r.requester))]
    if (ids.length) {
      const { data: profs } = await supabase.from('profiles')
        .select('id, display_name, avatar_url, is_online, last_seen').in('id', ids)
      const map = {}
      profs?.forEach(p => { map[p.id] = p })
      setProfiles(map)
    }
  }, [user.id])

  useEffect(() => {
    loadRooms(); loadFriends()
    const ch = supabase.channel('lobby-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'room_members' }, loadRooms)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, loadRooms)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, (payload) => {
        setProfiles(prev => ({ ...prev, [payload.new.id]: payload.new }))
      })
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [loadRooms, loadFriends])

  const openDM = async (otherId, profile) => {
    const { data: roomId } = await supabase.rpc('get_or_create_dm', { other_user: otherId })
    const room = { id: roomId, is_group: false, otherName: profile?.display_name }
    setOtherProfile(profile); setActiveRoom(room); setTab('chats')
    await loadRooms()
  }

  const handleGroupCreated = async (room) => {
    setShowCreateGroup(false); await loadRooms(); setOtherProfile(null); setActiveRoom(room)
  }

  const createCall = async () => {
    setCreating(true)
    try {
      const { data, error } = await supabase.functions.invoke('smooth-action', {
        body: { createRoom: true, templateId: TEMPLATE_ID }
      })
      if (error) throw error
      onJoinRoom(data.roomId)
    } catch (err) { console.error('Failed to create room:', err) }
    setCreating(false)
  }

  const onlineFriendCount = friends.filter(r => {
    const oid = r.requester === user.id ? r.addressee : r.requester
    return profiles[oid]?.is_online
  }).length

  if (activeRoom) {
    return (
      <ChatRoomView user={user} room={activeRoom} otherProfile={otherProfile}
        onBack={() => setActiveRoom(null)} onJoinCall={(roomId, chatRoomId) => onJoinRoom(roomId, chatRoomId)} />
    )
  }

  return (
    <div className="chat-lobby-v2">
      <div className="chat-sidebar">
        <div className="chat-sidebar-user">
          <Avatar url={avatarUrl} name={user.displayName || user.name} size={40} online />
          <div>
            <span className="csu-name">{user.displayName || user.name}</span>
            <span className="csu-status">🟢 Online</span>
          </div>
        </div>
        <div className="chat-sidebar-tabs">
          <button className={`cst-btn ${tab === 'chats' ? 'active' : ''}`} onClick={() => setTab('chats')}>💬 Chats</button>
          <button className={`cst-btn ${tab === 'friends' ? 'active' : ''}`} onClick={() => setTab('friends')}>
            👥 Friends {onlineFriendCount > 0 && <span className="badge-sm">{onlineFriendCount}</span>}
          </button>
          <button className={`cst-btn ${tab === 'call' ? 'active' : ''}`} onClick={() => setTab('call')}>📹 Video</button>
        </div>
        {tab === 'chats' && (
          <div className="chat-sidebar-rooms">
            <div className="chat-rooms-header">
              <span>Conversations</span>
              <button className="icon-btn" onClick={() => setShowCreateGroup(true)} title="New Group">＋</button>
            </div>
            {rooms.length === 0 && <p className="sidebar-empty">No chats yet. Message a friend to start.</p>}
            {rooms.map(room => {
              const dmProfile = !room.is_group ? dmProfiles[room.id] : null
              const roomName = room.is_group
                ? (room.name || 'Group')
                : (dmProfile?.display_name || (user.id === room.created_by ? room.dm_name : room.dm_name_reverse) || 'DM')
              const dmAvatar = user.id === room.created_by ? room.dm_avatar : room.dm_avatar_reverse
              return (
                <button key={room.id} className="room-list-item"
                  onClick={() => { setActiveRoom(room); setOtherProfile(dmProfile || null) }}>
                  {room.is_group ? <span className="room-list-icon">👥</span> : <Avatar url={dmAvatar} name={roomName} size={32} />}
                  <span className="room-list-name">{roomName}</span>
                </button>
              )
            })}
          </div>
        )}
        {tab === 'friends' && <FriendsPanel user={user} onOpenDM={openDM} />}
        {tab === 'call' && (
          <div className="chat-call-tab">
            <p className="call-tab-sub">Start or join a video call. Bruno cannot attend — no thumbs.</p>
            <button className="btn-primary" onClick={createCall} disabled={creating}>
              {creating ? 'Creating...' : '📹 Start Call'}
            </button>
            <div className="call-join-divider">or join an existing room</div>
            <input className="room-input" placeholder="Room ID..." value={callRoomId} onChange={e => setCallRoomId(e.target.value)} />
            <button className="btn-secondary" style={{ marginTop: '0.75rem', width: '100%' }}
              onClick={() => onJoinRoom(callRoomId)} disabled={!callRoomId}>
              Join Call
            </button>
          </div>
        )}
      </div>
      <div className="chat-main-empty">
        <img src="/SillySausageBruno-removebg-preview.png" alt="Bruno" className="chat-main-bruno" />
        <h2>Nickchat</h2>
        <p>Select a conversation or start a new one.<br />Bruno is standing by.</p>
      </div>
      {showCreateGroup && (
        <CreateGroupModal user={user} onCreated={handleGroupCreated} onClose={() => setShowCreateGroup(false)} />
      )}
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function Nickchat({ user, avatarUrl, onAvatarUpdate, onInCallChange }) {
  const [activeCallRoom, setActiveCallRoom] = useState(null)
  const [activeChatRoom, setActiveChatRoom] = useState(null)  // tracks which chat room started the call
  const [peerAvatars, setPeerAvatars]       = useState({})

  useEffect(() => {
    if (avatarUrl) {
      const name = user.displayName || user.name
      setPeerAvatars(prev => ({ ...prev, [name]: avatarUrl }))
    }
  }, [avatarUrl, user.displayName, user.name])

  const handleJoinRoom = (roomId, chatRoomId = null) => {
    setActiveCallRoom(roomId)
    setActiveChatRoom(chatRoomId)
  }

  return (
    <HMSRoomProvider>
      <div className="nickchat">
        {activeCallRoom ? (
          <VideoRoom
            user={user}
            roomId={activeCallRoom}
            chatRoomId={activeChatRoom}
            onLeave={() => { setActiveCallRoom(null); setActiveChatRoom(null); onInCallChange(false) }}
            peerAvatars={peerAvatars}
            onInCallChange={onInCallChange}
          />
        ) : (
          <ChatLobby
            user={user}
            onJoinRoom={handleJoinRoom}
            avatarUrl={avatarUrl}
            onInCallChange={onInCallChange}
          />
        )}
      </div>
    </HMSRoomProvider>
  )
}