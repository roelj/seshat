function save_profile (notify=true, on_success=function () {}) {

    let categories   = document.querySelectorAll("input[name='categories']:checked");
    let category_ids = [];
    for (let category of categories) {
        category_ids.push(category.value);
    }

    let form_data = {
        "first_name":     or_null(document.getElementById("first_name").value),
        "last_name":      or_null(document.getElementById("last_name").value),
        "job_title":      or_null(document.getElementById("job_title").value),
        "location":       or_null(document.getElementById("location").value),
        "biography":      or_null(document.getElementById("biography").value),
        "twitter":        or_null(document.getElementById("twitter").value),
        "linkedin":       or_null(document.getElementById("linkedin").value),
        "website":        or_null(document.getElementById("website").value),
        "categories":     category_ids
    };

    fetch("/v3/profile", {
        method:  "PUT",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body:    JSON.stringify(form_data)
    }).then(function (response) {
        if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
        if (notify) { show_message ("success", "<p>Saved changes.</p>"); }
        on_success ();
    }).catch(function () {
        if (notify) {
            show_message ("failure", "<p>Failed to save your profile. Please try again at a later time.</p>");
        }
    });
}

function render_categories_for_profile () {
    let parameters = build_query_parameters ({ "limit": 10000 });
    fetch(`/v3/profile/categories?${parameters}`, {
        method:  "GET",
        headers: { "Accept": "application/json" }
    }).then(function (response) {
        if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
        return response.json();
    }).then(function (categories) {
        for (let category of categories) {
            let checkbox = document.getElementById(`category_${category["uuid"]}`);
            let parent   = document.getElementById(`category_${category["parent_uuid"]}`);
            let children = document.getElementById(`subcategories_${category["parent_uuid"]}`);
            if (checkbox !== null) { checkbox.checked = true; }
            if (parent !== null)   { parent.checked = true; }
            if (children !== null) { children.style.display = "block"; }
        }
    }).catch(function () {
        show_message ("failure", "Failed to retrieve categories.");
    });
}

function remove_profile_image () {
    fetch("/v3/profile/picture", {
        method:  "DELETE",
        headers: { "Accept": "application/json" }
    }).then(function (response) {
        if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
        document.getElementById("upload-profile-image")?.classList.remove("profile-image");
        for (let button of document.querySelectorAll(".dz-button")) {
            button.style.display = "inline-block";
        }
    }).catch(function () {
        show_message ("failure", "<p>Failed to remove profile image.</p>");
    });
}

function activate () {
    render_categories_for_profile ();
    install_sticky_header();
    install_touchable_help_icons();
    document.getElementById("save")?.addEventListener("click", function () { save_profile(); });
    document.getElementById("remove-image")?.addEventListener("click", function () { remove_profile_image(); });
    document.getElementById("expand-categories-button")?.addEventListener("click", toggle_categories);
    const fileUploader = new Dropzone("#upload-profile-image", {
        url:               "/v3/profile/picture",
        dictDefaultMessage: "Upload your profile picture",
        paramName:         "file",
        maxFilesize:       10000,
        maxFiles:          1,
        parallelUploads:   1,
        ignoreHiddenFiles: false,
        createImageThumbnails: false,
        disablePreviews:   true,
        init: function() {},
        error: function(file, response, xhr) {
            show_message ("failure", `<p>${response.message}</p>`);
        },
        success: function (file, response) {
            save_profile (false, function () { location.reload(); });
        },
        accept: function(file, done) {
            done();
        }
    });

    fileUploader.on("complete", function(file) {
        fileUploader.removeFile(file);
    });

}
