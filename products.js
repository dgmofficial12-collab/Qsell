// products.js
import { db, auth } from "./firebase.js";
import { collection, getDocs, getDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { demoProducts } from "./demoData.js"; 

export const placeholderImg = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=70";

// 🌍 GLOBAL STATE MANAGEMENT (පිටු මාරු වෙද්දී දත්ත රැකගන්නා ගබඩාව)
window.globalProducts = [];
window.rawDbProducts = [];
window.currentSellerProfile = null; 

let showDemo = true; 
let currentLang = "mix"; 

if(!localStorage.getItem("qsell_favs")) {
    localStorage.setItem("qsell_favs", JSON.stringify([]));
}

// 🚫 TOGGLE DEMO PRODUCTS FUNCTION
window.toggleDemoProducts = function() {
    showDemo = !showDemo;
    const btn = document.getElementById("demoToggleBtn");
    if(showDemo) {
        if(btn) btn.innerText = "✨ Hide Demo Products (සැඟවීම)";
        if(btn) btn.style.background = "#2c3e50";
    } else {
        if(btn) btn.innerText = "👁️ Show Demo Products (පෙන්වීම)";
        if(btn) btn.style.background = "#e67e22";
    }
    processProductsLoad(window.rawDbProducts || []);
}

// 🌐 LANGUAGE TRANSLATION DICTIONARY
const translations = {
    mix: { searchPlace: "🔎 Search Products / 🔍 භාණ්ඩ සොයන්න...", call: "📞 Call", wa: "💬 WhatsApp", save: "❤️ Save", saved: "❤️ Saved", negotiable: "💰 Negotiable", safety: "⚠️ මුදල් ගෙවීමට පෙර භාණ්ඩය පරීක්ෂා කරන්න." },
    si: { searchPlace: "🔎 ඔබට අවශ්‍ය භාණ්ඩය මෙහි සොයන්න...", call: "📞 ඇමතුම්", wa: "💬 වට්ස්ඇප්", save: "❤️ සුරකින්න", saved: "❤️ සුරකින ලදී", negotiable: "💰 මිල සාකච්ඡා කරගත හැක", safety: "⚠️ මුදල් ගෙවීමට පෙර භාණ්ඩය හොඳින් පරීක්ෂා කරන්න." },
    en: { searchPlace: "🔎 Search for items here...", call: "📞 Call Now", wa: "💬 WhatsApp", save: "❤️ Save", saved: "❤️ Saved", negotiable: "💰 Price Negotiable", safety: "⚠️ Check the item carefully before making any payment." }
};

window.toggleLanguage = function() {
    if(currentLang === "mix") currentLang = "si";
    else if(currentLang === "si") currentLang = "en";
    else currentLang = "mix";
    
    const langBtn = document.getElementById("langSwitchBtn");
    if(langBtn) langBtn.innerText = currentLang === "mix" ? "සිංහල / EN" : (currentLang === "si" ? "සිංහල" : "English");
    
    let searchBox = document.getElementById("searchBox");
    if(searchBox) searchBox.placeholder = translations[currentLang].searchPlace;
    
    renderMarketplace();
}

// 📥 LOAD PRODUCTS FROM FIREBASE
export async function loadProducts() {
    try {
        const snap = await getDocs(collection(db, "products"));
        window.rawDbProducts = [];
        snap.forEach((d) => { window.rawDbProducts.push({ id: d.id, ...d.data() }); });
        processProductsLoad(window.rawDbProducts);
    } catch(err) { 
        console.error("Error loading products:", err);
        processProductsLoad([]);
    } finally {
        if(window.hideLoadingScreen) window.hideLoadingScreen();
    }
}

function processProductsLoad(dbItems) {
    let processedDemo = demoProducts.map(p => ({
        ...p, img: p.img || placeholderImg
    }));
    window.globalProducts = showDemo ? [...dbItems, ...processedDemo] : [...dbItems]; 
    renderMarketplace();
}

// 🔍 MARKETPLACE FILTER ENGINE
export function renderMarketplace() {
    let searchBox = document.getElementById("searchBox");
    let query = searchBox ? searchBox.value.toLowerCase().trim() : "";
    let filterProv = document.getElementById("filterProvince") ? document.getElementById("filterProvince").value : "";
    let filterDist = document.getElementById("filterDistrict") ? document.getElementById("filterDistrict").value : "";
    let filterTwn = document.getElementById("filterTown") ? document.getElementById("filterTown").value.toLowerCase().trim() : "";

    let filtered = window.globalProducts.filter(p => {
        return ((p.name || "").toLowerCase().includes(query) || (p.cat || "").toLowerCase().includes(query)) &&
               (filterProv === "" || p.province === filterProv) &&
               (filterDist === "" || p.district === filterDist) &&
               (filterTwn === "" || (p.town || "").toLowerCase().includes(filterTwn));
    });
    renderCards(filtered, "productDisplayHome");
}

// ❤️ FAVOURITES RENDER
export function renderFavourites() {
    let favs = JSON.parse(localStorage.getItem("qsell_favs")) || [];
    let items = window.globalProducts.filter(p => favs.includes(p.id));
    renderCards(items, "productDisplayFav");
}

// 🌟 TOGGLE FAVORITE
window.toggleFavorite = function(id) {
    let favs = JSON.parse(localStorage.getItem("qsell_favs")) || [];
    if(favs.includes(id)) {
        favs = favs.filter(f => f !== id);
    } else {
        favs.push(id);
    }
    localStorage.setItem("qsell_favs", JSON.stringify(favs));
    
    if(window.currentPage === "homePage") renderMarketplace();
    if(window.currentPage === "favPage") renderFavourites();
}

// 🎴 PROFESSIONAL CARD RENDER ENGINE
function renderCards(items, targetContainerId) {
    const display = document.getElementById(targetContainerId); 
    if(!display) return; 
    display.innerHTML = "";
    
    if (items.length === 0) {
        display.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:40px; color:#64748b;"><h3>කිසිදු භාණ්ඩයක් හමුනොවිණි (No items found)</h3></div>`; 
        return;
    }
    
    let favs = JSON.parse(localStorage.getItem("qsell_favs")) || [];
    let langSet = translations[currentLang];

    items.forEach(item => {
        let card = document.createElement("div"); 
        card.className = "card";
        let isFav = favs.includes(item.id);
        let imgOverlay = item.status === "sold" ? `<div class="reserved-overlay sold-tag">🔴 SOLD OUT</div>` : "";

        let finalName = item.name;
        if(currentLang === "en" && item.name.includes("(")) {
            finalName = item.name.split("(")[1]?.replace(")", "") || item.name; 
        } else if(currentLang === "si" && item.name.includes("(")) {
            finalName = item.name.split("(")[0]; 
        }

        card.innerHTML = `
            <div class="card-img-container">
                ${item.neg ? `<span class="featured-badge">${langSet.negotiable}</span>` : ''} ${imgOverlay}
                <img src="${item.img || placeholderImg}" alt="Product" loading="lazy">
            </div>
            <div class="card-content">
                <span class="card-shop">🏪 ${item.shopName || "Unknown Shop"}</span>
                <h3 class="card-title">${finalName}</h3>
                <div class="loc-time">📍 ${item.town || ''}, ${item.district || ''}</div>
                <div class="price">රු. ${parseInt(item.price || 0).toLocaleString()}</div>
                <p class="safety-warning">${langSet.safety}</p>
                <div class="buyer-utility-row">
                    <button class="util-btn ${isFav?'faved':''}" onclick="window.toggleFavorite('${item.id}')">
                        ${isFav ? langSet.saved : langSet.save}
                    </button>
                </div>
                <div class="btn-group">
                    <a class="action-btn call-btn" href="tel:${item.phone}">${langSet.call}</a>
                    <a class="action-btn wa-btn" href="https://wa.me/${item.phone}" target="_blank">${langSet.wa}</a>
                </div>
            </div>
        `;
        display.appendChild(card);
    });
}

// 🏪 SELLER PROFILE LOGIC
export async function fetchSellerProfile(uid) {
    try {
        const docRef = doc(db, "shops", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            window.currentSellerProfile = docSnap.data();
            let shopTitle = document.getElementById("dashShopTitle");
            if(shopTitle) shopTitle.innerText = `🏪 ${window.currentSellerProfile.shopName} Dashboard`;
        }
    } catch(e) { console.error("Error fetching shop profile:", e); }
}