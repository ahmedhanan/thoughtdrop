import { desc, eq, and, ilike, inArray } from "drizzle-orm";
import { requireUser } from "@/lib/session";
import { getDbOrThrow } from "@/lib/db";
import { note, extraction, tag, noteTag } from "@/lib/schema";
import { ComposeBox } from "./ComposeBox";
import { NoteCard } from "./NoteCard";
import { TagFilter } from "./TagFilter";

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const user = await requireUser();
  const db = getDbOrThrow();

  const userTags = await db
    .select()
    .from(tag)
    .where(eq(tag.userId, user.id))
    .orderBy(tag.name);

  // Fetch matching note ids
  let noteIds: string[] = [];

  if (sp.tag) {
    // Filter by tag
    const rows = await db
      .select({ id: note.id })
      .from(note)
      .innerJoin(noteTag, eq(note.id, noteTag.noteId))
      .innerJoin(
        tag,
        and(eq(noteTag.tagId, tag.id), eq(tag.name, sp.tag), eq(tag.userId, user.id)),
      )
      .where(
        sp.q
          ? and(eq(note.userId, user.id), ilike(note.body, `%${sp.q}%`))
          : eq(note.userId, user.id),
      );
    noteIds = rows.map((r) => r.id);
  } else if (sp.q) {
    const rows = await db
      .select({ id: note.id })
      .from(note)
      .where(and(eq(note.userId, user.id), ilike(note.body, `%${sp.q}%`)));
    noteIds = rows.map((r) => r.id);
  } else {
    const rows = await db
      .select({ id: note.id })
      .from(note)
      .where(eq(note.userId, user.id));
    noteIds = rows.map((r) => r.id);
  }

  const notes = noteIds.length
    ? await db
        .select()
        .from(note)
        .where(inArray(note.id, noteIds))
        .orderBy(desc(note.createdAt))
    : [];

  const [extractions, noteTags] = await Promise.all([
    notes.length
      ? db
          .select()
          .from(extraction)
          .where(inArray(extraction.noteId, notes.map((n) => n.id)))
      : Promise.resolve([]),
    notes.length
      ? db
          .select({
            noteId: noteTag.noteId,
            tagName: tag.name,
            tagId: tag.id,
          })
          .from(noteTag)
          .innerJoin(tag, eq(noteTag.tagId, tag.id))
          .where(inArray(noteTag.noteId, notes.map((n) => n.id)))
      : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-6">
      <ComposeBox />
      <TagFilter tags={userTags} activeTag={sp.tag} searchQuery={sp.q} />
      <div className="space-y-4">
        {notes.map((n) => (
          <NoteCard
            key={n.id}
            note={n}
            extractions={extractions.filter((e) => e.noteId === n.id)}
            tags={noteTags.filter((t) => t.noteId === n.id)}
          />
        ))}
        {notes.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg">
              {sp.q || sp.tag ? "No notes match your filter." : "No notes yet."}
            </p>
            {!sp.q && !sp.tag && (
              <p className="text-sm mt-1">Start by dropping your first thought above.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
