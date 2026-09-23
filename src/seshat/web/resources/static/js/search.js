const enable_subcategories = true;
const page_size = 100;
const max_parameter_length = 255;
const default_search_scope = ["title", "description", "tag", "author"];
let filter_info = {};

function query_all(selector) {
    return [...document.querySelectorAll(selector)];
}

function listen(id, event_name, handler) {
    document.getElementById(id)?.addEventListener(event_name, handler);
}

function has_value(value) {
    return typeof value === "string" && value.length > 0;
}

function list_param(value) {
    return has_value(value) ? value.split(",") : undefined;
}

function truncate(value) {
    return value.substring(0, max_parameter_length);
}

function parse_page(value) {
    const page = Number.parseInt(value, 10);
    return Number.isInteger(page) && page >= 1 ? page : 1;
}

function parse_url_params() {
    return Object.fromEntries(new URLSearchParams(window.location.search));
}

function trim_single_word(word) {
  const nl = Math.max(
    word.lastIndexOf('\n'), word.lastIndexOf('\r'),
    word.lastIndexOf('\u2028'), word.lastIndexOf('\u2029'),
  );
  if (nl !== -1) return word.slice(0, nl).trimEnd();
  const i = word.search(/\s/);
  return i === -1 ? word : word.slice(0, i);
}

function _corporate_background_color() {
    const element = document.querySelector(".corporate-identity-background");
    return (element !== null) ? getComputedStyle(element).backgroundColor : "#000000";
}

const preferences = {
    save(key, value) {
        try { sessionStorage.setItem(key, JSON.stringify(value)); } catch (error) {}
    },
    load(key) {
        try { return JSON.parse(sessionStorage.getItem(key)); } catch (error) { return null; }
    },
};

function init_search_filter_info() {
    for (const element of query_all(".search-filter-content")) {
        const name = element.id.split("-").pop();
        filter_info[name] = {
            id:           element.id,
            name:         name,
            is_multiple:  element.classList.contains("multiple"),
            enable_other: element.classList.contains("other"),
        };
    }
}

function set_list_collapsed(filter_name, collapsed, is_visible) {
    const items_selector = `#search-filter-content-${filter_name} ul li`;
    const show_more      = `#search-${filter_name}-show-more`;
    if (collapsed) {
        query_all(items_selector).forEach(function (item, index) {
            item.style.display = is_visible(item, index) ? "" : "none";
        });
        show_elements(show_more);
    } else {
        show_elements(items_selector);
        hide_elements(show_more);
    }
}

function toggle_filter_institutions_showmore(collapsed) {
    const has_featured = document.querySelector("#search-filter-content-institutions ul li.featured") !== null;
    set_list_collapsed("institutions", collapsed, (item) => !has_featured || item.classList.contains("featured"));
}

function toggle_filter_licenses_showmore(collapsed) {
    set_list_collapsed("licenses", collapsed, (item, index) => index < 5);
}

function toggle_filter_categories_showmore(collapsed) {
    const limit = enable_subcategories ? 75 : 10;
    set_list_collapsed("categories", collapsed, (item, index) => index < limit);
    if (collapsed && enable_subcategories) {
        for (const checkbox of query_all("#search-filter-content-categories input[type='checkbox'][id^='checkbox_categories_']")) {
            toggle_checkbox_subcategories(checkbox.id.split("_")[2]);
        }
    }
}

function toggle_checkbox_subcategories(parent_category_id, force_on = false) {
    const subcategories = document.getElementById(`subcategories_of_${parent_category_id}`);
    if (subcategories === null) {
        return;
    }
    if (force_on) {
        subcategories.style.display = "block";
        return;
    }
    const parent_checked = document.getElementById(`checkbox_categories_${parent_category_id}`)?.checked ?? false;
    subcategories.querySelectorAll("input[type='checkbox']").forEach(function (checkbox) {
        checkbox.checked = false;
    });
    subcategories.style.display = parent_checked ? "block" : "none";
}

function parent_category_id_of(subcategory_checkbox) {
    return subcategory_checkbox.closest("[id^='subcategories_of_']")?.id.split("_").pop();
}

