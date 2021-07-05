export default function (Alpine) {
    window.progressBar = document.querySelector("#progress-fill");
    window.progressOn = true;
    if(window.progressBar == null){
        window.progressOn = false;
        console.log(window.progressBar);
    }
    
    Alpine.directive('routing', (el, { expression }, { evaluate }) => {
        el.addEventListener('click', () => {
            change_page(get_base_url() + evaluate(expression), 'main')
        })
    })
}

// get url base
function get_base_url(){
    var getUrl = window.location;
    return getUrl .protocol + "//" + getUrl.host;
}

//Update progress bar
window.progress = function(loaded, total) {
    if(window.progressOn){
        window.progressBar.style.width = Math.round(loaded/total*100) +'%';
    }
}

async function change_page(url, idHTMLToReplace){
    // old fetchAPI
    /* var resp = await fetch(url).then(response => {
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
    }) */

    var resp = axios.get(url,
    {
        onUploadProgress: (progressEvent) => {
            const totalLength = progressEvent.lengthComputable ? progressEvent.total : progressEvent.target.getResponseHeader('content-length') || progressEvent.target.getResponseHeader('x-decompressed-content-length');
            
            if (totalLength !== null) {
                window.progress(progressEvent.loaded, totalLength);
            }
        }
    }).then((response) => {
        return response;
    });

    history.pushState(null, '', url);

    var el = document.createElement( 'html' );
    el.innerHTML = resp;
    var main = el.querySelector('div#' + idHTMLToReplace).innerHTML;
    document.querySelector('div#' + idHTMLToReplace).innerHTML = main;

    //progress(0, 1);
}