import  { useState } from 'react';
import './Message.css';

// Main Message Component
const Message = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const conversations = [
    {
      id: 1,
      name: 'Công Thiện',
      avatar: 'https://via.placeholder.com/50',
      lastMessage: 'add vô home đi',
      timestamp: '20 phút',
      lastActive: '6 phút',
      unread: true,
      messages: [
        { senderId: 'user1', text: 'Chỉ cái list card đó', timestamp: '1:30 PM' },
        { senderId: 'user2', text: 'Ừ nó đó', timestamp: '1:31 PM' },
        { senderId: 'user2', text: 'add vô home đi', timestamp: '1:32 PM' },
      ],
    },
    // More conversations can be added here...
  ];

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;
    const updatedMessages = [
      ...selectedConversation.messages,
      { senderId: 'currentUser', text: newMessage, timestamp: 'Just now' },
    ];
    setSelectedConversation({ ...selectedConversation, messages: updatedMessages });
    setNewMessage('');
  };

  const filteredConversations = conversations.filter(conversation =>
    conversation.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="message-container">
      {/* Chat Sidebar */}
      <div className="message-sidebar">
        <h2>Đoạn chat</h2>
        <input
          type="text"
          placeholder="Tìm kiếm trên Messenger"
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="conversation-list">
          {filteredConversations.map((conversation, index) => (
            <div
              key={index}
              className={`conversation-item ${conversation.unread ? 'unread' : ''}`}
              onClick={() => handleSelectConversation(conversation)}
            >
              <img src={conversation.avatar} alt={conversation.name} className="conversation-avatar" />
              <div className="conversation-info">
                <h3>{conversation.name}</h3>
                <p>{conversation.lastMessage}</p>
                <small>{conversation.timestamp}</small>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      {selectedConversation ? (
        <div className="chat-window">
          <div className="chat-header">
            <img src={selectedConversation.avatar} alt={selectedConversation.name} className="header-avatar" />
            <div>
              <h3>{selectedConversation.name}</h3>
              <p>Hoạt động {selectedConversation.lastActive} trước</p>
            </div>
          </div>

          <div className="chat-messages">
            {selectedConversation.messages.map((msg, index) => (
              <div key={index} className={`message-bubble ${msg.senderId === 'currentUser' ? 'sent' : 'received'}`}>
                <p>{msg.text}</p>
                <span>{msg.timestamp}</span>
              </div>
            ))}
          </div>

          <div className="chat-input">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Aa"
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      ) : (
        <div className="chat-placeholder">Select a conversation to start chatting</div>
      )}
    </div>
  );
};

export default Message;
