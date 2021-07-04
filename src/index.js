var progressBar = document.querySelector("#progress-fill");
var progressOn = true;
if(loadBar == null){
    progressOn = false;
}

export default function (Alpine) {
    Alpine.directive('routing', (el, { expression }, { evaluate }) => {
        el.addEventListener('click', () => {
            change_page(get_base_url() + evaluate(expression), 'main')
        })
    })
}

function get_base_url(){
    var getUrl = window.location;
    return getUrl .protocol + "//" + getUrl.host;
}

function progress(loaded, total) {
    if(progressOn){
        progressBar.style.width = loaded/total*100 +'%';
    }
}

async function change_page(url, idHTMLToReplace){
    var resp = await fetch(url).then(response => {
        console.log(response);
        if (!response.ok) {
            throw Error(response.status+' '+response.statusText)
        }
    
        if (!response.body) {
            throw Error('ReadableStream not yet supported in this browser.')
        }
    
        // to access headers, server must send CORS header "Access-Control-Expose-Headers: content-encoding, content-length x-file-size"
        // server must send custom x-file-size header if gzip or other content-encoding is used
        const contentEncoding = response.headers.get('content-encoding');
        const contentLength = response.headers.get(contentEncoding ? 'x-file-size' : 'content-length');
        if (contentLength === null) {
            throw Error('Response size header unavailable');
        }
    
        const total = parseInt(contentLength, 10);
        let loaded = 0;
    
        return new Response(
        new ReadableStream({
            start(controller) {
            const reader = response.body.getReader();
    
            read();
            function read() {
                reader.read().then(({done, value}) => {
                    if (done) {
                        controller.close();
                        return; 
                    }

                    loaded += value.byteLength;
                    progress(loaded, total);

                    controller.enqueue(value);
                    read();
                }).catch(error => {
                    console.error(error);
                    controller.error(error)                  
                })
            }
            }
        })
        );
    })
    .then((response) => { return response.text(); })
    .catch(error => {
        console.error(error);
    })

    history.pushState(null, '', url);

    var el = document.createElement( 'html' );
    el.innerHTML = resp;
    var main = el.querySelector('div#' + idHTMLToReplace).innerHTML;
    document.querySelector('div#' + idHTMLToReplace).innerHTML = main;

    progress(0, 1);
}