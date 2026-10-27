const ROOMS = [
  { id: 1, name: "Standard Room", type: "Standard", price: 3500, guests: 2, emoji: "🛏️", desc: "Cosy queen bed with city view.", amen: ["Wi-Fi", "AC", "TV"] },
  { id: 2, name: "Standard Twin", type: "Standard", price: 3800, guests: 2, emoji: "🛌", desc: "Two single beds, ideal for friends.", amen: ["Wi-Fi", "AC", "Work desk"] },
  { id: 3, name: "Deluxe Room", type: "Deluxe", price: 5500, guests: 3, emoji: "🌆", desc: "Spacious room with a balcony.", amen: ["Wi-Fi", "Balcony", "Minibar"] },
  { id: 4, name: "Deluxe Sea View", type: "Deluxe", price: 6500, guests: 3, emoji: "🌊", desc: "Floor-to-ceiling windows facing the bay.", amen: ["Sea view", "Bathtub", "Minibar"] },
  { id: 5, name: "Family Suite", type: "Family", price: 7500, guests: 5, emoji: "👨‍👩‍👧‍👦", desc: "Two bedrooms and a living area.", amen: ["2 bedrooms", "Kitchenette", "Sofa bed"] },
  { id: 6, name: "Presidential Suite", type: "Suite", price: 12000, guests: 4, emoji: "👑", desc: "Our top suite with a private terrace.", amen: ["Terrace", "Jacuzzi", "Butler"] },
];
const TAX = 0.12;

const $ = (s) => document.querySelector(s);
const inr = (n) => "₹" + Math.round(n).toLocaleString("en-IN");
const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
const addDays = (str, n) => { const d = new Date(str); d.setDate(d.getDate() + n); return iso(d); };
const nightsBetween = (a, b) => (a && b ? Math.round((new Date(b) - new Date(a)) / 864e5) : 0);

const today = iso(new Date());
const state = { checkin: "", checkout: "", guests: 2, type: "Any" };
let currentRoom = null;

/* ---------- Routing ---------- */
const PAGES = ["home", "rooms", "pricing", "contact"];
function route() {
  const hash = location.hash.slice(1);
  const page = PAGES.includes(hash) ? hash : "home";
  document.querySelectorAll(".page").forEach((p) => p.classList.toggle("active", p.id === page));
  document.querySelectorAll("#menu a").forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + page));
  $("#menu").classList.remove("open");
  window.scrollTo(0, 0);
  if (page === "rooms") renderRooms();
}
window.addEventListener("hashchange", route);
$("#menuBtn").addEventListener("click", () => $("#menu").classList.toggle("open"));

/* ---------- Search form ---------- */
$("#s_in").min = today;
$("#s_out").min = addDays(today, 1);
$("#s_in").addEventListener("change", (e) => {
  $("#s_out").min = addDays(e.target.value, 1);
  if ($("#s_out").value <= e.target.value) $("#s_out").value = "";
});

$("#searchForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const checkin = $("#s_in").value, checkout = $("#s_out").value;
  if (nightsBetween(checkin, checkout) < 1) {
    $("#searchError").textContent = "Check-out must be after check-in.";
    return;
  }
  $("#searchError").textContent = "";
  Object.assign(state, { checkin, checkout, guests: +$("#s_guests").value, type: $("#s_type").value });
  location.hash = "#rooms";
});

/* ---------- Rooms ---------- */
function renderRooms() {
  const list = ROOMS.filter((r) => r.guests >= state.guests && (state.type === "Any" || r.type === state.type));
  const n = nightsBetween(state.checkin, state.checkout);
  $("#roomSummary").textContent = n
    ? `${list.length} room(s) for ${state.guests} guest(s), ${n} night(s): ${state.checkin} to ${state.checkout}`
    : `Showing ${list.length} room(s). Use the search on the Home page to pick dates.`;

  $("#roomGrid").innerHTML = list.length
    ? list.map((r) => `
      <article class="card">
        <div class="pic">${r.emoji}</div>
        <div class="body">
          <h3>${r.name}</h3>
          <p class="muted" style="margin:0">${r.desc} Sleeps ${r.guests}.</p>
          <div class="tags">${r.amen.map((a) => `<span>${a}</span>`).join("")}</div>
          <div class="foot">
            <div class="price">${inr(r.price)} <small>/ night</small></div>
            <button class="btn" data-id="${r.id}">Book</button>
          </div>
        </div>
      </article>`).join("")
    : `<p class="center muted" style="grid-column:1/-1">No rooms match. Try fewer guests or a different type.</p>`;
}
$("#roomGrid").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-id]");
  if (btn) openModal(+btn.dataset.id);
});

