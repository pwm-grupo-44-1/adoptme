document.addEventListener('DOMContentLoaded', init);

const DB_PATH            = '../data/db.json';
const ADOPTION_LIST_PATH = '../data/adoption_list.json';
const TMPL               = '../html/templates/';


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


async function fetchAnimals() {
    try {
        const res  = await fetch(ADOPTION_LIST_PATH);
        if (!res.ok) throw new Error('No se pudo cargar adoption_list.json');
        const data = await res.json();
        return data.animals;
    } catch (err) {
        console.error(err);
        return [];
    }
}


// ─── ROUTER ───────────────────────────────────────────────────────────────────
// Lee el hash de la URL y decide qué template cargar.
// El hash es la parte después del #:
//   index.html#adoption_list  →  hash = 'adoption_list'
//   index.html#pet_profile?id=3  →  hash = 'pet_profile'
// ─────────────────────────────────────────────────────────────────────────────
async function router(db) {

    // window.location.hash devuelve '#adoption_list' o '' si no hay hash
    // .slice(1) quita el # del principio → 'adoption_list'
    // .split('?')[0] quita los parámetros → por si hay ?id=3
    const hash = window.location.hash.slice(1).split('?')[0] || 'home';

    // Scrollamos arriba al cambiar de página
    window.scrollTo(0, 0);

    switch (hash) {

        case 'home':
        case '':
            await loadTemplate(TMPL + 'template_home.html', 'main');
            break;

        case 'adoption_list':
            await loadTemplate(TMPL + 'template_adoption_list.html', 'main');
            const animals = await fetchAnimals();
            renderAdoptionList(animals);
            break;

        case 'pet_profile':
            await loadTemplate(TMPL + 'template_pet_profile.html', 'main');
            const allAnimals = await fetchAnimals();
            renderPetProfile(allAnimals);
            break;

        case 'login':
            await loadTemplate(TMPL + 'template_login.html', 'main');
            break;

        case 'about_us':
            await loadTemplate(TMPL + 'template_about_us.html', 'main');
            break;

        case 'stories':
            await loadTemplate(TMPL + 'template_stories.html', 'main');
            break;

        case 'faq':
            await loadTemplate(TMPL + 'template_faq.html', 'main');
            break;

        case 'legal':
            await loadTemplate(TMPL + 'template_legal.html', 'main');
            break;

        case 'contact_us':
            await loadTemplate(TMPL + 'template_contact_us.html', 'main');
            break;

        case 'schedule':
            await loadTemplate(TMPL + 'template_schedule.html', 'main');
            break;

        default:
            // Si el hash no existe mostramos el home
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

    // Cargamos la página inicial según el hash actual
    await router(db);

    // Escuchamos el evento 'hashchange':
    // Se dispara cada vez que el hash de la URL cambia (cuando el usuario hace click en un enlace)
    // SIN recargar la página → simplemente llamamos al router de nuevo
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
                        <img class="photo-card" src="${animal.image}" alt="Foto de ${animal.name}">
                    </a>
                    <a class="btn-pet-detail" href="#pet_profile?id=${animal.id}">
                        Ver perfil
                    </a>
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

    // En una SPA el ?id está después del hash: #pet_profile?id=3
    // window.location.hash = '#pet_profile?id=3'
    // Separamos por ? y cogemos la segunda parte → 'id=3'
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











/*
document.addEventListener('DOMContentLoaded', init);

const supportsTemplate = function () {
    //create a template element and make sure it has a 'content' property
    return 'content' in document.createElement('template');
}

function loadTemplate(fileName, id, callback) {

    fetch(fileName).then((res) => {
        return res.text();
    }).then((text) => {
        document.getElementById(id).innerHTML = text;
        //console.log(text)

        if(callback){
            callback();
        }
    })
}


function init() {

    loadTemplate('../html/templates/template_header.html', 'header');
    loadTemplate('../html/templates/template_footer.html', 'footer');

    loadTemplate('../html/templates/template_home.html', 'main');

    loadTemplate('./sidebar_categories.html', 'categories');

    loadTemplate('./sidebar_links.html', 'links',addMovies);

    loadTemplate('./top_navlist.html', 'top_navlist');
    loadTemplate('./footer_right.html', 'footerRight');
    loadTemplate('./footer_left.html', 'footerLeft');

    loadTemplate('./post_content.html', 'post_template',addPostContent);


    addSideBarContent();

}

function addSideBarContent() {

    fetch('users.json')
        .then((response) => {
            return response.json();
        })
        .then((users) => {
            if ('content' in document.createElement('template')) {
                const container = document.getElementById('users');

                users.forEach((user) => {

                    const tmpl = document
                        .getElementById('user-card-template')
                        .content.cloneNode(true);

                    tmpl.querySelector('h2').innerText = user.fullname;
                    tmpl.querySelector('.title').innerText = user.title;


                    container.appendChild(tmpl);
                });
            } else {
                console.error('Your browser does not support templates');
            }
        })
        .catch((err) => console.error(err));


}

function addPostContent() {


    if (supportsTemplate()) {
        //We can use the template element in our HTML
        console.log('Templates are supported.');

        document.getElementById('post_1').remove();
        document.getElementById('post_2').remove();

        let temp = document.getElementById('post_content_template');
        let content = temp.content;
        console.log(content);
        let target = document.getElementById('post_template');
        target.appendChild(content.cloneNode(true))
        target.appendChild(content.cloneNode(true));

    } else {

        //Use another method, like manually building the elements.
        console.log('The else is running');

        fetch('./post_content_support.html').then((res) => {
            return res.text();
        }).then((text) => {
            document.getElementById('post_1').innerHTML = text;
            document.getElementById('post_2').innerHTML = text;

            console.log(text)
        })

    }
}
*/