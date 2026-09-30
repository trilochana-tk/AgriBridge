import { auth, db } from "./firebase-config.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const A = document.getElementById("app");

/* ==================================================
   LANGUAGE SUPPORT (English + Telugu)
   English text is used as the key. If a Telugu
   translation is missing, English is shown.
   ================================================== */

const LANGS = { en: "English", te: "తెలుగు" };

let lang = localStorage.getItem("agribridge_lang");
if (!LANGS[lang]) lang = "en";
document.documentElement.lang = lang;

const TE = {
  // roles
  "Customer": "వినియోగదారు",
  "Farmer": "రైతు",
  "Collection Hub": "సేకరణ కేంద్రం",
  "Delivery Boy": "డెలివరీ బాయ్",

  // order statuses
  "Order Confirmed": "ఆర్డర్ నిర్ధారించబడింది",
  "Collection Scheduled": "సేకరణ షెడ్యూల్ చేయబడింది",
  "Collected from Farmer": "రైతు నుండి సేకరించబడింది",
  "At Collection Hub": "సేకరణ కేంద్రంలో ఉంది",
  "Packed": "ప్యాక్ చేయబడింది",
  "Picked Up by Delivery Boy": "డెలివరీ బాయ్ తీసుకున్నారు",
  "Out for Delivery": "డెలివరీకి బయలుదేరింది",
  "Delivered": "డెలివరీ అయింది",
  "Unknown": "తెలియదు",

  // general
  "Loading...": "లోడ్ అవుతోంది...",
  "Something went wrong.": "ఏదో తప్పు జరిగింది.",
  "This phone number already has an account.": "ఈ ఫోన్ నంబర్‌కు ఇప్పటికే ఖాతా ఉంది.",
  "Invalid phone number or password.": "ఫోన్ నంబర్ లేదా పాస్‌వర్డ్ తప్పు.",
  "Password must contain at least 6 characters.": "పాస్‌వర్డ్‌లో కనీసం 6 అక్షరాలు ఉండాలి.",
  "Internet connection problem.": "ఇంటర్నెట్ కనెక్షన్ సమస్య.",
  "Firebase permission denied. Check Firestore Rules.": "Firebase అనుమతి నిరాకరించబడింది. Firestore నియమాలను తనిఖీ చేయండి.",
  "Enter a valid phone number.": "సరైన ఫోన్ నంబర్ నమోదు చేయండి.",

  // welcome + roles
  "Connecting Farmers Directly with Customers": "రైతులను నేరుగా వినియోగదారులతో అనుసంధానం చేస్తోంది",
  "Fresh vegetables from different farmers are collected, packed and delivered through AgriBridge.": "వివిధ రైతుల నుండి తాజా కూరగాయలను సేకరించి, ప్యాక్ చేసి, అగ్రిబ్రిడ్జ్ ద్వారా డెలివరీ చేస్తారు.",
  "Language": "భాష",
  "Continue": "కొనసాగించండి",
  "← Back": "← వెనుకకు",
  "Who are you?": "మీరు ఎవరు?",
  "Choose your account": "మీ ఖాతా రకాన్ని ఎంచుకోండి",
  "Continue as {role}": "{role} గా కొనసాగండి",

  // auth
  "{role} Login": "{role} లాగిన్",
  "{role} Create Account": "{role} ఖాతా సృష్టించండి",
  "Login": "లాగిన్",
  "Create Account": "ఖాతా సృష్టించండి",
  "Name": "పేరు",
  "Phone number": "ఫోన్ నంబర్",
  "Password": "పాస్‌వర్డ్",
  "Already have an account? Login": "ఇప్పటికే ఖాతా ఉందా? లాగిన్ అవ్వండి",
  "Create new account": "కొత్త ఖాతా సృష్టించండి",
  "Enter your name.": "మీ పేరు నమోదు చేయండి.",
  "Creating your account...": "మీ ఖాతాను సృష్టిస్తున్నాము...",
  "Signing you in...": "సైన్ ఇన్ అవుతోంది...",
  "User profile not found.": "వినియోగదారు ప్రొఫైల్ కనుగొనబడలేదు.",
  "This account is registered as {role}": "ఈ ఖాతా {role} గా నమోదు చేయబడింది",
  "Logout": "లాగౌట్",

  // tabs
  "Dashboard": "డాష్‌బోర్డ్",
  "Buy Produce": "ఉత్పత్తులు కొనండి",
  "Cart": "కార్ట్",
  "My Orders": "నా ఆర్డర్లు",
  "Profile": "ప్రొఫైల్",
  "Products": "ఉత్పత్తులు",
  "Orders": "ఆర్డర్లు",
  "Orders Received": "వచ్చిన ఆర్డర్లు",
  "Packing": "ప్యాకింగ్",
  "Collection Slots": "సేకరణ సమయాలు",
  "Available Orders": "అందుబాటులో ఉన్న ఆర్డర్లు",
  "Accepted Orders": "అంగీకరించిన ఆర్డర్లు",
  "Welcome to {role}": "{role} విభాగానికి స్వాగతం",
  "Farm → Collection Hub → Customer": "పొలం → సేకరణ కేంద్రం → వినియోగదారు",

  // home
  "My products": "నా ఉత్పత్తులు",
  "Active orders": "క్రియాశీల ఆర్డర్లు",
  "Delivery rule": "డెలివరీ నియమం",
  "Before 7 PM → Same day": "సాయంత్రం 7 లోపు → అదే రోజు",
  "After 7 PM → Next day": "సాయంత్రం 7 తర్వాత → మరుసటి రోజు",
  "Core innovation": "ప్రధాన ఆవిష్కరణ",
  "Orders from the same farmer are consolidated. If a farmer has 40 kg and confirmed orders require 20 kg, the hub collects only 20 kg.": "ఒకే రైతు నుండి వచ్చే ఆర్డర్లు కలిపి సేకరిస్తారు. రైతు వద్ద 40 కిలోలు ఉండి, నిర్ధారిత ఆర్డర్లకు 20 కిలోలు అవసరమైతే, కేంద్రం కేవలం 20 కిలోలే సేకరిస్తుంది.",

  // shop + cart
  "Fresh products directly from farmers.": "రైతుల నుండి నేరుగా తాజా ఉత్పత్తులు.",
  "Unable to load products.": "ఉత్పత్తులను లోడ్ చేయలేకపోయాం.",
  "Cart ({n})": "కార్ట్ ({n})",
  "{n} kg available": "{n} కిలోలు అందుబాటులో ఉన్నాయి",
  "{price}/kg": "{price}/కిలో",
  "Add to Cart": "కార్ట్‌లో చేర్చండి",
  "No products available": "ఉత్పత్తులు అందుబాటులో లేవు",
  "Farmers can add products from their dashboard.": "రైతులు తమ డాష్‌బోర్డ్ నుండి ఉత్పత్తులను చేర్చవచ్చు.",
  "Product not found.": "ఉత్పత్తి కనుగొనబడలేదు.",
  "Not enough stock available.": "తగినంత నిల్వ అందుబాటులో లేదు.",
  "Your cart is empty": "మీ కార్ట్ ఖాళీగా ఉంది",
  "Your cart is empty.": "మీ కార్ట్ ఖాళీగా ఉంది.",
  "← Back to Customer Dashboard": "← వినియోగదారు డాష్‌బోర్డ్‌కు వెనుకకు",
  "Order Summary": "ఆర్డర్ సారాంశం",
  "Product total": "ఉత్పత్తుల మొత్తం",
  "Packing charge": "ప్యాకింగ్ ఛార్జీ",
  "Delivery charge": "డెలివరీ ఛార్జీ",
  "Express surcharge is added at checkout.": "ఎక్స్‌ప్రెస్ అదనపు ఛార్జీ చెక్అవుట్‌లో కలుపబడుతుంది.",
  "Total": "మొత్తం",
  "Review & Place Your Order": "సమీక్షించి ఆర్డర్ చేయండి",

  // checkout
  "← Back to Cart": "← కార్ట్‌కు వెనుకకు",
  "Delivery address": "డెలివరీ చిరునామా",
  "Delivery timing": "డెలివరీ సమయం",
  "Orders before 7 PM → same-day delivery.": "సాయంత్రం 7 లోపు ఆర్డర్లు → అదే రోజు డెలివరీ.",
  "Orders after 7 PM → next-day delivery.": "సాయంత్రం 7 తర్వాత ఆర్డర్లు → మరుసటి రోజు డెలివరీ.",
  "Delivery type": "డెలివరీ రకం",
  "Normal Delivery — ₹5": "సాధారణ డెలివరీ — ₹5",
  "Express Delivery — +₹20": "ఎక్స్‌ప్రెస్ డెలివరీ — +₹20",
  "Normal Delivery": "సాధారణ డెలివరీ",
  "Express Delivery": "ఎక్స్‌ప్రెస్ డెలివరీ",
  "Complete Payment & Place Order": "చెల్లింపు పూర్తి చేసి ఆర్డర్ చేయండి",
  "Checkout form is not loaded. Please go back to Cart and open Checkout again.": "చెక్అవుట్ ఫారం లోడ్ కాలేదు. దయచేసి కార్ట్‌కు వెళ్లి మళ్లీ చెక్అవుట్ తెరవండి.",
  "Enter delivery address.": "డెలివరీ చిరునామా నమోదు చేయండి.",
  "Processing order...": "ఆర్డర్ ప్రాసెస్ అవుతోంది...",
  "{name} does not have enough stock.": "{name} కు తగినంత నిల్వ లేదు.",
  "Farmer information missing.": "రైతు సమాచారం లేదు.",
  "Payment Successful": "చెల్లింపు విజయవంతమైంది",
  "Order Confirmed Successfully": "ఆర్డర్ విజయవంతంగా నిర్ధారించబడింది",
  "Order ID:": "ఆర్డర్ ID:",
  "Total:": "మొత్తం:",
  "Track Your Order": "మీ ఆర్డర్‌ను ట్రాక్ చేయండి",

  // customer orders
  "No orders yet.": "ఇంకా ఆర్డర్లు లేవు.",
  "Payment:": "చెల్లింపు:",
  "Paid": "చెల్లించబడింది",
  "{q} kg": "{q} కిలోలు",

  // farmer
  "My Products": "నా ఉత్పత్తులు",
  "+ Add Product": "+ ఉత్పత్తి చేర్చండి",
  "Stock: {n} kg": "నిల్వ: {n} కిలోలు",
  "Delete": "తొలగించండి",
  "No products yet": "ఇంకా ఉత్పత్తులు లేవు",
  "Click Add Product to list your produce.": "మీ ఉత్పత్తులను జాబితా చేయడానికి 'ఉత్పత్తి చేర్చండి' నొక్కండి.",
  "Product name": "ఉత్పత్తి పేరు",
  "Quantity in kg": "కిలోలలో పరిమాణం",
  "Price per kg": "కిలోకు ధర",
  "Enter valid quantity and price.": "సరైన పరిమాణం మరియు ధర నమోదు చేయండి.",
  "Adding product...": "ఉత్పత్తి చేరుస్తున్నాము...",
  "Product added successfully.": "ఉత్పత్తి విజయవంతంగా చేర్చబడింది.",
  "Delete this product?": "ఈ ఉత్పత్తిని తొలగించాలా?",
  "Product deleted.": "ఉత్పత్తి తొలగించబడింది.",
  "Farmer Orders": "రైతు ఆర్డర్లు",
  "Customer:": "వినియోగదారు:",
  "Phone:": "ఫోన్:",
  "required {q} kg": "అవసరం {q} కిలోలు",
  "No orders.": "ఆర్డర్లు లేవు.",

  // hub
  "Farmer:": "రైతు:",
  "Order:": "ఆర్డర్:",
  "Total required quantity: {n} kg": "మొత్తం అవసరమైన పరిమాణం: {n} కిలోలు",
  "Mark Collection Scheduled": "సేకరణ షెడ్యూల్ చేసినట్లు గుర్తించండి",
  "No confirmed orders.": "నిర్ధారిత ఆర్డర్లు లేవు.",
  "Hub access requires the corresponding Firestore Rules.": "కేంద్రం యాక్సెస్‌కు సంబంధిత Firestore నియమాలు అవసరం.",
  "Packing & Tracking": "ప్యాకింగ్ & ట్రాకింగ్",
  "Advance Status": "తదుపరి దశకు మార్చండి",
  "Firebase permission required": "Firebase అనుమతి అవసరం",
  "Hub order access will be enabled when the Firestore Rules are updated.": "Firestore నియమాలు నవీకరించిన తర్వాత కేంద్రం ఆర్డర్ యాక్సెస్ ప్రారంభమవుతుంది.",
  "This order is not ready for the next hub step.": "ఈ ఆర్డర్ తదుపరి కేంద్ర దశకు సిద్ధంగా లేదు.",
  "11:00 AM": "ఉదయం 11:00",
  "Morning farmer collection": "ఉదయం రైతుల నుండి సేకరణ",
  "6:00 PM": "సాయంత్రం 6:00",
  "Evening farmer collection": "సాయంత్రం రైతుల నుండి సేకరణ",

  // delivery
  "Accept Order": "ఆర్డర్ అంగీకరించండి",
  "Start Delivery": "డెలివరీ ప్రారంభించండి",
  "Mark Delivered": "డెలివరీ అయినట్లు గుర్తించండి",
  "Delivery Completed": "డెలివరీ పూర్తయింది",
  "Waiting for packing / pickup": "ప్యాకింగ్ / పికప్ కోసం వేచి ఉంది",
  "Address:": "చిరునామా:",
  "Items:": "వస్తువులు:",
  "Delivery type:": "డెలివరీ రకం:",
  "No orders": "ఆర్డర్లు లేవు",
  "You have not accepted any orders yet.": "మీరు ఇంకా ఏ ఆర్డర్‌ను అంగీకరించలేదు.",
  "No packed orders are available right now.": "ప్రస్తుతం ప్యాక్ చేసిన ఆర్డర్లు అందుబాటులో లేవు.",
  "Delivery access error": "డెలివరీ యాక్సెస్ లోపం",
  "Order not found.": "ఆర్డర్ కనుగొనబడలేదు.",
  "This order is assigned to another delivery boy.": "ఈ ఆర్డర్ మరొక డెలివరీ బాయ్‌కు కేటాయించబడింది.",

  // profile
  "{role} Profile": "{role} ప్రొఫైల్",
  "Name:": "పేరు:",
  "Role:": "పాత్ర:",
  "Account created with Firebase Authentication.": "ఖాతా Firebase Authentication తో సృష్టించబడింది."
};

