import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
} from '@chakra-ui/react';
import React from 'react';

type LeftBubbleProps = {
  content: string | React.ReactNode;
  source: string[];
};

const LeftBubble = ({ content, source = [] }: LeftBubbleProps) => {
  return (
    <div className="flex justify-start">
      <div className="inline-flex p-3 flex-col bg-dc-cloud rounded-[20px] justify-start max-w-[595px]">
        {/* Bubble Header */}
        {source.length ? (
          <Accordion allowToggle defaultIndex={1}>
            <AccordionItem className="inline-flex flex-col gap-4 mb-4 !border-none">
              <AccordionButton className="hover:!bg-transparent flex flex-row gap-2">
                <div>
                  <div className="text-left break-words">{content}</div>
                  <div className="flex flex-row gap-2 items-center justify-center">
                    <div>Sources</div>
                    <div className="h-[1px] bg-[#DBE3EE] w-full" />
                  </div>
                </div>
                <AccordionIcon className="self-start" />
              </AccordionButton>

              {/* Bubble Content */}
              <AccordionPanel className="inline-flex flex-col gap-3">
                {source.map((message, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-[6px] rounded-[12px] bg-dc-cloud-dark break-all"
                  >
                    {idx + 1}. {message}
                  </div>
                ))}
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        ) : (
          content
        )}
      </div>
    </div>
  );
};

export default LeftBubble;
