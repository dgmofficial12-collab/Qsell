// auth.js
import { auth } from "./firebase.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { fetchSellerProfile, loadProducts } from "./products.js";

window.currentUser = null;

// 🔐 AUTH MONITOR SYSTEM (පරිශීලකයා ඇතුළු වූ පසු Navbar එක යාවත්කාලීන කිරීම)
onAuthStateChanged(auth, async (user) => {
    let emailTag = document.getElementById("userEmailNav");
    let userStripe = document.getElementById("userStripe");

    if (user) {
        window.currentUser = user;
        if(emailTag) emailTag.innerText = `👤 ${user.email}`;
        if(userStripe) userStripe.style.display = "inline-block";
    } else {
        window.currentUser = null;
        if(userStripe) userStripe.style.display = "none";
    }
});

// 📝 REGISTER LOGIC
window.register = async function() {
    let emailInput = document.getElementById("email");
    let passInput = document.getElementById("password");
    
    let email = emailInput ? emailInput.value.trim() : "";
    let password = passInput ? passInput.value : "";
    
    if(!email || !password) return alert("🚨 කරුණාකර Email සහ Password ඇතුළත් කරන්න!");
    if(password.length < 6) return alert("🚨 මුරපදයට අවම වශයෙන් අකුරු/ඉලක්කම් 6ක් තිබිය යුතුය!");
    
    try {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("ගිණුම සාර්ථකව සෑදුවා! 🎉 දැන්ම ඔබගේ කඩේ විස්තර සකසන්න.");
        if(window.switchPage) window.switchPage('dashboardPage');
    } catch(err) { 
        alert("ලියාපදිංචි වීමේ දෝෂය: " + err.message); 
    }
}

// 🔑 LOGIN LOGIC
window.login = async function() {
    let emailInput = document.getElementById("email");
    let passInput = document.getElementById("password");
    
    let email = emailInput ? emailInput.value.trim() : "";
    let password = passInput ? passInput.value : "";
    
    if(!email || !password) return alert("🚨 කරුණාකර Email සහ Password ඇතුළත් කරන්න!");
    
    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("සාර්ථකව ඇතුළු විය! 🏪");
        if(window.switchPage) window.switchPage('dashboardPage');
    } catch(err) { 
        alert("ඇතුල් වීමේ දෝෂය: " + err.message); 
    }
}

// 🔴 LOGOUT LOGIC
window.logout = async function() {
    if(confirm("ඔබට Dashboard එකෙන් ඉවත් වීමට අවශ්‍යද?")) {
        try {
            await signOut(auth);
            alert("සාර්ථකව ඉවත් විය! 👋");
            
            // Clean inputs
            if(document.getElementById("email")) document.getElementById("email").value = "";
            if(document.getElementById("password")) document.getElementById("password").value = "";
            
            if(window.switchPage) window.switchPage('homePage');
        } catch(err) { 
            alert("ඉවත් වීමේ දෝෂය: " + err.message); 
        }
    }
}