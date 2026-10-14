'use strict';
function option(select,codes){for(const x of codes){let el=document.createElement('option');el.value=x.code;el.textContent=x.code+' · '+x.label;select.appendChild(el)}}
option(document.getElementById('H14'),MODELO.intervenciones);option(document.getElementById('H15'),MODELO.obras);
document.getElementById('H14').value='14';document.getElementById('H15').value='11';
const euro=new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'});
document.getElementById('datos').addEventListener('submit',e=>{
 e.preventDefault();const inputs={};for(const el of e.target.querySelectorAll('input,select')){if(!el.id)continue;inputs[el.id]=['H9','H16'].includes(el.id)?el.value:Number(el.value)}
 if(!Number.isFinite(inputs.H17)||inputs.H17<=0||!Number.isFinite(inputs.H18)||inputs.H18<=0||!Number.isFinite(inputs.H13)||inputs.H13<=0||!Number.isFinite(inputs.H22)||inputs.H22<=0){alert('Introduce PEM, superficie, factor de actualización y participación con valores mayores que cero.');return;}
 inputs.H22/=100;
 const engine=new Engine(MODELO,inputs),out=document.getElementById('resultados');out.replaceChildren();
 const serv=inputs.H14;
 // Las partidas del libro no pueden sumarse automáticamente: se presentan como salidas independientes.
 const lines=[
  {label:'Honorarios de Dirección (DEM)',cell:'F32',show:true},
  {label:'Honorarios de Control de Calidad',cell:'F37',show:true},
  {label:'Honorarios de Seguridad y Salud',cell:'F49',show:inputs.F42>0},
  {label:'Honorarios de demoliciones (F58)',cell:'F58',show:inputs.E53>0}
 ];
 for(const x of lines){if(!x.show)continue;const r=document.createElement('div');r.className='result';const name=document.createElement('strong');name.textContent=x.label;const value=document.createElement('span');
  try{const v=engine.get(x.cell);if(typeof v==='number'&&Number.isFinite(v)){value.textContent=euro.format(v);value.title='Resultado experimental, no contrastado con Excel';}else{value.textContent=String(v).trim()||'No aplicable'}}
  catch(err){value.textContent='NO CALCULABLE: '+err.message;r.classList.add('error')}
  r.append(name,value);out.append(r);
 }
 document.getElementById('aviso').textContent='Auditoría de 1.530 combinaciones teóricas (51 intervenciones × 30 obras distintas): 228 errores de referencia en F32. Resultados experimentales del modelo histórico. Una cifra numérica no demuestra concordancia con Excel. No sumar salidas alternativas ni utilizar para presupuestar o facturar. Se mantienen bloqueadas las referencias rotas del archivo original.';
 document.getElementById('salida').hidden=false;document.getElementById('salida').scrollIntoView({behavior:'smooth'});
});
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
