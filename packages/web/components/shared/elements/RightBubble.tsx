import React from 'react';

type Props = {
  text: string;
};

const RightBubble = ({ text }: Props) => {
  return (
    <div className="flex justify-end">
      <div className="inline-flex p-3 flex-col border bg-dc-cloud rounded-xl border-dc-cloud-dark max-w-[595px]">
        {/* Bubble Content */}
        <div className="inline-flex flex-col gap-3">{text}</div>
      </div>
    </div>
  );
};

export default RightBubble;
