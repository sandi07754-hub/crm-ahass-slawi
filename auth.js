/* Supabase login and shared CRM data for CRM AHASS Slawi II.
   Configure only the project URL and publishable key below.
   Never put a Supabase secret/service-role key in this browser file. */
(() => {
    const PROJECT_URL = "PASTE_SUPABASE_PROJECT_URL_HERE";
    const PUBLISHABLE_KEY = "PASTE_SUPABASE_PUBLISHABLE_KEY_HERE";
    const SDK_URL = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    const table = "crm_shared_data";
    const rowId = "shared";
    const customerKey = "crm_ahass_customers";
    const logKey = "crm_ahass_message_log";
    const screen = document.getElementById("authScreen");
    const form = document.getElementById("authForm");
    const emailInput = document.getElementById("authUsername");
    const passwordInput = document.getElementById("authPassword");
    const message = document.getElementById("authMessage");
    const crm = window.crmAuth = { user: null, client: null, ready: null, request: null };

    const label = document.querySelector('label[for="authUsername"]');
    if (label) label.textContent = "Email";
    if (emailInput) {
        emailInput.type = "email";
        emailInput.name = "email";
        emailInput.autocomplete = "email";
        emailInput.placeholder = "nama@email.com";
    }

    function status(text, error = false) {
        if (!message) return;
        message.textContent = text;
        message.classList.toggle("error", error);
    }
    function showLogin(text = "", error = false) {
        document.querySelector(".sidebar")?.classList.add("hidden");
        document.querySelector(".main-content")?.classList.add("hidden");
        screen?.classList.remove("hidden");
        status(text, error);
    }
    function showApp() {
        screen?.classList.add("hidden");
        document.querySelector(".sidebar")?.classList.remove("hidden");
        document.querySelector(".main-content")?.classList.remove("hidden");
        const name = document.getElementById("currentUsername");
        if (name) name.textContent = crm.user?.email || "Admin";
    }
    function loadSdk() {
        if (window.supabase?.createClient) return Promise.resolve();
        return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = SDK_URL;
            script.onload = () => window.supabase?.createClient
                ? resolve() : reject(new Error("Library Supabase tidak berhasil dimuat."));
            script.onerror = () => reject(new Error("Tidak dapat memuat Supabase. Periksa koneksi internet."));
            document.head.appendChild(script);
        });
    }
    async function readData() {
        const { data, error } = await crm.client.from(table)
            .select("customers, logs").eq("id", rowId).maybeSingle();
        if (error) throw error;
        localStorage.setItem(customerKey, JSON.stringify(Array.isArray(data?.customers) ? data.customers : []));
        localStorage.setItem(logKey, JSON.stringify(Array.isArray(data?.logs) ? data.logs : []));
    }
    async function savePart(field, value) {
        const { data, error: readError } = await crm.client.from(table)
            .select("customers, logs").eq("id", rowId).maybeSingle();
        if (readError) throw readError;
        const row = { id: rowId, customers: data?.customers || [], logs: data?.logs || [] };
        row[field] = value;
        const { error } = await crm.client.from(table).upsert(row, { onConflict: "id" });
        if (error) throw error;
        return { [field]: value };
    }
    crm.request = async (path, options = {}) => {
        if (!crm.user) throw new Error("Silakan masuk kembali sebelum menyimpan data.");
        const field = path === "/customers" ? "customers" : path === "/logs" ? "logs" : null;
        if (!field) throw new Error("Permintaan data CRM tidak dikenal.");
        if (String(options.method || "GET").toUpperCase() === "PUT") {
            let body;
            try { body = JSON.parse(options.body || "{}"); }
            catch { throw new Error("Format data tidak valid."); }
            if (!Array.isArray(body[field])) throw new Error("Daftar data tidak valid.");
            return savePart(field, body[field]);
        }
        const { data, error } = await crm.client.from(table).select(field).eq("id", rowId).maybeSingle();
        if (error) throw error;
        return { [field]: Array.isArray(data?.[field]) ? data[field] : [] };
    };

    crm.ready = (async () => {
        showLogin();
        if (!PROJECT_URL.startsWith("https://") || PUBLISHABLE_KEY.includes("PASTE_")) {
            status("Konfigurasi Supabase belum diisi di auth.js.", true);
            return false;
        }
        try {
            await loadSdk();
            crm.client = window.supabase.createClient(PROJECT_URL, PUBLISHABLE_KEY, {
                auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
            });
            const { data, error } = await crm.client.auth.getSession();
            if (error) throw error;
            if (!data.session) return false;
            crm.user = data.session.user;
            await readData();
            showApp();
            return true;
        } catch (error) {
            crm.user = null;
            showLogin(`CRM belum dapat terhubung: ${error.message}`, true);
            return false;
        }
    })();

    form?.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (!crm.client) return status("Konfigurasi Supabase belum siap. Muat ulang halaman.", true);
        const button = document.getElementById("authSubmit");
        if (button) button.disabled = true;
        status("Memeriksa akun…");
        try {
            const { data, error } = await crm.client.auth.signInWithPassword({
                email: emailInput?.value.trim(), password: passwordInput?.value
            });
            if (error) throw error;
            crm.user = data.user;
            await readData();
            showApp();
            form.reset();
            document.dispatchEvent(new Event("crm:data-ready"));
        } catch {
            crm.user = null;
            showLogin("Email/kata sandi salah atau database belum disiapkan.", true);
        } finally {
            if (button) button.disabled = false;
        }
    });

    document.getElementById("logoutButton")?.addEventListener("click", async () => {
        if (!crm.client) return;
        const { error } = await crm.client.auth.signOut();
        crm.user = null;
        [customerKey, logKey, "crm_ahass_message_templates", "crm_ahass_campaigns"].forEach(key => localStorage.removeItem(key));
        showLogin(error ? "Keluar di perangkat ini. Tutup browser setelah selesai." : "Anda sudah keluar.", !!error);
    });
})();