/* ---------- Pricing ---------- */
$("#priceBody").innerHTML = ROOMS.map((r) => `
  <tr><td>${r.emoji} ${r.name}</td><td>${r.guests} guests</td>
  <td>${inr(r.price)}</td><td>${inr(r.price * 1.2)}</td></tr>`).join("");

/* ---------- Booking modal ---------- */
function openModal(id) {
  currentRoom = ROOMS.find((r) => r.id === id);
  $("#bk_title").textContent = `Book ${currentRoom.name}`;
  $("#bk_in").min = today;
  $("#bk_in").value = state.checkin || addDays(today, 1);
  $("#bk_out").value = state.checkout || addDays(today, 2);
  $("#bk_guests").max = currentRoom.guests;
  $("#bk_guests").value = Math.min(state.guests, currentRoom.guests);
  $("#bk_error").textContent = "";
  $("#bookForm").hidden = false;
  $("#bookDone").hidden = true;
  $("#modal").hidden = false;
  updateSummary();
}
const closeModal = () => ($("#modal").hidden = true);
$("#closeModal").addEventListener("click", closeModal);
$("#modal").addEventListener("click", (e) => { if (e.target.id === "modal") closeModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

function updateSummary() {
  const n = nightsBetween($("#bk_in").value, $("#bk_out").value);
  const sub = n > 0 ? n * currentRoom.price : 0;
  const tax = sub * TAX;
  $("#bk_summary").innerHTML = n > 0
    ? `<div><span>${inr(currentRoom.price)} × ${n} night(s)</span><span>${inr(sub)}</span></div>
       <div><span>GST (12%)</span><span>${inr(tax)}</span></div>
       <div class="total"><span>Total</span><span>${inr(sub + tax)}</span></div>`
    : `<div>Select valid dates to see the total.</div>`;
  return n;
}
$("#bk_in").addEventListener("change", () => {
  $("#bk_out").min = addDays($("#bk_in").value, 1);
  if ($("#bk_out").value <= $("#bk_in").value) $("#bk_out").value = addDays($("#bk_in").value, 1);
  updateSummary();
});
$("#bk_out").addEventListener("change", updateSummary);

$("#bookForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const n = updateSummary();
  const guests = +$("#bk_guests").value;
  if (n < 1) return ($("#bk_error").textContent = "Check-out must be after check-in.");
  if (guests > currentRoom.guests) return ($("#bk_error").textContent = `This room sleeps up to ${currentRoom.guests} guests.`);

  const total = n * currentRoom.price * (1 + TAX);
  const ref = "AB" + Math.floor(100000 + Math.random() * 900000);
  $("#bookForm").hidden = true;
  $("#bookDone").hidden = false;
  $("#bookDone").innerHTML = `
    <div style="font-size:56px">🎉</div>
    <h2>Booking confirmed!</h2>
    <p>Thank you, ${$("#bk_name").value}. Your reference is <strong>${ref}</strong>.</p>
    <p>${currentRoom.name} · ${n} night(s) · ${inr(total)}<br>A confirmation will be sent to ${$("#bk_email").value}.</p>
    <button class="btn" onclick="closeModal()">Done</button>`;
  $("#bookForm").reset();
});

/* ---------- Contact form ---------- */
$("#contactForm").addEventListener("submit", (e) => {
  e.preventDefault();
  $("#contactDone").textContent = "Thanks! We'll get back to you within 24 hours.";
  e.target.reset();
});

route();