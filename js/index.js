document.addEventListener('DOMContentLoaded', init);

// Usuario logueado (se guarda en sesión)
let currentUser = JSON.parse(sessionStorage.getItem('adoptme_user') || 'null');

const DB_PATH = '../data/db.json';
const TMPL    = '../html/templates/';


function loadTemplate(fileName, id) {
    return fetch(fileName)
        .then(res => {
            if (!res.ok) throw new Error(`Error cargando ${fileName}`);
            return res.text();
        })
        .then(text => {
            const element = document.getElementById(id);
            if (element) element.innerHTML = text;
        })
        .catch(err => console.error(err));
}


async function fetchDB() {
    try {
        const res = await fetch(DB_PATH);
        if (!res.ok) throw new Error('No se pudo cargar db.json');
        return await res.json();
    } catch (err) {
        console.error(err);
        return null;
    }
}


// ─── ROUTER ───────────────────────────────────────────────────────────────────
async function router(db) {
    const hash = window.location.hash.slice(1).split('?')[0] || 'home';

    window.scrollTo(0, 0);

    switch (hash) {

        case 'home':
        case '':
            await loadTemplate(TMPL + 'template_home.html', 'main');
            renderHome(db.home);
            break;

        case 'adoption_list':
            await loadTemplate(TMPL + 'template_adoption_list.html', 'main');
            renderAdoptionList(db.animals);
            break;

        case 'pet_profile':
            await loadTemplate(TMPL + 'template_pet_profile.html', 'main');
            renderPetProfile(db.animals);
            break;

        case 'login':
            await loadTemplate(TMPL + 'template_login.html', 'main');
            initLogin(db.users);
            break;

        case 'about_us':
            await loadTemplate(TMPL + 'template_about_us.html', 'main');
            renderAboutUs(db.about_us);
            break;

        case 'stories':
            await loadTemplate(TMPL + 'template_stories.html', 'main');
            renderStories(db.stories);
            break;

        case 'faq':
            await loadTemplate(TMPL + 'template_faq.html', 'main');
            renderFaq(db.faq);
            break;

        case 'legal':
            await loadTemplate(TMPL + 'template_legal.html', 'main');
            renderLegal(db.legal);
            break;

        case 'contact_us':
            await loadTemplate(TMPL + 'template_contact_us.html', 'main');
            renderContactUs(db.contact_us);
            break;

        case 'schedule':
            await loadTemplate(TMPL + 'template_schedule.html', 'main');
            renderSchedule(db.schedule);
            break;

        default:
            await loadTemplate(TMPL + 'template_home.html', 'main');
    }
}


// ─── INIT ─────────────────────────────────────────────────────────────────────
async function init() {
    const db = await fetchDB();
    if (!db) return;

    await loadTemplate(TMPL + 'template_header.html', 'header');
    renderHeader(db.header);

    await loadTemplate(TMPL + 'template_footer.html', 'footer');
    renderFooter(db.footer);

    await router(db);

    window.addEventListener('hashchange', () => router(db));
}


// ─── RENDER HEADER ────────────────────────────────────────────────────────────
function renderHeader(headerData) {
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.style.backgroundImage = `url('${headerData.logo}')`;
        logo.style.backgroundSize  = 'cover';
    }

    const brandTitle = document.querySelector('.brand-title');
    if (brandTitle) brandTitle.textContent = headerData.title;

    const socials = document.querySelector('.socials');
    if (socials) {
        socials.innerHTML = '';
        headerData.socialLinks.forEach(link => {
            socials.innerHTML += `
                <a class="social-ico" href="${link.url}" target="_blank"
                   rel="noopener noreferrer" aria-label="${link.name}">
                    <i class="bi ${link.icon}"></i>
                </a>`;
        });
    }

    const nav = document.querySelector('nav');
    if (nav) {
        nav.innerHTML = '';
        headerData.navLinks.forEach(link => {
            nav.innerHTML += `<a class="btn" href="${link.url}">${link.name}</a>`;
        });
    }
}


