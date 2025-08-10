
const Store = {
  get(k, d){ try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v){ localStorage.setItem(k, JSON.stringify(v)); }
};
if(!Store.get('deals')){
  Store.set('deals', [
    {id:'DL-001', client:'Айжан Н.', phone:'+7 777 000 11 22', amount:420000, stage:'КП/Накладная', source:'Instagram', mgr:'Даурен', items:[['Дверь ARNAU Classic 80','2','75000','150000'],['Ламинат Oak 33 класс','20 м²','6500','130000']]},
    {id:'DL-002', client:'Талгат К.', phone:'+7 705 222 33 44', amount:980000, stage:'Оплата', source:'2ГИС', mgr:'Айнур', items:[]}
  ]);
}
if(!Store.get('clients')){
  Store.set('clients', [
    {name:'Айжан Н.', phone:'+7 777 000 11 22', source:'Instagram'},
    {name:'Талгат К.', phone:'+7 705 222 33 44', source:'2ГИС'}
  ]);
}
if(!Store.get('tasks')){ Store.set('tasks', []); }

function $(s, el=document){ return el.querySelector(s); }
function $$(s, el=document){ return Array.from(el.querySelectorAll(s)); }
const money = n => new Intl.NumberFormat('ru-RU').format(n) + ' ₸';
const SCREENS = {};

function render(screen='pipeline', data=null){
  const root = document.getElementById('app'); root.innerHTML=''; root.appendChild(SCREENS[screen](data));
}
function show(screen, data=null){
  $$('.tabs button').forEach(b=> b.classList.toggle('active', b.dataset.screen===screen));
  render(screen, data);
}

SCREENS.pipeline = () => {
  const el = document.createElement('div');
  const stages = ['Лид','Контакт','Консультация','КП/Накладная','Оплата','Доставка','Установка'];
  const deals = Store.get('deals', []);
  const header = document.createElement('div'); header.className='row'; header.style.margin='0 0 8px'; 
  header.innerHTML = '<button class="btn primary" id="addDeal">+ Новая сделка</button>';
  header.querySelector('#addDeal').onclick = ()=> show('deal');
  el.appendChild(header);

  stages.forEach(stage=>{
    const card = document.createElement('div'); card.className='card';
    const list = deals.filter(d=>d.stage===stage);
    card.innerHTML = `<h3>${stage}</h3><div class="kb">${list.length} шт.</div>`;
    list.forEach(d=>{
      const item = document.createElement('div'); item.className='row'; item.style.marginTop='8px';
      item.innerHTML = `<div class="stage">#${d.id}</div><div class="row" style="gap:4px"><strong>${d.client}</strong><span class="kb">• ${d.phone}</span></div><span class="badge">${money(d.amount)}</span><button class="btn" data-open>Открыть</button>`;
      item.querySelector('[data-open]').onclick = ()=> show('deal_view', d.id);
      card.appendChild(item);
    });
    el.appendChild(card);
  });
  return el;
};

SCREENS.deal = () => {
  const el = document.createElement('div'); el.className='card';
  el.innerHTML = `
    <h3>Новая сделка</h3>
    <label>Клиент</label><input class="input" id="client" placeholder="ФИО">
    <label>Телефон</label><input class="input" id="phone" placeholder="+7 ...">
    <label>Источник</label>
    <select id="source" class="input">
      <option>Instagram</option><option>WhatsApp</option><option>2ГИС</option><option>Реклама</option><option>Рекомендация</option><option>Магазин</option>
    </select>
    <label>Этап</label>
    <select id="stage" class="input">
      <option>Лид</option><option>Контакт</option><option>Консультация</option><option selected>КП/Накладная</option><option>Оплата</option><option>Доставка</option><option>Установка</option>
    </select>
    <label>Сумма</label><input id="amount" class="input" type="number" placeholder="0">
    <div class="row" style="margin-top:10px;gap:10px">
      <button class="btn primary" id="save">Сохранить</button>
      <button class="btn" id="cancel">Отмена</button>
    </div>
  `;
  $('#cancel', el).onclick = () => show('pipeline');
  $('#save', el).onclick = () => {
    const deals = Store.get('deals', []);
    const id = 'DL-' + String( (deals.length+1) ).padStart(3,'0');
    deals.push({
      id, client: $('#client',el).value || 'Без имени', phone: $('#phone',el).value || '', 
      source: $('#source',el).value, stage: $('#stage',el).value, amount: Number($('#amount',el).value||0), items:[], mgr:'Менеджер'
    });
    Store.set('deals', deals);
    show('pipeline');
  };
  return el;
};

