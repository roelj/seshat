function decline_dataset (dataset_uuid, event) {
    stop_event_propagation (event);

    document.getElementById("content")?.classList.add("loader-top");
    document.getElementById("content-wrapper").style.opacity = "0.15";
    save_dataset (dataset_uuid, event, false, function() {
        fetch(`/v3/datasets/${dataset_uuid}/decline`, {
            method:  "POST",
            headers: { "Accept": "application/json" }
        }).then(function (response) {
            if (!response.ok) { throw new Error(`${response.status} ${response.statusText}`); }
            window.location.replace("/logout");
        }).catch(function (error) {
            show_message ("failure",
                          `<p>Could not decline due to error ` +
                          `<code>${error.message}</code>.</p>`);
            document.getElementById("content-wrapper").style.opacity = "1.0";
            document.getElementById("content")?.classList.remove("loader-top");
        });
    });
}

function preview_dataset (dataset_uuid, event) {
    stop_event_propagation (event);
    let expiry_date = new Date();
    expiry_date.setDate(expiry_date.getDate() + 1);
    let year  = expiry_date.getFullYear();
    let month = expiry_date.getMonth() + 1; // getMonth is zero-indexed.
    let day   = expiry_date.getDate();
    if (month < 10) { month = `0${month}`; }
    if (day < 10) { day = `0${day}`; }

    save_dataset (dataset_uuid, event, false, function() {
        fetch(`/v2/account/articles/${dataset_uuid}/private_links`, {
            method:  "POST",
            headers: { "Accept": "application/json", "Content-Type": "application/json" },
            body:    JSON.stringify({ "expires_date": `${year}-${month}-${day}` })
        }).then(function (response) {
            if (!response.ok) { throw new Error(`${response.status} ${response.statusText}`); }
            return response.json();
        }).then(function (data) {
            let preview_window = window.open(data["location"], '_blank');
            if (preview_window) { preview_window.focus(); }
            else {
                show_message ("failure",
                              "<p>Cannot open preview window because your " +
                              "browser disabled pop-ups.</p>");
            }
        }).catch(function (error) {
            show_message ("failure",
                          `<p>Could not create a private link due to error ` +
                          `<code>${error.message}</code>.</p>`);
        });
    });
}

function gather_form_data () {
    let categories   = document.querySelectorAll("input[name='categories']:checked");
    let category_ids = [];
    for (let category of categories) {
        category_ids.push(category.value);
    }

    let defined_type_name = null;
    if (document.getElementById("upload_software").checked) {
        defined_type_name = "software";
    } else {
        defined_type_name = "dataset";
    }

    let group_id = document.querySelector("input[name='groups']:checked")?.value ?? null;

    let is_embargoed  = document.getElementById("embargoed_access").checked;
    let is_restricted = document.getElementById("restricted_access").checked;
    let agreed_to_da  = document.getElementById("deposit_agreement").checked;
    let agreed_to_publish = document.getElementById("publish_agreement").checked;
    let is_metadata_record = document.getElementById("metadata_record_only").checked;

    let title = or_null(document.getElementById("title").value);
    if (title == "" || title == null) { title = "Untitled item"; }
    let form_data = {
        "title":          title,
        "description":    value_from_quill("#description"),
        "resource_title": or_null(document.getElementById("resource_title").value),
        "resource_doi":   or_null(document.getElementById("resource_doi").value),
        "geolocation":    or_null(document.getElementById("geolocation").value),
        "longitude":      or_null(document.getElementById("longitude").value),
        "latitude":       or_null(document.getElementById("latitude").value),
        "format":         or_null(document.getElementById("format").value),
        "data_link":      or_null(document.getElementById("data_link").value),
        "derived_from":   or_null(document.getElementById("derived_from").value),
        "same_as":        or_null(document.getElementById("same_as").value),
        "organizations":  or_null(document.getElementById("organizations").value),
        "publisher":      or_null(document.getElementById("publisher").value),
        "time_coverage":  or_null(document.getElementById("time_coverage").value),
        "language":       or_null(document.getElementById("language").value),
        "git_repository_name": or_null(document.getElementById("git-repository-name").value),
        "git_code_hosting_url": or_null(document.getElementById("git-code-hosting-url").value),
        "is_metadata_record": is_metadata_record,
        "metadata_reason": or_null(document.getElementById("metadata_only_reason").value),
        "defined_type":   defined_type_name,
        "is_embargoed":   is_embargoed || is_restricted,
        "group_id":       group_id,
        "agreed_to_deposit_agreement": agreed_to_da,
        "agreed_to_publish": agreed_to_publish,
        "categories":     category_ids
    };

    if (is_embargoed) {
        form_data["embargo_until_date"] = or_null(document.getElementById("embargo_until_date").value);
        form_data["embargo_title"]  = "Under embargo";
        form_data["embargo_reason"] = value_from_quill("#embargo_reason");
        form_data["license_id"]     = or_null(document.getElementById("license_embargoed").value);
        if (document.getElementById("files_only_embargo").checked) {
            form_data["embargo_type"] = "file";
        } else if (document.getElementById("content_embargo").checked) {
            form_data["embargo_type"] = "article";
        }
    } else if (is_restricted) {
        // 149 is the licence ID of the "Restricted Licence".
        form_data["license_id"]     = 149;
        form_data["embargo_until_date"] = null;
        form_data["embargo_title"]  = "Restricted access";
        form_data["embargo_reason"] = value_from_quill("#restricted_access_reason");
        form_data["eula"]           = value_from_quill("#restricted_access_eula");
        form_data["embargo_options"] = [{ "id": 1000, "type": "restricted_access" }];
    } else {
        form_data["license_id"]     = or_null(document.getElementById("license_open").value);
    }

    if (form_data["description"] !== null) {
        form_data["description"] = form_data["description"].replaceAll('<p class="ql-align-justify">', '<p>');
    }
    return form_data;
}

