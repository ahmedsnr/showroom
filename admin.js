import { db } from "./firebase-config.js";
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, query, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// ⚠️ غيّر كلمة السر هذه إلى ما تريد
const MOT_DE_PASSE = "showroom2026";

const champs = ["marque","modele","annee","prix","type","kilometrage",
                "carburant","boite","couleur","statut","imagePrincipale","description"];

let enEdition = null;

/* ---------- الدخول ---------- */
const lock = document.getElementById("lock");
const panel = document.getElementById("panel");

function tenterLogin() {
  const val = document.getElementById("pass").value;
  if (val === MOT_DE_PASSE) {
    sessionStorage.setItem("admin_ok", "1");
    lock.classList.add("hidden");
    panel.classList.remove("hidden");
    charger();
  } else {
    document.getElementById("lock-error").textContent = "كلمة السر غير صحيحة.";
  }
}

document.getElementById("btn-login").addEventListener("click", tenterLogin);
document.getElementById("pass").addEventListener("keydown", e => {
  if (e.key === "Enter") tenterLogin();
});

if (sessionStorage.getItem("admin_ok") === "1") {
  lock.classList.add("hidden");
  panel.classList.remove("hidden");
  charger();
}

/* ---------- الحفظ ---------- */
function lireFormulaire() {
  const data = {};
  champs.forEach(c => {
    const el = document.getElementById(c);
    const v = el.value.trim();
    data[c] = ["annee","prix","kilometrage"].includes(c) ? (Number(v) || 0) : v;
  });
  return data;
}

function viderFormulaire() {
  champs.forEach(c => {
    const el = document.getElementById(c);
    if (el.tagName === "SELECT") el.selectedIndex = 0;
    else el.value = "";
  });
  enEdition = null;
  document.getElementById("form-title").textContent = "إضافة سيارة";
  document.getElementById("btn-save").textContent = "حفظ السيارة";
  document.getElementById("btn-cancel").classList.add("hidden");
}

function message(txt) {
  const m = document.getElementById("msg");
  m.textContent = txt;
  setTimeout(() => { m.textContent = ""; }, 3000);
}

document.getElementById("btn-save").addEventListener("click", async () => {
  const data = lireFormulaire();

  if (!data.marque || !data.modele || !data.prix) {
    message("املأ على الأقل: الماركة، الموديل، السعر.");
    return;
  }

  try {
    if (enEdition) {
      await updateDoc(doc(db, "cars", enEdition), data);
      message("تم تحديث السيارة.");
    } else {
      data.dateAjout = serverTimestamp();
      await addDoc(collection(db, "cars"), data);
      message("تمت إضافة السيارة.");
    }
    viderFormulaire();
    charger();
  } catch (e) {
    console.error(e);
    message("فشل الحفظ. تحقّق من الاتصال.");
  }
});

document.getElementById("btn-cancel").addEventListener("click", viderFormulaire);

/* ---------- القائمة ---------- */
async function charger() {
  const liste = document.getElementById("admin-list");
  liste.innerHTML = "جارٍ التحميل…";

  try {
    const snap = await getDocs(query(collection(db, "cars"), orderBy("dateAjout", "desc")));
    const voitures = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    if (voitures.length === 0) {
      liste.innerHTML = "<p style='color:var(--steel)'>لا توجد سيارة بعد. أضف أول واحدة من الأعلى.</p>";
      return;
    }

    liste.innerHTML = "";
    voitures.forEach(c => {
      const row = document.createElement("div");
      row.className = "admin-row";
      row.innerHTML = `
        <img src="${c.imagePrincipale || ""}" alt="">
        <div class="info">
          <strong>${c.marque} ${c.modele}</strong>
          <span>${c.annee || ""} — ${c.statut === "vendu" ? "مُباعة" : c.statut === "reserve" ? "محجوزة" : "متوفرة"}</span>
        </div>
        <div class="price">${Number(c.prix || 0).toLocaleString("fr-DZ")} دج</div>
        <button data-edit="${c.id}">تعديل</button>
        <button data-del="${c.id}" class="danger">حذف</button>
      `;
      liste.appendChild(row);
    });

    liste.querySelectorAll("[data-edit]").forEach(b =>
      b.addEventListener("click", () => remplir(voitures.find(v => v.id === b.dataset.edit)))
    );
    liste.querySelectorAll("[data-del]").forEach(b =>
      b.addEventListener("click", () => supprimer(b.dataset.del))
    );

  } catch (e) {
    console.error(e);
    liste.innerHTML = "تعذّر تحميل السيارات.";
  }
}

function remplir(c) {
  champs.forEach(f => { document.getElementById(f).value = c[f] ?? ""; });
  enEdition = c.id;
  document.getElementById("form-title").textContent = "تعديل سيارة";
  document.getElementById("btn-save").textContent = "حفظ التعديل";
  document.getElementById("btn-cancel").classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function supprimer(id) {
  if (!confirm("هل تريد حذف هذه السيارة نهائياً؟")) return;
  try {
    await deleteDoc(doc(db, "cars", id));
    charger();
  } catch (e) {
    console.error(e);
    alert("فشل الحذف.");
  }
}
