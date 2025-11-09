import React, { useState, useRef, useEffect } from 'react';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';
import LoadingMessage from './LoadingMessage';
import ModelSelector from './ModelSelector';
import { askChatbot } from '../api/client';

let nextId = 1;

export const AskFormFixed = () => {
  const [messages, setMessages] = useState([
    { 
      id: nextId++, 
      sender: 'bot', 
      text: `Hey, I can give you insights about tech products based on real customer reviews on Tiki.` 
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini'); // Default model
  const [loadingTime, setLoadingTime] = useState(0);
  const abortControllerRef = useRef(null);

  const messagesRef = useRef(null);

  useEffect(() => {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages]);

  // Track loading time
  useEffect(() => {
    let interval;
    if (isLoading) {
      setLoadingTime(0);
      interval = setInterval(() => {
        setLoadingTime(prev => prev + 1);
      }, 1000);
    } else {
      setLoadingTime(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Clean up technical format from backend response
  const cleanBotResponse = (rawText) => {
    if (!rawText) return 'I could not find information about that product.';
    
    let cleaned = rawText;
    
    // Remove markdown analysis headers and technical sections
    cleaned = cleaned.replace(/# Analysis of Query Results[\s\S]*?(?=\*\*|\$\$|$)/gi, '');
    cleaned = cleaned.replace(/## Key Trends and Patterns[\s\S]*?(?=\*\*|\$\$|$)/gi, '');
    cleaned = cleaned.replace(/## Notable Insights[\s\S]*?(?=\*\*|\$\$|$)/gi, '');
    cleaned = cleaned.replace(/### Overall Ratings[\s\S]*?(?=\*\*|\$\$|$)/gi, '');
    cleaned = cleaned.replace(/### Review Titles[\s\S]*?(?=\*\*|\$\$|$)/gi, '');
    cleaned = cleaned.replace(/### Content Analysis[\s\S]*?(?=\*\*|\$\$|$)/gi, '');
    cleaned = cleaned.replace(/## Example Data[\s\S]*?```[\s\S]*?```/gi, '');
    cleaned = cleaned.replace(/## Conclusion[\s\S]*?(?=\*\*|\$\$|$)/gi, '');
    
    // Remove SQL query blocks
    cleaned = cleaned.replace(/\[SQL_QUERY\][\s\S]*?\[\/SQL_QUERY\]/gi, '');
    
    // Remove code blocks
    cleaned = cleaned.replace(/```[\s\S]*?```/g, '');
    
    // Remove bullet point numbers and clean list formatting
    cleaned = cleaned.replace(/^\d+\.\s+/gm, '- ');
    
    // Remove excessive newlines
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    cleaned = cleaned.trim();
    
    // Check if we have structured content
    const hasContent = cleaned.includes('**Pros:**') || 
                      cleaned.includes('**Cons:**') || 
                      cleaned.includes('**Key Features:**') ||
                      cleaned.includes('**Customer Sentiment:**');
    
    // If no structured content but has some text
    if (!hasContent && cleaned.length > 20) {
      // Check if it's just saying "no data found"
      if (cleaned.match(/no (data|reviews?|information) (found|available)/i)) {
        return 'Sorry, I could not find reviews for this product. Please try:\n- Enter the exact product name (e.g., "iPhone 15 Pro Max")\n- Check if the product exists on Tiki\n- Or try a different product';
      }
      
      // Return whatever meaningful content we have
      return cleaned;
    }
    
    // If completely empty or too short
    if (cleaned.length < 20) {
      return 'Sorry, the backend did not return data. Possible issues:\n- Backend not running (http://localhost:8000)\n- Product not in database\n- No reviews available for this product\n\nPlease check the console for detailed errors.';
    }
    
    return cleaned;
  };

  const handleCancelRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setMessages((s) => [...s, { 
      id: nextId++, 
      sender: 'bot', 
      text: '❌ Request cancelled. You can try again or switch to a different model.' 
    }]);
  };

  const handleSendMessage = async (text) => {
    const userMsg = { id: nextId++, sender: 'user', text };
    setMessages((s) => [...s, userMsg]);
    setIsLoading(true);
    setError(null);
    
    // Create abort controller for request cancellation
    abortControllerRef.current = new AbortController();
    
    try {
      console.log('User query:', text);
      console.log('Selected Model:', selectedModel);
      
      // Create a detailed analysis prompt for LLM with comprehensive insights
      const analysisPrompt = `You are an expert product review analyst for Tiki (Vietnamese e-commerce platform).

TASK: Provide a comprehensive, detailed analysis of customer reviews for "${text}".

INSTRUCTIONS:
1. Search the database for ALL reviews of "${text}" (product name can be in Vietnamese or English)
2. Carefully READ and ANALYZE every review - ratings, titles, content, sentiment
3. Extract deep insights and patterns from the data
4. Provide actionable information that helps customers make informed decisions

OUTPUT FORMAT (REQUIRED - Be detailed and specific):

**Product Overview:**
- Brief description of what customers are saying overall
- Average sentiment score and rating distribution

**Pros:**
- [Specific positive feature 1 with frequency/percentage if possible]
- [Specific positive feature 2 - mention how many customers praised this]
- [Specific positive feature 3 - include specific examples from reviews]
- [Add more if significant patterns found - aim for 5-7 points]

**Cons:**
- [Specific negative issue 1 with frequency/severity]
- [Specific negative issue 2 - mention impact on user experience]
- [Specific negative issue 3 - include specific complaints]
- [Add more if significant patterns found - aim for 4-6 points]

**Key Features Mentioned:**
- [Feature 1]: Customer feedback summary
- [Feature 2]: Customer feedback summary
- [Feature 3]: Customer feedback summary

**Customer Sentiment Analysis:**
- Overall satisfaction level (e.g., "85% highly satisfied")
- Main reasons for positive ratings
- Main reasons for negative ratings
- Who should buy this product?
- Who should avoid this product?

**Price & Value Assessment:**
- Is it worth the price according to customers?
- Price-to-performance ratio insights

**Common Use Cases:**
- How customers are using this product
- Performance in different scenarios

IMPORTANT RULES:
- Focus ONLY on product: "${text}"
- Be SPECIFIC with numbers, percentages, frequencies when possible
- Quote actual customer phrases where relevant (translated to English if needed)
- DO NOT show SQL queries, JSON data, or technical analysis
- DO NOT show raw review text - only summarized insights
- Provide actionable insights that help decision-making
- If limited reviews, be transparent about sample size
- If no reviews found, say: "No reviews available for this product"

Model: ${selectedModel}`;

      const response = await askChatbot(analysisPrompt, selectedModel, abortControllerRef.current.signal);
      console.log('Backend response:', response);
      console.log('Raw answer text:', response.answer || response.content || response.text);
      
      // Handle different response formats and clean
      const rawText = response.answer || response.content || response.text || '';
      console.log('Before cleaning:', rawText);
      const cleanedText = cleanBotResponse(rawText);
      console.log('After cleaning:', cleanedText);
      
      const botReply = {
        text: cleanedText,
        product: response.product || null,
        model: selectedModel,
      };
      setMessages((s) => [...s, { id: nextId++, sender: 'bot', ...botReply }]);
    } catch (err) {
      if (err.name === 'AbortError') {
        // Request was cancelled, don't show error
        return;
      }
      
      const errorMsg = `Sorry, I encountered an error: ${err.message}. Please make sure the backend is running at http://localhost:8000`;
      setError(err.message);
      setMessages((s) => [...s, { id: nextId++, sender: 'bot', text: errorMsg }]);
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const HEADER_OFFSET = 40; // Increased to accommodate model selector
  const FOOTER_OFFSET = 120; // reserve more space at bottom for raised ask form

  const justify = messages.length < 3 ? 'center' : 'flex-start';

  return (
    <div style={{ height: '100vh', position: 'relative' }}>
      <header style={{ 
        position: 'fixed', 
        top: 9, 
        left: '50%', 
        transform: 'translateX(-50%)', 
        width: 'min(2000px,90%)', 
        padding: '10px 10px', 
        boxSizing: 'border-box', 
        color: '#ffffffff', 
        borderBottom: '1px solid rgba(73, 112, 255, 1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}>
        <h1 style={{ margin: 0, fontSize: 19, fontWeight: 700 }}>Tiki Product Reviewer</h1>
        <ModelSelector 
          selectedModel={selectedModel} 
          onModelChange={setSelectedModel}
          disabled={isLoading}
          compact
        />
       
      </header>

      <main
        ref={messagesRef}
        className="scrollable-messages"
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          top: HEADER_OFFSET,
          bottom: FOOTER_OFFSET,
          width: 'min(2000px,90%)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: justify,
          gap: 2,
          padding: '20px 10px',
        }}
      >
        {messages.map((m) => (
          <ChatMessage key={m.id} message={m} />
        ))}
        {isLoading && <LoadingMessage model={selectedModel} />}
      </main>

      <footer style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: 20, width: 'min(2000px,90%)', padding: '30px 10px', boxSizing: 'border-box', zIndex: 30, borderTop: '1px solid rgba(73, 112, 255, 1)', background: 'transparent' }}>
        {isLoading && loadingTime > 5 && (
          <div style={{
            marginBottom: 12,
            padding: '6px 16px',
            background: 'rgba(251, 113, 133, 0.1)',
            border: '1px solid rgba(251, 113, 133, 0.3)',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, color: '#fb7185' }}>
                ⏱️ Hmm, let me analyze in ({loadingTime}s)
              </span>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>
                Don't worry, it's worth the wait!
              </span>
            </div>
            <button
              onClick={handleCancelRequest}
              style={{
                padding: '6px 12px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Cancel
            </button>
          </div>
        )}
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </footer>
      {error && (
        <div style={{ position: 'fixed', bottom: 10, right: 10, background: '#ff4444', color: 'white', padding: '10px 15px', borderRadius: '4px', fontSize: '12px' }}>
          ⚠️ Backend error: {error}
        </div>
      )}
    </div>
  );
};

export default AskFormFixed;
