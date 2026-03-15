import { toast } from 'vue3-toastify';

function do_request(method, url, body, errormsg, callback, finallyBlock, headers) {
    const args = {
        method: method,
        headers: headers ? headers : new Headers()
    };

    if ((args.method === 'POST' || args.method === 'DELETE' || args.method === 'PUT') && body) {
        args.body = body;
    }

    if (args.body) {
        // Check if body is form-encoded (contains key=value pairs)
        if(typeof body === 'object' && !(body instanceof FormData)) {
            args.headers.append("Content-Type", "application/json");
            args.body = JSON.stringify(body);
        }
        else if (body instanceof FormData) {
            args.headers.append("Content-Type", "application/x-www-form-urlencoded");
        } else {
            args.headers.append("Content-Type", "text/plain");
        }
    }

    return fetch(url, args)
        .then(resp => {
            if (resp.status === 204) {
                return undefined;
            } else if (resp.status === 200 || resp.status === 201 || resp.status === 202) {
                return resp.json();
            } else {
                return resp.json().then(obj => {
                    console.log(obj);
                    if(errormsg) {
                        toast(errormsg + ': ' + JSON.stringify(obj), {
                            autoClose: 1000,
                            type: "error"
                        });
                    }
                    throw new Error(errormsg);
                });
            }
        })
        .then(data => {
            if (data && callback) {
                return callback(data);
            }
            return data;
        })
        .catch(err => {
            if(errormsg) {
                toast(errormsg, {
                    autoClose: 1000,
                    type: "error"
                });
            }
            else {
                errormsg = 'no error msg provided'
            }
            console.log(errormsg, err);
        })
        .finally(() => {
            if (finallyBlock) {
                finallyBlock();
            }
        });
}

function do_get(url, errormsg, callback, finallyBlock, headers) {
    return do_request('GET', url, null, errormsg, callback, finallyBlock, headers);
}

function do_post(url, body, errormsg, callback, finallyBlock, headers) {
    return do_request('POST', url, body, errormsg, callback, finallyBlock, headers);
}

function do_put(url, body, errormsg, callback, finallyBlock, headers) {
    return do_request('PUT', url, body, errormsg, callback, finallyBlock, headers);
}

function do_delete(url, body, errormsg, callback, finallyBlock, headers) {
    return do_request('DELETE', url, body, errormsg, callback, finallyBlock, headers);
}

export { do_delete, do_get, do_post, do_put };