SCREENS.deal_view = (id) => {
  const d = Store.get('deals', []).find(x=>x.id===id) || Store.get('deals', [])[0];
  const el = document.createElement('div'); el.className='list';
  const head = document.createElement('div'); head.className='card';
  head.innerHTML = `
    <div class="row" style="justify-content:space-between">
      <h3>${d.client}</h3><span class="badge">${d.stage}</span>
    </div>
    <div class="kb">${d.phone} • Источник: ${d.source} • ID: ${d.id}</div>
    <div class="row" style="margin-top:8px;gap:8px">
      <select id="stage" class="input" style="max-width:220px">
        <option ${d.stage==='Лид'?'selected':''}>Лид</option>
        <option ${d.stage==='Контакт'?'selected':''}>Контакт</option>
        <option ${d.stage==='Консультация'?'selected':''}>Консультация</option>
        <option ${d.stage==='КП/Накладная'?'selected':''}>КП/Накладная</option>
        <option ${d.stage==='Оплата'?'selected':''}>Оплата</option>
        <option ${d.stage==='Доставка'?'selected':''}>Доставка</option>
        <option ${d.stage==='Установка'?'selected':''}>Установка</option>
      </select>
      <button class="btn primary" id="saveStage">Обновить этап</button>
    </div>
    <div class="row" style="margin-top:8px;gap:8px">
      <button class="btn" id="quote">📄 КП</button>
      <button class="btn" id="invoice">📜 Счёт</button>
      <button class="btn" id="memo">🧾 Накладная</button>
      <a class="btn primary" href="https://wa.me/?text=Здравствуйте!%20Ваше%20КП%20готово." target="_blank">WhatsApp</a>
    </div>
  `;
  head.querySelector('#saveStage').onclick = ()=>{
    const deals = Store.get('deals', []); const idx = deals.findIndex(x=>x.id===d.id);
    deals[idx].stage = head.querySelector('#stage').value; Store.set('deals', deals); show('pipeline');
  };
  el.appendChild(head);

  const items = document.createElement('div'); items.className='card';
  items.innerHTML = `
    <h3>Товары</h3>
    <table class="table"><thead><tr><th>Название</th><th>Кол-во</th><th>Цена</th><th>Сумма</th></tr></thead><tbody id="rows"></tbody></table>
    <div class="row" style="margin-top:8px;gap:8px">
      <input class="input" id="name" placeholder="Наименование">
      <input class="input" id="qty" placeholder="Кол-во">
      <input class="input" id="price" placeholder="Цена">
      <button class="btn" id="addItem">Добавить</button>
    </div>
    <div class="row" style="justify-content:flex-end;margin-top:8px"><strong id="total"></strong></div>
  `;
  const tbody = items.querySelector('#rows');
  function redraw(){
    tbody.innerHTML = '';
    let total = 0;
    d.items.forEach((it,i)=>{
      const tr = document.createElement('tr');
      const sum = Number(it[2]) * (parseFloat((it[1]+'').replace(',','.')) || 1);
      total += sum;
      tr.innerHTML = `<td>${it[0]}</td><td>${it[1]}</td><td>${money(Number(it[2]))}</td><td>${money(sum)}</td>`;
      tbody.appendChild(tr);
    });
    items.querySelector('#total').textContent = 'Итого: ' + money(total);
  }
  redraw();
  items.querySelector('#addItem').onclick = ()=>{
    const name = items.querySelector('#name').value || 'Позиция';
    const qty = items.querySelector('#qty').value || '1';
    const price = Number(items.querySelector('#price').value||0);
    d.items.push([name, qty, String(price), String(price)]);
    const deals = Store.get('deals', []); const idx = deals.findIndex(x=>x.id===d.id);
    deals[idx] = d; Store.set('deals', deals); redraw();
  };
  el.appendChild(items);

  function openDoc(type){
    const win = window.open('', '_blank');
    const date = new Date().toLocaleDateString('ru-RU');
    const rows = d.items.map(it=>`<tr><td>${it[0]}</td><td>${it[1]}</td><td>${it[2]} ₸</td><td></td></tr>`).join('');
    let title='Документ', head=''; 
    if(type==='kp'){ title='Коммерческое предложение'; head='Срок поставки: 2–4 дня. Гарантия 12 мес.'; }
    if(type==='invoice'){ title='Счёт на оплату'; head='Оплатить по указанным реквизитам.'; }
    if(type==='memo'){ title='Товарная накладная'; head=''; }
    win.document.write(`<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>${title}</title>
      <style>body{{font-family:-apple-system,Inter;max-width:900px;margin:20px auto;padding:16px}} table{{width:100%;border-collapse:collapse}} th,td{{border-bottom:1px solid #e5e7eb;padding:8px;text-align:left}} th{{font-size:12px;color:#6b7280}}</style>
      </head><body>
      <h2>${title} — Opendoor</h2>
      <p><strong>Клиент:</strong> ${d.client} • <strong>Тел.:</strong> ${d.phone} • <strong>Дата:</strong> ${date}</p>
      <table><thead><tr><th>Позиция</th><th>Кол-во</th><th>Цена</th><th>Сумма</th></tr></thead><tbody>${rows}</tbody></table>
      <p>${head}</p>
      <script>window.print()</script>
      </body></html>`);
    win.document.close();
  }
  head.querySelector('#quote').onclick = ()=> openDoc('kp');
  head.querySelector('#invoice').onclick = ()=> openDoc('invoice');
  head.querySelector('#memo').onclick = ()=> openDoc('memo');

  const tasksCard = document.createElement('div'); tasksCard.className='card';
  tasksCard.innerHTML = `
    <h3>Задачи</h3>
    <div class="row">
      <div style="flex:1"><label class="kb">Тип</label><select id="tType" class="input"><option>Доставка</option><option>Установка</option></select></div>
      <div style="flex:1"><label class="kb">Дата и время</label><input id="tDate" type="datetime-local" class="input"></div>
    </div>
    <label class="kb">Комментарий</label><textarea id="tNote" rows="2" class="input" placeholder="Что сделать?"></textarea>
    <div class="row" style="margin-top:8px;gap:12px">
      <button class="btn primary" id="saveTask">Создать задачу</button>
      <a class="btn" target="_blank" id="wa">Отправить WhatsApp</a>
    </div>
  `;
  tasksCard.querySelector('#saveTask').onclick = ()=>{
    const tasks = Store.get('tasks', []);
    tasks.push({dealId:d.id, type: tasksCard.querySelector('#tType').value, at: tasksCard.querySelector('#tDate').value, note: tasksCard.querySelector('#tNote').value, client:d.client});
    Store.set('tasks', tasks);
    alert('Задача создана.');
  };
  tasksCard.querySelector('#wa').href = 'https://wa.me/?text=' + encodeURIComponent(`Напоминание: ${d.client}. ${tasksCard.querySelector('#tType').value} ${tasksCard.querySelector('#tDate').value}`);
  el.appendChild(tasksCard);

  return el;
};

