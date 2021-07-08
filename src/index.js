var idHTMLToReplace = 'main';

export default function (Alpine) {
    Alpine.directive('routing', (el, { expression }, { evaluate }) => {
        el.addEventListener('click', () => {
            change_page(get_base_url() + evaluate(expression), idHTMLToReplace)
        })
    })

    Alpine.directive('ajax', (el) => {
        if(el.nodeName != "FORM"){
            return;
        }
    
        el.addEventListener('submit', async (event) => {
            // cancel normal submit
            event.preventDefault();
    
            // pack form data
            var formData = new FormData(el);
    
            // get data from form
            var url = el.getAttribute("action").includes('http') ? el.getAttribute("action") : api_base_domain + el.getAttribute("action");
            var method = el.getAttribute("method");
    
            var get = makeRequestCreator();
            var resp = await get(url, method, formData);

            if(resp != null){
                el._x_dataStack[0].errors = {};
                if(resp.isAxiosError){
                    console.log(resp);
                }else{
                    if(resp.data.errors != undefined){
                        for (const [key, value] of Object.entries(resp.data.errors)) {
                            el._x_dataStack[0].errors[key] = value;
                        }
                    }
                    el._x_dataStack[0].status = resp.data.status;
                    el._x_dataStack[0].message = resp.data.message;
                    el._x_dataStack[0].data = resp.data.data;
                }
                
            }
        })
    })
}

// get url base
function get_base_url(){
    var getUrl = window.location;
    return getUrl .protocol + "//" + getUrl.host;
}


function list_diff(l1, l2){
    return l1.filter( function( el ) {
        return !l2.includes( el );
    });
}

window.change_page = async function (url, idHTMLToReplace){
    var get = makeRequestCreator();
    var resp = await get(url, 'get');
    resp = resp.data;

    history.pushState(null, '', url);

    var el = document.createElement( 'html' );
    el.innerHTML = resp;
    var main = el.querySelector('div#' + idHTMLToReplace).innerHTML;

    // set title
    document.head.querySelector('title').innerText = el.head.querySelector('title').innerText;

    // add new styles
    var list_old = [];
    document.querySelectorAll("link[rel=stylesheet]").forEach(function(el){ list_old.push(el.getAttribute('href'));})
    var list_new = [];
    document.querySelectorAll("link[rel=stylesheet]").forEach(function(el){ list_new.push(el.getAttribute('href'));})

    var toAdd = list_diff(list_new, list_old); 
    var toRemove = list_diff(list_old, list_new); 

    for (l in toAdd){
        document.head.appendChild(el.querySelector('link[href="' + l + '"]'));
    }

    for (l in toRemove){
        document.querySelector('link[href="' + l + '"]').remove();
    }


    var list_old = [];
    document.querySelectorAll("script").forEach(function(el){ list_old.push(el.getAttribute('src'));})
    var list_new = [];
    document.querySelectorAll("script").forEach(function(el){ list_new.push(el.getAttribute('src'));})

    var toAdd = list_diff(list_new, list_old); 
    var toRemove = list_diff(list_old, list_new); 

    for (l in toAdd){
        document.head.appendChild(el.querySelector('script[src="' + l + '"]'));
    }

    for (l in toRemove){
        document.querySelector('script[src="' + l + '"]').remove();
    }


    // for (var link of el.querySelectorAll("link[rel=stylesheet]")) {
    //     if(!link.getAttribute('href') in list){
    //         document.head.appendChild(link);
    //     }
    // }

    document.querySelector('div#' + idHTMLToReplace).innerHTML = main;
}

function makeRequestCreator() {
    var call;
    return async function(url, method, formData = '') {
        if (call) {
            call.cancel();
        }
        call = axios.CancelToken.source();

        if(method == 'post' || method == 'put'){
            await axios.get(base_domain + '/sanctum/csrf-cookie').catch(function (err) {
                //handle error
                console.log(err);
            });
        }

        return await axios({ 
            url: url,
            data: formData,
            method: method,
            cancelToken: call.token,
            maxRedirects: 0,
            validateStatus: function (status) {
                return status < 500; // Resolve only if the status code is less than 500
            },
            
        }).then((response) => {
            
            if(response.status == 302){
                change_page(response.data.data.redirect, idHTMLToReplace);
                return null;
            }
       
            return response;
        }).catch(function(thrown) {
            if (axios.isCancel(thrown)) {
                console.log('First request canceled', thrown.message);
            } else {
                console.log(thrown);
            }
        });
    }
}