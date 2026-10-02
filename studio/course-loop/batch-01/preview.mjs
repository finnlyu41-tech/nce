// Reviewer-only bootstrap. The local runner binds the unchanged v30 renderer
// and model in memory; this page writes no production or learning state.
const id=new URL(location.href).searchParams.get('course');
const supported=['nce1-3','nce1-5'];
if(!supported.includes(id)){
 document.querySelector('h1').textContent='课程标识不受支持';
 document.querySelector('#error').textContent='请指定 nce1-3 或 nce1-5；不会改用第1–2课。';
}else{
 const {lesson}=await import(`/content/${id}.mjs`);
 document.title=lesson.title+' · 内容审阅预览';
 document.querySelector('h1').textContent=lesson.title;
 await import(`/render/${id}.mjs`);
}
