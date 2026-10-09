// ======================================
// CRM AHASS SLAWI II
// APP.JS - VERSI PERBAIKAN
// ======================================


// ======================================
// DATABASE KEY
// ======================================

const CUSTOMER_KEY = "crm_ahass_customers";
const MESSAGE_LOG_KEY = "crm_ahass_message_log";
const MESSAGE_TEMPLATE_KEY = "crm_ahass_message_templates";
const CAMPAIGN_KEY = "crm_ahass_campaigns";


// ======================================
// DATA CUSTOMER CONTOH
// ======================================

const sampleCustomers = [
    {
        id: "CUS0001",
        nama: "Budi Santoso",
        noWa: "628123456789",
        noPolisi: "F 1234 XX",
        motor: "Honda Vario 160",
        km: 12500,
        serviceTerakhir: "2026-09-01",
        serviceBerikutnya: "2026-10-08",
        kpb: "KPB 3",
        optin: true,
        status: "Aktif"
    },
    {
        id: "CUS0002",
        nama: "Andi Saputra",
        noWa: "628987654321",
        noPolisi: "F 5678 AB",
        motor: "Honda Beat",
        km: 8500,
        serviceTerakhir: "2026-08-20",
        serviceBerikutnya: "2026-10-07",
        kpb: "KPB 2",
        optin: true,
        status: "Aktif"
    },
    {
        id: "CUS0003",
        nama: "Rina Amelia",
        noWa: "628111222333",
        noPolisi: "F 8888 CD",
        motor: "Honda Scoopy",
        km: 18500,
        serviceTerakhir: "2026-07-15",
        serviceBerikutnya: "2026-10-15",
        kpb: "KPB 4",
        optin: true,
        status: "Aktif"
    },
    {
        id: "CUS0004",
        nama: "Dedi Irawan",
        noWa: "628555666777",
        noPolisi: "F 9999 EF",
        motor: "Honda PCX 160",
        km: 32000,
        serviceTerakhir: "2026-04-10",
        serviceBerikutnya: "2026-05-10",
        kpb: "",
        optin: false,
        status: "Lost"
    },
    {
        id: "CUS0005",
        nama: "Siti Rahma",
        noWa: "628777888999",
        noPolisi: "F 2222 GH",
        motor: "Honda Genio",
        km: 6500,
        serviceTerakhir: "2026-09-20",
        serviceBerikutnya: "2026-10-20",
        kpb: "KPB 1",
        optin: true,
        status: "Aktif"
    }
];


// ======================================
// DATABASE LOCAL STORAGE
// ======================================

function initializeDatabase() {

    try {

        const existingData =
            localStorage.getItem(CUSTOMER_KEY);

        if (!existingData) {

            localStorage.setItem(
                CUSTOMER_KEY,
                JSON.stringify(sampleCustomers)
            );
        }

    } catch (error) {

        console.error(
            "Gagal menginisialisasi database:",
            error
        );

    }
}


function getCustomers() {

    try {

        const data =
            localStorage.getItem(CUSTOMER_KEY);

        if (!data) {
            return [];
        }

        const customers =
            JSON.parse(data);

        return Array.isArray(customers)
            ? customers
            : [];

    } catch (error) {

        console.error(
            "Gagal membaca database customer:",
            error
        );

        return [];
    }
}


function saveCustomers(customers) {

    try {

        localStorage.setItem(
            CUSTOMER_KEY,
            JSON.stringify(customers)
        );

        if (window.crmAuth?.user) {
            window.crmAuth.request("/customers", { method: "PUT", body: JSON.stringify({ customers }) })
                .catch(error => alert(`Data tersimpan di browser, tetapi sinkronisasi server gagal: ${error.message}`));
        }

        return true;

    } catch (error) {

        console.error(
            "Gagal menyimpan database customer:",
            error
        );

        alert(
            "❌ Data gagal disimpan."
        );

        return false;
    }
}


// ======================================
// NAVIGASI HALAMAN
// ======================================

window.showPage = function(pageId) {

    const pages =
        document.querySelectorAll(".page");

    pages.forEach(page => {

        page.classList.remove("active");

    });


    const selectedPage =
        document.getElementById(pageId);

    if (selectedPage) {

        selectedPage.classList.add("active");

    }


    const menus =
        document.querySelectorAll(".menu-item");

    menus.forEach(menu => {

        menu.classList.remove("active");

        const onclickValue =
            menu.getAttribute("onclick");

        if (
            onclickValue &&
            onclickValue.includes(
                `'${pageId}'`
            )
        ) {

            menu.classList.add("active");

        }

    });


    updatePageTitle(pageId);
};


// ======================================
// JUDUL HALAMAN
// ======================================

function updatePageTitle(pageId) {

    const title =
        document.getElementById("page-title");

    const titles = {

        dashboard: "Dashboard CRM",

        customer: "Database Customer",

        segmentasi: "Segmentasi Customer",

        campaign: "Campaign WhatsApp",

        template: "Template Pesan",

        followup: "Follow-up Customer",

        log: "Log Pesan"

    };


    if (
        title &&
        titles[pageId]
    ) {

        title.textContent =
            titles[pageId];

    }
}


// ======================================
// FORM CUSTOMER
// ======================================

// BUKA FORM CUSTOMER
window.openCustomerForm = function() {

    const formContainer =
        document.getElementById(
            "customerForm"
        );


    if (!formContainer) {

        console.error(
            "Element #customerForm tidak ditemukan."
        );

        return;
    }


    formContainer.classList.remove(
        "hidden"
    );


    // Scroll ke form
    formContainer.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

};


// TUTUP / BATAL FORM CUSTOMER
window.closeCustomerForm = function() {

    const formContainer =
        document.getElementById(
            "customerForm"
        );

    const form =
        document.getElementById(
            "addCustomerForm"
        );


    if (!formContainer) {

        console.error(
            "Element #customerForm tidak ditemukan."
        );

        return;
    }


    // Sembunyikan form
    formContainer.classList.add(
        "hidden"
    );


    // Reset form
    if (form) {

        form.reset();

        delete form.dataset.editingId;

    }


    // Kembalikan judul ke mode tambah
    const formTitle =
        document.querySelector(
            "#customerForm h3"
        );


    if (formTitle) {

        formTitle.textContent =
            "Tambah Customer Baru";

    }

};


// ======================================
// TAMPILKAN DATA CUSTOMER
// ======================================

