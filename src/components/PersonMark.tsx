"use client";

import type { PersonId } from "../data";

export function PersonMark({ person, small = false }: { person: PersonId; small?: boolean }) {
  return <span className={`person-mark ${person} ${small ? "small" : ""}`}>{person === "brother" ? "弟" : person === "sister" ? "姐" : "妈"}</span>;
}
