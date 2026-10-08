/* =========================================================
   WEDDING DATA - CẤU TRÚC DỮ LIỆU DỄ CHỈNH SỬA
   ========================================================= */
const weddingData = {
  groom: "Nguyễn Anh Tú",
  bride: "Trần Thị Diệu Nhi",

  // Định dạng YYYY-MM-DDTHH:mm:ss cho Countdown
  dateTime: "2026-12-20T18:00:00+07:00",

  dateDisplay: "20 . 12 . 2026",
  dateDayMonth: "20 THÁNG 12",
  dateYear: "2026",
  time: "11:00",
  weekday: "Thứ Bảy",

  venue: "Nhà hàng Tiệc cưới Đầm Sen",
  address: "123 Nguyễn Văn Linh, TP. Hồ Chí Minh",
  mapUrl: "https://maps.google.com/?q=123+Nguyen+Van+Linh+TP+Ho+Chi+Minh",

  music: "music/wedding.mp3",

  heroImage: "images/hero.jpg",
  groomImage: "images/groom.jpg",
  brideImage: "images/bride.jpg",

  gallery: [
    "images/photo1.jpg",
    "images/photo2.jpg",
    "images/photo3.jpg",
    "images/photo4.jpg",
    "images/photo5.jpg",
    "images/photo6.jpg",
    "images/photo7.jpg",
    "images/photo8.jpg"
  ]
};

// =========================================================
// 1. LẤY TÊN KHÁCH TỪ URL (?guest=, ?to=, ?name=, ?khach=)
// =========================================================
function cleanGuestName(str) {
  if (!str) return "Quý khách";
  try {
    let guest = decodeURIComponent(str.trim());
    // Hỗ trợ gạch ngang (-), gạch dưới (_) thay cho khoảng trắng
    guest = guest.replace(/[-_]/g, " ");
    // Chuẩn hóa khoảng trắng thừa
    guest = guest.replace(/\s+/g, " ").trim();
    return guest || "Quý khách";
  } catch (e) {
    return str.trim() || "Quý khách";
  }
}

function getGuestName() {
  const params = new URLSearchParams(window.location.search);
  // Hỗ trợ linh hoạt các tham số: ?guest=, ?to=, ?name=, ?khach=, ?u=
  const rawGuest = 
    params.get("guest") || 
    params.get("to") || 
    params.get("name") || 
    params.get("khach") || 
    params.get("u");

  if (rawGuest && rawGuest.trim()) {
    return cleanGuestName(rawGuest);
  }

  // Hỗ trợ dự phòng nếu link dùng dấu thăng hash: #guest=...
  if (window.location.hash) {
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const hashGuest = 
      hashParams.get("guest") || 
      hashParams.get("to") || 
      hashParams.get("name") || 
      hashParams.get("khach");
    if (hashGuest && hashGuest.trim()) {
      return cleanGuestName(hashGuest);
    }
  }

  return "Quý khách";
}

const guestName = getGuestName();

// =========================================================
// 2. RENDER DỮ LIỆU LÊN GIAO DIỆN
// =========================================================
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function setImage(id, src) {
  const el = document.getElementById(id);
  if (el) el.src = src;
}

