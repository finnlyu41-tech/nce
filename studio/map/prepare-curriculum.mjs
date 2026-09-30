// Rebuild the map's source-bound exercise excerpts from the existing packaged textbooks.
import fs from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
const root = new URL('../', import.meta.url);
const read = async p => JSON.parse(await fs.readFile(new URL(p, root), 'utf8'));
const splitSource = stripTypeScriptTypes(await fs.readFile(new URL('app/lesson-structure.ts', root), 'utf8'));
const {splitLesson} = await import(`data:text/javascript;base64,${Buffer.from(splitSource).toString('base64')}`);
const pages = await read('dist-online/lesson-pages/index.json');
const grammar = await read('app/data/textbook-grammar.json');
const units = [];
for (const entry of grammar.entries.filter(e => ['NCE1', 'NCE2'].includes(e.book))) {
  const {book, lesson, lastLesson} = entry;
  const source = await read(`dist-online/language/${book}/${lesson}.json`);
  const body = splitLesson(source.rows, book, true).body;
  const seen = new Set();
  const candidates = body.flatMap(row => {
    const index = source.rows.indexOf(row), next = source.rows[index + 1];
    const key = row.en.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (seen.has(key) || !row.zh || row.en.split(/\s+/).length < 2 || row.en.split(/\s+/).length > 24) return [];
    seen.add(key);
    return [{en: row.en, zh: row.zh, start: row.time, end: next?.time ?? row.time + Math.max(3, row.en.split(/\s+/).length * .55)}];
  });
  const rows = candidates.length <= 12 ? candidates : Array.from({length: 12}, (_, i) => candidates[Math.floor(i * candidates.length / 12)]);
  if (rows.length < 4) throw Error(`${book}-${lesson}: insufficient independent source excerpts`);
  units.push({id: `${book.toLowerCase()}-${lesson}`, book, lesson, lastLesson, title: pages.lessons[`${book}-${lesson}`].title, sourceSha256: source.sourceSha256, rows});
}
await fs.writeFile(new URL('map/curriculum.json', root), JSON.stringify(units, null, 2) + '\n');
console.log(`Prepared ${units.length} source-bound units; NCE1 pairs and NCE2 lessons, using original timestamps.`);
