function getQueryParam(param) {
    const params = new URLSearchParams(window.location.search);
    return params.get(param);
}

function formateazaPret(pret) {
    return new Intl.NumberFormat("ro-RO").format(pret);
}

function construiesteTabelSpec(spec) {
    if (!spec || typeof spec !== "object") return "<tr><td colspan=2>Specificații indisponibile.</td></tr>";
    let html = "";
    for (const [cheie, valoare] of Object.entries(spec)) {
        html += `\n            <tr><td>${cheie}</td><td>${valoare}</td></tr>`;
    }
    return html;
}

async function initProdusPage() {
    const idProdus = Number(getQueryParam("id"));
    const breadcrumb = document.querySelector("#breadcrumb");
    const img = document.getElementById("produs-img");
    const nume = document.getElementById("produs-nume");
    const cod = document.getElementById("cod-produs");
    const codCaption = document.getElementById("cod-produs-caption");
    const textPret = document.getElementById("produs-pret");
    const stoc = document.getElementById("produs-stoc");
    const descriere = document.getElementById("descriere-scurta");
    const tabel = document.getElementById("tabel-specificatii");

    if (!idProdus || !img) {
        return;
    }

    try {
        const resp = await fetch("../json/produse.json");
        if (!resp.ok) throw new Error("Nu am putut incarca produsele.");

        const produse = await resp.json();
        const produs = produse.find(p => p.id === idProdus);

        if (!produs) {
            nume.textContent = "Produsul nu exista.";
            return;
        }

        nume.textContent = produs.nume;
        cod.textContent = `Cod produs: ${produs.codProdus}`;
        codCaption.textContent = `Cod produs: ${produs.codProdus}`;
        img.src = `../${produs.imagine}`;
        img.alt = produs.alt;
        textPret.textContent = `${formateazaPret(produs.pretCurent)} MDL`;
        stoc.textContent = produs.stoc;
        descriere.textContent = produs.descriereScurta;
        tabel.innerHTML = construiesteTabelSpec(produs.specificatii);

        let categorieNume = produs.categorie;
        try {
            const categoriiResp = await fetch("../json/categorii.json");
            if (categoriiResp.ok) {
                const categorii = await categoriiResp.json();
                const categorieObiect = categorii.find(c => c.id === produs.categorie);
                if (categorieObiect) categorieNume = categorieObiect.nume;
            }
        } catch (err) {
            console.warn("Nu s-a putut incarca numele categoriei", err);
        }

        if (breadcrumb) {
            breadcrumb.innerHTML = `Acasă > <a href="../index.html">Categorii</a> > <a href="categorie.html?categorie=${encodeURIComponent(produs.categorie)}">${categorieNume}</a> > <strong>${produs.nume}</strong>`;
        }

        // Adauga event listener la butonul "Adaugă în coș"
        const btnAdauga = document.getElementById("adauga-cos");
        const inputCantitate = document.getElementById("cantitate");
        if (btnAdauga) {
            btnAdauga.addEventListener("click", function() {
                const cantitate = parseInt(inputCantitate.value) || 1;
                adaugaInCos(idProdus, cantitate);
            });
        }

    } catch (error) {
        console.error(error);
        nume.textContent = "Eroare la incarcarea detaliilor produsului.";
    }
}

document.addEventListener("DOMContentLoaded", initProdusPage);
