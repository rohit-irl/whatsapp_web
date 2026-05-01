import ChatHeader from "../components/ChatHeader";
import ChatWindow from "../components/ChatWindow";
import Sidebar from "../components/Sidebar";

const Chat = () => {
  return (
    <main className="h-screen md:flex">
      <Sidebar />

      <section className="flex flex-1 flex-col">
        <ChatHeader />
        <ChatWindow />
      </section>
    </main>
  );
};

export default Chat;
