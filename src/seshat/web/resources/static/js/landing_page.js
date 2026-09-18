function add_dataset_to_collection (dataset_id, collection_id) {
    fetch(`/v2/account/collections/${collection_id}/articles`, {
        method:  "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body:    JSON.stringify({ "articles": [dataset_id] })
    }).then(function (response) {
        if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
        show_message ("success", "<p>Dataset succesfully added to collection.</p>");
    }).catch(function () {
        show_message ("failure", "<p>Failed to add dataset to collection.</p>");
    });
}

function toggle_access_request (event) {
    stop_event_propagation (event);
    let access_request_div = jQuery("#access-request-wrapper");
    if (access_request_div.is(":visible")) {
        jQuery("#access-request-wrapper").slideUp(150, function (){
            let button = document.getElementById("access-request");
            button.classList.remove("close");
            button.classList.add("open");
            button.textContent = "Request access to data";
        });
    } else {
       jQuery("#access-request-wrapper").slideDown(150, function (){
            let button = document.getElementById("access-request");
            button.classList.remove("open");
            button.classList.add("close");
            button.textContent = "Cancel access request";
        });
    }
}

function submit_access_request (event) {
    stop_event_propagation (event);
    let data = {
        "email":      or_null(document.getElementById("access-request-email").value),
        "name" :      or_null(document.getElementById("access-request-name").value),
        "dataset_id": or_null(document.getElementById("access-request-dataset-id").value),
        "version":    or_null(document.getElementById("access-request-version").value),
        "reason":     value_from_quill("#access-request-reason")
    };
    fetch(`/data_access_request`, {
        method:  "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body:    JSON.stringify(data)
    }).then(function (response) {
        if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
        show_message ("success", "<p>Access request has been sent.</p>");
        toggle_access_request(null);
    }).catch(function () {
        show_message ("failure", "<p>Access request could not be sent.</p>");
    });
}

function prompt_download_all_request (event) {
    let download_message = document.getElementById("download-all-files-message");
    download_message.classList.add("success");
    download_message.insertAdjacentHTML("beforeend", "<p>Your download is being prepared. This may take a while.</p>");
    jQuery(download_message).fadeIn(250);
    setTimeout(function() {
        jQuery("#download-all-files-message").fadeOut(500, function() {
            let message = document.getElementById("message");
            message.classList.remove("success");
            message.classList.add("transparent");
            message.innerHTML = "<p>&nbsp;</p>";
            jQuery(message).show();
        });
    }, 120000);
}

function toggle_versions (event) {
    stop_event_propagation (event);
    let versions = jQuery("#versions");
    if (versions.is(":visible")) {
        versions.slideUp(150, function () {
            let arrow = document.getElementById("versions-arrow");
            arrow.classList.remove("fa-angle-up");
            arrow.classList.add("fa-angle-down");
        });
    } else {
        versions.slideDown(150, function () {
            let arrow = document.getElementById("versions-arrow");
            arrow.classList.remove("fa-angle-down");
            arrow.classList.add("fa-angle-up");
        });
    }
}

function render_draft_collections () {
    if (dataset_uuid == null) { return; }
    fetch("/v2/account/collections", {
        method:  "GET",
        headers: { "Accept": "application/json" }
    }).then(function (response) {
        if (!response.ok) { throw response; }
        return response.json();
    }).then(function (records) {
        document.querySelector("#collect ul")?.remove();
        let list = document.createElement("ul");
        document.getElementById("collect").append(list);
        for (let collection of records) {
            let item = create_element("a", { "href": "#", "class": "corporate-identity" }, collection.title);
            item.addEventListener("click", function (event) {
                add_dataset_to_collection (dataset_uuid, collection.uuid);
                stop_event_propagation (event);
            });
            list.append(item);
        }
    }).catch(function (error) {
        if (error.status == 403) {
            show_message ("failure", "<p>No permission to list collections.</p>");
        } else {
            show_message ("failure", "<p>Failed to list collections for your account.</p>");
        }
    });
}

document.addEventListener("DOMContentLoaded", function (){
    if (document.getElementById ("access-request-reason") !== null) {
        new Quill("#access-request-reason", { modules: quill_modules, theme: 'snow' });
    }
    document.getElementById("access-request")?.addEventListener("click", toggle_access_request);
    document.getElementById("submit-access-request")?.addEventListener("click", submit_access_request);
    document.getElementById("download-all-files")?.addEventListener("click", prompt_download_all_request);
    document.getElementById("cite-btn")?.addEventListener("click", toggle_citation);
    document.getElementById("collect-btn")?.addEventListener("click", function (event) {
        toggle_collect (event);
        render_draft_collections ();
        stop_event_propagation (event);
    });
    document.getElementById("versions-btn")?.addEventListener("click", toggle_versions);
});
