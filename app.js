const products = [
  {id:"r1",cat:"racket",icon:"🏸",name:"Aero Strike 4U",desc:"Leichter Allround-Schläger für Training und Match.",price:89.90,badge:"Bestseller"},
  {id:"r2",cat:"racket",icon:"🏸",name:"Power Smash 3U",desc:"Kopflastige Balance für offensives Doppel und Einzel.",price:119.90,badge:"Performance"},
  {id:"s1",cat:"shuttle",icon:"🪶",name:"Feather Pro 12",desc:"Naturfederbälle, 12er-Dose, Geschwindigkeit 77.",price:29.90,badge:"Verein"},
  {id:"s2",cat:"shuttle",icon:"⚪",name:"Training Nylon 6",desc:"Robuste Nylonbälle für Einsteiger und Training.",price:14.90,badge:"Training"},
  {id:"g1",cat:"grip",icon:"◩",name:"Dry Grip 3er",desc:"Dünnes Overgrip mit trockenem, direktem Griffgefühl.",price:8.90,badge:"3er Pack"},
  {id:"g2",cat:"grip",icon:"◩",name:"Comfort Grip 3er",desc:"Weiches Overgrip für längere Trainingseinheiten.",price:9.90,badge:"Comfort"},
  {id:"a1",cat:"accessory",icon:"🎒",name:"Court Bag 6R",desc:"Schlägertasche mit Schuh- und Zubehörfach.",price:54.90,badge:"Neu"},
  {id:"a2",cat:"accessory",icon:"🧦",name:"Match Socks 2er",desc:"Gepolsterte Sportsocken für Hallentraining.",price:12.90,badge:"2er Pack"}
];

const money = n => n.toLocaleString("de-DE",{style:"currency",currency:"EUR"});
let cart = JSON.parse(localStorage.getItem("shuttlehaus-cart") || "{}");
let filter = "all";

const grid = document.querySelector("#productGrid");
const cartDrawer = document.querySelector("#cartDrawer");
const overlay = document.querySelector("#overlay");

function renderProducts(){
  const visible = products.filter(p => filter==="all" || p.cat===filter);
  grid.innerHTML = visible.map(p => `
    <article class="product-card">
      <div class="product-visual"><span class="product-badge">${p.badge}</span><span aria-hidden="true">${p.icon}</span></div>
      <div class="product-body">
        <div class="product-category">${label(p.cat)}</div>
        <div class="product-title">${p.name}</div>
        <div class="product-desc">${p.desc}</div>
        <div class="product-bottom">
          <span class="price">${money(p.price)}</span>
          <button class="add-button" data-add="${p.id}" type="button">Hinzufügen</button>
        </div>
      </div>
    </article>`).join("");
}

function label(cat){
  return ({racket:"Schläger",shuttle:"Bälle",grip:"Griffband",accessory:"Zubehör"})[cat] || cat;
}

function save(){
  localStorage.setItem("shuttlehaus-cart", JSON.stringify(cart));
  renderCart();
}

function add(id){ cart[id]=(cart[id]||0)+1; save(); openCart(); }
function change(id,delta){
  cart[id]=(cart[id]||0)+delta;
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
  const lines=entries.map(([id,qty])=>{const p=products.find(x=>x.id===id);return `${qty}x ${p.name} – ${money(p.price*qty)}`;});
  const total=entries.reduce((s,[id,q])=>s+products.find(x=>x.id===id).price*q,0);
  const body=encodeURIComponent("Hallo,\n\nich möchte folgende Produkte anfragen:\n\n"+lines.join("\n")+"\n\nSumme: "+money(total)+"\n\nName:\nAdresse:\nTelefon:\n\nViele Grüße");
  location.href=`mailto:shop@example.com?subject=Bestellanfrage%20ShuttleHaus&body=${body}`;
});

renderProducts(); renderCart();
