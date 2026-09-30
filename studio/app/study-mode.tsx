import type {ReactNode} from 'react';
import {BookOpen, Map, RotateCcw, ChartNoAxesCombined} from 'lucide-react';
import './study-mode.css';

export function StudioHeader({active,mapUrl='/map/',classicRoot='/',actions}:{active:'map'|'courses'|'review'|'records';mapUrl?:string;classicRoot?:string;actions?:ReactNode}) {
  return <header className="studio-header">
    <a className="studio-brand" href={mapUrl}><span className="studio-brand-icon">E.</span><span>句句有进步<small>ENGLISH STUDIO</small></span></a>
    <nav className="studio-navigation" aria-label="学习空间导航">
      {([['map','学习地图',mapUrl,Map],['courses','课程',`${classicRoot}#/library`,BookOpen],['review','复习',`${classicRoot}#/review`,RotateCcw],['records','记录',`${classicRoot}#/progress`,ChartNoAxesCombined]] as const).map(([id,label,href,Icon])=><a key={id} href={href} aria-current={active===id?'page':undefined}><Icon size={18}/><span>{label}</span></a>)}
    </nav>
    <div className="studio-header-actions">{actions||<span className="studio-local">学习进度保存在本机</span>}</div>
  </header>;
}
