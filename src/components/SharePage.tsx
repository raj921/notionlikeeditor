import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useBlockNoteSync } from "@convex-dev/prosemirror-sync/blocknote";
import { BlockNoteView } from "@blocknote/mantine";
import { BlockNoteEditor } from "@blocknote/core";
import { Globe, Lock, Sparkles, FileText, Eye } from "lucide-react";
import { useState, useEffect } from "react";

// Import BlockNote styles
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

interface SharePageProps {
  documentId: Id<"documents">;
}

export function SharePage({ documentId }: SharePageProps) {
  const document = useQuery(api.documents.getPublic, { id: documentId });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (document !== undefined) {
      setIsLoading(false);
    }
  }, [document]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading document...</p>
        </div>
      </div>
    );
  }

  if (document === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-gradient-to-r from-red-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Document not found
          </h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            This document may have been deleted, made private, or doesn't exist.
          </p>
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <FileText className="w-5 h-5 mr-2" />
            Go to Shiva Editor
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-8 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {document?.title || "Untitled Document"}
              </h1>
              <div className="flex items-center space-x-3 mt-1">
                <div className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-lg border border-green-200/50">
                  <Globe className="w-3 h-3" />
                  <span className="text-xs font-semibold">Public Document</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-lg border border-blue-200/50">
                  <Eye className="w-3 h-3" />
                  <span className="text-xs font-semibold">Read Only</span>
                </div>
              </div>
            </div>
          </div>
          <a
            href="/"
            className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <FileText className="w-4 h-4 mr-2" />
            Open in Shiva Editor
          </a>
        </div>
      </header>

      {/* Document Content */}
      <main className="max-w-6xl mx-auto px-8 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          {sync.isLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="w-12 h-12 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Loading content...</p>
              </div>
            </div>
          ) : sync.editor ? (
            <div className="min-h-[500px]">
              <BlockNoteView
                editor={sync.editor}
                theme="light"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-96">
              <div className="text-center max-w-md mx-auto p-8">
                <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Empty Document
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  This document doesn't have any content yet.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 pb-8">
        <div className="max-w-6xl mx-auto px-8 text-center">
          <p className="text-gray-500 text-sm">
            Created with{" "}
            <a
              href="/"
              className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
            >
              Shiva Editor
            </a>{" "}
            - A collaborative document editor
          </p>
        </div>
      </footer>
    </div>
  );
}
