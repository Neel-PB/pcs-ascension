import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';

interface Message {
  id: string;
  content: string;
  type: 'user' | 'assistant';
  timestamp: Date;
  attachments?: Array<{ id: string; name: string }>;
}

interface ChatMessageListProps {
  messages: Message[];
  isLoading?: boolean;
}

export const ChatMessageList = ({ messages, isLoading }: ChatMessageListProps) => {
  // Group consecutive messages by author
  const groupedMessages: Array<{ author: 'user' | 'assistant'; messages: Message[] }> = [];
  
  messages.forEach((message) => {
    const lastGroup = groupedMessages[groupedMessages.length - 1];
    if (lastGroup && lastGroup.author === message.type) {
      lastGroup.messages.push(message);
    } else {
      groupedMessages.push({ author: message.type, messages: [message] });
    }
  });

  return (
    <div className="space-y-6">
      {groupedMessages.map((group, groupIndex) => (
        <div key={groupIndex} className="space-y-2">
          <div className={`text-xs font-medium px-4 ${group.author === 'user' ? 'text-right' : 'text-left'}`}>
            {group.author === 'user' ? 'You' : 'Assistant'}
          </div>
          <div className="space-y-2">
            {group.messages.map((message) => (
              <ChatMessage key={message.id} {...message} />
            ))}
          </div>
        </div>
      ))}
      {isLoading && <TypingIndicator />}
    </div>
  );
};