function set_button_enabled(id, enabled) {
    const button = document.getElementById(id);
    if (button === null) {
        return;
    }
    button.style.background = enabled ? _corporate_background_color() : "#eeeeee";
    button.style.color      = enabled ? "white" : "#cccccc";
    button.style.cursor     = enabled ? "pointer" : "default";
    button.classList.toggle("enabled", enabled);
    button.classList.toggle("disabled", !enabled);
}

function toggle_filter_apply_button(enabled) {
    set_button_enabled("search-filter-apply-button", enabled);
}

function toggle_filter_reset_button(enabled) {
    set_button_enabled("search-filter-reset-button", enabled);
}

function enable_filter_buttons() {
    toggle_filter_apply_button(true);
    toggle_filter_reset_button(true);
}

function toggle_filter_input_text(id, show) {
    const input = document.getElementById(id);
    if (input === null) {
        return;
    }
    if (show) {
        show_elements(`#${id}`, "inline-block");
    } else {
        input.value = "";
        hide_elements(`#${id}`);
    }

    if (id === "textinput_institutions_other") {
        for (const checkbox of query_all("#search-filter-content-institutions input[type='checkbox']")) {
            if (checkbox.id === "checkbox_institutions_other") {
                continue;
            }
            checkbox.disabled = show;
            if (show) {
                checkbox.checked = false;
            }
        }
    }
}

function set_other_inputs(container_selector, show) {
    const selector = `${container_selector} input[type='text'], ${container_selector} input[type='date']`;
    for (const input of query_all(selector)) {
        toggle_filter_input_text(input.id, show);
    }
}

function set_collection_selected(selected) {
    const selector = "#search-filter-content-searchscope input[type='checkbox'], " +
                     "#search-filter-content-filetypes input[type='checkbox']";
    for (const checkbox of query_all(selector)) {
        checkbox.disabled = selected;
        if (selected) {
            checkbox.checked = false;
        }
    }
}

function toggle_view_mode(mode) {
    if (mode !== "list" && mode !== "tile") {
        return;
    }

    const is_tile       = mode === "tile";
    const primary_color = _corporate_background_color();
    if (is_tile) {
        hide_elements("#search-results-list-view");
        show_elements("#search-results-tile-view");
    } else {
        show_elements("#search-results-list-view", "block");
        hide_elements("#search-results-tile-view");
    }
    const list_button = document.getElementById("list-view-mode");
    const tile_button = document.getElementById("tile-view-mode");
    if (list_button) { list_button.style.color = is_tile ? "darkgray" : primary_color; }
    if (tile_button) { tile_button.style.color = is_tile ? primary_color : "darkgray"; }

    preferences.save("view_mode", mode);
}

function toggle_sort_by(sort_by) {
    if (typeof sort_by !== "string" || !(sort_by.startsWith("title_") || sort_by.startsWith("date_"))) {
        return;
    }

    const select = document.getElementById("sort-by");
    if (select) {
        select.value = sort_by;
    }
    sort_search_results(sort_by);
    preferences.save("sort_by", sort_by);
}

function load_search_preferences() {
    toggle_view_mode(preferences.load("view_mode") ?? "tile");
    toggle_sort_by(preferences.load("sort_by") ?? "date_dsc");
}

function sort_search_results(sort_by) {
    const by_date   = sort_by.startsWith("date_");
    const direction = sort_by.endsWith("_dsc") ? -1 : 1;

    sort_children(document.querySelector("#search-results-list-view tbody"), "tr", direction,
                  (row) => by_date ? row.cells[1]?.textContent : row.cells[0]?.textContent);
    sort_children(document.getElementById("search-results-tile-view"), ".tile-item", direction,
                  (tile) => by_date ? tile.querySelector(".tile-date")?.textContent.replace("Posted on", "")
                                    : tile.querySelector(".tile-title")?.textContent);
}

function compare_keys(a, b) {
    if (a < b) { return -1; }
    if (a > b) { return 1; }
    return 0;
}

function sort_children(container, selector, direction, key_of) {
    if (container === null) {
        return;
    }
    const key = (element) => (key_of(element) ?? "").trim().toLowerCase();
    [...container.querySelectorAll(`:scope > ${selector}`)]
        .map((element) => ({ element, key: key(element) }))
        .sort((a, b) => direction * compare_keys(a.key, b.key))
        .forEach(({ element }) => container.append(element));
}

