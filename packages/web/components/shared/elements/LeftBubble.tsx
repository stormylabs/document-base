import React from 'react';

type LeftBubbleProps = {
  content: string | React.ReactNode;
};

const LeftBubble = ({ content }: LeftBubbleProps) => {
  return (
    <div className="flex justify-start">
      <div className="inline-flex p-3 flex-col bg-dc-cloud rounded-[20px] justify-start max-w-[595px]">
        {/* Bubble Header */}
        {content}
      </div>
    </div>
  );
};

export default LeftBubble;
