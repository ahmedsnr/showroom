import { db } from "./firebase-config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const TELEPHONE = "+213551234567";

const conteneur = document.getElementById("detail");

const labels = {
  type: { neuf: "جديدة", occasion: "مستعملة", import: "وارد الخارج" },
  carburant: { essence: "بنزين", diesel: "مازوت", gpl: "غاز GPL", hybride: "هجينة" },
  boite: { manuelle: "عادي", automatique: "أوتوماتيك" },
  statut: { disponible: "متوفرة", reserve: "محجوزة", vendu: "مُباعة" }
};

function nombre(n) {
  return Number(n || 0).toLocaleString("fr-DZ");
}

function ligne(titre, valeur) {
  if (!valeur && valeur !== 0) return "";
  return `<div class="fiche-row"><span>${titre}</span><strong>${valeur}</strong></div>`;
}

async function charger() {
  const id = new URLSearchParams(location.search).get("id");

  if (!id) {
    conteneur.innerHTML = `<div class="introuvable">لم تُحدَّد أي سيارة. <a href="index.html#voitures">عد إلى القائمة</a></div>`;
    return;
  }

  try {
    const snap = await getDoc(doc(db, "cars", id));

    if (!snap.exists()) {
      conteneur.innerHTML = `<div class="introuvable">هذه السيارة لم تعد متوفرة. <a href="index.html#voitures">شاهد باقي السيارات</a></div>`;
      return;
    }

    afficher({ id: snap.id, ...snap.data() });

  } catch (e) {
    console.error(e);
    conteneur.innerHTML = `<div class="introuvable">تعذّر تحميل بيانات السيارة. أعد المحاولة.</div>`;
  }
}

function afficher(c) {
  const titre = `${c.marque || ""} ${c.modele || ""}`.trim();
  const statut = c.statut || "disponible";
  document.title = `${titre} — Auto Prestige`;

  conteneur.innerHTML = `
    <div class="detail-top">

      <div class="photo-main">
        ${c.imagePrincipale ? `<img src="${c.imagePrincipale}" alt="${titre}">` : ""}
      </div>

      <div class="info-box">
        <h1>${titre}</h1>
        <p class="info-sub">
          ${c.annee || ""}${c.kilometrage ? " — " + nombre(c.kilometrage) + " كلم" : ""}
        </p>

        <div class="badges">
          <span class="badge ${statut}">${labels.statut[statut]}</span>
          ${c.type ? `<span class="badge">${labels.type[c.type] || ""}</span>` : ""}
          ${c.boite ? `<span class="badge">${labels.boite[c.boite] || ""}</span>` : ""}
        </div>

        <div class="prix-box">
          <div class="prix">${nombre(c.prix)} دج</div>
          <p class="note">السعر قابل للنقاش عند المعاينة</p>
        </div>

        <div class="actions">
          <a href="tel:${TELEPHONE}" class="act-call">اتصل بنا الآن</a>
          <a href="tel:${TELEPHONE}" class="act-visit">احجز موعد معاينة</a>
        </div>
      </div>

    </div>

    <section class="fiche">
      <h2>الفيشة التقنية</h2>
      <div class="fiche-grid">
        ${ligne("الماركة", c.marque)}
        ${ligne("الموديل", c.modele)}
        ${ligne("سنة الصنع", c.annee)}
        ${ligne("النوع", labels.type[c.type])}
        ${ligne("الكيلومتراج", c.kilometrage ? nombre(c.kilometrage) + " كلم" : "")}
        ${ligne("الوقود", labels.carburant[c.carburant])}
        ${ligne("ناقل الحركة", labels.boite[c.boite])}
        ${ligne("اللون", c.couleur)}
      </div>
    </section>

    ${c.description ? `
      <section class="desc">
        <h2>وصف السيارة</h2>
        <p>${c.description}</p>
      </section>` : ""}
  `;
}

charger();
