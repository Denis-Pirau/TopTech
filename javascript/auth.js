const SESSION_KEY = "toptech_session";

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

function initConturiStorage() {
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

async function registerCont({ nume, email, telefon, parola }) {
    try {
        const response = await fetch('/TopTech/cgi/auth.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'register', nume, email, telefon, parola })
        });
        const data = await response.json();
        
        if (data.ok) {
            setSession(data.user);
            mergeGuestCartIntoUser(data.user.id);
        }
        return data;
    } catch (e) {
        return { ok: false, mesaj: "Eroare de rețea." };
    }
}

async function loginCont(email, parola) {
    try {
        const response = await fetch('/TopTech/cgi/auth.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'login', email, parola })
        });
        const data = await response.json();
        
        if (data.ok) {
            setSession(data.user);
            mergeGuestCartIntoUser(data.user.id);
        }
        return data;
    } catch (e) {
        return { ok: false, mesaj: "Eroare de rețea." };
    }
}
