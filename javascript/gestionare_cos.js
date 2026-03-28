// Gestionare coș de cumpărături cu localStorage (cheie per cont: vezi auth.js → getCosStorageKey)

// Determina calea relativă corectă pentru JSON
function getJsonPath(file) {
    // Detectează dacă suntem pe o pagină din root (index.html) sau din subfolder (html/categorie.html)
    const isInHtmlFolder = window.location.pathname.includes('/html/');
    const prefix = isInHtmlFolder ? '../' : '';
    return prefix + 'json/' + file;
}

function getCosLocal() {
    if (typeof migrateLegacyCos === "function") migrateLegacyCos();
    const key =
        typeof getCosStorageKey === "function"
            ? getCosStorageKey()
            : "toptech_cos_guest";
    const cos = localStorage.getItem(key);
    return cos ? JSON.parse(cos) : [];
}

function saveCosLocal(cos) {
    const key =
        typeof getCosStorageKey === "function"
            ? getCosStorageKey()
            : "toptech_cos_guest";
    localStorage.setItem(key, JSON.stringify(cos));
}

async function adaugaInCos(produserele_id, cantitate = 1) {
    try {
        // Incarca produsele din JSON pentru a lua detalii
        const jsonPath = getJsonPath('produse.json');
        const resp = await fetch(jsonPath);
        if (!resp.ok) throw new Error("Nu s-a putut incarca produsele");

        const totiProdusele = await resp.json();
        const produs = totiProdusele.find(p => p.id === produserele_id);

        if (!produs) {
            alert("Produsul nu a fost găsit");
            return;
        }

        // Incarca cosul curent
        let cos = getCosLocal();

        // Cauta daca produsul e deja in cos
        const itemExistent = cos.find(p => p.id === produserele_id);

        if (itemExistent) {
            // Mareste cantitatea
            itemExistent.cantitate += parseInt(cantitate);
        } else {
            // Adauga produs nou in cos
            cos.push({
                id: produs.id,
                nume: produs.nume,
                imagine: produs.imagine,
                pretUnitar: produs.pretCurent,
                cantitate: parseInt(cantitate)
            });
        }

        saveCosLocal(cos);
        alert(`${produs.nume} a fost adăugat în coș!`);
        updateBadgeHeaderCos();
    } catch (error) {
        console.error("Eroare la adaugare in cos:", error);
        alert("Eroare la adaugare în coș");
    }
}

function actualizeCantitate(produserele_id, nouaCantitate) {
    let cos = getCosLocal();
    const item = cos.find(p => p.id === produserele_id);
    if (item) {
        item.cantitate = parseInt(nouaCantitate);
        if (item.cantitate <= 0) {
            cos = cos.filter(p => p.id !== produserele_id);
        }
        saveCosLocal(cos);
        updateBadgeHeaderCos();
    }
}

function stergedinCos(produserele_id) {
    let cos = getCosLocal();
    cos = cos.filter(p => p.id !== produserele_id);
    saveCosLocal(cos);
    updateBadgeHeaderCos();
}

function updateBadgeHeaderCos() {
    const cos = getCosLocal();
    const total = cos.reduce((sum, p) => sum + p.cantitate, 0);
    const badges = document.querySelectorAll("header a[href*='cos.html']");
    badges.forEach(badge => {
        badge.textContent = `Coș (${total})`;
    });
}

// Apelează update badge la încărcare (după migrare coș vechi și inițializare conturi dacă există auth.js)
document.addEventListener("DOMContentLoaded", function() {
    function refreshBadge() {
        if (typeof migrateLegacyCos === "function") migrateLegacyCos();
        updateBadgeHeaderCos();
    }
    if (typeof initConturiStorage === "function") {
        initConturiStorage().finally(refreshBadge);
    } else {
        refreshBadge();
    }
});