function save_dataset (dataset_uuid, event, notify=true, on_success=function () {}) {
    stop_event_propagation (event);

    // When keywords were entered but not yet submitted, handle those first.
    add_tag (dataset_uuid);
    add_reference (dataset_uuid);
    let external_url = document.getElementById("external_url").value;
    if (external_url && external_url != "") {
        submit_external_link (dataset_uuid);
    }
    let form_data = gather_form_data();
    fetch(`/v2/account/articles/${dataset_uuid}`, {
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

function delete_all_files (dataset_uuid) {
    fetch(`/v2/account/articles/${dataset_uuid}/files`, {
        method:  "DELETE",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body:    JSON.stringify({ "remove_all": true })
    }).then(function (response) {
        if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
        document.getElementById("remove-all-files").textContent = `Remove all files.`;
        render_files_for_dataset (dataset_uuid, null);
        hide_elements ("#thumbnails-wrapper");
        hide_elements ("#thumbnail-files-wrapper");
    }).catch(function () {
        show_message ("failure", "<p>Failed to remove files.</p>");
    });
}

function repair_md5_sums (dataset_uuid, event) {
    save_dataset (dataset_uuid, event, false, function() {
        fetch(`/v3/datasets/${dataset_uuid}/repair_md5s`, {
            method:  "GET",
            headers: { "Accept": "application/json" }
        }).then(function (response) {
            if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
            location.reload();
        }).catch(function () {
            show_message ("failure", "<p>Failed to repair MD5 checksums.</p>");
        });
    });
}

function render_licenses (dataset) {
    let chosen_license = null;
    // When the dataset hasn't been given a license yet, accessing
    // license.value will throw a TypeError. This is expected.
    try { chosen_license = dataset.license.value; }
    catch (error) {}

    fetch("/v2/licenses", {
        method:  "GET",
        headers: { "Accept": "application/json" }
    }).then(function (response) {
        if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
        return response.json();
    }).then(function (licenses) {
        for (let license of licenses) {
            // Skip legacy licenses; render them last.
            if (license.type == "legacy") { continue; }
            let selected = ((chosen_license == license.value) ? " selected" : "");
            let html = `<option value="${license.value}"${selected}>${license.name}</option>`;
            document.querySelectorAll(".license-selector").forEach(function (selector) {
                selector.insertAdjacentHTML("beforeend", html);
            });
        }
    }).catch(function () {
        show_message ("failure", "<p>Failed to retrieve license list.</p>");
    });
}

function render_categories_for_dataset (dataset_uuid) {
    let parameters = build_query_parameters ({ "limit": 10000 });
    fetch(`/v2/account/articles/${dataset_uuid}/categories?${parameters}`, {
        method:  "GET",
        headers: { "Accept": "application/json" }
    }).then(function (response) {
        if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
        return response.json();
    }).then(function (categories) {
        for (let category of categories) {
            let checkbox = document.getElementById(`category_${category["uuid"]}`);
            let parent   = document.getElementById(`category_${category["parent_uuid"]}`);
            if (checkbox !== null) { checkbox.checked = true; }
            if (parent !== null)   { parent.checked = true; }
            show_elements (`#subcategories_${category["parent_uuid"]}`);
        }
    }).catch(function () {
        show_message ("failure", "<p>Failed to retrieve categories.</p>");
    });
}

function remove_reference_event (event) {
    stop_event_propagation (event);
    remove_reference (event.data["encoded_url"], event.data["dataset_uuid"]);
}

function render_references_for_dataset (dataset_uuid) {
    let parameters = build_query_parameters ({ "limit": 10000, "order": "id", "order_direction": "asc" });
    fetch(`/v3/datasets/${dataset_uuid}/references?${parameters}`, {
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
                                { "encoded_url": encoded_url, "dataset_uuid": dataset_uuid },
                                remove_reference_event);
            column2.append(anchor);
            row.append(column1, column2);
            table_body.append(row);
        }
        show_elements ("#references-list", "table");
    }).catch(function () {
        show_message ("failure", "<p>Failed to retrieve references.</p>");
    });
}

function remove_collaborator_event (event) {
    stop_event_propagation (event);
    remove_collaborator (event.data["collaborator_uuid"],
                         event.data["dataset_uuid"],
                         event.data["may_edit_metadata"]);
}

function update_collaborator_event (event) {
    stop_event_propagation (event);
    update_collaborator (event.data["collaborator_uuid"],
                         event.data["dataset_uuid"],
                         event.data["may_edit_metadata"]);
}

function render_collaborators_for_dataset (dataset_uuid, may_edit_metadata, callback=function () {}) {
    let parameters = build_query_parameters ({ "limit": 10000, "order": "id", "order_direction": "asc" });
    fetch(`/v3/datasets/${dataset_uuid}/collaborators?${parameters}`, {
        method:  "GET",
        headers: { "Accept": "application/json" }
    }).then(function (response) {
        if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
        return response.json();
    }).then(function (collaborators) {
        let table_body = document.querySelector("#collaborators-form tbody");
        table_body.replaceChildren();

        for (let collaborator of collaborators) {
            let row = create_element("tr", { "id": `row-${encodeURIComponent(collaborator.uuid)}` });
            let column1 = document.createElement("td");
            let supervisor_badge = "";
            let group_member_badge = "";
            if (collaborator.is_supervisor) {
                supervisor_badge = '<span class="active-badge">Supervisor</span>';
            }
            if (collaborator.is_inferred) {
                group_member_badge = `<span class="active-badge">${collaborator.group_name}</span>`;
            }
            let input_settings = { "type": "checkbox" };
            if (collaborator.is_supervisor) { input_settings["disabled"] = "disabled"; }

            column1.innerHTML = `${collaborator.first_name} ${collaborator.last_name ?? ''} (${collaborator.email})${supervisor_badge}${group_member_badge}`;
            let column2 = create_element("td", { "class": "type-begin" });
            let column3 = create_element("td", { "class": "type-end" });
            let column4 = document.createElement("td");
            let column5 = document.createElement("td");
            let column6 = create_element("td", { "class": "type-end" });
            let column7 = document.createElement("td");
            let column8 = document.createElement("td");

            let input1_settings = { ...input_settings, ...{ "class": "subitem-checkbox-metadata", "name": "read" } };
            let input2_settings = { ...input_settings, ...{ "class": "subitem-checkbox-metadata", "name": "edit" } };
            let input3_settings = { ...input_settings, ...{ "class": "subitem-checkbox-data", "name": "read" } };
            let input4_settings = { ...input_settings, ...{ "class": "subitem-checkbox-data", "name": "edit" } };
            let input5_settings = { ...input_settings, ...{ "class": "subitem-checkbox-data", "name": "remove" } };

            if (collaborator.metadata_read) { input1_settings["checked"] = "checked"; }
            if (collaborator.metadata_edit) { input2_settings["checked"] = "checked"; }
            if (collaborator.data_read) { input3_settings["checked"] = "checked"; }
            if (collaborator.data_edit) { input4_settings["checked"] = "checked"; }
            if (collaborator.data_remove) { input5_settings["checked"] = "checked"; }

            column2.append (create_element("input", input1_settings));
            column3.append (create_element("input", input2_settings));
            column4.append (create_element("input", input3_settings));
            column5.append (create_element("input", input4_settings));
            column6.append (create_element("input", input5_settings));

            if (may_edit_metadata && !collaborator.is_inferred && !collaborator.is_supervisor) {
                let anchor = create_element("a", { "href": "#", "class": "fas fa-trash-can", "title": "Remove" });
                on_click_with_data (anchor, {
                    "collaborator_uuid": collaborator.uuid,
                    "dataset_uuid": dataset_uuid,
                    "may_edit_metadata": may_edit_metadata }, remove_collaborator_event);
                column7.append(anchor);
            }
            if (may_edit_metadata && !collaborator.is_supervisor && !collaborator.is_inferred) {
                let anchor = create_element("a", { "href": "#", "class": "fas fa-sync", "title": "Update" });
                on_click_with_data (anchor, {
                    "collaborator_uuid": collaborator.uuid,
                    "dataset_uuid": dataset_uuid,
                    "may_edit_metadata": may_edit_metadata }, update_collaborator_event);
                column8.append(anchor);
            }

            row.append(column1, column2, column3, column4, column5, column6, column7, column8);
            if (collaborator.is_supervisor) { table_body.prepend(row); }
            else { table_body.append(row); }

        }

        if (may_edit_metadata) {
            let row = "<tr>";
            row += '<td><input type="text" id="add_collaborator" name="add_collaborator" value=""/>';
            row += '<input type="hidden" id="account_uuid" name="account_uuid" value=""/></td>';
            row += '<td class="type-begin"><input class="subitem-checkbox-metadata" name="read" type="checkbox" checked="checked" disabled="disabled"></td>';
            row += '<td class="type-end"><input class="subitem-checkbox-metadata" name="edit" type="checkbox"></td>';
            row += '<td><input class="subitem-checkbox-data" name="read" type="checkbox"></td>';
            row += '<td><input class="subitem-checkbox-data" name="edit" type="checkbox"></td>';
            row += '<td class="type-end"><input class="subitem-checkbox-data" name="remove" type="checkbox"></td>';
            row += '<td><a id="add-collaborator-button" class="fas fa-plus" href="#" ';
            row += 'title="Add collaborator"></a></td>';
            row += '<td></td>';
            row += "</tr>";
            table_body.insertAdjacentHTML("afterbegin", row);
            document.getElementById("add-collaborator-button")?.addEventListener("click", function(event) {
                stop_event_propagation (event);
                add_collaborator(dataset_uuid, may_edit_metadata);
            });
        }

        document.getElementById("add_collaborator")?.addEventListener("input", function (event) {
            return autocomplete_collaborator (event, dataset_uuid);
        });
        show_elements ("#collaborators-form");
        callback ();
    }).catch(function () {
        show_message ("failure", "<p>Failed to retrieve collaborators.</p>");
    });
}

function update_collaborator (collaborator_uuid, dataset_uuid, may_edit_metadata) {
    if (may_edit_metadata) {
        let update_form_data = {
            "metadata": {
                "read": document.querySelector(`#row-${collaborator_uuid} input[name='read'].subitem-checkbox-metadata`)?.checked,
                "edit": document.querySelector(`#row-${collaborator_uuid} input[name='edit'].subitem-checkbox-metadata`)?.checked,
            },
            "data": {
                "read": document.querySelector(`#row-${collaborator_uuid} input[name='read'].subitem-checkbox-data`)?.checked,
                "edit": document.querySelector(`#row-${collaborator_uuid} input[name='edit'].subitem-checkbox-data`)?.checked,
                "remove": document.querySelector(`#row-${collaborator_uuid} input[name='remove'].subitem-checkbox-data`)?.checked,
            },
            "account": or_null(document.getElementById("account_uuid")?.value)
        };

        fetch(`/v3/datasets/${dataset_uuid}/collaborators/${collaborator_uuid}`, {
            method:  "PUT",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify(update_form_data)
        }).then(function (response) {
            if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
            render_collaborators_for_dataset(dataset_uuid, may_edit_metadata);
        }).catch(function () {
            show_message("failure", `<p>Failed to update ${collaborator_uuid}</p>`);
        });
    }
}

function add_collaborator (dataset_uuid, may_edit_metadata) {
    let form_data= {
        "metadata": {
            "read": document.querySelector("input[name='read'].subitem-checkbox-metadata")?.checked,
            "edit": document.querySelector("input[name='edit'].subitem-checkbox-metadata")?.checked,
        },
        "data": {
            "read": document.querySelector("input[name='read'].subitem-checkbox-data")?.checked,
            "edit": document.querySelector("input[name='edit'].subitem-checkbox-data")?.checked,
            "remove": document.querySelector("input[name='remove'].subitem-checkbox-data")?.checked,
        },
        "account": or_null(document.getElementById("account_uuid")?.value)
    };

    fetch(`/v3/datasets/${dataset_uuid}/collaborators`, {
        method:  "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body:    JSON.stringify(form_data)
    }).then(function (response) {
        if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
        render_collaborators_for_dataset(dataset_uuid, may_edit_metadata);
        document.getElementById("add_collaborator").value = "";
    }).catch(function () { show_message ("failure", `<p>Failed to add collaborator.</p>`); });
}

function remove_collaborator (collaborator_uuid, dataset_uuid, may_edit_metadata) {
    fetch(`/v3/datasets/${dataset_uuid}/collaborators/${collaborator_uuid}`, {
        method:  "DELETE",
        headers: { "Accept": "application/json" }
    }).then(function (response) {
        if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
        render_collaborators_for_dataset (dataset_uuid, may_edit_metadata);
    }).catch(function () { show_message ("failure", `<p>Failed to remove ${collaborator_uuid}</p>`); });
}

function remove_tag_event (event) {
    stop_event_propagation (event);
    remove_tag (encodeURIComponent(event.data["tag"]), event.data["dataset_uuid"]);
}

function render_tags_for_dataset (dataset_uuid) {
    let parameters = build_query_parameters ({ "limit": 10000 });
    fetch(`/v3/datasets/${dataset_uuid}/tags?${parameters}`, {
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
            on_click_with_data (anchor, { "tag": tag, "dataset_uuid": dataset_uuid }, remove_tag_event);
            let label = document.createElement("span");
            label.innerHTML = `${tag} &nbsp; `;
            row.append(label, anchor);
            list.append(row);
        }
        show_elements ("#tags-list", "block");
    }).catch(function () { show_message ("failure", "<p>Failed to retrieve tags.</p>"); });
}

