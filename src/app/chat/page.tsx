import ChatBox from "@/app/chat/ChatBox";


export default function ChatPage({ searchParams }: any) {
  // 🧠 Lấy role từ URL query: ?role=user hoặc ?role=admin
  const role = searchParams?.role || 'user';
  const userId = role === 'user' ? 1 : 999;
  const adminId = role === 'admin' ? 1 : 999;

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <ChatBox userId={userId} adminId={adminId} role={role} />
    </div>
  );
}
