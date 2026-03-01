// https://stackoverflow.com/questions/40162907/w3includehtml-sometimes-includes-twice
/*
function xLuIncludeFile() {
    let z, i, a, file, xhttp;

    z = document.getElementsByTagName("*");

    for (i = 0; i < z.length; i++) {
        if (z[i].getAttribute("xlu-include-file")) {
            a = z[i].cloneNode(false);
            file = z[i].getAttribute("xlu-include-file");
            xhttp = new XMLHttpRequest();

            xhttp.onreadystatechange = function () {
                if (xhttp.readyState === 4 && xhttp.status === 200) {
                    a.removeAttribute("xlu-include-file");
                    a.innerHTML = xhttp.responseText;
                    z[i].parentNode.replaceChild(a, z[i]);
                    xLuIncludeFile();
                }
            }

            // false makes the send operation synchronous, which solves a problem
            // when using this function in short pages with Chrome. But it is
            // deprecated on the main thread due to its impact on responsiveness.
            // This call may end up throwing an exception someday.

            xhttp.open("GET", file, false);
            xhttp.send();

            return;
        }
    }
}
*/

async function xLuIncludeFile() {
    let z = document.getElementsByTagName("*");

    for (let i = 0; i < z.length; i++) {
        if (z[i].getAttribute("xlu-include-file")) {
            let a = z[i].cloneNode(false);
            let file = z[i].getAttribute("xlu-include-file");

            try {
                let response = await fetch(file);
                if (response.ok) {

                    let content = await response.text();


                    // Si el archivo es una plantilla, reemplazamos los placeholders
                    if (file === "article-template.html") {

                        content = replaceArticleTemplatePlaceholders(content, z[i]);

                        /*
                        let articleData = {
                            title: z[i].getAttribute("data-title"),
                            subtitle: z[i].getAttribute("data-subtitle"),
                            date: z[i].getAttribute("data-date"),
                            displayDate: z[i].getAttribute("data-display-date"),
                            content: z[i].getAttribute("data-content"),
                            image: z[i].getAttribute("data-image"),
                            imageCaption: z[i].getAttribute("data-image-caption")
                        };

                        content = content.replace(/{{title}}/g, articleData.title)
                            .replace(/{{subtitle}}/g, articleData.subtitle)
                            .replace(/{{date}}/g, articleData.date)
                            .replace(/{{displayDate}}/g, articleData.displayDate)
                            .replace(/{{content}}/g, articleData.content)
                            .replace(/{{image}}/g, articleData.image || '')
                            .replace(/{{imageCaption}}/g, articleData.imageCaption || '');

                        */
                    }



                    a.removeAttribute("xlu-include-file");
                    //a.innerHTML = await response.text();
                    a.innerHTML = content;
                    z[i].parentNode.replaceChild(a, z[i]);
                    xLuIncludeFile();
                }
            } catch (error) {
                console.error("Error fetching file:", error);
            }

            return;
        }
    }
}


function replaceArticleTemplatePlaceholders(content, element) {
    let articleData = {
        title: element.getAttribute("data-title"),
        subtitle: element.getAttribute("data-subtitle"),
        date: element.getAttribute("data-date"),
        displayDate: element.getAttribute("data-display-date"),
        content: element.getAttribute("data-content"),
        image: element.getAttribute("data-image"),
        imageCaption: element.getAttribute("data-image-caption")
    };

    /*
    return content.replace(/{{title}}/g, articleData.title)
        .replace(/{{subtitle}}/g, articleData.subtitle)
        .replace(/{{date}}/g, articleData.date)
        .replace(/{{displayDate}}/g, articleData.displayDate)
        .replace(/{{content}}/g, articleData.content)
        .replace(/{{image}}/g, articleData.image || '')
        .replace(/{{imageCaption}}/g, articleData.imageCaption || '');
    */

    return content
        .replace(/{{title}}/g, articleData.title ?? "{{title}}")
        .replace(/{{subtitle}}/g, articleData.subtitle ?? "{{subtitle}}")
        .replace(/{{date}}/g, articleData.date ?? "{{date}}")
        .replace(/{{displayDate}}/g, articleData.displayDate ?? "{{displayDate}}")
        .replace(/{{content}}/g, articleData.content ?? "{{content}}")
        .replace(/{{image}}/g, articleData.image ?? "{{image}}")
        .replace(/{{imageCaption}}/g, articleData.imageCaption ?? "{{imageCaption}}");

}


function redirectToArticle(event, element) {
    event.preventDefault(); // Evita la navegación predeterminada

    // Obtener datos del artículo desde los atributos
    let params = new URLSearchParams();
    params.append("title", element.getAttribute("data-title"));
    params.append("subtitle", element.getAttribute("data-subtitle"));
    params.append("date", element.getAttribute("data-date"));
    params.append("displayDate", element.getAttribute("data-display-date"));
    params.append("content", element.getAttribute("data-content"));
    params.append("image", element.getAttribute("data-image") || "");
    params.append("imageCaption", element.getAttribute("data-image-caption") || "");

    // Redirigir a article.html con los parámetros
    window.location.href = "article.html?" + params.toString();
}


