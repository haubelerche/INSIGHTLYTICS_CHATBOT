import React, { useState } from 'react';
// Using a small arrow icon from react-icons gives a familiar send affordance.
// Install with: npm install react-icons
import { FiArrowRight } from 'react-icons/fi';
import { SendIcon } from './icons/SendIcon';


export const ChatInput = ({ onSendMessage, isLoading }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onSendMessage(text.trim());
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="chat-input" style={{display:'flex',gap:8,alignItems:'center'}}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ask for a product review..."
        disabled={isLoading}
        style={{flex:1,padding:'10px 20px',borderRadius:999,background:'#111e46ff',border:'1px solid #334155',color:'#fff'}}
      />
      <button
        type="submit"
        disabled={isLoading || !text.trim()}
        aria-label="Send message"
        title="Send"
        style={{
          background:'#0ea5e9',
          border:'none',
          padding:10,
          borderRadius:999,
          display:'inline-flex',
          alignItems:'center',
          justifyContent:'center',
          cursor: isLoading || !text.trim() ? 'not-allowed' : 'pointer',
          opacity: isLoading || !text.trim() ? 0.6 : 1
        }}
      >
        {/* arrow icon from react-icons */}
        <FiArrowRight style={{color:'#072033'}} size={18} />
      </button>
    </form>
  );
};

export default ChatInput;
