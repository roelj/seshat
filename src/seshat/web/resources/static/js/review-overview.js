const review_assigned   = '<span class="fas fa-glasses" title="Assigned to reviewer"><span class="no-show">assigned</span></span>';
const review_approved   = '<span class="fas fa-check-double" title="Approved by reviewer"><span class="no-show">approved</span></span>';
const review_rejected   = '<span class="fas fa-times fa-lg" title="Declined by reviewer"><span class="no-show">declined</span></span>';
const review_unassigned = '<span class="fas fa-hourglass" title="Unassigned"><span class="no-show">unassigned</span></span>';
const review_modified   = '<span class="fas fa-circle-exclamation" title="Modified after seen by reviewer"><span class="no-show">Modified</span></span>';

function cleanup_name(name) {
    return name.split("\n").map(function (item){ return item.trim(); }).join(" ").trim();
}

function update_item_count () {
    let rows = [...document.querySelectorAll("#overview-table tbody tr")].filter(is_visible);
    document.getElementById("table-count").textContent = `${rows.length} items`;
}

function clear_reviews_cache (event) {
    stop_event_propagation (event);
    fetch("/v3/admin/reviews/clear-cache", {
        method:  "GET",
        headers: { "Accept": "application/json" }
    }).then(function (response) {
        if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
        location.reload();
    }).catch(function () {
        show_message ("failure", "<p>Failed to clear the reviews cache.</p>");
    });
}

function assign_reviewer (event) {
    let identifiers = this.value.split(":");
    let dataset_uuid = identifiers[0];
    let reviewer_uuid = identifiers[1];

    fetch(`/v3/datasets/${dataset_uuid}/assign-reviewer/${reviewer_uuid}`, {
        method:  "PUT",
        headers: { "Accept": "application/json" }
    }).then(function (response) {
        if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
        let hourglass = document.getElementById(`${dataset_uuid}_status`)?.querySelector(".fa-hourglass");
        if (hourglass) {
            hourglass.outerHTML = '<span class="fas fa-glasses" title="Assigned to ' +
                                  'reviewer"><span style="font-size:0pt">assigned</span>' +
                                  '</span>';
        }
    }).catch(function () {
        show_message ("failure", "<p>Failed to assign reviewer.</p>");
    });
}

function apply_filters (event) {
    document.querySelectorAll('#overview-table tr').forEach(function (element) {
        element.style.display = "block";
    });
    filter_reviewer (event);
    filter_status (event);
    update_item_count ();
}

function filter_reviewer (event) {
    let value = document.querySelector(".reviewer-filter").value;
    let name  = cleanup_name(document.querySelector(".reviewer-filter").selectedOptions[0].textContent);
    document.querySelectorAll('#overview-table tr').forEach(function (element) {
        let reviewer_selector = element.querySelector("td .reviewer-selector");
        let status = (element.querySelector("td:nth-child(6)")?.textContent ?? "").trim();
        if (element.querySelector("th") !== null) {} // Skip the header.
        else if (value == "all") {}
        else if (value == "unassigned" && reviewer_selector !== null && reviewer_selector.value == "") {}
        else if (reviewer_selector !== null && reviewer_selector.value.split(":").pop() == value) {}
        else if (status == "approved") {
            let reviewer = element.querySelector("td:nth-child(10)")?.textContent ?? "";
            let reviewer_name = cleanup_name(reviewer);
            if (reviewer_name != name) { element.style.display = "none"; }
        }
        else { element.style.display = "none"; }
    });
}

function filter_status (event) {
    let value = document.querySelector(".status-filter").value;
    document.querySelectorAll('#overview-table tr').forEach(function (element) {
        let status = (element.querySelector("td:nth-child(6)")?.textContent ?? "").trim();
        if (element.querySelector("th") !== null) {} // Skip the header.
        else if (value == "all" || value == status) {}
        else { element.style.display = "none"; }
    });
}

function copy_row (uuid, dataset_uuid, title, version, first_name, last_name,
                   email, group_name, request_date, modified_date, published_date) {
    let escaped_title = title.replaceAll ('"', '""');
    let text = `=HYPERLINK("${window.location.origin}/review/goto-dataset/${dataset_uuid}"; "${escaped_title}")\t${version}\t${first_name} ${last_name}\t${email}\t${group_name}\t\t${request_date}\t${modified_date}\t${published_date}\n`;
    navigator.clipboard.writeText(text);
    let button = document.getElementById(`copy-btn-${uuid}`);
    button.classList.remove("fa-copy");
    button.classList.add("fa-check-double");
    setTimeout(function() {
        button.classList.remove("fa-check-double");
        button.classList.add("fa-copy");
    }, 3000);
}

