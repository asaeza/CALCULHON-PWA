 'use strict';
function option(select,codes){for(const x of codes){const el=document.createElement('option');el.value=x.code;el.textContent=x.code+' · '+x.label;select.appendChild(el)}}
option(document.getElementById('H14'),MODELO.intervenciones);option(document.getElementById('H15'),MODELO.obras);
document.getElementById('H14').value='14';document.getElementById('H15').value='11';
const euro=new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'});
const form=document.getElementById('datos');
const historyKey='calculhon-history-v09';
const titles=[{label:'Honorarios de Dirección (DEM)',cell:'F32'},{label:'Honorarios de Control de Calidad',cell:'F37'},{label:'Honorarios de Seguridad y Salud',cell:'F49'},{label:'Honorarios de Demoliciones',cell:'F58'}];
let current=null;
function getSaved(){try{let r=JSON.parse(localStorage.getItem(historyKey)||'[]');return Array.isArray(r)?r:[]}catch{return []}}
function saveAll(items){try{localStorage.setItem(historyKey,JSON.stringify(items));return true}catch{alert('No se ha podido guardar el historial en este navegador.');return false}}
function readFields(){let raw={};for(const el of form.querySelectorAll('input,select,textarea'))if(el.id)raw[el.id]=el.value;return raw}
function parseInputs(raw){const inputs={};for(const [key,value] of Object.entries(raw)){if(['cliente','obra_nombre','obra_direccion','obra_notas'].includes(key))continue;inputs[key]=['H9','H16'].includes(key)?value:Number(value)}inputs.H22/=100;return inputs}
function calculate(preserve){const raw=readFields(),inputs=parseInputs(raw);
 if(!Number.isFinite(inputs.H17)||inputs.H17<=0||!Number.isFinite(inputs.H18)||inputs.H18<=0||!Number.isFinite(inputs.H13)||inputs.H13<=0||!Number.isFinite(inputs.H22)||inputs.H22<=0){alert('Introduce PEM, superficie, factor de actualización y participación con valores mayores que cero.');return}
 const engine=new Engine(MODELO,inputs),items=[],box=document.getElementById('resultados');box.replaceChildren();
 for(const x of titles){if(x.cell==='F49'&&inputs.F42<=0)continue;if(x.cell==='F58'&&inputs.E53<=0)continue;
  const row=document.createElement('div');row.className='result';const title=document.createElement('strong');title.textContent=x.label;const value=document.createElement('span');let n=null,display='';
  try{const v=engine.get(x.cell);if(typeof v==='number'&&Number.isFinite(v)){n=v;display=euro.format(v)}else display=String(v).trim()||'No aplicable'}catch(err){display='No calculable';row.classList.add('error')}
  value.textContent=display;row.append(title,value);let possible=n!==null&&n>=0;
  const item={label:x.label,cell:x.cell,amount:n,display,selected:possible&&!!preserve?.includes(x.cell)};items.push(item);
  if(possible){const wrap=document.createElement('label');wrap.className='select-result';const check=document.createElement('input');check.type='checkbox';check.checked=item.selected;check.addEventListener('change',()=>{item.selected=check.checked;updateTotal()});wrap.append(check,document.createTextNode(' Incluir en presupuesto'));row.append(wrap)}
  box.append(row)
 }
 current={raw,items,date:new Date().toISOString()};updateTotal();document.getElementById('salida').hidden=false;document.getElementById('aviso').textContent='';
 document.getElementById('salida').scrollIntoView({behavior:'smooth'});
}
function selected(){return current?.items.filter(x=>x.selected&&typeof x.amount==='number')||[]}
function updateTotal(){document.getElementById('total').textContent=euro.format(selected().reduce((s,x)=>s+x.amount,0))}
form.addEventListener('submit',e=>{e.preventDefault();calculate()});
function element(tag,txt,cls){let el=document.createElement(tag);if(txt!==undefined)el.textContent=txt;if(cls)el.className=cls;return el}
function previewBudget(){if(!current){alert('Primero debes pulsar CALCULAR.');return false}
 const entries=selected();if(!entries.length){alert('Marca al menos un concepto para incluir en el presupuesto.');return false}
 const root=document.getElementById('presupuesto-cuerpo');root.replaceChildren();
 const info=[['Cliente',current.raw.cliente],['Obra',current.raw.obra_nombre],['Emplazamiento',current.raw.obra_direccion],['Observaciones',current.raw.obra_notas],['Tipo de intervención',form.querySelector('#H14').selectedOptions[0]?.textContent],['Tipo de obra',form.querySelector('#H15').selectedOptions[0]?.textContent],['PEM',euro.format(Number(current.raw.H18))],['Superficie',current.raw.H17+' m²'],['Participación',current.raw.H22+' %']];
 root.append(element('p','Fecha: '+new Date().toLocaleDateString('es-ES')));
 for(const [name,value] of info){if(value&&String(value).trim()){const p=element('p');p.append(element('strong',name+': '),document.createTextNode(String(value)));root.append(p)}}
 root.append(element('h2','Desglose de honorarios'));
 let table=element('table');for(const v of entries){let tr=element('tr');tr.append(element('td',v.label),element('td',euro.format(v.amount)));table.append(tr)}root.append(table);
 root.append(element('h2','TOTAL: '+euro.format(entries.reduce((s,x)=>s+x.amount,0))));
 root.append(element('p','Importes sin impuestos. Documento generado a partir de los conceptos seleccionados.','print-note'));
 return true;
}
document.getElementById('pdf').addEventListener('click',()=>{if(previewBudget())window.print()});
document.getElementById('guardar').addEventListener('click',()=>{if(!current){alert('Primero pulsa CALCULAR.');return}let all=getSaved();let entry={...current,id:Date.now()+'-'+Math.floor(Math.random()*100000),date:new Date().toISOString()};all.unshift(entry);if(saveAll(all.slice(0,100))){renderHistory();alert('Cálculo guardado en este dispositivo.')}});
function renderHistory(){const box=document.getElementById('lista-historial');box.replaceChildren();const list=getSaved();if(!list.length){box.append(element('p','Todavía no hay cálculos guardados.'));return}
 list.forEach(rec=>{const row=element('div',undefined,'history-item');const date=new Date(rec.date).toLocaleString('es-ES');row.append(element('strong',(rec.raw.obra_nombre||'Obra sin identificar')+' · '+date));row.append(element('p','PEM: '+euro.format(Number(rec.raw.H18))+' · '+(rec.raw.cliente||'Sin cliente')));
 const load=element('button','Recuperar y modificar');load.type='button';load.addEventListener('click',()=>{for(const [id,val] of Object.entries(rec.raw)) {const input=document.getElementById(id);if(input)input.value=val}calculate((rec.items||[]).filter(x=>x.selected).map(x=>x.cell));window.scrollTo({top:0,behavior:'smooth'})});
 const del=element('button','Eliminar','secondary');del.type='button';del.addEventListener('click',()=>{if(confirm('¿Eliminar este cálculo del historial?')){saveAll(getSaved().filter(x=>x.id!==rec.id));renderHistory()}});row.append(load,del);box.append(row)})}
renderHistory();
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
