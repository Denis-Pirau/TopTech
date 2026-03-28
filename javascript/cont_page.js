function afiseazaMesaj(el, text, esteEroare) {
    if (!el) return;
    el.textContent = text;
    el.hidden = !text;
    el.setAttribute("role", text ? "status" : "presentation");
    if (text) {
        el.style.color = esteEroare ? "#cf6679" : "#03dac6";
    }
}

function setVizibilitateCont(autentificat) {
    const authBox = document.getElementById("auth-forms");
    const profil = document.getElementById("sectiune-profil");
    // .auth-container are display:flex în CSS și suprascrie atributul [hidden];
    // folosim display inline ca să ascundem/afișăm corect.
    if (authBox) {
        authBox.hidden = autentificat;
        authBox.style.display = autentificat ? "none" : "";
    }
    if (profil) {
        profil.hidden = !autentificat;
        profil.style.display = autentificat ? "" : "none";
    }
}

function umpleProfil(user) {
    const numeEl = document.getElementById("profil-nume");
    const emailEl = document.getElementById("profil-email");
    const telEl = document.getElementById("profil-telefon");
    if (numeEl) numeEl.textContent = user.nume || "—";
    if (emailEl) emailEl.textContent = user.email || "—";
    if (telEl) telEl.textContent = user.telefon || "—";
}

async function initPaginaCont() {
    await initConturiStorage();
    migrateLegacyCos();

    const mesaj = document.getElementById("mesaj-auth");
    const u = getCurrentUser();

    if (u) {
        setVizibilitateCont(true);
        umpleProfil(u);
    } else {
        setVizibilitateCont(false);
    }

    const formLogin = document.getElementById("form-login");
    if (formLogin) {
        formLogin.addEventListener("submit", function (e) {
            e.preventDefault();
            afiseazaMesaj(mesaj, "", false);
            const email = document.getElementById("email").value.trim();
            const pass = document.getElementById("pass").value;
            const rez = loginCont(email, pass);
            if (!rez.ok) {
                afiseazaMesaj(mesaj, rez.mesaj, true);
                return;
            }
            umpleProfil(rez.user);
            setVizibilitateCont(true);
            afiseazaMesaj(mesaj, "", false);
            if (typeof updateBadgeHeaderCos === "function") updateBadgeHeaderCos();
            formLogin.reset();
        });
    }

    const formReg = document.getElementById("form-inregistrare");
    if (formReg) {
        formReg.addEventListener("submit", function (e) {
            e.preventDefault();
            afiseazaMesaj(mesaj, "", false);
            const nume = document.getElementById("nume").value.trim();
            const email = document.getElementById("email-nou").value.trim();
            const telefon = document.getElementById("telefon").value.trim();
            const p1 = document.getElementById("pass-nou").value;
            const p2 = document.getElementById("pass-confirm").value;
            if (p1 !== p2) {
                afiseazaMesaj(mesaj, "Parolele nu coincid.", true);
                return;
            }
            const rez = registerCont({
                nume,
                email,
                telefon,
                parola: p1
            });
            if (!rez.ok) {
                afiseazaMesaj(mesaj, rez.mesaj, true);
                return;
            }
            umpleProfil(rez.user);
            setVizibilitateCont(true);
            afiseazaMesaj(mesaj, "", false);
            if (typeof updateBadgeHeaderCos === "function") updateBadgeHeaderCos();
            formReg.reset();
        });
    }

    const btnLogout = document.getElementById("btn-logout");
    if (btnLogout) {
        btnLogout.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            logout();
            setVizibilitateCont(false);
            afiseazaMesaj(mesaj, "", false);
            if (typeof updateBadgeHeaderCos === "function") updateBadgeHeaderCos();
        });
    }
}

document.addEventListener("DOMContentLoaded", initPaginaCont);
