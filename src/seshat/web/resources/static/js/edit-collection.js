function render_categories_for_collection (dataset_uuid, categories) {
    for (let category of categories) {
        let checkbox = document.getElementById(`category_${category["uuid"]}`);
        let parent   = document.getElementById(`category_${category["parent_uuid"]}`);
        if (checkbox !== null) { checkbox.checked = true; }
        if (parent !== null)   { parent.checked = true; }
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
        let table_body = document.querySelector("#references-list tbody");
        table_body.replaceChildren();
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
            table_body.append(row);
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
        let table_body = document.querySelector("#articles-list tbody");
        table_body.replaceChildren();
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
            table_body.append(row);
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
        let table_body = document.querySelector("#authors-list tbody");
        table_body.replaceChildren();
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
            table_body.append(row);
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
        let table_body = document.querySelector("#funding-list tbody");
        table_body.replaceChildren();
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
            table_body.append(row);
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
        let list = document.getElementById("tags-list");
        list.replaceChildren();
        for (let tag of tags) {
            let row = document.createElement("li");
            let anchor = create_element("a", { "href": "#", "class": "fas fa-trash-can" });
            on_click_with_data (anchor, { "tag": tag, "collection_id": collection_id },
                      remove_tag_event);
            let label = document.createElement("span");
            label.innerHTML = `${tag} &nbsp; `;
            row.append(label, anchor);
            list.append(row);
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
        document.getElementById("authors").value = "";
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
        document.getElementById("funding").value = "";
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
        document.getElementById("article-search").value = "";
        autocomplete_dataset(null, collection_id);
    }).catch(function () {
        show_message ("failure",`<p>Failed to add ${dataset_id}.</p>`);
    });
}

function add_reference (collection_id) {
    let url = document.getElementById("references").value.trim();
    if (url != "") {
        fetch(`/v3/collections/${collection_id}/references`, {
            method:  "POST",
            headers: { "Accept": "application/json", "Content-Type": "application/json" },
            body:    JSON.stringify({ "references": [{ "url": url }] })
        }).then(function (response) {
            if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
            render_references_for_collection (collection_id);
            document.getElementById("references").value = "";
        }).catch(function () { show_message ("failure", `<p>Failed to add ${url}.</p>`); });
    }
}

function add_tag (collection_id) {
    let tag = document.getElementById("tag").value.trim();
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
        document.getElementById("tag").value = "";
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
        category_ids.push(category.value);
    }

    let group_id = jQuery("input[name='groups']:checked")[0];
    if (group_id !== undefined) { group_id = group_id["value"]; }
    else { group_id = null; }

    let title = or_null(document.getElementById("title").value);
    if (title == "" || title == null) { title = "Untitled collection"; }
    let form_data = {
        "title":          title,
        "description":    value_from_quill("#description"),
        "resource_title": or_null(document.getElementById("resource_title").value),
        "resource_doi":   or_null(document.getElementById("resource_doi").value),
        "geolocation":    or_null(document.getElementById("geolocation").value),
        "longitude":      or_null(document.getElementById("longitude").value),
        "latitude":       or_null(document.getElementById("latitude").value),
        "organizations":  or_null(document.getElementById("organizations").value),
        "publisher":      or_null(document.getElementById("publisher").value),
        "language":       or_null(document.getElementById("language").value),
        "time_coverage":  or_null(document.getElementById("time_coverage").value),
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
    document.getElementById("content")?.classList.add("loader-top");
    document.getElementById("content-wrapper").style.opacity = '0.15';
    save_collection (collection_id, event, false, function() {
        fetch(`/v3/collections/${collection_id}/publish`, {
            method:  "POST",
            headers: { "Accept": "application/json" }
        }).then(function (response) {
            if (!response.ok) { throw response; }
            window.location.replace(`/my/collections/published/${collection_id}`);
        }).catch(function (error) {
            document.querySelectorAll(".missing-required").forEach(function (element) {
                element.classList.remove("missing-required");
            });
            json_from_error (error).then(function (error_messages) {
                let error_message = "<p>Please fill in all required fields.</p>";
                if (error_messages != null && error_messages.length > 0) {
                    for (let message of error_messages) {
                        if (message.field_name == "license_id") {
                            document.getElementById("license_open")?.classList.add("missing-required");
                            document.getElementById("license_embargoed")?.classList.add("missing-required");
                        } else if (message.field_name == "group_id") {
                            document.getElementById("groups-wrapper")?.classList.add("missing-required");
                        } else if (message.field_name == "categories") {
                            document.getElementById("categories-wrapper")?.classList.add("missing-required");
                        } else {
                            document.getElementById(`${message.field_name}`)?.classList.add("missing-required");
                        }
                    }
                }
                show_message ("failure", `${error_message}`);
                document.getElementById("content-wrapper").style.opacity = '1.0';
                document.getElementById("content")?.classList.remove("loader-top");
            });
        });
    });
}

