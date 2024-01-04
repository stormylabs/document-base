import React, { Fragment, useEffect, useRef, useState } from 'react';
import {
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react';
import LeftBubble from 'components/shared/elements/LeftBubble';
import RightBubble from 'components/shared/elements/RightBubble';
import PaperPlane from 'components/shared/icons/SendSvg';
import Trash from 'components/shared/icons/TrashSvg';
import { useAppStore } from 'stores';

const Chat = () => {
  const [textMessage, setTextMessage] = useState('');
  const {
    bot,
    conversationHistory,
    source,
    sending,
    sendMessage,
    resetConversationHistory,
  } = useAppStore();

  const handleSendMessage = async (message: string) => {
    if (!sending) {
      const data = {
        message,
        conversationHistory,
      };
      sendMessage(bot?._id as string, data);
      setTextMessage('');
    }
  };

  return (
    <div className="flex flex-col flex-1 md:border rounded-[20px] border-[#DBE3EE] bg-white h-full">
      {/* Form Header */}
      <div className="hidden md:!block py-[26px] px-6 border-b border-[DBE3EE]">
        Version Alpha 1.2
      </div>

      <div className="flex-1 flex flex-col px-6 pt-10 md:!pt-20 gap-5 overflow-scroll pb-20 no-scrollbar">
        {conversationHistory.map((msg, idx) => (
          <Fragment key={idx}>
            {msg.split(':')[0] === 'user' ? (
              <RightBubble content={msg.split('user:')[1]} />
            ) : (
              <LeftBubble
                content={msg.split('assistant:')[1]}
                source={source}
              />
            )}
          </Fragment>
        ))}
      </div>

      <div className="border-t border-[DBE3EE] py-[26px] px-6 flex flex-row gap-4 items-center sticky bottom-0 md:!relative bg-white rounded-b-[20px]">
        <IconButton
          icon={<Trash />}
          aria-label={'clear'}
          variant="outline"
          rounded={'12px'}
          size="lg"
          onClick={() => resetConversationHistory()}
        />
        <InputGroup size="md" className="flex" minH="48px">
          <Input
            pr="4rem"
            placeholder="Write here.."
            rounded={12}
            flex={1}
            minH="48px"
            value={textMessage}
            onChange={(ev) => {
              const value = ev?.target?.value;
              setTextMessage(value);
            }}
            onKeyDown={(ev) => {
              if (ev.code === 'Enter') {
                handleSendMessage(textMessage);
              }
            }}
          />
          <InputRightElement className="flex items-center" minH="48px">
            <IconButton
              size="sm"
              onClick={() => handleSendMessage(textMessage)}
              icon={<PaperPlane />}
              aria-label={'send'}
              variant="link"
              isLoading={sending}
            />
          </InputRightElement>
        </InputGroup>
      </div>
    </div>
  );
};

export default Chat;
