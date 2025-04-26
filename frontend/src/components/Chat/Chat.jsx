import { useState, useEffect, useRef } from 'react';
import { useGame } from '../../contexts/GameContext';

const Chat = () => {
  const [message, setMessage] = useState('');
  const [channel, setChannel] = useState('global');
  const { chatMessages, sendChatMessage } = useGame();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      sendChatMessage(message.trim(), channel);
      setMessage('');
    }
  };

  const getChannelColor = (channel) => {
    switch (channel) {
      case 'global':
        return 'text-green-400';
      case 'local':
        return 'text-blue-400';
      case 'whisper':
        return 'text-purple-400';
      case 'party':
        return 'text-yellow-400';
      case 'guild':
        return 'text-orange-400';
      default:
        return 'text-white';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex gap-2 mb-2">
        {['global', 'local', 'party', 'guild'].map((ch) => (
          <button
            key={ch}
            onClick={() => setChannel(ch)}
            className={`px-3 py-1 rounded ${
              channel === ch ? 'bg-game-accent' : 'bg-game-primary'
            } capitalize`}
          >
            {ch}
          </button>
        ))}
      </div>

      <div className="flex-1 bg-game-primary rounded-lg p-2 overflow-y-auto">
        {chatMessages.map((msg, index) => (
          <div key={index} className="mb-1">
            <span className={`${getChannelColor(msg.channel)} font-bold`}>
              [{msg.channel}]
            </span>
            <span className="text-game-gold ml-2">{msg.sender.name}:</span>
            <span className="ml-2">{msg.message}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="mt-2 flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="game-input flex-1"
          placeholder={`Send message to ${channel}...`}
          maxLength={255}
        />
        <button type="submit" className="game-button">
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;