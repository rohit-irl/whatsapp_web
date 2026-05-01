import MessageBubble from "./MessageBubble";

const ChatWindow = () => {
  return (
    <section className="flex flex-1 flex-col bg-gray-100">
      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        <MessageBubble />
      </div>

      <form className="border-t border-gray-200 bg-white p-4">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Type a message"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-green-500"
          />
          <button
            type="submit"
            className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
          >
            Send
          </button>
        </div>
      </form>
    </section>
  );
};

export default ChatWindow;
