import type {ReactNode} from 'react';
import {BookOpen, Languages, Library, RotateCcw, ChartNoAxesCombined} from 'lucide-react';
import type {StudioSection} from './studio-navigation';
import type {NceBookId} from './model';
import './study-mode.css';

export function StudioHeader({active,mapUrl='/map/',classicRoot='/',reference,actions}:{active:StudioSection;mapUrl?:string;classicRoot?:string;reference?:{book:NceBookId;lesson:number};actions?:ReactNode}) {
  const context=reference?`/${reference.book}/${reference.lesson}`:'';
  return <header className="studio-header">
    <a className="studio-brand" href={mapUrl}><span className="studio-brand-icon">E.</span><span>句句有进步<small>ENGLISH STUDIO</small></span></a>
    <nav className="studio-navigation" aria-label="学习空间导航">
      {([['learn','学习',mapUrl,BookOpen],['words','单词',`${classicRoot}#/words${context}?tab=book`,Languages],['grammar','句型语法',`${classicRoot}#/grammar?tab=path`,Library],['review','复习',`${classicRoot}#/review`,RotateCcw],['records','记录',`${classicRoot}#/progress`,ChartNoAxesCombined]] as const).map(([id,label,href,Icon])=><a key={id} href={href} aria-current={active===id?'page':undefined}><Icon size={18}/><span>{label}</span></a>)}
    </nav>
    <div className="studio-header-actions">{actions||<span className="studio-local">学习进度保存在本机</span>}</div>
  </header>;
}
