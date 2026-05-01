import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const Sidebar = ({ currentUser, selectedUser, onSelectUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("chat_user");
    localStorage.removeItem("chat_username");
    navigate("/");
  };

  useEffect(() => {
    const loadUsers = async () => {
      if (!currentUser?._id) return;
      try {
        setLoading(true);
        setError("");
        const { data } = await api.get("/users");
        setUsers(data);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [currentUser?._id]);

  const visibleUsers = users.filter((user) => user._id !== currentUser?._id);

  return (
    <aside className="flex w-full flex-col border-r border-gray-200 bg-white md:w-[30%]">
      {/* Header */}
      <div className="flex h-[60px] items-center justify-between border-b border-gray-200 bg-[#f0f2f5] px-4 py-3">
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-300 font-bold text-gray-600">
              {currentUser.username?.[0]?.toUpperCase()}
            </div>
          ) : null}
          <h2 className="text-lg font-semibold text-gray-800">Chats</h2>
        </div>
        <button
          onClick={handleLogout}
          title="Logout"
          className="p-2 text-gray-500 transition-colors hover:text-gray-800 rounded-full hover:bg-gray-200"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>

      {/* Search Bar */}
      <div className="border-b border-gray-200 bg-white px-3 py-2">
        <div className="flex items-center rounded-lg bg-[#f0f2f5] px-3 py-1.5">
          <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search or start new chat"
            className="ml-3 w-full bg-transparent text-sm text-gray-700 placeholder-gray-500 outline-none"
          />
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto bg-white">
        {loading ? <p className="p-4 text-sm text-gray-500">Loading users...</p> : null}
        {error ? <p className="p-4 text-sm text-red-600">{error}</p> : null}
        {!loading && !error && visibleUsers.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">No users available yet.</p>
        ) : null}

        {visibleUsers.map((user) => {
          const isActive = selectedUser?._id === user._id;
          return (
            <button
              key={user._id}
              type="button"
              onClick={() => onSelectUser(user)}
              className={`flex w-full items-center gap-3 px-3 py-2 transition-all hover:bg-gray-100 ${
                isActive ? "bg-green-100" : ""
              }`}
            >
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-600 shadow-sm">
                {user.username?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 border-b border-gray-100 pb-4 pt-3 text-left">
                <p className="text-base font-medium text-gray-800">{user.username}</p>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
