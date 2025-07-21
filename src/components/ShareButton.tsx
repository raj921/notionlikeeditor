import { useState } from "react";
import {
  Share2,
  Copy,
  Check,
  ExternalLink,
  Users,
  X,
  Plus,
  Link,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";

interface ShareButtonProps {
  document: Doc<"documents">;
}

export function ShareButton({ document }: ShareButtonProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);

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
        <ShareModal
          document={document}
          onClose={() => setShowShareMenu(false)}
        />
      )}
    </div>
  );
}

function ShareModal({
  document,
  onClose,
}: {
  document: Doc<"documents">;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/share/${document._id}`;
  const [search, setSearch] = useState("");
  const users = useQuery(api.users.search, { query: search });
  const share = useMutation(api.documents.share);
  const unshare = useMutation(api.documents.unshare);
  const togglePublic = useMutation(api.documents.togglePublic);

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
    window.open(shareUrl, "_blank");
  };

  const handleShare = (userId: Id<"users">) => {
    share({ id: document._id, userId });
    toast.success("User added to share list");
  };

  const handleUnshare = (userId: Id<"users">) => {
    unshare({ id: document._id, userId });
    toast.success("User removed from share list");
  };

  return (
    <>
      <div className="absolute top-12 right-0 bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-xl shadow-xl z-20 py-4 min-w-[320px]">
        <div className="px-4 pb-3 border-b border-gray-200/50 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Share "{document.title}"
          </h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">

          {/* Share with People */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-gray-500" />
              <p className="text-sm font-medium text-gray-800">
                Share with People
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Search by email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {users?.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-2">
                    <img
                      src={user.pictureUrl}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  {document.sharedWith?.includes(user._id) ? (
                    <button
                      onClick={() => handleUnshare(user._id)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-full hover:bg-red-200"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      onClick={() => handleShare(user._id)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
                    >
                      Add
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="fixed inset-0 z-10" onClick={onClose} />
    </>
  );
}