// ─── RENDER FOOTER ────────────────────────────────────────────────────────────
function renderFooter(footerData) {
    const left = document.querySelector('.footer-left');
    if (left) {
        left.innerHTML = '';
        footerData.navLinks.slice(0, 2).forEach(link => {
            left.innerHTML += `<a class="btn" href="${link.url}">${link.name}</a>`;
        });
    }

    const center = document.querySelector('.footer-center');
    if (center) {
        const linkCentral = footerData.navLinks[2];
        center.innerHTML = `<a class="btn" href="${linkCentral.url}">${linkCentral.name}</a>`;
    }

    const right = document.querySelector('.footer-right');
    if (right) {
        right.innerHTML = '';
        footerData.navLinks.slice(3).forEach(link => {
            right.innerHTML += `<a class="btn" href="${link.url}">${link.name}</a>`;
        });
    }

    const legal = document.querySelector('.footer-legal');
    if (legal) legal.textContent = footerData.copyright;
}


// ─── RENDER HOME ──────────────────────────────────────────────────────────────
function renderHome(data) {
    // ── Texto ──
    const text = document.getElementById('hero-text');
    if (text && data.text) {
        text.innerHTML = data.text
            .split('\n\n')
            .map(p => `<p>${p}</p>`)
            .join('');
    }

    // ── Carrusel ──
    const images = data.images || (data.image ? [data.image] : []);
    if (!images.length) return;

    const track = document.getElementById('carousel-track');
    const dots  = document.getElementById('carousel-dots');
    if (!track) return;

    let current = 0;
    let autoTimer;

    // Crear slides
    track.innerHTML = '';
    images.forEach(src => {
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        slide.style.backgroundImage = `url('${src}')`;
        track.appendChild(slide);
    });

    // Crear puntos
    if (dots) {
        dots.innerHTML = '';
        images.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
            dot.addEventListener('click', () => goTo(i));
            dots.appendChild(dot);
        });
    }

    function goTo(index) {
        current = (index + images.length) % images.length;
        track.style.transform = `translateX(-${current * 100}%)`;
        document.querySelectorAll('.carousel-dot').forEach((d, i) =>
            d.classList.toggle('active', i === current));
        resetAuto();
    }

    function resetAuto() {
        clearInterval(autoTimer);
        autoTimer = setInterval(() => goTo(current + 1), 4000);
    }

    document.querySelector('.carousel-prev')?.addEventListener('click', () => goTo(current - 1));
    document.querySelector('.carousel-next')?.addEventListener('click', () => goTo(current + 1));

    resetAuto();
}

// ─── RENDER ABOUT US ──────────────────────────────────────────────────────────
function renderAboutUs(data) {
    const container = document.getElementById('about_us');
    if (!container) return;

    container.innerHTML = '';
    data.forEach(member => {
        container.innerHTML += `
            <section class="card-about_us">
                <img class="photo-card-about_us" src="${member.image}" alt="Foto de ${member.name}">
                <h2>${member.name}</h2>
                <h3>${member.role}</h3>
                <p class="text-card-about_us">${member.description}</p>
            </section>`;
    });
}


// ─── RENDER FAQ ───────────────────────────────────────────────────────────────
function renderFaq(faqData) {
    const container = document.getElementById('faq_item');
    if (!container) return;

    container.innerHTML = '';
    faqData.forEach(item => {
        container.innerHTML += `
            <div class="faq-group">
                <label class="faq-question">
                    <input type="checkbox" class="faq-toggle" />
                    ${item.question}
                </label>
                <div class="faq-answer">
                    <p>${item.answer}</p>
                </div>
            </div>`;
    });
}


