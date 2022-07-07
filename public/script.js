var totalPages = 0;
const DOM = document.getElementById("articles");

document.onload = update();
function update() {
var pageNumber = new URLSearchParams(window.location.search).get("page");
if(!pageNumber || !Number(pageNumber)) pageNumber = 1;
fetch(`/v1/articles?page=${pageNumber}`).then(res => res.json()).then(data => {
    if(!Array.isArray(data.articles))return;
    totalPages = data.totalPages;
    data.articles.forEach(article => {
        const element = document.createElement("div");
        element.classList.add("news");
        element.onclick = () => {
            window.location = `${article.url}`
        }
        const title = document.createElement('h2');
        title.textContent = `${article.title}`
        element.append(title);
        const description = document.createElement('p');
        description.textContent = `${article.description}`
        element.append(description);
        DOM.append(element)
    })
    const currentPage = document.createElement("p");
    currentPage.classList.add("page");
    currentPage.textContent = `Page ${pageNumber} of ${totalPages}`;
    document.body.append(currentPage);
})
document.getElementById("prev").onclick = () => {
    if(pageNumber == 1)return;
    window.location.search = `?page=${pageNumber = 0 ? pageNumber : Number(pageNumber)-1}`;
}

document.getElementById("next").onclick = () => {
    if(totalPages == 0 || Number(pageNumber)+1 > totalPages)return;
    window.location.search = `?page=${Number(pageNumber)+1}`;
}
}

