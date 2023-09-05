import React from 'react';

const LeftBubble = () => {
  return (
    <div className="flex justify-start">
      <div className="inline-flex p-3 flex-col bg-dc-cloud rounded-[20px] justify-start max-w-[595px]">
        {/* Bubble Header */}
        <div className="inline-flex flex-col gap-4 mb-4">
          <div>
            👋 Hi! I am DocumentBase, ask me anything about your thoughts!
          </div>
          <div className="flex flex-row gap-2 items-center">
            Sources <div className="h-[1px] bg-[#DBE3EE] w-full" />
          </div>
        </div>

        {/* Bubble Content */}
        <div className="inline-flex flex-col gap-3">
          <div className="px-3 py-[6px] rounded-[12px] bg-dc-cloud-dark">
            1. Lorem ipsum dolor sit amet, consectetuer adipiscing elit.
          </div>
          <div className="px-3 py-[6px] rounded-[12px] bg-dc-cloud-dark">
            2. Aenean commodo ligula eget dolor. Aenean massa.
          </div>
          <div className="px-3 py-[6px] rounded-[12px] bg-dc-cloud-dark">
            3. Cum sociis natoque penatibus et
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeftBubble;
