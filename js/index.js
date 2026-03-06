document.addEventListener('DOMContentLoaded', init);

function loadTemplate(fileName, id, callback) {
    fetch(fileName)
        .then((res) => {
            if (!res.ok) throw new Error(`Error cargando ${fileName}`);
            return res.text();
        })
        .then((text) => {
            const element = document.getElementById(id);
            if (element) {
                element.innerHTML = text;
            }

            if (callback) {
                callback();
            }
        })
        .catch(err => console.error(err));
}


function loadMultipleTemplates(fileName, containerId, numCopies, callback) {
    // Extraer numero de copias de la base de datos
    fetch(fileName)
        .then((res) => {
            if (!res.ok) throw new Error(`Error cargando ${fileName}`);
            return res.text();
        })
        .then((text) => {
            const container = document.getElementById(containerId);

            if (container) {
                // Hacemos un bucle para inyectarlo tantas veces como queramos
                for (let i = 0; i < numCopies; i++) {
                    // 'insertAdjacentHTML' añade el nuevo HTML al final del contenedor
                    // SIN borrar lo que ya habíamos metido antes (a diferencia de innerHTML)
                    container.insertAdjacentHTML('beforeend', text);
                }
            }

            if (callback) {
                callback();
            }
        })
        .catch(err => console.error(err));
}




function init() {
    loadTemplate('../html/templates/template_header.html', 'header');
    loadTemplate('../html/templates/template_footer.html', 'footer');

    let currentPage = window.location.pathname.split('/').pop();

    if (currentPage === '' || currentPage === 'index.html') {

        loadTemplate('../html/templates/template_home.html', 'main');

    } else if (currentPage === 'contact_us.html') {
        loadTemplate('../html/templates/template_contact_us.html', 'main', function() {

            loadTemplate('../html/templates/template_card.html', 'card');

        });
    } else if (currentPage === 'adoption_list.html') {

        loadTemplate('../html/templates/template_adoption_list.html', 'main', function() {
            loadMultipleTemplates('../html/templates/template_adoption_item.html', 'pets-list', 4)
        });

    } else if (currentPage === 'faq.html') {

        loadTemplate('../html/templates/template_faq.html', 'main', function () {
            loadMultipleTemplates('../html/templates/template_item_collapse.html', 'faq_item', 8)
        });
    } else if (currentPage === 'legal.html') {

        loadTemplate('../html/templates/template_legal.html', 'main', function () {
            loadMultipleTemplates('../html/templates/template_item_collapse.html', 'faq_item', 6)
        });
    } else if (currentPage === 'login.html') {

        loadTemplate('../html/templates/template_login.html', 'main');

    } else if (currentPage === 'pet_profile.html') {

        loadTemplate('../html/templates/template_pet_profile.html', 'main');

    } else if (currentPage === 'schedule.html') {

        loadTemplate('../html/templates/template_schedule.html', 'main');

    } else if (currentPage === 'stories.html') {

        loadTemplate('../html/templates/template_stories.html', 'main', function () {
            loadMultipleTemplates('../html/templates/template_card.html', 'review', 2);
        });
    } else if (currentPage === 'about_us.html') {

        loadTemplate('../html/templates/template_about_us.html', 'main', function () {
            loadMultipleTemplates('../html/templates/template_card.html', 'about_us', 3);
        });
    } else {
        console.log("No se encontró una plantilla específica para esta página.");
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