SCREENS.docs = () => {
  const el = document.createElement('div');
  const card = document.createElement('div'); card.className='card';
  card.innerHTML = `<h3>Документы</h3><div class="kb">Откройте любую сделку → кнопки КП, Счёт, Накладная. На телефоне можно сохранить как PDF через печать.</div>`;
  el.appendChild(card); return el;
};

SCREENS.clients = () => {
  const el = document.createElement('div');
  const card = document.createElement('div'); card.className='card';
  card.innerHTML = `
    <h3>Клиенты</h3>
    <div class="row" style="gap:8px">
      <input class="input" id="name" placeholder="ФИО">
      <input class="input" id="phone" placeholder="+7 ...">
      <select id="source" class="input"><option>Instagram</option><option>WhatsApp</option><option>2ГИС</option><option>Реклама</option><option>Рекомендация</option><option>Магазин</option></select>
      <button class="btn" id="add">Добавить</button>
    </div>
    <table class="table" style="margin-top:8px"><thead><tr><th>Клиент</th><th>Телефон</th><th>Источник</th></tr></thead><tbody id="rows"></tbody></table>
  `;
  const rows = card.querySelector('#rows');
  function refresh(){
    rows.innerHTML = '';
    Store.get('clients', []).forEach(c=>{
      const tr = document.createElement('tr'); tr.innerHTML = `<td>${c.name}</td><td>${c.phone}</td><td>${c.source}</td>`; rows.appendChild(tr);
    });
  }
  card.querySelector('#add').onclick = ()=>{
    const cs = Store.get('clients', []);
    cs.push({name:card.querySelector('#name').value||'Без имени', phone:card.querySelector('#phone').value||'', source:card.querySelector('#source').value});
    Store.set('clients', cs); refresh();
  };
  refresh();
  el.appendChild(card); return el;
};

SCREENS.tasks = () => {
  const el = document.createElement('div'), card = document.createElement('div'); card.className='card';
  const tasks = Store.get('tasks', []);
  card.innerHTML = `<h3>Задачи</h3><table class="table"><thead><tr><th>Тип</th><th>Клиент</th><th>Когда</th><th>Комментарий</th></tr></thead><tbody>${tasks.map(t=>`<tr><td>${t.type}</td><td>${t.client}</td><td>${t.at}</td><td>${t.note||''}</td></tr>`).join('')}</tbody></table>`;
  el.appendChild(card); return el;
};

SCREENS.reports = () => {
  const el = document.createElement('div'); const card = document.createElement('div'); card.className='card';
  const deals = Store.get('deals', []);
  const total = deals.reduce((s,d)=>s+(+d.amount||0),0);
  card.innerHTML = `<h3>Отчёты</h3><div class="row" style="gap:12px;margin-top:8px"><div class="stage">Сделок: ${deals.length}</div><div class="stage">Выручка: ${new Intl.NumberFormat('ru-RU').format(total)} ₸</div></div>`;
  el.appendChild(card); return el;
};

SCREENS.settings = () => {
  const el = document.createElement('div'); const card = document.createElement('div'); card.className='card';
  card.innerHTML = `<h3>Настройки</h3><div class="kb">Демо-версия. Данные сохраняются в памяти телефона (localStorage).</div><button class="btn" id="reset">Очистить данные</button>`;
  card.querySelector('#reset').onclick = ()=>{ if(confirm('Очистить демо-данные?')){ localStorage.clear(); location.reload(); } };
  el.appendChild(card); return el;
};

$$('.tabs button').forEach(btn=> btn.onclick = ()=> show(btn.dataset.screen));
render();

const isIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
if(isIOS){ document.getElementById('iosInstall').hidden = false; }

if('serviceWorker' in navigator){ window.addEventListener('load', ()=> navigator.serviceWorker.register('sw.js')); }
