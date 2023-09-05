import HeaderDrawer from 'components/shared/elements/HeaderDrawer';
import Chat from 'components/useCases/Chat';
import SideBar from 'components/useCases/ChatSideBar';

export function Index() {
  return (
    <div className="flex flex-col md:!flex-row h-full md:!p-10 md:gap-10">
      <HeaderDrawer />
      <SideBar />
      <Chat />
    </div>
  );
}

export default Index;