// t("English text", {vars}) -> text in the selected language
function t(text, vars) {
  let s = (lang === "te" && TE[text]) || text;
  if (vars) {
    for (const k of Object.keys(vars)) {
      s = s.replaceAll("{" + k + "}", () => String(vars[k]));
    }
  }
  return s;
}

// h(...) = translated AND safe to put inside innerHTML
function h(text, vars) {
  return escapeHTML(t(text, vars));
}

function langOptions() {
  return Object.entries(LANGS)
    .map(([code, label]) =>
      `<option value="${code}" ${code === lang ? "selected" : ""}>${label}</option>`
    )
    .join("");
}

// The screen currently shown, so it can be redrawn when the language changes
let rerender = () => welcome();

function setLang(code) {
  if (!LANGS[code]) return;
  lang = code;
  localStorage.setItem("agribridge_lang", code);
  document.documentElement.lang = code;
  rerender();
}

/* ================================================== */

const R = {
  customer: ["🛒", "Customer"],
  farmer: ["👨‍🌾", "Farmer"],
  hub: ["🏪", "Collection Hub"],
  delivery: ["🚚", "Delivery Boy"]
};

const ST = [
  "Order Confirmed",
  "Collection Scheduled",
  "Collected from Farmer",
  "At Collection Hub",
  "Packed",
  "Picked Up by Delivery Boy",
  "Out for Delivery",
  "Delivered"
];