// The pen icon of an author toggles between "edit" and "cancel", so its click
// handler gets replaced.  Hence the onclick property instead of a listener.
function set_edit_author_handler (element, handler, author_uuid, dataset_uuid) {
    if (element === null) { return; }
    element.onclick = function (event) {
        event.data = { "author_uuid": author_uuid, "dataset_uuid": dataset_uuid };
        handler (event);
    };
}

function cancel_edit_author (author_uuid, dataset_uuid) {
    document.getElementById("author-inline-edit-form")?.remove();
    let button = document.getElementById(`edit-author-${author_uuid}`);
    set_edit_author_handler (button, edit_author_event, author_uuid, dataset_uuid);
    if (button !== null) {
        button.classList.remove("fa-times", "fa-lg");
        button.classList.add("fa-pen");
    }
}

function reorder_author (dataset_uuid, author_uuid, direction) {
    fetch(`/v3/datasets/${dataset_uuid}/reorder-authors`, {
        method:  "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body:    JSON.stringify({ "author":  author_uuid, "direction": direction })
    }).then(function (response) {
        if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
        render_authors_for_dataset (dataset_uuid);
    }).catch(function () {
        show_message ("failure", "<p>Failed to change the order of the authors.</p>");
    });
}

function update_author (author_uuid, dataset_uuid) {
    let record = {
        "first_name": document.getElementById("edit_author_first_name").value,
        "last_name": document.getElementById("edit_author_last_name").value,
        "email": document.getElementById("edit_author_email").value,
        "orcid": document.getElementById("edit_author_orcid").value
    };
    fetch(`/v3/authors/${author_uuid}`, {
        method:  "PUT",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body:    JSON.stringify(record)
    }).then(function (response) {
        if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
        cancel_edit_author (author_uuid, dataset_uuid);
        render_authors_for_dataset (dataset_uuid);
    }).catch(function () {
        show_message ("failure", "<p>Failed to update author details.</p>");
    });
}

function cancel_edit_author_event (event) {
    stop_event_propagation (event);
    cancel_edit_author (event.data["author_uuid"], event.data["dataset_uuid"]);
}

function edit_author_event (event) {
    stop_event_propagation (event);
    edit_author (event.data["author_uuid"], event.data["dataset_uuid"]);
}

function update_author_event (event) {
    stop_event_propagation (event);
    update_author (event.data["author_uuid"], event.data["dataset_uuid"]);
}

function edit_author (author_uuid, dataset_uuid) {
    fetch(`/v3/datasets/${dataset_uuid}/authors/${author_uuid}`, {
        method:  "GET",
        headers: { "Accept": "application/json" }
    }).then(function (response) {
        if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
        return response.json();
    }).then(function (author) {
        let row = create_element("tr", { "id": "author-inline-edit-form" });
        let column1 = create_element("td", { "colspan": "5" });
        column1.append (create_element("label", { "for": "author_first_name" }, "First name"));
        column1.append (create_element("input", { "type": "text", "id": "edit_author_first_name", "name": "author_first_name", "value": or_empty (author.first_name) }));
        column1.append (create_element("label", { "for": "author_last_name" }, "Last name"));
        column1.append (create_element("input", { "type": "text", "id": "edit_author_last_name", "name": "author_last_name", "value": or_empty (author.last_name) }));
        column1.append (create_element("label", { "for": "author_email" }, "E-mail address"));
        column1.append (create_element("input", { "type": "text", "id": "edit_author_email", "name": "author_email", "value": or_empty (author.email) }));
        column1.append (create_element("label", { "for": "author_orcid" }, "ORCID"));
        column1.append (create_element("input", { "type": "text", "id": "edit_author_orcid", "name": "author_orcid", "value": or_empty (author.orcid) }));

        let button_wrapper = create_element("div", { "id": "update-author", "class": "a-button" });
        let anchor = create_element("a", { "href": "#" }, "Update author");
        on_click_with_data (anchor, { "author_uuid": author_uuid, "dataset_uuid": dataset_uuid }, update_author_event);
        button_wrapper.append (anchor);
        column1.append (button_wrapper);
        row.append(column1);
        document.getElementById(`author-${author_uuid}`).after(row);
        let button = document.getElementById(`edit-author-${author_uuid}`);
        set_edit_author_handler (button, cancel_edit_author_event, author_uuid, dataset_uuid);
        if (button !== null) {
            button.classList.remove("fa-pen");
            button.classList.add("fa-times", "fa-lg");
        }
    }).catch(function (error) { console.log(`Error: ${error.message}`); });
}

function reorder_author_event (event) {
    stop_event_propagation (event);
    reorder_author (event.data["dataset_uuid"],
                    event.data["author_uuid"],
                    event.data["direction"]);
}

function remove_author_event (event) {
    stop_event_propagation (event);
    remove_author (event.data["author_uuid"], event.data["dataset_uuid"]);
}

