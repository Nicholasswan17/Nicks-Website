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
  const hmsActions = useHMSActions()
  const messages   = useHMSStore(selectHMSMessages)
  const [input, setInput]       = useState('')
  const [open, setOpen]         = useState(false)
  const [unread, setUnread]     = useState(0)
  const bottomRef               = useRef()
  const prevCountRef            = useRef(messages.length)

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

function VideoRoom({ user, roomId, onLeave, peerAvatars, onInCallChange }) {
  const hmsActions  = useHMSActions()
  const isConnected = useHMSStore(selectIsConnectedToRoom)
  const peers       = useHMSStore(selectPeers)
  const isAudioOn   = useHMSStore(selectIsLocalAudioEnabled)
  const isVideoOn   = useHMSStore(selectIsLocalVideoEnabled)
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    onInCallChange(isConnected)
    return () => onInCallChange(false)
  }, [isConnected, onInCallChange])

  useEffect(() => () => { if (isConnected) hmsActions.leave() }, [isConnected, hmsActions])

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
    await hmsActions.leave()
    onLeave()
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

  return (
    <div className="video-room">
      <div className="video-grid">
        {peers.map(peer => (
          <VideoTile key={peer.id} peer={peer} avatarUrl={peerAvatars[peer.name] || null} />
        ))}
      </div>
      <div className="video-controls">
        <button className={`ctrl-btn ${isAudioOn ? 'on' : 'off'}`} onClick={() => hmsActions.setLocalAudioEnabled(!isAudioOn)}>
          {isAudioOn ? '🎤' : '🔇'}
        </button>
        <button className={`ctrl-btn ${isVideoOn ? 'on' : 'off'}`} onClick={() => hmsActions.setLocalVideoEnabled(!isVideoOn)}>
          {isVideoOn ? '📷' : '🚫'}
        </button>
        <CallChatPanel user={user} />
        <button className="ctrl-btn leave" onClick={leaveRoom}>🚪 Leave</button>
      </div>
    </div>
  )
}

// ─── Friends Panel ────────────────────────────────────────────────────────────

