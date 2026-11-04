const products = [
  {id:"r1",sku:"YON-ARC11P",cat:"racket",brand:"Yonex",name:"ARCSABER 11 PRO",desc:"4U/G5, steif, Made in Japan, unbesaitet.",price:179.40,compareAt:179.90,stock:6,badge:"−0,50 €"},
  {id:"r2",sku:"YON-NF800P",cat:"racket",brand:"Yonex",name:"NANOFLARE 800 PRO",desc:"4U/G5, grifflastig, sehr steif, Turnier.",price:179.40,compareAt:179.90,stock:5,badge:"−0,50 €"},
  {id:"s1",sku:"YON-AS30",cat:"shuttle",brand:"Yonex",name:"AEROSENSA 30 12er",desc:"Gänse-Naturfeder, Club- und Turniertraining.",price:49.45,compareAt:49.95,stock:24,badge:"Club"},
  {id:"s2",sku:"YON-AS50",cat:"shuttle",brand:"Yonex",name:"AEROSENSA 50 12er",desc:"Premium-Gänsefeder für hochwertigen Spielbetrieb.",price:56.37,compareAt:56.87,stock:12,badge:"Premium"},
  {id:"s3",sku:"YON-M600",cat:"shuttle",brand:"Yonex",name:"MAVIS 600 Nylon 6er",desc:"Langlebiger Nylonball für Training.",price:11.45,compareAt:11.95,stock:18,badge:"Training"},
  {id:"s4",sku:"YON-M2000",cat:"shuttle",brand:"Yonex",name:"MAVIS 2000 Nylon 6er",desc:"Hochwertiger Nylonball mit stabiler Flugkurve.",price:12.45,compareAt:12.95,stock:18,badge:"Bestseller"},
  {id:"g1",sku:"YON-MESH3",cat:"grip",brand:"Yonex",name:"Mesh Grap 0.65 mm 3er",desc:"Weiß, perforiertes Overgrip.",price:11.45,compareAt:11.95,stock:20,badge:"3er Pack"},
  {id:"g2",sku:"YON-FROT10",cat:"grip",brand:"Yonex",name:"Frottee Grip 10er",desc:"Baumwoll-Frotteegriffband für schweißintensive Spiele.",price:21.45,compareAt:21.95,stock:10,badge:"10er Pack"},
  {id:"a1",sku:"YON-BG65-200",cat:"accessory",brand:"Yonex",name:"BG 65 0.70 mm 200 m",desc:"Allround-Badmintonsaite mit Fokus auf Haltbarkeit.",price:96.94,compareAt:97.44,stock:8,badge:"200 m"}
];

const money = n => n.toLocaleString("de-DE",{style:"currency",currency:"EUR"});
let cart = JSON.parse(localStorage.getItem("shuttlewert-cart") || "{}");
let filter = "all";

const grid = document.querySelector("#productGrid");
const cartDrawer = document.querySelector("#cartDrawer");
const overlay = document.querySelector("#overlay");

function productVisual(p){
  return `<div class="product-visual product-visual-real">
    <span class="product-badge">${p.badge}</span>
    <div class="visual-brand">${p.brand}</div>
    <div class="visual-model">${p.name}</div>
    <div class="visual-note">Originalfoto folgt nach Bildfreigabe</div>
  </div>`;
}

function renderProducts(){
  const visible = products.filter(p => filter==="all" || p.cat===filter);
  grid.innerHTML = visible.map(p => `
    <article class="product-card">
      ${productVisual(p)}
      <div class="product-body">
        <div class="product-category">${label(p.cat)} · SKU ${p.sku}</div>
        <div class="product-title">${p.name}</div>
        <div class="product-desc">${p.desc}</div>
        <div class="stock ${p.stock < 4 ? "low" : ""}">${p.stock > 0 ? `Auf Lager: ${p.stock}` : "Nicht auf Lager"}</div>
        <div class="compare-price">Referenz: ${money(p.compareAt)}</div>
        <div class="product-bottom">
          <span class="price">${money(p.price)}</span>
          <button class="add-button" data-add="${p.id}" type="button" ${p.stock<=0?"disabled":""}>Hinzufügen</button>
        </div>
      </div>
    </article>`).join("");
}

function label(cat){
  return ({racket:"Schläger",shuttle:"Bälle",grip:"Griffband",accessory:"Zubehör"})[cat] || cat;
}

function save(){
  localStorage.setItem("shuttlewert-cart", JSON.stringify(cart));
  renderCart();
}

function add(id){
  const p=products.find(x=>x.id===id);
  const next=(cart[id]||0)+1;
  if(next>p.stock) return alert("Die gewünschte Menge ist derzeit nicht verfügbar.");
  cart[id]=next; save(); openCart();
}
function change(id,delta){
  const p=products.find(x=>x.id===id);
  const next=(cart[id]||0)+delta;
  if(next>p.stock) return;
  cart[id]=next;
  if(cart[id]<=0) delete cart[id];
  save();
}

function renderCart(){
  const entries = Object.entries(cart);
  const count = entries.reduce((sum,[,qty])=>sum+qty,0);
  document.querySelector("#cartCount").textContent=count;
  const wrap=document.querySelector("#cartItems");
  if(!entries.length){
    wrap.innerHTML="<p>Dein Warenkorb ist noch leer.</p>";
    document.querySelector("#cartTotal").textContent=money(0);
    return;
  }
  let total=0;
  wrap.innerHTML=entries.map(([id,qty])=>{
    const p=products.find(x=>x.id===id); total+=p.price*qty;
    return `<div class="cart-item">
      <div><strong>${p.name}</strong><br><small>${money(p.price)} · ${qty} Stück</small>
        <div class="qty-row"><button data-delta="-1" data-id="${id}">−</button><span>${qty}</span><button data-delta="1" data-id="${id}">+</button></div>
      </div><strong>${money(p.price*qty)}</strong>
    </div>`;
  }).join("");
  document.querySelector("#cartTotal").textContent=money(total);
}

function openCart(){ cartDrawer.classList.add("open"); cartDrawer.setAttribute("aria-hidden","false"); overlay.hidden=false; }
function closeCart(){ cartDrawer.classList.remove("open"); cartDrawer.setAttribute("aria-hidden","true"); overlay.hidden=true; }

document.addEventListener("click",e=>{
  const addBtn=e.target.closest("[data-add]"); if(addBtn) add(addBtn.dataset.add);
  const qty=e.target.closest("[data-delta]"); if(qty) change(qty.dataset.id,Number(qty.dataset.delta));
  const f=e.target.closest(".filter"); if(f){
    document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));
    f.classList.add("active"); filter=f.dataset.filter; renderProducts();
  }
});
document.querySelector("#cartButton").addEventListener("click",openCart);
document.querySelector("#closeCart").addEventListener("click",closeCart);
overlay.addEventListener("click",closeCart);

document.querySelector("#checkoutButton").addEventListener("click",()=>{
  const entries=Object.entries(cart);
  if(!entries.length) return alert("Der Warenkorb ist leer.");
  location.href="checkout.html";
});

renderProducts(); renderCart();
