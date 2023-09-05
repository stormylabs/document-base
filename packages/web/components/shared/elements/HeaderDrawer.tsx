import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  IconButton,
  Stack,
  useDisclosure,
} from '@chakra-ui/react';
import Navigation from 'components/shared/elements/Navigation';
import React from 'react';
import MenuSvg from '../icons/MenuSvg';
import Header from './Header';

const HeaderDrawer = () => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  return (
    <div className="flex md:!hidden flex-row w-full justify-between px-5 py-4 border-b border-dc-cloud-dark sticky top-0 bg-white">
      <Header />
      <IconButton
        icon={<MenuSvg />}
        aria-label={'menu'}
        onClick={onOpen}
        variant="outline"
        rounded="12px"
        size="lg"
      />

      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="full">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>MENU</DrawerHeader>

          <DrawerBody className="flex flex-col flex-shrink h-full gap-10">
            <Navigation />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default HeaderDrawer;