// ─── RENDER LEGAL ─────────────────────────────────────────────────────────────
function renderLegal(legalData) {
    const container = document.getElementById('faq_item');
    if (!container) return;

    container.innerHTML = '';
    legalData.forEach(item => {
        container.innerHTML += `
            <div class="faq-group">
                <label class="faq-question">
                    <input type="checkbox" class="faq-toggle" />
                    ${item.title}
                </label>
                <div class="faq-answer">
                    <p>${item.content}</p>
                </div>
            </div>`;
    });
}


// ─── RENDER STORIES ───────────────────────────────────────────────────────────
function renderStories(storiesData) {
    const container = document.getElementById('review');
    if (!container) return;

    container.innerHTML = '';
    storiesData.forEach(story => {
        container.innerHTML += `
            <div class="card-stories">
                <img class="photo-card-stories" src="${story.image}" alt="Foto de ${story.name}">
                <div class="text-card-stories">
                    <p><span class="story-name">${story.name}</span> ${story.text}</p>
                </div>
            </div>`;
    });
}


// ─── RENDER CONTACT US ────────────────────────────────────────────────────────
function renderContactUs(data) {
    // Título izquierda
    const title = document.getElementById('contact-title');
    if (title && data.title) title.textContent = data.title;

    // Razones para contactar
    const reasons = document.getElementById('contact-reasons');
    if (reasons && data.reasons) {
        reasons.innerHTML = '';
        data.reasons.forEach(r => {
            reasons.innerHTML += `
                <div class="contact-reason">
                    <span class="contact-reason-icon">${r.icon}</span>
                    <div class="contact-reason-text">
                        <h3>${r.title}</h3>
                        <p>${r.text}</p>
                    </div>
                </div>`;
        });
    }

    // Mapa de Google Maps
    const map = document.getElementById('contact-map-iframe');
    if (map && data.mapUrl) map.src = data.mapUrl;

    // Info de contacto
    const list = document.getElementById('contact-list');
    if (list && data.info) {
        list.innerHTML = '';
        data.info.forEach(line => {
            list.innerHTML += `<li>${line}</li>`;
        });
    }
}