function copy_to_clipboard_event (event) {
    let review = event.data["review"];
    let published_date = event.data["published_date"];
    let version = event.data["version"];
    copy_row (review.uuid, review.dataset_uuid, review.dataset_title,
              version, review.submitter_first_name, review.submitter_last_name,
              review.submitter_email, review.group_name, review.request_date,
              review.modified_date, published_date);
}

function render_overview_table () {
    document.querySelector("#overview-table tbody")?.replaceChildren();
    fetch("/v3/reviews", {
        method:  "GET",
        headers: { "Accept": "application/json" }
    }).then(function (response) {
        if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
        return response.json();
    }).then(function (reviews) {
        let published_date = null;
        let status = "";
        let title_html = "";
        let table_body = document.querySelector("#overview-table tbody");
        let copy_button = null;
        let row = null;
        for (let review of reviews) {
            published_date = null;
            let version = "new";
            let reviewer_html;
            if (review.status == "approved") {
                status = review_approved;
                published_date = review.published_date;
                title_html = `<a href="/datasets/${review.container_uuid}/${review.dataset_version}">${review.dataset_title}</a>`;
            }
            else {
                title_html = `<a href="/review/goto-dataset/${review.dataset_uuid}">${review.dataset_title}</a>`;
                if (review.status == "assigned") { status = review_assigned; }
                else if (review.status == "rejected") { status = review_rejected; }
                else { status = review_unassigned; }
            }
            if (review.last_seen_by_reviewer != null &&
                review.status == "assigned" &&
                review.modified_date > review.last_seen_by_reviewer) {
                status += review_modified;
            }
            if (review.has_published_version) {
                if (review.status == "approved") { version = review.dataset_version; }
                else { version = "update"; }
            }
            copy_button = create_element("a", { "id": `copy-btn-${review.uuid}`,
                                           "class": "fas fa-copy" });
            on_click_with_data (copy_button, {
                "review": review,
                "version": version,
                "published_date": or_empty (published_date)
            }, copy_to_clipboard_event);
            if (review.status == "approved" || review.status == "rejected") {
                reviewer_html = `${review.reviewer_first_name} ${review.reviewer_last_name}`;
            } else {
                reviewer_html = '<select class="reviewer-selector"><option value="" hidden>Unassigned</option>';
                for (let reviewer of reviewers) {
                    reviewer_html += `<option value="${review.dataset_uuid}:${reviewer.uuid}"`;
                    if (review.reviewer_email == reviewer.email) { reviewer_html += "selected"; }
                    reviewer_html += `>${reviewer.first_name} ${reviewer.last_name}</option>`;
                }
                reviewer_html += '</select>';
            }
            row = document.createElement("tr");
            if (published_date != null) { published_date = published_date.substring(0, 10); }
            let title_cell    = document.createElement("td");
            let status_cell   = document.createElement("td");
            let reviewer_cell = document.createElement("td");
            let copy_cell     = document.createElement("td");
            title_cell.innerHTML    = title_html;
            status_cell.innerHTML   = status;
            reviewer_cell.innerHTML = reviewer_html;
            copy_cell.append (copy_button);
            row.append (title_cell,
                        create_element("td", {}, or_empty (version)),
                        create_element("td", {}, `${review.submitter_first_name} ${review.submitter_last_name}`),
                        create_element("td", {}, or_empty (review.submitter_email)),
                        create_element("td", {}, or_empty (review.group_name)),
                        status_cell,
                        create_element("td", {}, or_empty (review.request_date)),
                        create_element("td", {}, or_empty (review.modified_date)),
                        create_element("td", {}, or_empty (published_date)),
                        reviewer_cell,
                        copy_cell);
            table_body?.append (row);
        }
	let table = document.getElementById("overview-table");
	if (table !== null) {
            new DataTable(table, {
		paging: false,
		info: false,
		language: { search: "_INPUT_", searchPlaceholder: "Search..." },
		columnDefs: [{ orderable: false, targets: 10 }],
		order: [[6, "desc"]]
            });

            let on_change = (selector, handler) => {
		for (let element of document.querySelectorAll(selector)) {
                    element.addEventListener("change", handler);
		}
            };

            document.getElementById("overview-h1").style.display = "";
            table.style.display = "";
            document.getElementById("reviews-loader").style.display = "none";
            update_item_count ();
            on_change (".reviewer-selector", assign_reviewer);
            on_change (".reviewer-filter, .status-filter", apply_filters);
	    table.style.display = "block";
	}
    }).catch(function () {
        show_message ("failure", "<p>Failed to render the overview table.</p>");
    });
}

document.addEventListener("DOMContentLoaded", function (){
    render_overview_table ();
    document.getElementById("remove-cache")?.addEventListener("click", function (event) {
        clear_reviews_cache (event);
    });
});
