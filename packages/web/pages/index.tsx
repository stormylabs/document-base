import Chat from 'components/useCases/Chat';
import SideBar from 'components/useCases/ChatSideBar';

export function Index() {
  return (
    <div className="flex flex-row h-full p-10 gap-10">
      <SideBar />
      <Chat />
    </div>
  );
}

export default Index;
