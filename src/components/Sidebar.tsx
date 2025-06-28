import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Search, Plus, Globe, Lock, Trash2, MoreHorizontal, Sparkles, FileText } from "lucide-react";
import { toast } from "sonner";

interface SidebarProps {
  selectedDocumentId: Id<"documents"> | null;
  onSelectDocument: (id: Id<"documents"> | null) => void;
}

export function Sidebar({ selectedDocumentId, onSelectDocument }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocIsPublic, setNewDocIsPublic] = useState(false);

  const documents = useQuery(api.documents.list);
  const searchResults = useQuery(
    api.documents.search,
    searchQuery.trim() ? { query: searchQuery } : "skip"
  );
  const createDocument = useMutation(api.documents.create);
  const togglePublic = useMutation(api.documents.togglePublic);
  const removeDocument = useMutation(api.documents.remove);

  const displayedDocuments = searchQuery.trim() ? searchResults : documents;

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim()) return;

    try {
      const id = await createDocument({
        title: newDocTitle.trim(),
        isPublic: newDocIsPublic,
      });
      setNewDocTitle("");
      setNewDocIsPublic(false);
      setShowCreateForm(false);
      onSelectDocument(id);
      toast.success("Document created successfully");
    } catch (error) {
      toast.error("Failed to create document");
    }
  };

  const handleTogglePublic = async (id: Id<"documents">) => {
    try {
      await togglePublic({ id });
      toast.success("Document visibility updated");
    } catch (error) {
      toast.error("Failed to update document");
    }
  };

  const handleDeleteDocument = async (id: Id<"documents">) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      await removeDocument({ id });
      if (selectedDocumentId === id) {
        onSelectDocument(null);
      }
      toast.success("Document deleted");
    } catch (error) {
      toast.error("Failed to delete document");
    }
  };

  return (
    <div className="w-80 bg-white/80 backdrop-blur-md border-r border-gray-200/50 flex flex-col shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Documents
            </h2>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="p-2.5 text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            title="Create new document"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50/80 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-200 backdrop-blur-sm"
          />
        </div>
      </div>

      {/* Create Document Form */}
      {showCreateForm && (
        <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-indigo-50/50 to-purple-50/50">
          <form onSubmit={handleCreateDocument} className="space-y-4">
            <input
              type="text"
              placeholder="Document title..."
              value={newDocTitle}
              onChange={(e) => setNewDocTitle(e.target.value)}
              className="w-full px-4 py-3 bg-white/80 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-200 backdrop-blur-sm"
              autoFocus
            />
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isPublic"
                checked={newDocIsPublic}
                onChange={(e) => setNewDocIsPublic(e.target.checked)}
                className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
              />
              <label htmlFor="isPublic" className="text-sm font-medium text-gray-700">
                Make public
              </label>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewDocTitle("");
                  setNewDocIsPublic(false);
                }}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 text-sm font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Documents List */}
      <div className="flex-1 overflow-y-auto">
        {displayedDocuments === undefined ? (
          <div className="p-6 text-center">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : displayedDocuments.length === 0 ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">
              {searchQuery.trim() ? "No documents found" : "No documents yet"}
            </p>
          </div>
        ) : (
          <div className="p-3">
            {displayedDocuments.map((doc) => (
              <DocumentItem
                key={doc._id}
                document={doc}
                isSelected={selectedDocumentId === doc._id}
                onSelect={() => onSelectDocument(doc._id)}
                onTogglePublic={() => handleTogglePublic(doc._id)}
                onDelete={() => handleDeleteDocument(doc._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface DocumentItemProps {
  document: {
    _id: Id<"documents">;
    title: string;
    isPublic: boolean;
    createdBy: Id<"users">;
    lastModified: number;
  };
  isSelected: boolean;
  onSelect: () => void;
  onTogglePublic: () => void;
  onDelete: () => void;
}

function DocumentItem({
  document,
  isSelected,
  onSelect,
  onTogglePublic,
  onDelete,
}: DocumentItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const isOwner = loggedInUser?._id === document.createdBy;

  return (
    <div
      className={`group relative p-4 rounded-xl cursor-pointer transition-all duration-200 mb-2 ${
        isSelected
          ? "bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 shadow-lg transform scale-[1.02]"
          : "hover:bg-gray-50/80 border-2 border-transparent hover:shadow-md hover:transform hover:scale-[1.01]"
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              {document.title}
            </h3>
            {document.isPublic ? (
              <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded-lg">
                <Globe className="w-3 h-3" />
                <span className="text-xs font-medium">Public</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-lg">
                <Lock className="w-3 h-3" />
                <span className="text-xs font-medium">Private</span>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 font-medium">
            {new Date(document.lastModified).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>

        {isOwner && (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/80 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-10 bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-xl shadow-xl z-10 py-2 min-w-[140px]">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePublic();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors duration-150"
                >
                  {document.isPublic ? (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Make Private</span>
                    </>
                  ) : (
                    <>
                      <Globe className="w-4 h-4" />
                      <span>Make Public</span>
                    </>
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3 transition-colors duration-150"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}