function FriendsPanel({ user, onOpenDM }) {
  const [friends, setFriends]         = useState([])
  const [pending, setPending]         = useState([])   // incoming requests
  const [searchQ, setSearchQ]         = useState('')
  const [searchRes, setSearchRes]     = useState([])
  const [searching, setSearching]     = useState(false)
  const [profiles, setProfiles]       = useState({})   // userId → profile

  const loadFriendData = useCallback(async () => {
    // All friend rows
    const { data: rows } = await supabase
      .from('friends')
      .select('*')
      .or(`requester.eq.${user.id},addressee.eq.${user.id}`)

    if (!rows) return

    const accepted  = rows.filter(r => r.status === 'accepted')
    const incoming  = rows.filter(r => r.status === 'pending' && r.addressee === user.id)

    // Collect unique other-user IDs to fetch profiles for
    const ids = [...new Set([
      ...accepted.map(r => r.requester === user.id ? r.addressee : r.requester),
      ...incoming.map(r => r.requester),
    ])]

    if (ids.length) {
      const { data: profs } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, is_online, last_seen')
        .in('id', ids)

      const map = {}
      profs?.forEach(p => { map[p.id] = p })
      setProfiles(map)
    }

    setFriends(accepted)
    setPending(incoming)
  }, [user.id])

  useEffect(() => {
    loadFriendData()

    // Realtime: refresh on any friend change
    const ch = supabase.channel('friends-panel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friends' }, loadFriendData)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, (payload) => {
        setProfiles(prev => ({ ...prev, [payload.new.id]: payload.new }))
      })
      .subscribe()

    return () => supabase.removeChannel(ch)
  }, [loadFriendData])

  const searchUsers = async (q) => {
    if (!q.trim()) { setSearchRes([]); return }
    setSearching(true)
    const { data } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url')
      .ilike('display_name', `%${q}%`)
      .neq('id', user.id)
      .limit(8)
    setSearchRes(data || [])
    setSearching(false)
  }

  const sendRequest = async (targetId) => {
    await supabase.from('friends').insert({ requester: user.id, addressee: targetId })
    setSearchRes(prev => prev.filter(u => u.id !== targetId))
  }

  const acceptRequest = async (rowId) => {
    await supabase.from('friends').update({ status: 'accepted' }).eq('id', rowId)
    loadFriendData()
  }

  const declineRequest = async (rowId) => {
    await supabase.from('friends').delete().eq('id', rowId)
    loadFriendData()
  }

  const removeFriend = async (row) => {
    await supabase.from('friends').delete().eq('id', row.id)
    loadFriendData()
  }

  return (
    <div className="friends-panel">
      {/* Search */}
      <div className="friends-search-wrap">
        <input
          className="friends-search"
          placeholder="🔍  Add friends by display name..."
          value={searchQ}
          onChange={e => { setSearchQ(e.target.value); searchUsers(e.target.value) }}
        />
        {searchRes.length > 0 && (
          <div className="friends-search-results">
            {searchRes.map(u => (
              <div key={u.id} className="friend-search-row">
                <Avatar url={u.avatar_url} name={u.display_name} size={32} />
                <span>{u.display_name}</span>
                <button className="friend-action-btn add" onClick={() => sendRequest(u.id)}>Add +</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending requests */}
      {pending.length > 0 && (
        <div className="friends-section">
          <h4 className="friends-section-title">
            Pending Requests <span className="badge">{pending.length}</span>
          </h4>
          {pending.map(row => {
            const p = profiles[row.requester]
            return (
              <div key={row.id} className="friend-row">
                <Avatar url={p?.avatar_url} name={p?.display_name} size={36} />
                <span className="friend-name">{p?.display_name || '...'}</span>
                <div className="friend-actions">
                  <button className="friend-action-btn accept" onClick={() => acceptRequest(row.id)}>✓</button>
                  <button className="friend-action-btn decline" onClick={() => declineRequest(row.id)}>✗</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Friends list */}
      <div className="friends-section">
        <h4 className="friends-section-title">
          Friends <span className="badge">{friends.length}</span>
        </h4>
        {friends.length === 0 && (
          <p className="friends-empty">No friends yet. Bruno is your only companion.</p>
        )}
        {friends.map(row => {
          const otherId = row.requester === user.id ? row.addressee : row.requester
          const p = profiles[otherId]
          return (
            <div key={row.id} className="friend-row">
              <Avatar url={p?.avatar_url} name={p?.display_name} size={36} online={p?.is_online} />
              <div className="friend-info">
                <span className="friend-name">{p?.display_name || '...'}</span>
                <span className="friend-status">
                  {p?.is_online ? '🟢 Online' : p?.last_seen ? `Last seen ${timeAgo(p.last_seen)}` : 'Offline'}
                </span>
              </div>
              <div className="friend-actions">
                <button className="friend-action-btn msg" onClick={() => onOpenDM(otherId, p)} title="Message">💬</button>
                <button className="friend-action-btn remove" onClick={() => removeFriend(row)} title="Remove">✗</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Chat Room View ───────────────────────────────────────────────────────────

function ChatRoomView({ user, room, onBack, otherProfile }) {
  const [messages, setMessages] = useState([])
  const [input, setInput]       = useState('')
  const [senderProfiles, setSenderProfiles] = useState({})
  const bottomRef               = useRef()
  const inputRef                = useRef()

  useEffect(() => {
    // Load history
    const load = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', room.id)
        .order('created_at', { ascending: true })
        .limit(100)

      setMessages(data || [])

      // Fetch profiles for all senders
      const ids = [...new Set((data || []).map(m => m.sender_id))]
      if (ids.length) {
        const { data: profs } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url')
          .in('id', ids)
        const map = {}
        profs?.forEach(p => { map[p.id] = p })
        setSenderProfiles(map)
      }
    }
    load()

    // Realtime subscribe
    const ch = supabase.channel(`room-${room.id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `room_id=eq.${room.id}`
      }, async (payload) => {
        const msg = payload.new
        setMessages(prev => [...prev, msg])
        // Fetch profile if unknown
        if (!senderProfiles[msg.sender_id]) {
          const { data } = await supabase
            .from('profiles')
            .select('id, display_name, avatar_url')
            .eq('id', msg.sender_id)
            .single()
          if (data) setSenderProfiles(prev => ({ ...prev, [data.id]: data }))
        }
      })
      .subscribe()

    return () => supabase.removeChannel(ch)
  }, [room.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    const text = input.trim()
    if (!text) return
    setInput('')
    await supabase.from('messages').insert({
      room_id: room.id,
      sender_id: user.id,
      content: text,
    })
    inputRef.current?.focus()
  }

  const roomName = room.is_group
    ? (room.name || 'Group Chat')
    : (otherProfile?.display_name || 'DM')

  return (
    <div className="chat-room-view">
      <div className="chat-room-header">
        <button className="chat-back-btn" onClick={onBack}>←</button>
        {!room.is_group && otherProfile && (
          <Avatar url={otherProfile.avatar_url} name={otherProfile.display_name} size={34} />
        )}
        {room.is_group && <span className="chat-room-icon">👥</span>}
        <div>
          <span className="chat-room-name">{roomName}</span>
          {!room.is_group && otherProfile && (
            <span className="chat-room-sub">Direct Message</span>
          )}
          {room.is_group && (
            <span className="chat-room-sub">Group · {room.memberCount || '?'} members</span>
          )}
        </div>
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
              {!mine && !grouped && (
                <Avatar url={profile?.avatar_url} name={profile?.display_name} size={28} />
              )}
              {!mine && grouped && <div style={{ width: 28 }} />}
              <div className="chat-msg-bubble-wrap">
                {!mine && !grouped && (
                  <span className="chat-msg-sender">{profile?.display_name || '...'}</span>
                )}
                <div className="chat-msg-bubble">{msg.content}</div>
                {!grouped && (
                  <span className="chat-msg-time">{timeAgo(msg.created_at)}</span>
                )}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-row">
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder={`Message ${roomName}...`}
        />
        <button className="chat-send-btn" onClick={send} disabled={!input.trim()}>➤</button>
      </div>
    </div>
  )
}

// ─── Group Room Creator ───────────────────────────────────────────────────────

function CreateGroupModal({ user, friends, profiles, onCreated, onClose }) {
  const [name, setName]         = useState('')
  const [selected, setSelected] = useState([])
  const [creating, setCreating] = useState(false)

  const toggle = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const create = async () => {
    if (!name.trim() || selected.length === 0) return
    setCreating(true)

    const { data: room } = await supabase
      .from('chat_rooms')
      .insert({ name: name.trim(), is_group: true, created_by: user.id })
      .select()
      .single()

    const members = [user.id, ...selected].map(uid => ({ room_id: room.id, user_id: uid }))
    await supabase.from('room_members').insert(members)

    onCreated(room)
    setCreating(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h3>Create Group Chat</h3>
        <input
          className="modal-input"
          placeholder="Group name..."
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <p className="modal-sub">Select friends to add:</p>
        <div className="modal-friend-list">
          {friends.map(row => {
            const otherId = row.requester === user.id ? row.addressee : row.requester
            const p = profiles[otherId]
            return (
              <label key={otherId} className={`modal-friend-item ${selected.includes(otherId) ? 'sel' : ''}`}>
                <input type="checkbox" checked={selected.includes(otherId)} onChange={() => toggle(otherId)} />
                <Avatar url={p?.avatar_url} name={p?.display_name} size={28} />
                <span>{p?.display_name || '...'}</span>
              </label>
            )
          })}
        </div>
        <div className="modal-btns">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={create} disabled={creating || !name.trim() || selected.length === 0}>
            {creating ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Chat Lobby / Main ────────────────────────────────────────────────────────

function ChatLobby({ user, onJoinRoom, avatarUrl, onInCallChange }) {
  const [tab, setTab]               = useState('chats')   // 'chats' | 'friends' | 'call'
  const [rooms, setRooms]           = useState([])
  const [friends, setFriends]       = useState([])
  const [profiles, setProfiles]     = useState({})
  const [activeRoom, setActiveRoom] = useState(null)
  const [otherProfile, setOtherProfile] = useState(null)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [callRoomId, setCallRoomId] = useState('')
  const [creating, setCreating]     = useState(false)

  // Heartbeat — mark user online
  useEffect(() => {
    const markOnline = () =>
      supabase.from('profiles').upsert({ id: user.id, is_online: true, last_seen: new Date().toISOString() })

    markOnline()
    const t = setInterval(markOnline, 30000)

    const markOffline = () =>
      supabase.from('profiles').upsert({ id: user.id, is_online: false, last_seen: new Date().toISOString() })

    window.addEventListener('beforeunload', markOffline)
    return () => {
      clearInterval(t)
      markOffline()
      window.removeEventListener('beforeunload', markOffline)
    }
  }, [user.id])

  const loadRooms = useCallback(async () => {
    // My room memberships
    const { data: memberships } = await supabase
      .from('room_members')
      .select('room_id')
      .eq('user_id', user.id)

    if (!memberships?.length) return setRooms([])

    const roomIds = memberships.map(m => m.room_id)

    const { data: roomData } = await supabase
      .from('chat_rooms')
      .select('*')
      .in('id', roomIds)
      .order('created_at', { ascending: false })

    setRooms(roomData || [])
  }, [user.id])

  const loadFriends = useCallback(async () => {
    const { data: rows } = await supabase
      .from('friends')
      .select('*')
      .or(`requester.eq.${user.id},addressee.eq.${user.id}`)
      .eq('status', 'accepted')

    setFriends(rows || [])

    const ids = [...new Set((rows || []).map(r =>
      r.requester === user.id ? r.addressee : r.requester
    ))]

    if (ids.length) {
      const { data: profs } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, is_online, last_seen')
        .in('id', ids)
      const map = {}
      profs?.forEach(p => { map[p.id] = p })
      setProfiles(map)
    }
  }, [user.id])

  useEffect(() => {
    loadRooms()
    loadFriends()

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
    const room = { id: roomId, is_group: false }
    setOtherProfile(profile)
    setActiveRoom(room)
    setTab('chats')
    await loadRooms()
  }

  const handleGroupCreated = async (room) => {
    setShowCreateGroup(false)
    await loadRooms()
    setOtherProfile(null)
    setActiveRoom(room)
  }

  const createCall = async () => {
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

  const onlineFriendCount = friends.filter(r => {
    const oid = r.requester === user.id ? r.addressee : r.requester
    return profiles[oid]?.is_online
  }).length

  if (activeRoom) {
    return (
      <ChatRoomView
        user={user}
        room={activeRoom}
        otherProfile={otherProfile}
        onBack={() => setActiveRoom(null)}
      />
    )
  }

  return (
    <div className="chat-lobby-v2">
      {/* Sidebar */}
      <div className="chat-sidebar">
        <div className="chat-sidebar-user">
          <Avatar url={avatarUrl} name={user.displayName || user.name} size={40} online />
          <div>
            <span className="csu-name">{user.displayName || user.name}</span>
            <span className="csu-status">🟢 Online</span>
          </div>
        </div>

        <div className="chat-sidebar-tabs">
          <button className={`cst-btn ${tab === 'chats' ? 'active' : ''}`} onClick={() => setTab('chats')}>
            💬 Chats
          </button>
          <button className={`cst-btn ${tab === 'friends' ? 'active' : ''}`} onClick={() => setTab('friends')}>
            👥 Friends
            {onlineFriendCount > 0 && <span className="badge-sm">{onlineFriendCount}</span>}
          </button>
          <button className={`cst-btn ${tab === 'call' ? 'active' : ''}`} onClick={() => setTab('call')}>
            📹 Video
          </button>
        </div>

        {/* Chats tab */}
        {tab === 'chats' && (
          <div className="chat-sidebar-rooms">
            <div className="chat-rooms-header">
              <span>Conversations</span>
              <button className="icon-btn" onClick={() => setShowCreateGroup(true)} title="New Group">＋</button>
            </div>
            {rooms.length === 0 && (
              <p className="sidebar-empty">No chats yet. Message a friend to start.</p>
            )}
            {rooms.map(room => {
              // For DMs, find the other member's profile
              const roomName = room.is_group
                ? (room.name || 'Group')
                : 'DM'
              return (
                <button
                  key={room.id}
                  className="room-list-item"
                  onClick={() => { setActiveRoom(room); setOtherProfile(null) }}
                >
                  <span className="room-list-icon">{room.is_group ? '👥' : '💬'}</span>
                  <span className="room-list-name">{roomName}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Friends tab */}
        {tab === 'friends' && (
          <FriendsPanel user={user} onOpenDM={openDM} />
        )}

        {/* Video tab */}
        {tab === 'call' && (
          <div className="chat-call-tab">
            <p className="call-tab-sub">Start or join a video call. Bruno cannot attend — no thumbs.</p>
            <button className="btn-primary" onClick={createCall} disabled={creating}>
              {creating ? 'Creating...' : '📹 Start Call'}
            </button>
            <div className="call-join-divider">or join an existing room</div>
            <input
              className="room-input"
              placeholder="Room ID..."
              value={callRoomId}
              onChange={e => setCallRoomId(e.target.value)}
            />
            <button
              className="btn-secondary"
              style={{ marginTop: '0.75rem', width: '100%' }}
              onClick={() => onJoinRoom(callRoomId)}
              disabled={!callRoomId}
            >
              Join Call
            </button>
          </div>
        )}
      </div>

      {/* Main area — empty state */}
      <div className="chat-main-empty">
        <img src="/SillySausageBruno-removebg-preview.png" alt="Bruno" className="chat-main-bruno" />
        <h2>Nickchat</h2>
        <p>Select a conversation or start a new one.<br />Bruno is standing by.</p>
      </div>

      {showCreateGroup && (
        <CreateGroupModal
          user={user}
          friends={friends}
          profiles={profiles}
          onCreated={handleGroupCreated}
          onClose={() => setShowCreateGroup(false)}
        />
      )}
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function Nickchat({ user, avatarUrl, onAvatarUpdate, onInCallChange }) {
  const [activeCallRoom, setActiveCallRoom] = useState(null)
  const [peerAvatars, setPeerAvatars]       = useState({})

  useEffect(() => {
    if (avatarUrl) {
      const name = user.displayName || user.name
      setPeerAvatars(prev => ({ ...prev, [name]: avatarUrl }))
    }
  }, [avatarUrl, user.displayName, user.name])

  return (
    <HMSRoomProvider>
      <div className="nickchat">
        {activeCallRoom ? (
          <VideoRoom
            user={user}
            roomId={activeCallRoom}
            onLeave={() => { setActiveCallRoom(null); onInCallChange(false) }}
            peerAvatars={peerAvatars}
            onInCallChange={onInCallChange}
          />
        ) : (
          <ChatLobby
            user={user}
            onJoinRoom={setActiveCallRoom}
            avatarUrl={avatarUrl}
            onInCallChange={onInCallChange}
          />
        )}
      </div>
    </HMSRoomProvider>
  )
}