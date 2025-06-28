import { useState } from "react";
import { Share2, Copy, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface ShareButtonProps {
  documentId: string;
  isPublic: boolean;
}

export function ShareButton({ documentId, isPublic }: ShareButtonProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isPublic) {
    return null;
  }

  const shareUrl = `${window.location.origin}/share/${documentId}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const openInNewTab = () => {
    window.open(shareUrl, '_blank');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowShareMenu(!showShareMenu)}
        className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-xl border border-blue-200/50 hover:from-blue-200 hover:to-indigo-200 transition-all duration-200"
        title="Share document"
      >
        <Share2 className="w-4 h-4" />
        <span className="text-sm font-semibold">Share</span>
      </button>

      {showShareMenu && (
        <>
          <div className="absolute top-12 right-0 bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-xl shadow-xl z-20 py-3 min-w-[280px]">
            <div className="px-4 pb-3 border-b border-gray-200/50">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Share this document</h3>
              <p className="text-xs text-gray-600">Anyone with the link can view this document</p>
            </div>
            
            <div className="p-4 space-y-3">
              <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 text-sm text-gray-700 bg-transparent border-none outline-none"
                />
                <button
                  onClick={copyToClipboard}
                  className="flex items-center space-x-1 px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              
              <button
                onClick={openInNewTab}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open in new tab</span>
              </button>
            </div>
          </div>
          
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowShareMenu(false)}
          />
        </>
      )}
    </div>
  );
}
