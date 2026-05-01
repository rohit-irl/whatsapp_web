const Login = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <form className="w-full max-w-md rounded-xl bg-white p-6 shadow-md">
        <h1 className="mb-4 text-2xl font-bold text-gray-800">Welcome to WhatsApp Clone</h1>
        <label className="mb-2 block text-sm font-medium text-gray-600">Username</label>
        <input
          type="text"
          placeholder="Enter your username"
          className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-green-500"
        />
        <button
          type="submit"
          className="mt-4 w-full rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
        >
          Continue
        </button>
      </form>
    </main>
  );
};

export default Login;
