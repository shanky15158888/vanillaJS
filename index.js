const root = document.querySelector("#root");

let page = 1;
let cardResponse = [];
let debounceMethod;
function updateCards(items, start, end) {
    const cards = document.querySelector(".cards");
    cards.innerHTML = renderCards(items, start, end);
    const paginationElement = document.querySelector(".paginationContainer");
    paginationElement.innerHTML = getPagination();
}
function getDebounce(callback, delay) {
    let timeout;
    return function(...args) {
        if(timeout) {
            clearInterval(timeout)
        }
        timeout = setTimeout(() => {
            callback.apply(this, args)
        }, delay)
    }
} 
getModules();
function attachEvent() {
    const paginationBtn = document.querySelector(".paginationContainer");
    const sorting = document.querySelector(".sort");
    const searchbar = document.querySelector("#search");
    searchbar.addEventListener('input', (e) => {
        const {value} = e.target;
        page = 1;
        const arr = cardResponse.filter((item) => {
            const {title} = item;
            return title.includes(value)
        })
        if(arr.length< 1) {
            updateCards(arr, 1, 0)
        } else {
            if(value === "") {
                updateCards(cardResponse, 1, 10)
            } else {
                updateCards(arr, 1, arr.length < 10? arr.length: 10)
            }
        }
        
    })
    paginationBtn.addEventListener('click', (e) => {
        let start = 0;
        let end = 0;
        if(e.target.innerText === "Next") {
            start = page*10 + 1;
            page++;
            end = 10*page;
            if(end > cardResponse.length) {
                end = cardResponse.length
            }
        } else if(e.target.innerText === "Previous") {
            page--;
            start = 10*(page-1) + 1;
            end = 10*page;
        }
        if(end > cardResponse.length) {
            end = cardResponse.length
        }

        updateCards(cardResponse, start, end)
    })
    sorting.addEventListener('change', (e) => {
        const {value} = e.target;
        if(value === "ascending") {
            cardResponse.sort(function(a, b) {
                return a.id - b.id
            })
        } else if(value === "descending") {
            cardResponse.sort(function(a, b) {
                return b.id - a.id
            })
        }
        page = 1;
        updateCards(cardResponse, 1, 10)
    })    
}

function getModules() {
    let html = ''
    try{
        getListOfRestaurants('https://jsonplaceholder.typicode.com/posts').then(data => {
            cardResponse = data;
            html = `<div class="container">${getSearchBar()}
            ${getSorting()}
            <div class="cards">${renderCards(data, 1, 10)}</div>
            <div class="paginationContainer">${getPagination(data.length)}</div>
            ${getFooter()}</div>`;
            root.innerHTML = html;
            attachEvent()   
        })
    } catch(error) {
        console.error(error)
    }
}
function getSearchBar() {
    return `<div class="searchbar">
        <input type="text" id="search" />
    </div>`
}
function renderCards(items, start, end) {
    let card = ''
    for(let i=start-1;i<end;i++) {
        card += getCard(items[i]);
    }
    return card;
}
function getSorting() {
    return `<select class="sort">
        <option value="ascending">Ascending</option>
        <option value="descending">Descending</option>
    </select>`
}
function getCard(item) {
    return `<div class="card">
        <div>Restaurant: ${item.title}</div>
        <div>Rating: ${item.userId}</div>
        <div>${item.id}</div>
    </div>`;
}
function getPagination() {
    const totalPages = Math.floor(cardResponse.length / 10);
    return `<button type="button" ${page === 1?"disabled": ""} class="pagination">Previous</button>
    <button type="button" ${page>= totalPages?"disabled": ""} class="pagination">Next</button>`;
}
function getFooter() {
    return `<div>Its Footer</div>`
}
function getPromise(url) {
    return fetch(url)
    .then(res => res.json())
    .catch(error => {
        console.error(error)
        data = {
            error: true,
            errormsg: "There is an error"
        }
    })
}
function getListOfRestaurants(url) {
    return getPromise(url)
}