let currentUser = null;
let currentProfile = null;

function roleName(key) {
  return t(R[key]?.[1] || key);
}

function statusText(s) {
  return t(s === "Placed" ? "Order Confirmed" : (s || "Unknown"));
}

function totalKg(order) {
  return (order.items || []).reduce((sum, i) => sum + Number(i.q || 0), 0);
}

function money(x) {
  return "₹" + Number(x || 0).toFixed(2);
}

function phoneEmail(phone) {
  const clean = String(phone).replace(/\D/g, "");
  if (!clean) throw new Error(t("Enter a valid phone number."));
  return clean + "@agribridge.app";
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getCart() {
  try {
    return JSON.parse(localStorage.getItem("agribridge_cart") || "[]");
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem("agribridge_cart", JSON.stringify(cart));
}

function clearCart() {
  localStorage.removeItem("agribridge_cart");
}

function loading(message = "Loading...") {
  A.innerHTML = `
    <main class="hero">
      <div class="wrap">
        <div class="card" style="text-align:center">
          <div class="logo">🌱</div>
          <h2>${h(message)}</h2>
        </div>
      </div>
    </main>`;
}

function showError(error) {
  console.error(error);

  let msg = t("Something went wrong.");

  if (error?.code === "auth/email-already-in-use") {
    msg = t("This phone number already has an account.");
  } else if (
    error?.code === "auth/invalid-credential" ||
    error?.code === "auth/wrong-password" ||
    error?.code === "auth/user-not-found"
  ) {
    msg = t("Invalid phone number or password.");
  } else if (error?.code === "auth/weak-password") {
    msg = t("Password must contain at least 6 characters.");
  } else if (error?.code === "auth/network-request-failed") {
    msg = t("Internet connection problem.");
  } else if (
    error?.code === "permission-denied" ||
    error?.code === "firestore/permission-denied"
  ) {
    msg = t("Firebase permission denied. Check Firestore Rules.");
  } else if (error?.message) {
    msg = error.message;
  }

  alert(msg);
}

async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

function welcome() {
  rerender = welcome;

  A.innerHTML = `
    <main class="hero">
      <div class="wrap">
        <div class="card">
          <div class="logo">🌱</div>
          <h1>AgriBridge</h1>
          <p class="subtitle">
            <b>${h("Connecting Farmers Directly with Customers")}</b><br>
            ${h("Fresh vegetables from different farmers are collected, packed and delivered through AgriBridge.")}
          </p>

          <div class="field">
            <label>${h("Language")}</label>
            <select id="lang" onchange="window.setLang(this.value)">
              ${langOptions()}
            </select>
          </div>

          <button class="btn primary block" id="cont">
            ${h("Continue")}
          </button>
        </div>
      </div>
    </main>`;

  document.getElementById("cont").onclick = roles;
}

function roles() {
  rerender = roles;

  A.innerHTML = `
    <main class="hero">
      <div class="wrap">
        <div class="card">
          <button class="btn outline" onclick="window.welcome()">
            ${h("← Back")}
          </button>

          <h2>${h("Who are you?")}</h2>
          <p class="subtitle">${h("Choose your account")}</p>

          <div class="grid g2">
            ${Object.entries(R).map(([key, value]) => `
              <button class="card" onclick="window.authScreen('${key}')">
                <div class="logo">${value[0]}</div>
                <h3>${h(value[1])}</h3>
                <span class="muted">
                  ${h("Continue as {role}", { role: roleName(key) })}
                </span>
              </button>
            `).join("")}
          </div>
        </div>
      </div>
    </main>`;
}

function authScreen(role, signup = false) {
  rerender = () => authScreen(role, signup);

  const r = R[role];

  A.innerHTML = `
    <main class="hero">
      <div class="wrap">
        <div class="card">
          <button class="btn outline" onclick="window.roles()">
            ${h("← Back")}
          </button>

          <div class="logo">${r[0]}</div>

          <h2>
            ${h(signup ? "{role} Create Account" : "{role} Login", { role: roleName(role) })}
          </h2>

          <form id="f">
            ${signup ? `
              <div class="field">
                <label>${h("Name")}</label>
                <input id="name" required>
              </div>
            ` : ""}

            <div class="field">
              <label>${h("Phone number")}</label>
              <input id="phone" placeholder="+91 9876543210" required>
            </div>

            <div class="field">
              <label>${h("Password")}</label>
              <input id="pass" type="password" minlength="6" required>
            </div>

            <button class="btn primary block">
              ${h(signup ? "Create Account" : "Login")}
            </button>
          </form>

          <button
            class="btn secondary block"
            style="margin-top:10px"
            onclick="window.authScreen('${role}', ${!signup})">
            ${h(signup ? "Already have an account? Login" : "Create new account")}
          </button>
        </div>
      </div>
    </main>`;

  document.getElementById("f").onsubmit = async (e) => {
    e.preventDefault();

    const phone = document.getElementById("phone").value.trim();
    const password = document.getElementById("pass").value;

    try {
      if (signup) {
        const name = document.getElementById("name").value.trim();

        if (!name) {
          alert(t("Enter your name."));
          return;
        }

        loading("Creating your account...");

        const email = phoneEmail(phone);

        const result = await createUserWithEmailAndPassword(auth, email, password);
        const uid = result.user.uid;

        await setDoc(doc(db, "users", uid), {
          uid,
          name,
          phone,
          role,
          email,
          createdAt: new Date().toISOString()
        });

        currentUser = result.user;
        currentProfile = { id: uid, uid, name, phone, role, email };

        await dash(role);
      } else {
        loading("Signing you in...");

        const email = phoneEmail(phone);

        const result = await signInWithEmailAndPassword(auth, email, password);
        const profile = await getUserProfile(result.user.uid);

        if (!profile) {
          await signOut(auth);
          alert(t("User profile not found."));
          welcome();
          return;
        }

        if (profile.role !== role) {
          await signOut(auth);
          alert(t("This account is registered as {role}", { role: roleName(profile.role) }));
          authScreen(profile.role);
          return;
        }

        currentUser = result.user;
        currentProfile = profile;

        await dash(profile.role);
      }
    } catch (error) {
      showError(error);
      authScreen(role, signup);
    }
  };
}

async function logout() {
  try {
    await signOut(auth);

    currentUser = null;
    currentProfile = null;

    clearCart();
    welcome();
  } catch (error) {
    showError(error);
  }
}

function head() {
  if (!currentProfile) return "";

  return `
    <div class="top">
      <div class="nav">
        <b class="brand">🌱 AgriBridge</b>

        <span>
          ${escapeHTML(currentProfile.name)}
          ·
          ${h(R[currentProfile.role][1])}

          <select
            aria-label="${h("Language")}"
            onchange="window.setLang(this.value)">
            ${langOptions()}
          </select>

          <button class="btn outline" onclick="window.logout()">
            ${h("Logout")}
          </button>
        </span>
      </div>
    </div>`;
}

async function dash(role, sec = "home") {
  if (!currentUser || !currentProfile) {
    authScreen(role);
    return;
  }

  if (currentProfile.role !== role) {
    authScreen(currentProfile.role);
    return;
  }

  rerender = () => dash(role, sec);

  try {
    let c = "";

    if (sec === "home") c = await home(role);
    if (sec === "shop") c = await shop();

    if (sec === "cart") {
      await renderCart();
      return;
    }

    if (sec === "orders") c = await orders();
    if (sec === "products") c = await products();
    if (sec === "forders") c = await forders();
    if (sec === "horders") c = await horders();
    if (sec === "packing") c = await packing();
    if (sec === "slots") c = slots();
    if (sec === "available") c = await delivery(false);
    if (sec === "accepted") c = await delivery(true);
    if (sec === "profile") c = profile();

    const tabs = {
      customer: [
        ["home", "Dashboard"],
        ["shop", "Buy Produce"],
        ["cart", "Cart"],
        ["orders", "My Orders"],
        ["profile", "Profile"]
      ],
      farmer: [
        ["home", "Dashboard"],
        ["products", "Products"],
        ["forders", "Orders"],
        ["profile", "Profile"]
      ],
      hub: [
        ["home", "Dashboard"],
        ["horders", "Orders Received"],
        ["packing", "Packing"],
        ["slots", "Collection Slots"],
        ["profile", "Profile"]
      ],
      delivery: [
        ["home", "Dashboard"],
        ["available", "Available Orders"],
        ["accepted", "Accepted Orders"],
        ["profile", "Profile"]
      ]
    }[role];

    A.innerHTML = head() + `
      <main class="dash">
        <div class="wrap">

          <div class="banner">
            <h2>${h("Welcome to {role}", { role: roleName(role) })}</h2>
            <span>${h("Farm → Collection Hub → Customer")}</span>
          </div>

          <div class="tabs">
            ${tabs.map(tab => `
              <button
                class="btn ${sec === tab[0] ? "primary" : "outline"}"
                onclick="window.dash('${role}','${tab[0]}')">
                ${h(tab[1])}
              </button>
            `).join("")}
          </div>

          ${c}
        </div>
      </main>`;
  } catch (error) {
    showError(error);
  }
}

async function home(role) {
  let list = [];
  let productCount = 0;

  // Use filtered queries so Firestore rules that only allow
  // "your own orders" do not cause the dashboard to show 0.
  try {
    let q = collection(db, "orders");

    if (role === "customer") {
      q = query(q, where("customerId", "==", currentUser.uid));
    } else if (role === "farmer") {
      q = query(q, where("farmerId", "==", currentUser.uid));
    } else if (role === "delivery") {
      q = query(q, where("deliveryBoyId", "==", currentUser.uid));
    }

    const snap = await getDocs(q);
    list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error("FIREBASE ORDERS ERROR:", error);
  }

  if (role === "farmer") {
    try {
      const snap = await getDocs(
        query(collection(db, "products"), where("ownerId", "==", currentUser.uid))
      );
      productCount = snap.size;
    } catch (error) {
      console.error("FIREBASE PRODUCTS ERROR:", error);
    }
  }

  const secondCard =
    role === "farmer"
      ? `<span class="muted">${h("My products")}</span><h2>${productCount}</h2>`
      : `<span class="muted">${h("Active orders")}</span>
         <h2>${list.filter(o => o.status !== "Delivered").length}</h2>`;

  return `
    <div class="grid g3">

      <div class="card">
        <span class="muted">${h("Orders")}</span>
        <h2>${list.length}</h2>
      </div>

      <div class="card">
        ${secondCard}
      </div>

      <div class="card">
        <span class="muted">${h("Delivery rule")}</span>
        <h3>${h("Before 7 PM → Same day")}</h3>
        <span class="muted">${h("After 7 PM → Next day")}</span>
      </div>

    </div>

    <div class="card" style="margin-top:16px">
      <h3>${h("Core innovation")}</h3>
      <p class="muted">
        ${h("Orders from the same farmer are consolidated. If a farmer has 40 kg and confirmed orders require 20 kg, the hub collects only 20 kg.")}
      </p>
    </div>`;
}

async function getProducts() {
  const snap = await getDocs(collection(db, "products"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function shop() {
  let productsList = [];

  try {
    productsList = await getProducts();
  } catch (error) {
    console.error(error);
    return `<div class="card">${h("Unable to load products.")}</div>`;
  }

  const cartCount = getCart().reduce((a, x) => a + Number(x.q), 0);

  return `
    <div class="row">

      <div>
        <h2>${h("Buy Produce")}</h2>
        <span class="muted">${h("Fresh products directly from farmers.")}</span>
      </div>

      <button class="btn secondary" onclick="window.dash('customer','cart')">
        ${h("Cart ({n})", { n: cartCount })}
      </button>

    </div>

    <div class="grid g3" style="margin-top:16px">

      ${
        productsList.length
          ? productsList.map(p => `
              <div class="card product">

                ${p.img ? `<img src="${escapeHTML(p.img)}">` : ""}

                <h3>${escapeHTML(p.name)}</h3>

                <span class="muted">
                  ${escapeHTML(p.farmerName || p.farmer || t("Farmer"))}
                  ·
                  ${h("{n} kg available", { n: Number(p.stock || 0) })}
                </span>

                <div class="row" style="margin:10px 0">
                  <b class="price">
                    ${h("{price}/kg", { price: money(p.price) })}
                  </b>
                </div>

                <button
                  class="btn primary block"
                  onclick="window.add('${p.id}')">
                  ${h("Add to Cart")}
                </button>

              </div>
            `).join("")
          : `
              <div class="card empty">
                <h3>${h("No products available")}</h3>
                <p class="muted">
                  ${h("Farmers can add products from their dashboard.")}
                </p>
              </div>
            `
      }

    </div>`;
}

async function add(id) {
  const products = await getProducts();
  const product = products.find(p => p.id === id);

  if (!product) {
    alert(t("Product not found."));
    return;
  }

  const cart = getCart();
  const item = cart.find(x => x.id === id);

  if (item) {
    if (Number(item.q) + 1 > Number(product.stock)) {
      alert(t("Not enough stock available."));
      return;
    }
    item.q++;
  } else {
    cart.push({ id, q: 1 });
  }

  saveCart(cart);

  await dash("customer", "shop");
}

async function renderCart() {
  const cart = getCart();

  if (!cart.length) {
    A.innerHTML = head() + `
      <main class="dash">
        <div class="wrap">
          <div class="card empty">
            <h2>${h("Your cart is empty")}</h2>
            <button class="btn primary" onclick="window.dash('customer','shop')">
              ${h("Buy Produce")}
            </button>
          </div>
        </div>
      </main>`;
    return;
  }

  const productsList = await getProducts();

  let total = 0;

  const rows = cart.map(item => {
    const p = productsList.find(x => x.id === item.id);
    if (!p) return "";

    const subtotal = Number(p.price) * Number(item.q);
    total += subtotal;

    return `
      <div class="row" style="padding:12px 0;border-bottom:1px solid #ddd">
        <b>${escapeHTML(p.name)}</b>
        <span>${h("{q} kg", { q: item.q })}</span>
        <b>${money(subtotal)}</b>
      </div>`;
  }).join("");

  A.innerHTML = head() + `
    <main class="dash">
      <div class="wrap">

        <div class="back">
          <button class="btn outline" onclick="window.dash('customer')">
            ${h("← Back to Customer Dashboard")}
          </button>
        </div>

        <div class="grid g2">

          <div class="card">
            <h2>${h("Cart")}</h2>
            ${rows}
          </div>

          <div class="card">

            <h2>${h("Order Summary")}</h2>

            <p>
              ${h("Product total")}
              <b style="float:right">${money(total)}</b>
            </p>

            <p>
              ${h("Packing charge")}
              <b style="float:right">₹5.00</b>
            </p>

            <p>
              ${h("Delivery charge")}
              <b style="float:right">₹5.00</b>
              <br>
              <span class="muted" style="font-size:12px">
                ${h("Express surcharge is added at checkout.")}
              </span>
            </p>

            <hr>

            <h3>
              ${h("Total")}
              <span style="float:right" class="price">
                ${money(total + 10)}
              </span>
            </h3>

            <button class="btn primary block" onclick="window.checkout()">
              ${h("Review & Place Your Order")}
            </button>

          </div>

        </div>
      </div>
    </main>`;
}

function checkout() {
  rerender = checkout;

  A.innerHTML = head() + `
    <main class="hero">
      <div class="wrap">
        <div class="card">

          <button class="btn outline" onclick="window.dash('customer','cart')">
            ${h("← Back to Cart")}
          </button>

          <h2>${h("Review & Place Your Order")}</h2>

          <div class="field">
            <label>${h("Name")}</label>
            <input id="cn" value="${escapeHTML(currentProfile.name)}" required>
          </div>

          <div class="field">
            <label>${h("Phone number")}</label>
            <input id="cp" value="${escapeHTML(currentProfile.phone)}" required>
          </div>

          <div class="field">
            <label>${h("Delivery address")}</label>
            <textarea id="ca" rows="3" required></textarea>
          </div>

          <div class="notice" style="margin:12px 0">
            <b>${h("Delivery timing")}</b>
            <p class="muted" style="margin:6px 0 0">
              ${h("Orders before 7 PM → same-day delivery.")}<br>
              ${h("Orders after 7 PM → next-day delivery.")}
            </p>
          </div>

          <div class="field">
            <label>${h("Delivery type")}</label>
            <select id="dt">
              <option value="normal">${h("Normal Delivery — ₹5")}</option>
              <option value="express">${h("Express Delivery — +₹20")}</option>
            </select>
          </div>

          <button class="btn primary block" onclick="window.place()">
            ${h("Complete Payment & Place Order")}
          </button>

        </div>
      </div>
    </main>`;
}

async function place() {
  const addressEl = document.getElementById("ca");
  const typeEl = document.getElementById("dt");

  if (!addressEl || !typeEl) {
    alert(t("Checkout form is not loaded. Please go back to Cart and open Checkout again."));
    return;
  }

  const address = addressEl.value.trim();

  if (!address) {
    alert(t("Enter delivery address."));
    return;
  }

  const cart = getCart();

  if (!cart.length) {
    alert(t("Your cart is empty."));
    return;
  }

  try {
    loading("Processing order...");

    const productsList = await getProducts();
    const grouped = {};

    for (const item of cart) {
      const product = productsList.find(p => p.id === item.id);

      if (!product) throw new Error(t("Product not found."));

      if (Number(item.q) > Number(product.stock)) {
        throw new Error(t("{name} does not have enough stock.", { name: product.name }));
      }

      const farmerId = product.ownerId || product.farmerId;

      if (!farmerId) throw new Error(t("Farmer information missing."));

      if (!grouped[farmerId]) grouped[farmerId] = [];

      grouped[farmerId].push({
        productId: product.id,
        name: product.name,
        q: Number(item.q),
        price: Number(product.price),
        farmerId,
        farmerName: product.farmerName || product.farmer || "Farmer"
      });
    }

    const type = typeEl.value;
    const express = type === "express" ? 20 : 0;
    const created = [];

    for (const farmerId of Object.keys(grouped)) {
      const items = grouped[farmerId];

      const productTotal = items.reduce((sum, i) => sum + i.price * i.q, 0);

      const order = {
        customerId: currentUser.uid,
        customer: currentProfile.name,
        phone: currentProfile.phone,
        address,
        farmerId,
        items,
        type,
        packingCharge: 5,
        deliveryCharge: 5,
        expressCharge: express,
        total: productTotal + 10 + express,
        status: "Placed",
        paymentStatus: "Paid",
        createdAt: new Date().toISOString()
      };

      const ref = await addDoc(collection(db, "orders"), order);

      created.push({ id: ref.id, ...order });
    }

    clearCart();

    const total = created.reduce((sum, o) => sum + Number(o.total), 0);

    rerender = () => dash("customer", "orders");

    A.innerHTML = head() + `
      <main class="hero">
        <div class="wrap">
          <div class="card">

            <div class="logo">✅</div>

            <h2>${h("Payment Successful")}</h2>

            <p>${h("Order Confirmed Successfully")}</p>

            <div class="card">
              ${h("Order ID:")}
              <b>${escapeHTML(created[0].id)}</b>
              <br><br>
              ${h("Total:")}
              <b>${money(total)}</b>
            </div>

            <br>

            <button class="btn primary" onclick="window.dash('customer','orders')">
              ${h("Track Your Order")}
            </button>

          </div>
        </div>
      </main>`;
  } catch (error) {
    showError(error);
    await dash("customer", "cart");
  }
}

async function orders() {
  let list = [];

  try {
    const q = query(
      collection(db, "orders"),
      where("customerId", "==", currentUser.uid)
    );

    const snap = await getDocs(q);
    list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    showError(error);
  }

  return `
    <div class="back">
      <button class="btn outline" onclick="window.dash('customer')">
        ${h("← Back to Customer Dashboard")}
      </button>
    </div>

    <h2>${h("My Orders")}</h2>

    ${
      list.length
        ? list.map(orderCard).join("")
        : `<div class="card empty">${h("No orders yet.")}</div>`
    }`;
}

function orderCard(o) {
  let index = ST.indexOf(o.status === "Placed" ? "Order Confirmed" : o.status);
  if (index < 0) index = 0;

  return `
    <div class="card" style="margin:14px 0">

      <div class="row">
        <b>${escapeHTML(o.id)}</b>
        <span class="badge green">${escapeHTML(statusText(o.status))}</span>
      </div>

      <p>
        ${(o.items || [])
          .map(item => `${escapeHTML(item.name)} — ${h("{q} kg", { q: item.q })}`)
          .join("<br>")}
      </p>

      <p class="muted">
        ${h("Payment:")}
        <b>${h(o.paymentStatus || "Paid")}</b>
        · ${h(o.type === "express" ? "Express Delivery" : "Normal Delivery")}
      </p>

      <div class="timeline">
        ${ST.map((status, n) => `
          <div class="step ${n < index ? "done" : n === index ? "active" : ""}">
            <span class="dot"></span>
            <span>${h(status)}</span>
          </div>
        `).join("")}
      </div>

    </div>`;
}

async function products() {
  let list = [];

  try {
    const q = query(
      collection(db, "products"),
      where("ownerId", "==", currentUser.uid)
    );

    const snap = await getDocs(q);
    list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    showError(error);
  }

  return `
    <div class="row">

      <h2>${h("My Products")}</h2>

      <button class="btn primary" onclick="window.addProduct()">
        ${h("+ Add Product")}
      </button>

    </div>

    <div class="grid g3">

      ${
        list.length
          ? list.map(p => `
              <div class="card">

                ${
                  p.img
                    ? `<img src="${escapeHTML(p.img)}" style="width:100%;border-radius:12px;">`
                    : ""
                }

                <h3>${escapeHTML(p.name)}</h3>

                <b class="price">${h("{price}/kg", { price: money(p.price) })}</b>

                <p>${h("Stock: {n} kg", { n: Number(p.stock || 0) })}</p>

                <button
                  class="btn outline"
                  onclick="window.deleteProduct('${p.id}')">
                  ${h("Delete")}
                </button>

              </div>
            `).join("")
          : `
              <div class="card empty">
                <h3>${h("No products yet")}</h3>
                <p class="muted">
                  ${h("Click Add Product to list your produce.")}
                </p>
              </div>
            `
      }

    </div>`;
}

async function addProduct() {
  const name = prompt(t("Product name"), "Tomato");

  if (!name) return;

  const quantity = Number(prompt(t("Quantity in kg"), "40"));
  const price = Number(prompt(t("Price per kg"), "40"));

  if (!quantity || quantity <= 0 || !price || price <= 0) {
    alert(t("Enter valid quantity and price."));
    return;
  }

  try {
    loading("Adding product...");

    await addDoc(collection(db, "products"), {
      name,
      stock: quantity,
      price,
      ownerId: currentUser.uid,
      farmerId: currentUser.uid,
      farmerName: currentProfile.name,
      category: "Vegetables",
      location: "Local Farm",
      description: "Fresh agricultural produce.",
      img: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=700&q=80",
      createdAt: new Date().toISOString()
    });

    alert(t("Product added successfully."));

    await dash("farmer", "products");
  } catch (error) {
    showError(error);
    await dash("farmer", "products");
  }
}

async function deleteProduct(id) {
  if (!confirm(t("Delete this product?"))) return;

  try {
    await deleteDoc(doc(db, "products", id));

    alert(t("Product deleted."));

    await dash("farmer", "products");
  } catch (error) {
    showError(error);
  }
}

async function forders() {
  let list = [];

  try {
    const q = query(
      collection(db, "orders"),
      where("farmerId", "==", currentUser.uid)
    );

    const snap = await getDocs(q);
    list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    showError(error);
  }

  return `
    <h2>${h("Farmer Orders")}</h2>

    ${
      list.length
        ? list.map(o => `
          <div class="card" style="margin:14px 0">

            <div class="row">
              <b>${escapeHTML(o.id)}</b>
              <span class="badge green">${escapeHTML(statusText(o.status))}</span>
            </div>

            <p>
              ${h("Customer:")}
              <b>${escapeHTML(o.customer)}</b>
              <br>
              ${h("Phone:")}
              ${escapeHTML(o.phone)}
            </p>

            <p>
              ${(o.items || [])
                .map(i => `${escapeHTML(i.name)} — ${h("required {q} kg", { q: i.q })}`)
                .join("<br>")}
            </p>

          </div>
        `).join("")
        : `<div class="card empty">${h("No orders.")}</div>`
    }`;
}

async function horders() {
  try {
    const snap = await getDocs(collection(db, "orders"));
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    return `
      <h2>${h("Orders Received")}</h2>

      ${
        list.length
          ? list.map(o => `
            <div class="card" style="margin:14px 0">

              <h3>
                ${h("Farmer:")}
                ${escapeHTML(o.items?.[0]?.farmerName || t("Farmer"))}
              </h3>

              <p>${h("Order:")} ${escapeHTML(o.id)}</p>

              <p>${h("Customer:")} ${escapeHTML(o.customer || "")}</p>

              <p>${h("Phone:")} ${escapeHTML(o.phone || "")}</p>

              <p>
                ${(o.items || [])
                  .map(i => `${escapeHTML(i.name)} — ${h("{q} kg", { q: i.q })}`)
                  .join("<br>")}
              </p>

              <div class="notice">
                <b>${h("Total required quantity: {n} kg", { n: totalKg(o) })}</b>
              </div>

              ${
                o.status === "Placed"
                  ? `
                    <button class="btn primary" onclick="window.schedule('${o.id}')">
                      ${h("Mark Collection Scheduled")}
                    </button>
                  `
                  : `<span class="badge green">${escapeHTML(statusText(o.status))}</span>`
              }

            </div>
          `).join("")
          : `<div class="card empty">${h("No confirmed orders.")}</div>`
      }`;
  } catch (error) {
    console.error("Hub orders loading failed:", error);

    return `
      <div class="card">
        <h3>${h("Collection Hub")}</h3>
        <p class="muted">${h("Hub access requires the corresponding Firestore Rules.")}</p>
      </div>`;
  }
}

async function schedule(id) {
  try {
    await updateDoc(doc(db, "orders", id), {
      status: "Collection Scheduled"
    });

    await dash("hub", "horders");
  } catch (error) {
    console.error("Schedule error:", error);
    showError(error);
  }
}

async function packing() {
  try {
    const snap = await getDocs(collection(db, "orders"));
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    return `
      <h2>${h("Packing & Tracking")}</h2>

      ${
        list.length
          ? list.map(o => `
            <div class="card" style="margin:14px 0">

              <div class="row">
                <b>${escapeHTML(o.id)}</b>
                <span class="badge">${escapeHTML(statusText(o.status))}</span>
              </div>

              <button class="btn primary" onclick="window.advanceHub('${o.id}')">
                ${h("Advance Status")}
              </button>

            </div>
          `).join("")
          : `<div class="card empty">${h("No orders.")}</div>`
      }`;
  } catch (error) {
    console.error("Hub packing error:", error);

    return `
      <div class="card">
        <h3>${h("Firebase permission required")}</h3>
        <p>${h("Hub order access will be enabled when the Firestore Rules are updated.")}</p>
      </div>`;
  }
}

async function advanceHub(id) {
  try {
    const ref = doc(db, "orders", id);
    const snap = await getDoc(ref);

    if (!snap.exists()) return;

    const order = snap.data();

    const HUB_STEPS = [
      "Collection Scheduled",
      "Collected from Farmer",
      "At Collection Hub",
      "Packed"
    ];

    const index = HUB_STEPS.indexOf(order.status);

    if (index < 0 || index >= HUB_STEPS.length - 1) {
      alert(t("This order is not ready for the next hub step."));
      return;
    }

    await updateDoc(ref, { status: HUB_STEPS[index + 1] });

    await dash("hub", "packing");
  } catch (error) {
    showError(error);
  }
}

function slots() {
  return `
    <div class="grid g2">

      <div class="card">
        <h2>${h("11:00 AM")}</h2>
        <p>${h("Morning farmer collection")}</p>
      </div>

      <div class="card">
        <h2>${h("6:00 PM")}</h2>
        <p>${h("Evening farmer collection")}</p>
      </div>

    </div>`;
}

async function delivery(accepted) {
  try {
    const snap = await getDocs(collection(db, "orders"));

    let list = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    if (accepted) {
      list = list.filter(o => o.deliveryBoyId === currentUser.uid);
    } else {
      list = list.filter(o => o.status === "Packed" && !o.deliveryBoyId);
    }

    return `
      <h2>${h(accepted ? "Accepted Orders" : "Available Orders")}</h2>

      ${
        list.length
          ? list.map(o => {
              let action = "";

              if (!accepted) {
                action = `
                  <button class="btn primary" onclick="window.accept('${o.id}')">
                    ${h("Accept Order")}
                  </button>`;
              } else if (o.status === "Picked Up by Delivery Boy") {
                action = `
                  <button class="btn primary" onclick="window.advancedDelivery('${o.id}')">
                    ${h("Start Delivery")}
                  </button>`;
              } else if (o.status === "Out for Delivery") {
                action = `
                  <button class="btn primary" onclick="window.advancedDelivery('${o.id}')">
                    ${h("Mark Delivered")}
                  </button>`;
              } else if (o.status === "Delivered") {
                action = `<span class="badge green">${h("Delivery Completed")}</span>`;
              } else {
                action = `<span class="muted">${h("Waiting for packing / pickup")}</span>`;
              }

              return `
                <div class="card" style="margin:14px 0">

                  <div class="row">
                    <b>${escapeHTML(o.id)}</b>
                    <span class="badge">${escapeHTML(statusText(o.status))}</span>
                  </div>

                  <p>
                    ${h("Customer:")} ${escapeHTML(o.customer || "")}
                    <br>
                    ${h("Phone:")} ${escapeHTML(o.phone || "")}
                    <br>
                    ${h("Address:")} ${escapeHTML(o.address || "")}
                  </p>

                  <p>
                    <b>${h("Items:")}</b>
                    <br>
                    ${(o.items || [])
                      .map(i => `${escapeHTML(i.name)} — ${h("{q} kg", { q: i.q })}`)
                      .join("<br>")}
                  </p>

                  <p class="muted">
                    ${h("Delivery type:")}
                    ${h(o.type === "express" ? "Express Delivery" : "Normal Delivery")}
                  </p>

                  ${action}

                </div>`;
            }).join("")
          : `
            <div class="card empty">
              <h3>${h("No orders")}</h3>
              <p class="muted">
                ${h(
                  accepted
                    ? "You have not accepted any orders yet."
                    : "No packed orders are available right now."
                )}
              </p>
            </div>
          `
      }`;
  } catch (error) {
    console.error("Delivery loading failed:", error);

    return `
      <div class="card">
        <h3>${h("Delivery access error")}</h3>
        <p class="muted">${escapeHTML(error.message)}</p>
      </div>`;
  }
}

async function accept(id) {
  try {
    await updateDoc(doc(db, "orders", id), {
      deliveryBoyId: currentUser.uid,
      deliveryBoyName: currentProfile.name,
      status: "Picked Up by Delivery Boy"
    });

    await dash("delivery", "accepted");
  } catch (error) {
    showError(error);
  }
}

async function advancedDelivery(id) {
  try {
    const ref = doc(db, "orders", id);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      alert(t("Order not found."));
      return;
    }

    const order = snap.data();

    if (order.deliveryBoyId !== currentUser.uid) {
      alert(t("This order is assigned to another delivery boy."));
      return;
    }

    if (order.status === "Picked Up by Delivery Boy") {
      await updateDoc(ref, { status: "Out for Delivery" });
    } else if (order.status === "Out for Delivery") {
      await updateDoc(ref, { status: "Delivered" });
    }

    await dash("delivery", "accepted");
  } catch (error) {
    showError(error);
  }
}

function profile() {
  return `
    <div class="card">

      <h2>${h("{role} Profile", { role: roleName(currentProfile.role) })}</h2>

      <p><b>${h("Name:")}</b> ${escapeHTML(currentProfile.name)}</p>

      <p><b>${h("Phone:")}</b> ${escapeHTML(currentProfile.phone)}</p>

      <p><b>${h("Role:")}</b> ${escapeHTML(roleName(currentProfile.role))}</p>

      <p class="muted">${h("Account created with Firebase Authentication.")}</p>

    </div>`;
}

/*
====================================================
MAKE ALL FUNCTIONS AVAILABLE TO HTML BUTTONS
====================================================
Because app.js is loaded as type="module",
normal functions are not automatically global.
The buttons above use window.functionName().
*/

window.welcome = welcome;
window.roles = roles;
window.authScreen = authScreen;
window.logout = logout;
window.dash = dash;
window.add = add;
window.checkout = checkout;
window.place = place;
window.addProduct = addProduct;
window.deleteProduct = deleteProduct;
window.schedule = schedule;
window.advanceHub = advanceHub;
window.accept = accept;
window.advancedDelivery = advancedDelivery;
window.setLang = setLang;

/*
====================================================
START: restore the login after a page refresh
====================================================
*/

let started = false;

loading("Loading...");

onAuthStateChanged(auth, async (user) => {
  if (started) return; // only handle the first (page-load) event
  started = true;

  try {
    if (!user) {
      welcome();
      return;
    }

    const profileData = await getUserProfile(user.uid);

    if (!profileData) {
      await signOut(auth);
      welcome();
      return;
    }

    currentUser = user;
    currentProfile = profileData;

    await dash(profileData.role);
  } catch (error) {
    showError(error);
    welcome();
  }
});