function renderWeddingData() {
  const couple = `${weddingData.groom} & ${weddingData.bride}`;

  // 1. Tên khách ở màn hình mở thiệp bên ngoài
  setText("opening-guest", guestName);
  setText("opening-couple", couple);

  // 2. Đổi tiêu đề tab trình duyệt theo tên khách mời
  if (guestName !== "Quý khách") {
    document.title = `Thiệp Cưới ${weddingData.groom} & ${weddingData.bride} | Kính Mời ${guestName}`;
  } else {
    document.title = `Thiệp Cưới ${weddingData.groom} & ${weddingData.bride} | Trân Trọng Kính Mời`;
  }

  setText("hero-date", weddingData.dateDisplay);
  setText("hero-couple", `${weddingData.groom.toUpperCase()} & ${weddingData.bride.toUpperCase()}`);

  // 3. Tên khách trong bức thư mời hoàng gia
  setText("message-guest", guestName);

  // 4. Lời nhắn riêng cho khách ở phần RSVP
  setText("rsvp-guest", `${guestName}, sự hiện diện của bạn là niềm hạnh phúc và vinh hạnh lớn nhất của gia đình chúng tôi!`);

  setText("groom-name", weddingData.groom);
  setText("bride-name", weddingData.bride);

  setText("date-large", weddingData.dateDayMonth);
  setText("date-year", weddingData.dateYear);
  setText("wedding-time", weddingData.time);
  setText("wedding-weekday", weddingData.weekday);

  setText("venue-name", weddingData.venue);
  setText("venue-address", weddingData.address);

  setText("footer-couple", couple);
  setText("footer-date", weddingData.dateDisplay);

  setImage("hero-image", weddingData.heroImage);
  setImage("groom-image", weddingData.groomImage);
  setImage("bride-image", weddingData.brideImage);

  const mapBtn = document.getElementById("map-button");
  if (mapBtn) mapBtn.href = weddingData.mapUrl;

  const qrImg = document.getElementById("qr-code-img");
  if (qrImg) {
    const currentUrl = encodeURIComponent(window.location.href);
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${currentUrl}`;
  }

  const audio = document.getElementById("background-music");
  if (audio) audio.src = weddingData.music;
}

// =========================================================
// 3. CÁC HIỆU ỨNG CÁNH HOA ANH ĐÀO RƠI (CANVAS)
// =========================================================

const petalEffectState = {
  primaryFrameId: null,
  primaryResizeHandler: null,
  primaryStartedAt: 0,
  bgFrameId: null,
  bgResizeHandler: null,
  bgInitialized: false
};

/**
 * Tạo một cánh hoa anh đào đơn lẻ với các tham số vật lý nhẹ nhàng
 */
function createSakuraPetal(width, height, isOpeningScreen = false) {
  return {
    x: Math.random() * width,
    // Phân bổ điểm xuất phát dải đều phía trên màn hình để không dồn cục
    y: isOpeningScreen ? (Math.random() * -height * 0.8) : (Math.random() * -height),
    size: Math.random() * 6 + 5, // Cánh hoa nhỏ nhắn (5-11px)
    speedY: Math.random() * 0.8 + 0.6, // Rơi rất nhẹ nhàng (chậm bằng 1/2 cũ)
    speedX: Math.random() * 0.5 - 0.25,
    oscillationSpeed: Math.random() * 0.02 + 0.01, // Tốc độ đung đưa lá
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.02,
    // Tông màu hồng đào mềm mại
    colorR: 245 + Math.floor(Math.random() * 10),
    colorG: 175 + Math.floor(Math.random() * 30),
    colorB: 190 + Math.floor(Math.random() * 20),
    opacity: Math.random() * 0.4 + 0.6
  };
}

/**
 * Vẽ một cánh hoa anh đào theo hình dạng thực tế
 */
function drawSakuraPetal(ctx, p, globalAlpha = 1) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle);
  ctx.fillStyle = `rgba(${p.colorR}, ${p.colorG}, ${p.colorB}, ${p.opacity * globalAlpha})`;

  ctx.beginPath();
  // Vẽ hình cánh hoa dạng trái tim/giọt nước khuyết nhẹ
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-p.size / 2, -p.size / 2, -p.size, p.size / 3, 0, p.size);
  ctx.bezierCurveTo(p.size, p.size / 3, p.size / 2, -p.size / 2, 0, 0);
  ctx.fill();
  ctx.restore();
}
document.documentElement.classList.add("is-opening");
document.body.classList.add("is-opening");
/**
 * A. Hiệu ứng Mở thiệp (Rơi thưa thớt nhẹ nhàng trong 5 giây)
 */
function startPetalsEffectFor5Seconds() {
  const canvas = document.getElementById('petal-canvas');
  if (!canvas) return;

  if (petalEffectState.primaryFrameId) {
    cancelAnimationFrame(petalEffectState.primaryFrameId);
  }

  if (petalEffectState.primaryResizeHandler) {
    window.removeEventListener('resize', petalEffectState.primaryResizeHandler);
  }

  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  petalEffectState.primaryResizeHandler = () => {
    // Chỉ resize khi chiều rộng đổi (xoay màn hình), tránh giật khi thanh URL di động co giãn
    if (Math.abs(window.innerWidth - width) > 10) {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
  };
  window.addEventListener('resize', petalEffectState.primaryResizeHandler);

  const numPetals = 22;
  const petals = [];

  for (let i = 0; i < numPetals; i++) {
    petals.push(createSakuraPetal(width, height, true));
  }

  let startTime = null;
  const DURATION = 5000;

  function render(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;

    ctx.clearRect(0, 0, width, height);

    let globalAlpha = 1;
    if (elapsed > 3500) {
      globalAlpha = Math.max(0, 1 - (elapsed - 3500) / 1500);
    }

    petals.forEach(p => {
      p.y += p.speedY;
      p.x += Math.sin(p.y * p.oscillationSpeed) + p.speedX;
      p.angle += p.spin;

      drawSakuraPetal(ctx, p, globalAlpha);
    });

    if (elapsed < DURATION) {
      petalEffectState.primaryFrameId = requestAnimationFrame(render);
    } else {
      petalEffectState.primaryFrameId = null;
      ctx.clearRect(0, 0, width, height);
      window.removeEventListener('resize', petalEffectState.primaryResizeHandler);
      petalEffectState.primaryResizeHandler = null;
    }
  }

  petalEffectState.primaryFrameId = requestAnimationFrame(render);
}

/**
 * B. Hiệu ứng Cánh hoa nền (Chạy ẩn liên tục phía sau nội dung chính)
 */
function initBackgroundPetals() {
  const canvas = document.getElementById('bg-petal-canvas');
  if (!canvas) return;

  if (petalEffectState.bgFrameId) {
    cancelAnimationFrame(petalEffectState.bgFrameId);
  }

  if (petalEffectState.bgResizeHandler) {
    window.removeEventListener('resize', petalEffectState.bgResizeHandler);
  }

  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  petalEffectState.bgResizeHandler = () => {
    // Chỉ cập nhật lại khi xoay ngang màn hình (width đổi) hoặc chênh lệch chiều cao rất lớn
    if (Math.abs(window.innerWidth - width) > 10 || Math.abs(window.innerHeight - height) > 150) {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
  };
  window.addEventListener('resize', petalEffectState.bgResizeHandler);

  const numPetals = window.innerWidth < 600 ? 18 : 30;
  const petals = [];

  for (let i = 0; i < numPetals; i++) {
    const p = createSakuraPetal(width, height);
    p.y = Math.random() * height;
    petals.push(p);
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    petals.forEach(p => {
      p.y += p.speedY;
      p.x += Math.sin(p.y * p.oscillationSpeed) + p.speedX;
      p.angle += p.spin;

      if (p.y > height + 20) {
        p.y = -20;
        p.x = Math.random() * width;
      }

      drawSakuraPetal(ctx, p, 1);
    });

    petalEffectState.bgFrameId = requestAnimationFrame(render);
  }

  petalEffectState.bgFrameId = requestAnimationFrame(render);
}

// =========================================================
// 4. ÂM NHẠC & MỞ THIỆP
// =========================================================
const audio = document.getElementById("background-music");
const musicToggle = document.getElementById("music-toggle");
let isMusicPlaying = false;

async function playMusic() {
  if (!audio) return;
  try {
    await audio.play();
    isMusicPlaying = true;
    musicToggle?.classList.add("is-playing");
  } catch (err) {
    isMusicPlaying = false;
  }
}

function pauseMusic() {
  if (!audio) return;
  audio.pause();
  isMusicPlaying = false;
  musicToggle?.classList.remove("is-playing");
}

musicToggle?.addEventListener("click", () => {
  if (isMusicPlaying) pauseMusic();
  else playMusic();
});

// Xử lý nút MỞ THIỆP (TÁCH ĐÔI 2 CÁNH CỬA SANG 2 BÊN)
const openBtn = document.getElementById("open-invitation");
const openingScreen = document.getElementById("opening-screen");
const mainInvitation = document.getElementById("invitation");

openBtn?.addEventListener("click", async () => {
  if (!openingScreen || !mainInvitation) return;

  if (openingScreen.classList.contains("is-opening-doors") || openingScreen.classList.contains("is-removed")) return;

  // 1. Kích hoạt hiệu ứng 2 cánh cổng mở tách sang 2 bên
  openingScreen.classList.add("is-opening-doors");

  // 2. Hiệu ứng cánh hoa bay lượn
  startPetalsEffectFor5Seconds();
  initBackgroundPetals();

  // 3. Mở nội dung chính & kích hoạt chuỗi hiệu ứng chữ trượt (Staggered motion)
  mainInvitation.classList.add("is-visible");
  mainInvitation.removeAttribute("aria-hidden");
  document.querySelector(".section.hero")?.classList.add("is-visible");

  // 4. Phát nhạc nền
  await playMusic();

  // 5. Sau khi 2 cánh cửa đã trượt mở hoàn toàn (1.25s), mở khóa cuộn và dọn dẹp màn mở thiệp
  setTimeout(() => {
    document.documentElement.classList.remove("is-opening");
    document.body.classList.remove("is-opening");
    openingScreen.classList.add("is-hidden");
    openingScreen.classList.add("is-removed");
  }, 1300);
});

// =========================================================
// 5. COUNTDOWN TIMER
// =========================================================
// Tự động kích hoạt hiệu ứng khi cuộn tới phần cô dâu chú rể


let countdownInterval = null;

function updateCountdown() {
  const target = new Date(weddingData.dateTime).getTime();
  const now = Date.now();
  const distance = target - now;

  if (distance <= 0) {
    setText("days", "00");
    setText("hours", "00");
    setText("minutes", "00");
    setText("seconds", "00");
    setText("countdown-message", "Lễ cưới đang diễn ra! ❤️");
    if (countdownInterval) clearInterval(countdownInterval);
    return;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((distance / (1000 * 60)) % 60);
  const seconds = Math.floor((distance / 1000) % 60);

  setText("days", String(days).padStart(2, "0"));
  setText("hours", String(hours).padStart(2, "0"));
  setText("minutes", String(minutes).padStart(2, "0"));
  setText("seconds", String(seconds).padStart(2, "0"));
}

function startCountdown() {
  updateCountdown();
  countdownInterval = setInterval(updateCountdown, 1000);
}

// =========================================================
// 6. GALLERY & LIGHTBOX
// =========================================================
let currentGalleryIndex = 0;

function renderGallery() {
  const galleryEl = document.getElementById("gallery");
  if (!galleryEl || !weddingData.gallery.length) return;

  galleryEl.innerHTML = "";

  // 1. TẤM ẢNH TIÊU ĐIỂM (SPOTLIGHT FEATURE CARD) - Ảnh đầu tiên
  const spotlightCard = document.createElement("button");
  spotlightCard.className = "gallery-spotlight-card";
  spotlightCard.type = "button";
  spotlightCard.setAttribute("aria-label", "Xem ảnh tiêu điểm phóng to");
  spotlightCard.innerHTML = `
    <div class="spotlight-wrap">
      <span class="spotlight-badge">FEATURED ✦ SWEET MOMENTS</span>
      <img src="${weddingData.gallery[0]}" alt="Ảnh cưới tiêu điểm" loading="lazy" />
      <div class="spotlight-caption">
        <span class="spotlight-title">Khoảnh Khắc Hạnh Phúc</span>
        <span class="spotlight-hint">🔍 Chạm để phóng to</span>
      </div>
    </div>
  `;
  spotlightCard.addEventListener("click", () => openLightbox(0));
  galleryEl.appendChild(spotlightCard);

  // 2. LƯỚI ẢNH SO LE NGHỆ THUẬT (ASYMMETRICAL MAGAZINE GRID) - Các ảnh tiếp theo
  if (weddingData.gallery.length > 1) {
    const grid = document.createElement("div");
    grid.className = "gallery-mosaic-grid";

    // Phân loại hình dáng ảnh theo nhịp điệu tạp chí
    const cardShapes = ["tall", "square", "tall", "tall", "wide", "square", "tall"];

    weddingData.gallery.slice(1).forEach((src, index) => {
      const idx = index + 1; // Chỉ số ảnh thực tế trong mảng
      const shapeClass = cardShapes[index % cardShapes.length];

      const card = document.createElement("button");
      card.className = `gallery-card ${shapeClass}`;
      card.type = "button";
      card.setAttribute("aria-label", `Xem ảnh cưới ${idx + 1}`);

      card.innerHTML = `
        <img src="${src}" alt="Ảnh cưới ${idx + 1}" loading="lazy" />
        <span class="gallery-card-zoom" aria-hidden="true">🔍</span>
      `;

      card.addEventListener("click", () => openLightbox(idx));
      grid.appendChild(card);
    });

    galleryEl.appendChild(grid);
  }

  // Gắn sự kiện cho nút xem toàn bộ ảnh
  const viewAllBtn = document.getElementById("view-all-photos-btn");
  if (viewAllBtn) {
    viewAllBtn.onclick = () => openLightbox(0);
  }
}

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-image");
const lightboxCounter = document.getElementById("lightbox-counter");

function updateLightbox() {
  if (!lightboxImg) return;
  lightboxImg.src = weddingData.gallery[currentGalleryIndex];
  if (lightboxCounter) {
    lightboxCounter.textContent = `${currentGalleryIndex + 1} / ${weddingData.gallery.length}`;
  }
}

function openLightbox(idx) {
  currentGalleryIndex = idx;
  updateLightbox();
  lightbox?.classList.add("is-open");
  lightbox?.setAttribute("aria-hidden", "false");
}

function closeLightbox() {
  lightbox?.classList.remove("is-open");
  lightbox?.setAttribute("aria-hidden", "true");
}

document.getElementById("lightbox-close")?.addEventListener("click", closeLightbox);
document.getElementById("lightbox-next")?.addEventListener("click", () => {
  currentGalleryIndex = (currentGalleryIndex + 1) % weddingData.gallery.length;
  updateLightbox();
});
document.getElementById("lightbox-prev")?.addEventListener("click", () => {
  currentGalleryIndex = (currentGalleryIndex - 1 + weddingData.gallery.length) % weddingData.gallery.length;
  updateLightbox();
});

// Touch swipe cho Lightbox trên điện thoại
let touchStartX = 0;
lightbox?.addEventListener("touchstart", (e) => {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

lightbox?.addEventListener("touchend", (e) => {
  const distance = e.changedTouches[0].screenX - touchStartX;
  if (Math.abs(distance) > 45) {
    if (distance < 0) {
      currentGalleryIndex = (currentGalleryIndex + 1) % weddingData.gallery.length;
    } else {
      currentGalleryIndex = (currentGalleryIndex - 1 + weddingData.gallery.length) % weddingData.gallery.length;
    }
    updateLightbox();
  }
}, { passive: true });

// =========================================================
// 7. CÁC TÍNH NĂNG TƯƠNG TÁC (CALENDAR, COPY ĐỊA CHỈ, CHIA SẺ, CONFETTI & RSVP)
// =========================================================

// --- A. LƯU VÀO GOOGLE CALENDAR ---
const addCalBtn = document.getElementById("add-calendar-btn");
addCalBtn?.addEventListener("click", () => {
  const title = encodeURIComponent(`Lễ Cưới ${weddingData.groom} & ${weddingData.bride}`);
  const details = encodeURIComponent(`Trân trọng kính mời quý khách tham dự lễ thành hôn của ${weddingData.groom} & ${weddingData.bride} tại ${weddingData.venue}. Rất hân hạnh được đón tiếp!`);
  const loc = encodeURIComponent(`${weddingData.venue}, ${weddingData.address}`);
  // Lễ cưới ngày 20/12/2026 từ 11:00 đến 15:00
  const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=20261220T110000/20261220T150000&details=${details}&location=${loc}`;
  window.open(calUrl, "_blank", "noopener,noreferrer");
  showToast("Đang mở Google Calendar để lưu ngày cưới... 📅");
});

