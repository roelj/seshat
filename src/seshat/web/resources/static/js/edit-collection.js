function render_categories_for_collection (dataset_uuid, categories) {
    for (let category of categories) {
        jQuery(`#category_${category["uuid"]}`).prop("checked", true);
        jQuery(`#category_${category["parent_uuid"]}`).prop("checked", true);
        jQuery(`#subcategories_${category["parent_uuid"]}`).show();
    }
}

function remove_reference_event (event) {
    stop_event_propagation (event);
    remove_reference (event.data["encoded_url"],
                      event.data["collection_id"]);
}

function render_references_for_collection (collection_id) {
    let parameters = build_query_parameters ({ "limit": 10000, "order": "id", "order_direction": "asc" });
    fetch(`/v3/collections/${collection_id}/references?${parameters}`, {
        method:  "GET",
        headers: { "Accept": "application/json" }
    }).then(function (response) {
        if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
        return response.json();
    }).then(function (references) {
        jQuery("#references-list tbody").empty();
        for (let url of references) {
            let encoded_url = encodeURIComponent(url);
	    encoded_url = encoded_url.replaceAll("'", "%27");
            let row = document.createElement("tr");
            let column1 = document.createElement("td");
            let column2 = document.createElement("td");
            column1.append(create_element("a", { "target": "_blank", "href": url }, url));
            let anchor = create_element("a", { "href": "#", "class": "fas fa-trash-can", "title": "Remove" });
            on_click_with_data (anchor,
                      { "encoded_url": encoded_url, "collection_id": collection_id },
                      remove_reference_event);
            column2.append(anchor);
            row.append(column1, column2);
            jQuery("#references-list tbody").append(row);
        }
        jQuery("#references-list").show();
    }).catch(function () {
        show_message ("failure", "<p>Failed to retrieve references.</p>");
    });
}


function remove_dataset_event (event) {
    stop_event_propagation (event);
    remove_dataset (event.data["dataset_uuid"], event.data["collection_id"]);
}

function render_datasets_for_collection (collection_id) {
    let parameters = build_query_parameters ({ "limit": 10000, "order": "id", "order_direction": "asc" });
    fetch(`/v2/account/collections/${collection_id}/articles?${parameters}`, {
        method:  "GET",
        headers: { "Accept": "application/json" }
    }).then(function (response) {
        if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
        return response.json();
    }).then(function (datasets) {
        jQuery("#articles-list tbody").empty();
        for (let dataset of datasets) {
            let row = document.createElement("tr");
            let column1 = document.createElement("td");
            let column2 = document.createElement("td");
            let anchor = create_element("a", { "href": `/datasets/${dataset.uuid}` }, dataset.title);
            if (dataset.doi != null && dataset.doi != "") {
                anchor.textContent = `${dataset.title} (${dataset.doi})`;
            }
            column1.append(anchor);
            column2.append(on_click_with_data (create_element("a", {
                "href": "#",
                "class": "fas fa-trash-can",
                "title": "Remove"
            }), { "dataset_uuid": dataset.uuid, "collection_id": collection_id },
                  remove_dataset_event));
            row.append(column1, column2);
            jQuery("#articles-list tbody").append(row);
        }
        jQuery("#articles-list").show();
    }).catch(function () {
        show_message ("failure","<p>Failed to retrieve dataset details.</p>");
    });
}

function reorder_author (collection_id, author_uuid, direction) {
    fetch(`/v3/collections/${collection_id}/reorder-authors`, {
        method:  "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body:    JSON.stringify({ "author":  author_uuid, "direction": direction })
    }).then(function (response) {
        if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
        render_authors_for_collection (collection_id);
    }).catch(function () {
        show_message ("failure", "<p>Failed to change the order of the authors.</p>");
    });
}

function reorder_author_event (event) {
    stop_event_propagation (event);
    reorder_author (event.data["collection_id"],
                    event.data["author_uuid"],
                    event.data["direction"]);
}

