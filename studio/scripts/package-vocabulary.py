"""Attach reviewed textbook vocabulary to existing page metadata and local dictionary.

Input stays outside Git, as do the textbook-derived language and page bundles.
Run after package-lesson-pages.py and package-language.py.
"""
from pathlib import Path
import argparse,csv,hashlib,json,re

parser=argparse.ArgumentParser()
parser.add_argument('vocabulary',type=Path)
parser.add_argument('dictionary',type=Path)
parser.add_argument('--out',type=Path,default=Path('dist-online'))
args=parser.parse_args()
data=json.loads(args.vocabulary.read_text())
page_path=args.out/'lesson-pages/index.json'
pages=json.loads(page_path.read_text())
language_path=args.out/'language/index.json'
language=json.loads(language_path.read_text())
dictionary_path=args.out/'language/dictionary.json'
dictionary=json.loads(dictionary_path.read_text())
assert data['version']==1 and data['sources']==pages['sources'], 'Vocabulary uses a different textbook edition'
assert set(data['lessons'])==set(pages['lessons']), 'Vocabulary must account for every lesson'
needed={w.lower() for entry in data['lessons'].values() for w in entry['words']}
entries={}
with args.dictionary.open(newline='') as source:
 for row in csv.DictReader(source):
  key=row['word'].lower().replace('’',"'")
  if key not in needed:continue
  meaning='\n'.join(row['translation'].replace('\\n','\n').splitlines()[:4])[:600]
  if not meaning:continue
  ipa=row['phonetic'].replace('ә','ə').replace("'",'ˈ').replace(',','ˌ').replace(':','ː').replace('g','ɡ')
  ipa=re.sub(r'i(?!ː)','ɪ',ipa);ipa=re.sub(r'u(?!ː)','ʊ',ipa)
  forms=[p.split(':',1)[1] for p in row['exchange'].split('/') if ':' in p]
  entries[key]={'word':row['word'],'ipa':ipa[:100],'meaning':meaning,'forms':list(dict.fromkeys(forms))}
for key,entry in data.get('dictionaryOverrides',{}).items():
 assert key in needed and entry['word'].lower()==key and entry['meaning']
 entries[key]={**entry,'source':'textbook','forms':entry.get('forms',[])}
assert needed<=entries.keys(), 'Dictionary entries need review: '+str(sorted(needed-entries.keys()))
count=0
for key,entry in data['lessons'].items():
 lesson=pages['lessons'][key]
 assert isinstance(entry['words'],list) and len(entry['words'])<=100
 assert len(set(w.lower() for w in entry['words']))==len(entry['words'])
 assert entry['pages'] and set(entry['pages'])<={p['page'] for p in lesson['pages']}
 assert all(isinstance(w,str) and 0<len(w)<=100 for w in entry['words'])
 lesson['vocabulary']={'pages':entry['pages'],'words':[{'word':w,'forms':entries[w.lower()]['forms']} for w in entry['words']]}
 count+=len(entry['words'])
for key,entry in entries.items():
 if key not in dictionary['words']:
  dictionary['words'][key]={k:v for k,v in entry.items() if k!='forms'}
pages['vocabulary']={'version':1,'entries':count,'lessons':len(data['lessons']),'inputSha256':hashlib.sha256(args.vocabulary.read_bytes()).hexdigest()}
raw=(json.dumps(dictionary,ensure_ascii=False,separators=(',',':'))+'\n').encode()
language['files']['dictionary.json']={'size':len(raw),'sha256':hashlib.sha256(raw).hexdigest()}
language['words']=len(dictionary['words'])
# Validate everything above before replacing any derived asset.
for path,content in [(dictionary_path,raw),(language_path,(json.dumps(language,ensure_ascii=False,indent=2)+'\n').encode()),(page_path,(json.dumps(pages,ensure_ascii=False,separators=(',',':'))+'\n').encode())]:
 temporary=path.with_suffix('.tmp');temporary.write_bytes(content);temporary.replace(path)
print(json.dumps({'lessons':len(data['lessons']),'vocabularyEntries':count,'dictionaryWords':language['words']},ensure_ascii=False))
