"use client";

import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { COGNI_THEME, type Message } from "../types";

interface MessageBubbleProps {
  message: Message;
  className?: string;
}

interface CodeProps {
  className?: string;
  children?: React.ReactNode;
}

export function formatTimestamp(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));
}

export function MessageBubble({ message, className }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  // System messages (context updates)
  if (isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn("flex justify-center", className)}
      >
        <motion.div
          className="px-4 py-2 rounded-full text-xs text-gray-500"
          style={{
            backgroundColor: COGNI_THEME.lightPanel,
            border: `1px solid ${COGNI_THEME.border}`,
          }}
          whileHover={{ scale: 1.02 }}
        >
          {message.content}
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "flex w-full gap-3",
        isUser ? "flex-row-reverse" : "flex-row",
        className
      )}
    >
      {/* Avatar */}
      {!isUser && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
        >
          <Avatar className="w-8 h-8 shrink-0 mt-1 ring-2 ring-white shadow-sm">
            <AvatarFallback
              className="text-white text-xs font-semibold"
              style={{
                background: `linear-gradient(135deg, ${COGNI_THEME.primary} 0%, ${COGNI_THEME.primaryHover} 100%)`,
              }}
            >
              C
            </AvatarFallback>
          </Avatar>
        </motion.div>
      )}

      {/* Message Content */}
      <div
        className={cn(
          "flex flex-col max-w-[80%]",
          isUser ? "items-end" : "items-start"
        )}
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.005 }}
          className={cn(
            "px-4 py-3 rounded-2xl",
            isUser
              ? "rounded-tr-md"
              : "rounded-tl-md"
          )}
          style={{
            backgroundColor: isUser ? COGNI_THEME.lightPanel : COGNI_THEME.white,
            border: isUser ? "none" : `1px solid ${COGNI_THEME.border}`,
            boxShadow: isUser ? "none" : "0 2px 8px rgba(0, 0, 0, 0.04)",
          }}
        >
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap text-gray-800">{message.content}</p>
          ) : (
            <ReactMarkdown
              className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-2"
              components={{
                code({ className, children, ...props }: CodeProps) {
                  const match = /language-(\w+)/.exec(className || "");
                  const isInline = !match;

                  if (isInline) {
                    return (
                      <code
                        className="px-1.5 py-0.5 rounded text-sm font-mono"
                        style={{
                          backgroundColor: COGNI_THEME.lightPanel,
                          border: `1px solid ${COGNI_THEME.border}`,
                        }}
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  }

                  if (match) {
                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="rounded-lg overflow-hidden my-2"
                      >
                        <SyntaxHighlighter
                          style={oneLight}
                          language={match[1]}
                          PreTag="div"
                          className="text-sm !m-0 !bg-gray-50"
                          customStyle={{
                            margin: 0,
                            borderRadius: "0.5rem",
                            border: `1px solid ${COGNI_THEME.border}`,
                          }}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      </motion.div>
                    );
                  }

                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
                p: ({ children }) => (
                  <p className="mb-1.5 last:mb-0 text-sm leading-relaxed">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pl-4 mb-1.5 space-y-0.5">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal pl-4 mb-1.5 space-y-0.5">{children}</ol>
                ),
                li: ({ children }) => <li className="text-sm">{children}</li>,
                h1: ({ children }) => (
                  <h1 className="text-base font-semibold mb-1.5 text-gray-900">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-sm font-semibold mb-1 text-gray-900">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-sm font-semibold mb-1 text-gray-900">{children}</h3>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold" style={{ color: COGNI_THEME.primary }}>
                    {children}
                  </strong>
                ),
                blockquote: ({ children }) => (
                  <motion.blockquote
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="border-l-2 pl-3 italic text-gray-500 my-1.5"
                    style={{ borderColor: COGNI_THEME.primary }}
                  >
                    {children}
                  </motion.blockquote>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </motion.div>

        {/* Timestamp */}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={cn(
            "text-xs text-gray-400 mt-1.5 px-1",
            isUser ? "text-right" : "text-left"
          )}
        >
          {formatTimestamp(message.timestamp)}
          {message.tokens && (
            <span className="ml-2 opacity-50">({message.tokens} tokens)</span>
          )}
        </motion.span>
      </div>

      {/* Spacer for user messages */}
      {isUser && <div className="w-8 shrink-0" />}
    </motion.div>
  );
}

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex gap-3"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Avatar className="w-8 h-8 shrink-0 mt-1 ring-2 ring-white shadow-sm">
          <AvatarFallback
            className="text-white text-xs font-semibold"
            style={{
              background: `linear-gradient(135deg, ${COGNI_THEME.primary} 0%, ${COGNI_THEME.primaryHover} 100%)`,
            }}
          >
            C
          </AvatarFallback>
        </Avatar>
      </motion.div>

      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="px-4 py-3 rounded-2xl rounded-tl-md"
        style={{
          backgroundColor: COGNI_THEME.white,
          border: `1px solid ${COGNI_THEME.border}`,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
        }}
      >
        <div className="flex gap-1.5 items-center">
          {/* Animated dots */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: COGNI_THEME.primary }}
              animate={{
                y: [0, -6, 0],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.12,
                ease: "easeInOut",
              }}
            />
          ))}
          <motion.span
            className="ml-2 text-xs text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            thinking...
          </motion.span>
        </div>
      </motion.div>
    </motion.div>
  );
}
