import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { DocumentEditor } from "./components/DocumentEditor";
import { Sidebar } from "./components/Sidebar";
import { SharePage } from "./components/SharePage";
import { useState, useEffect } from "react";
import { Id } from "../convex/_generated/dataModel";
import { Sparkles, FileText } from "lucide-react";

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Check if this is a share page
  const shareMatch = currentPath.match(/^\/share\/(.+)$/);
  if (shareMatch) {
    const documentId = shareMatch[1] as Id<"documents">;
    return (
      <div className="min-h-screen">
        <SharePage documentId={documentId} />
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            },
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Unauthenticated>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                    <FileText className="w-3 h-3 text-white" />
                  </div>
                </div>
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                Shiva Editor
              </h1>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
              <SignInForm />
            </div>
          </div>
        </div>
      </Unauthenticated>

      <Authenticated>
        <Content />
      </Authenticated>

      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          },
        }}
      />
    </div>
  );
}

function Content() {
  const [selectedDocumentId, setSelectedDocumentId] = useState<Id<"documents"> | null>(null);

  return (
    <>
      <Sidebar
        selectedDocumentId={selectedDocumentId}
        onSelectDocument={setSelectedDocumentId}
      />
      <main className="flex-1 flex flex-col">
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-8 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Shiva Editor
            </h1>
          </div>
          <SignOutButton />
        </header>
        <div className="flex-1 bg-gradient-to-br from-gray-50/50 to-indigo-50/30">
          {selectedDocumentId ? (
            <DocumentEditor documentId={selectedDocumentId} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md mx-auto p-8">
                <div className="w-24 h-24 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-12 h-12 text-indigo-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Welcome to Shiva Editor
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Select a document from the sidebar or create a new one to start writing
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
