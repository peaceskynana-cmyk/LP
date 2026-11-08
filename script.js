'use strict';
const STORAGE_KEY = 'encore-feedback-v1';
const $ = (s) => document.querySelector(s);
const sampleBands = ['カネコアヤノ', 'ASIAN KUNG-FU GENERATION', 'クリープハイプ'];
const sampleComments = [
 ['ギターの音が本当に気持ちよかった！最後の曲、また聴きたいです。', 'ボーカルの声とバンドの雰囲気がぴったりで、引き込まれました。', '会場が一体になる感じが最高でした。次のライブも楽しみにしています！'],
 ['ベースラインがかっこよくて、気づいたらずっと体が揺れてました。', '曲のつなぎが自然で、あっという間のステージでした！', 'ドラムとベースの一体感がすごい。余韻がまだ残っています。'],
 ['とにかく楽しかった！みんなの笑顔につられて笑顔になれました。', 'MCも演奏も大好きです。サビで一緒に歌えてうれしかった！', 'メンバー同士の空気感が素敵でした。また観たいバンドです。'],
 ['優しい歌声に癒されました。最後の曲が特に心に残っています。', 'アコースティックの響きがとてもきれいで、じっくり聴き入りました。', '一音ずつ丁寧に届けてくれる演奏で、とても温かい気持ちになりました。']
];
const sample = {source:'sample',records:sampleBands.flatMap((band,b)=>sampleComments[b].map((comment,i)=>({band,comment,author:['田中 ゆい','佐藤 みお','鈴木 はると'][i],respondent:'sample-'+i})))};
let dataset = sample;
let storageAvailable = true;
try {const raw=localStorage.getItem(STORAGE_KEY);if(raw){const parsed=JSON.parse(raw);if(parsed.source==='import'&&Array.isArray(parsed.records)&&parsed.records.every(r=>['band','comment','author','respondent'].every(k=>typeof r[k]==='string')))dataset=parsed;}}catch{storageAvailable=false;}
let activeBand = '';
let importedRows = [];
let toastTimer;
const iconStyles = ['', 'peach', 'blue', 'purple'];
const symbols = ['≋','♫','ϟ','☾'];
function element(tag, cls, text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}
function toast(text){$('#toast').textContent=text;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').hidden=true,3500);}
function groups(){const map=new Map();for(const r of dataset.records){if(!map.has(r.band))map.set(r.band,[]);map.get(r.band).push(r);}return [...map];}
function render(){
 const all=groups();const query=$('#search').value.trim().toLocaleLowerCase();
 $('#feedbackCount').textContent=dataset.records.length.toLocaleString();$('#bandCount').textContent=all.length;$('#respondentCount').textContent=new Set(dataset.records.map(r=>r.respondent)).size;
 $('#navCount').textContent=all.length;$('#bandTag').textContent=all.length+' BANDS';$('#tabCount').textContent=all.length;
 $('#datasetLabel').textContent=dataset.source==='sample'?'サンプルデータを表示中':'CSVから取り込んだ回答';$('#resetButton').hidden=dataset.source==='sample';
 $('#datasetHint').textContent=storageAvailable?'取り込んだ回答はこのブラウザに保存されます':'保存機能を利用できません。書き出して保存してください';
 const grid=$('#bandGrid');grid.replaceChildren();let shown=0;
 all.forEach(([name,records],index)=>{
 const matching=records.filter(r=>[name,r.author,r.comment].some(x=>x.toLocaleLowerCase().includes(query)));if(!matching.length)return;shown++;
 const card=element('article','band-card');const top=element('div','band-top');const cover=element('div','band-cover '+iconStyles[index%4],symbols[index%4]);cover.setAttribute('aria-hidden','true');top.append(cover);
 const heading=element('div','band-name');heading.append(element('h3','',name),element('p','','BAND '+String(index+1).padStart(2,'0')));top.append(heading);const total=element('span','band-total');total.append(element('b','',String(records.length)),document.createTextNode('件の感想'));top.append(total);card.append(top);
 card.append(element('p','quote','“ '+matching[0].comment+' ”'));const bottom=element('div','band-bottom');const authors=element('div','author-mini');const circles=element('span','mini-circles');const unique=[...new Set(records.map(r=>r.author))];unique.slice(0,3).forEach(n=>circles.append(element('span','',Array.from(n)[0])));authors.append(circles,document.createTextNode(unique.length+'人からのことば'));const button=element('button','view-feedback');button.append(document.createTextNode('感想を見る'),element('span','','→'));button.addEventListener('click',()=>openBand(name));bottom.append(authors,button);card.append(bottom);grid.append(card);
 });$('#emptyState').hidden=shown>0;
}
function openBand(name){activeBand=name;const records=dataset.records.filter(r=>r.band===name);$('#detailName').textContent=name;$('#detailCount').textContent=records.length+'件の感想 · 記入者とセットで表示しています';const list=$('#feedbackList');list.replaceChildren();for(const r of records){const article=element('article','feedback-item');const author=element('div','author');author.append(element('span','avatar',Array.from(r.author)[0]),document.createTextNode(r.author));article.append(author,element('p','',r.comment));list.append(article);}$('#bandDialog').showModal();}
function csvCell(value){let text=String(value);if(/^[\s]*[=+@-]/.test(text)||/^[\t\r]/.test(text))text="'"+text;return '"'+text.replaceAll('"','""')+'"';}
function exportCSV(records,name){const rows=[['バンド名','記入者','感想'],...records.map(r=>[r.band,r.author,r.comment])];const blob=new Blob(['\uFEFF'+rows.map(r=>r.map(csvCell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name.replace(/[\\/:*?"<>|]/g,'_')+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('CSVを書き出しました');}
// RFC 4180 style parser: quoted commas, escaped quotes and embedded newlines.
function parseCSV(text){text=text.replace(/^\uFEFF/,'');const rows=[];let row=[],field='',quoted=false,closed=false;for(let i=0;i<text.length;i++){const c=text[i];if(quoted){if(c==='"'){if(text[i+1]==='"'){field+='"';i++;}else{quoted=false;closed=true;}}else field+=c;}else if(c==='"'){if(field||closed)throw Error('引用符の形式が正しくありません。CSVを再ダウンロードしてください。');quoted=true;}else if(c===','){row.push(field);field='';closed=false;}else if(c==='\n'||c==='\r'){if(c==='\r'&&text[i+1]==='\n')i++;row.push(field);if(row.some(x=>x.trim()))rows.push(row);row=[];field='';closed=false;}else{if(closed)throw Error('引用符の後に不正な文字があります。');field+=c;}}if(quoted)throw Error('CSVの引用符が閉じていません。');row.push(field);if(row.some(x=>x.trim()))rows.push(row);return rows;}
function openImport(){importedRows=[];$('#csvFile').value='';$('#importError').textContent='';$('#mappingForm').hidden=true;$('#importStepOne').hidden=false;$('#importDialog').showModal();}
$('#csvFile').addEventListener('change',async event=>{const file=event.target.files[0];if(!file)return;$('#importError').textContent='';try{if(file.size>5*1024*1024)throw Error('5MB以下のCSVを選択してください。');const bytes=await file.arrayBuffer();let text;try{text=new TextDecoder('utf-8',{fatal:true}).decode(bytes);}catch{throw Error('UTF-8形式のCSVを選択してください。Googleスプレッドシートから再ダウンロードできます。');}const rows=parseCSV(text);if(rows.length<2||rows[0].length<2)throw Error('見出しと回答を含む、2列以上のCSVが必要です。');if(rows.some(r=>r.length!==rows[0].length))throw Error('列数が一致しない行があります。CSVの形式を確認してください。');if(rows[0].some(h=>!h.trim()))throw Error('見出しが空の列があります。すべての列に見出しを付けてください。');importedRows=rows;const headers=rows[0];const author=$('#authorColumn');author.replaceChildren();headers.forEach((h,i)=>{const o=element('option','',h);o.value=i;author.append(o);});let preferred=headers.findIndex(h=>/記入者|回答者|名前|氏名|name/i.test(h));author.value=preferred>=0?preferred:0;
 const mappings=$('#columnMappings');mappings.replaceChildren();headers.forEach((h,i)=>{const line=element('div','mapping-row');line.dataset.column=i;const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.id='column-'+i;checkbox.checked=!/タイムスタンプ|timestamp|メール|email|学年|所属|名前|氏名|記入者|回答者/i.test(h);checkbox.setAttribute('aria-label',h+'を感想として取り込む');const label=element('label','',h);label.htmlFor=checkbox.id;const band=document.createElement('input');band.type='text';band.value=h.replace(/^(?:感想[：:]\s*)/,'').replace(/(?:[のへの]*感想|について)[はを]?\s*[。？?]?$/,'').trim()||h;band.maxLength=120;band.setAttribute('aria-label',h+'のバンド名');line.append(checkbox,label,band);mappings.append(line);});updateMapping();$('#fileInfo').textContent=file.name+' · '+(rows.length-1)+'件の回答';$('#mappingForm').hidden=false;$('#importStepOne').hidden=true;}catch(error){$('#importError').textContent=error.message;}});
function updateMapping(){document.querySelectorAll('.mapping-row').forEach(row=>{const isAuthor=Number(row.dataset.column)===Number($('#authorColumn').value);row.hidden=isAuthor;const checkbox=row.querySelector('[type=checkbox]');checkbox.disabled=isAuthor;row.querySelector('[type=text]').disabled=isAuthor;if(isAuthor)checkbox.checked=false;});}
$('#authorColumn').addEventListener('change',updateMapping);
$('#mappingForm').addEventListener('submit',event=>{event.preventDefault();$('#importError').textContent='';const authorIndex=Number($('#authorColumn').value);const mappings=[...document.querySelectorAll('.mapping-row')].filter(r=>!r.hidden&&r.querySelector('[type=checkbox]').checked).map(r=>({column:Number(r.dataset.column),name:r.querySelector('[type=text]').value.trim()}));if(!mappings.length){$('#importError').textContent='感想の列を1つ以上選んでください。';return;}if(mappings.some(m=>!m.name)){ $('#importError').textContent='選択した列にバンド名を入力してください。';return;}if(new Set(mappings.map(m=>m.name)).size!==mappings.length){$('#importError').textContent='バンド名が重複しています。異なる名前を指定してください。';return;}const records=[];let unnamed=0;importedRows.slice(1).forEach((row,index)=>{if(!mappings.some(m=>row[m.column].trim()))return;const author=row[authorIndex].trim();if(!author)unnamed++;mappings.forEach(m=>{const comment=row[m.column].trim();if(comment)records.push({band:m.name,author:author||'記入者未入力（回答 '+(index+1)+'）',comment,respondent:'row-'+index});});});if(!records.length){$('#importError').textContent='選択した列に感想がありません。列の選択を確認してください。';return;}dataset={source:'import',records};try{localStorage.setItem(STORAGE_KEY,JSON.stringify(dataset));storageAvailable=true;}catch{storageAvailable=false;}$('#search').value='';render();$('#importDialog').close();toast(records.length+'件の感想を取り込みました'+(unnamed?'（記入者未入力 '+unnamed+'行）':'')+(storageAvailable?'':'。保存できないため書き出してください'));});
$('#resetButton').addEventListener('click',()=>{if(!confirm('取り込んだ回答をこのブラウザから削除し、サンプル表示に戻しますか？'))return;try{localStorage.removeItem(STORAGE_KEY);}catch{toast('保存データを削除できませんでした');return;}dataset=sample;$('#search').value='';render();toast('取り込んだ回答を削除しました');});
['#importButton','#navImport','#bottomImport'].forEach(s=>$(s).addEventListener('click',openImport));
['#guideButton','#heroGuide'].forEach(s=>$(s).addEventListener('click',()=>$('#guideDialog').showModal()));
$('#navOverview').addEventListener('click',()=>{window.scrollTo({top:0,behavior:'smooth'});document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));$('#navOverview').classList.add('active');});
$('#navBands').addEventListener('click',()=>{$('#bandsSection').scrollIntoView({behavior:'smooth'});document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));$('#navBands').classList.add('active');});
$('#search').addEventListener('input',render);document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key==='k'&&!document.querySelector('dialog[open]')){e.preventDefault();$('#search').focus();}});
$('#exportAll').addEventListener('click',()=>exportCSV(dataset.records,'encore_すべての感想'));
$('#exportBand').addEventListener('click',()=>exportCSV(dataset.records.filter(r=>r.band===activeBand),'encore_'+activeBand));
$('#copyFeedback').addEventListener('click',async()=>{const text=activeBand+' に届いた感想\n\n'+dataset.records.filter(r=>r.band===activeBand).map(r=>r.author+'さんより\n'+r.comment).join('\n\n──────────\n\n');try{await navigator.clipboard.writeText(text);toast('記入者付きで感想をコピーしました');}catch{toast('コピーできませんでした。CSV書き出しをご利用ください');}});
for(const button of document.querySelectorAll('.close-dialog'))button.addEventListener('click',()=>button.closest('dialog').close());
render();