// --- B. SAO CHÉP ĐỊA CHỈ NHÀ HÀNG (ĐẶT XE / GRAB) ---
const copyAddressBtn = document.getElementById("copy-address-btn");
copyAddressBtn?.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(weddingData.address);
    showToast("Đã sao chép địa chỉ nhà hàng thành công! 📋");
  } catch (err) {
    showToast(weddingData.address);
  }
});

// --- C. CHIA SẺ VÀ SAO CHÉP LINK THIỆP ---
const shareBtn = document.getElementById("share-button");
const copyBtn = document.getElementById("copy-link-button");

async function copyUrl() {
  try {
    await navigator.clipboard.writeText(window.location.href);
    showToast("Đã sao chép link thiệp thành công! ❤️");
  } catch (err) {
    showToast("Không thể sao chép, hãy copy trên thanh địa chỉ!");
  }
}

shareBtn?.addEventListener("click", async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: `${weddingData.groom} & ${weddingData.bride}`,
        text: `Thiệp cưới của ${weddingData.groom} & ${weddingData.bride}`,
        url: window.location.href
      });
    } catch (err) {}
  } else {
    copyBtn?.classList.remove("hidden");
    await copyUrl();
  }
});

copyBtn?.addEventListener("click", copyUrl);

// --- D. HIỆU ỨNG BẮN PHÁO HOA CHÚC MỪNG (CONFETTI BURST) ---
let confettiAnimId = null;
function launchConfetti() {
  const canvas = document.getElementById("confetti-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;

  const colors = [
    "#d88394", "#b85b6f", "#d4af37", "#f7c59f", "#ffffff", 
    "#e25c76", "#fbd1d9", "#ffd700", "#ff6b81", "#a29bfe"
  ];
  const particles = [];
  const particleCount = 80;

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: canvas.width * 0.5 + (Math.random() * 120 - 60),
      y: canvas.height * 0.45 + (Math.random() * 40 - 20),
      w: Math.random() * 9 + 5,
      h: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 14,
      vy: -(Math.random() * 12 + 6),
      gravity: 0.38,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 14,
      opacity: 1
    });
  }

  if (confettiAnimId) cancelAnimationFrame(confettiAnimId);

  function updateConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let activeCount = 0;

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.rotation += p.rotationSpeed;
      p.opacity -= 0.012;

      if (p.opacity > 0 && p.y < canvas.height + 20) {
        activeCount++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
    }

    if (activeCount > 0) {
      confettiAnimId = requestAnimationFrame(updateConfetti);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      confettiAnimId = null;
    }
  }

  updateConfetti();
}