function register_event_handlers() {
    listen("search-filter-reset-button", "click", function () {
        query_all("#search-box-wrapper input[data-search-filter]").forEach((field) => field.remove());
        query_all(".search-filter-content input[type='checkbox']").forEach((checkbox) => { checkbox.checked = false; });
        set_other_inputs(".search-filter-content", false);
        set_collection_selected(false);
        toggle_filter_apply_button(true);
        toggle_filter_reset_button(false);
        toggle_filter_categories_showmore(true);
        toggle_filter_institutions_showmore(true);
        toggle_filter_licenses_showmore(true);
    });

    // Expand the list when its 'Show more' link is clicked.
    listen("search-categories-show-more",   "click", () => toggle_filter_categories_showmore(false));
    listen("search-institutions-show-more", "click", () => toggle_filter_institutions_showmore(false));
    listen("search-licenses-show-more",     "click", () => toggle_filter_licenses_showmore(false));

    for (const [filter_name, info] of Object.entries(filter_info)) {
        const container = `#search-filter-content-${filter_name}`;
        for (const checkbox of query_all(`${container} input[type='checkbox']`)) {
            checkbox.addEventListener("change", () => on_filter_checkbox_change(checkbox, filter_name, info, container));
        }
    }

    const other_inputs = ".search-filter-content input[type='text'], .search-filter-content input[type='date']";
    for (const input of query_all(other_inputs)) {
        input.addEventListener("input", enable_filter_buttons);
    }

    listen("search-filter-apply-button", "click", function (event) {
        if (event.currentTarget.classList.contains("disabled")) {
            return;
        }
        window.location.href = build_search_url();
    });

    listen("tile-view-mode", "click", () => toggle_view_mode("tile"));
    listen("list-view-mode", "click", () => toggle_view_mode("list"));
    listen("sort-by", "change", (event) => toggle_sort_by(event.currentTarget.value));
}

function on_filter_checkbox_change(checkbox, filter_name, info, container) {
    if (checkbox.checked) {
        if (!info.is_multiple) {
            query_all(`${container} input[type='checkbox']`).forEach((other) => { other.checked = (other === checkbox); });
            set_other_inputs(container, false);
        }

        if (checkbox.classList.contains("parentcategory")) {
            toggle_checkbox_subcategories(checkbox.id.split("_").pop());
        } else if (checkbox.classList.contains("subcategory")) {
            const parent = document.getElementById(`checkbox_categories_${parent_category_id_of(checkbox)}`);
            if (parent) {
                parent.checked = false;
            }
        }
    }

    if (checkbox.id.endsWith("_other")) {
        set_other_inputs(container, checkbox.checked);
    }

    if (filter_name === "datatypes") {
        set_collection_selected(document.getElementById("checkbox_datatypes_collection")?.checked ?? false);
    }

    enable_filter_buttons();
}

function build_search_url() {
    const checked = {};
    const other   = {};
    for (const input of query_all(".search-filter-content input")) {
        const filter_name = input.id.split("_")[1];
        if (!(filter_name in filter_info)) {
            continue;
        }
        if (input.type === "checkbox") {
            if (input.checked && input.value !== "other") {
                checked[filter_name] ??= [];
                checked[filter_name].push(input.value);
            }
        } else if ((input.type === "text" || input.type === "date") && input.value.length > 0) {
            other[filter_name] = input.value;
        }
    }

    const params = new URLSearchParams();
    for (const filter_name of Object.keys(filter_info)) {
        if (filter_name in checked) {
            params.set(filter_name, checked[filter_name].join(","));
        }
        if (filter_name in other) {
            params.set(`${filter_name}_other`, truncate(trim_single_word(other[filter_name])));
        }
    }

    const search_box = document.getElementById("search-box");
    if (search_box && search_box.value.length > 0) {
        search_box.value = truncate(search_box.value);
        params.set("search", search_box.value);
    }

    const query = params.toString();
    return window.location.origin + window.location.pathname + (query ? `?${query}` : "");
}

function add_hidden_filter_field(name, value) {
    const form = document.querySelector("#search-box-wrapper form");
    if (form === null) {
        return;
    }
    const field = document.createElement("input");
    field.type  = "hidden";
    field.name  = name;
    field.value = value;
    field.dataset.searchFilter = "";
    form.append(field);
}