// ─── RENDER ADOPTION LIST ─────────────────────────────────────────────────────
function renderAdoptionList(animals) {

    function parseWeight(w) { return parseFloat(w) || 0; }

    function weightRange(w) {
        const kg = parseWeight(w);
        if (kg <= 5)  return 'Pequeño (≤5kg)';
        if (kg <= 15) return 'Mediano (6-15kg)';
        return 'Grande (>15kg)';
    }

    function ageRange(age) {
        if (age <= 2) return 'Cachorro (0-2 años)';
        if (age <= 6) return 'Adulto (3-6 años)';
        return 'Senior (7+ años)';
    }

    // ── Rellenar opciones dinámicas en los select ──
    function fillSelect(id, values) {
        const sel = document.getElementById(id);
        if (!sel) return;
        const unique = [...new Set(values)].sort();
        unique.forEach(v => {
            if (![...sel.options].some(o => o.value === v)) {
                const opt = document.createElement('option');
                opt.value = opt.textContent = v;
                sel.appendChild(opt);
            }
        });
        // Restaurar estado guardado (RF-16)
        const saved = sessionStorage.getItem('filter_' + id);
        if (saved) sel.value = saved;
    }

    fillSelect('filter-breed', animals.map(a => a.breed));
    fillSelect('filter-hair',  animals.map(a => a["hair type"]));
    fillSelect('filter-mood',  animals.map(a => a.mood));

    // Restaurar selects fijos
    ['filter-age', 'filter-weight', 'sort-select'].forEach(id => {
        const sel = document.getElementById(id);
        const saved = sessionStorage.getItem('filter_' + id);
        if (sel && saved) sel.value = saved;
    });

    // ── Aplicar filtros combinados (RF-15) ──
    function applyFilters() {
        const breed  = document.getElementById('filter-breed')?.value  || 'all';
        const age    = document.getElementById('filter-age')?.value    || 'all';
        const weight = document.getElementById('filter-weight')?.value || 'all';
        const hair   = document.getElementById('filter-hair')?.value   || 'all';
        const mood   = document.getElementById('filter-mood')?.value   || 'all';
        const sort   = document.getElementById('sort-select')?.value   || '';

        // Guardar estado (RF-16)
        sessionStorage.setItem('filter_filter-breed',  breed);
        sessionStorage.setItem('filter_filter-age',    age);
        sessionStorage.setItem('filter_filter-weight', weight);
        sessionStorage.setItem('filter_filter-hair',   hair);
        sessionStorage.setItem('filter_filter-mood',   mood);
        sessionStorage.setItem('filter_sort-select',   sort);

        let result = animals.filter(a => {
            if (breed  !== 'all' && a.breed           !== breed)  return false;
            if (age    !== 'all' && ageRange(a.age)   !== age)    return false;
            if (weight !== 'all' && weightRange(a.weight) !== weight) return false;
            if (hair   !== 'all' && a["hair type"]    !== hair)   return false;
            if (mood   !== 'all' && a.mood             !== mood)   return false;
            return true;
        });

        // Ordenar (RF-17)
        if (sort === 'age-asc')     result.sort((a, b) => a.age - b.age);
        if (sort === 'age-desc')    result.sort((a, b) => b.age - a.age);
        if (sort === 'weight-asc')  result.sort((a, b) => parseWeight(a.weight) - parseWeight(b.weight));
        if (sort === 'weight-desc') result.sort((a, b) => parseWeight(b.weight) - parseWeight(a.weight));

        const count = document.getElementById('results-count');
        if (count) count.textContent = `${result.length} mascota${result.length !== 1 ? 's' : ''} encontrada${result.length !== 1 ? 's' : ''}`;

        renderAnimalCards(result);
    }

    // Escuchar cambios en todos los select
    ['filter-breed','filter-age','filter-weight','filter-hair','filter-mood','sort-select'].forEach(id => {
        document.getElementById(id)?.addEventListener('change', applyFilters);
    });

    // Reset (RF-16: limpia sessionStorage)
    document.getElementById('filter-reset')?.addEventListener('click', () => {
        ['filter-breed','filter-age','filter-weight','filter-hair','filter-mood','sort-select'].forEach(id => {
            const sel = document.getElementById(id);
            if (sel) sel.value = sel.options[0].value;
            sessionStorage.removeItem('filter_' + id);
        });
        applyFilters();
    });

    applyFilters();
}


function renderAnimalCards(animals) {
    const container = document.getElementById('pets-list');
    if (!container) return;
    container.innerHTML = '';

    animals.forEach(animal => {
        container.innerHTML += `
            <div class="item-list">
                <div class="photo-btn-column">
                    <a href="#pet_profile?id=${animal.id}">
                        <img class="photo-card-list" src="${animal.image}" alt="Foto de ${animal.name}">
                    </a>
                    <a class="btn-pet-detail" href="#pet_profile?id=${animal.id}">Ver perfil</a>
                </div>
                <div class="pet-profile-text">
                    <ul>
                        <li><strong>Nombre:</strong> ${animal.name}</li>
                        <li><strong>Raza:</strong> ${animal.breed}</li>
                        <li><strong>Edad:</strong> ${animal.age} años</li>
                        <li><strong>Peso:</strong> ${animal.weight}</li>
                        <li><strong>Pelo:</strong> ${animal["hair type"]}</li>
                        <li><strong>Carácter:</strong> ${animal.mood}</li>
                    </ul>
                </div>
            </div>`;
    });
}


