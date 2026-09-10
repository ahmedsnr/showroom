import { db } from "./firebase-config.js";
import {
  collection, getDocs, query, orderBy
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const grid = document.getElementById("cars-grid");
const etat = document.getElementById("etat");

const typeLabels = { neuf: "جديدة", occasion: "مستعملة", import: "وارد الخارج" };
const carburantLabels = { essence: "بنزين", diesel: "مازوت", gpl: "غاز GPL", hybride: "هجينة" };
const boiteLabels = { manuelle: "عادي", automatique: "أوتوماتيك" };

let toutesLesVoitures = [];

function nombre(n) {
  return Number(n || 0).toLocaleString("fr-DZ");
}

async function charger() {
  try {
    const snap = await getDocs(query(collection(db, "cars"), orderBy("dateAjout", "desc")));
    toutesLesVoitures = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    const compteur = document.getElementById("stat-count");
    if (compteur) compteur.textContent = toutesLesVoitures.length;

    afficher(toutesLesVoitures);
  } catch (e) {
    console.error(e);
    etat.textContent = "تعذّر الاتصال بقاعدة البيانات. تحقّق من إعدادات Firebase.";
    etat.className = "etat boite";
  }
}

function afficher(liste) {
  grid.innerHTML = "";

  if (liste.length === 0) {
    etat.textContent = "لا توجد سيارة تطابق بحثك. جرّب توسيع الميزانية أو إزالة الماركة.";
    etat.className = "etat boite";
    return;
  }

  etat.textContent = `${liste.length} سيارة معروضة`;
  etat.className = "etat";

  liste.forEach(c => {
    const vendu = c.statut === "vendu";
    const neuf = c.type === "neuf";

    // الأوصاف السريعة تحت البطاقة
    const specs = [
      c.annee,
      c.kilometrage ? nombre(c.kilometrage) + " كلم" : null,
      carburantLabels[c.carburant],
      boiteLabels[c.boite]
    ].filter(Boolean).map(s => `<span>${s}</span>`).join("");

    const carte = document.createElement("a");
    carte.className = "car";
    carte.href = `voiture.html?id=${c.id}`;
    carte.innerHTML = `
      <div class="car-photo">
        ${c.imagePrincipale ? `<img src="${c.imagePrincipale}" alt="${c.marque} ${c.modele}" loading="lazy">` : ""}
        <span class="tag ${vendu ? "vendu" : neuf ? "neuf" : ""}">
          ${vendu ? "مُباعة" : (typeLabels[c.type] || "")}
        </span>
      </div>
      <div class="car-body">
        <h3>${c.marque || ""} ${c.modele || ""}</h3>
        <p class="car-price">${nombre(c.prix)} دج</p>
        <div class="specs">${specs}</div>
      </div>
    `;
    grid.appendChild(carte);
  });
}

function filtrer() {
  const marque = document.getElementById("f-marque").value.trim().toLowerCase();
  const type = document.getElementById("f-type").value;
  const budget = Number(document.getElementById("f-budget").value) || Infinity;

  afficher(toutesLesVoitures.filter(c =>
    (!marque || (c.marque || "").toLowerCase().includes(marque)) &&
    (!type || c.type === type) &&
    Number(c.prix || 0) <= budget
  ));
}

document.getElementById("btn-search").addEventListener("click", filtrer);

charger();
