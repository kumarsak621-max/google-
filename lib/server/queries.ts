export const BEHAVIORAL_QUERIES = [
  '"Google Photos" "can\'t find" photo',
  '"Google Photos" "can\'t remember" photo',
  '"Google Photos" "don\'t remember the date"',
  '"Google Photos" "can\'t remember where" picture',
  '"Google Photos" "old photo" "can\'t find"',
  '"Google Photos" "picture I took" "can\'t find"',
  '"Google Photos" "I know I have" photo',
  '"Google Photos" "I remember" photo "can\'t find"',
  '"Google Photos" "search doesn\'t find" photos',
  '"Google Photos" screenshot "can\'t find"',
  '"Google Photos" document "can\'t find"',
  '"Google Photos" receipt "can\'t find"',
  '"Google Photos" vacation photo "can\'t find"',
  'site:reddit.com/r/googlephotos "can\'t find" photo',
  'site:support.google.com/photos/thread search "can\'t find"',
];

export function extraQueriesFromFindings(snippets: string[]): string[] {
  const extra: string[] = [];
  const blob = snippets.join(" ").toLowerCase();
  if (blob.includes("screenshot")) extra.push('"Google Photos" OCR screenshot search');
  if (blob.includes("face")) extra.push('"Google Photos" face search name not found');
  if (blob.includes("classic")) extra.push('"Google Photos" Ask Photos classic search date');
  if (blob.includes("map") || blob.includes("location")) extra.push('"Google Photos" heatmap "remember the date"');
  return extra;
}
