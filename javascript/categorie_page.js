function getQueryParam(param) {
    const params = new URLSearchParams(window.location.search);
    return params.get(param);
}

function formateazaPret(pret) {
    return new Intl.NumberFormat("ro-RO").format(pret);
}

function afiseazaProduse(produse, container) {
    container.innerHTML = "";

    produse.forEach(function (produs) {
        const card = document.createElement("article");
        card.className = "produs-card";

        const pretVechiHTML = produs.pretVechi
            ? `<del>${formateazaPret(produs.pretVechi)} MDL</del>`
            : "";

        card.innerHTML = `
            <img src="../${produs.imagine}" alt="${produs.alt}">
            <h3><a href="produs.html?id=${encodeURIComponent(produs.id)}">${produs.nume}</a></h3>
            <p class="pret">${formateazaPret(produs.pretCurent)} MDL ${pretVechiHTML}</p>
            <p class="stoc">${produs.stoc}</p>
            <button type="button" class="btn-adauga-cos" data-id="${produs.id}">Adaugă în coș</button>
        `;

        container.appendChild(card);

        // Adaugă event listener la buton
        card.querySelector(".btn-adauga-cos").addEventListener("click", function() {
            adaugaInCos(produs.id, 1);
        });
    });
}

async function initCategoriePage() {
    const categoryId = getQueryParam("categorie");
    const titluCategorie = document.querySelector("#titlu-categorie");
    const numarProduse = document.querySelector("#numar-produse");
    const gridProduse = document.querySelector("#grid-produse");
    const sliderPret = document.querySelector("#filter-pret");
    const textPret = document.querySelector("#range-pret");
    const btnFiltre = document.querySelector("#aplica-filtre");

    if (!categoryId || !gridProduse) {
        return;
    }

    try {
        // Modificare AJAX
        const [categorii, produse] = await Promise.all([
            $.get("/TopTech/cgi/categorii.php"),
            $.get("/TopTech/cgi/produse.php")
        ]);

        const categorie = categorii.find(cat => cat.id === categoryId);
        const titlu = categorie ? categorie.nume : "Categorie Necunoscută";
        titluCategorie.textContent = titlu;

        const breadcrumb = document.querySelector("#breadcrumb");
        if (breadcrumb) {
            breadcrumb.innerHTML = `Acasă > <a href="../index.html">Categorii</a> > <strong>${titlu}</strong>`;
        }

        let produseFiltrate = produse.filter(p => p.categorie === categoryId);

        function aplicaFiltre() {
            const maximPret = Number(sliderPret.value);
            textPret.textContent = `0 - ${formateazaPret(maximPret)} MDL`;
            const branduriSelectate = Array.from(document.querySelectorAll('input[name="brand"]:checked')).map(i => i.value);

            let list = produse.filter(p => p.categorie === categoryId);

            if (maximPret > 0) {
                list = list.filter(p => p.pretCurent <= maximPret);
            }

            if (branduriSelectate.length) {
                const search = branduriSelectate.map(b => b.toLowerCase());
                list = list.filter(p => search.some(b => p.nume.toLowerCase().includes(b)));
            }

            produseFiltrate = list;
            reimprospateaza();
        }

        function reimprospateaza() {
            if (produseFiltrate.length === 0) {
                gridProduse.innerHTML = "<p>Nu s-au gasit produse in aceasta categorie.</p>";
            } else {
                afiseazaProduse(produseFiltrate, gridProduse);
            }
            numarProduse.textContent = `Am gasit ${produseFiltrate.length} produse.`;
        }

        aplicaFiltre();

        sliderPret.addEventListener("input", aplicaFiltre);
        btnFiltre.addEventListener("click", aplicaFiltre);

    } catch (e) {
        gridProduse.innerHTML = "<p>Eroare la incarcare produse.</p>";
        console.error(e);
    }
}

document.addEventListener("DOMContentLoaded", initCategoriePage);