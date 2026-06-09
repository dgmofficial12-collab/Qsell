// app.js
import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { loadProducts, fetchSellerProfile, renderMarketplace, renderFavourites } from "./products.js";

window.currentPage = "homePage";

// 🔄 MODERN NAVIGATION SWITCH (පිටු මාරු කිරීමේ ප්‍රධාන එන්ජිම)
window.switchPage = function(pageId) {
    window.currentPage = pageId;
    
    // 1. සියලුම පිටු තිරයෙන් සඟවන්න
    document.querySelectorAll('.app-page').forEach(page => {
        page.classList.remove('active-page');
    });
    
    // 2. තෝරාගත් පිටුව පමණක් පෙන්වන්න
    const activePage = document.getElementById(pageId);
    if (activePage) {
        activePage.classList.add('active-page');
    }
    
    // 3. Navigation Buttons වල Active තත්ත්වය වෙනස් කරන්න
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    if(pageId === "homePage") document.getElementById("btn-home")?.classList.add("active");
    if(pageId === "favPage") document.getElementById("btn-fav")?.classList.add("active");
    if(pageId === "dashboardPage") document.getElementById("btn-dash")?.classList.add("active");
    
    // 4. 🚀 FIXED LOGIC: පිටුව මාරු වූ සැනින් අදාළ දත්ත නැවුම්ව පෙන්වන්න (දැන් Products මැකෙන්නේ නෑ)
    if (pageId === "homePage") {
        renderMarketplace();
    } else if (pageId === "favPage") {
        renderFavourites();
    }
};

// Loader Screen හංගන ශ්‍රිතය
window.hideLoadingScreen = function() {
    const loader = document.getElementById("appLoader");
    if(loader) loader.style.display = "none";
};

// Firebase Auth එක හරහා පරිශීලකයා නිරීක්ෂණය කිරීම
onAuthStateChanged(auth, (user) => {
    const authSection = document.getElementById("authSection");
    const sellerSection = document.getElementById("sellerSection");
    const sellerAds = document.getElementById("sellerAdsContainer");
    
    if (user) {
        if(authSection) authSection.style.display = "none";
        if(sellerSection) sellerSection.style.display = "grid";
        if(sellerAds) sellerAds.style.display = "block";
        fetchSellerProfile(user.uid);
    } else {
        if(authSection) authSection.style.display = "block";
        if(sellerSection) sellerSection.style.display = "none";
        if(sellerAds) sellerAds.style.display = "none";
    }
    // ඇප් එක Load වෙද්දීම ප්‍රොඩක්ට්ස් ටික ඩේටාබේස් එකෙන් අරන් එන්න
    loadProducts();
});