function load_search_filters_from_url() {
    const expand_list = {
        institutions: toggle_filter_institutions_showmore,
        licenses:     toggle_filter_licenses_showmore,
        categories:   toggle_filter_categories_showmore,
    };

    for (const [param_name, param_value] of Object.entries(parse_url_params())) {
        const is_other    = param_name.endsWith("_other");
        const filter_name = is_other ? param_name.split("_")[0] : param_name;

        if (filter_name === "search") {
            const search_box = document.getElementById("search-box");
            if (search_box) { search_box.value = truncate(search_box.value); }
            continue;
        }
        if (filter_name === "page") { continue; }

        add_hidden_filter_field(param_name, param_value);

        const info = filter_info[filter_name];
        if (!info) {
            continue;
        }
        expand_list[filter_name]?.(false);

        if (!is_other) {
            for (const value of param_value.split(",")) {
                const stripped = value.replace(/[^a-zA-Z0-9-_]/g, "");
                const checkbox = document.getElementById(`checkbox_${filter_name}_${stripped}`);
                if (checkbox === null) {
                    continue;
                }
                checkbox.checked = true;
                if (enable_subcategories && checkbox.classList.contains("subcategory")) {
                    toggle_checkbox_subcategories(parent_category_id_of(checkbox), true);
                }
            }
        } else if (info.enable_other && param_value.length > 0) {
            const text_input_id = `textinput_${filter_name}_other`;
            const text_input    = document.getElementById(text_input_id);
            if (text_input) {
                text_input.value = param_value;
                toggle_filter_input_text(text_input_id, true);
            }
            const other_checkbox = document.getElementById(`checkbox_${filter_name}_other`);
            if (other_checkbox) {
                other_checkbox.checked = true;
            }
        }
    }

    if (document.getElementById("checkbox_datatypes_collection")?.checked) {
        set_collection_selected(true);
    }
}

function with_student_groups(institution_ids) {
    const prefix   = "checkbox_institutions_";
    const suffix   = " Students";
    const selected = new Set(institution_ids);
    const labels   = query_all(`#search-filter-content-institutions label[for^='${prefix}']`);
    const id_of    = (label) => label.htmlFor.slice(prefix.length);
    const name_of  = (label) => label.textContent.trim();

    const selected_names = new Set(labels.filter((label) => selected.has(id_of(label))).map(name_of));
    for (const label of labels) {
        const name = name_of(label);
        if (label.hasAttribute("hidden") && name.endsWith(suffix)
            && selected_names.has(name.slice(0, -suffix.length))) {
            selected.add(id_of(label));
        }
    }
    return [...selected];
}

function search_formats(url_params) {
    const formats = list_param(url_params.filetypes) ?? [];
    if (has_value(url_params.filetypes_other)) {
        const other = trim_single_word(url_params.filetypes_other);
        if (other) {
            formats.push(other);
        }
    }
    return formats.length > 0 ? formats : undefined;
}

function published_since(url_params) {
    let date = null;
    if (has_value(url_params.publisheddate)) {
        const years = Number(url_params.publisheddate);
        date = new Date(Date.UTC(new Date().getFullYear() - years, 0, 1));
    } else if (has_value(url_params.publisheddate_other)) {
        date = new Date(url_params.publisheddate_other);
    }
    return (date && !Number.isNaN(date.getTime())) ? date.toISOString() : undefined;
}

function build_search_request(url_params) {
    const is_collection = url_params.datatypes === "collection";
    const institutions  = list_param(url_params.institutions);

    return {
        item_type:       is_collection ? undefined : url_params.datatypes,
        search_for:      url_params.q || url_params.search,
        search_scope:    list_param(url_params.searchscope) ?? default_search_scope,
        search_operator: has_value(url_params.searchoperator) ? url_params.searchoperator : "AND",
        search_format:   search_formats(url_params),
        published_since: published_since(url_params),
        licenses:        list_param(url_params.licenses),
        categories:      list_param(url_params.categories),
        groups:          institutions ? with_student_groups(institutions) : undefined,
        organizations:   has_value(url_params.institutions_other) ? trim_single_word(url_params.institutions_other) : undefined,
        page_size:       page_size,
        is_latest:       1,
        page:            parse_page(url_params.page),
    };
}

function show_search_error(html) {
    document.getElementById("search-error").innerHTML = html;
    show_elements("#search-error", "block");
}

