# Vision — Pravaha

*Pravaha (प्रवाह) — "flow." Knowledge that was locked in recordings, flowing again.*

## The Thesis

Every institution is sitting on a library of recorded knowledge it can't use. India alone records millions of hours a year of lectures, coaching classes, club talks, webinars and trainings. Almost none of it is ever watched twice, because video is the one format you can't search, skim or quote.

Pravaha makes recorded knowledge behave like text — searchable, askable, quotable — without losing what makes video valuable: **the real person explaining it.** Every answer is a moment you can watch. Every moment is a clip you can share.

## Why This Can Be a Company

| | |
|---|---|
| **Wedge** | College clubs and departments — free, our own campus first, viral through shared Moments |
| **Paying customer** | Coaching institutes (the Kota-to-Kochi market): a private, searchable, askable archive of every class is a retention and sales tool — "ask any doubt, get your teacher's answer at 2 a.m." |
| **Expansion** | Companies: all-hands, onboarding, sales calls, trainings — the same "ask the archive" job with a bigger budget |
| **Growth loop** | Moments are branded vertical clips shared on WhatsApp and Instagram; each links back to the full session — content markets the library |
| **Moat over time** | An institution's corpus, its curated Moments, and what learners actually ask — usage data no general chatbot has |
| **Unit economics** | Media AI, transforms and delivery are Cloudinary usage-priced; the LLM runs only on questions, capped per seat — cost scales with value delivered |

## What We Ship This Weekend vs. What It Becomes

| Stage | Capabilities |
|---|---|
| **Hackathon MVP (Oct 1–4)** | Watch · Find · Ask with clip citations · Moments · organizer Studio · unlisted-by-default |
| **Campus beta (Nov)** | Institute workspaces + accounts (NextAuth), multiple organizers, Hindi/Tamil/Telugu subtitles via `auto_transcription.translate`, Moment analytics |
| **Institutes (Q1)** | Private libraries per batch, "doubt desk" Ask embedded in WhatsApp, quiz and flashcards generated from sessions with clip-backed answers, LMS embeds |
| **Scale** | Semantic retrieval (embeddings) alongside keyword search, multilingual Ask (ask in Hindi, cite an English lecture), speaker-level search, enterprise SSO |

The MVP is deliberately the smallest complete version of the full loop: **record → understand → find → answer → share.** Every later stage deepens one link of that loop; none of them changes its shape.

## Why Cloudinary Is the Foundation, Not a Vendor

Each stage above leans harder on Cloudinary: more languages from `auto_transcription`, more Moments from transformations, more delivery as libraries grow. Pravaha's own engineering stays where it belongs — retrieval, grounding, trust, and the experience — while Cloudinary carries the media. That split is what lets a three-person team ship a product that would otherwise need a video infrastructure team.
