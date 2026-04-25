document.addEventListener("DOMContentLoaded", async function () {
    const listaCategorii = document.querySelector("#lista-categorii");
    if (!listaCategorii) return;

    try {
        // Modificare AJAX
        const categorii = await $.get("/TopTech/cgi/categorii.php");
        listaCategorii.innerHTML = "";

        categorii.forEach(categorie => {
            const li = document.createElement("li");
            const a = document.createElement("a");
            a.href = `html/categorie.html?categorie=${encodeURIComponent(categorie.id)}`;
            a.textContent = categorie.nume;
            li.appendChild(a);
            listaCategorii.appendChild(li);
        });
    } catch (error) {
        listaCategorii.innerHTML = "<li>Eroare la incarcare categorii</li>";
        console.error(error);
    }
});