function remove_author_event (event) {
    stop_event_propagation (event);
    remove_author (event.data["author_uuid"], event.data["collection_id"]);
}

function render_authors_for_collection (collection_id) {
    let parameters = build_query_parameters ({ "limit": 10000 });
    fetch(`/v2/account/collections/${collection_id}/authors?${parameters}`, {
        method:  "GET",
        headers: { "Accept": "application/json" }
    }).then(function (response) {
        if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
        return response.json();
    }).then(function (authors) {
        jQuery("#authors-list tbody").empty();
        let number_of_items = authors.length;
        for (let index = 0; index < number_of_items; index++) {
            let author = authors[index];
            let row = create_element("tr", { "id": `author-${author.uuid}` });
            let column1 = create_element("td", {}, author.full_name);
            let column2 = document.createElement("td");
            let column3 = document.createElement("td");
            let column4 = document.createElement("td");
            let column5 = document.createElement("td");
            let orcid = null;
            if (author.orcid_id && author.orcid_id != "") { orcid = author.orcid_id; }
            if (orcid !== null) {
                let orcid_anchor = create_element("a", {
                    "href": `https://orcid.org/${orcid}`,
                    "target": "_blank",
                    "rel": "noopener noreferrer"
                });
                orcid_anchor.append(create_element("img", {
                    "src": "/static/images/orcid.svg",
                    "class": "author-orcid",
                    "alt": "ORCID",
                    "title": "ORCID profile (new window)" }));
                column1.append(orcid_anchor);
            }
            if (author.is_editable) {
                column2.append(on_click_with_data (create_element("a", {
                    "id": `edit-author-${author.uuid}`,
                    "href": "#",
                    "class": "fas fa-pen",
                    "title": "Edit"
                }), { "author_uuid": author.uuid, "collection_id": collection_id },
                      edit_author_event));
            }
            if (number_of_items == 1) {
            } else if (index == 0) {
                column3.append(on_click_with_data (create_element("a", { "class": "fas fa-angle-down"}), {
                    "author_uuid": author.uuid,
                    "collection_id": collection_id,
                    "direction": "down" }, reorder_author_event));
            } else if (index == number_of_items - 1) {
                column4.append(on_click_with_data (create_element("a", { "class": "fas fa-angle-up"}), {
                    "author_uuid": author.uuid,
                    "collection_id": collection_id,
                    "direction": "up" }, reorder_author_event));
            } else {
                column3.append(on_click_with_data (create_element("a", { "class": "fas fa-angle-down"}), {
                    "author_uuid": author.uuid,
                    "collection_id": collection_id,
                    "direction": "down" }, reorder_author_event));
                column4.append(on_click_with_data (create_element("a", { "class": "fas fa-angle-up"}), {
                    "author_uuid": author.uuid,
                    "collection_id": collection_id,
                    "direction": "up" }, reorder_author_event));
            }
            column5.append(on_click_with_data (create_element("a", {
                "href": "#",
                "class": "fas fa-trash-can",
                "title": "Remove" }), { "author_uuid": author.uuid,
                                                   "collection_id": collection_id },
                                        remove_author_event));

            row.append(column1, column2, column3, column4, column5);
            jQuery("#authors-list tbody").append(row);
        }
        jQuery("#authors-list").show();
    }).catch(function () {
        show_message ("failure", "<p>Failed to retrieve author details.</p>");
    });
}

function render_funding_for_collection (collection_id) {
    let parameters = build_query_parameters ({ "limit": 10000, "order": "id", "order_direction": "asc" });
    fetch(`/v2/account/collections/${collection_id}/funding?${parameters}`, {
        method:  "GET",
        headers: { "Accept": "application/json" }
    }).then(function (response) {
        if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
        return response.json();
    }).then(function (funders) {
        jQuery("#funding-list tbody").empty();
        for (let funding of funders) {
            let row = document.createElement("tr");
            let column1 = create_element("td", {}, funding.title);
            let column2 = document.createElement("td");
            column2.append(on_click_with_data (create_element("a", {
                "href": "#",
                "class": "fas fa-trash-can",
                "title": "Remove"
            }), { "funding_uuid": funding.uuid, "collection_id": collection_id },
                  remove_funding_event));

            row.append(column1, column2);
            jQuery("#funding-list tbody").append(row);
        }
        jQuery("#funding-list").show();
    }).catch(function () {
        show_message ("failure", "<p>Failed to retrieve funding details.</p>");
    });
}

