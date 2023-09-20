import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
} from '@chakra-ui/react';
import Link from 'next/link';
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
            <AccordionItem className="inline-flex flex-col gap-2 !border-none">
              <AccordionButton className="hover:!bg-transparent !p-0 flex flex-col justify-start items-baseline">
                <div className="flex flex-row gap-2">
                  <div className="text-left break-words">{content}</div>
                  <AccordionIcon className="self-start" />
                </div>

                <div className="flex flex-row gap-2 w-full !mt-2">
                  <div className="text-base">Sources</div>
                  <div className="border-b border-[#DBE3EE] w-ful flex-1 self-center" />
                </div>
              </AccordionButton>

              {/* Bubble Content */}
              <AccordionPanel className="inline-flex flex-col gap-3 !p-0">
                {source.map((sourceLink, idx) => (
                  <div
                    key={idx}
                    className="tex-sm px-3 py-[6px] rounded-[12px] bg-dc-cloud-dark inline-flex gap-1"
                  >
                    <div>{idx + 1}.</div>
                    <Link
                      className="break-all hover:underline"
                      href={sourceLink}
                      target="_blank"
                    >
                      <div>{sourceLink}</div>
                    </Link>
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
