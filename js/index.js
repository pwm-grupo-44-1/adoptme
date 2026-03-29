document.addEventListener('DOMContentLoaded', init);

// Usuario logueado unificado (usamos localStorage como en la V2)
let currentUser = JSON.parse(localStorage.getItem('userActive') || 'null');

const DB_PATH = '../data/db.json';
const TMPL = '../html/templates/';

// ─── UTILIDADES DE VISITAS ────────────────────────────────────────────────────
function getVisits(animalId) {
    const visits = JSON.parse(localStorage.getItem('adoptme_visits') || '{}');
    return visits[animalId] || 0;
}

function incrementVisit(animalId) {
    const visits = JSON.parse(localStorage.getItem('adoptme_visits') || '{}');
    visits[animalId] = (visits[animalId] || 0) + 1;
    localStorage.setItem('adoptme_visits', JSON.stringify(visits));
}

function isAdmin() {
    return currentUser && currentUser.type === 'admin';
}

// ─── UTILIDADES DE ANIMALES EN LOCALSTORAGE ───────────────────────────────────
function getStoredAnimals() {
    return JSON.parse(localStorage.getItem('adoptme_extra_animals') || '[]');
}

function saveStoredAnimals(animals) {
    localStorage.setItem('adoptme_extra_animals', JSON.stringify(animals));
}

function getAllAnimals(dbAnimals) {
    // 1. Obtenemos los IDs de los animales que hemos eliminado previamente
    const deletedIds = JSON.parse(localStorage.getItem('adoptme_deleted_animals') || '[]');

    // 2. Filtramos los animales del JSON para que NO incluyan los eliminados
    const activeDbAnimals = dbAnimals.filter(a => !deletedIds.includes(a.id));

    // 3. Juntamos los del JSON (filtrados) con los creados en localStorage
    return [...activeDbAnimals, ...getStoredAnimals()];
}

// Devuelve la imagen principal (compatible con formato antiguo y nuevo)
function getMainImage(animal) {
    if (Array.isArray(animal.images) && animal.images.length > 0) return animal.images[0];
    return animal.image || '';
}

// Devuelve las imágenes extra (todas menos la principal)
function getExtraImages(animal) {
    if (Array.isArray(animal.images) && animal.images.length > 1) return animal.images.slice(1);
    return [];
}

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
            renderSchedule(db.schedule); // Rescatado de la V1
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
    await loadTemplate(TMPL + 'template_footer.html', 'footer');

    renderFooter(db.footer);
    renderHeader(db.header, db.footer);

    await router(db);
    window.addEventListener('hashchange', () => router(db));

    let _deletedSnapshot = localStorage.getItem('adoptme_deleted_animals') || '[]';
    let _extraAnimalsSnapshot = localStorage.getItem('adoptme_extra_animals') || '[]';

    function _isOnListPage() {
        const hash = window.location.hash.slice(1).split('?')[0] || 'home';
        return hash === 'adoption_list';
    }

    setInterval(() => {
        const deletedNow = localStorage.getItem('adoptme_deleted_animals') || '[]';
        const extraNow = localStorage.getItem('adoptme_extra_animals') || '[]';

        const deletedChanged = deletedNow !== _deletedSnapshot;
        const extraChanged = extraNow !== _extraAnimalsSnapshot;

        if ((deletedChanged || extraChanged) && _isOnListPage()) {
            _deletedSnapshot = deletedNow;
            _extraAnimalsSnapshot = extraNow;
            router(db);
        } else {
            _deletedSnapshot = deletedNow;
            _extraAnimalsSnapshot = extraNow;
        }
    }, 500);

    window.addEventListener('storage', (e) => {
        if ((e.key === 'adoptme_deleted_animals' || e.key === 'adoptme_extra_animals') && _isOnListPage()) {
            _deletedSnapshot = localStorage.getItem('adoptme_deleted_animals') || '[]';
            _extraAnimalsSnapshot = localStorage.getItem('adoptme_extra_animals') || '[]';
            router(db);
        }
    });
}