function remove_funding_event (event) {
    stop_event_propagation (event);
    remove_funding (event.data["funding_uuid"], event.data["collection_id"]);
}

function remove_tag_event (event) {
    stop_event_propagation (event);
    remove_tag (encodeURIComponent(event.data["tag"]), event.data["collection_id"]);
}

function render_tags_for_collection (collection_id) {
    let parameters = build_query_parameters ({ "limit": 10000 });
    fetch(`/v3/collections/${collection_id}/tags?${parameters}`, {
        method:  "GET",
        headers: { "Accept": "application/json" }
    }).then(function (response) {
        if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
        return response.json();
    }).then(function (tags) {
        jQuery("#tags-list").empty();
        for (let tag of tags) {
            let row = document.createElement("li");
            let anchor = create_element("a", { "href": "#", "class": "fas fa-trash-can" });
            on_click_with_data (anchor, { "tag": tag, "collection_id": collection_id },
                      remove_tag_event);
            let label = document.createElement("span");
            label.innerHTML = `${tag} &nbsp; `;
            row.append(label, anchor);
            jQuery("#tags-list").append(row);
        }
        jQuery("#tags-list").show();
    }).catch(function () { show_message ("failure", "<p>Failed to retrieve tags.</p>"); });
}

function add_author (author_id, collection_id) {
    fetch(`/v2/account/collections/${collection_id}/authors`, {
        method:  "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body:    JSON.stringify({ "authors": [{ "uuid": author_id }] })
    }).then(function (response) {
        if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
        render_authors_for_collection (collection_id);
        jQuery("#authors").val("");
        autocomplete_author(null, collection_id);
    }).catch(function () {
        show_message ("failure",`<p>Failed to add ${author_id}.</p>`);
    });
}

function add_funding (funding_uuid, collection_id) {
    fetch(`/v2/account/collections/${collection_id}/funding`, {
        method:  "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body:    JSON.stringify({ "funders": [{ "uuid": funding_uuid }] })
    }).then(function (response) {
        if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
        render_funding_for_collection (collection_id);
        jQuery("#funding").val("");
        autocomplete_funding(null, collection_id);
    }).catch(function () { show_message ("failure", `<p>Failed to add ${funding_uuid}.</p>`); });
}

function add_dataset (dataset_id, collection_id) {
    fetch(`/v2/account/collections/${collection_id}/articles`, {
        method:  "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body:    JSON.stringify({ "articles": [dataset_id] })
    }).then(function (response) {
        if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
        render_datasets_for_collection (collection_id);
        jQuery("#article-search").val("");
        autocomplete_dataset(null, collection_id);
    }).catch(function () {
        show_message ("failure",`<p>Failed to add ${dataset_id}.</p>`);
    });
}

function add_reference (collection_id) {
    let url = jQuery("#references").val().trim();
    if (url != "") {
        fetch(`/v3/collections/${collection_id}/references`, {
            method:  "POST",
            headers: { "Accept": "application/json", "Content-Type": "application/json" },
            body:    JSON.stringify({ "references": [{ "url": url }] })
        }).then(function (response) {
            if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
            render_references_for_collection (collection_id);
            jQuery("#references").val("");
        }).catch(function () { show_message ("failure", `<p>Failed to add ${url}.</p>`); });
    }
}