function render_authors_for_dataset (dataset_uuid) {
    let parameters = build_query_parameters ({ "limit": 10000 });
    fetch(`/v3/datasets/${dataset_uuid}/authors?${parameters}`, {
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
            if (author.orcid && author.orcid != "") { orcid = author.orcid; }
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
                let edit_anchor = create_element("a", {
                    "id": `edit-author-${author.uuid}`,
                    "href": "#",
                    "class": "fas fa-pen",
                    "title": "Edit"
                });
                set_edit_author_handler (edit_anchor, edit_author_event, author.uuid, dataset_uuid);
                column2.append(edit_anchor);
            }
            if (number_of_items == 1) {
            } else if (index == 0) {
                column3.append(on_click_with_data (create_element("a", { "class": "fas fa-angle-down"}), {
                    "author_uuid": author.uuid,
                    "dataset_uuid": dataset_uuid,
                    "direction": "down" }, reorder_author_event));
            } else if (index == number_of_items - 1) {
                column4.append(on_click_with_data (create_element("a", { "class": "fas fa-angle-up"}), {
                    "author_uuid": author.uuid,
                    "dataset_uuid": dataset_uuid,
                    "direction": "up" }, reorder_author_event));
            } else {
                column3.append(on_click_with_data (create_element("a", { "class": "fas fa-angle-down"}), {
                    "author_uuid": author.uuid,
                    "dataset_uuid": dataset_uuid,
                    "direction": "down" }, reorder_author_event));
                column4.append(on_click_with_data (create_element("a", { "class": "fas fa-angle-up"}), {
                    "author_uuid": author.uuid,
                    "dataset_uuid": dataset_uuid,
                    "direction": "up" }, reorder_author_event));
            }
            column5.append(on_click_with_data (create_element("a", {
                "href": "#",
                "class": "fas fa-trash-can",
                "title": "Remove" }), { "author_uuid": author.uuid,
                                                   "dataset_uuid": dataset_uuid },
                                        remove_author_event));

            row.append(column1, column2, column3, column4, column5);
            table_body.append(row);
        }
        show_elements ("#authors-list", "table");
    }).catch(function () {
        show_message ("failure", "<p>Failed to retrieve author details.</p>");
    });
}

function remove_funding_event (event) {
    stop_event_propagation (event);
    remove_funding (event.data["funding_uuid"], event.data["dataset_uuid"]);
}

function render_funding_for_dataset (dataset_uuid) {
    let parameters = build_query_parameters ({ "limit": 10000, "order": "id", "order_direction": "asc" });
    fetch(`/v2/account/articles/${dataset_uuid}/funding?${parameters}`, {
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
            let anchor = create_element("a", { "href": "#", "class": "fas fa-trash-can", "title": "Remove" });
            on_click_with_data (anchor, { "funding_uuid": funding.uuid, "dataset_uuid": dataset_uuid },
                       remove_funding_event);
            column2.append(anchor);
            row.append(column1, column2);
            table_body.append(row);
        }
        show_elements ("#funding-list", "table");
    }).catch(function () {
        show_message ("failure", "<p>Failed to retrieve funding details.</p>");
    });
}

function render_git_branches_for_dataset (dataset_uuid, event) {
    stop_event_propagation (event);
    fetch(`/v3/datasets/${dataset_uuid}.git/branches`, {
        method:  "GET",
        headers: { "Accept": "application/json" }
    }).then(function (response) {
        if (!response.ok) { throw response; }
        return response.json();
    }).then(function (data) {
        let branches = data["branches"];
        let default_branch = data["default-branch"];
        let selector = document.getElementById("git-branches");
        selector.replaceChildren();
        if (branches !== null && branches.length > 0) {
            for (let branch of branches) {
                let option = create_element("option", { "value": branch }, branch);
                if (branch == default_branch) {
                    option.selected = true;
                }
                selector.append(option);
            }
        } else {
            selector.insertAdjacentHTML("beforeend", '<option value="" disabled="disabled" selected="selected">No branches found</option>');
        }
    }).catch(function (error) {
	if (error.status !== 404) {
            show_message ("failure", "<p>Failed to retrieve Git branches.</p>");
	}
        let selector = document.getElementById("git-branches");
        selector.replaceChildren();
        selector.insertAdjacentHTML("beforeend", '<option value="" disabled="disabled" selected="selected">No branches found</option>');
    });
}

function set_default_git_branch (dataset_uuid, event) {
    stop_event_propagation (event);
    let branch_name = document.getElementById("git-branches").value;
    fetch(`/v3/datasets/${dataset_uuid}.git/set-default-branch`, {
        method:  "PUT",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body:    JSON.stringify({ "branch": branch_name })
    }).then(function (response) {
        if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
        show_message ("success", `<p>Default Git branch set to <strong>${escape_html(branch_name)}</strong>.</p>`);
        render_git_files_for_dataset (dataset_uuid, event);
    }).catch(function () {
        show_message ("failure", "<p>Failed to retrieve Git file details.</p>");
    });
}

function render_git_files_for_dataset (dataset_uuid, event) {
    stop_event_propagation (event);
    let parameters = build_query_parameters ({ "limit": 10000, "order": "id", "order_direction": "asc" });
    fetch(`/v3/datasets/${dataset_uuid}.git/files?${parameters}`, {
        method:  "GET",
        headers: { "Accept": "application/json" }
    }).then(function (response) {
        if (!response.ok) { throw response; }
        return response.json();
    }).then(function (files) {
        let list = document.getElementById("git-files");
        list.replaceChildren();
        for (let file of files) {
            list.append(create_element("li", {}, file));
        }
        show_elements ("#git-files-label");
        show_elements ("#git-files-wrapper");
    }).catch(function (error) {
        hide_elements ("#git-files-label");
        hide_elements ("#git-files-wrapper");
	if (error.status !== 404) {
            show_message ("failure", "<p>Failed to retrieve Git file details.</p>");
	}
    });
}

function remove_file_event (event) {
    stop_event_propagation (event);
    remove_file (event.data["file_uuid"], event.data["dataset_uuid"]);
}

function render_files_for_dataset (dataset_uuid, fileUploader) {
    let parameters = build_query_parameters ({ "limit": 10000, "order": "id", "order_direction": "asc" });
    fetch(`/v2/account/articles/${dataset_uuid}/files?${parameters}`, {
        method:  "GET",
        headers: { "Accept": "application/json" }
    }).then(function (response) {
        if (!response.ok) { throw response; }
        return response.json();
    }).then(function (files) {
        if (fileUploader !== null) {
            fileUploader.removeAllFiles();
        }
        let table_body = document.querySelector("#files tbody");
        table_body.replaceChildren();
        if (files.length > 0) {
            document.querySelectorAll("input[name='record_type']").forEach(function (element) { element.disabled = true; });
            document.getElementById("upload_software").disabled = false;
            document.getElementById("upload_files").disabled = false;

            let number_of_files = 0;
            for (let index in files) {
                let file = files[index];
                if (file.name === null) {
                    file.name = file.download_url;
                }
                let row = document.createElement("tr");
                let column1 = document.createElement("td");
                let column2 = document.createElement("td");
                let column3 = document.createElement("td");
                let anchor = create_element("a", { "href": `/file/${dataset_uuid}/${file.uuid}` }, file.name);
                let file_size = create_element("span", { "class": "file-size" }, prettify_size(file.size));
                column1.append(anchor, file_size);
                if ("is_incomplete" in file && file["is_incomplete"] == true) {
                    column1.append(create_element("span", { "class": "file-incomplete-warning" }, "The file upload was not complete!"));
                }
                if ("handle" in file) {
                    let handle_anchor = create_element("a", { "href": `https://hdl.handle.net/${file.handle}` });
                    handle_anchor.append(create_element("img", {
                        "src": "/static/images/handle-logo.png",
                        "class": "handle-icon",
                        "alt": "Handle"
                    }));
                    column1.append(handle_anchor);
                }
                if (file["computed_md5"] === null) {
                    column2.textContent = `${render_in_form("Unavailable")}`;
                } else {
                    column2.textContent = `${render_in_form(file["computed_md5"])}`;
                }

                let remove_anchor = create_element("a", { "href": "#", "class": "fas fa-trash-can", "title": "Remove" });
                on_click_with_data (remove_anchor, { "file_uuid": file.uuid, "dataset_uuid": dataset_uuid }, remove_file_event);
                column3.append(remove_anchor);
                row.append(column1, column2, column3);
                table_body.append(row);
                number_of_files += 1;
            }
            document.getElementById("remove-all-files").textContent = `Remove all ${number_of_files} files.`;
            show_elements ("#files");
            show_elements ("#files-table-actions");
            render_files_for_thumbnail (dataset_uuid);
        } else {
            hide_elements ("#files");
            hide_elements ("#files-table-actions");
            document.querySelectorAll("input[name='record_type']").forEach(function (element) { element.disabled = false; });
            render_files_for_thumbnail (dataset_uuid);
        }
    }).catch(function (error) {
        if (error.status == 403) {
            let html = '<tr class="notice-box"><td colspan="2">You do not have permission to view the files.</td><td></td></tr>';
            let table_body = document.querySelector("#files tbody");
            table_body.replaceChildren();
            table_body.insertAdjacentHTML("beforeend", html);
        } else {
            show_message ("failure", "<p>Failed to retrieve file details.</p>");
        }
    });
}