// --- E. NÚT RSVP XÁC NHẬN THAM DỰ ---
document.getElementById("attend-button")?.addEventListener("click", () => {
  setText("rsvp-message", `🎉 Cảm ơn ${guestName}! Hẹn gặp bạn tại ngày vui trọng đại của chúng tôi ❤️`);
  launchConfetti();
  showToast(`Cảm ơn ${guestName} đã xác nhận tham dự! 🎉`);
});

document.getElementById("decline-button")?.addEventListener("click", () => {
  setText("rsvp-message", `💌 Cảm ơn ${guestName} đã gửi trọn vẹn tình cảm & lời chúc tốt đẹp!`);
  showToast("Cảm ơn bạn đã gửi lời chúc mừng! 💌");
});

// --- F. GỬI LỜI CHÚC MỪNG ĐẾN ĐÔI UYÊN ƯƠNG ---
const sendWishBtn = document.getElementById("send-wish-btn");
const wishText = document.getElementById("wish-text");
const wishSentMsg = document.getElementById("wish-sent-msg");

sendWishBtn?.addEventListener("click", () => {
  const wish = wishText ? wishText.value.trim() : "";
  if (!wish) {
    showToast("Vui lòng nhập lời chúc ngọt ngào của bạn nhé! ✨");
    if (wishText) wishText.focus();
    return;
  }

  if (wishSentMsg) {
    wishSentMsg.classList.remove("hidden");
    wishSentMsg.textContent = `Cảm ơn ${guestName}! Lời chúc "${wish.slice(0, 35)}${wish.length > 35 ? '...' : ''}" đã được lưu giữ ❤️`;
  }
  if (wishText) wishText.value = "";
  showToast("Đã gửi lời chúc thành công! Cảm ơn bạn rất nhiều ❤️");
  launchConfetti();
});