function add_tag (collection_id) {
    let tag = jQuery("#tag").val().trim();
    if (tag == "") { return 0; }

    let tags = []
    if (tag.includes (";")) {
        let items = tag.split(";");
        for (let item of items) {
            if (item != "") { tags.push(item.trim()); }
        }
    } else {
        tags = [tag];
    }
    fetch(`/v3/collections/${collection_id}/tags`, {
        method:  "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body:    JSON.stringify({ "tags": tags })
    }).then(function (response) {
        if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
        render_tags_for_collection (collection_id);
        jQuery("#tag").val("");
        autocomplete_tags(null, collection_id);
    }).catch(function () { show_message ("failure", `<p>Failed to add ${tag}.</p>`); });
}

function remove_author (author_id, collection_id) {
    fetch(`/v2/account/collections/${collection_id}/authors/${author_id}`, {
        method:  "DELETE",
        headers: { "Accept": "application/json" }
    }).then(function (response) {
        if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
        render_authors_for_collection (collection_id);
    }).catch(function () {
        show_message ("failure",`<p>Failed to remove ${author_id}</p>`);
    });
}

function remove_funding (funding_id, collection_id) {
    fetch(`/v2/account/collections/${collection_id}/funding/${funding_id}`, {
        method:  "DELETE",
        headers: { "Accept": "application/json" }
    }).then(function (response) {
        if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
        render_funding_for_collection (collection_id);
    }).catch(function () { show_message ("failure", `<p>Failed to remove ${funding_id}.</p>`); });
}

function remove_reference (url, collection_id) {
    fetch(`/v3/collections/${collection_id}/references?url=${url}`, {
        method:  "DELETE",
        headers: { "Accept": "application/json" }
    }).then(function (response) {
        if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
        render_references_for_collection (collection_id);
    }).catch(function () { show_message ("failure", `<p>Failed to remove ${url}</p>`); });
}

function remove_dataset (dataset_id, collection_id) {
    fetch(`/v2/account/collections/${collection_id}/articles/${dataset_id}`, {
        method:  "DELETE",
        headers: { "Accept": "application/json" }
    }).then(function (response) {
        if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
        render_datasets_for_collection (collection_id);
    }).catch(function () {
        show_message ("failure",`<p>Failed to remove ${dataset_id}.</p>`);
    });
}

function remove_tag (tag, collection_id) {
    fetch(`/v3/collections/${collection_id}/tags?tag=${tag}`, {
        method:  "DELETE",
        headers: { "Accept": "application/json" }
    }).then(function (response) {
        if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
        render_tags_for_collection (collection_id);
    }).catch(function () { show_message ("failure", `<p>Failed to remove ${tag}.</p>`); });
}

function gather_form_data () {
    let categories   = jQuery("input[name='categories']:checked");
    let category_ids = [];
    for (let category of categories) {
        category_ids.push(jQuery(category).val());
    }

    let group_id = jQuery("input[name='groups']:checked")[0];
    if (group_id !== undefined) { group_id = group_id["value"]; }
    else { group_id = null; }

    let title = or_null(jQuery("#title").val());
    if (title == "" || title == null) { title = "Untitled collection"; }
    let form_data = {
        "title":          title,
        "description":    value_from_quill("#description"),
        "resource_title": or_null(jQuery("#resource_title").val()),
        "resource_doi":   or_null(jQuery("#resource_doi").val()),
        "geolocation":    or_null(jQuery("#geolocation").val()),
        "longitude":      or_null(jQuery("#longitude").val()),
        "latitude":       or_null(jQuery("#latitude").val()),
        "organizations":  or_null(jQuery("#organizations").val()),
        "publisher":      or_null(jQuery("#publisher").val()),
        "language":       or_null(jQuery("#language").val()),
        "time_coverage":  or_null(jQuery("#time_coverage").val()),
        "group_id":       group_id,
        "categories":     category_ids
    };

    if (form_data["description"] !== null) {
        form_data["description"] = form_data["description"].replaceAll('<p class="ql-align-justify">', '<p>');
    }

    return form_data;
}

