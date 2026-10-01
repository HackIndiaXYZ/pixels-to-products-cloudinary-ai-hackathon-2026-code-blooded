# Phase 15 — Multilingual: Hindi Subtitles & Cross-Language Ask

## Objective
India-first: a Hindi-medium learner can **watch an English lecture with Hindi subtitles** and **ask in Hindi**, getting a Hindi answer that cites the English lecture's moments.

## Design
- Upload preset: `auto_transcription: { translate: ["hi-IN"] }` produces `{id}.hi-IN.transcript`; the player offers a Hindi subtitle track
- Cross-language retrieval: if the question isn't in the library's language (e.g. Devanagari script), one fast `generateJson` call turns it into English search terms first; FTS runs on those; the answer prompt already answers "in the language of the question"
- Session language comes from the transcript (`lectures.language`, stored since Phase 01)

## Acceptance Criteria
"ओवरफिटिंग कैसे रोकें?" returns a Hindi answer citing the English overfitting lecture; the Watch page offers Hindi subtitles.
