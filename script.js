// ============================================
// KONFIGURASI API
// ============================================
// Di lokal: http://localhost:5000
// Nanti setelah deploy ke Railway, ganti jadi URL Railway kamu
const API = "https://backend-kelas-production.up.railway.app";

// ============================================
// STATE
// ============================================
let DATA = {
  info: {},
  schedules: [],
  cleanings: [],
  announcements: [],
  events: [],
  users: [],
};

// ============================================
// UTIL
// ============================================
const $ = (id) => document.getElementById(id);

async function fetchJSON(url) {
  const res = await fetch(API + url);
  if (!res.ok) throw new Error("Gagal fetch " + url);
  return res.json();
}

// ============================================
// LOAD SEMUA DATA DARI BACKEND
// ============================================
async function loadData() {
  try {
    const [info, schedules, cleanings, announcements, events, users] =
      await Promise.all([
        fetchJSON("/api/class-info"),
        fetchJSON("/api/schedule"),
        fetchJSON("/api/cleaning"),
        fetchJSON("/api/announcement"),
        fetchJSON("/api/event"),
        fetchJSON("/api/auth/users"),
      ]);

    DATA = {
      info: info.info || {},
      schedules: schedules.schedules || [],
      cleanings: cleanings.cleanings || [],
      announcements: announcements.announcements || [],
      events: events.events || [],
      users: users.users || [],
    };

    renderTab("info");
  } catch (err) {
    console.error(err);
    $("content").innerHTML = `
      <div class="card">
        <p style="text-align:center;padding:40px;color:#e74c3c;">
          ❌ Gagal memuat data. Pastikan backend jalan di ${API}
        </p>
      </div>
    `;
  }
}

// ============================================
// TABS
// ============================================
function switchTab(tab, btn) {
  document
    .querySelectorAll(".tab")
    .forEach((t) => t.classList.remove("active"));
  if (btn) btn.classList.add("active");
  renderTab(tab);
}

function renderTab(tab) {
  const c = $("content");
  if (tab === "info") c.innerHTML = renderInfo();
  else if (tab === "struktur") c.innerHTML = renderStruktur();
  else if (tab === "pelajaran") c.innerHTML = renderPelajaran();
  else if (tab === "piket") c.innerHTML = renderPiket();
  else if (tab === "pengumuman") c.innerHTML = renderPengumuman();
  else if (tab === "agenda") c.innerHTML = renderAgenda();
}

// ============================================
// TAB 1: INFO KELAS
// ============================================
function renderInfo() {
  const i = DATA.info || {};
  return `
    <div class="card">
      <h2>📋 Info Kelas</h2>
      <div class="info-grid">
        <div class="info-item">
          <div class="label">Nama Kelas</div>
          <div class="value">${i.namaKelas || "-"}</div>
        </div>
        <div class="info-item">
          <div class="label">Wali Kelas</div>
          <div class="value">${i.waliKelas || "-"}</div>
        </div>
        <div class="info-item">
          <div class="label">Jumlah Murid</div>
          <div class="value">${i.jumlahMurid || 0}</div>
        </div>
        <div class="info-item">
          <div class="label">Tahun Ajaran</div>
          <div class="value">${i.tahunAjaran || "-"}</div>
        </div>
        <div class="info-item">
          <div class="label">Motto</div>
          <div class="value">${i.motto || "-"}</div>
        </div>
        <div class="info-item">
          <div class="label">Deskripsi</div>
          <div class="value">${i.deskripsi || "-"}</div>
        </div>
      </div>
    </div>
  `;
}

// ============================================
// TAB 2: STRUKTUR KELAS
// ============================================
function renderStruktur() {
  const users = (DATA.users || []).filter((u) => u.jabatan);
  if (!users.length) {
    return `
      <div class="card">
        <h2>👥 Struktur Organisasi Kelas</h2>
        <div class="empty">Belum ada data struktur kelas.</div>
      </div>
    `;
  }

  return `
    <div class="card">
      <h2>👥 Struktur Organisasi Kelas</h2>
      <div class="struktur-grid">
        ${users
          .map(
            (u) => `
          <div class="struktur-card">
            <div class="avatar">${(u.name || "?").charAt(0).toUpperCase()}</div>
            <div class="jabatan">${u.jabatan}</div>
            <div class="nama">${u.name}</div>
          </div>
        `,
          )
          .join("")}
      </div>
    </div>
  `;
}

