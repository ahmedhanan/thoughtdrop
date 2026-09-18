import { streamText, tool, isStepCount } from "ai";
import { z } from "zod";
import { eq } from "drizzle-orm";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { getModel } from "@/lib/model";
import { extraction, tag, noteTag } from "@/lib/schema";
import type * as schema from "@/lib/schema";

type Db = NeonHttpDatabase<typeof schema>;

const SYSTEM = `You are a thought extractor. Given a stream-of-consciousness note, identify and save all meaningful items using your tools.

For each item you find:
- Action items or tasks the writer needs to do → call save_task
- Decisions or conclusions already made → call save_decision
- People mentioned by name → call save_person
- Dates, deadlines, meetings, or events → call save_event

At the end, always call set_tags once with 2–5 short lowercase topic tags that categorize the note (e.g. "work", "health", "project-alpha", "finance").

Be thorough but don't invent items not clearly implied by the note. If a category has nothing, skip it — don't call the tool with empty content.`;

export function buildNoteTools(noteId: string, userId: string, db: Db) {
  return {
    save_task: tool({
      description: "Save an action item the writer needs to do",
      inputSchema: z.object({
        content: z.string().describe("The task to do"),
        dueDate: z
          .string()
          .optional()
          .describe("Due date in YYYY-MM-DD format if mentioned"),
      }),
      execute: async ({ content, dueDate }) => {
        await db.insert(extraction).values({
          noteId,
          type: "task",
          content,
          metadata: dueDate ? { dueDate } : {},
          completed: false,
        });
        return `Saved task: "${content}"`;
      },
    }),

    save_decision: tool({
      description: "Save a decision or conclusion that was made",
      inputSchema: z.object({
        content: z.string().describe("The decision that was made"),
      }),
      execute: async ({ content }) => {
        await db.insert(extraction).values({
          noteId,
          type: "decision",
          content,
          metadata: {},
          completed: false,
        });
        return `Saved decision: "${content}"`;
      },
    }),

    save_person: tool({
      description: "Save a person mentioned in the note",
      inputSchema: z.object({
        name: z.string().describe("Person's name"),
        email: z.string().optional().describe("Email address if mentioned"),
        phone: z.string().optional().describe("Phone number if mentioned"),
      }),
      execute: async ({ name, email, phone }) => {
        await db.insert(extraction).values({
          noteId,
          type: "person",
          content: name,
          metadata: {
            ...(email ? { email } : {}),
            ...(phone ? { phone } : {}),
          },
          completed: false,
        });
        return `Saved person: "${name}"`;
      },
    }),

    save_event: tool({
      description: "Save a date, deadline, meeting, or calendar-worthy item",
      inputSchema: z.object({
        content: z.string().describe("Description of the event or deadline"),
        date: z
          .string()
          .optional()
          .describe("Date in YYYY-MM-DD format if mentioned"),
        location: z.string().optional().describe("Location if mentioned"),
      }),
      execute: async ({ content, date, location }) => {
        await db.insert(extraction).values({
          noteId,
          type: "event",
          content,
          metadata: {
            ...(date ? { date } : {}),
            ...(location ? { location } : {}),
          },
          completed: false,
        });
        return `Saved event: "${content}"`;
      },
    }),

    set_tags: tool({
      description: "Apply 2–5 short topic tags to categorize the note",
      inputSchema: z.object({
        tags: z
          .array(z.string())
          .min(1)
          .max(5)
          .describe("Short lowercase tag names"),
      }),
      execute: async ({ tags: tagNames }) => {
        for (const rawName of tagNames) {
          const name = rawName.toLowerCase().trim().slice(0, 50);
          if (!name) continue;

          const inserted = await db
            .insert(tag)
            .values({ userId, name })
            .onConflictDoNothing()
            .returning({ id: tag.id });

          let tagId = inserted[0]?.id;
          if (!tagId) {
            const [existing] = await db
              .select({ id: tag.id })
              .from(tag)
              .where(eq(tag.name, name));
            tagId = existing?.id;
          }

          if (tagId) {
            await db
              .insert(noteTag)
              .values({ noteId, tagId })
              .onConflictDoNothing();
          }
        }
        return `Applied tags: ${tagNames.join(", ")}`;
      },
    }),
  };
}

export function runNoteAgent(body: string, noteId: string, userId: string, db: Db) {
  return streamText({
    model: getModel(),
    system: SYSTEM,
    messages: [{ role: "user", content: body }],
    tools: buildNoteTools(noteId, userId, db),
    stopWhen: isStepCount(15),
  });
}
