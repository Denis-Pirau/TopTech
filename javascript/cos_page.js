function formateazaPret(pret) {
    return new Intl.NumberFormat("ro-RO").format(pret);
}

function afisareazaCos() {
    const cos = getCosLocal();
    const tbody = document.getElementById("tbody-cos");
    const continutCos = document.getElementById("continut-cos");
    const cosGol = document.getElementById("cos-gol");
    const subtotalEl = document.getElementById("subtotal");
    const totalEl = document.getElementById("total");

    if (cos.length === 0) {
        continutCos.style.display = "none";
        cosGol.style.display = "block";
        return;
    }

    continutCos.style.display = "block";
    cosGol.style.display = "none";

    tbody.innerHTML = "";
    let subtotal = 0;

    cos.forEach(item => {
        const totalProdus = item.pretUnitar * item.cantitate;
        subtotal += totalProdus;

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>
                <img src="../${item.imagine}" alt="${item.nume}" style="width: 60px; height: 60px; object-fit: contain; margin-right: 10px;">
                <strong>${item.nume}</strong>
            </td>
            <td>${formateazaPret(item.pretUnitar)} MDL</td>
            <td>
                <input type="number" class="input-cantitate" data-id="${item.id}" value="${item.cantitate}" min="1" max="100">
            </td>
            <td>${formateazaPret(totalProdus)} MDL</td>
            <td><button class="btn-sterge" data-id="${item.id}">Șterge</button></td>
        `;

        tbody.appendChild(row);

        // Event listener pentru input cantitate
        row.querySelector(".input-cantitate").addEventListener("change", function() {
            const nouaCantitate = parseInt(this.value);
            if (nouaCantitate > 0) {
                actualizeCantitate(item.id, nouaCantitate);
                afisareazaCos();
            }
        });

        // Event listener pentru buton șterge
        row.querySelector(".btn-sterge").addEventListener("click", function() {
            stergedinCos(item.id);
            afisareazaCos();
        });
    });

    subtotalEl.textContent = `${formateazaPret(subtotal)} MDL`;
    totalEl.textContent = `${formateazaPret(subtotal)} MDL`;
}

document.addEventListener("DOMContentLoaded", function() {
    afisareazaCos();
});