function render_files_for_thumbnail (dataset_uuid) {

    function html_for_thumbnail_tile (img_src, file_uuid, title) {
        if (initial_thumbnail_file_uuid == null) { initial_thumbnail_file_uuid = ""; }
        let active = " thumbnail-active";
        if (file_uuid != initial_thumbnail_file_uuid) { active = " thumbnail-inactive"; }
        let html = `<div class="thumbnail-item${active}"><label>`;
        html += `<input type="radio" name="thumbnail" value="${file_uuid}" />`;
        html += '<div class="thumbnail-item-img-wrapper">';
        html += `<img src="${img_src}" aria-hidden="true"/></div>`;
        html += `<div class="thumbnail-item-title"><p>${title}</p></div>`;
        html += '</label></div>';
        return html;
    }

    let parameters = build_query_parameters ({ "limit": 10000 });
    fetch(`/v3/datasets/${dataset_uuid}/image-files?${parameters}`, {
        method:  "GET",
        headers: { "Accept": "application/json" }
    }).then(function (response) {
        if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
        return response.json();
    }).then(function (files) {
        let wrapper = document.getElementById("thumbnails-wrapper");
        wrapper.replaceChildren();
        if (files.length > 0) {
            show_elements ("#thumbnails-wrapper");
            show_elements ("#thumbnail-files-wrapper");
            let html = "";
            html += html_for_thumbnail_tile ("/static/images/dataset-thumb.svg",
                                             "", "Standard thumbnail");

            for (let index in files) {
                let file = files[index];
                html += html_for_thumbnail_tile (`/file/${dataset_uuid}/${file.uuid}`,
                                                 file.uuid, file.name);
            }

            wrapper.insertAdjacentHTML("beforeend", html);
            show_elements ("#thumbnails-wrapper");

            // Add event listener to toggle the blue border on selection
            add_event_listeners ('input[name="thumbnail"]', "change", function () {
                document.querySelectorAll(".thumbnail-item").forEach(function (element) {
                    element.classList.remove("thumbnail-active");
                    element.classList.add("thumbnail-inactive");
                });

                let selected_thumb = document.querySelector('input[name="thumbnail"]:checked');
                selected_thumb.closest(".thumbnail-item").classList.add("thumbnail-active");
                fetch(`/v3/datasets/${dataset_uuid}/update-thumbnail`, {
                    method:  "PUT",
                    headers: { "Accept": "application/json", "Content-Type": "application/json" },
                    body:    JSON.stringify({ "uuid": `${selected_thumb.value}` })
                }).then(function (response) {
                    if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }

                }).catch(function () {
                    show_message ("failure", "<p>Failed to set thumbnail.</p>");
                });
            });
        } else {
            hide_elements ("#thumbnails-wrapper");
            hide_elements ("#thumbnail-files-wrapper");
        }
    }).catch(function () {
        show_message("failure", "<p>Failed to retrieve thumbnail file details.</p>");
    });
}

function add_author (author_uuid, dataset_uuid) {
    fetch(`/v2/account/articles/${dataset_uuid}/authors`, {
        method:  "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body:    JSON.stringify({ "authors": [{ "uuid": author_uuid }] })
    }).then(function (response) {
        if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
        render_authors_for_dataset (dataset_uuid);
        document.getElementById("authors").value = "";
        autocomplete_author(null, dataset_uuid);
    }).catch(function () { show_message ("failure", `<p>Failed to add ${author_uuid}.</p>`); });
}

function add_funding (funding_uuid, dataset_uuid) {
    fetch(`/v2/account/articles/${dataset_uuid}/funding`, {
        method:  "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body:    JSON.stringify({ "funders": [{ "uuid": funding_uuid }] })
    }).then(function (response) {
        if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
        render_funding_for_dataset (dataset_uuid);
        document.getElementById("funding").value = "";
        autocomplete_funding(null, dataset_uuid);
    }).catch(function () { show_message ("failure", `<p>Failed to add ${funding_uuid}.</p>`); });
}

function submit_external_link (dataset_uuid) {
    let url = document.getElementById("external_url").value;
    if (url == "") {
        document.getElementById("external_url").style.background = "#cc0000";
        return false;
    }
    fetch(`/v2/account/articles/${dataset_uuid}/files`, {
        method:  "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body:    JSON.stringify({ "link": url })
    }).then(function (response) {
        if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
        document.getElementById("external_url").value = "";
        hide_elements ("#external_link_field");
        render_files_for_dataset (dataset_uuid, null);
    }).catch(function () { show_message ("failure", `<p>Failed to add ${url}.</p>`); });
}

function add_reference (dataset_uuid) {
    let url = document.getElementById("references").value.trim();
    if (url != "") {
        fetch(`/v3/datasets/${dataset_uuid}/references`, {
            method:  "POST",
            headers: { "Accept": "application/json", "Content-Type": "application/json" },
            body:    JSON.stringify({ "references": [{ "url": url }] })
        }).then(function (response) {
            if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
            render_references_for_dataset (dataset_uuid);
            document.getElementById("references").value = "";
        }).catch(function () { show_message ("failure", `<p>Failed to add ${url}.</p>`); });
    }
}

function add_tag (dataset_uuid) {
    let tag = document.getElementById("tag").value.trim();
    if (tag == "") { return 0; }

    let tags = [];
    if (tag.includes (";")) {
        let items = tag.split(";");
        for (let item of items) {
            if (item != "") { tags.push(item.trim()); }
        }
    } else {
        tags = [tag];
    }
    fetch(`/v3/datasets/${dataset_uuid}/tags`, {
        method:  "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body:    JSON.stringify({ "tags": tags })
    }).then(function (response) {
        if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
        render_tags_for_dataset (dataset_uuid);
        document.getElementById("tag").value = "";
        autocomplete_tags(null, dataset_uuid);
    }).catch(function () { show_message ("failure", `<p>Failed to add ${tag}.</p>`); });
}

function submit_new_author (dataset_uuid) {
    let first_name = document.getElementById("author_first_name").value;
    let last_name = document.getElementById("author_last_name").value;
    document.getElementById("author_first_name")?.classList.remove("missing-required");
    document.getElementById("author_last_name")?.classList.remove("missing-required");

    if (first_name == "" && last_name == "") {
        let error_message = "<p>You must enter at least one of the first or last names.</p>";
        document.getElementById("author_first_name")?.classList.add("missing-required");
        show_message ("failure", `${error_message}`);
        return false;
    }

    let authors = [{
        "name":       `${first_name} ${last_name}`,
        "first_name": first_name,
        "last_name":  last_name,
        "email":      document.getElementById("author_email").value,
        "orcid_id":   document.getElementById("author_orcid").value
    }];

    fetch(`/v2/account/articles/${dataset_uuid}/authors`, {
        method:  "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body:    JSON.stringify({
            "authors": authors
        })
    }).then(function (response) {
        if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
        document.getElementById("authors-ac")?.remove();
        document.getElementById("authors")?.classList.remove("input-for-ac");
        document.getElementById("authors").value = "";
        render_authors_for_dataset (dataset_uuid);
    }).catch(function () { show_message ("failure", `<p>Failed to add author.</p>`); });
}

function submit_new_funding (dataset_uuid) {
    fetch(`/v2/account/articles/${dataset_uuid}/funding`, {
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
        render_funding_for_dataset (dataset_uuid);
    }).catch(function () { show_message ("failure", `<p>Failed to add funding.</p>`); });
}