// ============================================
// TAB 3: JADWAL PELAJARAN
// ============================================
function renderPelajaran() {
  const data = DATA.schedules || [];
  let html = '<div class="card"><h2>📅 Jadwal Pelajaran</h2>';

  if (!data.length) {
    html += '<div class="empty">Belum ada jadwal pelajaran.</div>';
  } else {
    html += `
      <table>
        <thead>
          <tr>
            <th>Hari</th>
            <th>Jam</th>
            <th>Waktu</th>
            <th>Mata Pelajaran</th>
            <th>Guru</th>
            <th>Ruangan</th>
          </tr>
        </thead>
        <tbody>
          ${data
            .map(
              (d) => `
            <tr>
              <td>${d.hari}</td>
              <td>${d.jamKe}</td>
              <td>${d.waktu}</td>
              <td><strong>${d.mataPelajaran}</strong></td>
              <td>${d.guru || "-"}</td>
              <td>${d.ruangan || "-"}</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
    `;
  }

  return html + "</div>";
}

// ============================================
// TAB 4: JADWAL PIKET
// ============================================
function renderPiket() {
  const data = DATA.cleanings || [];
  let html = '<div class="card"><h2>🧹 Jadwal Piket Kebersihan</h2>';

  if (!data.length) {
    html += '<div class="empty">Belum ada jadwal piket.</div>';
  } else {
    html += '<div class="piket-grid">';
    data.forEach((d) => {
      html += `
        <div class="piket-card">
          <div class="hari">${d.hari}</div>
          <ul>
            ${(d.petugas || []).map((p) => `<li>${p}</li>`).join("")}
          </ul>
          ${d.tugas ? `<div class="tugas">📝 ${d.tugas}</div>` : ""}
        </div>
      `;
    });
    html += "</div>";
  }

  return html + "</div>";
}

// ============================================
// TAB 5: PENGUMUMAN
// ============================================
function renderPengumuman() {
  const data = DATA.announcements || [];
  let html = '<div class="card"><h2>📢 Pengumuman</h2>';

  if (!data.length) {
    html += '<div class="empty">Belum ada pengumuman.</div>';
  } else {
    data.forEach((a) => {
      const tanggal = a.createdAt
        ? new Date(a.createdAt).toLocaleString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "-";

      html += `
        <div class="announcement">
          <h4>${a.judul}</h4>
          <div class="meta">Oleh ${a.author?.name || "?"} • ${tanggal}</div>
          <div class="isi">${a.isi}</div>
        </div>
      `;
    });
  }

  return html + "</div>";
}

// ============================================
// TAB 6: AGENDA
// ============================================
function renderAgenda() {
  const data = DATA.events || [];
  let html = '<div class="card"><h2>🎉 Agenda Kelas</h2>';

  if (!data.length) {
    html += '<div class="empty">Belum ada agenda kelas.</div>';
  } else {
    data.forEach((e) => {
      const d = new Date(e.tanggal);
      const day = isNaN(d) ? "-" : d.getDate();
      const month = isNaN(d)
        ? "-"
        : d.toLocaleString("id-ID", { month: "short" });

      html += `
        <div class="event">
          <div class="date-badge">
            <div class="day">${day}</div>
            <div class="month">${month}</div>
          </div>
          <div class="info">
            <h4>${e.nama}</h4>
            <p>
              ${e.lokasi ? "📍 " + e.lokasi : ""}
              ${e.deskripsi ? " • " + e.deskripsi : ""}
            </p>
          </div>
        </div>
      `;
    });
  }

  return html + "</div>";
}

// ============================================
// START
// ============================================
loadData();
