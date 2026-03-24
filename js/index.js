document.addEventListener('DOMContentLoaded', init);

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
                   rel="noopener noreferrer" aria-label="${link.name}"></a>`;
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
    const img = document.querySelector('.hero-image');
    if (img && data.image) {
        img.style.backgroundImage = `url('${data.image}')`;
        img.style.backgroundSize  = 'cover';
        img.style.backgroundPosition = 'center';
    }

    const text = document.querySelector('.hero-text');
    if (text && data.text) {
        text.innerHTML = data.text
            .split('\n\n')
            .map(p => `<p>${p}</p>`)
            .join('');
    }
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
    const list = document.getElementById('contact-list');
    if (list) {
        list.innerHTML = '';
        data.info.forEach(line => {
            list.innerHTML += `<li>${line}</li>`;
        });
    }

    const img = document.getElementById('contact-image');
    if (img && data.image) {
        img.style.backgroundImage = `url('${data.image}')`;
        img.style.backgroundSize  = 'cover';
    }

    const caption = document.getElementById('contact-caption');
    if (caption && data.caption) {
        caption.textContent = data.caption;
    }
}


// ─── RENDER ADOPTION LIST ─────────────────────────────────────────────────────
function renderAdoptionList(animals) {
    const sidebarTitle = document.querySelector('.sidebar-title');
    if (sidebarTitle) sidebarTitle.textContent = 'Filtrar por';

    const sidebarGroup = document.querySelector('.sidebar-group');
    if (sidebarGroup) {
        sidebarGroup.innerHTML = '';
        const breeds = ['Todos', ...new Set(animals.map(a => a.breed))];
        breeds.forEach(breed => {
            sidebarGroup.innerHTML += `
                <div class="filter-btn" data-filter="${breed === 'Todos' ? 'all' : breed}">
                    ${breed}
                </div>`;
        });
    }

    renderAnimalCards(animals);

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter   = btn.dataset.filter;
            const filtered = filter === 'all' ? animals : animals.filter(a => a.breed === filter);
            renderAnimalCards(filtered);
        });
    });
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

    const photo = document.querySelector('.dog-profile .photo-card');
    if (photo) {
        photo.style.backgroundImage = `url('${animal.image}')`;
        photo.style.backgroundSize  = 'cover';
        photo.setAttribute('aria-label', `Foto de ${animal.name}`);
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