function toggle_record_type () {
    if (document.getElementById("external_link").checked) {
        hide_elements (".record-type-field");
        show_elements ("#external_link_field", "block");
        show_elements ("#files-wrapper");
    } else if (document.getElementById("metadata_record_only").checked) {
        hide_elements (".record-type-field");
        show_elements ("#metadata_reason_field", "block");
    } else if (document.getElementById("upload_files").checked) {
        hide_elements (".record-type-field");
        show_elements ("#file_upload_field", "block");
        show_elements ("#files-wrapper");
    } else if (document.getElementById("upload_software").checked) {
        hide_elements (".record-type-field");
        show_elements ("#software_upload_field");
        show_elements ("#file_upload_field", "block");
        show_elements ("#files-wrapper");
    } else {
        document.getElementById("upload_files").checked = true;
    }
}

function toggle_access_level () {
    hide_elements (".access_level");
    if (document.getElementById("open_access").checked) {
        show_elements ("#open_access_form");
    } else if (document.getElementById("embargoed_access").checked) {
        if (document.querySelector("#embargo_reason.ql-container") === null) {
            new Quill('#embargo_reason', { modules: quill_modules, theme: 'snow' });
        }
        show_elements ("#embargoed_access_form", "block");
    } else if (document.getElementById("restricted_access").checked) {
        if (document.querySelector("#restricted_access_reason.ql-container") === null) {
            new Quill('#restricted_access_reason', { modules: quill_modules, theme: 'snow' });
            new Quill('#restricted_access_eula', { modules: quill_modules, theme: 'snow' });
        }
        show_elements ("#restricted_access_form", "block");
    }
}

