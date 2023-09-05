import {
  Button,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react';
import LeftBubble from 'components/shared/elements/LeftBubble';
import RightBubble from 'components/shared/elements/RightBubble';
import PaperPlane from 'components/shared/icons/PaperPlane';
import Trash from 'components/shared/icons/Trash';
import React from 'react';

const Chat = () => {
  return (
    <div className="flex flex-col flex-1 md:border rounded-[20px] border-[#DBE3EE] bg-white h-full">
      {/* Form Header */}
      <div className="hidden md:!block py-[26px] px-6 border-b border-[DBE3EE]">
        Version Alpha 1.2
      </div>

      <div className="flex-1 flex flex-col px-6 pt-10 md:!pt-20 gap-5 overflow-scroll pb-20 no-scrollbar">
        <RightBubble text="Hello!" />
        <LeftBubble />
        <RightBubble
          text="Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean
          commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus
          et magnis dis parturient montes, nascetur ridiculus mus. Donec quam
          felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla
          consequat massa quis enim. Donec pede justo, fringilla vel, aliquet
          nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a,
          venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium.
          Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean
          vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat
          vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra
          quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius
          laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel
          augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam
          rhoncus. Maecenas tempus, tellus eget"
        />
      </div>

      <div className="border-t border-[DBE3EE] py-[26px] px-6 flex flex-row gap-4 items-center sticky bottom-0 md:!relative bg-white rounded-b-[20px]">
        <IconButton
          icon={<Trash />}
          aria-label={'clear'}
          variant="outline"
          rounded={'12px'}
          size="lg"
        />
        <InputGroup size="md" className="flex" minH="48px">
          <Input
            pr="4rem"
            placeholder="Write here.."
            rounded={12}
            flex={1}
            minH="48px"
          />
          <InputRightElement className="flex items-center" minH="48px">
            <IconButton
              size="sm"
              onClick={() => {
                //
              }}
              icon={<PaperPlane />}
              aria-label={'send'}
              variant="link"
            />
          </InputRightElement>
        </InputGroup>
      </div>
    </div>
  );
};

export default Chat;
