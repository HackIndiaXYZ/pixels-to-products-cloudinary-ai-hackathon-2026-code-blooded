import "server-only";

import { query } from "@/lib/db";

export type LectureStatus = "processing" | "ready" | "transcript_failed";
export type Visibility = "unlisted" | "public";

export type Lecture = {
  id: string;
  publicId: string;
  title: string;
  speaker: string | null;
  status: LectureStatus;
  visibility: Visibility;
  durationS: number | null;
  createdAt: string;
};

type Row = {
  id: string;
  public_id: string;
  title: string;
  speaker: string | null;
  status: LectureStatus;
  visibility: Visibility;
  duration_s: number | null;
  created_at: Date;
};

const COLUMNS = "id, public_id, title, speaker, status, visibility, duration_s, created_at";

const toLecture = (r: Row): Lecture => ({
  id: r.id,
  publicId: r.public_id,
  title: r.title,
  speaker: r.speaker,
  status: r.status,
  visibility: r.visibility,
  durationS: r.duration_s,
  createdAt: r.created_at.toISOString(),
});

export async function createLecture(input: { title: string; speaker?: string }): Promise<Lecture> {
  const id = crypto.randomUUID();
  const rows = await query<Row>(
    `INSERT INTO lectures (id, public_id, title, speaker, rights_confirmed_at)
     VALUES ($1, $2, $3, $4, now()) RETURNING ${COLUMNS}`,
    [id, `pravaha/${id}`, input.title, input.speaker || null],
  );
  return toLecture(rows[0]!);
}

export async function listLectures({ includeAll }: { includeAll: boolean }): Promise<Lecture[]> {
  const where = includeAll ? "" : "WHERE status = 'ready' AND visibility = 'public'";
  const rows = await query<Row>(`SELECT ${COLUMNS} FROM lectures ${where} ORDER BY created_at DESC LIMIT 200`);
  return rows.map(toLecture);
}

export async function getLecture(id: string): Promise<Lecture | null> {
  const rows = await query<Row>(`SELECT ${COLUMNS} FROM lectures WHERE id = $1`, [id]);
  return rows[0] ? toLecture(rows[0]) : null;
}

export async function getLectureByPublicId(publicId: string): Promise<Lecture | null> {
  const rows = await query<Row>(`SELECT ${COLUMNS} FROM lectures WHERE public_id = $1`, [publicId]);
  return rows[0] ? toLecture(rows[0]) : null;
}

export async function updateLecture(
  id: string,
  patch: { visibility?: Visibility; title?: string; speaker?: string },
): Promise<Lecture | null> {
  const rows = await query<Row>(
    `UPDATE lectures SET
       visibility = coalesce($2, visibility),
       title      = coalesce($3, title),
       speaker    = coalesce($4, speaker),
       updated_at = now()
     WHERE id = $1 RETURNING ${COLUMNS}`,
    [id, patch.visibility ?? null, patch.title ?? null, patch.speaker ?? null],
  );
  return rows[0] ? toLecture(rows[0]) : null;
}
