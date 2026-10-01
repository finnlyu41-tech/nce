import {bookNames} from './study-path';
import type {DisplayExample} from './vocabulary-usage';
import './vocabulary-examples.css';

export function VocabularyExamples({examples}:{examples:DisplayExample[]}){
 if(!examples.length)return null;
 return <div className="vocabulary-usage" aria-label="双语例句与搭配">{examples.map((example,index)=><div className="vocabulary-usage-item" key={index}>
  <p className="vocabulary-usage-label">{example.origin==='original'?'本站原创例句':example.origin==='textbook'?'教材原句':'已保存例句'}{example.partOfSpeech&&' · '+example.partOfSpeech}{example.sense&&' · '+example.sense}{example.source&&<a href={'#/words/'+example.source.book+'/'+example.source.lesson+'?tab=book'}>{bookNames[example.source.book]} · 第 {example.source.lesson} 课</a>}{example.teachingSources?.map(source=><a key={source.book+'-'+source.lesson} href={'#/words/'+source.book+'/'+source.lesson+'?tab=book'}>关联词表：{bookNames[source.book]} · 第 {source.lesson} 课</a>)}</p>
  {example.collocation&&<p className="vocabulary-collocation"><span>常用搭配：</span><strong lang="en">{example.collocation.en}</strong><span> · {example.collocation.zh}</span></p>}
  <p lang="en" className="vocabulary-usage-english">{example.en}</p>
  {example.zh?.trim()?<p lang="zh-CN" className="vocabulary-usage-chinese">{example.zh}</p>:<p className="muted small">这句暂未提供中文翻译。</p>}
  {example.origin==='textbook'&&<p className="muted small">结合这一句的语境核对词义；原句不代表词典中的所有义项。</p>}
 </div>)}</div>;
}