// ─── RENDER HEADER (Versión Avanzada V2) ──────────────────────────────────────
function renderHeader(headerData, footerData) {
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.style.backgroundImage = `url('${headerData.logo}')`;
        logo.style.backgroundSize = 'cover';
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
                   <i class="bi ${link.icon || ''}"></i>
                </a>`;
        });
    }

    const nav = document.querySelector('.main-nav');
    if (!nav) return;

    nav.innerHTML = '';

    const addedUrls = new Set();

    function appendLink(link, extraClass = '') {
        if (!link || !link.url || addedUrls.has(link.url)) return;

        const a = document.createElement('a');
        a.className = `btn ${extraClass}`.trim();

        if (link.url === '#login' || link.name === 'Acceder') {
            a.classList.add('login-link');
        }

        a.textContent = link.name;
        a.href = link.url;

        nav.appendChild(a);
        addedUrls.add(link.url);
    }

    function appendUserBlock() {
        const container = document.createElement('div');
        container.className = 'btn user-nav-stack login-link';

        const nameLabel = document.createElement('span');
        nameLabel.className = 'user-nav-name';
        nameLabel.textContent = `${currentUser.name}`;

        const logoutBtn = document.createElement('a');
        logoutBtn.className = 'btn-logout-nav';
        logoutBtn.textContent = 'Cerrar Sesión';
        logoutBtn.href = '#home';

        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('userActive');
            currentUser = null;
            alert('Has cerrado sesión. ¡Vuelve pronto!');
            location.reload();
        });

        container.appendChild(nameLabel);
        container.appendChild(logoutBtn);
        nav.appendChild(container);
    }

    const headerLinks = Array.isArray(headerData.navLinks) ? headerData.navLinks : [];
    const footerLinks = Array.isArray(footerData?.navLinks) ? footerData.navLinks : [];

    const normalHeaderLinks = headerLinks.filter(
        link => link.url !== '#login' && link.name !== 'Acceder'
    );

    const loginHeaderLink = headerLinks.find(
        link => link.url === '#login' || link.name === 'Acceder'
    );

    // 1. Enlaces normales del header: visibles siempre
    normalHeaderLinks.forEach(link => appendLink(link));

    // 2. Enlaces del footer: solo para drawer móvil
    footerLinks.forEach(link => appendLink(link, 'drawer-only-link'));

    // 3. Login / usuario siempre al final
    if (currentUser) {
        appendUserBlock();
    } else if (loginHeaderLink) {
        appendLink(loginHeaderLink);
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

// ─── RENDER HOME (Carrusel Infinito) ────────────────────────────────────────
function renderHome(data) {
    const text = document.getElementById('hero-text');
    if (text && data.text) {
        text.innerHTML = data.text
            .split('\n\n')
            .map(p => `<p>${p}</p>`)
            .join('');
    }

    const images = data.images || (data.image ? [data.image] : []);
    if (!images.length) return;

    const track = document.getElementById('carousel-track');
    const dots = document.getElementById('carousel-dots');
    if (!track) return;

    // Si solo hay 1 imagen, simplemente la mostramos y cancelamos el carrusel
    if (images.length === 1) {
        track.innerHTML = `<div class="carousel-slide" style="background-image: url('${images[0]}')"></div>`;
        if (dots) dots.innerHTML = '';
        return;
    }

    let current = 1; // El índice 1 será nuestra primera imagen "real"
    let autoTimer;
    let isTransitioning = false; // Evita clics rápidos que rompan la animación

    track.innerHTML = '';

    // 1. Clonamos la ÚLTIMA imagen y la ponemos al principio (para cuando le den a la flecha "Atrás")
    const lastClone = document.createElement('div');
    lastClone.className = 'carousel-slide';
    lastClone.style.backgroundImage = `url('${images[images.length - 1]}')`;
    lastClone.dataset.clone = 'last';
    track.appendChild(lastClone);

    // 2. Insertamos las imágenes REALES
    images.forEach(src => {
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        slide.style.backgroundImage = `url('${src}')`;
        track.appendChild(slide);
    });

    // 3. Clonamos la PRIMERA imagen y la ponemos al final (para el avance infinito)
    const firstClone = document.createElement('div');
    firstClone.className = 'carousel-slide';
    firstClone.style.backgroundImage = `url('${images[0]}')`;
    firstClone.dataset.clone = 'first';
    track.appendChild(firstClone);

    // Estado inicial: Nos saltamos el primer clon y mostramos la imagen real 1 sin animación
    track.style.transition = 'none';
    track.style.transform = `translateX(-100%)`;

    // ── Puntos indicadores ──
    if (dots) {
        dots.innerHTML = '';
        images.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
            dot.addEventListener('click', () => {
                if (isTransitioning) return;
                goTo(i + 1); // +1 porque el índice 0 es el clon trasero
            });
            dots.appendChild(dot);
        });
    }

    function updateDots() {
        if (!dots) return;
        let dotIndex = current - 1;
        // Ajustamos los índices si estamos sobre un clon
        if (current === images.length + 1) dotIndex = 0;
        if (current === 0) dotIndex = images.length - 1;

        document.querySelectorAll('.carousel-dot').forEach((d, i) => {
            d.classList.toggle('active', i === dotIndex);
        });
    }

    function goTo(index) {
        if (isTransitioning) return;
        isTransitioning = true;
        current = index;

        // Hacemos el movimiento suave (asegúrate de no tener "transition" puesto fijo en tu CSS de .carousel-track)
        track.style.transition = 'transform 0.5s ease-in-out';
        track.style.transform = `translateX(-${current * 100}%)`;

        updateDots();
        resetAuto();
    }

    // ── MAGIA INFINITA: Detectamos cuándo termina la animación ──
    track.addEventListener('transitionend', () => {
        isTransitioning = false;
        const slides = track.children;

        // Si acabamos de llegar al clon del final (falso principio)...
        if (slides[current].dataset.clone === 'first') {
            track.style.transition = 'none'; // Quitamos la animación
            current = 1;                     // Nos teletransportamos al principio real
            track.style.transform = `translateX(-${current * 100}%)`;
        }

        // Si acabamos de llegar al clon del principio (falso final)...
        if (slides[current].dataset.clone === 'last') {
            track.style.transition = 'none'; // Quitamos la animación
            current = images.length;         // Nos teletransportamos al final real
            track.style.transform = `translateX(-${current * 100}%)`;
        }
    });

    function resetAuto() {
        clearInterval(autoTimer);
        autoTimer = setInterval(() => goTo(current + 1), 4000); // 4 segundos
    }

    // Controles de las flechas (si las tienes en el HTML)
    document.querySelector('.carousel-prev')?.addEventListener('click', () => goTo(current - 1));
    document.querySelector('.carousel-next')?.addEventListener('click', () => goTo(current + 1));

    resetAuto();
}

// ─── RENDER BASIC PAGES ───────────────────────────────────────────────────────
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

function renderFaq(faqData) {
    const container = document.getElementById('faq-item');
    if (!container) return;
    container.innerHTML = '';
    faqData.forEach(item => {
        container.innerHTML += `
            <div class="faq-group">
                <label class="faq-question">
                    <input type="checkbox" class="faq-toggle" />
                    ${item.question}
                </label>
                <div class="faq-answer"><p>${item.answer}</p></div>
            </div>`;
    });
}

function renderLegal(legalData) {
    const container = document.getElementById('faq-item');
    if (!container) return;
    container.innerHTML = '';
    legalData.forEach(item => {
        container.innerHTML += `
            <div class="faq-group">
                <label class="faq-question">
                    <input type="checkbox" class="faq-toggle" />
                    ${item.title}
                </label>
                <div class="faq-answer"><p>${item.content}</p></div>
            </div>`;
    });
}

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

// ─── RENDER CONTACT US (Versión Avanzada V1) ──────────────────────────────────
function renderContactUs(data) {
    const title = document.getElementById('contact-title');
    if (title && data.title) title.textContent = data.title;

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

    const map = document.getElementById('contact-map-iframe');
    if (map && data.mapUrl) map.src = data.mapUrl;

    const list = document.getElementById('contact-list');
    if (list && data.info) {
        list.innerHTML = '';
        data.info.forEach(line => {
            list.innerHTML += `<li>${line}</li>`;
        });
    }
}

// ─── RENDER ADOPTION LIST (Versión Avanzada Filtros V1) ───────────────────────
function renderAdoptionList(dbAnimals) {

    // Mezclamos los animales del db.json con los guardados en localStorage y quitamos los eliminados
    const animals = getAllAnimals(dbAnimals);

    // ── Panel de administrador ──
    const adminPanel = document.getElementById('admin-panel');
    if (adminPanel && isAdmin()) {
        adminPanel.style.display = 'block';

        const toggleBtn = document.getElementById('admin-toggle-btn');
        const form = document.getElementById('admin-add-form');
        const cancelBtn = document.getElementById('admin-cancel-btn');

        toggleBtn.addEventListener('click', () => {
            const open = form.style.display !== 'none';
            form.style.display = open ? 'none' : 'block';
            toggleBtn.setAttribute('aria-expanded', String(!open));
        });

        cancelBtn.addEventListener('click', () => {
            form.style.display = 'none';
            toggleBtn.setAttribute('aria-expanded', 'false');
            form.reset();
            document.getElementById('admin-file-name').textContent = 'Ningún archivo seleccionado';
        });

        // ── Botón personalizado de imagen ──
        const fileBtn = document.getElementById('admin-file-btn');
        const fileInput = document.getElementById('admin-image');
        const fileName = document.getElementById('admin-file-name');

        fileBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', () => {
            const count = fileInput.files.length;
            fileName.textContent = count === 0
                ? 'Ningún archivo seleccionado'
                : count === 1
                    ? fileInput.files[0].name
                    : `${count} imágenes seleccionadas (principal: ${fileInput.files[0].name})`;
        });

        form.addEventListener('submit', e => {
            e.preventDefault();

            const name = document.getElementById('admin-name').value.trim();
            const breed = document.getElementById('admin-breed').value.trim();
            const gender = document.getElementById('admin-gender').value;
            const age = parseInt(document.getElementById('admin-age').value);
            const weight = document.getElementById('admin-weight').value.trim();
            const hair = document.getElementById('admin-hair').value.trim();
            const mood = document.getElementById('admin-mood').value.trim();
            const imageInput = document.getElementById('admin-image');
            const description = document.getElementById('admin-description').value.trim();
            const files = Array.from(imageInput.files);

            if (!name || !breed || !gender || isNaN(age) || !weight || !hair || !mood || files.length === 0 || !description) {
                alert('Por favor, rellena todos los campos obligatorios.');
                return;
            }

            // Comprobamos tamaño máximo por archivo (1 MB)
            const MAX_SIZE_MB = 1;
            const tooBig = files.find(f => f.size > MAX_SIZE_MB * 1024 * 1024);
            if (tooBig) {
                alert(`"${tooBig.name}" supera el límite de ${MAX_SIZE_MB} MB por imagen.`);
                return;
            }

            // Convertimos todos los archivos a base64 en paralelo
            const readFile = f => new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = ev => resolve(ev.target.result);
                reader.onerror = () => reject(new Error(`Error leyendo ${f.name}`));
                reader.readAsDataURL(f);
            });

            Promise.all(files.map(readFile))
                .then(images => {
                    const allIds = animals.map(a => a.id);
                    const newId = allIds.length > 0 ? Math.max(...allIds) + 1 : 1;

                    const newAnimal = {
                        id: newId,
                        name,
                        breed,
                        gender,
                        description,
                        age,
                        mood,
                        weight,
                        'hair type': hair,
                        images,   // array: images[0] = principal, resto = galería
                        clicks: 0
                    };

                    const stored = getStoredAnimals();
                    stored.push(newAnimal);
                    saveStoredAnimals(stored);
                    animals.push(newAnimal);

                    fillSelect('filter-breed', animals.map(a => a.breed));
                    fillSelect('filter-hair', animals.map(a => a['hair type']));
                    fillSelect('filter-mood', animals.map(a => a.mood));

                    form.reset();
                    document.getElementById('admin-file-name').textContent = 'Ningún archivo seleccionado';
                    form.style.display = 'none';
                    toggleBtn.setAttribute('aria-expanded', 'false');

                    applyFilters();
                    alert(`✅ ¡Animal "${name}" añadido con ${images.length} foto${images.length !== 1 ? 's' : ''}!`);
                })
                .catch(err => alert(err.message));
        });
    }

    function parseWeight(w) { return parseFloat(w) || 0; }
    function weightRange(w) {
        const kg = parseWeight(w);
        if (kg <= 5) return 'Pequeño (≤5kg)';
        if (kg <= 15) return 'Mediano (6-15kg)';
        return 'Grande (>15kg)';
    }
    function ageRange(age) {
        if (age <= 2) return 'Cachorro (0-2 años)';
        if (age <= 6) return 'Adulto (3-6 años)';
        return 'Senior (7+ años)';
    }

    // NUEVO: Función para rellenar checkboxes dinámicos de forma segura
    function fillCheckboxes(id, values) {
        const container = document.getElementById(id);
        if (!container) return;

        const unique = [...new Set(values)].sort();

        unique.forEach(v => {
            // Buscamos si ya existe la casilla (escapando comillas por seguridad)
            const exists = container.querySelector(`input[value="${v.replace(/"/g, '\\"')}"]`);
            if (!exists) {
                // Usamos insertAdjacentHTML en vez de innerHTML += para NO borrar
                // el estado (marcado/desmarcado) de los filtros que el usuario ya estaba usando
                container.insertAdjacentHTML('beforeend', `<label><input type="checkbox" value="${v}"> ${v}</label>`);
            }
        });
    }

    fillCheckboxes('filter-breed', animals.map(a => a.breed));
    fillCheckboxes('filter-hair', animals.map(a => a['hair type']));
    fillCheckboxes('filter-mood', animals.map(a => a.mood));

    // NUEVO: Función para recuperar sesión
    function restoreSession() {
        ['filter-gender', 'filter-breed', 'filter-age', 'filter-weight', 'filter-hair', 'filter-mood'].forEach(id => {
            let saved = [];
            try {
                // Intentamos leerlo con el nuevo formato (Array)
                saved = JSON.parse(sessionStorage.getItem('filter_' + id) || '[]');
                // Si por alguna razón no es un array, forzamos a que lo sea
                if (!Array.isArray(saved)) saved = [];
            } catch (error) {
                // Si falla (porque había guardado un "all" de la versión vieja), lo limpiamos
                saved = [];
                sessionStorage.removeItem('filter_' + id);
            }

            const container = document.getElementById(id);
            if (container) {
                container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                    cb.checked = saved.includes(cb.value);
                });
            }
        });
        const savedSort = sessionStorage.getItem('filter_sort-select');
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect && savedSort) sortSelect.value = savedSort;
    }

    // NUEVO: Función para obtener los valores marcados
    function getCheckedValues(id) {
        const container = document.getElementById(id);
        if (!container) return [];
        return Array.from(container.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
    }

    function applyFilters() {
        const genders = getCheckedValues('filter-gender');
        const breeds = getCheckedValues('filter-breed');
        const ages = getCheckedValues('filter-age');
        const weights = getCheckedValues('filter-weight');
        const hairs = getCheckedValues('filter-hair');
        const moods = getCheckedValues('filter-mood');
        const sort = document.getElementById('sort-select')?.value || '';

        // Guardar sesión (ahora guardamos arrays)
        sessionStorage.setItem('filter_filter-gender', JSON.stringify(genders));
        sessionStorage.setItem('filter_filter-breed', JSON.stringify(breeds));
        sessionStorage.setItem('filter_filter-age', JSON.stringify(ages));
        sessionStorage.setItem('filter_filter-weight', JSON.stringify(weights));
        sessionStorage.setItem('filter_filter-hair', JSON.stringify(hairs));
        sessionStorage.setItem('filter_filter-mood', JSON.stringify(moods));
        sessionStorage.setItem('filter_sort-select', sort);

        let result = animals.filter(a => {
            // Si el array tiene algo (usuario marcó opciones), filtramos. Si está vacío (longitud 0), pasan todos.
            if (genders.length > 0 && !genders.includes(a.gender)) return false;
            if (breeds.length > 0 && !breeds.includes(a.breed)) return false;
            if (ages.length > 0 && !ages.includes(ageRange(a.age))) return false;
            if (weights.length > 0 && !weights.includes(weightRange(a.weight))) return false;
            if (hairs.length > 0 && !hairs.includes(a["hair type"])) return false;
            if (moods.length > 0 && !moods.includes(a.mood)) return false;
            return true;
        });

        if (sort === 'age-asc') result.sort((a, b) => a.age - b.age);
        if (sort === 'age-desc') result.sort((a, b) => b.age - a.age);
        if (sort === 'weight-asc') result.sort((a, b) => parseWeight(a.weight) - parseWeight(b.weight));
        if (sort === 'weight-desc') result.sort((a, b) => parseWeight(b.weight) - parseWeight(a.weight));

        const count = document.getElementById('results-count');
        if (count) count.textContent = `${result.length} mascota${result.length !== 1 ? 's' : ''} encontrada${result.length !== 1 ? 's' : ''}`;

        renderAnimalCards(result);
    }

    restoreSession();

    // Detectar cambios en cualquier checkbox o select
    document.querySelector('.filter-accordion')?.addEventListener('change', applyFilters);

    document.getElementById('filter-reset')?.addEventListener('click', () => {
        document.querySelectorAll('.filter-accordion input[type="checkbox"]').forEach(cb => cb.checked = false);
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) sortSelect.value = "";

        ['filter-gender', 'filter-breed', 'filter-age', 'filter-weight', 'filter-hair', 'filter-mood', 'sort-select'].forEach(id => {
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

    const admin = isAdmin();

    animals.forEach(animal => {
        const visits = admin ? getVisits(animal.id) : 0;

        const card = document.createElement('div');
        card.className = 'item-list';
        card.innerHTML = `
            <div class="photo-btn-column">
                <a href="#pet_profile?id=${animal.id}">
                    <img class="photo-card-list" src="${getMainImage(animal)}" alt="Foto de ${animal.name}">
                </a>
                <a class="btn-pet-detail" href="#pet_profile?id=${animal.id}">Ver perfil</a>
                ${admin ? `
                <div class="admin-card-actions">
                    <span class="visit-badge">👁️ ${visits} visita${visits !== 1 ? 's' : ''}</span>
                    <button class="btn-delete-animal" title="Eliminar animal">🗑️ Eliminar</button>
                </div>` : ''}
            </div>
            <div class="pet-profile-text">
                <ul>
                    <li><strong>Nombre:</strong> ${animal.name}</li>
                    <li><strong>Raza:</strong> ${animal.breed}</li>
                    <li><strong>Género:</strong> ${animal.gender === 'Male' ? '<i class="bi bi-gender-male"></i> Macho' : animal.gender === 'Female' ? '<i class="bi bi-gender-female"></i> Hembra' : '-'}</li>
                    <li><strong>Edad:</strong> ${animal.age} años</li>
                    <li><strong>Peso:</strong> ${animal.weight}</li>
                    <li><strong>Pelo:</strong> ${animal["hair type"]}</li>
                    <li><strong>Carácter:</strong> ${animal.mood}</li>
                </ul>
            </div>`;

        if (admin) {
            card.querySelector('.btn-delete-animal').addEventListener('click', () => {
                if (!confirm(`¿Seguro que quieres eliminar a ${animal.name}?`)) return;

                // NUEVO: Guardar el ID en la lista de eliminados en localStorage
                const deletedIds = JSON.parse(localStorage.getItem('adoptme_deleted_animals') || '[]');
                if (!deletedIds.includes(animal.id)) {
                    deletedIds.push(animal.id);
                    localStorage.setItem('adoptme_deleted_animals', JSON.stringify(deletedIds));
                }

                // Si es un animal de localStorage, lo borramos de allí
                const stored = getStoredAnimals();
                const storedIdx = stored.findIndex(a => a.id === animal.id);
                if (storedIdx !== -1) {
                    stored.splice(storedIdx, 1);
                    saveStoredAnimals(stored);
                }

                // Lo eliminamos del array en memoria (tanto db como localStorage)
                const memIdx = animals.findIndex(a => a.id === animal.id);
                if (memIdx !== -1) animals.splice(memIdx, 1);

                card.remove();

                // Actualizar contador de resultados
                const count = document.getElementById('results-count');
                const visible = container.querySelectorAll('.item-list').length;
                if (count) count.textContent = `${visible} mascota${visible !== 1 ? 's' : ''} encontrada${visible !== 1 ? 's' : ''}`;
            });
        }

        container.appendChild(card);
    });
}

// ─── RENDER PET PROFILE ───────────────────────────────────────────────────────
function renderPetProfile(dbAnimals) {
    const animals = getAllAnimals(dbAnimals);
    const hashParams = window.location.hash.split('?')[1] || '';
    const params = new URLSearchParams(hashParams);
    const id = parseInt(params.get('id'));

    const animal = animals.find(a => a.id === id) || animals[0];
    if (!animal) return;

    // Registrar visita (solo si el ID venía en la URL, no en el fallback)
    if (params.get('id')) incrementVisit(animal.id);

    const boxes = document.querySelectorAll('.box-text');
    if (boxes.length >= 5) {
        boxes[0].textContent = `Nombre: ${animal.name}`;
        boxes[1].textContent = `Raza: ${animal.breed} · Edad: ${animal.age} años`;
        boxes[2].textContent = `Peso: ${animal.weight} · Pelo: ${animal["hair type"]}`;
        boxes[3].textContent = `Carácter: ${animal.mood}`;
        boxes[4].textContent = animal.description;
    }

    // ── Carrusel de fotos ──
    const allImages = [getMainImage(animal), ...getExtraImages(animal)].filter(Boolean);
    const track = document.querySelector('.profile-carousel-track');

    if (track) {
        track.innerHTML = '';
        allImages.forEach(src => {
            const img = document.createElement('img');
            img.className = 'profile-carousel-slide';
            img.src = src;
            img.alt = `Foto de ${animal.name}`;
            track.appendChild(img);
        });

        let current = 0;
        const total = allImages.length;

        const goTo = (index) => {
            current = (index + total) % total;
            track.style.transform = `translateX(-${current * 100}%)`;
        };

        document.querySelector('.profile-carousel-prev')?.addEventListener('click', () => goTo(current - 1));
        document.querySelector('.profile-carousel-next')?.addEventListener('click', () => goTo(current + 1));

        // Ocultar botones si solo hay una foto
        if (total <= 1) {
            document.querySelector('.profile-carousel-prev').style.visibility = 'hidden';
            document.querySelector('.profile-carousel-next').style.visibility = 'hidden';
        }
    }

    // Eliminar galería separada si existiera de antes
    const existingGallery = document.getElementById('pet-gallery');
    if (existingGallery) existingGallery.remove();
}

// ─── LOGIN (Versión Directa) ──────────────────────────────────────────────
function initLogin(users) {
    const form = document.getElementById('auth-form');
    if (!form) return;

    const regFields = document.querySelectorAll('.reg-only');
    const btnLogin = document.getElementById('btn-login');
    const btnRegister = document.getElementById('btn-register');

    // Funcionalidad del ojito para ver la contraseña
    document.querySelectorAll('.toggle-password').forEach(ojo => {
        ojo.addEventListener('click', function () {
            const input = this.previousElementSibling;
            if (input.type === "password") {
                input.type = "text";
                this.style.color = "#111211";
            } else {
                input.type = "password";
                this.style.color = "#10946d";
            }
        });
    });

    const esEmailValido = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const esTelefonoValido = (tel) => /^[6789]\d{8}$/.test(tel);
    const esPasswordSegura = (pass) => {
        const reglas = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
        return reglas.test(pass);
    };

    // ── MODO INICIAR SESIÓN (Por defecto) ──
    function setLoginMode() {
        regFields.forEach(field => {
            field.classList.add('hidden');
            field.removeAttribute('required');
        });
        btnLogin.classList.remove('secondary');
        btnRegister.classList.add('secondary');
        btnLogin.textContent = "Iniciar Sesión";
        btnLogin.type = "submit";
    }

    // ── MODO REGISTRO ──
    function setRegisterMode() {
        regFields.forEach(field => {
            field.classList.remove('hidden');
            field.setAttribute('required', '');
        });
        btnRegister.classList.remove('secondary');
        btnLogin.classList.add('secondary');
        btnLogin.textContent = "Iniciar Sesión"; // Cambiamos el texto para que pueda volver
        btnLogin.type = "button"; // Evita que envíe el formulario al cambiar de modo
    }

    // Inicializamos en modo Login al entrar a la página
    setLoginMode();

    // Eventos de los botones para cambiar entre modos
    btnRegister.addEventListener('click', (e) => {
        if (btnRegister.classList.contains('secondary')) {
            e.preventDefault(); // Evita que recargue si estuviera en submit
            setRegisterMode();
        } else {
            // Si ya estamos en modo registro, este botón actúa como submit para registrar
            form.dispatchEvent(new Event('submit'));
        }
    });

    btnLogin.addEventListener('click', (e) => {
        if (btnLogin.classList.contains('secondary')) {
            e.preventDefault(); // Evita envío
            setLoginMode();     // Vuelve al modo login
        }
    });

    // ── MANEJO DEL ENVÍO DEL FORMULARIO ──
    form.addEventListener('submit', e => {
        e.preventDefault();

        const email = document.getElementById('register-email').value;
        const pass = document.getElementById('register-password').value;
        const isLoginMode = regFields[0].classList.contains('hidden');

        // Validaciones comunes
        if (!esEmailValido(email)) return alert("El correo no parece válido.");

        if (isLoginMode) {
            // LÓGICA DE INICIO DE SESIÓN
            const encontrado = users.find(u => u.email === email && u.password === pass);
            if (encontrado) {
                localStorage.setItem('userActive', JSON.stringify(encontrado));
                currentUser = encontrado;
                alert(`¡Bienvenido de nuevo, ${encontrado.name}!`);
                window.location.hash = '#home';
                location.reload();
            } else {
                alert('Correo o contraseña incorrectos.');
            }
        } else {
            // LÓGICA DE REGISTRO
            const tel = document.getElementById('register-phone').value;
            const repass = document.getElementById('register-repassword').value;

            if (!esPasswordSegura(pass)) return alert("La contraseña es muy débil. Necesitas 8 caracteres, una mayúscula, un número y un símbolo.");
            if (!esTelefonoValido(tel)) return alert("El teléfono debe tener 9 números y empezar por 6,7,8,9.");
            if (pass !== repass) return alert("¡Las contraseñas no coinciden!");

            // (Aquí podrías guardar el nuevo usuario en un array o LocalStorage si quisieras)
            alert('¡Te has registrado correctamente! Ahora puedes iniciar sesión.');
            setLoginMode(); // Le devolvemos a la pantalla de login
            document.getElementById('register-password').value = '';
            document.getElementById('register-repassword').value = '';
        }
    });
}

// ─── RENDER SCHEDULE (Versión Calendario V1 Adaptada) ─────────────────────────
function renderSchedule(scheduleData) {
    const loginMsg = document.getElementById('schedule-login-msg');
    const app = document.getElementById('schedule-app');

    if (!currentUser) {
        if (loginMsg) loginMsg.style.display = 'block';
        if (app) app.style.display = 'none';
        return;
    }

    if (loginMsg) loginMsg.style.display = 'none';
    if (app) app.style.display = 'block';

    initCalendar(scheduleData);
}

function initCalendar(scheduleData) {
    const slots = scheduleData ? scheduleData.slots : ['10:00', '11:00', '12:00', '13:00', '16:00', '17:00', '18:00'];
    const bookings = JSON.parse(sessionStorage.getItem('adoptme_bookings') || '[]');

    let current = new Date();
    current.setDate(1);

    function saveBookings() {
        sessionStorage.setItem('adoptme_bookings', JSON.stringify(bookings));
    }

    function renderCalendar() {
        const title = document.getElementById('cal-month-title');
        const grid = document.getElementById('cal-grid');
        const slotsEl = document.getElementById('cal-slots');
        if (!grid) return;

        const year = current.getFullYear();
        const month = current.getMonth();

        title.textContent = new Date(year, month, 1)
            .toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

        const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();

        grid.innerHTML = '';

        for (let i = 0; i < firstDay; i++) {
            const empty = document.createElement('div');
            empty.className = 'cal-day empty';
            grid.appendChild(empty);
        }

        // Usamos email como identificador único de usuario si no hay 'user'
        const userId = currentUser.user || currentUser.email;

        for (let d = 1; d <= daysInMonth; d++) {
            const dayEl = document.createElement('div');
            const date = new Date(year, month, d);
            const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const isToday = date.toDateString() === today.toDateString();
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const hasBooking = bookings.some(b => b.date === dateStr && b.userId === userId);

            dayEl.textContent = d;
            dayEl.className = 'cal-day' +
                (isPast ? ' past' : ' available') +
                (isToday ? ' today' : '') +
                (hasBooking ? ' has-booking' : '');

            if (!isPast) {
                dayEl.addEventListener('click', () => {
                    document.querySelectorAll('.cal-day.selected').forEach(el => el.classList.remove('selected'));
                    dayEl.classList.add('selected');
                    renderSlots(dateStr, slots, bookings, saveBookings, renderCalendar, renderBookings, userId);
                });
            }
            grid.appendChild(dayEl);
        }

        slotsEl.style.display = 'none';
        renderBookings(bookings, userId);
    }

    function renderSlots(dateStr, slots, bookings, saveBookings, renderCalendar, renderBookings, userId) {
        const slotsEl = document.getElementById('cal-slots');
        const slotsGrid = document.getElementById('cal-slots-grid');
        const slotsTitle = document.getElementById('cal-slots-title');

        const [y, m, d] = dateStr.split('-');
        slotsTitle.textContent = `Horas disponibles — ${d}/${m}/${y}`;
        slotsGrid.innerHTML = '';
        slotsEl.style.display = 'block';

        slots.forEach(hour => {
            const btn = document.createElement('button');
            const existing = bookings.find(b => b.date === dateStr && b.hour === hour);
            const isMine = existing && existing.userId === userId;

            btn.textContent = hour;
            btn.className = 'slot-btn' + (isMine ? ' mine' : existing ? ' booked' : '');

            if (!existing) {
                btn.addEventListener('click', () => {
                    bookings.push({ date: dateStr, hour, userId: userId, name: currentUser.name });
                    saveBookings();
                    renderCalendar();
                    renderSlots(dateStr, slots, bookings, saveBookings, renderCalendar, renderBookings, userId);
                });
            } else if (isMine) {
                btn.title = 'Tu reserva — haz clic para cancelar';
                btn.addEventListener('click', () => {
                    const idx = bookings.findIndex(b => b.date === dateStr && b.hour === hour && b.userId === userId);
                    if (idx !== -1) bookings.splice(idx, 1);
                    saveBookings();
                    renderCalendar();
                    renderSlots(dateStr, slots, bookings, saveBookings, renderCalendar, renderBookings, userId);
                });
            }
            slotsGrid.appendChild(btn);
        });
    }

    function renderBookings(bookings, userId) {
        const myBookings = bookings
            .filter(b => b.userId === userId)
            .sort((a, b) => a.date.localeCompare(b.date) || a.hour.localeCompare(b.hour));

        const container = document.getElementById('cal-bookings');
        const list = document.getElementById('bookings-list');
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
            cancelBtn.className = 'cancel-btn';
            cancelBtn.textContent = 'Cancelar';
            cancelBtn.addEventListener('click', () => {
                const idx = bookings.findIndex(bk => bk.date === b.date && bk.hour === b.hour && bk.userId === userId);
                if (idx !== -1) bookings.splice(idx, 1);
                saveBookings();
                renderCalendar();
                const selected = document.querySelector('.cal-day.selected');
                if (selected) {
                    renderSlots(b.date, slots, bookings, saveBookings, renderCalendar, renderBookings, userId);
                }
            });

            li.appendChild(cancelBtn);
            list.appendChild(li);
        });
    }

    document.getElementById('cal-prev').addEventListener('click', (e) => {
        current.setMonth(current.getMonth() - 1);
        renderCalendar();
        e.currentTarget.blur(); // <-- MAGIA: Le quita el estado "pillado" al botón
    });

    document.getElementById('cal-next').addEventListener('click', (e) => {
        current.setMonth(current.getMonth() + 1);
        renderCalendar();
        e.currentTarget.blur(); // <-- MAGIA: Le quita el estado "pillado" al botón
    });

    renderCalendar();
}

//--En modo responsive móvil, cierra menú lateral cuando se pulsa uno de los enlaces o fuera de dicho menú--//
(() => {
    const MOBILE_BREAKPOINT = 576;

    function getNavToggle() {
        return document.getElementById("nav-toggle");
    }

    function closeMobileMenu() {
        const navToggle = getNavToggle();
        if (navToggle) {
            navToggle.checked = false;
        }
    }

    document.addEventListener("click", (event) => {
        const clickedLink = event.target.closest(".main-nav a");

        if (clickedLink && window.innerWidth <= MOBILE_BREAKPOINT) {
            // dejamos que el enlace dispare primero la navegación
            requestAnimationFrame(() => {
                closeMobileMenu();
            });
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeMobileMenu();
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > MOBILE_BREAKPOINT) {
            closeMobileMenu();
        }
    });
})();