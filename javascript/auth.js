/**
 * Vanilla JS (fără Node, fără jQuery).
 * Conturile se păstrează în localStorage (cheia toptech_conturi), ca și coșul
 * (toptech_cos_guest sau toptech_cos_<id>). Nu există fișier JSON pentru conturi.
 */

const SESSION_KEY = "toptech_session";
const ACCOUNTS_LS_KEY = "toptech_conturi";

function getCurrentUser() {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function getCosStorageKey() {
    const u = getCurrentUser();
    if (!u || !u.id) return "toptech_cos_guest";
    return "toptech_cos_" + u.id;
}

function migrateLegacyCos() {
    const legacy = localStorage.getItem("toptech_cos");
    if (!legacy) return;
    if (!localStorage.getItem("toptech_cos_guest")) {
        localStorage.setItem("toptech_cos_guest", legacy);
    }
    localStorage.removeItem("toptech_cos");
}

function getConturiLista() {
    const raw = localStorage.getItem(ACCOUNTS_LS_KEY);
    if (!raw) return [];
    try {
        const arr = JSON.parse(raw);
        return Array.isArray(arr) ? arr : [];
    } catch {
        return [];
    }
}

function saveConturiLista(lista) {
    localStorage.setItem(ACCOUNTS_LS_KEY, JSON.stringify(lista));
}

function initConturiStorage() {
    if (localStorage.getItem(ACCOUNTS_LS_KEY) === null) {
        saveConturiLista([]);
    }
    return Promise.resolve();
}

function setSession(user) {
    const { id, email, nume, telefon } = user;
    localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ id, email, nume, telefon })
    );
}

function logout() {
    localStorage.removeItem(SESSION_KEY);
}

function findContByEmail(email) {
    const e = String(email).trim().toLowerCase();
    return getConturiLista().find(
        (c) => String(c.email).trim().toLowerCase() === e
    );
}

function mergeCosItems(a, b) {
    const map = new Map();
    [...a, ...b].forEach((item) => {
        const ex = map.get(item.id);
        if (ex) {
            ex.cantitate = (ex.cantitate || 0) + (item.cantitate || 0);
        } else {
            map.set(item.id, { ...item });
        }
    });
    return Array.from(map.values());
}

function mergeGuestCartIntoUser(userId) {
    const guestRaw = localStorage.getItem("toptech_cos_guest");
    if (!guestRaw) return;
    let guest = [];
    try {
        guest = JSON.parse(guestRaw);
        if (!Array.isArray(guest)) guest = [];
    } catch {
        return;
    }
    if (guest.length === 0) return;
    const userKey = "toptech_cos_" + userId;
    let userCart = [];
    const ur = localStorage.getItem(userKey);
    if (ur) {
        try {
            userCart = JSON.parse(ur);
            if (!Array.isArray(userCart)) userCart = [];
        } catch {
            userCart = [];
        }
    }
    const merged = mergeCosItems(userCart, guest);
    localStorage.setItem(userKey, JSON.stringify(merged));
    localStorage.removeItem("toptech_cos_guest");
}

function registerCont({ nume, email, telefon, parola }) {
    if (findContByEmail(email)) {
        return { ok: false, mesaj: "Există deja un cont cu acest email." };
    }
    const lista = getConturiLista();
    const id =
        typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : "u_" + Date.now().toString(36) + Math.random().toString(36).slice(2);
    lista.push({
        id,
        nume: String(nume).trim(),
        email: String(email).trim(),
        telefon: String(telefon).trim(),
        parola: String(parola)
    });
    saveConturiLista(lista);
    const user = {
        id,
        nume: String(nume).trim(),
        email: String(email).trim(),
        telefon: String(telefon).trim()
    };
    setSession(user);
    mergeGuestCartIntoUser(id);
    return { ok: true, user };
}

function loginCont(email, parola) {
    const c = findContByEmail(email);
    if (!c || c.parola !== String(parola)) {
        return { ok: false, mesaj: "Email sau parolă incorectă." };
    }
    const user = {
        id: c.id,
        nume: c.nume,
        email: c.email,
        telefon: c.telefon
    };
    setSession(user);
    mergeGuestCartIntoUser(user.id);
    return { ok: true, user };
}
