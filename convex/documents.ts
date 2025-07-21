import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get user's private documents, shared documents, and public documents
    const [privateDocuments, sharedDocuments, publicDocuments] =
      await Promise.all([
        ctx.db
          .query("documents")
          .withIndex("by_creator", (q) => q.eq("createdBy", userId))
          .order("desc")
          .collect(),
        ctx.db
          .query("documents")
          .filter((q) =>
            q.and(
              q.neq(q.field("createdBy"), userId),
              q.eq(q.field("isPublic"), false),
              q.neq(q.field("sharedWith"), null),
              q.eq(
                q.field("sharedWith"),
                //@ts-ignore
                (q) => q.arrayContains(userId)
              )
            )
          )
          .order("desc")
          .collect(),
        ctx.db
          .query("documents")
          .withIndex("by_public", (q) => q.eq("isPublic", true))
          .order("desc")
          .collect(),
      ]);

    // Combine and deduplicate
    const allDocuments = [...privateDocuments];
    const docIds = new Set(privateDocuments.map((d) => d._id));

    for (const doc of sharedDocuments) {
      if (!docIds.has(doc._id)) {
        allDocuments.push(doc);
        docIds.add(doc._id);
      }
    }

    for (const doc of publicDocuments) {
      if (!docIds.has(doc._id)) {
        allDocuments.push(doc);
        docIds.add(doc._id);
      }
    }

    // Sort by last modified
    return allDocuments.sort((a, b) => b.lastModified - a.lastModified);
  },
});

export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    if (!args.query.trim()) {
      return [];
    }

    // Search in user's documents and public documents
    const [userResults, publicResults] = await Promise.all([
      ctx.db
        .query("documents")
        .withSearchIndex("search_title", (q) =>
          q.search("title", args.query).eq("createdBy", userId)
        )
        .take(10),
      ctx.db
        .query("documents")
        .withSearchIndex("search_title", (q) =>
          q.search("title", args.query).eq("isPublic", true)
        )
        .take(10),
    ]);

    // Combine and deduplicate
    const allResults = [...userResults];
    for (const doc of publicResults) {
      if (!allResults.find((d) => d._id === doc._id)) {
        allResults.push(doc);
      }
    }

    return allResults;
  },
});

export const get = query({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const document = await ctx.db.get(args.id);
    if (!document) {
      return null;
    }

    // Check if user can access this document
    const isShared = document.sharedWith?.includes(userId);
    if (!document.isPublic && document.createdBy !== userId && !isShared) {
      throw new Error("Access denied");
    }

    return document;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("documents", {
      title: args.title,
      isPublic: args.isPublic ?? false,
      createdBy: userId,
      lastModified: Date.now(),
    });
  },
});

export const togglePublic = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const document = await ctx.db.get(args.id);
    if (!document) {
      throw new Error("Document not found");
    }

    if (document.createdBy !== identity.subject) {
      throw new Error("Access denied");
    }

    await ctx.db.patch(args.id, {
      isPublic: !document.isPublic,
      lastModified: Date.now(),
    });
  },
});

export const updateTitle = mutation({
  args: {
    id: v.id("documents"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const document = await ctx.db.get(args.id);
    if (!document) {
      throw new Error("Document not found");
    }

    // Only creator can update title
    if (document.createdBy !== userId) {
      throw new Error("Access denied");
    }

    await ctx.db.patch(args.id, {
      title: args.title,
      lastModified: Date.now(),
    });
  },
});

export const share = mutation({
  args: {
    id: v.id("documents"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const document = await ctx.db.get(args.id);
    if (!document) {
      throw new Error("Document not found");
    }

    if (document.createdBy !== identity.subject) {
      throw new Error("Access denied");
    }

    const sharedWith = new Set(document.sharedWith ?? []);
    sharedWith.add(args.userId);

    await ctx.db.patch(args.id, {
      sharedWith: Array.from(sharedWith),
      lastModified: Date.now(),
    });
  },
});

export const unshare = mutation({
  args: {
    id: v.id("documents"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const document = await ctx.db.get(args.id);
    if (!document) {
      throw new Error("Document not found");
    }

    if (document.createdBy !== identity.subject) {
      throw new Error("Access denied");
    }

    const sharedWith = new Set(document.sharedWith ?? []);
    sharedWith.delete(args.userId);

    await ctx.db.patch(args.id, {
      sharedWith: Array.from(sharedWith),
      lastModified: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const document = await ctx.db.get(args.id);
    if (!document) {
      throw new Error("Document not found");
    }

    // Only creator can delete
    if (document.createdBy !== userId) {
      throw new Error("Access denied");
    }

    await ctx.db.delete(args.id);
  },
});
