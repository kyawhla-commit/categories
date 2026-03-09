import { useState, useEffect, useRef } from "react";

const TR = {
  en: {
    adminTab:"⚙️ Admin", customerTab:"🍕 Menu", kitchenTab:"👨‍🍳 Kitchen", dashTab:"📊 Dashboard",
    welcomeTo:"WELCOME TO", tables:"Tables", menuItems:"Menu Items", categories:"Categories", activeOrders:"Active Orders",
    menuEditor:"Menu Editor", addItem:"+ Add Item", qrCodes:"QR Codes", liveOrders:"Live Orders",
    noOrders:"No orders yet", previewMenu:"👁️ Preview Menu",
    tableLabel:"Table", scanQr:"Scan to view menu & order", printTable:"Print and place on table", close:"Close",
    newOrder:"New Order", preparing:"Preparing", servedLabel:"Served ✓", paid:"Paid ✓",
    acceptOrder:"✅ Accept", markServed:"🍽️ Served", completed:"Done ✓", newBadge:"new",
    available:"Available", unavailable:"Unavailable", disable:"Disable", enable:"Enable", edit:"Edit", del:"Del",
    addToCart:"+ Add", placeOrder:"Place Order", orderPlaced:"Order Placed!", yourFoodPrepared:"Your food is being prepared 👨‍🍳",
    orderMore:"Order More", items:"items", item:"item",
    itemName:"ITEM NAME", description:"DESCRIPTION", price:"PRICE (MMK)", availableLabel:"AVAILABLE", iconLabel:"ICON",
    cancel:"Cancel", save:"Save", yes:"Yes", no:"No", editItem:"Edit Item", newItem:"New Item", addedToCart:"added to cart",
    manageTablesTitle:"Manage Tables", addTable:"+ Add Table", editTable:"Edit Table", newTable:"New Table",
    tableName:"TABLE NAME / NUMBER", tableDesc:"DESCRIPTION (optional)", confirmDelete:"Are you sure? This cannot be undone.",
    manageCats:"Manage Categories", addCat:"+ Add Category", editCat:"Edit Category", newCat:"New Category",
    catName:"CATEGORY NAME (English)", catNameMy:"CATEGORY NAME (Burmese)", catIcon:"ICON",
    catHasItems:"This category has items. Delete anyway?",
    noTables:"No tables yet. Add one!", noCats:"No categories yet!", tablesTab:"🪑 Tables", catsTab:"📂 Categories",
    billFor:"Bill for", generateBill:"🧾 Bill", markPaid:"💳 Mark Paid", printReceipt:"🖨️ Print",
    subtotal:"Subtotal", tax:"Tax (5%)", grandTotal:"Grand Total", unpaid:"Unpaid", billPaid:"PAID",
    kitchenDisplay:"Kitchen Display", allOrders:"All", pendingOnly:"Pending", cookingOnly:"Cooking",
    noKitchenOrders:"No active orders 🎉", timeSince:"ago",
    todayRevenue:"Today's Revenue", totalOrders:"Total Orders", avgOrder:"Avg Order",
    topDishes:"Top Dishes", revenueByHour:"Orders by Hour", orderBreakdown:"Order Breakdown",
    paidOrders:"Paid", servedUnpaid:"Served (unpaid)", noData:"No data yet — place some orders!",
    brandingTab:"🎨 Branding", restaurantName:"RESTAURANT NAME", tagline:"TAGLINE",
    primaryColor:"PRIMARY COLOR", accentColor:"ACCENT COLOR", logoEmoji:"LOGO EMOJI",
    saveBranding:"Save Branding", brandingSaved:"Branding saved!",
    staffTab:"👤 Staff", addStaff:"+ Add Staff", editStaff:"Edit Staff", newStaff:"New Staff",
    staffName:"FULL NAME", staffPin:"PIN (4 digits)", staffRole:"ROLE",
    roleAdmin:"Admin", roleKitchen:"Kitchen", roleWaiter:"Waiter", roleCashier:"Cashier",
    logout:"Logout", enterPin:"Enter your PIN", wrongPin:"Wrong PIN, try again", selectStaff:"Who are you?",
    newOrderAlert:"New Order!", soundOn:"🔔 On", soundOff:"🔕 Off",
    markAllRead:"Mark all read", notifications:"Notifications", noNotifs:"No notifications yet",
  },
  my: {
    adminTab:"⚙️ စီမံခန့်ခွဲမှု", customerTab:"🍕 မီနူး", kitchenTab:"👨‍🍳 မီးဖိုချောင်", dashTab:"📊 အချက်အလက်",
    welcomeTo:"မှကြိုဆိုပါသည်", tables:"စားပွဲများ", menuItems:"မီနူးများ", categories:"အမျိုးအစားများ", activeOrders:"လက်ရှိမှာယူမှုများ",
    menuEditor:"မီနူးတည်းဖြတ်ရန်", addItem:"+ ထည့်မည်", qrCodes:"QR ကုဒ်များ", liveOrders:"လက်ရှိအော်ဒါများ",
    noOrders:"မှာယူမှု မရှိသေးပါ", previewMenu:"👁️ မီနူးကြည့်ရန်",
    tableLabel:"စားပွဲ", scanQr:"QR ကုဒ်စကင်ဖတ်ပါ", printTable:"ပုံနှိပ်၍ တင်ထားပါ", close:"ပိတ်မည်",
    newOrder:"အော်ဒါသစ်", preparing:"ချက်နေဆဲ", servedLabel:"ဆောင်ပြီး ✓", paid:"ငွေချေပြီး ✓",
    acceptOrder:"✅ လက်ခံမည်", markServed:"🍽️ ဆောင်ပြီး", completed:"ပြီးစီးပြီ ✓", newBadge:"သစ်",
    available:"ရနိုင်သည်", unavailable:"မရနိုင်ပါ", disable:"ပိတ်မည်", enable:"ဖွင့်မည်", edit:"ပြင်မည်", del:"ဖျက်မည်",
    addToCart:"+ ထည့်မည်", placeOrder:"အော်ဒါမှာမည်", orderPlaced:"အော်ဒါပေးပို့ပြီး!", yourFoodPrepared:"ချက်ပြုတ်နေပါသည် 👨‍🍳",
    orderMore:"ထပ်မှာမည်", items:"ခု", item:"ခု",
    itemName:"အစားအစာအမည်", description:"ဖော်ပြချက်", price:"ဈေးနှုန်း (MMK)", availableLabel:"ရရှိနိုင်မှု", iconLabel:"အိုင်ကွန်",
    cancel:"မလုပ်တော့ပါ", save:"သိမ်းမည်", yes:"ဟုတ်", no:"မဟုတ်", editItem:"ပြင်ဆင်မည်", newItem:"အသစ်ထည့်မည်", addedToCart:"ထည့်ပြီး",
    manageTablesTitle:"စားပွဲများ စီမံမည်", addTable:"+ ထည့်မည်", editTable:"ပြင်မည်", newTable:"အသစ်",
    tableName:"စားပွဲ အမည်", tableDesc:"ဖော်ပြချက်", confirmDelete:"သေချာပါသလား?",
    manageCats:"အမျိုးအစားများ", addCat:"+ ထည့်မည်", editCat:"ပြင်မည်", newCat:"အသစ်",
    catName:"အမျိုးအစားအမည် (EN)", catNameMy:"အမျိုးအစားအမည် (မြန်မာ)", catIcon:"အိုင်ကွန်",
    catHasItems:"ဤအမျိုးအစားတွင် အစားစာများ ရှိပါသည်",
    noTables:"စားပွဲ မရှိသေးပါ", noCats:"အမျိုးအစား မရှိသေးပါ", tablesTab:"🪑 စားပွဲများ", catsTab:"📂 အမျိုးအစားများ",
    billFor:"ဘီလ် -", generateBill:"🧾 ဘီလ်", markPaid:"💳 ငွေချေပြီး", printReceipt:"🖨️ ပုံနှိပ်မည်",
    subtotal:"စုစုပေါင်း", tax:"အခွန် (5%)", grandTotal:"နောက်ဆုံးစုစုပေါင်း", unpaid:"မချေသေးပါ", billPaid:"ငွေချေပြီး",
    kitchenDisplay:"မီးဖိုချောင်မြင်ကွင်း", allOrders:"အားလုံး", pendingOnly:"စောင့်ဆိုင်းနေသည်", cookingOnly:"ချက်နေသည်",
    noKitchenOrders:"လက်ရှိ အော်ဒါမရှိပါ 🎉", timeSince:"ကြာပြီ",
    todayRevenue:"ယနေ့ဝင်ငွေ", totalOrders:"စုစုပေါင်းအော်ဒါ", avgOrder:"ပျမ်းမျှ",
    topDishes:"အရောင်းရဆုံး", revenueByHour:"နာရီအလိုက်", orderBreakdown:"အော်ဒါခွဲခြမ်း",
    paidOrders:"ငွေချေပြီး", servedUnpaid:"ဆောင်ပြီး (မချေသေး)", noData:"အချက်အလက် မရှိသေးပါ",
    brandingTab:"🎨 အမှတ်တံဆိပ်", restaurantName:"စားသောက်ဆိုင်အမည်", tagline:"ဆောင်ပုဒ်",
    primaryColor:"အဓိကအရောင်", accentColor:"သံချပ်အရောင်", logoEmoji:"လိုဂို",
    saveBranding:"သိမ်းဆည်းမည်", brandingSaved:"သိမ်းဆည်းပြီး!",
    staffTab:"👤 ဝန်ထမ်းများ", addStaff:"+ ထည့်မည်", editStaff:"ပြင်မည်", newStaff:"အသစ်",
    staffName:"အမည်", staffPin:"PIN (၄ လုံး)", staffRole:"တာဝန်",
    roleAdmin:"Admin", roleKitchen:"မီးဖိုချောင်", roleWaiter:"ဝန်ဆောင်", roleCashier:"ငွေကိုင်",
    logout:"ထွက်မည်", enterPin:"PIN ထည့်ပါ", wrongPin:"PIN မှားပါသည်", selectStaff:"အမည်ရွေးပါ",
    newOrderAlert:"အော်ဒါသစ်!", soundOn:"🔔 အသံဖွင့်", soundOff:"🔕 အသံပိတ်",
    markAllRead:"အားလုံးဖတ်ပြီး", notifications:"အကြောင်းကြားချက်", noNotifs:"အကြောင်းကြားချက် မရှိသေးပါ",
  }
};

const DEFAULT_BRAND = { name:"La Bella Cucina", tagline:"Authentic Italian Kitchen", logo:"🍽️", primary:"#1a1a2e", accent:"#c9a96e", accentDark:"#a07840" };
const DEFAULT_STAFF = [
  { id:1, name:"Admin", pin:"0000", role:"admin" },
  { id:2, name:"Marco (Waiter)", pin:"1111", role:"waiter" },
  { id:3, name:"Chef Luigi", pin:"2222", role:"kitchen" },
  { id:4, name:"Sara (Cashier)", pin:"3333", role:"cashier" },
];
const ROLE_ACCESS = { admin:["admin","kitchen","dashboard","menu"], waiter:["menu"], kitchen:["kitchen"], cashier:["admin"] };
const ROLE_ADMIN_TABS = { admin:["orders","bill","menu","tables","cats","staff","branding"], cashier:["orders","bill"], waiter:[], kitchen:[] };