// --- G. THÔNG BÁO TOAST ---
function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2800);
}

// =========================================================
// 8. SCROLL REVEAL (INTERSECTION OBSERVER)
// =========================================================
function initScrollReveal() {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add("is-visible");

      // Mỗi section chỉ reveal một lần
      obs.unobserve(entry.target);
    });
  }, {
    root: null,
    rootMargin: "0px 0px -10% 0px",
    threshold: 0.12
  });

  document
    .querySelectorAll("#invitation .reveal")
    .forEach(section => observer.observe(section));
}

// =========================================================
// TỰ ĐỘNG CHUYỂN SLIDE HERO MỖI 0,5 GIÂY (500ms)
// =========================================================
document.addEventListener("DOMContentLoaded", function () {
  const slides = document.querySelectorAll(".hero-slide");
  let currentSlideIndex = 0;
  const slideInterval = 3000; // 500ms = 0.5 giây (Sửa số này nếu muốn nhanh/chậm hơn)

  if (slides.length > 1) {
    setInterval(() => {
      // Bỏ class active ở ảnh hiện tại
      slides[currentSlideIndex].classList.remove("active");

      // Chuyển sang chỉ số ảnh tiếp theo
      currentSlideIndex = (currentSlideIndex + 1) % slides.length;

      // Thêm class active cho ảnh mới
      slides[currentSlideIndex].classList.add("active");
    }, slideInterval);
  }
});

// =========================================================
// KHỜI TẠO DỰ ÁN
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
  renderWeddingData();
  renderGallery();
  startCountdown();
  initScrollReveal();
});