function add_dataset_event (event) {
    stop_event_propagation (event);
    add_dataset (event.data["dataset_uuid"], event.data["collection_id"]);
}

function autocomplete_dataset (event, collection_id) {
    let current_text = document.getElementById("article-search").value.trim();
    if (current_text == "") {
        document.getElementById("articles-ac")?.remove();
        document.getElementById("article-search")?.classList.remove("input-for-ac");
    } else if (current_text.length > 2) {
        fetch(`/v2/articles/search`, {
            method:  "POST",
            headers: { "Accept": "application/json", "Content-Type": "application/json" },
            body:    JSON.stringify({ "search_for": current_text, "is_latest": true })
        }).then(function (response) {
            if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
            return response.json();
        }).then(function (data) {
            document.getElementById("articles-ac")?.remove();
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
            document.getElementById("article-search").classList.add("input-for-ac");
            document.getElementById("article-search").after(wrapper);
        }).catch(function (error) { console.log(`Error: ${error.message}`); });
    }
}

function submit_new_author (collection_id) {
    let first_name = document.getElementById("author_first_name").value;
    let last_name = document.getElementById("author_last_name").value;
    let authors = [{
        "name":       `${first_name} ${last_name}`,
        "first_name": first_name,
        "last_name":  last_name,
        "email":      document.getElementById("author_email").value,
        "orcid":      document.getElementById("author_orcid").value
    }];

    fetch(`/v2/account/collections/${collection_id}/authors`, {
        method:  "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body:    JSON.stringify({ "authors": authors })
    }).then(function (response) {
        if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
        document.getElementById("authors-ac")?.remove();
        document.getElementById("authors")?.classList.remove("input-for-ac");
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
                "title":       document.getElementById("funding_title").value,
                "grant_code":  document.getElementById("funding_grant_code").value,
                "funder_name": document.getElementById("funding_funder_name").value,
                "url":         document.getElementById("funding_url").value
            }]
        })
    }).then(function (response) {
        if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
        document.getElementById("funding-ac")?.remove();
        document.getElementById("funding")?.classList.remove("input-for-ac");
        render_funding_for_collection (collection_id);
    }).catch(function () { show_message ("failure", `<p>Failed to add funding.</p>`); });
}

function activate (collection_id) {
    install_sticky_header();
    install_touchable_help_icons();

    jQuery(".collection-content").hide();
    jQuery(".collection-content-loader").show();
    document.querySelectorAll(".collection-content-loader").forEach(function (element) {
        element.classList.add("loader");
    });
    document.querySelectorAll(".hide-for-javascript").forEach(function (element) {
        element.classList.remove("hide-for-javascript");
    });

    document.getElementById("delete")?.addEventListener("click", function (event) { delete_collection (collection_id, event); });
    document.getElementById("save")?.addEventListener("click", function (event)   { save_collection (collection_id, event); });
    document.getElementById("publish")?.addEventListener("click", function (event) { publish_collection (collection_id, event); });
    // Initialize Quill to provide the WYSIWYG editor.
    new Quill('#description', { modules: quill_modules, theme: 'snow' });

    document.getElementById("authors")?.addEventListener("input", function (event) {
        return autocomplete_author (event, collection_id);
    });
    document.getElementById("funding")?.addEventListener("input", function (event) {
        return autocomplete_funding (event, collection_id);
    });
    document.getElementById("references")?.addEventListener("keypress", function(e){
        if(e.which == 13){
            add_reference(collection_id);
        }
    });
    document.getElementById("add-reference-button")?.addEventListener("click", function(event) {
        stop_event_propagation (event);
        add_reference (collection_id);
    });
    document.getElementById("article-search")?.addEventListener("input", function (event) {
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
            let group = document.getElementById(`group_${data["group_id"]}`);
            if (group !== null) { group.checked = true; }
        }
        document.getElementById("add-keyword-button")?.addEventListener("click", function(event) {
            stop_event_propagation (event);
            add_tag (collection_id);
        });
        document.getElementById("tag")?.addEventListener("keypress", function(e){
            if(e.which == 13) { add_tag(collection_id); }
        });
        document.getElementById("tag")?.addEventListener("input", function (event) {
            return autocomplete_tags(event, collection_id);
        });
        document.getElementById("expand-categories-button")?.addEventListener("click", toggle_categories);
        jQuery(".collection-content-loader").hide();
        jQuery(".collection-content").fadeIn(200);
    }).catch(function () {
        show_message ("failure","<p>Failed to retrieve collection.</p>");
    });
}