// ─── RENDER PET PROFILE ───────────────────────────────────────────────────────
function renderPetProfile(animals) {
    const hashParams = window.location.hash.split('?')[1] || '';
    const params     = new URLSearchParams(hashParams);
    const id         = parseInt(params.get('id'));

    const animal = animals.find(a => a.id === id) || animals[0];
    if (!animal) return;

    const boxes = document.querySelectorAll('.box-text');
    if (boxes.length >= 5) {
        boxes[0].textContent = `Nombre: ${animal.name}`;
        boxes[1].textContent = `Raza: ${animal.breed} · Edad: ${animal.age} años`;
        boxes[2].textContent = `Peso: ${animal.weight} · Pelo: ${animal["hair type"]}`;
        boxes[3].textContent = `Carácter: ${animal.mood}`;
        boxes[4].textContent = animal.description;
    }

    const photo = document.querySelector('.dog-profile .photo-card-profile');
    if (photo) {
        photo.src = animal.image;
        photo.alt = `Foto de ${animal.name}`;
    }
}


// ─── LOGIN ────────────────────────────────────────────────────────────────────
function initLogin(users) {
    const form = document.querySelector('.login-inputs');
    if (!form) return;

    const errorMsg = document.createElement('p');
    errorMsg.style.cssText = 'color:red; text-align:center; margin-top:0.5rem;';
    form.appendChild(errorMsg);

    form.addEventListener('submit', e => {
        e.preventDefault();

        const inputUser = document.getElementById('login-name').value.trim();
        const inputPass = document.getElementById('login-password').value;

        // Busca por campo "user" o por "email"
        const found = users.find(u =>
            (u.user === inputUser || u.email === inputUser) && u.password === inputPass
        );

        if (found) {
            currentUser = found;
            sessionStorage.setItem('adoptme_user', JSON.stringify(found));
            errorMsg.style.color = 'green';
            errorMsg.textContent = `¡Bienvenido, ${found.name}!`;
            // Redirige al home tras 1 segundo
            setTimeout(() => { window.location.hash = '#home'; }, 1000);
        } else {
            errorMsg.style.color = 'red';
            errorMsg.textContent = 'Usuario o contraseña incorrectos.';
        }
    });
}

// ─── RENDER SCHEDULE ──────────────────────────────────────────────────────────
function renderSchedule(scheduleData) {
    const loginMsg  = document.getElementById('schedule-login-msg');
    const app       = document.getElementById('schedule-app');

    if (!currentUser) {
        if (loginMsg) loginMsg.style.display = 'block';
        if (app)      app.style.display      = 'none';
        return;
    }

    if (loginMsg) loginMsg.style.display = 'none';
    if (app)      app.style.display      = 'block';

    initCalendar(scheduleData);
}


