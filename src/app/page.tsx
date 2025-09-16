"use client"

import { Header, ChatInput, Chat  } from "./components";
import type { ChatProps } from "./components/types";
const messages: ChatProps["messages"] = [
  { type: "assistant", message: "Hi, I’m your storytelling guide." },
  { type: "user", message: "I want to capture a childhood memory." },
  { type: "assistant", message: "Great! When and where did it happen?" }
];
  export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <ChatInput placeholder="Type here..." value={""} onChange={() => {}} onClick={() => {}} />
      <Chat messages={messages} />
    </div>
  );
}
