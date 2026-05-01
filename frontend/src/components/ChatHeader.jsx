const ChatHeader = ({ selectedUser }) => {
  return (
    <div className="sticky top-0 z-10 flex h-[60px] items-center gap-4 border-b border-gray-200 bg-[#f0f2f5] px-4 py-3 shadow-sm">
      {selectedUser ? (
        <>
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-600 shadow-sm">
            {selectedUser.username?.[0]?.toUpperCase()}
          </div>
          <h2 className="text-lg font-semibold text-gray-800">
            {selectedUser.username}
          </h2>
        </>
      ) : (
        <h2 className="text-lg font-semibold text-gray-800">Select a chat</h2>
      )}
    </div>
  );
};

export default ChatHeader;
