import { OFFICIAL_BOOK_NAMES } from "./constants.js";

export const RESOURCE_DEFINITIONS = [
  {
    uri: "berean://canon/protestant",
    name: "Protestant Bible Canon",
    description: "Full list of 66 Protestant Bible books with canonical indices and testament classification.",
    mimeType: "application/json"
  },
  {
    uri: "berean://reading-plans/mcheyne",
    name: "Robert Murray M'Cheyne Reading Plan",
    description: "Daily Scripture reading plan covering the Old Testament once and the New Testament and Psalms twice a year.",
    mimeType: "application/json"
  }
];

export function getResourceContent(uri: string): string | null {
  if (uri === "berean://canon/protestant") {
    const books = OFFICIAL_BOOK_NAMES.slice(1).map((name, idx) => ({
      book_number: idx + 1,
      name,
      testament: idx + 1 <= 39 ? "Old Testament" : "New Testament"
    }));
    return JSON.stringify({ canon: "Protestant", total_books: 66, books }, null, 2);
  }
  
  if (uri === "berean://reading-plans/mcheyne") {
    return JSON.stringify({
      name: "M'Cheyne Daily Bible Reading Plan",
      description: "Classic 4-reading daily plan covering OT once, NT/Psalms twice."
    }, null, 2);
  }

  return null;
}