const INITIAL_TABLES = [
  {id:1,name:"1",desc:"Window seat"},{id:2,name:"2",desc:"Garden view"},{id:3,name:"3",desc:""},
  {id:4,name:"4",desc:""},{id:5,name:"5",desc:"Private corner"},{id:6,name:"6",desc:""},
  {id:7,name:"7",desc:""},{id:8,name:"8",desc:"Bar area"},
];
const INITIAL_CATS = [
  {id:"starters",name:"Starters",nameMy:"အစပျိုး",icon:"🥗",items:[
    {id:1,name:"Bruschetta al Pomodoro",desc:"Toasted bread, tomatoes, basil",price:3500,image:"🍅",available:true},
    {id:2,name:"Burrata Caprese",desc:"Fresh burrata, heirloom tomatoes",price:5500,image:"🧀",available:true},
    {id:3,name:"Arancini",desc:"Crispy risotto balls, mozzarella",price:4000,image:"🟡",available:true},
  ]},
  {id:"mains",name:"Main Course",nameMy:"အဓိကအစာ",icon:"🍝",items:[
    {id:4,name:"Spaghetti Carbonara",desc:"Egg, pecorino, guanciale",price:8500,image:"🍝",available:true},
    {id:5,name:"Osso Buco Milanese",desc:"Braised veal shank, saffron risotto",price:12000,image:"🥩",available:true},
    {id:6,name:"Penne all'Arrabbiata",desc:"Spicy tomato sauce, garlic",price:6500,image:"🌶️",available:true},
    {id:7,name:"Grilled Sea Bass",desc:"Lemon butter, capers",price:11000,image:"🐟",available:false},
  ]},
  {id:"pizzas",name:"Pizzas",nameMy:"ပီဇာ",icon:"🍕",items:[
    {id:8,name:"Margherita",desc:"San Marzano tomato, fior di latte",price:6000,image:"🍕",available:true},
    {id:9,name:"Diavola",desc:"Spicy salami, chili, mozzarella",price:7000,image:"🌶️",available:true},
    {id:10,name:"Quattro Formaggi",desc:"Four cheese blend",price:7500,image:"🧀",available:true},
  ]},
  {id:"desserts",name:"Desserts",nameMy:"အချိုပွဲ",icon:"🍮",items:[
    {id:11,name:"Tiramisu",desc:"Mascarpone, espresso, ladyfingers",price:3800,image:"☕",available:true},
    {id:12,name:"Panna Cotta",desc:"Vanilla cream, wild berry coulis",price:3500,image:"🍮",available:true},
  ]},
  {id:"drinks",name:"Drinks",nameMy:"အဖျော်ယမကာ",icon:"🍷",items:[
    {id:13,name:"House Red Wine",desc:"Chianti Classico, glass",price:4000,image:"🍷",available:true},
    {id:14,name:"Sparkling Water",desc:"500ml bottle",price:1500,image:"💧",available:true},
    {id:15,name:"Espresso",desc:"Double shot, Italian roast",price:1200,image:"☕",available:true},
  ]},
];

const fmtMMK = n => "MMK " + Number(n).toLocaleString();
const card = { background:"white", borderRadius:12, boxShadow:"0 2px 12px rgba(0,0,0,0.06)" };
const inp = { width:"100%", marginTop:6, padding:"10px 14px", borderRadius:8, border:"1.5px solid #e5e7eb", fontSize:14, outline:"none", boxSizing:"border-box", fontFamily:"inherit" };
const lbl = { fontSize:12, fontWeight:700, color:"#666", display:"block" };

function playOrderAlert() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [523,659,784,1047].forEach((freq,i) => {
      const o=ctx.createOscillator(), g=ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value=freq; o.type="sine";
      g.gain.setValueAtTime(0,ctx.currentTime+i*0.12);
      g.gain.linearRampToValueAtTime(0.3,ctx.currentTime+i*0.12+0.02);
      g.gain.linearRampToValueAtTime(0,ctx.currentTime+i*0.12+0.18);
      o.start(ctx.currentTime+i*0.12); o.stop(ctx.currentTime+i*0.12+0.22);
    });
  } catch(e) {}
}

function loadQRLib(cb) {
  if (window._qrLoaded) { cb(); return; }
  const s=document.createElement("script");
  s.src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
  s.onload=()=>{window._qrLoaded=true;cb();};
  s.onerror=()=>cb();
  document.head.appendChild(s);
}
function QRCode({ tableNum, size=120 }) {
  const divRef=useRef(null);
  useEffect(()=>{
    const el=divRef.current; if(!el) return;
    el.innerHTML="";
    loadQRLib(()=>{
      if(window.QRCode){
        try { new window.QRCode(el,{text:"TABLE-"+String(tableNum),width:size,height:size,colorDark:"#000000",colorLight:"#ffffff",correctLevel:window.QRCode.CorrectLevel.M}); }
        catch(e) { el.innerHTML="<div style='width:"+size+"px;height:"+size+"px;background:#f0f0f0;display:flex;align-items:center;justify-content:center'>QR</div>"; }
      }
    });
  },[tableNum,size]);
  return <div ref={divRef} style={{width:size,height:size}} />;
}

function printReceipt(order, tableName, brand, t) {
  const tax=Math.round(order.total*0.05), grand=order.total+tax;
  const w=window.open("","_blank","width=420,height=640");
  w.document.write(`<!DOCTYPE html><html><head><title>Receipt</title><style>
    body{font-family:monospace;padding:24px 20px;max-width:320px;margin:0 auto}
    h2{text-align:center;font-size:20px;margin-bottom:2px}.center{text-align:center}
    hr{border:none;border-top:1px dashed #999;margin:10px 0}
    .row{display:flex;justify-content:space-between;margin:4px 0;font-size:13px}
    .bold{font-weight:bold}.big{font-size:15px}
    .paid{text-align:center;font-size:20px;font-weight:900;margin-top:14px;border:3px solid #000;padding:8px;letter-spacing:3px}
    .foot{text-align:center;font-size:11px;color:#888;margin-top:14px}
  </style></head><body>
    <h2>${brand.logo} ${brand.name}</h2>
    <p class="center" style="font-size:12px;color:#666">${brand.tagline}</p>
    <hr/><div class="row"><span>${t.tableLabel}: ${tableName}</span><span>${order.time||""}</span></div>
    <div class="row"><span>Order #${String(order.id).slice(-4)}</span></div><hr/>
    ${order.items.map(i=>`<div class="row"><span>${i.image} ${i.name} x${i.qty}</span><span>${fmtMMK(i.price*i.qty)}</span></div>`).join("")}
    <hr/>
    <div class="row"><span>${t.subtotal}</span><span>${fmtMMK(order.total)}</span></div>
    <div class="row" style="color:#777"><span>${t.tax}</span><span>${fmtMMK(tax)}</span></div><hr/>
    <div class="row bold big"><span>${t.grandTotal}</span><span>${fmtMMK(grand)}</span></div>
    ${order.status==="paid"?`<div class="paid">${t.billPaid}</div>`:""}
    <p class="foot">Thank you for dining with us!</p>
    <script>window.onload=()=>window.print()<\/script>
  </body></html>`);
  w.document.close();
}

