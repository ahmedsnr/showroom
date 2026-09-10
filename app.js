import { db } from "./firebase-config.js";
import {
  collection, getDocs, query, orderBy
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const grid = document.getElementById("cars-grid");
const etat = document.getElementById("etat");

const typeLabels = {
  neuf: "جديدة",
  occasion: "مستعملة",
  import: "وارد الخارج"
};

let toutesLesVoitures = [];

// جلب السيارات من قاعدة البيانات
async function charger() {
  try {
    const snap = await getDocs(query(collection(db, "cars"), orderBy("dateAjout", "desc")));
    toutesLesVoitures = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    afficher(toutesLesVoitures);
  } catch (e) {
    console.error(e);
    etat.textContent = "تعذّر الاتصال بقاعدة البيانات. تحقّق من إعدادات Firebase.";
    etat.className = "etat boite";
  }
}

// عرض السيارات على الشاشة
function afficher(liste) {
  grid.innerHTML = "";

  if (liste.length === 0) {
    etat.textContent = "لا توجد سيارة تطابق بحثك. جرّب توسيع الميزانية أو إزالة الماركة.";
    etat.className = "etat boite";
    return;
  }

  etat.textContent = `${liste.length} سيارة متوفرة`;
  etat.className = "etat";

  liste.forEach(c => {
    const vendu = c.statut === "vendu";
    const article = document.createElement("a");
    article.className = "car";
    article.href = `voiture.html?id=${c.id}`;
    article.innerHTML = `
      <div class="car-photo">
        ${c.imagePrincipale ? `<img src="${c.imagePrincipale}" alt="${c.marque} ${c.modele}" loading="lazy">` : ""}
      </div>
      <div class="car-body">
        <div class="car-top">
          <h3>${c.marque || ""} ${c.modele || ""}</h3>
          <span class="tag ${vendu ? "vendu" : ""}">
            ${vendu ? "مُباعة" : (typeLabels[c.type] || "")}
          </span>
        </div>
        <p class="car-meta">
          ${c.annee || ""}${c.kilometrage ? " — " + Number(c.kilometrage).toLocaleString("fr-DZ") + " كلم" : ""}
        </p>
        <p class="car-price">${Number(c.prix || 0).toLocaleString("fr-DZ")} دج</p>
      </div>
    `;
    grid.appendChild(article);
  });
}

// الفلترة
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