function renderCustomerRows(customers) {

    const table =
        document.getElementById(
            "customerTable"
        );


    if (!table) {
        return;
    }


    if (
        !Array.isArray(customers) ||
        customers.length === 0
    ) {

        table.innerHTML = `
            <tr>
                <td
                    colspan="9"
                    class="empty-table"
                >
                    Customer tidak ditemukan
                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML =
        customers.map((customer, index) => {

            const optinBadge =
                customer.optin

                    ? `
                        <span style="
                            background:#dcfce7;
                            color:#166534;
                            padding:4px 8px;
                            border-radius:5px;
                            font-size:11px;
                        ">
                            Ya
                        </span>
                    `

                    : `
                        <span style="
                            background:#fee2e2;
                            color:#991b1b;
                            padding:4px 8px;
                            border-radius:5px;
                            font-size:11px;
                        ">
                            Tidak
                        </span>
                    `;


            const statusBadge =
                customer.status === "Aktif"

                    ? `
                        <span style="
                            background:#dcfce7;
                            color:#166534;
                            padding:4px 8px;
                            border-radius:5px;
                            font-size:11px;
                        ">
                            Aktif
                        </span>
                    `

                    : `
                        <span style="
                            background:#fee2e2;
                            color:#991b1b;
                            padding:4px 8px;
                            border-radius:5px;
                            font-size:11px;
                        ">
                            Lost
                        </span>
                    `;


            return `
                <tr>

                    <td>${index + 1}</td>
                    <td>${customer.id || ""}</td>
                    <td><strong>${customer.nama || ""}</strong></td>
                    <td>${customer.noWa || ""}</td>
                    <td>${customer.kpb || "-"}</td>
                    <td>${formatCustomerDate(customer.serviceTerakhir)}</td>
                    <td>${formatCustomerDate(getCustomerReturnDate(customer))}</td>
                    <td>${customer.motor || ""}</td>

                    <td>

                        <div class="action-buttons">

                            <button
                                type="button"
                                class="btn-action edit"
                                onclick="editCustomer('${customer.id}')"
                                title="Edit Customer"
                            >
                                ✏️
                            </button>

                            <button
                                type="button"
                                class="btn-action delete"
                                onclick="deleteCustomer('${customer.id}')"
                                title="Hapus Customer"
                            >
                                🗑️
                            </button>

                        </div>

                    </td>

                </tr>
            `;

        }).join("");

}


function renderCustomers() {

    const customers =
        getCustomers();

    renderCustomerRows(
        customers
    );

    updateCustomerDashboard(customers);

}

function formatCustomerDate(value) {
    if (!value) return "-";
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString("id-ID");
}

function addMonthsToISODate(value, months = 2) {
    if (!value) return "";
    const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return "";
    const year = Number(match[1]), month = Number(match[2]) - 1, day = Number(match[3]);
    const targetMonthIndex = month + months;
    const targetYear = year + Math.floor(targetMonthIndex / 12);
    const targetMonth = targetMonthIndex % 12;
    const targetDay = Math.min(day, new Date(targetYear, targetMonth + 1, 0).getDate());
    return `${targetYear}-${String(targetMonth + 1).padStart(2, "0")}-${String(targetDay).padStart(2, "0")}`;
}

function getCustomerReturnDate(customer) {
    return customer.serviceTerakhir
        ? addMonthsToISODate(customer.serviceTerakhir, 2)
        : (customer.serviceBerikutnya || "");
}

function updateCustomerDashboard(customers = getCustomers()) {
    const total = customers.length;
    const active = customers.filter(customer => customer.status === "Aktif").length;
    const optin = customers.filter(customer => customer.optin === true).length;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reminder = customers.filter(customer => {
        const returnDate = getCustomerReturnDate(customer);
        if (!returnDate) return false;
        const date = new Date(`${returnDate}T00:00:00`);
        if (Number.isNaN(date.getTime())) return false;
        date.setHours(0, 0, 0, 0);
        const days = Math.ceil((date - today) / 86400000);
        return days >= 0 && days <= 7;
    }).length;

    const values = {
        customerDashboardTotal: total,
        customerDashboardActive: active,
        customerDashboardOptin: optin,
        customerDashboardReminder: reminder
    };
    Object.entries(values).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value.toLocaleString("id-ID");
    });
}

function normalizeImportHeader(value) {
    return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function importCell(row, aliases) {
    const keys = Object.keys(row);
    const matched = keys.find(key => aliases.includes(normalizeImportHeader(key)));
    return matched === undefined ? "" : row[matched];
}

function excelDateToISO(value) {
    if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
    if (typeof value === "number" && window.XLSX) {
        const date = window.XLSX.SSF.parse_date_code(value);
        if (date) return `${date.y}-${String(date.m).padStart(2, "0")}-${String(date.d).padStart(2, "0")}`;
    }
    const text = String(value || "").trim();
    if (!text) return "";
    let match = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (match) return `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`;
    const date = new Date(text);
    return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function parseImportedBoolean(value, defaultValue = false) {
    if (typeof value === "boolean") return value;
    const normalized = String(value ?? "").trim().toLowerCase();
    if (!normalized) return defaultValue;
    return ["ya", "yes", "true", "1", "opt-in", "optin", "bersedia"].includes(normalized);
}

function setupCustomerExcelImport() {
    const button = document.getElementById("btnImportCustomers");
    if (!button || button.dataset.initialized === "true") return;
    button.dataset.initialized = "true";
    button.addEventListener("click", async () => {
        const input = document.getElementById("customerExcelFile");
        const message = document.getElementById("customerImportMessage");
        const file = input?.files?.[0];
        if (!file) {
            message.textContent = "Pilih file Excel terlebih dahulu.";
            message.className = "customer-import-message error";
            return;
        }
        if (!/\.xlsx?$/i.test(file.name)) {
            message.textContent = "Format file harus .xls atau .xlsx.";
            message.className = "customer-import-message error";
            return;
        }
        if (!window.XLSX) {
            message.textContent = "Pembaca Excel belum termuat. Periksa koneksi internet lalu muat ulang halaman.";
            message.className = "customer-import-message error";
            return;
        }
        try {
            const workbook = window.XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: true });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = window.XLSX.utils.sheet_to_json(sheet, { defval: "", raw: true });
            if (!rows.length) throw new Error("Sheet pertama tidak berisi baris data.");

            const customers = getCustomers();
            let nextId = customers.reduce((max, customer) => {
                const number = Number(String(customer.id || "").replace(/\D/g, ""));
                return Number.isFinite(number) ? Math.max(max, number) : max;
            }, 0) + 1;
            const imported = rows.map(row => {
                const providedId = String(importCell(row, ["id", "idcustomer", "kodecustomer", "kodepelanggan"]) || "").trim();
                const nama = String(importCell(row, ["nama", "namacustomer", "namapelanggan", "customer", "name"]) || "").trim();
                const noWa = String(importCell(row, ["nowa", "nowhatsapp", "nohp", "nomorhp", "nomorhandphone", "whatsapp", "telepon", "phone"]) || "").trim();
                if (!nama) return null;
                const kmValue = importCell(row, ["km", "kilometer", "odometer"]);
                const statusValue = String(importCell(row, ["status", "statuscustomer"]) || "Aktif").trim().toLowerCase();
                const kpb = String(importCell(row, ["kpb", "jeniskpb", "jenisservice", "servis", "service"]) || "").trim();
                return {
                    noUrut: String(importCell(row, ["no", "nomor"]) || "").trim(),
                    id: providedId || `CUS${String(nextId++).padStart(4, "0")}`,
                    nama,
                    noWa,
                    noPolisi: String(importCell(row, ["nopolisi", "nopol", "plat", "nomorpolisi", "licenseplate"]) || "").trim(),
                    motor: String(importCell(row, ["motor", "tipemotor", "typemotor", "kendaraan", "vehicle"]) || "").trim(),
                    km: Number(String(kmValue || 0).replace(/[^\d.-]/g, "")) || 0,
                    serviceTerakhir: excelDateToISO(importCell(row, ["serviceterakhir", "tanggalservice", "tglservice", "tanggalserviceterakhir", "lastservice", "tanggalterakhirservice"])),
                    serviceBerikutnya: "",
                    kpb,
                    optin: parseImportedBoolean(importCell(row, ["optin", "optinwa", "bersediawa"]), false),
                    status: statusValue.includes("lost") ? "Lost" : "Aktif"
                };
            }).filter(Boolean);
            imported.forEach(customer => {
                const returnDateFromFile = excelDateToISO(importCell(rows.find(row => String(importCell(row, ["id", "idcustomer", "kodecustomer", "kodepelanggan"]) || "").trim() === customer.id) || {}, ["serviceberikutnya", "jadwalservice", "tanggalserviceberikutnya", "tanggalservicekembali", "tglservicekembali", "tglserviceberikutnya", "tglservicedisistem", "servicereturnbulan", "nextservice"]));
                customer.serviceBerikutnya = customer.serviceTerakhir
                    ? addMonthsToISODate(customer.serviceTerakhir, 2)
                    : returnDateFromFile;
            });
            if (!imported.length) throw new Error("Tidak ada baris dengan kolom Nama yang terisi.");

            const existingIds = new Set(customers.map(customer => String(customer.id)));
            const uniqueImported = imported.map(customer => {
                if (existingIds.has(String(customer.id))) customer.id = `CUS${String(nextId++).padStart(4, "0")}`;
                existingIds.add(String(customer.id));
                return customer;
            });
            if (!saveCustomers([...customers, ...uniqueImported])) return;
            renderCustomers();
            updateDashboard();
            if (typeof setupCustomerSearch === "function") {
                const search = document.getElementById("searchCustomer");
                if (search) search.dispatchEvent(new Event("input"));
            }
            message.textContent = `${uniqueImported.length} customer berhasil ditambahkan dari ${rows.length} baris.`;
            message.className = "customer-import-message success";
            input.value = "";
        } catch (error) {
            console.error("Gagal mengimpor file Excel:", error);
            message.textContent = `Gagal membaca file: ${error.message || "pastikan format dan header kolom benar."}`;
            message.className = "customer-import-message error";
        }
    });
}

function setupFollowupFilter() {
    const filter = document.getElementById("followupStatusFilter");
    if (!filter || filter.dataset.initialized === "true") return;
    filter.dataset.initialized = "true";
    filter.addEventListener("change", () => renderFollowupLists());
}


// ======================================
// DASHBOARD
// ======================================

function updateDashboard() {

    const customers =
        getCustomers();

    renderFollowupLists(customers);
    renderMessageLog();
    updateCampaignStats();
    updateFollowupReport();
    const reminderGroups = getReminderGroups(customers);
    const reminderCounts = {
        reminderOverdue: reminderGroups.overdue.length,
        reminderToday: reminderGroups.today.length,
        reminderH3: reminderGroups.h3.length,
        reminderH7: reminderGroups.h7.length
    };
    Object.entries(reminderCounts).forEach(([id, count]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = count.toLocaleString("id-ID");
    });


    // ==================================
    // TOTAL CUSTOMER
    // ==================================

    const totalCustomer =
        customers.length;

    const totalCustomerElement =
        document.getElementById(
            "totalCustomer"
        );

    if (totalCustomerElement) {

        totalCustomerElement.textContent =
            totalCustomer;

    }


    // ==================================
    // TOTAL OPT-IN
    // ==================================

    const totalOptin =
        customers.filter(
            customer =>
                customer.optin === true
        ).length;

    const totalOptinElement =
        document.getElementById(
            "totalOptin"
        );

    if (totalOptinElement) {

        totalOptinElement.textContent =
            totalOptin;

    }


    // ==================================
    // REMINDER SERVICE
    // ==================================

    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );


    const reminder =
        customers.filter(customer => {

            if (
                !customer.serviceBerikutnya
            ) {

                return false;

            }


            const serviceDate =
                new Date(
                    customer.serviceBerikutnya
                );


            if (
                isNaN(
                    serviceDate.getTime()
                )
            ) {

                return false;

            }


            serviceDate.setHours(
                0,
                0,
                0,
                0
            );


            const difference =
                Math.ceil(
                    (
                        serviceDate -
                        today
                    ) /
                    (
                        1000 *
                        60 *
                        60 *
                        24
                    )
                );


            return difference <= 7;

        }).length;


    const reminderElement =
        document.getElementById(
            "totalReminder"
        );


    if (reminderElement) {

        reminderElement.textContent =
            reminder;

    }


    // ==================================
    // CUSTOMER LOST
    // ==================================

    const lost =
        customers.filter(
            customer =>
                customer.status === "Lost"
        ).length;


    const lostElement =
        document.getElementById(
            "totalLost"
        );


    if (lostElement) {

        lostElement.textContent =
            lost;

    }


    // ==================================
    // SEGMENT SERVICE
    // ==================================

    const segmentService =
        document.getElementById(
            "segmentService"
        );


    if (segmentService) {

        segmentService.textContent =
            reminder;

    }


    // ==================================
    // SEGMENT LOST
    // ==================================

    const segmentLost =
        document.getElementById(
            "segmentLost"
        );


    if (segmentLost) {

        segmentLost.textContent =
            lost;

    }


    // ==================================
    // SEGMENT KPB
    // ==================================

    const kpb =
        customers.filter(
            customer =>
                customer.kpb &&
                customer.kpb.trim() !== ""
        ).length;


    const segmentKPB =
        document.getElementById(
            "segmentKPB"
        );


    if (segmentKPB) {

        segmentKPB.textContent =
            kpb;

    }

}


// ======================================
// SEARCH CUSTOMER
// ======================================

function setupCustomerSearch() {

    const searchInput =
        document.getElementById(
            "searchCustomer"
        );


    const filterOptin =
        document.getElementById(
            "filterOptin"
        );


    if (!searchInput) {
        return;
    }


    function filterCustomer() {

        const keyword =
            searchInput.value
                .toLowerCase()
                .trim();


        const filter =
            filterOptin
                ? filterOptin.value
                : "";


        const customers =
            getCustomers();


        const filtered =
            customers.filter(
                customer => {

                    const nama =
                        String(
                            customer.nama || ""
                        ).toLowerCase();


                    const noPolisi =
                        String(
                            customer.noPolisi || ""
                        ).toLowerCase();


                    const noWa =
                        String(
                            customer.noWa || ""
                        ).toLowerCase();


                    const matchKeyword =
                        nama.includes(
                            keyword
                        ) ||

                        noPolisi.includes(
                            keyword
                        ) ||

                        noWa.includes(
                            keyword
                        );


                    let matchOptin =
                        true;


                    if (
                        filter === "ya"
                    ) {

                        matchOptin =
                            customer.optin === true;

                    }


                    if (
                        filter === "tidak"
                    ) {

                        matchOptin =
                            customer.optin === false;

                    }


                    return (
                        matchKeyword &&
                        matchOptin
                    );

                }
            );


        renderCustomerRows(
            filtered
        );

    }


    searchInput.addEventListener(
        "input",
        filterCustomer
    );


    if (filterOptin) {

        filterOptin.addEventListener(
            "change",
            filterCustomer
        );

    }

}


// ======================================
// EDIT CUSTOMER
// ======================================

window.editCustomer = function(customerId) {

    const customers =
        getCustomers();


    const customer =
        customers.find(
            item =>
                item.id === customerId
        );


    if (!customer) {

        alert(
            "Customer tidak ditemukan."
        );

        return;
    }


    // ==================================
    // ISI FORM
    // ==================================

    const customerName =
        document.getElementById(
            "customerName"
        );

    const customerPhone =
        document.getElementById(
            "customerPhone"
        );

    const customerPlate =
        document.getElementById(
            "customerPlate"
        );

    const customerMotor =
        document.getElementById(
            "customerMotor"
        );

    const customerKm =
        document.getElementById(
            "customerKm"
        );

    const lastService =
        document.getElementById(
            "lastService"
        );

    const nextService =
        document.getElementById(
            "nextService"
        );

    const customerKpb =
        document.getElementById(
            "customerKpb"
        );

    const customerOptin =
        document.getElementById(
            "customerOptin"
        );

    const customerStatus =
        document.getElementById(
            "customerStatus"
        );


    if (customerName) {

        customerName.value =
            customer.nama || "";

    }


    if (customerPhone) {

        customerPhone.value =
            customer.noWa || "";

    }


    if (customerPlate) {

        customerPlate.value =
            customer.noPolisi || "";

    }


    if (customerMotor) {

        customerMotor.value =
            customer.motor || "";

    }


    if (customerKm) {

        customerKm.value =
            customer.km || "";

    }


    if (lastService) {

        lastService.value =
            customer.serviceTerakhir || "";

    }


    if (nextService) {

        nextService.value =
            customer.serviceBerikutnya || "";

    }


    if (customerKpb) {

        customerKpb.value =
            customer.kpb || "";

    }


    if (customerOptin) {

        customerOptin.value =
            customer.optin
                ? "true"
                : "false";

    }


    if (customerStatus) {

        customerStatus.value =
            customer.status || "Aktif";

    }


    // ==================================
    // SET MODE EDIT
    // ==================================

    const form =
        document.getElementById(
            "addCustomerForm"
        );


    if (!form) {

        alert(
            "Form customer tidak ditemukan."
        );

        return;
    }


    form.dataset.editingId =
        customerId;


    // ==================================
    // UBAH JUDUL FORM
    // ==================================

    const formTitle =
        document.querySelector(
            "#customerForm h3"
        );


    if (formTitle) {

        formTitle.textContent =
            "Edit Customer";

    }


    // ==================================
    // BUKA FORM
    // ==================================

    openCustomerForm();

};


// ======================================
// SETUP FORM CUSTOMER
// ======================================

function setupCustomerForm() {

    const form =
        document.getElementById(
            "addCustomerForm"
        );


    if (!form) {

        console.warn(
            "Form #addCustomerForm tidak ditemukan."
        );

        return;
    }


    // Mencegah listener submit
    // terpasang dua kali
    if (
        form.dataset.initialized === "true"
    ) {

        return;
    }


    form.dataset.initialized =
        "true";


    form.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const customers =
                getCustomers();


            const editingId =
                form.dataset.editingId;


            // ==================================
            // AMBIL NILAI FORM
            // ==================================

            const nama =
                document.getElementById(
                    "customerName"
                )?.value
                    .trim() || "";


            const noWa =
                document.getElementById(
                    "customerPhone"
                )?.value
                    .trim() || "";


            const noPolisi =
                document.getElementById(
                    "customerPlate"
                )?.value
                    .trim()
                    .toUpperCase() || "";


            const motor =
                document.getElementById(
                    "customerMotor"
                )?.value
                    .trim() || "";


            const km =
                Number(
                    document.getElementById(
                        "customerKm"
                    )?.value || 0
                );


            const serviceTerakhir =
                document.getElementById(
                    "lastService"
                )?.value || "";


            const serviceBerikutnya =
                document.getElementById(
                    "nextService"
                )?.value || "";


            const kpb =
                document.getElementById(
                    "customerKpb"
                )?.value || "";


            const optin =
                document.getElementById(
                    "customerOptin"
                )?.value === "true";


            const status =
                document.getElementById(
                    "customerStatus"
                )?.value || "Aktif";


            // ==================================
            // VALIDASI DASAR
            // ==================================

            if (!nama) {

                alert(
                    "⚠️ Nama customer wajib diisi."
                );

                return;
            }


            if (!noWa) {

                alert(
                    "⚠️ Nomor WhatsApp wajib diisi."
                );

                return;
            }


            // ==================================
            // MODE EDIT
            // ==================================

            if (editingId) {

                const index =
                    customers.findIndex(
                        customer =>
                            customer.id ===
                            editingId
                    );


                if (index === -1) {

                    alert(
                        "Customer tidak ditemukan."
                    );

                    return;
                }


                customers[index] = {

                    ...customers[index],

                    nama,

                    noWa,

                    noPolisi,

                    motor,

                    km,

                    serviceTerakhir,

                    serviceBerikutnya: serviceTerakhir
                        ? addMonthsToISODate(serviceTerakhir, 2)
                        : serviceBerikutnya,

                    kpb,

                    optin,

                    status

                };


                if (
                    !saveCustomers(
                        customers
                    )
                ) {

                    return;

                }


                renderCustomers();

                updateDashboard();


                // RESET MODE EDIT
                delete form.dataset.editingId;

                form.reset();


                // TUTUP FORM
                closeCustomerForm();


                alert(
                    "✅ Data customer berhasil diperbarui!"
                );


                return;

            }


            // ==================================
            // MODE TAMBAH CUSTOMER
            // ==================================

            const maxNumber =
                customers.reduce(
                    (max, customer) => {

                        const number =
                            parseInt(
                                String(
                                    customer.id || ""
                                ).replace(
                                    "CUS",
                                    ""
                                ),
                                10
                            ) || 0;


                        return Math.max(
                            max,
                            number
                        );

                    },
                    0
                );


            const newNumber =
                maxNumber + 1;


            const newCustomer = {

                id:
                    "CUS" +
                    String(
                        newNumber
                    ).padStart(
                        4,
                        "0"
                    ),

                nama,

                noWa,

                noPolisi,

                motor,

                km,

                serviceTerakhir,

                serviceBerikutnya: serviceTerakhir
                    ? addMonthsToISODate(serviceTerakhir, 2)
                    : serviceBerikutnya,

                kpb,

                optin,

                status

            };


            customers.push(
                newCustomer
            );


            if (
                !saveCustomers(
                    customers
                )
            ) {

                return;

            }


            renderCustomers();

            updateDashboard();


            // RESET FORM
            form.reset();

            delete form.dataset.editingId;


            // TUTUP FORM
            closeCustomerForm();


            alert(
                "✅ Customer berhasil ditambahkan!"
            );

        }
    );

}


// ======================================
// HAPUS CUSTOMER
// ======================================

window.deleteCustomer = function(customerId) {

    const customers =
        getCustomers();


    const customer =
        customers.find(
            item =>
                item.id === customerId
        );


    if (!customer) {

        alert(
            "Customer tidak ditemukan."
        );

        return;
    }


    const confirmDelete =
        confirm(
            `Apakah bro yakin ingin menghapus customer "${customer.nama}"?`
        );


    if (!confirmDelete) {

        return;

    }


    const updatedCustomers =
        customers.filter(
            item =>
                item.id !== customerId
        );


    if (
        !saveCustomers(
            updatedCustomers
        )
    ) {

        return;

    }


    renderCustomers();

    updateDashboard();


    alert(
        "🗑️ Customer berhasil dihapus."
    );

};


// ======================================
// EVENT BUTTON FORM
// ======================================

function setupFormButtons() {

    // Tombol tutup
    const closeButton =
        document.getElementById(
            "btnCloseCustomerForm"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            function(event) {

                event.preventDefault();

                closeCustomerForm();

            }
        );

    }


    // Tombol batal
    const cancelButton =
        document.getElementById(
            "btnCancelCustomerForm"
        );


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            function(event) {

                event.preventDefault();

                closeCustomerForm();

            }
        );

    }


    // Tombol customer baru
    const openButton =
        document.getElementById(
            "btnOpenCustomerForm"
        );


    if (openButton) {

        openButton.addEventListener(
            "click",
            function(event) {

                event.preventDefault();

                // Pastikan form dalam kondisi bersih
                closeCustomerForm();

                openCustomerForm();

            }
        );

    }

}


// ======================================
// INITIALIZE APP
// ======================================

function initializeApp() {

    if (window.crmAuth?.ready) {
        window.crmAuth.ready.then(allowed => {
            if (allowed) initializeAppAfterAuth();
        });
        return;
    }

    initializeAppAfterAuth();
}

function initializeAppAfterAuth() {

    console.log(
        "🚀 CRM AHASS Slawi II sedang dijalankan..."
    );


    // Database
    if (!window.crmAuth?.user) initializeDatabase();


    // Customer
    renderCustomers();

    // Import Excel customer
    setupCustomerExcelImport();
    setupFollowupFilter();
    setupFollowupReport();


    // Dashboard
    updateDashboard();


    // Search
    setupCustomerSearch();


    // Form
    setupCustomerForm();


    // Tombol form
    setupFormButtons();

    setupCampaignFeatures();


    console.log(
        "✅ CRM AHASS berhasil dijalankan."
    );

}


// ======================================
// START APPLICATION
// ======================================

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeApp
    );

} else {

    initializeApp();

}

document.addEventListener("crm:data-ready", () => {
    initializeDatabase();
    renderCustomers();
    updateDashboard();
    setupCampaignFeatures();
});

// ======================================
// CAMPAIGN DAN TEMPLATE PESAN
// ======================================

const defaultMessageTemplates = [
    {
        id: "TPL_REMINDER_SERVICE",
        name: "Reminder Service",
        content: "Halo [NAMA] 👋\n\nKami dari AHASS SLAWI II mengingatkan jadwal service [MOTOR] dengan nomor polisi [NO_POLISI].\n\nSilakan lakukan service agar kendaraan tetap prima."
    },
    {
        id: "TPL_PROMO",
        name: "Promo AHASS",
        content: "Halo [NAMA] 👋\n\nAda promo menarik dari AHASS SLAWI II untuk motor [MOTOR] Anda. Hubungi kami untuk informasi dan booking service."
    }
];

function readStoredList(key, fallback = []) {
    try {
        const value = JSON.parse(localStorage.getItem(key) || "null");
        return Array.isArray(value) ? value : fallback;
    } catch {
        return fallback;
    }
}

function getMessageTemplates() {
    return readStoredList(MESSAGE_TEMPLATE_KEY, defaultMessageTemplates);
}

function saveMessageTemplates(templates) {
    localStorage.setItem(MESSAGE_TEMPLATE_KEY, JSON.stringify(templates));
}

function getCampaigns() {
    return readStoredList(CAMPAIGN_KEY, []);
}

function saveCampaigns(campaigns) {
    localStorage.setItem(CAMPAIGN_KEY, JSON.stringify(campaigns));
}

function renderTemplateOptions() {
    const select = document.getElementById("campaignTemplate");
    if (!select) return;
    const selected = select.value;
    const templates = getMessageTemplates();
    select.innerHTML = `<option value="">Pilih template...</option>${templates.map(template => `<option value="${escapeHtml(template.id)}">${escapeHtml(template.name)}</option>`).join("")}`;
    select.value = templates.some(template => template.id === selected) ? selected : (templates[0]?.id || "");
    renderCampaignPreview();
}

function renderTemplateList() {
    const container = document.getElementById("templateList");
    if (!container) return;
    const templates = getMessageTemplates();
    if (!templates.length) {
        container.innerHTML = `<div class="empty-state"><div class="empty-icon">📝</div><h3>Belum ada template</h3><p>Tekan + Template Baru untuk membuat pesan WhatsApp.</p></div>`;
        return;
    }
    container.innerHTML = `<div class="table-container"><table class="reminder-table"><thead><tr><th>Nama Template</th><th>Isi Pesan</th><th>Aksi</th></tr></thead><tbody>${templates.map(template => `<tr><td><strong>${escapeHtml(template.name)}</strong></td><td style="white-space: pre-wrap;">${escapeHtml(template.content)}</td><td><button type="button" class="btn-secondary" onclick="editMessageTemplate('${escapeHtml(template.id)}')">Edit</button> <button type="button" class="btn-secondary" onclick="deleteMessageTemplate('${escapeHtml(template.id)}')">Hapus</button></td></tr>`).join("")}</tbody></table></div>`;
}

function replaceMessageVariables(message, customer = {}) {
    return String(message || "")
        .replaceAll("[NAMA]", customer.nama || "Nama Customer")
        .replaceAll("[MOTOR]", customer.motor || "Motor Anda")
        .replaceAll("[NO_POLISI]", customer.noPolisi || "Nomor Polisi");
}

function renderCampaignPreview() {
    const target = document.getElementById("campaignPreviewText");
    const templateId = document.getElementById("campaignTemplate")?.value;
    const template = getMessageTemplates().find(item => item.id === templateId);
    if (!target) return;
    const preview = template ? replaceMessageVariables(template.content) : "Pilih template untuk melihat preview pesan.";
    target.innerHTML = `<p style="white-space: pre-wrap;">${escapeHtml(preview)}</p>`;
}

function campaignRecipientCount(segment) {
    const customers = getCustomers().filter(customer => customer.optin && customer.noWa);
    if (segment === "Customer Lost") return customers.filter(customer => customer.status === "Lost").length;
    if (segment === "KPB") return customers.filter(customer => customer.kpb).length;
    if (segment === "Promo") return customers.filter(customer => customer.status !== "Lost").length;
    return customers.filter(customer => customer.status !== "Lost").length;
}

function renderCampaignList() {
    const container = document.getElementById("campaignList");
    if (!container) return;
    const campaigns = getCampaigns();
    container.innerHTML = campaigns.length
        ? `<h3>Antrean Campaign</h3><div class="table-container"><table class="reminder-table"><thead><tr><th>Campaign</th><th>Segment</th><th>Template</th><th>Penerima</th><th>Status</th></tr></thead><tbody>${campaigns.map(campaign => `<tr><td><strong>${escapeHtml(campaign.name)}</strong></td><td>${escapeHtml(campaign.segment)}</td><td>${escapeHtml(campaign.templateName)}</td><td>${campaign.recipientCount}</td><td>${escapeHtml(campaign.status)}</td></tr>`).join("")}</tbody></table></div>`
        : `<div class="empty-state"><div class="empty-icon">📢</div><h3>Antrean campaign masih kosong</h3><p>Isi nama, segment, dan template lalu tekan Masukkan ke Antrean.</p></div>`;
}

function setupCampaignFeatures() {
    const campaignButton = document.getElementById("newCampaignButton");
    const templateButton = document.getElementById("newTemplateButton");
    if (!campaignButton || campaignButton.dataset.initialized === "true") return;
    campaignButton.dataset.initialized = "true";

    campaignButton.addEventListener("click", () => {
        document.getElementById("campaignName").value = "";
        document.getElementById("campaignTemplate").value = getMessageTemplates()[0]?.id || "";
        renderCampaignPreview();
        document.getElementById("campaignName").focus();
    });
    document.getElementById("campaignTemplate")?.addEventListener("change", renderCampaignPreview);
    document.getElementById("previewCampaignButton")?.addEventListener("click", renderCampaignPreview);
    document.getElementById("queueCampaignButton")?.addEventListener("click", () => {
        const name = document.getElementById("campaignName").value.trim();
        const segment = document.getElementById("campaignSegment").value;
        const template = getMessageTemplates().find(item => item.id === document.getElementById("campaignTemplate").value);
        if (!name) return alert("Isi nama campaign terlebih dahulu.");
        if (!template) return alert("Pilih template pesan terlebih dahulu.");
        const campaign = { id: `CMP${Date.now()}`, name, segment, templateId: template.id, templateName: template.name, recipientCount: campaignRecipientCount(segment), status: "Dalam antrean", createdAt: new Date().toISOString() };
        saveCampaigns([campaign, ...getCampaigns()]);
        renderCampaignList();
        alert(`Campaign ${name} sudah masuk antrean untuk ${campaign.recipientCount} customer yang opt-in WhatsApp.`);
    });
    templateButton?.addEventListener("click", () => openTemplateForm());
    document.getElementById("cancelTemplateButton")?.addEventListener("click", closeTemplateForm);
    document.getElementById("saveTemplateButton")?.addEventListener("click", saveTemplateForm);
    renderTemplateOptions();
    renderTemplateList();
    renderCampaignList();
}

function openTemplateForm(template = null) {
    const form = document.getElementById("templateForm");
    if (!form) return;
    form.hidden = false;
    form.dataset.editingId = template?.id || "";
    document.getElementById("templateName").value = template?.name || "";
    document.getElementById("templateContent").value = template?.content || "";
    document.getElementById("templateName").focus();
}

function closeTemplateForm() {
    const form = document.getElementById("templateForm");
    if (form) form.hidden = true;
}

function saveTemplateForm() {
    const form = document.getElementById("templateForm");
    const name = document.getElementById("templateName").value.trim();
    const content = document.getElementById("templateContent").value.trim();
    if (!name || !content) return alert("Nama dan isi template wajib diisi.");
    const templates = getMessageTemplates();
    const editingId = form.dataset.editingId;
    const template = { id: editingId || `TPL${Date.now()}`, name, content };
    const next = editingId ? templates.map(item => item.id === editingId ? template : item) : [template, ...templates];
    saveMessageTemplates(next);
    closeTemplateForm();
    renderTemplateOptions();
    renderTemplateList();
}

window.editMessageTemplate = function(id) {
    openTemplateForm(getMessageTemplates().find(template => template.id === id));
};

window.deleteMessageTemplate = function(id) {
    const template = getMessageTemplates().find(item => item.id === id);
    if (!template || !confirm(`Hapus template "${template.name}"?`)) return;
    saveMessageTemplates(getMessageTemplates().filter(item => item.id !== id));
    renderTemplateOptions();
    renderTemplateList();
};

function getReminderGroups(customers = getCustomers()) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const groups = { overdue: [], today: [], h3: [], h7: [], notDue: [], noDate: [] };
    customers.forEach(customer => {
        const returnDate = getCustomerReturnDate(customer);
        if (!returnDate) { groups.noDate.push(customer); return; }
        const date = new Date(`${returnDate}T00:00:00`);
        if (Number.isNaN(date.getTime())) { groups.noDate.push(customer); return; }
        const days = Math.round((date - today) / 86400000);
        const item = { customer, date, days };
        if (days < 0) groups.overdue.push(item);
        else if (days === 0) groups.today.push(item);
        else if (days <= 3) groups.h3.push(item);
        else if (days <= 7) groups.h7.push(item);
        else groups.notDue.push(item);
    });
    Object.values(groups).forEach(items => items.sort((a, b) => a.date - b.date));
    return groups;
}

function renderFollowupLists(customers = getCustomers()) {
    const groups = getReminderGroups(customers);
    const priorityItems = [...groups.overdue, ...groups.today, ...groups.h3, ...groups.h7];
    const render = (items, limit) => {
        if (!items.length) return `<div class="empty-state"><div class="empty-icon">📞</div><h3>Tidak ada follow-up servis hari ini</h3><p>Customer dengan tanggal service kembali hari ini atau yang sudah lewat akan muncul di sini.</p></div>`;
        return items.slice(0, limit).map(({ customer, date, days }) => {
            const phone = String(customer.noWa || "").replace(/\D/g, "").replace(/^0/, "62");
            const returnDate = getCustomerReturnDate(customer);
            const dateLabel = formatCustomerDate(returnDate);
            const status = days < 0 ? `🔴 TERLAMBAT (${Math.abs(days)} hari)` : days === 0 ? "🟠 HARI INI" : days <= 3 ? `🟡 H-${days}` : `🟢 H-${days}`;
            const message = `Halo ${customer.nama || ""}, kami dari AHASS SLAWI II mengingatkan jadwal service kembali motor ${customer.motor || "Anda"}${customer.noPolisi ? ` dengan nomor polisi ${customer.noPolisi}` : ""} pada ${dateLabel}. Yuk booking service, kami siap membantu. Balas pesan ini untuk memilih jadwal.`;
            const whatsapp = customer.optin && phone
                ? `<a class="btn btn-primary followup-whatsapp" href="https://wa.me/${phone}?text=${encodeURIComponent(message)}" target="_blank" rel="noopener" onclick="recordWhatsAppFollowup('${escapeHtml(String(customer.id))}', event)">💬 WhatsApp</a>`
                : `<span class="followup-no-wa">${phone ? "Belum opt-in WA" : "Nomor WA belum tersedia"}</span>`;
            return `<tr><td><strong>${escapeHtml(customer.nama || "Tanpa nama")}</strong></td><td>${escapeHtml(customer.motor || "-")}</td><td>${escapeHtml(customer.noWa || "-")}</td><td>${escapeHtml(customer.noPolisi || "-")}</td><td>${dateLabel}</td><td>${status}</td><td>${whatsapp}</td></tr>`;
        }).join("");
    };

    const dashboardList = document.getElementById("dashboardFollowupList");
    if (dashboardList) {
        dashboardList.innerHTML = priorityItems.length
            ? `<div class="table-container"><table class="reminder-table"><thead><tr><th>Customer</th><th>Motor</th><th>No. WA</th><th>No. Polisi</th><th>Next Service</th><th>Status</th><th>Aksi</th></tr></thead><tbody>${render(priorityItems, 5)}</tbody></table></div>`
            : `<div class="empty-state"><div class="empty-icon">✅</div><h3>Tidak ada reminder sampai H-7</h3><p>Belum ada customer yang perlu dipersiapkan atau dihubungi.</p></div>`;
    }
    const followupList = document.getElementById("followupList");
    if (followupList) {
        const filter = document.getElementById("followupStatusFilter")?.value || "due";
        let items = priorityItems;
        if (filter === "due") items = [...groups.overdue, ...groups.today];
        else if (groups[filter]) items = groups[filter];
        else if (filter === "all") items = priorityItems;
        else if (filter === "notDue") items = [...groups.notDue.map(item => ({ ...item, days: item.days, reminderStatus: "⚪ BELUM" })), ...groups.noDate.map(customer => ({ customer, date: null, days: null, reminderStatus: "⚪ BELUM" }))];
        if (!items.length) {
            followupList.innerHTML = `<tr><td colspan="7" class="empty-table">Tidak ada customer pada kategori ini.</td></tr>`;
            return;
        }
        if (filter === "notDue") {
            followupList.innerHTML = items.map(({ customer, reminderStatus }) => { const returnDate = getCustomerReturnDate(customer); return `<tr><td><strong>${escapeHtml(customer.nama || "Tanpa nama")}</strong></td><td>${escapeHtml(customer.motor || "-")}</td><td>${escapeHtml(customer.noWa || "-")}</td><td>${escapeHtml(customer.noPolisi || "-")}</td><td>${returnDate ? formatCustomerDate(returnDate) : "-"}</td><td>${reminderStatus}</td><td>-</td></tr>`; }).join("");
        } else {
            followupList.innerHTML = render(items, items.length);
        }
    }
}

function getMessageLogs() {
    try {
        const logs = JSON.parse(localStorage.getItem(MESSAGE_LOG_KEY) || "[]");
        return Array.isArray(logs) ? logs : [];
    } catch (error) {
        console.error("Gagal membaca log pesan:", error);
        return [];
    }
}

function saveMessageLogs(logs) {
    try {
        localStorage.setItem(MESSAGE_LOG_KEY, JSON.stringify(logs));
        if (window.crmAuth?.user) {
            window.crmAuth.request("/logs", { method: "PUT", body: JSON.stringify({ logs }) })
                .catch(error => alert(`Log tersimpan di browser, tetapi sinkronisasi server gagal: ${error.message}`));
        }
        return true;
    } catch (error) {
        console.error("Gagal menyimpan log pesan:", error);
        alert("Log pesan gagal disimpan. Periksa ruang penyimpanan browser.");
        return false;
    }
}

window.recordWhatsAppFollowup = function(customerId, event) {
    if (event) event.preventDefault();
    const customer = getCustomers().find(item => String(item.id) === String(customerId));
    if (!customer) return;
    const logs = getMessageLogs();
    const returnDate = getCustomerReturnDate(customer);
    const entry = {
        id: `MSG${Date.now()}${Math.random().toString(36).slice(2, 7)}`,
        customerId: customer.id,
        nama: customer.nama || "",
        noWa: customer.noWa || "",
        campaign: "Reminder Service",
        tanggal: new Date().toISOString(),
        status: "Menunggu konfirmasi",
        followup: "Menunggu konfirmasi",
        serviceBerikutnya: returnDate
    };
    if (!saveMessageLogs([entry, ...logs])) return;
    renderMessageLog();
    updateCampaignStats();
    updateFollowupReport();
    const phone = String(customer.noWa || "").replace(/\D/g, "").replace(/^0/, "62");
    const dateLabel = formatCustomerDate(returnDate);
    const message = `Halo ${customer.nama || ""}, kami dari AHASS SLAWI II mengingatkan jadwal service kembali motor ${customer.motor || "Anda"}${customer.noPolisi ? ` dengan nomor polisi ${customer.noPolisi}` : ""} pada ${dateLabel}. Yuk booking service, kami siap membantu. Balas pesan ini untuk memilih jadwal.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
};

function renderMessageLog() {
    const table = document.getElementById("messageLog");
    if (!table) return;
    const logs = getMessageLogs();
    if (!logs.length) {
        table.innerHTML = `<tr><td colspan="6" class="empty-table">Belum ada log pesan</td></tr>`;
        return;
    }
    table.innerHTML = logs.map(log => {
        const date = new Date(log.tanggal);
        const dateLabel = Number.isNaN(date.getTime()) ? "-" : date.toLocaleString("id-ID");
        const statusOptions = ["Menunggu konfirmasi", "Terkirim", "Tidak Terkirim", "Dibaca", "Respons", "Booking"];
        return `<tr><td>${escapeHtml(dateLabel)}</td><td><strong>${escapeHtml(log.nama)}</strong><br><small>${escapeHtml(log.noWa)}</small></td><td>${escapeHtml(log.campaign)}</td><td>${escapeHtml(log.status)}</td><td>${escapeHtml(log.followup || "-")}</td><td><select aria-label="Ubah status pesan" onchange="updateMessageLogStatus('${escapeHtml(log.id)}', this.value)">${statusOptions.map(status => `<option value="${status}" ${log.status === status ? "selected" : ""}>${status}</option>`).join("")}</select></td></tr>`;
    }).join("");
}

window.updateMessageLogStatus = function(logId, status) {
    const allowed = ["Menunggu konfirmasi", "Terkirim", "Tidak Terkirim", "Dibaca", "Respons", "Booking"];
    if (!allowed.includes(status)) return;
    const logs = getMessageLogs();
    const log = logs.find(item => item.id === logId);
    if (!log) return;
    log.status = status;
    log.followup = status === "Booking" ? "Booking service" : status === "Respons" ? "Customer membalas" : status === "Dibaca" ? "Pesan dibaca" : status === "Terkirim" ? "Terkirim ke WhatsApp" : status === "Tidak Terkirim" ? "Pengiriman gagal" : "Menunggu konfirmasi";
    log.statusUpdatedAt = new Date().toISOString();
    if (saveMessageLogs(logs)) {
        renderMessageLog();
        updateCampaignStats();
        updateFollowupReport();
    }
};

function updateCampaignStats() {
    const logs = getMessageLogs();
    const values = {
        totalSent: logs.filter(log => ["Terkirim", "Dibaca", "Respons", "Booking"].includes(log.status)).length,
        totalRead: logs.filter(log => ["Dibaca", "Respons", "Booking"].includes(log.status)).length,
        totalResponse: logs.filter(log => ["Respons", "Booking"].includes(log.status)).length,
        totalBooking: logs.filter(log => log.status === "Booking").length
    };
    Object.entries(values).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value.toLocaleString("id-ID");
    });
}

