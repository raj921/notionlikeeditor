import { components } from "./_generated/api";
import { ProsemirrorSync } from "@convex-dev/prosemirror-sync";
import { getAuthUserId } from "@convex-dev/auth/server";
import { DataModel, Id } from "./_generated/dataModel";
import { GenericQueryCtx, GenericMutationCtx } from "convex/server";

const prosemirrorSync = new ProsemirrorSync(components.prosemirrorSync);

async function checkPermissions(
  ctx: GenericQueryCtx<DataModel> | GenericMutationCtx<DataModel>,
  documentId: string
) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Not authenticated");
  }

  const document = await ctx.db.get(documentId as Id<"documents">);
  if (!document) {
    throw new Error("Document not found");
  }

  // Check if user can access this document
  if (!document.isPublic && document.createdBy !== userId) {
    throw new Error("Access denied");
  }
}

async function checkWritePermissions(
  ctx: GenericMutationCtx<DataModel>,
  documentId: string
) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Not authenticated");
  }

  const document = await ctx.db.get(documentId as Id<"documents">);
  if (!document) {
    throw new Error("Document not found");
  }

  // For now, anyone who can read can also write
  // You could make this more restrictive for public documents
  if (!document.isPublic && document.createdBy !== userId) {
    throw new Error("Access denied");
  }
}

export const {
  getSnapshot,
  submitSnapshot,
  latestVersion,
  getSteps,
  submitSteps,
} = prosemirrorSync.syncApi<DataModel>({
  checkRead: checkPermissions,
  checkWrite: checkWritePermissions,
  onSnapshot: async (ctx, id, snapshot, version) => {
    // Update the document's last modified time when content changes
    const document = await ctx.db.get(id as Id<"documents">);
    if (document) {
      await ctx.db.patch(id as Id<"documents">, {
        lastModified: Date.now(),
      });
    }
  },
});
