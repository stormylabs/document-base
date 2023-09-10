import React from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';

const Welcome = () => {
  return (
    <Accordion allowToggle defaultIndex={0}>
      <AccordionItem className="inline-flex flex-col gap-4 mb-4 !border-none">
        <AccordionButton className="hover:!bg-transparent flex flex-row gap-2">
          <div>
            <div>
              👋 Hi! I am DocumentBase, ask me anything about your thoughts!
            </div>
            <div className="flex flex-row gap-2 items-center justify-center">
              <div>Sources</div> <div className="h-[1px] bg-[#DBE3EE] w-full" />
            </div>
          </div>
          <AccordionIcon className="self-start" />
        </AccordionButton>

        {/* Bubble Content */}
        <AccordionPanel className="inline-flex flex-col gap-3">
          <div className="px-3 py-[6px] rounded-[12px] bg-dc-cloud-dark">
            1. Lorem ipsum dolor sit amet, consectetuer adipiscing elit.
          </div>
          <div className="px-3 py-[6px] rounded-[12px] bg-dc-cloud-dark">
            2. Aenean commodo ligula eget dolor. Aenean massa.
          </div>
          <div className="px-3 py-[6px] rounded-[12px] bg-dc-cloud-dark">
            3. Cum sociis natoque penatibus et
          </div>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};

export default Welcome;