function activate (dataset_uuid, permissions=null, callback=function () {}) {
    install_sticky_header();
    install_touchable_help_icons();

    hide_elements (".article-content");
    show_elements (".article-content-loader", "block");
    document.querySelectorAll(".article-content-loader").forEach(function (element) {
        element.classList.add("loader");
    });
    fetch(`/v2/account/articles/${dataset_uuid}`, {
        method:  "GET",
        headers: { "Accept": "application/json" }
    }).then(function (response) {
        if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
        return response.json();
    }).then(function (data) {
        render_authors_for_dataset (dataset_uuid);
        render_references_for_dataset (dataset_uuid);
        render_tags_for_dataset (dataset_uuid);
        render_funding_for_dataset (dataset_uuid);
        render_categories_for_dataset (dataset_uuid);
        render_licenses (data);
        document.getElementById("authors")?.addEventListener("input", function (event) {
            return autocomplete_author (event, dataset_uuid);
        });
        document.getElementById("funding")?.addEventListener("input", function (event) {
            return autocomplete_funding (event, dataset_uuid);
        });
        document.getElementById("references")?.addEventListener("keypress", function(e){
            if(e.which == 13){
                add_reference(dataset_uuid);
            }
        });
        document.getElementById("add-reference-button")?.addEventListener("click", function(event) {
            stop_event_propagation (event);
            add_reference (dataset_uuid);
        });
         document.getElementById("collaborators")?.addEventListener("keypress", function(e){
            if (e.which == 13) {
                add_collaborator(dataset_uuid, permissions.metadata_edit);
            }
        });

        document.getElementById("collaborators")?.addEventListener("keypress", function(e){
            if (e.which == 13) {
                update_collaborator(dataset_uuid, permissions.metadata_edit);
            }
        });

        if (permissions.data_edit) {
            document.getElementById("repair-md5s")?.addEventListener("click", function(event) {
                stop_event_propagation (event);
                repair_md5_sums (dataset_uuid, event);
            });
        }
        if (permissions.data_remove) {
            document.getElementById("remove-all-files")?.addEventListener("click", function(event) {
                stop_event_propagation (event);
                delete_all_files (dataset_uuid);
            });
        }
        document.getElementById("add-keyword-button")?.addEventListener("click", function(event) {
            stop_event_propagation (event);
            add_tag (dataset_uuid);
        });
        document.getElementById("tag")?.addEventListener("keypress", function(e){
            if(e.which == 13){
                add_tag(dataset_uuid);
            }
        });
        document.getElementById("tag")?.addEventListener("input", function (event) {
            return autocomplete_tags (event, dataset_uuid);
        });
        add_event_listeners (".subitem-checkbox-metadata", "change", function (event) {
            if (document.querySelector(".subitem-checkbox-metadata[name='edit']")?.checked) {
                document.querySelectorAll(".subitem-checkbox-metadata[name='read']").forEach(function (element) { element.checked = true; });
                document.querySelectorAll(".subitem-checkbox-metadata[name='read']").forEach(function (element) { element.disabled = true; });
            } else {
                document.querySelectorAll(".subitem-checkbox-metadata[name='read']").forEach(function (element) { element.disabled = false; });
            }
         });

         add_event_listeners (".subitem-checkbox-dataset", "change", function (event) {
            let edit = document.querySelector(".subitem-checkbox-dataset[name='edit']")?.checked;
            let remove = document.querySelector(".subitem-checkbox-dataset[name='remove']")?.checked;

            if (remove) {
                document.querySelectorAll(".subitem-checkbox-dataset[name='edit']").forEach(function (element) { element.checked = true; });
                edit = true;
                document.querySelectorAll(".subitem-checkbox-dataset[name='read']").forEach(function (element) { element.checked = true; });
            } else if (edit) {
                document.querySelectorAll(".subitem-checkbox-dataset[name='read']").forEach(function (element) { element.checked = true; });
            }
            if (remove) {
                document.querySelectorAll(".subitem-checkbox-dataset[name='edit']").forEach(function (element) { element.disabled = true; });
                document.querySelectorAll(".subitem-checkbox-dataset[name='read']").forEach(function (element) { element.disabled = true; });
            } else {
                document.querySelectorAll(".subitem-checkbox-dataset[name='edit']").forEach(function (element) { element.disabled = false; });
                document.querySelectorAll(".subitem-checkbox-dataset[name='read']").forEach(function (element) { element.disabled = true; });
            }
            if (edit) {
                document.querySelectorAll(".subitem-checkbox-dataset[name='read']").forEach(function (element) { element.disabled = true; });
            } else {
                document.querySelectorAll(".subitem-checkbox-dataset[name='read']").forEach(function (element) { element.disabled = false; });
            }
         });

        render_files_for_dataset (dataset_uuid, null);
        if (data["defined_type_name"] != null) {
            let type = document.getElementById(`type-${data["defined_type_name"]}`);
            if (type !== null) { type.checked = true; }
        }
        if (data["group_id"] != null) {
            let group = document.getElementById(`group_${data["group_id"]}`);
            if (group !== null) { group.checked = true; }
        }
        document.getElementById(`article_${dataset_uuid}`)?.classList.remove("loader");
        show_elements (`#article_${dataset_uuid}`);
        new Quill('#description', { modules: quill_modules, theme: 'snow' });

        const fileUploader = new Dropzone("#dropzone-field", {
            url:               `/v3/datasets/${dataset_uuid}/upload`,
            paramName:         "file",
            maxFilesize:       1000000,
            maxFiles:          1000000,
            parallelUploads:   1,
            autoProcessQueue:  false,
            autoQueue:         true,
            ignoreHiddenFiles: false,
            disablePreviews:   true,
            dictDefaultMessage: "",
            init: function() {
                let dropzone_message = null;
                let dz_button = this.element.querySelector(".dz-message .dz-button");
                if (dz_button) {
                    let h4 = document.createElement("h4");
                    h4.id = "file-upload-message";
                    h4.textContent = "Drop files/folder here to upload";
                    dz_button.appendChild(h4);
                    dropzone_message = h4;
                }
                let upload_completed = 0;
                this.on("addedfile", function(file) {
                    let rel_path = file._folderRelativePath || (file.webkitRelativePath !== "" ? file.webkitRelativePath : null);
                    if (rel_path) { file.upload.filename = rel_path; }
                });
                this.on("complete", function(file) {
                    if (file._fsEntry && !file._retried && file.status === Dropzone.ERROR) { return; }
                    upload_completed += 1;
                    let remaining = fileUploader.getUploadingFiles().length + fileUploader.getQueuedFiles().length;
                    if (remaining === 0) {
                        upload_completed = 0;
                        if (dropzone_message) { dropzone_message.textContent = "Drop files/folder here to upload"; }
                    }
                });
                function upload_message (percentage) {
                    if (!dropzone_message) { return; }
                    let total        = upload_completed + fileUploader.getUploadingFiles().length + fileUploader.getQueuedFiles().length;
                    let current      = upload_completed + fileUploader.getUploadingFiles().length;
                    let width        = total.toString().length;
                    let current_file = current.toString().padStart(width, "0");
                    let total_files  = total.toString().padStart(width, "0");
                    let percentage_str = (percentage + "%").padStart(4, "0");
                    dropzone_message.textContent = `Uploading file ${current_file} of ${total_files} (${percentage_str})`;
                }
                this.on("sending", function() { upload_message (0); });
                this.on("uploadprogress", function(file, progress) { upload_message (Math.floor(progress)); });
                window.addEventListener("beforeunload", function (event) {
                    if (fileUploader.getUploadingFiles().length > 0 || fileUploader.getQueuedFiles().length > 0) {
                        // Ask for confirmation before leaving the page.
                        event.preventDefault();
                        event.returnValue = true;
                    }
                });
            },
            accept:   function(file, done) { done(); fileUploader.processQueue(); },
            complete: function (file) {
                if (fileUploader.getUploadingFiles().length === 0 && fileUploader.getQueuedFiles().length === 0) {
                    let rejected_files = fileUploader.getRejectedFiles();
                    for (let rejected of rejected_files) {
                        if (rejected.status == "error" && !rejected._fsEntry) {
                            show_message ("failure", `<p>Failed to upload '${rejected.upload.filename}'.</p>`);
                        }
                    }
                    render_files_for_dataset (dataset_uuid, fileUploader);
                } else { fileUploader.processQueue(); }
                fileUploader.removeFile(file);
            },
            error: function(file, message, xhr) {
                if (xhr && xhr.status === 0 && file._fsEntry && !file._retried) {
                    file._fsEntry.file(function (original) {
                        let reader = new FileReader();
                        reader.onload = function (evt) {
                            let copy = new File([evt.target.result], original.name,
                                               { type: original.type,
                                                 lastModified: original.lastModified });
                            copy._folderRelativePath = file._folderRelativePath;
                            copy._retried            = true;
                            fileUploader.addFile(copy);
                        };
                        reader.onerror = function () {
                            show_message("failure",
                                `<p>Failed to upload ${file.upload.filename}: could not read file.</p>`);
                        };
                        reader.readAsArrayBuffer(original);
                    }, function () {
                        show_message("failure",
                            `<p>Failed to upload ${file.upload.filename}: file entry expired.</p>`);
                    });
                    return;
                }
                let text = (message && message.message) ? message.message : message;
                show_message ("failure",
                              (`<p>Failed to upload ${file.upload.filename}: ${text}</p>`));
            }
        });
        if (!permissions.data_edit) { fileUploader.disable(); }

        function collect_files_from_entry (entry, path_prefix) {
            if (entry.isFile) {
                return new Promise(function (resolve, reject) {
                    entry.file(function (file) {
                        let rel_path = path_prefix ? path_prefix + "/" + file.name : file.name;
                        file._folderRelativePath = rel_path;
                        file._fsEntry            = entry;
                        resolve([file]);
                    }, reject);
                });
            }

            return new Promise(function (resolve, reject) {
                let reader  = entry.createReader();
                let results = [];
                function read_batch () {
                    reader.readEntries(function (entries) {
                        if (entries.length === 0) {
                            let sub_path = path_prefix ? path_prefix + "/" + entry.name : entry.name;
                            Promise.all(results.map(function (e) {
                                return collect_files_from_entry(e, sub_path);
                            })).then(function (arrays) {
                                resolve(arrays.flat());
                            }).catch(reject);
                        } else {
                            results = results.concat(Array.from(entries));
                            read_batch();
                        }
                    }, reject);
                }
                read_batch();
            });
        }

        document.getElementById("dropzone-field").addEventListener("drop",
            function (event) {
                if (!permissions.data_edit) { return; }

                let items = event.dataTransfer && event.dataTransfer.items;
                if (!items) { return; }
                let entries = Array.from(items).map(function (item) {
                    return item.webkitGetAsEntry ? item.webkitGetAsEntry() : null;
                }).filter(Boolean);

                let has_directory = entries.some(function (e) { return e.isDirectory; });
                if (!has_directory) { return; }  // plain files — let Dropzone handle it
                event.preventDefault();
                event.stopImmediatePropagation();

                let dir_names = new Set(
                    entries.filter(function (e) { return e.isDirectory; })
                           .map(function (e) { return e.name; })
                );
                let filtered_entries = entries.filter(function (e) {
                    return e.isDirectory || !dir_names.has(e.name);
                });

                Promise.all(filtered_entries.map(function (entry) {
                    return collect_files_from_entry(entry, "");
                })).then(function (arrays) {
                    let all_files = arrays.flat();
                    if (all_files.length === 0) {
                        show_message("failure", "<p>No files found in the dropped folder.</p>");
                        return;
                    }
                    let orig_accept = fileUploader.options.accept;
                    fileUploader.options.accept = function(file, done) { done(); };
                    all_files.forEach(function (file) { fileUploader.addFile(file); });
                    fileUploader.options.accept = orig_accept;
                    fileUploader.processQueue();
                }).catch(function (error) {
                    show_message("failure", "<p>Failed to read the dropped folder.</p>");
                    console.error("Folder drop error:", error);
                });
            },
            true // Run before Dropzone listener
        );

        add_event_listeners ("input[name='record_type']", "change", function () { toggle_record_type (); });
        document.getElementById("git-branches")?.addEventListener("change", function (event) {
            set_default_git_branch (dataset_uuid, event);
        });
        if (data["is_metadata_record"]) {
            document.getElementById("metadata_record_only").checked = true;
        } else if (data["has_linked_file"]) {
            document.getElementById("external_link").checked = true;
        } else if (data["defined_type_name"] == "software") {
            document.getElementById("upload_software").checked = true;
            render_git_files_for_dataset (dataset_uuid, null);
            render_git_branches_for_dataset (dataset_uuid, null);
        } else {
            document.getElementById("upload_files").checked = true;
        }

        if (data["is_embargoed"]) {
            let access_type = 0;
            try { access_type = data["embargo_options"][0]["id"]; }
            catch (error) { access_type = 0; }

            if (access_type === 1000) {
                document.getElementById("restricted_access").checked = true;
            } else {
                document.getElementById("embargoed_access").checked = true;
                if (data["embargo_type"] == "file") {
                    document.getElementById("files_only_embargo").checked = true;
                } else if (data["embargo_type"] == "article") {
                    document.getElementById("content_embargo").checked = true;
                }
            }
        }
        if (data["agreed_to_deposit_agreement"]) {
            document.getElementById("deposit_agreement").checked = true;
        }
        if (data["agreed_to_publish"]) {
            document.getElementById("publish_agreement").checked = true;
        }

        toggle_record_type ();
        toggle_access_level ();

        document.getElementById("delete")?.addEventListener("click", function (event) { delete_dataset (dataset_uuid, event); });
        document.getElementById("save")?.addEventListener("click", function (event)   { save_dataset (dataset_uuid, event); });
        document.getElementById("submit")?.addEventListener("click", function (event) { submit_dataset (dataset_uuid, event); });
        document.getElementById("publish")?.addEventListener("click", function (event) { publish_dataset (dataset_uuid, event); });
        document.getElementById("decline")?.addEventListener("click", function (event) { decline_dataset (dataset_uuid, event); });
        document.getElementById("preview")?.addEventListener("click", function (event) { preview_dataset (dataset_uuid, event); });
        document.getElementById("refresh-git-files")?.addEventListener("click", function (event) {
            render_git_files_for_dataset (dataset_uuid, event);
            render_git_branches_for_dataset (dataset_uuid, event);
        });
        add_event_listeners ("input[name=access_type]", "change", toggle_access_level);
        document.getElementById("configure_embargo")?.addEventListener("click", toggle_embargo_options);
        document.getElementById("embargo_until_forever")?.addEventListener("change", toggle_embargo_until);
        document.getElementById("cancel_embargo")?.addEventListener("click", toggle_embargo_options);

        hide_elements (".article-content-loader");
        document.querySelectorAll(".article-content").forEach(function (element) { fade_in (element, 200); });
        hide_elements ("#thumbnail-files-wrapper");

        hide_elements ("#api-upload-fold");
        document.getElementById("api-upload-toggle")?.addEventListener("click", function (event) { toggle_api_upload_text (event); });
        document.getElementById("expand-categories-button")?.addEventListener("click", toggle_categories);
        document.getElementById("expand-collaborators-button")?.addEventListener("click", function (event) {
            toggle_collaborators (dataset_uuid, !is_shared_with_me, event)
        });
        callback ();
    }).catch(function () { show_message ("failure", `<p>Failed to retrieve article ${dataset_uuid}.</p>`); });
}