function load_search_results() {
    const url_params = parse_url_params();
    const request    = build_search_request(url_params);
    const api_url    = url_params.datatypes === "collection" ? "/v2/collections/search" : "/v3/datasets/search";

    show_elements("#search-loader", "block");
    hide_elements("#search-error");

    fetch(api_url, {
        method:  "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body:    JSON.stringify(request),
    }).then(function (response) {
        if (!response.ok) { throw response; }
        return response.json();
    }).then(function (data) {
        if (data.length === 0) {
            show_search_error("No search results...");
            return;
        }
        render_search_results(data, request.page);
    }).catch(function (error) {
        const status = error.status ?? "error";
        const reason = error.statusText ?? error.message ?? String(error);
        show_search_error(`Failed to get search results` +
                          `<br><br>status: ${escape_html(String(status))}` +
                          `<br>reason: ${escape_html(String(reason))}`);
    }).finally(function () {
        hide_elements("#search-loader");
    });
}

function render_search_results(data, page_number) {
    const tiles = [];
    const rows  = [];

    for (const item of data) {
        // Embargoed datasets have no timeline; skip them.
        if (!item.timeline) { continue; }

        const url      = escape_html(item.url_public_html || `/collections/${item.uuid}`);
        const uuid     = escape_html(String(item.uuid));
        const title    = escape_html(String(item.title ?? ""));
        const posted   = escape_html(String(item.timeline.posted ?? "").split("T")[0]);
        const revision = item.timeline.revision;
        const thumb    = escape_html(has_value(item.thumb) && !item.thumb.startsWith("https://ndownloader")
                                     ? item.thumb : "/static/images/dataset-thumb.svg");

        tiles.push(
            `<div class="tile-item">` +
            `<a href="${url}"><img class="tile-preview" src="${thumb}" aria-hidden="true" alt="thumbnail for ${uuid}" /></a>` +
            `<div class="tile-matches" id="article_${uuid}"></div>` +
            `<div class="tile-title"><a href="${url}">${title}</a></div>` +
            (revision ? `<div class="tile-revision">Revision ${escape_html(String(revision))}</div>` : "") +
            `<div class="tile-date">Posted on ${posted}</div>` +
            `<div class="tile-authors"> </div>` +
            `</div>`);

        rows.push(
            `<tr>` +
            `<td><a href="${url}">${title}</a></td><td class="center">${posted}</td>` +
            `</tr>`);
    }

    document.getElementById("search-results-tile-view").innerHTML = tiles.join("");
    document.getElementById("search-results-list-view").innerHTML =
        `<table class="corporate-identity-table">` +
        `<thead><tr><th>Dataset</th><th>Posted On</th></tr></thead>` +
        `<tbody>${rows.join("")}</tbody>` +
        `</table>`;

    const pager = get_pager_html(data, page_number);
    query_all(".search-results-pager").forEach((element) => { element.innerHTML = pager; });

    update_search_results_count(data, page_number);
    load_search_preferences();
}

function update_search_results_count(data, current_page = 1) {
    let html;
    if (current_page === 1 && data.length < page_size) {
        const n = data.length;
        html = `<b>${n}</b> result${n === 1 ? "" : "s"} found.`;
    } else {
        html = `Over <b>${page_size}</b> results found.`;
    }
    document.getElementById("search-results-count").innerHTML = html;
}

function page_link(page, css_class, text) {
    const url = new URL(window.location.href);
    url.searchParams.set("page", page);
    return `<div><a href="${escape_html(url.href)}" class="${css_class}">${text}</a></div>`;
}

function get_pager_html(data, current_page = 1) {
    const prev = current_page > 1
        ? page_link(current_page - 1, "pager-prev", "Previous")
        : `<div class="lightgrey">Prev</div>`;
    const next = data.length < page_size
        ? `<div class="lightgrey">Next</div>`
        : page_link(current_page + 1, "pager-next", "Next");

    return prev + `<div class="pager-cur">Page ${current_page}</div>` + next;
}

document.addEventListener("DOMContentLoaded", function() {
    init_search_filter_info();
    toggle_filter_institutions_showmore(true);
    toggle_filter_categories_showmore(true);
    toggle_filter_licenses_showmore(true);
    register_event_handlers();
    load_search_filters_from_url();
    load_search_preferences();
    load_search_results();
});