function Modal({ onClose, children, maxWidth=440 }) {
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div onClick={e=>e.stopPropagation()} style={{...card,padding:28,width:"100%",maxWidth,maxHeight:"92vh",overflowY:"auto"}}>{children}</div>
    </div>
  );
}
function ConfirmModal({message,onConfirm,onCancel,t}) {
  return <Modal onClose={onCancel} maxWidth={340}><div style={{textAlign:"center"}}><div style={{fontSize:40,marginBottom:10}}>⚠️</div><p style={{fontSize:15,color:"#1a1a2e",marginBottom:22,lineHeight:1.5}}>{message}</p><div style={{display:"flex",gap:10}}><button onClick={onCancel} style={{flex:1,padding:"10px",borderRadius:8,border:"1.5px solid #ddd",background:"white",cursor:"pointer",fontSize:14,fontWeight:600}}>{t.cancel}</button><button onClick={onConfirm} style={{flex:1,padding:"10px",borderRadius:8,border:"none",background:"#dc2626",color:"white",cursor:"pointer",fontSize:14,fontWeight:700}}>{t.del}</button></div></div></Modal>;
}
function QRModal({table,onClose,t}) {
  return <Modal onClose={onClose} maxWidth={300}><div style={{textAlign:"center"}}><p style={{fontFamily:"Georgia,serif",fontSize:20,fontWeight:700,marginBottom:4,color:"#1a1a2e"}}>{t.tableLabel} {table.name}</p>{table.desc&&<p style={{color:"#888",fontSize:13,marginBottom:10}}>{table.desc}</p>}<p style={{color:"#aaa",fontSize:12,marginBottom:12}}>{t.scanQr}</p><div style={{display:"inline-block",padding:12,background:"#fff",border:"1px solid #eee",borderRadius:10,marginBottom:12}}><QRCode tableNum={table.name} size={160}/></div><p style={{fontSize:11,color:"#bbb",marginBottom:16}}>{t.printTable}</p><button onClick={onClose} style={{padding:"9px 28px",borderRadius:25,border:"none",background:"#1a1a2e",color:"white",cursor:"pointer",fontSize:14,fontWeight:700}}>{t.close}</button></div></Modal>;
}
function TableModal({table,onSave,onClose,t}) {
  const [form,setForm]=useState({name:"",desc:"",...table});
  return <Modal onClose={onClose}><h3 style={{fontFamily:"Georgia,serif",fontSize:19,marginBottom:18,color:"#1a1a2e"}}>{table.id?t.editTable:t.newTable}</h3><div style={{display:"flex",flexDirection:"column",gap:14}}><div><label style={lbl}>{t.tableName}</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} style={inp}/></div><div><label style={lbl}>{t.tableDesc}</label><input value={form.desc} onChange={e=>setForm(f=>({...f,desc:e.target.value}))} style={inp}/></div><div style={{display:"flex",gap:10,marginTop:4}}><button onClick={onClose} style={{flex:1,padding:"10px",borderRadius:8,border:"1.5px solid #c9a96e",background:"white",color:"#a07840",cursor:"pointer",fontSize:14,fontWeight:600}}>{t.cancel}</button><button onClick={()=>{if(form.name.trim())onSave(form);}} style={{flex:1,padding:"10px",borderRadius:8,border:"none",background:"#1a1a2e",color:"white",cursor:"pointer",fontSize:14,fontWeight:700}}>{t.save}</button></div></div></Modal>;
}
function CatModal({cat,onSave,onClose,t}) {
  const icons=["🥗","🍝","🍕","🥩","🐟","🍮","☕","🍷","🧀","🌶️","🍅","🍞","🥐","🫕","🍲","🥘","🍜","🫔","🍱","🧆","🥤","🍵","🧋","🫙"];
  const [form,setForm]=useState({name:"",nameMy:"",icon:"🍽️",...cat});
  return <Modal onClose={onClose}><h3 style={{fontFamily:"Georgia,serif",fontSize:19,marginBottom:18,color:"#1a1a2e"}}>{cat.id?t.editCat:t.newCat}</h3><div style={{display:"flex",flexDirection:"column",gap:14}}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><div><label style={lbl}>{t.catName}</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} style={inp}/></div><div><label style={lbl}>{t.catNameMy}</label><input value={form.nameMy} onChange={e=>setForm(f=>({...f,nameMy:e.target.value}))} style={inp}/></div></div><div><label style={{...lbl,marginBottom:8}}>{t.catIcon}</label><div style={{display:"flex",flexWrap:"wrap",gap:6,maxHeight:100,overflowY:"auto"}}>{icons.map(e=><button key={e} onClick={()=>setForm(f=>({...f,icon:e}))} style={{fontSize:20,padding:"5px 8px",borderRadius:8,border:form.icon===e?"2px solid #c9a96e":"2px solid transparent",background:form.icon===e?"#fef9c3":"#f5f5f5",cursor:"pointer"}}>{e}</button>)}</div></div><div style={{display:"flex",gap:10,marginTop:4}}><button onClick={onClose} style={{flex:1,padding:"10px",borderRadius:8,border:"1.5px solid #c9a96e",background:"white",color:"#a07840",cursor:"pointer",fontSize:14,fontWeight:600}}>{t.cancel}</button><button onClick={()=>{if(form.name.trim())onSave(form);}} style={{flex:1,padding:"10px",borderRadius:8,border:"none",background:"#1a1a2e",color:"white",cursor:"pointer",fontSize:14,fontWeight:700}}>{t.save}</button></div></div></Modal>;
}
function ItemModal({item,catId,onSave,onClose,t}) {
  const emojis=["🍝","🍕","🥗","🥩","🐟","🍮","☕","🍷","🧀","🌶️","🍅","💧","🟡","🍞","🥐","🫕","🍲","🫙","🍜","🧆"];
  const [form,setForm]=useState({name:"",desc:"",price:"",image:"🍽️",available:true,...item});
  return <Modal onClose={onClose}><h3 style={{fontFamily:"Georgia,serif",fontSize:19,marginBottom:18,color:"#1a1a2e"}}>{item.id?t.editItem:t.newItem}</h3><div style={{display:"flex",flexDirection:"column",gap:14}}><div><label style={lbl}>{t.itemName}</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} style={inp}/></div><div><label style={lbl}>{t.description}</label><textarea value={form.desc} onChange={e=>setForm(f=>({...f,desc:e.target.value}))} rows={2} style={{...inp,resize:"none"}}/></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><div><label style={lbl}>{t.price}</label><input type="number" value={form.price} onChange={e=>setForm(f=>({...f,price:parseFloat(e.target.value)}))} style={inp}/></div><div><label style={lbl}>{t.availableLabel}</label><select value={String(form.available)} onChange={e=>setForm(f=>({...f,available:e.target.value==="true"}))} style={inp}><option value="true">{t.yes}</option><option value="false">{t.no}</option></select></div></div><div><label style={{...lbl,marginBottom:8}}>{t.iconLabel}</label><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{emojis.map(e=><button key={e} onClick={()=>setForm(f=>({...f,image:e}))} style={{fontSize:22,padding:"6px 10px",borderRadius:8,border:form.image===e?"2px solid #c9a96e":"2px solid transparent",background:form.image===e?"#fef9c3":"#f5f5f5",cursor:"pointer"}}>{e}</button>)}</div></div><div style={{display:"flex",gap:10,marginTop:4}}><button onClick={onClose} style={{flex:1,padding:"10px",borderRadius:8,border:"1.5px solid #c9a96e",background:"white",color:"#a07840",cursor:"pointer",fontSize:14,fontWeight:600}}>{t.cancel}</button><button onClick={()=>{if(form.name&&form.price)onSave(catId,form);}} style={{flex:1,padding:"10px",borderRadius:8,border:"none",background:"#1a1a2e",color:"white",cursor:"pointer",fontSize:14,fontWeight:700}}>{t.save}</button></div></div></Modal>;
}
function BillModal({tableOrders,tableName,onClose,onMarkPaid,brand,t}) {
  const subtotal=tableOrders.reduce((s,o)=>s+o.total,0);
  const tax=Math.round(subtotal*0.05), grand=subtotal+tax;
  const allPaid=tableOrders.every(o=>o.status==="paid");
  const merged=tableOrders.flatMap(o=>o.items).reduce((acc,item)=>{const ex=acc.find(a=>a.id===item.id);if(ex){ex.qty+=item.qty;ex.sub+=item.price*item.qty;}else acc.push({...item,qty:item.qty,sub:item.price*item.qty});return acc;},[]);
  const combined={id:tableOrders[0]?.id,time:tableOrders[0]?.time,total:subtotal,items:merged,status:allPaid?"paid":"unpaid"};
  return <Modal onClose={onClose} maxWidth={420}><div style={{textAlign:"center",marginBottom:16}}><div style={{fontSize:36,marginBottom:6}}>🧾</div><h3 style={{fontFamily:"Georgia,serif",fontSize:20,color:"#1a1a2e"}}>{t.billFor} {t.tableLabel} {tableName}</h3></div><div style={{background:"#faf8f4",borderRadius:10,padding:16,marginBottom:16}}>{merged.map((item,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #eee",fontSize:14}}><span>{item.image} {item.name} × {item.qty}</span><span style={{fontWeight:600}}>{fmtMMK(item.sub)}</span></div>)}<div style={{marginTop:10,paddingTop:10,borderTop:"1px dashed #ccc"}}><div style={{display:"flex",justifyContent:"space-between",fontSize:14,marginBottom:4}}><span>{t.subtotal}</span><span>{fmtMMK(subtotal)}</span></div><div style={{display:"flex",justifyContent:"space-between",fontSize:14,marginBottom:8,color:"#888"}}><span>{t.tax}</span><span>{fmtMMK(tax)}</span></div><div style={{display:"flex",justifyContent:"space-between",fontSize:17,fontWeight:700}}><span>{t.grandTotal}</span><span style={{color:brand.accentDark}}>{fmtMMK(grand)}</span></div></div></div>{allPaid?<div style={{textAlign:"center",padding:"10px",borderRadius:8,background:"#dcfce7",color:"#166534",fontWeight:700,fontSize:16,marginBottom:14}}>✅ {t.billPaid}</div>:<div style={{display:"flex",gap:10,marginBottom:12}}><button onClick={onMarkPaid} style={{flex:1,padding:"12px",borderRadius:10,border:"none",background:brand.primary,color:"white",cursor:"pointer",fontSize:14,fontWeight:700}}>💳 {t.markPaid}</button><button onClick={()=>printReceipt(combined,tableName,brand,t)} style={{flex:1,padding:"12px",borderRadius:10,border:"1.5px solid #c9a96e",background:"white",color:"#a07840",cursor:"pointer",fontSize:14,fontWeight:700}}>🖨️ {t.printReceipt}</button></div>}{allPaid&&<button onClick={()=>printReceipt(combined,tableName,brand,t)} style={{width:"100%",padding:"12px",borderRadius:10,border:"none",background:brand.primary,color:"white",cursor:"pointer",fontSize:14,fontWeight:700,marginBottom:10}}>🖨️ {t.printReceipt}</button>}<button onClick={onClose} style={{width:"100%",padding:"10px",borderRadius:8,border:"1.5px solid #ddd",background:"white",cursor:"pointer",fontSize:14,color:"#666"}}>{t.close}</button></Modal>;
}

function LoginScreen({staff,brand,onLogin,t}) {
  const [sel,setSel]=useState(null);
  const [pin,setPin]=useState("");
  const [err,setErr]=useState("");
  const handlePin=d=>{
    if(d==="del"){setPin(p=>p.slice(0,-1));setErr("");return;}
    const next=pin+d; setPin(next);
    if(next.length===4){
      if(sel&&sel.pin===next){onLogin(sel);setPin("");}
      else{setErr(t.wrongPin);setTimeout(()=>{setPin("");setErr("");},900);}
    }
  };
  const roleIcon=r=>r==="admin"?"👑":r==="kitchen"?"👨‍🍳":r==="cashier"?"💳":"🙋";
  const roleLabel=r=>t["role"+r.charAt(0).toUpperCase()+r.slice(1)]||r;
  return (
    <div style={{minHeight:"100vh",background:brand.primary,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{fontSize:56,marginBottom:8}}>{brand.logo}</div>
      <h1 style={{fontFamily:"Georgia,serif",color:brand.accent,fontSize:28,fontWeight:700,marginBottom:4}}>{brand.name}</h1>
      <p style={{color:"rgba(255,255,255,0.4)",fontSize:13,marginBottom:36}}>{brand.tagline}</p>
      <div style={{...card,padding:28,width:"100%",maxWidth:360}}>
        <p style={{textAlign:"center",fontWeight:700,fontSize:15,color:"#1a1a2e",marginBottom:16}}>{t.selectStaff}</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20}}>
          {staff.map(s=>(
            <button key={s.id} onClick={()=>{setSel(s);setPin("");setErr("");}} style={{padding:"12px 8px",borderRadius:10,border:sel?.id===s.id?"2px solid "+brand.accent:"2px solid #e5e7eb",background:sel?.id===s.id?"#fef9c3":"#fafafa",cursor:"pointer",textAlign:"center",transition:"all 0.15s"}}>
              <div style={{fontSize:24,marginBottom:4}}>{roleIcon(s.role)}</div>
              <p style={{fontSize:13,fontWeight:600,color:"#1a1a2e"}}>{s.name}</p>
              <p style={{fontSize:11,color:"#888"}}>{roleLabel(s.role)}</p>
            </button>
          ))}
        </div>
        {sel&&(<>
          <p style={{textAlign:"center",fontSize:13,color:"#888",marginBottom:10}}>{t.enterPin} — <strong>{sel.name}</strong></p>
          <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:10}}>
            {[0,1,2,3].map(i=><div key={i} style={{width:14,height:14,borderRadius:"50%",background:pin.length>i?brand.primary:"#e5e7eb",transition:"background 0.15s"}}/>)}
          </div>
          {err&&<p style={{textAlign:"center",color:"#dc2626",fontSize:13,marginBottom:8,fontWeight:600}}>{err}</p>}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
            {["1","2","3","4","5","6","7","8","9","del","0","✓"].map(d=>(
              <button key={d} onClick={()=>d!=="✓"&&handlePin(d)} style={{padding:"14px",borderRadius:10,border:"1.5px solid #e5e7eb",background:d==="del"?"#fef2f2":d==="✓"?"#e5e7eb":"white",color:d==="del"?"#dc2626":"#1a1a2e",fontSize:18,fontWeight:700,cursor:d==="✓"?"default":"pointer"}}>{d}</button>
            ))}
          </div>
        </>)}
      </div>
      <p style={{color:"rgba(255,255,255,0.25)",fontSize:11,marginTop:20}}>Demo PINs: Admin=0000 · Waiter=1111 · Kitchen=2222 · Cashier=3333</p>
    </div>
  );
}

