import {toast} from "vue3-toastify";

function format_tstamp(tstamp) {
    if(!tstamp) {
        return '';
    }
    var dt = new Date(tstamp);
    return dt.toLocaleString('de-DE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function toastify_success(msg) {
        toast(msg, {
            autoClose: 1000,
            type: "success"
        });
}

function toastify_error(msg) {
    toast(msg, {
        autoClose: 1000,
        type: "error"
    });
}


export { format_tstamp, toastify_success, toastify_error };

