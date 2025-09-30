import { Bot, Copy, ThumbsDown, ThumbsUp, User } from "lucide-react";


const Messages = ({ m, i }: { m: any, i: string }) => {
  return (
    <div
      key={i}
      className={`flex items-end gap-3 ${m.sender === "user" ? "justify-end" : "justify-start"
        }`}
    >
      {m.sender === "bot" && (
        <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
          <Bot className="w-5 h-5 text-white" />
        </div>
      )}
      <div
        className={`flex flex-col w-full max-w-[80%] ${m.sender === "user" ? "items-end" : "items-start"
          }`}
      >
        <div
          className={`p-3 rounded-2xl break-words ${m.sender === "user"
              ? "bg-green-600 text-white rounded-br-lg"
              : "bg-white text-gray-800 rounded-bl-lg border border-gray-200"
            }`}
        >
          {m.text && <p className="whitespace-pre-wrap">{m.text}</p>}
          {m.html && (
            <div
              className="prose prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-ol:my-2"
              dangerouslySetInnerHTML={{ __html: m.html }}
            />
          )}
          {m.imageUrl && (
            <img
              src={m.imageUrl}
              alt="Uploaded"
              className="max-w-full rounded-lg mt-2"
            />
          )}
        </div>
        {m.sender === "bot" && (
          <div className="flex space-x-2 mt-2 text-gray-400">
            <button
              title="Gostei"
              className="hover:text-green-600 transition-colors"
            >
              <ThumbsUp className="h-4 w-4" />
            </button>
            <button
              title="Não gostei"
              className="hover:text-red-600 transition-colors"
            >
              <ThumbsDown className="h-4 w-4" />
            </button>
            <button
              title="Copiar"
              onClick={() => {
                if (m.text) {
                  navigator.clipboard.writeText(m.text);
                } else if (m.html) {
                  const tmp = document.createElement("div");
                  tmp.innerHTML = m.html;
                  const plain = tmp.innerText;
                  navigator.clipboard.writeText(plain);
                }
              }}
              className="hover:text-blue-600 transition-colors"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      {m.sender === "user" && (
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-gray-600" />
        </div>
      )}
    </div>
  );
};


export default Messages;