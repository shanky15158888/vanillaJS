const localStorageName = "data";
const  details = localStorage.getItem(localStorageName)? JSON.parse(localStorage.getItem(localStorageName)): {
    data: [],
    soryBy: "ascending"
};
const root = document.querySelector("#root")
root.innerHTML = getWidget(details.data);
const userId = "shanky";

// Events Listerner
    const submitBtn = document.querySelector(".submitBtn")
    const comments = document.querySelector(".comments")
    const inputElement = document.querySelector(".inputComment")
    let subCommentInputElement;
    let inputValue = "";
    let subCommentValues = {};
    let fieldId = "0";
    inputElement.addEventListener('input', (e) => {
        inputValue = e.target.value
        if(inputValue.length > 200) {
            submitBtn.disabled = true;
        } else {
            submitBtn.disabled = false;
        }
        if(inputValue.length < 1) {
            submitBtn.innerText = "Add";
        }
    })
    submitBtn.addEventListener('click', (e) => {
        if(submitBtn.innerText === "Add") {
            addComment(details['data'], inputValue);
        } else if(submitBtn.innerText === "Update"){
            const id = fieldId;
            const index = id.split("-");
            if(id.includes("-")) {
                if(details.data[index[0]].subComments.length) {
                    updateItem(details.data[index[0]].subComments[index[1]], 'comment', inputValue)
                }  
            } else {
                updateItem(details.data[index[0]], 'comment', inputValue)
            }
            submitBtn.innerText = "Add"
        }
        inputValue = ""
        inputElement.value = ""
    })
    attachEventToSubComments()
    comments.addEventListener('change', (e) => {
        if(e.target.className === "sort") {
            const {id, value} = e.target;            
            if(id !== "-1") {
                if(details.data[id].subComments.length) {
                    details.data[id].sortBy = value
                    sortComments(details.data[id].subComments, value)
                }  
            } else {
                details.sortBy = value
                sortComments(details.data, value)
            }
        }
    })
    comments.addEventListener('click', (e) => {
        if(e.target.className === "editBtn") {
            inputElement.focus();
            const {id} = e.path[3];
            let comment = '';
            const index = id.split("-");
            if(id.includes("-")) {
                if(details.data[index[0]].subComments.length) {
                    comment = details.data[index[0]].subComments[index[1]].comment
                }  
            } else {
                comment = details.data[index].comment
            }
            inputElement.value = comment;
            submitBtn.innerText = "Update";
            fieldId = id;
            inputValue = comment;
        }
        if(e.target.className === "subCommentBtn") {
            const {id} = e.path[3];
            const index = id.split("-");
            if(id.includes("-")) {
                if(details.data[index[0]].subComments.length) {
                    addComment(details.data[index[0]].subComments, subCommentValues[id])
                }  
            } else {
                addComment(details.data[index[0]].subComments, subCommentValues[id])
            }
        }
        if(e.target.className === "likeBtn") {
            const {id} = e.path[3];
            const index = id.split("-");
            if(id.includes("-")) {
                if(details.data[index[0]].subComments.length) {
                    updateItem(details.data[index[0]].subComments[index[1]], 'likesList', userId)
                }  
            } else {
                updateItem(details.data[index[0]], 'likesList', userId)
            }
        }
        if(e.target.className === "deleteComment") {
            const {id} = e.path[3];
            const index = id.split("-");
            if(id.includes("-")) {
                if(details.data[index[0]].subComments.length) {
                    deleteItem(details.data[index[0]].subComments, index[1])
                }  
            } else {
                deleteItem(details.data, index[0])
            }
        }
    })
// end

function deleteItem(arr, index) {
    arr.splice(index, 1)
    updateLocalStorage()
    updateComments(details.data);
    attachEventToSubComments()
}
function sortComments(arr, sortBy) {
    arr.sort((a, b) => {
        if(sortBy === "ascending") {
            return a.currentDate - b.currentDate
        } else {
            return b.currentDate - a.currentDate
        }
    })
    updateLocalStorage()
    updateComments(details.data);
    attachEventToSubComments()
}
function attachEventToSubComments() {
    function updateEvent(e) {
        const {id} = e.path[3];
        subCommentValues[id] = e.target.value;
    }
    if(subCommentInputElement) {
        subCommentInputElement.forEach((elem) => {
            elem.removeEventListener('input', updateEvent);    
        })            
    }
    subCommentInputElement = document.querySelectorAll(".subComment")
    subCommentInputElement.forEach((elem) => {
        elem.addEventListener('input', updateEvent)    
    })
}
function updateItem(obj, itemToUpdate, value) {
    if(Array.isArray(obj[itemToUpdate])) {
        if(!obj[itemToUpdate].includes(value)) {
            obj[itemToUpdate].push(value);
        }
    } else {
        obj[itemToUpdate] = value;
    }
    updateLocalStorage()
    updateComments(details.data);
    attachEventToSubComments()
}
function addComment(arr, value) {
    const obj = {
        code: arr.length,
        comment: value,
        likesList: [],
        currentDate: Date.now(),
        subComments: [],
        sortBy: "ascending"
    }
    arr.push(obj);
    updateLocalStorage()
    updateComments(details.data);
    attachEventToSubComments()
}
function updateComments(data) {
    comments.innerHTML = getComments(data)
}
function updateLocalStorage() {
    localStorage.setItem(localStorageName, JSON.stringify(details))
}
function getWidget(data) {
    return `<div class="container">
        <input type="text" class="inputComment" tabindex="-1" />
        <button type="button" class="submitBtn">Add</button>
        <div class="comments">${data.length? getComments(data): '<ul></ul>'}</div>
    </div>`;
}

function getComments(data, parent) {
    const value = typeof parent !== "undefined"? parent: "-1";
    const sortBy = typeof parent !== "undefined"? details['data'][parent].sortBy: details.sortBy;
    function isSelected(type, value) {
        if(type == value) {
            return "selected"
        } else {
            return ""
        }
    }
    let html = `<select class="sort" id="${value}">
        <option value="ascending" ${isSelected(sortBy, "ascending")}>Ascending</option>
        <option value="descending" ${isSelected(sortBy, "descending")}>Descending</option>
    </select>`
    html += '<ul>';
    data.forEach((item, index) => {
        html += getComment(item, index, parent);
    })
    html += '</ul>'
    return html;
}
setInterval(() => {
    const agoTimeElem = document.querySelectorAll(".agoTime");
    agoTimeElem.forEach((item) => {
        const convertAgoTime = Math.floor((Date.now() - item.id)/60000);
        if(convertAgoTime != item.innerText) {
            item.innerText = `${convertAgoTime}`
        }  
    })
}, 60000)
function getComment(item, index, parent) {
    const convertAgoTime = Math.floor((Date.now() - item.currentDate)/60000);
    const code = typeof parent !== "undefined"? (parent+ '-'+ index): index;
    return `<li class="commentSection" id="${code}">
        <div class="comment">
            <div class="col-md-12">
                <div>${item.comment}</div>
                <button type="button" class="editBtn">Edit</button>
                <span>${item.likesList.length} Likes</span>
                <button type="button" class="likeBtn">Like</button>
                <button type="button" class="deleteComment">Delete</button>
                <br/>
                <input type="text" placeholder="comment" class="subComment" />
                <button type="button" class="subCommentBtn">Reply</button>
                <span class="agoTime" id="${item.currentDate}">${convertAgoTime}</span>
                <span> min ago</span>
            </div>
        </div>
        ${item.subComments && item.subComments.length? getComments(item.subComments, index): ""}
    </li>`
}