function NotifBell({notifs,soundOn,onToggleSound,onMarkAllRead,t,brand}) {
  const [open,setOpen]=useState(false);
  const unread=notifs.filter(n=>!n.read).length;
  return (
    <div style={{position:"relative"}}>
      <button onClick={()=>setOpen(o=>!o)} style={{position:"relative",background:"transparent",border:"none",cursor:"pointer",fontSize:20,padding:"4px 6px",lineHeight:1}}>
        🔔{unread>0&&<span style={{position:"absolute",top:0,right:0,background:"#ef4444",color:"white",borderRadius:"50%",width:16,height:16,fontSize:10,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>{unread}</span>}
      </button>
      {open&&(
        <div style={{position:"absolute",top:38,right:0,width:290,background:"white",borderRadius:12,boxShadow:"0 8px 32px rgba(0,0,0,0.18)",zIndex:500,overflow:"hidden"}}>
          <div style={{padding:"12px 16px",borderBottom:"1px solid #f0ebe0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontWeight:700,fontSize:13,color:"#1a1a2e"}}>🔔 {t.notifications}</span>
            <div style={{display:"flex",gap:6}}>
              <button onClick={onToggleSound} style={{fontSize:11,padding:"3px 8px",borderRadius:10,border:"1px solid #ddd",background:"white",cursor:"pointer",color:"#555"}}>{soundOn?t.soundOn:t.soundOff}</button>
              {unread>0&&<button onClick={onMarkAllRead} style={{fontSize:11,padding:"3px 8px",borderRadius:10,border:"none",background:brand.primary,color:"white",cursor:"pointer"}}>{t.markAllRead}</button>}
            </div>
          </div>
          <div style={{maxHeight:280,overflowY:"auto"}}>
            {notifs.length===0?<p style={{padding:"20px 16px",color:"#aaa",fontSize:13,textAlign:"center"}}>{t.noNotifs}</p>
            :notifs.map(n=><div key={n.id} style={{padding:"10px 16px",borderBottom:"1px solid #f9f7f2",background:n.read?"white":"#fffbeb"}}><p style={{fontSize:13,fontWeight:n.read?400:700,color:"#1a1a2e"}}>{n.msg}</p><p style={{fontSize:11,color:"#bbb",marginTop:2}}>{n.time}</p></div>)}
          </div>
        </div>
      )}
    </div>
  );
}

function KitchenDisplay({orders,onUpdateStatus,t,brand}) {
  const [filter,setFilter]=useState("active");
  const [now,setNow]=useState(Date.now());
  useEffect(()=>{const id=setInterval(()=>setNow(Date.now()),30000);return()=>clearInterval(id);},[]);
  const minAgo=id=>Math.max(0,Math.floor((now-id)/60000));
  const filtered=orders.filter(o=>filter==="active"?o.status==="pending"||o.status==="accepted":filter==="pending"?o.status==="pending":filter==="cooking"?o.status==="accepted":true).sort((a,b)=>a.id-b.id);
  const urgency=o=>{const m=minAgo(o.id);return m>=20?{bg:"#fef2f2",border:"#fca5a5"}:m>=10?{bg:"#fffbeb",border:"#fcd34d"}:{bg:"#f0fdf4",border:"#86efac"};};
  return (
    <div style={{minHeight:"100vh",background:"#0f172a",padding:20}}>
      <div style={{maxWidth:1200,margin:"0 auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <h1 style={{fontFamily:"Georgia,serif",color:brand.accent,fontSize:26}}>👨‍🍳 {t.kitchenDisplay}</h1>
          <div style={{display:"flex",gap:8}}>
            {[["active",t.allOrders],["pending",t.pendingOnly],["cooking",t.cookingOnly]].map(([v,lb])=>(
              <button key={v} onClick={()=>setFilter(v)} style={{padding:"7px 16px",borderRadius:20,border:"none",cursor:"pointer",fontSize:13,fontWeight:600,background:filter===v?brand.accent:"#1e293b",color:filter===v?brand.primary:"#94a3b8"}}>{lb}</button>
            ))}
          </div>
        </div>
        {filtered.length===0?<div style={{textAlign:"center",padding:"80px 0",color:"#475569",fontSize:18}}>{t.noKitchenOrders}</div>
        :<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
          {filtered.map(o=>{const u=urgency(o);const m=minAgo(o.id);return(
            <div key={o.id} style={{background:u.bg,borderRadius:14,border:"2px solid "+u.border,padding:18}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontFamily:"Georgia,serif",fontSize:22,fontWeight:700}}>T{o.table}</span>
                  <span style={{background:o.status==="pending"?"#fef3c7":"#dbeafe",color:o.status==="pending"?"#92400e":"#1e40af",fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20}}>{o.status==="pending"?"⏳ NEW":"🔥 COOKING"}</span>
                </div>
                <span style={{fontSize:12,color:m>=10?"#dc2626":"#6b7280",fontWeight:m>=10?700:400}}>{m}m {t.timeSince}</span>
              </div>
              <div style={{borderTop:"1px solid rgba(0,0,0,0.08)",paddingTop:10,marginBottom:10}}>
                {o.items.map(i=><div key={i.id} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderBottom:"1px solid rgba(0,0,0,0.05)"}}><span style={{fontSize:20}}>{i.image}</span><span style={{flex:1,fontSize:14,fontWeight:600}}>{i.name}</span><span style={{background:"#1a1a2e",color:"white",borderRadius:20,padding:"2px 10px",fontSize:13,fontWeight:700}}>×{i.qty}</span></div>)}
              </div>
              <div style={{display:"flex",gap:8}}>
                {o.status==="pending"&&<button onClick={()=>onUpdateStatus(o.id,"accepted")} style={{flex:1,padding:"9px",borderRadius:8,border:"none",background:"#1a1a2e",color:"white",fontSize:13,fontWeight:700,cursor:"pointer"}}>✅ {t.acceptOrder}</button>}
                {o.status==="accepted"&&<button onClick={()=>onUpdateStatus(o.id,"served")} style={{flex:1,padding:"9px",borderRadius:8,border:"none",background:"#16a34a",color:"white",fontSize:13,fontWeight:700,cursor:"pointer"}}>🍽️ {t.markServed}</button>}
              </div>
            </div>
          );})}
        </div>}
      </div>
    </div>
  );
}

function Dashboard({orders,t,brand}) {
  const paid=orders.filter(o=>o.status==="paid");
  const totalRev=paid.reduce((s,o)=>s+o.total,0);
  const avgOrder=paid.length>0?Math.round(totalRev/paid.length):0;
  const dishMap={};
  orders.forEach(o=>o.items.forEach(i=>{if(!dishMap[i.name])dishMap[i.name]={name:i.name,image:i.image,qty:0,revenue:0};dishMap[i.name].qty+=i.qty;dishMap[i.name].revenue+=i.price*i.qty;}));
  const topDishes=Object.values(dishMap).sort((a,b)=>b.qty-a.qty).slice(0,6);
  const hourMap={};orders.forEach(o=>{const h=new Date(o.id).getHours();hourMap[h]=(hourMap[h]||0)+1;});
  const hours=Array.from({length:24},(_,i)=>({h:i,count:hourMap[i]||0})).filter(h=>h.count>0);
  const maxCount=Math.max(...hours.map(h=>h.count),1);
  if(orders.length===0)return<div style={{maxWidth:900,margin:"0 auto",padding:"60px 24px",textAlign:"center"}}><div style={{fontSize:64,marginBottom:16}}>📊</div><p style={{color:"#888",fontSize:16}}>{t.noData}</p></div>;
  return(
    <div style={{maxWidth:1100,margin:"0 auto",padding:"24px 16px"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:24}}>
        {[{label:t.todayRevenue,value:fmtMMK(totalRev),icon:"💰",bg:"#fef9c3",sub:paid.length+" paid orders"},{label:t.totalOrders,value:orders.length,icon:"📋",bg:"#dbeafe",sub:orders.filter(o=>o.status==="served").length+" served"},{label:t.avgOrder,value:fmtMMK(avgOrder),icon:"📈",bg:"#dcfce7",sub:"per paid order"}].map(k=>(
          <div key={k.label} style={{...card,padding:"20px 24px"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><div><p style={{color:"#888",fontSize:13,marginBottom:6}}>{k.label}</p><p style={{fontSize:22,fontWeight:700,color:"#1a1a2e"}}>{k.value}</p><p style={{fontSize:12,color:"#aaa",marginTop:4}}>{k.sub}</p></div><div style={{background:k.bg,borderRadius:12,padding:12,fontSize:26}}>{k.icon}</div></div></div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1.5fr 1fr",gap:20}}>
        <div style={{...card,padding:20}}>
          <h3 style={{fontFamily:"Georgia,serif",fontSize:18,color:"#1a1a2e",marginBottom:16}}>🏆 {t.topDishes}</h3>
          {topDishes.map((d,i)=>(
            <div key={d.name} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:"1px solid #f5f0e8"}}>
              <span style={{fontWeight:700,color:brand.accent,minWidth:20,fontSize:15}}>#{i+1}</span>
              <span style={{fontSize:22}}>{d.image}</span>
              <div style={{flex:1}}><p style={{fontWeight:600,fontSize:14,color:"#1a1a2e"}}>{d.name}</p><div style={{background:"#f5f0e8",borderRadius:4,height:6,marginTop:4}}><div style={{background:`linear-gradient(90deg,${brand.accent},${brand.accentDark})`,height:6,borderRadius:4,width:Math.round(d.qty/topDishes[0].qty*100)+"%"}}/></div></div>
              <div style={{textAlign:"right"}}><p style={{fontWeight:700,fontSize:14}}>{d.qty} sold</p><p style={{fontSize:12,color:"#888"}}>{fmtMMK(d.revenue)}</p></div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div style={{...card,padding:20}}>
            <h3 style={{fontFamily:"Georgia,serif",fontSize:18,color:"#1a1a2e",marginBottom:16}}>📂 {t.orderBreakdown}</h3>
            {[{label:t.paidOrders,count:paid.length,color:"#22c55e",bg:"#dcfce7"},{label:t.servedUnpaid,count:orders.filter(o=>o.status==="served").length,color:"#3b82f6",bg:"#dbeafe"},{label:t.preparing,count:orders.filter(o=>o.status==="accepted").length,color:"#f59e0b",bg:"#fef3c7"},{label:t.newOrder,count:orders.filter(o=>o.status==="pending").length,color:"#ef4444",bg:"#fee2e2"}].map(s=>(
              <div key={s.label} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}><div style={{width:10,height:10,borderRadius:"50%",background:s.color}}/><span style={{flex:1,fontSize:13,color:"#555"}}>{s.label}</span><span style={{background:s.bg,color:s.color,fontSize:12,fontWeight:700,padding:"2px 10px",borderRadius:20}}>{s.count}</span></div>
            ))}
          </div>
          {hours.length>0&&<div style={{...card,padding:20}}>
            <h3 style={{fontFamily:"Georgia,serif",fontSize:18,color:"#1a1a2e",marginBottom:16}}>🕐 {t.revenueByHour}</h3>
            <div style={{display:"flex",alignItems:"flex-end",gap:4,height:80}}>
              {hours.map(h=><div key={h.h} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}><span style={{fontSize:10,color:"#888"}}>{h.count}</span><div style={{width:"100%",background:`linear-gradient(180deg,${brand.accent},${brand.accentDark})`,borderRadius:"4px 4px 0 0",height:Math.max(8,Math.round(h.count/maxCount*60))}}/><span style={{fontSize:9,color:"#aaa"}}>{h.h}h</span></div>)}
            </div>
          </div>}
        </div>
      </div>
    </div>
  );
}

function BrandingPanel({brand,onSave,t}) {
  const [form,setForm]=useState({...brand});
  const logos=["🍽️","🍕","🍝","🥗","🍜","🥩","🐟","🫕","🧆","🍱","🏮","⭐","🌟","🎯","🏆","👨‍🍳","🍷","☕","🌿","🌺"];
  const presets=[
    {name:"Midnight Gold",primary:"#1a1a2e",accent:"#c9a96e",accentDark:"#a07840"},
    {name:"Forest Green",primary:"#14532d",accent:"#86efac",accentDark:"#4ade80"},
    {name:"Deep Red",primary:"#7f1d1d",accent:"#fca5a5",accentDark:"#f87171"},
    {name:"Ocean Blue",primary:"#0c4a6e",accent:"#7dd3fc",accentDark:"#38bdf8"},
    {name:"Royal Purple",primary:"#3b0764",accent:"#d8b4fe",accentDark:"#a855f7"},
    {name:"Charcoal",primary:"#111827",accent:"#e5e7eb",accentDark:"#d1d5db"},
  ];
  return(
    <div style={{maxWidth:680}}>
      <h2 style={{fontFamily:"Georgia,serif",fontSize:22,color:"#1a1a2e",marginBottom:20}}>🎨 {t.brandingTab}</h2>
      <div style={{...card,padding:24,marginBottom:16}}>
        <h3 style={{fontSize:15,fontWeight:700,color:"#1a1a2e",marginBottom:14}}>Restaurant Info</h3>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
          <div><label style={lbl}>{t.restaurantName}</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} style={inp}/></div>
          <div><label style={lbl}>{t.tagline}</label><input value={form.tagline} onChange={e=>setForm(f=>({...f,tagline:e.target.value}))} style={inp}/></div>
        </div>
        <div><label style={{...lbl,marginBottom:10}}>{t.logoEmoji}</label><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{logos.map(e=><button key={e} onClick={()=>setForm(f=>({...f,logo:e}))} style={{fontSize:24,padding:"6px 10px",borderRadius:10,border:form.logo===e?"2px solid #c9a96e":"2px solid transparent",background:form.logo===e?"#fef9c3":"#f5f5f5",cursor:"pointer"}}>{e}</button>)}</div></div>
      </div>
      <div style={{...card,padding:24,marginBottom:16}}>
        <h3 style={{fontSize:15,fontWeight:700,color:"#1a1a2e",marginBottom:14}}>Color Theme</h3>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:16}}>
          {presets.map(p=><button key={p.name} onClick={()=>setForm(f=>({...f,...p}))} style={{padding:"10px 8px",borderRadius:10,border:(form.primary===p.primary&&form.accent===p.accent)?"2px solid #c9a96e":"2px solid transparent",cursor:"pointer",background:"white",display:"flex",alignItems:"center",gap:8}}><div style={{display:"flex",gap:3}}><div style={{width:16,height:16,borderRadius:4,background:p.primary}}/><div style={{width:16,height:16,borderRadius:4,background:p.accent}}/></div><span style={{fontSize:12,fontWeight:600,color:"#555"}}>{p.name}</span></button>)}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <div><label style={lbl}>{t.primaryColor}</label><div style={{display:"flex",gap:8,alignItems:"center",marginTop:6}}><input type="color" value={form.primary} onChange={e=>setForm(f=>({...f,primary:e.target.value}))} style={{width:44,height:36,borderRadius:8,border:"1.5px solid #e5e7eb",cursor:"pointer",padding:2}}/><input value={form.primary} onChange={e=>setForm(f=>({...f,primary:e.target.value}))} style={{...inp,marginTop:0,flex:1}}/></div></div>
          <div><label style={lbl}>{t.accentColor}</label><div style={{display:"flex",gap:8,alignItems:"center",marginTop:6}}><input type="color" value={form.accent} onChange={e=>setForm(f=>({...f,accent:e.target.value,accentDark:e.target.value}))} style={{width:44,height:36,borderRadius:8,border:"1.5px solid #e5e7eb",cursor:"pointer",padding:2}}/><input value={form.accent} onChange={e=>setForm(f=>({...f,accent:e.target.value}))} style={{...inp,marginTop:0,flex:1}}/></div></div>
        </div>
      </div>
      <div style={{...card,padding:20,marginBottom:16}}>
        <h3 style={{fontSize:15,fontWeight:700,color:"#1a1a2e",marginBottom:12}}>Live Preview</h3>
        <div style={{borderRadius:12,overflow:"hidden",border:"1px solid #eee"}}>
          <div style={{background:form.primary,padding:"20px 24px",textAlign:"center"}}>
            <div style={{fontSize:32,marginBottom:4}}>{form.logo}</div>
            <p style={{color:form.accent,fontFamily:"Georgia,serif",fontSize:18,fontWeight:700}}>{form.name||"Restaurant Name"}</p>
            <p style={{color:"rgba(255,255,255,0.4)",fontSize:12,marginTop:2}}>{form.tagline||"Your tagline"}</p>
          </div>
          <div style={{padding:16,background:"white",display:"flex",gap:10,alignItems:"center"}}>
            <div style={{background:`linear-gradient(135deg,${form.accent},${form.accentDark})`,color:"white",padding:"8px 18px",borderRadius:20,fontSize:13,fontWeight:700}}>+ Add to cart</div>
            <div style={{color:form.accentDark,fontWeight:700,fontSize:15}}>MMK 8,500</div>
          </div>
        </div>
      </div>
      <button onClick={()=>onSave(form)} style={{width:"100%",padding:"14px",borderRadius:12,border:"none",background:"#1a1a2e",color:"white",cursor:"pointer",fontSize:15,fontWeight:700}}>💾 {t.saveBranding}</button>
    </div>
  );
}

function StaffPanel({staff,onSave,t,brand}) {
  const [list,setList]=useState(staff);
  const [modal,setModal]=useState(null);
  const [confirmDel,setConfirmDel]=useState(null);
  const roleIcon=r=>r==="admin"?"👑":r==="kitchen"?"👨‍🍳":r==="cashier"?"💳":"🙋";
  const roleLabel=r=>t["role"+r.charAt(0).toUpperCase()+r.slice(1)]||r;
  const roleBg=r=>r==="admin"?"#fef3c7":r==="kitchen"?"#dcfce7":r==="cashier"?"#dbeafe":"#f3e8ff";
  const roleColor=r=>r==="admin"?"#92400e":r==="kitchen"?"#166534":r==="cashier"?"#1e40af":"#6b21a8";
  function StaffModal({member,onClose}){
    const [form,setForm]=useState({name:"",pin:"",role:"waiter",...member});
    const accessDesc={admin:"Full access to all sections",waiter:"Customer menu only",kitchen:"Kitchen display only",cashier:"Orders & Bills only"};
    return<Modal onClose={onClose}><h3 style={{fontFamily:"Georgia,serif",fontSize:19,marginBottom:18,color:"#1a1a2e"}}>{member.id?t.editStaff:t.newStaff}</h3><div style={{display:"flex",flexDirection:"column",gap:14}}><div><label style={lbl}>{t.staffName}</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} style={inp}/></div><div><label style={lbl}>{t.staffPin}</label><input type="password" maxLength={4} value={form.pin} onChange={e=>setForm(f=>({...f,pin:e.target.value.replace(/\D/g,"")}))} style={inp} placeholder="e.g. 1234"/></div><div><label style={lbl}>{t.staffRole}</label><select value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))} style={inp}>{["admin","waiter","kitchen","cashier"].map(r=><option key={r} value={r}>{roleIcon(r)} {roleLabel(r)}</option>)}</select></div><div style={{background:"#f9f7f2",borderRadius:8,padding:12,fontSize:13,color:"#666"}}>✅ {accessDesc[form.role]}</div><div style={{display:"flex",gap:10}}><button onClick={onClose} style={{flex:1,padding:"10px",borderRadius:8,border:"1.5px solid #c9a96e",background:"white",color:"#a07840",cursor:"pointer",fontSize:14,fontWeight:600}}>{t.cancel}</button><button onClick={()=>{if(form.name&&form.pin.length===4){const upd=form.id?list.map(s=>s.id===form.id?form:s):[...list,{...form,id:Date.now()}];setList(upd);onSave(upd);onClose();}}} style={{flex:1,padding:"10px",borderRadius:8,border:"none",background:"#1a1a2e",color:"white",cursor:"pointer",fontSize:14,fontWeight:700}}>{t.save}</button></div></div></Modal>;
  }
  return(
    <div style={{maxWidth:680}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <h2 style={{fontFamily:"Georgia,serif",fontSize:22,color:"#1a1a2e"}}>{t.staffTab}</h2>
        <button onClick={()=>setModal({})} style={{padding:"8px 18px",borderRadius:25,border:"none",background:"#1a1a2e",color:"white",cursor:"pointer",fontSize:13,fontWeight:700}}>+ {t.addStaff}</button>
      </div>
      <div style={{display:"grid",gap:12}}>
        {list.map(s=>(
          <div key={s.id} style={{...card,padding:"16px 20px",display:"flex",alignItems:"center",gap:14}}>
            <div style={{fontSize:32}}>{roleIcon(s.role)}</div>
            <div style={{flex:1}}><p style={{fontWeight:700,fontSize:15,color:"#1a1a2e"}}>{s.name}</p><div style={{display:"flex",gap:8,marginTop:4,alignItems:"center"}}><span style={{background:roleBg(s.role),color:roleColor(s.role),fontSize:11,fontWeight:700,padding:"2px 10px",borderRadius:20}}>{roleLabel(s.role)}</span><span style={{fontSize:12,color:"#aaa"}}>PIN: {"●".repeat(s.pin.length)}</span></div></div>
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>setModal(s)} style={{padding:"5px 12px",borderRadius:15,border:"1px solid #c9a96e",background:"white",color:"#a07840",cursor:"pointer",fontSize:12}}>{t.edit}</button>
              <button onClick={()=>setConfirmDel(s.id)} style={{padding:"5px 12px",borderRadius:15,border:"1px solid #fca5a5",background:"white",color:"#dc2626",cursor:"pointer",fontSize:12}}>{t.del}</button>
            </div>
          </div>
        ))}
      </div>
      {modal!==null&&<StaffModal member={modal} onClose={()=>setModal(null)}/>}
      {confirmDel&&<ConfirmModal message={t.confirmDelete} t={t} onConfirm={()=>{const upd=list.filter(s=>s.id!==confirmDel);setList(upd);onSave(upd);setConfirmDel(null);}} onCancel={()=>setConfirmDel(null)}/>}
    </div>
  );
}