function toggle_api_upload_text (event) {
    stop_event_propagation (event);
    if (!is_visible (document.getElementById("api-upload-fold"))) {
        slide_down (document.getElementById("api-upload-fold"), 250);
    } else {
        slide_up (document.getElementById("api-upload-fold"), 250);
    }
}
function toggle_embargo_options (event) {
    stop_event_propagation (event);
    let embargo_options = document.getElementById("embargo_options");
    if (embargo_options !== null && !is_visible (embargo_options)) {
        show_elements ("#embargo_options", "block");
        hide_elements ("#configure_embargo");
    } else {
        hide_elements ("#embargo_options");
        show_elements ("#configure_embargo");
    }
}

function toggle_embargo_until (event) {
    stop_event_propagation (event);
    let forever = document.getElementById("embargo_until_forever");
    if (forever !== null) {
        document.getElementById("embargo_until_date").disabled = forever.checked;
    }
}

function perform_upload (files, current_file, dataset_uuid) {
    if (typeof files.item === "function" && !Array.isArray(files)) { files = Array.from(files); }
    let total_files = files.length;
    let index = current_file - 1;
    let data  = new FormData();

    if (files[index] === undefined || files[index] == null) {
        show_message ("failure", "<p>Uploading file(s) failed due to a web browser incompatibility.</p>");
        return;
    }
    let file     = files[index];
    let rel_path = file.webkitRelativePath;
    if (rel_path !== undefined && rel_path !== "") {
        data.append ("file", file, rel_path);
    } else if (file.name !== undefined) {
        data.append ("file", file, file.name);
    } else {
        show_message ("failure", "<p>Uploading file(s). Please try selecting " +
                                 "files with the file chooser instead of " +
                                 "using the drag-and-drop.</p>");
        return;
    }

    let request = new XMLHttpRequest();
    request.upload.addEventListener("progress", function (evt) {
        if (evt.lengthComputable) {
            let completed = Number.parseInt(evt.loaded / evt.total * 100);
            if (completed === 100) {
                show_message ("notice", `<p>Computing MD5 ... ${current_file}/${total_files}.</p>`);
            }
        }
    }, false);
    request.addEventListener("load", function () {
        if (request.status < 200 || request.status >= 300) {
            show_message ("failure", "<p>Uploading file(s) failed.</p>");
        } else if (current_file < total_files) {
            perform_upload (files, current_file + 1, dataset_uuid);
        } else {
            render_files_for_dataset (dataset_uuid, null);
        }
    });
    request.addEventListener("error", function () {
        show_message ("failure", "<p>Uploading file(s) failed.</p>");
    });
    request.open("POST", `/v3/datasets/${dataset_uuid}/upload`);
    request.send(data);
}

function remove_file (file_id, dataset_uuid, rerender=true) {
    return fetch(`/v2/account/articles/${dataset_uuid}/files/${file_id}`, {
        method:  "DELETE",
        headers: { "Accept": "application/json" }
    }).then(function (response) {
        if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
        if (rerender) {
            render_files_for_dataset (dataset_uuid, null);
            if (document.getElementById("external_link").checked) {
                show_elements ("#external_link_field", "block");
            }
        }
        return true;
    }).catch(function () {
        show_message ("failure", `<p>Failed to remove ${file_id}.</p>`);
        return false;
    });
}

function remove_author (author_id, dataset_uuid) {
    fetch(`/v2/account/articles/${dataset_uuid}/authors/${author_id}`, {
        method:  "DELETE",
        headers: { "Accept": "application/json" }
    }).then(function (response) {
        if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
        render_authors_for_dataset (dataset_uuid);
    }).catch(function () { show_message ("failure", `<p>Failed to remove ${author_id}</p>`); });
}

function remove_funding (funding_id, dataset_uuid) {
    fetch(`/v2/account/articles/${dataset_uuid}/funding/${funding_id}`, {
        method:  "DELETE",
        headers: { "Accept": "application/json" }
    }).then(function (response) {
        if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
        render_funding_for_dataset (dataset_uuid);
    }).catch(function () { show_message ("failure", `<p>Failed to remove ${funding_id}.</p>`); });
}

function remove_reference (url, dataset_uuid) {
    fetch(`/v3/datasets/${dataset_uuid}/references?url=${url}`, {
        method:  "DELETE",
        headers: { "Accept": "application/json" }
    }).then(function (response) {
        if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
        render_references_for_dataset (dataset_uuid);
    }).catch(function () { show_message ("failure", `<p>Failed to remove ${url}</p>`); });
}

function remove_tag (tag, dataset_uuid) {
    fetch(`/v3/datasets/${dataset_uuid}/tags?tag=${tag}`, {
        method:  "DELETE",
        headers: { "Accept": "application/json" }
    }).then(function (response) {
        if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
        render_tags_for_dataset (dataset_uuid);
    }).catch(function () { show_message ("failure", `<p>Failed to remove ${tag}.</p>`); });
}

function prettify_size (size) {
    let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (size == 0 || size == null) return '0 Byte';
    let i = Number.parseInt(Math.floor(Math.log(size) / Math.log(1000)));
    return Math.round(size / Math.pow(1000, i)) + ' ' + sizes[i];
}

function submit_dataset (dataset_uuid, event) {
    stop_event_propagation (event);
    document.getElementById("content")?.classList.add("loader-top");
    document.getElementById("content-wrapper").style.opacity = '0.15';
    save_dataset (dataset_uuid, event, false, function() {
        let form_data = gather_form_data();
        let is_open_access = document.getElementById("open_access").checked;
        if (form_data["license_id"] == "98") {
            document.getElementById("license_open")?.classList.add("missing-required");
            document.getElementById("license_embargoed")?.classList.add("missing-required");
            show_message ("failure", "<p>The '4TU General Terms Of Use' is deprecated.  We selected 'CC0' instead.  Submit again to accept this change.</p>");
            if (is_open_access) {
                document.getElementById("license_open").value = "2";
            } else {
                document.getElementById("license_embargoed").value = "2";
            }
        }
        fetch(`/v3/datasets/${dataset_uuid}/submit-for-review`, {
            method:  "PUT",
            headers: { "Accept": "application/json", "Content-Type": "application/json" },
            body:    JSON.stringify(form_data)
        }).then(function (response) {
            if (!response.ok) { throw response; }
            window.location.replace("/my/datasets/submitted-for-review");
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
                        } else if (message.field_name == "agreed_to_deposit_agreement") {
                            document.querySelectorAll("label[for='deposit_agreement']").forEach(function (element) {
                                element.classList.add("missing-required");
                            });
                        } else if (message.field_name == "agreed_to_publish") {
                            document.querySelectorAll("label[for='publish_agreement']").forEach(function (element) {
                                element.classList.add("missing-required");
                            });
                        } else if (message.field_name == "embargo_type") {
                            document.getElementById("record-type-wrapper")?.classList.add("missing-required");
                        } else if (message.field_name == "files") {
                            show_message ("failure", `<p>${message.message}</p>`);
                            document.getElementById("dropzone-field")?.classList.add("missing-required");
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

function publish_dataset (dataset_uuid, event) {
    stop_event_propagation (event);
    document.getElementById("content")?.classList.add("loader-top");
    document.getElementById("content-wrapper").style.opacity = '0.15';
    save_dataset (dataset_uuid, event, false, function() {
        fetch(`/v3/datasets/${dataset_uuid}/publish`, {
            method:  "POST",
            headers: { "Accept": "application/json" }
        }).then(function (response) {
            if (!response.ok) { throw new Error(`${response.status} ${response.statusText}`); }
            window.location.replace("/logout");
        }).catch(function (error) {
            show_message ("failure",
                          `<p>Could not publish due to error ` +
                          `<code>${error.message}</code>.</p>`);
            document.getElementById("content-wrapper").style.opacity = '1.0';
            document.getElementById("content")?.classList.remove("loader-top");
        });
    });
}