function save_collection (collection_id, event, notify=true, on_success=function () {}) {
    stop_event_propagation (event);

    // When keywords were entered but yet submitted, handle those first.
    add_tag (collection_id);
    add_reference (collection_id);

    let form_data = gather_form_data();
    fetch(`/v2/account/collections/${collection_id}`, {
        method:  "PUT",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body:    JSON.stringify(form_data)
    }).then(function (response) {
        if (!response.ok) { throw response; }
        if (notify) {
            show_message ("success", "<p>Saved changes.</p>");
        }
        on_success ();
    }).catch(function (error) {
        if (notify) {
            json_from_error (error).then(function (json) {
                let message = "<p>Failed to save draft. Please try again at a later time.</p>";
                if (json) { message = `<p>Failed to save draft: ${json.message}</p>`; }
                show_message ("failure", message);
            });
        }
    });
}

function publish_collection (collection_id, event) {
    stop_event_propagation (event);
    jQuery("#content").addClass("loader-top");
    jQuery("#content-wrapper").css('opacity', '0.15');
    save_collection (collection_id, event, false, function() {
        fetch(`/v3/collections/${collection_id}/publish`, {
            method:  "POST",
            headers: { "Accept": "application/json" }
        }).then(function (response) {
            if (!response.ok) { throw response; }
            window.location.replace(`/my/collections/published/${collection_id}`);
        }).catch(function (error) {
            jQuery(".missing-required").removeClass("missing-required");
            json_from_error (error).then(function (error_messages) {
                let error_message = "<p>Please fill in all required fields.</p>";
                if (error_messages != null && error_messages.length > 0) {
                    for (let message of error_messages) {
                        if (message.field_name == "license_id") {
                            jQuery("#license_open").addClass("missing-required");
                            jQuery("#license_embargoed").addClass("missing-required");
                        } else if (message.field_name == "group_id") {
                            jQuery("#groups-wrapper").addClass("missing-required");
                        } else if (message.field_name == "categories") {
                            jQuery("#categories-wrapper").addClass("missing-required");
                        } else {
                            jQuery(`#${message.field_name}`).addClass("missing-required");
                        }
                    }
                }
                show_message ("failure", `${error_message}`);
                jQuery("#content-wrapper").css('opacity', '1.0');
                jQuery("#content").removeClass("loader-top");
            });
        });
    });
}

function add_dataset_event (event) {
    stop_event_propagation (event);
    add_dataset (event.data["dataset_uuid"], event.data["collection_id"]);
}

function autocomplete_dataset (event, collection_id) {
    let current_text = jQuery("#article-search").val().trim();
    if (current_text == "") {
        jQuery("#articles-ac").remove();
        jQuery("#article-search").removeClass("input-for-ac");
    } else if (current_text.length > 2) {
        fetch(`/v2/articles/search`, {
            method:  "POST",
            headers: { "Accept": "application/json", "Content-Type": "application/json" },
            body:    JSON.stringify({ "search_for": current_text, "is_latest": true })
        }).then(function (response) {
            if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
            return response.json();
        }).then(function (data) {
            jQuery("#articles-ac").remove();
            let list = document.createElement("ul");
            for (let item of data) {
                let row = document.createElement("li");
                let anchor = on_click_with_data (create_element("a", {
                    "href": "#" }), {
                        "dataset_uuid": item["uuid"],
                        "collection_id": collection_id
                    }, add_dataset_event);

                anchor.textContent = item["title"];
                if (item["doi"] != null && item["doi"] != "") {
                    anchor.textContent = `${item["title"]} (${item["doi"]})`;
                }
                row.append(anchor);
                list.append(row);
            }
            let wrapper = create_element("div", { "id": "articles-ac", "class": "autocomplete" });
            wrapper.append(list);
            jQuery("#article-search")
                .addClass("input-for-ac")
                .after(wrapper);
        }).catch(function (error) { console.log(`Error: ${error.message}`); });
    }
}