function initCalendar(scheduleData) {
    const slots    = scheduleData ? scheduleData.slots : ['10:00','11:00','12:00','13:00','16:00','17:00','18:00'];
    const bookings = JSON.parse(sessionStorage.getItem('adoptme_bookings') || '[]');

    let current = new Date();
    current.setDate(1);

    function saveBookings() {
        sessionStorage.setItem('adoptme_bookings', JSON.stringify(bookings));
    }

    function renderCalendar() {
        const title   = document.getElementById('cal-month-title');
        const grid    = document.getElementById('cal-grid');
        const slotsEl = document.getElementById('cal-slots');
        if (!grid) return;

        const year  = current.getFullYear();
        const month = current.getMonth();

        title.textContent = new Date(year, month, 1)
            .toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

        // Primer día de la semana (lunes = 0)
        const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();

        grid.innerHTML = '';

        // Celdas vacías
        for (let i = 0; i < firstDay; i++) {
            const empty = document.createElement('div');
            empty.className = 'cal-day empty';
            grid.appendChild(empty);
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const dayEl  = document.createElement('div');
            const date   = new Date(year, month, d);
            const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const isToday = date.toDateString() === today.toDateString();
            const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
            const hasBooking = bookings.some(b => b.date === dateStr && b.user === currentUser.user);

            dayEl.textContent = d;
            dayEl.className   = 'cal-day' +
                (isPast        ? ' past'        : ' available') +
                (isToday       ? ' today'       : '') +
                (hasBooking    ? ' has-booking' : '');

            if (!isPast) {
                dayEl.addEventListener('click', () => {
                    document.querySelectorAll('.cal-day.selected').forEach(el => el.classList.remove('selected'));
                    dayEl.classList.add('selected');
                    renderSlots(dateStr, slots, bookings, saveBookings, renderCalendar, renderBookings);
                });
            }

            grid.appendChild(dayEl);
        }

        slotsEl.style.display = 'none';
        renderBookings(bookings);
    }

    function renderSlots(dateStr, slots, bookings, saveBookings, renderCalendar, renderBookings) {
        const slotsEl   = document.getElementById('cal-slots');
        const slotsGrid = document.getElementById('cal-slots-grid');
        const slotsTitle = document.getElementById('cal-slots-title');

        const [y, m, d] = dateStr.split('-');
        slotsTitle.textContent = `Horas disponibles — ${d}/${m}/${y}`;
        slotsGrid.innerHTML = '';
        slotsEl.style.display = 'block';

        slots.forEach(hour => {
            const btn      = document.createElement('button');
            const existing = bookings.find(b => b.date === dateStr && b.hour === hour);
            const isMine   = existing && existing.user === currentUser.user;

            btn.textContent = hour;
            btn.className   = 'slot-btn' + (isMine ? ' mine' : existing ? ' booked' : '');

            if (!existing) {
                btn.addEventListener('click', () => {
                    bookings.push({ date: dateStr, hour, user: currentUser.user, name: currentUser.name });
                    saveBookings();
                    renderCalendar();
                    renderSlots(dateStr, slots, bookings, saveBookings, renderCalendar, renderBookings);
                });
            } else if (isMine) {
                btn.title = 'Tu reserva — haz clic para cancelar';
                btn.addEventListener('click', () => {
                    const idx = bookings.findIndex(b => b.date === dateStr && b.hour === hour && b.user === currentUser.user);
                    if (idx !== -1) bookings.splice(idx, 1);
                    saveBookings();
                    renderCalendar();
                    renderSlots(dateStr, slots, bookings, saveBookings, renderCalendar, renderBookings);
                });
            }

            slotsGrid.appendChild(btn);
        });
    }

    function renderBookings(bookings) {
        const myBookings = bookings
            .filter(b => b.user === currentUser.user)
            .sort((a, b) => a.date.localeCompare(b.date) || a.hour.localeCompare(b.hour));

        const container  = document.getElementById('cal-bookings');
        const list       = document.getElementById('bookings-list');
        if (!container || !list) return;

        if (myBookings.length === 0) {
            container.style.display = 'none';
            return;
        }

        container.style.display = 'block';
        list.innerHTML = '';

        myBookings.forEach(b => {
            const [y, m, d] = b.date.split('-');
            const li = document.createElement('li');
            li.innerHTML = `<span>📅 ${d}/${m}/${y} a las ${b.hour}</span>`;

            const cancelBtn = document.createElement('button');
            cancelBtn.className   = 'cancel-btn';
            cancelBtn.textContent = 'Cancelar';
            cancelBtn.addEventListener('click', () => {
                const idx = bookings.findIndex(bk => bk.date === b.date && bk.hour === b.hour && bk.user === currentUser.user);
                if (idx !== -1) bookings.splice(idx, 1);
                saveBookings();
                renderCalendar();
                const selected = document.querySelector('.cal-day.selected');
                if (selected) {
                    // Re-render slots si hay día seleccionado
                    const dateStr = b.date;
                    renderSlots(dateStr, slots, bookings, saveBookings, renderCalendar, renderBookings);
                }
            });

            li.appendChild(cancelBtn);
            list.appendChild(li);
        });
    }

    // Navegación mes
    document.getElementById('cal-prev').addEventListener('click', () => {
        current.setMonth(current.getMonth() - 1);
        renderCalendar();
    });

    document.getElementById('cal-next').addEventListener('click', () => {
        current.setMonth(current.getMonth() + 1);
        renderCalendar();
    });

    renderCalendar();
}