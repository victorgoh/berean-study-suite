export interface Env {
  BIBLEMATE_DATA?: R2Bucket;
  BEREAN_DATA?: R2Bucket;
  MORPHOLOGY_DB?: D1Database;
  REFERENCE_DB?: D1Database;
  API_KEY?: string;
  ENVIRONMENT?: string;
  ANALYTICS_SNIPPET?: string;
  CF_BEACON_TOKEN?: string;
}

export interface BibleVerse {
  book: string;
  book_number: number;
  chapter: number;
  verse: number;
  text: string;
  version: string;
}

export interface CrossReference {
  source_book: string;
  source_chapter: number;
  source_verse: number;
  target_book: string;
  target_chapter: number;
  target_verse: number;
  votes?: number;
}

export interface LexiconEntry {
  strongs: string;
  original: string;
  transliteration?: string;
  pronunciation?: string;
  definition: string;
  derivation?: string;
  kjv_def?: string;
}

export interface MorphologyWord {
  WordID?: number;
  Book: number;
  Chapter: number;
  Verse: number;
  Word: string;
  LexicalEntry?: string;
  MorphologyCode?: string;
  Morphology?: string;
  Lexeme?: string;
  Transliteration?: string;
  Pronunciation?: string;
  Interlinear?: string;
  Translation?: string;
  Gloss?: string;
}

export interface TopicResult {
  topic: string;
  code: string;
  content: string;
}

export interface CharacterResult {
  name: string;
  code: string;
  content: string;
  familyTree?: string;
}

export interface LocationResult {
  name: string;
  code: string;
  latitude: number;
  longitude: number;
  googleMapUrl: string;
  description: string;
}

export interface CommentaryResult {
  book: string;
  chapter: number;
  verses?: string;
  version: string;
  commentaryText: string;
}

export interface BookAnalysisResult {
  book: string;
  sections: { title: string; content: string }[];
}

export interface ChapterSummaryResult {
  book: string;
  chapter: number;
  summaryText: string;
}

export interface DailyReadingPlan {
  day: number;
  date: string;
  readings: string[];
  scriptures?: { reference: string; text: string }[];
}
