// ============================================
// KONFIGURASI API
// ============================================
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
  structure: [],
};

const $ = (id) => document.getElementById(id);

// ============================================
// LOAD SEMUA DATA
// ============================================
async function loadAllData() {
  const fetchJSON = async (url) => {
    const res = await fetch(API + url);
    if (!res.ok) throw new Error("Gagal fetch " + url);
    return res.json();
  };

  try {
    const [info, schedules, cleanings, announcements, events, structure] =
      await Promise.all([
        fetchJSON("/api/class-info"),
        fetchJSON("/api/schedule"),
        fetchJSON("/api/cleaning"),
        fetchJSON("/api/announcement"),
        fetchJSON("/api/event"),
        fetchJSON("/api/structure"),
      ]);

    DATA = {
      info: info.info || {},
      schedules: schedules.schedules || [],
      cleanings: cleanings.cleanings || [],
      announcements: announcements.announcements || [],
      events: events.events || [],
      structure: structure.structure || [],
    };

    renderTab("info");
  } catch (err) {
    console.error(err);
    $("content").innerHTML = `
      <div class="card">
        <div class="empty">Gagal memuat data. Coba refresh halaman.</div>
      </div>
    `;
  }
}

// ============================================
// TABS
// ============================================
function switchTab(tab, btn) {
  document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
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
      <h2>Info Kelas</h2>
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
// TAB 2: STRUKTUR (BAGAN POHON)
// ============================================
function renderStruktur() {
  const data = DATA.structure || [];

  if (!data.length) {
    return `
      <div class="card">
        <h2>Struktur Organisasi</h2>
        <div class="empty">Belum ada data struktur</div>
      </div>
    `;
  }

  return `
    <div class="card">
      <h2>Struktur Organisasi Kelas</h2>
      <div class="tree-wrap">
        <div class="tree">${buildTree(data)}</div>
      </div>
    </div>
  `;
}

function buildTree(data) {
  const groups = {};
  data.forEach((item) => {
    const j = item.jabatan.toLowerCase();
    let key = "lainnya";
    if (j.includes("wali")) key = "walikelas";
    else if (j.includes("wakil")) key = "wakil";
    else if (j.includes("ketua")) key = "ketua";
    else if (j.includes("sekretaris")) key = "sekretaris";
    else if (j.includes("bendahara")) key = "bendahara";
    else if (j.includes("keamanan")) key = "keamanan";
    else if (j.includes("kebersihan")) key = "kebersihan";
    else if (j.includes("kesehatan")) key = "kesehatan";
    else if (j.includes("peralatan")) key = "peralatan";

    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });

  const makeNode = (label, items, isTop = false, hasChildren = false) => {
    if (!items || !items.length) return "";
    return `
      <div class="tree-node ${hasChildren ? "has-children" : ""}">
        <div class="node-label">${label}</div>
        ${items.map((n) => `<div class="node-box ${isTop ? "top" : ""}">${n.nama}</div>`).join("")}
      </div>
    `;
  };

  const makeLevel = (nodesHtml, withLines = true) => {
    if (!nodesHtml.trim()) return "";
    return `<div class="tree-level ${withLines ? "with-lines" : ""}">${nodesHtml}</div>`;
  };

  const has = (...keys) => keys.some((k) => groups[k] && groups[k].length);

  let html = "";

  if (groups.walikelas) {
    html += makeLevel(
      makeNode("Wali Kelas", groups.walikelas, true, true),
      false
    );
  }

  if (has("ketua", "wakil")) {
    html += makeLevel(
      makeNode("Ketua Kelas", groups.ketua) +
        makeNode("Wakil Ketua", groups.wakil)
    );
  }

  if (has("sekretaris", "bendahara")) {
    html += makeLevel(
      makeNode("Sekretaris", groups.sekretaris) +
        makeNode("Bendahara", groups.bendahara)
    );
  }

  if (has("keamanan", "kebersihan", "kesehatan")) {
    html += makeLevel(
      makeNode("Keamanan", groups.keamanan) +
        makeNode("Kebersihan", groups.kebersihan) +
        makeNode("Kesehatan", groups.kesehatan)
    );
  }

  if (groups.peralatan) {
    html += makeLevel(makeNode("Peralatan", groups.peralatan));
  }

  if (groups.lainnya) {
    html += makeLevel(makeNode("Anggota", groups.lainnya));
  }

  return html;
}

// ============================================
// TAB 3: JADWAL PELAJARAN
// ============================================
function renderPelajaran() {
  const data = DATA.schedules || [];
  let html = '<div class="card"><h2>Jadwal Pelajaran</h2>';

  if (!data.length) {
    html += '<div class="empty">Belum ada jadwal pelajaran</div>';
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
          `
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
  let html = '<div class="card"><h2>Jadwal Piket Kebersihan</h2>';

  if (!data.length) {
    html += '<div class="empty">Belum ada jadwal piket</div>';
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
  let html = '<div class="card"><h2>Pengumuman</h2>';

  if (!data.length) {
    html += '<div class="empty">Belum ada pengumuman</div>';
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
  let html = '<div class="card"><h2>Agenda Kelas</h2>';

  if (!data.length) {
    html += '<div class="empty">Belum ada agenda kelas</div>';
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
loadAllData();
