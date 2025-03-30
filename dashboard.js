
var guide = document.querySelector(".guide");
var create = document.querySelector(".create");
var logout = document.querySelector(".logout");
var collector = document.querySelector(".id_collector");
var limit = false;
var token = localStorage.getItem("token");

var params = new URLSearchParams(window.location.search);

function setType(type){
    var access = new URLSearchParams(window.location.hash.slice(1));
    if (access.has('access_token')){
        access = access.get('access_token');
        fetch('/auth', {
            method: 'POST',
            body: JSON.stringify({
                'token': access 
            })
        })
        .then(response => response.json())
        .then(result => {
            var temp = result.token;
            if (temp){
                token = temp;
                localStorage.setItem('token', token)
                window.history.pushState({}, document.title, window.location.href.split("#")[0]);
            }
        })
    }
    
    if (token){
        load(type)
    }else{
        location.href = '/error'
    }
}

function load(type){
    fetch('/panel/' + type, {
        method: 'POST',
        body: JSON.stringify({
            'token': token
        })
    })
    .then(response => response.json())
    .then(result => {
        if (type === "default"){
            limit = result.limit;

            if (limit){
                create.querySelector(".title").innerHTML = "Osiągnięto limit dowodów";
                create.querySelector(".arrow").src = "https://i.imgur.com/ET9gQmk.png";
            }
    
            if (result.admin){
                var admin =  document.querySelector(".admin");
                admin.style.display = "block"
                admin.addEventListener('click', () => {
                    location.href = '/admin'
                })
            }
        }

        createIds(result.ids);
    })
}

if (create){
    create.addEventListener('click', () => {
        if (!limit){
            location.href = '/generator';
        }
    })
}

if (logout){
    logout.addEventListener('click', () => {
        localStorage.removeItem('token');
        location.href = '/';
    })
}

var template =
'<div class="id_top">' +
'<p class="id_number">id: {id}</p>' +
'<div class="copy_grid">' +
'<p class="copy_text">skopiuj url</p>' +
'<img class="copy_image" src="https://i.imgur.com/Vb7hCfL.png">' +
'</div>' +
'</div>' +
'<p class="id_data">Data urodzenia <span class="data_highlight">{date}</span>' +
'</p><p class="id_data">Imię <span class="data_highlight">{name}</span></p>' +
'<p class="id_data">Nazwisko <span class="data_highlight">{surname}</span></p>' +
'<div class="action">' +
'<p class="delete" onclick="deleteId({id})">Usuń</p>' +
'<p class="edit" onclick="editId({id})">Edytuj</p>' +
'<p class="click" onclick="enterId({id})">Wejdź</p>' +
'</div>'

function copy(id){
    navigator.clipboard.writeText(location.protocol + "//" + location.host + "/id?id=" + id + "&token=" + token)
}

function createIds(ids){
    ids.forEach((id) => {
        createId(id);
    });
}

var options = { year: 'numeric', month: '2-digit', day: '2-digit' };

function createId(id){
    var temp = template;
    temp = temp.replaceAll("{id}", id.id);
    temp = temp.replaceAll("{name}", id.name);
    temp = temp.replaceAll("{surname}", id.surname);

    var date = new Date();
    date.setDate(id.day);
    date.setMonth(id.month-1);
    date.setFullYear(id.year);

    temp = temp.replaceAll("{date}", date.toLocaleDateString("pl-PL", options));
    
    var element = document.createElement("div");
    element.classList.add("id");
    element.id = id.id;
    element.innerHTML = temp;

    var child = collector.firstChild;
    if (child){
        collector.insertBefore(element, child)
    }else{
        collector.appendChild(element);
    }

    var copyGrid = element.querySelector('.copy_grid');
    var copyText = document.querySelector('.copy_text');
    copyGrid.addEventListener('click', () => {
        copy(id.id);
        copyText.innerHTML = "skopiowano";
        delay(1000).then(() => {
            copyText.innerHTML = "skopiuj url"
        })
    })
}

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

function deleteId(id){
    fetch('/panel/delete', {
        method: 'POST',
        body: JSON.stringify({
            'token': token,
            'id': parseInt(id)
        })
    })
    location.reload()
}

function editId(id){
    location.href = '/generator?id=' + id;
}

function enterId(id){
    location.href = '/id?id=' + id + '&token=' + localStorage.getItem('token');
}

if (guide){
    guide.addEventListener('click', () => {

        var classes = guide.classList;
        if (classes.contains("unfolded")){
            classes.remove("unfolded");
        }else{
            classes.add("unfolded");
        }
    
    })
}