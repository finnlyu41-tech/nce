"""Extract only public practice prompts, never personal answers or recordings."""
from pathlib import Path
import argparse,hashlib,json,re
from openpyxl import load_workbook

p=argparse.ArgumentParser();p.add_argument('--source',type=Path,required=True);p.add_argument('--translations',type=Path,required=True);p.add_argument('--out',type=Path,default=Path('dist-online/speaking/topics.json'));a=p.parse_args()
zh=json.loads(a.translations.read_text());topics=[];sources=[]
names=['工作','学习','居住地','博物馆','开心的事','鞋子','规则','水果与蔬菜','与长辈相处','公共场所','拥挤的地方','广告','借东西','休息','交谈','随身物品']
def clean(s):
    return re.sub(r'\s+',' ',str(s or '')).strip().replace('？','?').replace('habitas','habitats').replace('businesss','businesses').replace('vehicles that electricity','vehicles that use electricity')
for part in [1,2,3]:
    path=a.source/f'Part {part}'/f'Speaking summary - Part {part}.xlsx'
    w=load_workbook(path,read_only=True,data_only=True);sheet=w.worksheets[-1]
    sources.append({'part':part,'name':path.name,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
    current=None
    for rowno,row in enumerate(sheet.values,1):
        if rowno==1:continue
        if part==1:
            if isinstance(row[0],int):
                current={'id':f'bank-1-{row[0]}','part':1,'title':names[row[0]-1],'topic':clean(row[1]),'questions':[]};topics.append(current)
            if current and row[2]:
                en=re.sub(r'^\d+\s*\.\s*','',clean(row[2]));i=len(current['questions']);n=int(current['id'].split('-')[-1])
                current['questions'].append({'en':en,'zh':zh['p1'][n-1][i],'sourceRow':rowno})
        elif part==2:
            if isinstance(row[0],int) and row[2]:
                en=clean(row[2])
                n=row[0];topics.append({'id':f'bank-2-{n}','part':2,'title':zh['p2'][n-1][0],'topic':clean(row[1]),'questions':[{'en':en,'zh':'描述'+zh['p2'][n-1][0]+'。\n请说清：'+zh['p2'][n-1][1]+'。','sourceRow':rowno}]})
        else:
            if row[0] and re.match(r'^\d+\.',clean(row[0])):
                m=re.match(r'^(\d+)\.\s*(.+)',clean(row[0]));n=int(m[1]);current={'id':f'bank-3-{n}','part':3,'title':m[2],'topic':m[2],'questions':[]};topics.append(current)
            if current and row[1] and re.match(r'^Q\d+\.',clean(row[1])):
                en=re.sub(r'^Q\d+\.\s*','',clean(row[1]));i=len(current['questions']);n=int(current['id'].split('-')[-1]);current['questions'].append({'en':en,'zh':zh['p3'][n-1][i],'sourceRow':rowno})
    w.close()
assert [sum(t['part']==p for t in topics) for p in [1,2,3]]==[16,25,25]
assert sum(len(t['questions']) for t in topics)==238
for t in topics:
    assert t['questions'] and all(q['en'] and q['zh'] for q in t['questions'])
output={'version':1,'notice':'按学习者提供的 Part 1–3 题库整理，题库为历史练习素材；示范与步骤由本站编写。不是当前考题预测。','sources':sources,'topics':topics}
a.out.parent.mkdir(parents=True,exist_ok=True);a.out.write_text(json.dumps(output,ensure_ascii=False,separators=(',',':'))+'\n')
print('Packaged 66 topic groups and 238 bilingual prompts; personal answer columns and recordings excluded.')