function setupFollowupReport() {
    const mode = document.getElementById("followupReportMode");
    const day = document.getElementById("followupReportDay");
    const month = document.getElementById("followupReportMonth");
    const year = document.getElementById("followupReportYear");
    if (!mode || mode.dataset.initialized === "true") return;
    mode.dataset.initialized = "true";
    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    day.value = localDate;
    month.value = localDate.slice(0, 7);
    year.value = String(now.getFullYear());
    const refresh = () => {
        day.hidden = mode.value !== "day";
        month.hidden = mode.value !== "month";
        year.hidden = mode.value !== "year";
        updateFollowupReport();
    };
    mode.addEventListener("change", refresh);
    day.addEventListener("change", updateFollowupReport);
    month.addEventListener("change", updateFollowupReport);
    year.addEventListener("change", updateFollowupReport);
    refresh();
}

function updateFollowupReport() {
    const mode = document.getElementById("followupReportMode");
    const day = document.getElementById("followupReportDay");
    const month = document.getElementById("followupReportMonth");
    const year = document.getElementById("followupReportYear");
    if (!mode || !day || !month || !year) return;
    const selected = mode.value === "day" ? day.value : mode.value === "month" ? month.value : year.value;
    const logs = getMessageLogs().filter(log => {
        const date = new Date(log.tanggal);
        if (Number.isNaN(date.getTime())) return false;
        const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString();
        return mode.value === "day" ? localDate.slice(0, 10) === selected
            : mode.value === "month" ? localDate.slice(0, 7) === selected
            : localDate.slice(0, 4) === selected;
    });
    const sentStatuses = ["Terkirim", "Dibaca", "Respons", "Booking"];
    const values = {
        reportFollowupTotal: logs.length,
        reportFollowupSent: logs.filter(log => sentStatuses.includes(log.status)).length,
        reportFollowupResponse: logs.filter(log => ["Respons", "Booking"].includes(log.status)).length,
        reportFollowupBooking: logs.filter(log => log.status === "Booking").length
    };
    Object.entries(values).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value.toLocaleString("id-ID");
    });
    const label = document.getElementById("followupReportPeriod");
    if (label) {
        const period = mode.value === "day" ? (selected ? new Date(`${selected}T00:00:00`).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "tanggal yang dipilih")
            : mode.value === "month" ? (selected ? new Date(`${selected}-01T00:00:00`).toLocaleDateString("id-ID", { month: "long", year: "numeric" }) : "bulan yang dipilih")
            : (selected || "tahun yang dipilih");
        label.textContent = `Rekap follow-up: ${period}`;
    }
}

window.showReminderGroup = function(group) {
    const filter = document.getElementById("followupStatusFilter");
    if (filter) filter.value = group;
    showPage("followup");
    renderFollowupLists();
};

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
    })[character]);
}
