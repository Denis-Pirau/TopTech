let toateProdusele = [];

document.addEventListener("DOMContentLoaded", async function () {
    const containerProduse = document.getElementById("grid-produse");
    const titluProduse = document.getElementById("titlu-produse");
    const formCautare = document.getElementById("form-cautare");
    const inputCautare = document.getElementById("input-cautare");

    if (!containerProduse || !titluProduse) {
        return;
    }

    try {
        // Modificare AJAX
        toateProdusele = await $.get("/TopTech/cgi/produse.php");
        if (!Array.isArray(toateProdusele)) {
            toateProdusele = [];
        }
    } catch (eroare) {
        containerProduse.innerHTML =
            "<p>Produsele nu au putut fi încărcate.</p>";
        console.error("Eroare la încărcarea produselor:", eroare);
        return;
    }

    if (inputCautare) {
        $("#input-cautare").keyup(function() {
            var str = $(this).val();
            if (str.length == 0) {
                $("#sugestii-cautare").html("").css("display", "none");
                return;
            }
            // Modificare AJAX
            $.ajax({
                url: "/TopTech/cgi/cautare.php?q=" + encodeURIComponent(str),
                success: function(result) {
                    if (result.trim() === "") {
                        $("#sugestii-cautare").html("").css("display", "none");
                    } else {
                        $("#sugestii-cautare").html(result).css("display", "block");
                    }
                }
            });
        });
        
        // Ascunde sugestiile daca dam click in afara
        $(document).click(function(event) {
            if (!$(event.target).closest('#form-cautare').length) {
                $("#sugestii-cautare").css("display", "none");
            }
        });
    }

    const params = new URLSearchParams(window.location.search);
    const qInitial = params.get("q");
    if (inputCautare && qInitial) {
        inputCautare.value = qInitial;
    }

    if (qInitial && qInitial.trim()) {
        afiseazaRezultateCautare(qInitial.trim(), titluProduse, containerProduse);
    } else {
        afiseazaVizualizareImplicita(titluProduse, containerProduse);
    }

    if (formCautare && inputCautare) {
        formCautare.addEventListener("submit", function (e) {
            e.preventDefault();
            const q = inputCautare.value.trim();
            const url = new URL(window.location.href);
            if (q) {
                url.searchParams.set("q", q);
                history.replaceState({}, "", url.pathname + url.search);
                afiseazaRezultateCautare(q, titluProduse, containerProduse);
            } else {
                url.searchParams.delete("q");
                history.replaceState({}, "", url.pathname + url.search);
                afiseazaVizualizareImplicita(titluProduse, containerProduse);
            }
        });
    }
});

function afiseazaVizualizareImplicita(titluEl, container) {
    titluEl.textContent = "Cele mai vândute produse";
    const topProduse = toateProdusele.slice(0, 4);
    afiseazaProduse(topProduse, container);
}

function afiseazaRezultateCautare(query, titluEl, container) {
    titluEl.textContent = 'Rezultate pentru „' + query + "”";
    const filtrate = toateProdusele.filter(function (p) {
        return potrivireCautare(p, query);
    });
    afiseazaProduse(filtrate, container);
}

function potrivireCautare(produs, q) {
    const t = q.trim().toLowerCase();
    if (!t) return true;
    const c = function (s) {
        return String(s || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    };
    const qNorm = c(t);
    const campuri = [
        produs.nume,
        produs.descriereScurta,
        produs.codProdus,
        produs.categorie,
        produs.alt,
        produs.stoc
    ];
    if (produs.specificatii && typeof produs.specificatii === "object") {
        Object.keys(produs.specificatii).forEach(function (cheie) {
            campuri.push(cheie + " " + produs.specificatii[cheie]);
        });
    }
    return campuri.some(function (text) {
        return c(text).includes(qNorm);
    });
}

function afiseazaProduse(produse, container) {
    container.innerHTML = "";

    if (!produse.length) {
        container.innerHTML =
            "<p>Nu s-au găsit produse care să se potrivească căutării.</p>";
        return;
    }

    produse.forEach(function (produs) {
        const card = document.createElement("article");
        card.className = "produs-card";

        const pretVechiHTML = produs.pretVechi
            ? `<del>${formateazaPret(produs.pretVechi)} MDL</del>`
            : "";

        card.innerHTML = `
            <img src="${produs.imagine}" alt="${produs.alt}">
            <h3><a href="${produs.link}?id=${encodeURIComponent(produs.id)}">${produs.nume}</a></h3>
            <p class="pret">${formateazaPret(produs.pretCurent)} MDL ${pretVechiHTML}</p>
            <p class="stoc">${produs.stoc}</p>
            <button type="button" class="btn-adauga-cos" data-id="${produs.id}">Adaugă în coș</button>
        `;

        container.appendChild(card);

        card.querySelector(".btn-adauga-cos").addEventListener("click", function () {
            adaugaInCos(produs.id, 1);
        });
    });
}

function formateazaPret(pret) {
    return new Intl.NumberFormat("ro-RO").format(pret);
}