function submit_new_author (collection_id) {
    let first_name = jQuery("#author_first_name").val();
    let last_name = jQuery("#author_last_name").val();
    let authors = [{
        "name":       `${first_name} ${last_name}`,
        "first_name": first_name,
        "last_name":  last_name,
        "email":      jQuery("#author_email").val(),
        "orcid":      jQuery("#author_orcid").val()
    }];

    fetch(`/v2/account/collections/${collection_id}/authors`, {
        method:  "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body:    JSON.stringify({ "authors": authors })
    }).then(function (response) {
        if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
        jQuery("#authors-ac").remove();
        jQuery("#authors").removeClass("input-for-ac");
        render_authors_for_collection (collection_id);
    }).catch(function () {
        show_message ("failure", "<p>Failed to add author.</p>");
    });
}

function submit_new_funding (collection_id) {
    fetch(`/v2/account/collections/${collection_id}/funding`, {
        method:  "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body:    JSON.stringify({
            "funders": [{
                "title":       jQuery("#funding_title").val(),
                "grant_code":  jQuery("#funding_grant_code").val(),
                "funder_name": jQuery("#funding_funder_name").val(),
                "url":         jQuery("#funding_url").val()
            }]
        })
    }).then(function (response) {
        if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
        jQuery("#funding-ac").remove();
        jQuery("#funding").removeClass("input-for-ac");
        render_funding_for_collection (collection_id);
    }).catch(function () { show_message ("failure", `<p>Failed to add funding.</p>`); });
}

function activate (collection_id) {
    install_sticky_header();
    install_touchable_help_icons();

    jQuery(".collection-content").hide();
    jQuery(".collection-content-loader").show();
    jQuery(".collection-content-loader").addClass("loader");
    jQuery(".hide-for-javascript").removeClass("hide-for-javascript");

    jQuery("#delete").on("click", function (event) { delete_collection (collection_id, event); });
    jQuery("#save").on("click", function (event)   { save_collection (collection_id, event); });
    jQuery("#publish").on("click", function (event) { publish_collection (collection_id, event); });
    // Initialize Quill to provide the WYSIWYG editor.
    new Quill('#description', { modules: quill_modules, theme: 'snow' });

    jQuery("#authors").on("input", function (event) {
        return autocomplete_author (event, collection_id);
    });
    jQuery("#funding").on("input", function (event) {
        return autocomplete_funding (event, collection_id);
    });
    jQuery("#references").on("keypress", function(e){
        if(e.which == 13){
            add_reference(collection_id);
        }
    });
    jQuery("#add-reference-button").on("click", function(event) {
        stop_event_propagation (event);
        add_reference (collection_id);
    });
    jQuery("#article-search").on("input", function (event) {
        return autocomplete_dataset (event, collection_id);
    });

    fetch(`/v2/account/collections/${collection_id}`, {
        method:  "GET",
        headers: { "Accept": "application/json" }
    }).then(function (response) {
        if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
        return response.json();
    }).then(function (data) {
        render_categories_for_collection (collection_id, data["categories"]);
        render_authors_for_collection (collection_id);
        render_references_for_collection (collection_id);
        render_datasets_for_collection (collection_id);
        render_tags_for_collection (collection_id);
        render_funding_for_collection (collection_id);

        if (data["group_id"] != null) {
            jQuery(`#group_${data["group_id"]}`).prop("checked", true);
        }
        jQuery("#add-keyword-button").on("click", function(event) {
            stop_event_propagation (event);
            add_tag (collection_id);
        });
        jQuery("#tag").on("keypress", function(e){
            if(e.which == 13) { add_tag(collection_id); }
        });
        jQuery("#tag").on("input", function (event) {
            return autocomplete_tags(event, collection_id);
        });
        jQuery("#expand-categories-button").on("click", toggle_categories);
        jQuery(".collection-content-loader").hide();
        jQuery(".collection-content").fadeIn(200);
    }).catch(function () {
        show_message ("failure","<p>Failed to retrieve collection.</p>");
    });
}