export default function App() {
  const [lang,setLang]=useState("en");
  const t=TR[lang];
  const [brand,setBrand]=useState(DEFAULT_BRAND);
  const [staff,setStaff]=useState(DEFAULT_STAFF);
  const [currentUser,setCurrentUser]=useState(null);
  const [view,setView]=useState("login");
  const [adminTab,setAdminTab]=useState("orders");
  const [tables,setTables]=useState(INITIAL_TABLES);
  const [categories,setCategories]=useState(INITIAL_CATS);
  const [activeCategory,setActiveCategory]=useState("starters");
  const [cart,setCart]=useState([]);
  const [selectedTable,setSelectedTable]=useState(1);
  const [orders,setOrders]=useState([]);
  const [orderPlaced,setOrderPlaced]=useState(null);
  const [billModal,setBillModal]=useState(null);
  const [toast,setToast]=useState(null);
  const [notifs,setNotifs]=useState([]);
  const [soundOn,setSoundOn]=useState(true);
  const [qrModal,setQrModal]=useState(null);
  const [tableModal,setTableModal]=useState(null);
  const [catModal,setCatModal]=useState(null);
  const [itemModal,setItemModal]=useState(null);
  const [confirmModal,setConfirmModal]=useState(null);
  const prevPending=useRef(0);

  const G={background:`linear-gradient(135deg,${brand.accent},${brand.accentDark})`,color:"white",border:"none",cursor:"pointer"};
  const pendingCount=orders.filter(o=>o.status==="pending").length;

  useEffect(()=>{
    if(pendingCount>prevPending.current){
      if(soundOn)playOrderAlert();
      const latest=orders.find(o=>o.status==="pending");
      if(latest){
        const tbName=tables.find(tb=>tb.id===latest.table)?.name||latest.table;
        const msg=`🆕 ${t.newOrderAlert} ${t.tableLabel} ${tbName} — ${fmtMMK(latest.total)}`;
        setNotifs(n=>[{id:Date.now(),msg,time:new Date().toLocaleTimeString(),read:false},...n].slice(0,50));
        setToast({msg,type:"success"});
        setTimeout(()=>setToast(null),4000);
      }
    }
    prevPending.current=pendingCount;
  },[pendingCount]);

  const showToast=(msg,type)=>{setToast({msg,type:type||"success"});setTimeout(()=>setToast(null),3000);};
  const getCatName=cat=>lang==="my"&&cat.nameMy?cat.nameMy:cat.name;
  const canAccess=v=>currentUser&&(ROLE_ACCESS[currentUser.role]||[]).includes(v);
  const allowedAdminTabs=ROLE_ADMIN_TABS[currentUser?.role]||[];

  const handleLogin=user=>{setCurrentUser(user);setView(user.role==="kitchen"?"kitchen":user.role==="waiter"?"menu":"admin");};
  const handleLogout=()=>{setCurrentUser(null);setView("login");};

  const saveTable=form=>{form.id?setTables(p=>p.map(t=>t.id===form.id?{...t,...form}:t)):setTables(p=>[...p,{...form,id:Date.now()}]);setTableModal(null);showToast("Saved!");};
  const deleteTable=id=>setConfirmModal({msg:t.confirmDelete,onConfirm:()=>{setTables(p=>p.filter(t=>t.id!==id));setConfirmModal(null);showToast("Deleted","error");}});
  const saveCat=form=>{form.id?setCategories(p=>p.map(c=>c.id===form.id?{...c,...form}:c)):setCategories(p=>[...p,{...form,id:"cat-"+Date.now(),items:[]}]);setCatModal(null);showToast("Saved!");};
  const deleteCat=id=>{const cat=categories.find(c=>c.id===id);setConfirmModal({msg:cat.items.length>0?t.catHasItems:t.confirmDelete,onConfirm:()=>{setCategories(p=>p.filter(c=>c.id!==id));setConfirmModal(null);showToast("Deleted","error");}});};
  const saveItem=(catId,item)=>{setCategories(p=>p.map(cat=>cat.id===catId?{...cat,items:item.id?cat.items.map(i=>i.id===item.id?item:i):[...cat.items,{...item,id:Date.now()}]}:cat));setItemModal(null);showToast("Saved!");};
  const deleteItem=(catId,itemId)=>{setCategories(p=>p.map(cat=>cat.id===catId?{...cat,items:cat.items.filter(i=>i.id!==itemId)}:cat));showToast("Deleted","error");};
  const toggleAvail=(catId,itemId)=>setCategories(p=>p.map(cat=>cat.id===catId?{...cat,items:cat.items.map(i=>i.id===itemId?{...i,available:!i.available}:i)}:cat));
  const addToCart=item=>{setCart(p=>{const ex=p.find(i=>i.id===item.id);return ex?p.map(i=>i.id===item.id?{...i,qty:i.qty+1}:i):[...p,{...item,qty:1}];});showToast(item.name+" "+t.addedToCart);};
  const removeFromCart=id=>setCart(p=>p.filter(i=>i.id!==id));
  const updateQty=(id,d)=>setCart(p=>p.map(i=>i.id===id?{...i,qty:Math.max(1,i.qty+d)}:i));
  const cartTotal=cart.reduce((s,i)=>s+i.price*i.qty,0);
  const cartCount=cart.reduce((s,i)=>s+i.qty,0);
  const placeOrder=()=>{const o={id:Date.now(),table:selectedTable,items:cart,total:cartTotal,time:new Date().toLocaleTimeString(),status:"pending"};setOrders(p=>[o,...p]);setOrderPlaced(o);setCart([]);setView("order-success");};
  const updateStatus=(id,status)=>setOrders(p=>p.map(o=>o.id===id?{...o,status}:o));
  const deleteOrder=id=>setOrders(p=>p.filter(o=>o.id!==id));
  const markTablePaid=tableId=>{setOrders(p=>p.map(o=>o.table===tableId&&o.status==="served"?{...o,status:"paid"}:o));setBillModal(null);showToast("Payment recorded! 💳");};
  const tableOrdersMap={};
  orders.forEach(o=>{if(!tableOrdersMap[o.table])tableOrdersMap[o.table]=[];tableOrdersMap[o.table].push(o);});
  const statusCfg={pending:{label:t.newOrder,bg:"#fef3c7",color:"#92400e",dot:"#f59e0b"},accepted:{label:t.preparing,bg:"#dbeafe",color:"#1e40af",dot:"#3b82f6"},served:{label:t.servedLabel,bg:"#fce7f3",color:"#9d174d",dot:"#ec4899"},paid:{label:t.paid,bg:"#dcfce7",color:"#166534",dot:"#22c55e"}};

  if(!currentUser)return<LoginScreen staff={staff} brand={brand} onLogin={handleLogin} t={t}/>;

  return(
    <div style={{fontFamily:"system-ui,'Noto Sans Myanmar',sans-serif",minHeight:"100vh",background:"#faf8f4"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Myanmar:wght@400;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}.fade-in{animation:fi .3s ease}@keyframes fi{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:${brand.accent};border-radius:3px}`}</style>

      {toast&&<div style={{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",zIndex:9999,padding:"12px 24px",borderRadius:30,fontSize:14,fontWeight:600,background:toast.type==="error"?"#fee2e2":"#1a1a2e",color:toast.type==="error"?"#991b1b":"white",boxShadow:"0 4px 24px rgba(0,0,0,0.2)",whiteSpace:"nowrap"}}>{toast.msg}</div>}

      {confirmModal&&<ConfirmModal message={confirmModal.msg} onConfirm={confirmModal.onConfirm} onCancel={()=>setConfirmModal(null)} t={t}/>}
      {qrModal&&<QRModal table={qrModal} onClose={()=>setQrModal(null)} t={t}/>}
      {tableModal!==null&&<TableModal table={tableModal} onSave={saveTable} onClose={()=>setTableModal(null)} t={t}/>}
      {catModal!==null&&<CatModal cat={catModal} onSave={saveCat} onClose={()=>setCatModal(null)} t={t}/>}
      {itemModal&&<ItemModal item={itemModal.item} catId={itemModal.catId} onSave={saveItem} onClose={()=>setItemModal(null)} t={t}/>}
      {billModal!==null&&tableOrdersMap[billModal]&&<BillModal tableOrders={tableOrdersMap[billModal]} tableName={tables.find(tb=>tb.id===billModal)?.name||billModal} onClose={()=>setBillModal(null)} onMarkPaid={()=>markTablePaid(billModal)} brand={brand} t={t}/>}

      <nav style={{background:brand.primary,padding:"0 16px",height:60,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 20px rgba(0,0,0,0.3)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:22}}>{brand.logo}</span>
          <div><p style={{fontFamily:"Georgia,serif",color:brand.accent,fontSize:15,fontWeight:700,lineHeight:1}}>{brand.name}</p><p style={{color:"rgba(255,255,255,0.25)",fontSize:10,letterSpacing:1}}>MENU BUILDER</p></div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:4,flexWrap:"wrap"}}>
          <button onClick={()=>setLang(l=>l==="en"?"my":"en")} style={{padding:"4px 10px",borderRadius:20,border:`1px solid ${brand.accent}`,background:"transparent",color:brand.accent,cursor:"pointer",fontSize:11,fontWeight:700}}>{lang==="en"?"🇲🇲":"🇬🇧"}</button>
          {canAccess("admin")&&<button onClick={()=>setView("admin")} style={{padding:"5px 12px",borderRadius:20,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,background:view==="admin"?"white":"transparent",color:view==="admin"?brand.primary:"rgba(255,255,255,0.6)"}}>⚙️ Admin</button>}
          {canAccess("kitchen")&&<button onClick={()=>setView("kitchen")} style={{position:"relative",padding:"5px 12px",borderRadius:20,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,background:view==="kitchen"?"white":"transparent",color:view==="kitchen"?brand.primary:"rgba(255,255,255,0.6)"}}>👨‍🍳{pendingCount>0&&<span style={{position:"absolute",top:0,right:0,background:"#ef4444",color:"white",borderRadius:"50%",width:14,height:14,fontSize:9,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>{pendingCount}</span>}</button>}
          {canAccess("dashboard")&&<button onClick={()=>setView("dashboard")} style={{padding:"5px 12px",borderRadius:20,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,background:view==="dashboard"?"white":"transparent",color:view==="dashboard"?brand.primary:"rgba(255,255,255,0.6)"}}>📊</button>}
          {canAccess("menu")&&<button onClick={()=>setView("menu")} style={{padding:"5px 12px",borderRadius:20,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,background:view==="menu"?"white":"transparent",color:view==="menu"?brand.primary:"rgba(255,255,255,0.6)"}}>🍕</button>}
          <NotifBell notifs={notifs} soundOn={soundOn} onToggleSound={()=>setSoundOn(s=>!s)} onMarkAllRead={()=>setNotifs(n=>n.map(x=>({...x,read:true})))} t={t} brand={brand}/>
          <div style={{display:"flex",alignItems:"center",gap:6,marginLeft:4,padding:"4px 10px",borderRadius:20,background:"rgba(255,255,255,0.08)"}}>
            <span style={{fontSize:13}}>{currentUser.role==="admin"?"👑":currentUser.role==="kitchen"?"👨‍🍳":currentUser.role==="cashier"?"💳":"🙋"}</span>
            <span style={{color:"rgba(255,255,255,0.8)",fontSize:12,fontWeight:600,maxWidth:70,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{currentUser.name.split(" ")[0]}</span>
            <button onClick={handleLogout} style={{background:"transparent",border:"none",color:"rgba(255,255,255,0.35)",cursor:"pointer",fontSize:11}}>{t.logout}</button>
          </div>
        </div>
      </nav>

      {view==="kitchen"&&<KitchenDisplay orders={orders} onUpdateStatus={updateStatus} t={t} brand={brand}/>}
      {view==="dashboard"&&<div className="fade-in"><Dashboard orders={orders} t={t} brand={brand}/></div>}

      {view==="order-success"&&orderPlaced&&(
        <div className="fade-in" style={{maxWidth:500,margin:"60px auto",padding:24,textAlign:"center"}}>
          <div style={{...card,padding:48}}>
            <div style={{fontSize:64,marginBottom:16}}>✅</div>
            <p style={{fontFamily:"Georgia,serif",fontSize:26,fontWeight:700,color:"#1a1a2e",marginBottom:8}}>{t.orderPlaced}</p>
            <p style={{color:"#888",marginBottom:24}}>{t.tableLabel} {tables.find(tb=>tb.id===orderPlaced.table)?.name||orderPlaced.table} · {orderPlaced.time}</p>
            <div style={{background:"#faf8f4",borderRadius:12,padding:20,marginBottom:24,textAlign:"left"}}>
              {orderPlaced.items.map(i=><div key={i.id} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #eee",fontSize:14}}><span>{i.image} {i.name} × {i.qty}</span><span style={{fontWeight:700,color:brand.accentDark}}>{fmtMMK(i.price*i.qty)}</span></div>)}
              <div style={{display:"flex",justifyContent:"space-between",marginTop:12,fontWeight:700,fontSize:16}}><span>Total</span><span style={{color:brand.accentDark}}>{fmtMMK(orderPlaced.total)}</span></div>
            </div>
            <p style={{color:"#888",fontSize:14,marginBottom:24}}>{t.yourFoodPrepared}</p>
            <button onClick={()=>{setView("menu");setOrderPlaced(null);}} style={{...G,padding:"12px 32px",borderRadius:30,fontSize:15,fontWeight:700}}>{t.orderMore}</button>
          </div>
        </div>
      )}

      {view==="menu"&&(
        <div className="fade-in" style={{maxWidth:800,margin:"0 auto",paddingBottom:120}}>
          <div style={{background:`linear-gradient(135deg,${brand.primary},${brand.primary}dd)`,padding:"36px 24px 28px",textAlign:"center"}}>
            <div style={{fontSize:40,marginBottom:6}}>{brand.logo}</div>
            <p style={{color:brand.accent,fontSize:11,letterSpacing:3,marginBottom:6}}>{t.welcomeTo}</p>
            <h1 style={{fontFamily:"Georgia,serif",color:"white",fontSize:28,fontWeight:700,marginBottom:4}}>{brand.name}</h1>
            <p style={{color:"rgba(255,255,255,0.45)",fontSize:13,fontStyle:"italic",marginBottom:18}}>{brand.tagline}</p>
            <div style={{display:"inline-flex",alignItems:"center",gap:10,background:"rgba(255,255,255,0.1)",borderRadius:30,padding:"8px 20px"}}>
              <span style={{color:brand.accent}}>🪑</span><span style={{color:"white",fontSize:14}}>{t.tableLabel}</span>
              <select value={selectedTable} onChange={e=>setSelectedTable(Number(e.target.value))} style={{background:"transparent",border:"none",color:brand.accent,fontSize:16,fontWeight:700,outline:"none",cursor:"pointer"}}>
                {tables.map(tb=><option key={tb.id} value={tb.id} style={{color:"#1a1a2e"}}>{tb.name}</option>)}
              </select>
            </div>
          </div>
          <div style={{background:"white",borderBottom:"1px solid #eee",display:"flex",overflowX:"auto",position:"sticky",top:60,zIndex:50}}>
            {categories.map(cat=><button key={cat.id} onClick={()=>setActiveCategory(cat.id)} style={{padding:"14px 16px",border:"none",background:"transparent",cursor:"pointer",fontSize:13,fontWeight:activeCategory===cat.id?700:400,color:activeCategory===cat.id?brand.accentDark:"#666",borderBottom:activeCategory===cat.id?`2.5px solid ${brand.accent}`:"2.5px solid transparent",whiteSpace:"nowrap",transition:"all 0.2s"}}>{cat.icon} {getCatName(cat)}</button>)}
          </div>
          <div style={{padding:"20px 16px"}}>
            {categories.filter(c=>c.id===activeCategory).map(cat=>(
              <div key={cat.id}>
                <h2 style={{fontFamily:"Georgia,serif",fontSize:22,color:"#1a1a2e",marginBottom:16,paddingBottom:8,borderBottom:"1px solid #e8e0d0"}}>{cat.icon} {getCatName(cat)}</h2>
                <div style={{display:"grid",gap:12}}>
                  {cat.items.map(item=>(
                    <div key={item.id} style={{...card,padding:"16px 20px",display:"flex",alignItems:"center",gap:16,opacity:item.available?1:0.5}}>
                      <div style={{fontSize:36,minWidth:48,textAlign:"center"}}>{item.image}</div>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                          <p style={{fontWeight:700,fontSize:15,color:"#1a1a2e"}}>{item.name}</p>
                          {!item.available&&<span style={{background:"#fee2e2",color:"#991b1b",fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:20}}>{t.unavailable}</span>}
                        </div>
                        <p style={{fontSize:13,color:"#888",lineHeight:1.4}}>{item.desc}</p>
                      </div>
                      <div style={{textAlign:"right",minWidth:90}}>
                        <p style={{fontSize:16,fontWeight:700,color:brand.accentDark,marginBottom:8}}>{fmtMMK(item.price)}</p>
                        {item.available&&<button onClick={()=>addToCart(item)} style={{...G,padding:"6px 16px",borderRadius:20,fontSize:13,fontWeight:700}}>{t.addToCart}</button>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {cart.length>0&&(
            <div style={{position:"fixed",bottom:0,left:0,right:0,background:"white",borderTop:"1px solid #eee",padding:"14px 20px",boxShadow:"0 -4px 20px rgba(0,0,0,0.1)",zIndex:200}}>
              <div style={{maxWidth:800,margin:"0 auto"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <p style={{fontWeight:700,fontSize:15}}>🛒 {cartCount} {cartCount>1?t.items:t.item}</p>
                  <p style={{fontWeight:700,color:brand.accentDark,fontSize:18}}>{fmtMMK(cartTotal)}</p>
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:10}}>
                  {cart.map(i=>(
                    <div key={i.id} style={{display:"flex",alignItems:"center",gap:6,background:"#faf8f4",borderRadius:20,padding:"4px 12px",fontSize:13}}>
                      <span>{i.image}</span><span>{i.name}</span>
                      <button onClick={()=>updateQty(i.id,-1)} style={{background:"#e5e7eb",border:"none",borderRadius:"50%",width:18,height:18,cursor:"pointer",fontSize:11}}>−</button>
                      <span style={{fontWeight:700}}>{i.qty}</span>
                      <button onClick={()=>updateQty(i.id,1)} style={{background:brand.accent,border:"none",borderRadius:"50%",width:18,height:18,cursor:"pointer",fontSize:11,color:"white"}}>+</button>
                      <button onClick={()=>removeFromCart(i.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#ccc",fontSize:14}}>✕</button>
                    </div>
                  ))}
                </div>
                <button onClick={placeOrder} style={{...G,width:"100%",padding:14,borderRadius:30,fontSize:16,fontWeight:700}}>{t.placeOrder} · {t.tableLabel} {tables.find(tb=>tb.id===selectedTable)?.name||selectedTable}</button>
              </div>
            </div>
          )}
        </div>
      )}

      {view==="admin"&&(
        <div className="fade-in" style={{maxWidth:1100,margin:"0 auto",padding:"24px 16px"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:22}}>
            {[{label:t.tables,value:tables.length,icon:"🪑",bg:"#dbeafe"},{label:t.menuItems,value:categories.reduce((s,c)=>s+c.items.length,0),icon:"🍽️",bg:"#dcfce7"},{label:t.activeOrders,value:orders.filter(o=>o.status!=="paid").length,icon:"📋",bg:"#fef3c7"},{label:"Revenue",value:fmtMMK(orders.filter(o=>o.status==="paid").reduce((s,o)=>s+o.total,0)),icon:"💰",bg:"#fce7f3"}].map(s=>(
              <div key={s.label} style={{...card,padding:"16px 20px",display:"flex",alignItems:"center",gap:12}}><div style={{background:s.bg,borderRadius:10,padding:10,fontSize:22}}>{s.icon}</div><div><p style={{fontSize:s.label==="Revenue"?14:24,fontWeight:700,color:"#1a1a2e",lineHeight:1}}>{s.value}</p><p style={{color:"#888",fontSize:12}}>{s.label}</p></div></div>
            ))}
          </div>
          <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
            {[["orders","📋 Orders"],["bill","🧾 Bills"],allowedAdminTabs.includes("menu")&&["menu","🍝 Menu"],allowedAdminTabs.includes("tables")&&["tables",t.tablesTab],allowedAdminTabs.includes("cats")&&["cats",t.catsTab],allowedAdminTabs.includes("staff")&&["staff",t.staffTab],allowedAdminTabs.includes("branding")&&["branding",t.brandingTab]].filter(Boolean).map(([id,label])=>(
              <button key={id} onClick={()=>setAdminTab(id)} style={{padding:"8px 16px",borderRadius:25,border:"none",cursor:"pointer",fontSize:13,fontWeight:600,background:adminTab===id?brand.primary:"white",color:adminTab===id?"white":"#555",boxShadow:adminTab===id?"0 2px 10px rgba(0,0,0,0.18)":"0 1px 4px rgba(0,0,0,0.08)",transition:"all 0.2s"}}>{label}</button>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:20}}>
            <div>
              {adminTab==="orders"&&(
                <div>
                  <h2 style={{fontFamily:"Georgia,serif",fontSize:22,color:"#1a1a2e",marginBottom:16}}>{t.liveOrders}</h2>
                  {orders.length===0?<div style={{...card,padding:40,textAlign:"center",color:"#bbb"}}>{t.noOrders}</div>:orders.map(o=>{
                    const sc=statusCfg[o.status]||statusCfg.pending;
                    return<div key={o.id} style={{...card,padding:"14px 20px",marginBottom:12}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontWeight:700,fontSize:15}}>{t.tableLabel} {tables.find(tb=>tb.id===o.table)?.name||o.table}</span><span style={{background:sc.bg,color:sc.color,fontSize:11,fontWeight:700,padding:"2px 10px",borderRadius:20,display:"flex",alignItems:"center",gap:4}}><span style={{width:6,height:6,borderRadius:"50%",background:sc.dot,display:"inline-block"}}/>{sc.label}</span></div>
                        <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{color:brand.accentDark,fontWeight:700,fontSize:14}}>{fmtMMK(o.total)}</span><button onClick={()=>setBillModal(o.table)} style={{padding:"4px 12px",borderRadius:15,border:`1px solid ${brand.accent}`,background:"white",color:brand.accentDark,cursor:"pointer",fontSize:11,fontWeight:700}}>{t.generateBill}</button></div>
                      </div>
                      <p style={{fontSize:12,color:"#888",marginBottom:6}}>{o.items.map(i=>i.image+" "+i.name+"×"+i.qty).join("  ")}</p>
                      <p style={{fontSize:11,color:"#bbb",marginBottom:8}}>🕐 {o.time}</p>
                      <div style={{display:"flex",gap:6}}>
                        {o.status==="pending"&&<button onClick={()=>updateStatus(o.id,"accepted")} style={{flex:1,padding:"7px",borderRadius:8,border:"none",background:brand.primary,color:"white",fontSize:12,fontWeight:700,cursor:"pointer"}}>{t.acceptOrder}</button>}
                        {o.status==="accepted"&&<button onClick={()=>updateStatus(o.id,"served")} style={{flex:1,padding:"7px",borderRadius:8,border:"none",background:"#16a34a",color:"white",fontSize:12,fontWeight:700,cursor:"pointer"}}>{t.markServed}</button>}
                        {o.status==="served"&&<button onClick={()=>updateStatus(o.id,"paid")} style={{flex:1,padding:"7px",borderRadius:8,border:"none",background:"#7c3aed",color:"white",fontSize:12,fontWeight:700,cursor:"pointer"}}>💳 {t.markPaid}</button>}
                        {o.status==="paid"&&<div style={{flex:1,padding:"7px",borderRadius:8,background:"#f0fdf4",border:"1px solid #bbf7d0",textAlign:"center",fontSize:12,color:"#166534",fontWeight:600}}>{t.completed}</div>}
                        <button onClick={()=>deleteOrder(o.id)} style={{padding:"7px 10px",borderRadius:8,border:"1px solid #fca5a5",background:"white",color:"#dc2626",fontSize:12,cursor:"pointer"}}>✕</button>
                      </div>
                    </div>;
                  })}
                </div>
              )}
              {adminTab==="bill"&&(
                <div>
                  <h2 style={{fontFamily:"Georgia,serif",fontSize:22,color:"#1a1a2e",marginBottom:16}}>🧾 Bills by Table</h2>
                  {Object.keys(tableOrdersMap).length===0?<div style={{...card,padding:40,textAlign:"center",color:"#bbb"}}>{t.noOrders}</div>
                  :Object.entries(tableOrdersMap).map(([tableId,tOrds])=>{
                    const tb=tables.find(t=>t.id===Number(tableId));
                    const total=tOrds.reduce((s,o)=>s+o.total,0);
                    const allPaid=tOrds.every(o=>o.status==="paid");
                    const hasServed=tOrds.some(o=>o.status==="served");
                    return<div key={tableId} style={{...card,padding:"16px 20px",marginBottom:12,borderLeft:`4px solid ${allPaid?"#22c55e":hasServed?"#ec4899":"#f59e0b"}`}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><p style={{fontWeight:700,fontSize:16}}>{t.tableLabel} {tb?.name||tableId}</p><p style={{fontSize:13,color:"#888",marginTop:2}}>{tOrds.length} order{tOrds.length>1?"s":""}</p></div><div style={{textAlign:"right"}}><p style={{fontWeight:700,fontSize:18,color:brand.accentDark}}>{fmtMMK(total)}</p><span style={{fontSize:12,fontWeight:700,padding:"2px 10px",borderRadius:20,background:allPaid?"#dcfce7":"#fef3c7",color:allPaid?"#166534":"#92400e"}}>{allPaid?t.billPaid:t.unpaid}</span></div></div>
                      {!allPaid&&<div style={{display:"flex",gap:8,marginTop:12}}><button onClick={()=>setBillModal(Number(tableId))} style={{...G,flex:1,padding:"8px",borderRadius:8,fontSize:13,fontWeight:700}}>🧾 {t.generateBill}</button>{hasServed&&<button onClick={()=>markTablePaid(Number(tableId))} style={{flex:1,padding:"8px",borderRadius:8,border:"none",background:"#7c3aed",color:"white",cursor:"pointer",fontSize:13,fontWeight:700}}>💳 {t.markPaid}</button>}</div>}
                      {allPaid&&<button onClick={()=>setBillModal(Number(tableId))} style={{...G,width:"100%",padding:"8px",borderRadius:8,fontSize:13,fontWeight:700,marginTop:12}}>🖨️ {t.printReceipt}</button>}
                    </div>;
                  })}
                </div>
              )}
              {adminTab==="menu"&&(
                <div>{categories.map(cat=>(
                  <div key={cat.id} style={{...card,marginBottom:16,overflow:"hidden"}}>
                    <div style={{padding:"12px 20px",background:brand.primary,display:"flex",justifyContent:"space-between",alignItems:"center"}}><p style={{fontFamily:"Georgia,serif",color:brand.accent,fontWeight:700}}>{cat.icon} {getCatName(cat)}</p><button onClick={()=>setItemModal({catId:cat.id,item:{}})} style={{...G,padding:"5px 14px",borderRadius:20,fontSize:12,fontWeight:700}}>{t.addItem}</button></div>
                    {cat.items.length===0&&<p style={{padding:"16px 20px",color:"#bbb",fontSize:13,fontStyle:"italic"}}>No items yet</p>}
                    {cat.items.map(item=>(
                      <div key={item.id} style={{padding:"12px 20px",borderBottom:"1px solid #f5f0e8",display:"flex",alignItems:"center",gap:12}}>
                        <span style={{fontSize:24}}>{item.image}</span>
                        <div style={{flex:1}}><div style={{display:"flex",gap:8,alignItems:"center"}}><p style={{fontWeight:600,fontSize:14}}>{item.name}</p><span style={{background:item.available?"#dcfce7":"#fee2e2",color:item.available?"#166534":"#991b1b",fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:20}}>{item.available?t.available:t.unavailable}</span></div><p style={{fontSize:12,color:"#888"}}>{item.desc}</p></div>
                        <p style={{fontWeight:700,color:brand.accentDark,minWidth:70,textAlign:"right",fontSize:13}}>{fmtMMK(item.price)}</p>
                        <div style={{display:"flex",gap:6}}>
                          <button onClick={()=>toggleAvail(cat.id,item.id)} style={{padding:"4px 10px",borderRadius:15,border:"1px solid #ddd",background:"white",cursor:"pointer",fontSize:11}}>{item.available?t.disable:t.enable}</button>
                          <button onClick={()=>setItemModal({catId:cat.id,item})} style={{padding:"4px 10px",borderRadius:15,border:`1px solid ${brand.accent}`,background:"white",color:brand.accentDark,cursor:"pointer",fontSize:11}}>{t.edit}</button>
                          <button onClick={()=>deleteItem(cat.id,item.id)} style={{padding:"4px 10px",borderRadius:15,border:"1px solid #fca5a5",background:"white",color:"#dc2626",cursor:"pointer",fontSize:11}}>{t.del}</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}</div>
              )}
              {adminTab==="tables"&&(
                <div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><h2 style={{fontFamily:"Georgia,serif",fontSize:22,color:"#1a1a2e"}}>{t.manageTablesTitle}</h2><button onClick={()=>setTableModal({})} style={{...G,padding:"8px 18px",borderRadius:25,fontSize:13,fontWeight:700}}>{t.addTable}</button></div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
                    {tables.map(tb=>(
                      <div key={tb.id} style={{...card,padding:"16px 20px",display:"flex",alignItems:"center",gap:14}}>
                        <div style={{background:"#f0ebe0",borderRadius:12,padding:"10px 14px",minWidth:56,textAlign:"center"}}><p style={{fontFamily:"Georgia,serif",fontSize:22,fontWeight:700,color:"#1a1a2e",lineHeight:1}}>{tb.name}</p><p style={{fontSize:10,color:"#888",marginTop:2}}>{t.tableLabel}</p></div>
                        <div style={{flex:1}}>{tb.desc&&<p style={{fontSize:13,color:"#666",marginBottom:6}}>{tb.desc}</p>}<div style={{display:"flex",gap:6}}><button onClick={()=>setQrModal(tb)} style={{padding:"4px 10px",borderRadius:15,border:`1px solid ${brand.accent}`,background:"white",color:brand.accentDark,cursor:"pointer",fontSize:11}}>QR</button><button onClick={()=>setTableModal(tb)} style={{padding:"4px 10px",borderRadius:15,border:`1px solid ${brand.accent}`,background:"white",color:brand.accentDark,cursor:"pointer",fontSize:11}}>{t.edit}</button><button onClick={()=>deleteTable(tb.id)} style={{padding:"4px 10px",borderRadius:15,border:"1px solid #fca5a5",background:"white",color:"#dc2626",cursor:"pointer",fontSize:11}}>{t.del}</button></div></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {adminTab==="cats"&&(
                <div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><h2 style={{fontFamily:"Georgia,serif",fontSize:22,color:"#1a1a2e"}}>{t.manageCats}</h2><button onClick={()=>setCatModal({})} style={{...G,padding:"8px 18px",borderRadius:25,fontSize:13,fontWeight:700}}>{t.addCat}</button></div>
                  <div style={{display:"grid",gap:10}}>
                    {categories.map((cat,idx)=>(
                      <div key={cat.id} style={{...card,padding:"14px 20px",display:"flex",alignItems:"center",gap:14}}>
                        <div style={{fontSize:32,minWidth:48,textAlign:"center"}}>{cat.icon}</div>
                        <div style={{flex:1}}><p style={{fontWeight:700,fontSize:15}}>{cat.name}</p>{cat.nameMy&&<p style={{fontSize:13,color:"#888"}}>{cat.nameMy}</p>}<p style={{fontSize:12,color:"#aaa",marginTop:2}}>{cat.items.length} items</p></div>
                        <div style={{display:"flex",flexDirection:"column",gap:6}}>
                          <div style={{display:"flex",gap:4}}><button disabled={idx===0} onClick={()=>setCategories(p=>{const a=[...p];[a[idx-1],a[idx]]=[a[idx],a[idx-1]];return a;})} style={{padding:"3px 8px",borderRadius:8,border:"1px solid #ddd",background:"white",cursor:idx===0?"not-allowed":"pointer",color:idx===0?"#ccc":"#555",fontSize:12}}>↑</button><button disabled={idx===categories.length-1} onClick={()=>setCategories(p=>{const a=[...p];[a[idx],a[idx+1]]=[a[idx+1],a[idx]];return a;})} style={{padding:"3px 8px",borderRadius:8,border:"1px solid #ddd",background:"white",cursor:idx===categories.length-1?"not-allowed":"pointer",color:idx===categories.length-1?"#ccc":"#555",fontSize:12}}>↓</button></div>
                          <div style={{display:"flex",gap:4}}><button onClick={()=>setCatModal(cat)} style={{padding:"4px 10px",borderRadius:15,border:`1px solid ${brand.accent}`,background:"white",color:brand.accentDark,cursor:"pointer",fontSize:11}}>{t.edit}</button><button onClick={()=>deleteCat(cat.id)} style={{padding:"4px 10px",borderRadius:15,border:"1px solid #fca5a5",background:"white",color:"#dc2626",cursor:"pointer",fontSize:11}}>{t.del}</button></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {adminTab==="staff"&&<StaffPanel staff={staff} onSave={setStaff} t={t} brand={brand}/>}
              {adminTab==="branding"&&<BrandingPanel brand={brand} onSave={b=>{setBrand(b);showToast(t.brandingSaved);}} t={t}/>}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              <div style={{...card,padding:20}}>
                <h3 style={{fontFamily:"Georgia,serif",fontSize:18,marginBottom:14,color:"#1a1a2e"}}>{t.qrCodes}</h3>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,maxHeight:220,overflowY:"auto"}}>
                  {tables.map(tb=><button key={tb.id} onClick={()=>setQrModal(tb)} style={{padding:10,borderRadius:10,border:`1.5px solid ${brand.accent}`,background:"white",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4,fontSize:12,color:brand.accentDark,fontWeight:600}}><QRCode tableNum={tb.name} size={48}/><span>{t.tableLabel} {tb.name}</span></button>)}
                </div>
              </div>
              <div style={{...card,padding:20}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><h3 style={{fontFamily:"Georgia,serif",fontSize:18,color:"#1a1a2e"}}>{t.liveOrders}</h3>{pendingCount>0&&<span style={{background:"#fef3c7",color:"#92400e",fontSize:12,fontWeight:700,padding:"2px 10px",borderRadius:20}}>{pendingCount} {t.newBadge}</span>}</div>
                {orders.length===0?<p style={{color:"#aaa",fontSize:13,textAlign:"center",padding:"16px 0"}}>{t.noOrders}</p>:orders.slice(0,5).map(o=>{const sc=statusCfg[o.status]||statusCfg.pending;return<div key={o.id} style={{padding:"10px 0",borderBottom:"1px solid #f5f0e8"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontWeight:700,fontSize:13}}>{t.tableLabel} {tables.find(tb=>tb.id===o.table)?.name||o.table}</span><span style={{background:sc.bg,color:sc.color,fontSize:10,fontWeight:700,padding:"1px 8px",borderRadius:20}}>{sc.label}</span></div><span style={{color:brand.accentDark,fontWeight:700,fontSize:12}}>{fmtMMK(o.total)}</span></div><p style={{fontSize:11,color:"#bbb"}}>🕐 {o.time}</p></div>;})}
                {orders.length>5&&<p style={{fontSize:12,color:"#aaa",textAlign:"center",marginTop:8}}>+{orders.length-5} more</p>}
              </div>
              <button onClick={()=>setView("menu")} style={{...G,padding:14,borderRadius:12,fontSize:14,fontWeight:700}}>{t.previewMenu}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
