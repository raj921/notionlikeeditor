import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useBlockNoteSync } from "@convex-dev/prosemirror-sync/blocknote";
import { BlockNoteView } from "@blocknote/mantine";
import { BlockNoteEditor } from "@blocknote/core";
import usePresence from "@convex-dev/presence/react";
import FacePile from "@convex-dev/presence/facepile";
import { ShareButton } from "./ShareButton";
import { useState, useEffect } from "react";
import { Globe, Lock, Edit3, Users, Sparkles } from "lucide-react";
import { toast } from "sonner";

// Import BlockNote styles
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

interface DocumentEditorProps {
  documentId: Id<"documents">;
}

export function DocumentEditor({ documentId }: DocumentEditorProps) {
  const document = useQuery(api.documents.get, { id: documentId });
  const userId = useQuery(api.presence.getUserId);
  const updateTitle = useMutation(api.documents.updateTitle);
  
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState("");

  // Initialize title value when document loads
  useEffect(() => {
    if (document?.title) {
      setTitleValue(document.title);
    }
  }, [document?.title]);

  const sync = useBlockNoteSync<BlockNoteEditor>(
    api.prosemirror,
    documentId,
    {
      editorOptions: {
        _tiptapOptions: {
          editorProps: {
            attributes: {
              class: "prose prose-lg max-w-none focus:outline-none min-h-[500px] px-8 py-6",
            },
          },
        },
      },
    }
  );

  const presenceState = usePresence(
    api.presence,
    documentId,
    userId || "",
    10000
  );

  const handleTitleSubmit = async () => {
    if (!titleValue.trim() || titleValue === document?.title) {
      setTitleValue(document?.title || "");
      setIsEditingTitle(false);
      return;
    }

    try {
      await updateTitle({ id: documentId, title: titleValue.trim() });
      setIsEditingTitle(false);
      toast.success("Title updated");
    } catch (error) {
      toast.error("Failed to update title");
      setTitleValue(document?.title || "");
      setIsEditingTitle(false);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTitleSubmit();
    } else if (e.key === "Escape") {
      setTitleValue(document?.title || "");
      setIsEditingTitle(false);
    }
  };

  if (document === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading document...</p>
        </div>
      </div>
    );
  }

  if (document === null) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-gradient-to-r from-red-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Document not found
          </h2>
          <p className="text-gray-600 leading-relaxed">
            This document may have been deleted or you don't have access to it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white/50 backdrop-blur-sm">
      {/* Document Header */}
      <div className="border-b border-gray-200/50 px-8 py-6 bg-white/80 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            {isEditingTitle ? (
              <input
                type="text"
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={handleTitleKeyDown}
                className="text-3xl font-bold text-gray-900 bg-transparent border-none outline-none focus:ring-0 p-0 flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
                autoFocus
              />
            ) : (
              <h1
                className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent cursor-pointer hover:bg-gray-50/80 px-3 py-2 rounded-xl flex items-center space-x-3 transition-all duration-200 group"
                onClick={() => setIsEditingTitle(true)}
              >
                <span>{document.title}</span>
                <Edit3 className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </h1>
            )}
            
            <div className="flex items-center space-x-3">
              {document.isPublic ? (
                <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-xl border border-green-200/50">
                  <Globe className="w-4 h-4" />
                  <span className="text-sm font-semibold">Public</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-gray-100 to-slate-100 text-gray-600 rounded-xl border border-gray-200/50">
                  <Lock className="w-4 h-4" />
                  <span className="text-sm font-semibold">Private</span>
                </div>
              )}
              
              <ShareButton documentId={documentId} isPublic={document.isPublic} />
            </div>
          </div>

          {/* Presence */}
          <div className="flex items-center space-x-4">
            {presenceState && presenceState.length > 0 && (
              <div className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200/50">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-semibold text-indigo-700">
                    {presenceState.length} online
                  </span>
                </div>
                <FacePile presenceState={presenceState} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto">
        {sync.isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-12 h-12 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading document...</p>
            </div>
          </div>
        ) : sync.editor ? (
          <div className="h-full bg-white/80 backdrop-blur-sm">
            <BlockNoteView
              editor={sync.editor}
              theme="light"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md mx-auto p-8">
              <div className="w-24 h-24 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-12 h-12 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Ready to create?
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                This document is waiting for your first words. Click below to start writing.
              </p>
              <button
                onClick={() => sync.create({ type: "doc", content: [] })}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Start Writing
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Wrapper component to handle document ID changes
export function DocumentEditorWrapper({ documentId }: DocumentEditorProps) {
  return <DocumentEditor key={documentId} documentId={documentId} />;
}
