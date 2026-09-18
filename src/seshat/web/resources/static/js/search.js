const enable_subcategories = true;
const page_size = 100;
const max_parameter_length = 255;
let filter_info = {};

class PagePreferences {
    constructor() {
        this.storage = window.sessionStorage;
    }
    save(key, val) {
        this.storage.setItem(key, JSON.stringify(val));
    }
    load(key) {
        return JSON.parse(this.storage.getItem(key));
    }
    load_all() {
        let keys = Object.keys(this.storage);
        let all = {};
        for (let key of keys) {
            try {
                all[key] = JSON.parse(this.storage.getItem(key));
            } catch (error) {
                all[key] = this.storage.getItem(key);
            }
        }
        return all;
    }
    length() {
        return this.storage.length;
    }
    remove(key) {
        this.storage.removeItem(key);
    }
    clear() {
        this.storage.clear();
    }
}

function init_search_filter_info() {
    document.querySelectorAll(`.search-filter-content`).forEach(function (element) {
        let filter_id = element.id;
        let filter_name = filter_id.split("-").pop();
        filter_info[filter_name] = {
            "id": filter_id,
            "name": filter_name,
            "values": [],
        }

        filter_info[filter_name]["is_multiple"] = element.classList.contains("multiple");
        filter_info[filter_name]["enable_other"] = element.classList.contains("other");
    });
}

function parse_url_params() {
    let url_params = new URLSearchParams(window.location.search);
    let params = {};
    for (let [key, value] of url_params) {
        params[key] = value;
    }
    return params;
}

function _featured_institutions_count() {
    let count = 0;
    document.querySelectorAll('#search-filter-content-institutions ul li').forEach(function (item) {
        if (item.classList.contains("featured")) {
            count += 1;
        }
    });
    return count;
}

function toggle_filter_institutions_showmore(flag) {
    if (flag) {
        let featured_count = _featured_institutions_count();
        document.querySelectorAll('#search-filter-content-institutions ul li').forEach(function (element) { element.style.display = 'none'; });
        show_elements ('#search-institutions-show-more');

        if (featured_count > 0) {
            [...document.querySelectorAll('#search-filter-content-institutions ul li')].slice(0, featured_count).forEach(function (item) { item.style.display = ""; });
        } else {
            // Show every institution if there are no featured institutions.
            show_elements ('#search-filter-content-institutions ul li');
        }
   } else {
       show_elements ('#search-filter-content-institutions ul li');
       hide_elements ('#search-institutions-show-more');
   }
}

function toggle_filter_licenses_showmore(flag) {
    if (flag) {
        document.querySelectorAll('#search-filter-content-licenses ul li').forEach(function (element) { element.style.display = 'none'; });
        show_elements ('#search-licenses-show-more');
        [...document.querySelectorAll('#search-filter-content-licenses ul li')].slice(0, 5).forEach(function (item) { item.style.display = ""; });
   } else {
       show_elements ('#search-filter-content-licenses ul li');
       hide_elements ('#search-licenses-show-more');
   }
}

function toggle_checkbox_subcategories(parent_category_id, force_on=false) {
    let parent_category_checkbox = document.getElementById(`checkbox_categories_${parent_category_id}`);
    let subcategories = document.getElementById(`subcategories_of_${parent_category_id}`);
    if (subcategories === null) {
        return;
    }
    if (force_on) {
        subcategories.style.display = "block";
        return;
    }

    if (parent_category_checkbox.checked) {
        subcategories.style.display = "block";
        document.querySelectorAll(`#subcategories_of_${parent_category_id} input[type='checkbox']`).forEach(function (checkbox) {
            checkbox.checked = false;
        });
    } else {
        document.querySelectorAll(`#subcategories_of_${parent_category_id} input[type='checkbox']`).forEach(function (checkbox) {
            checkbox.checked = false;
        });
        subcategories.style.display = "none";
    }
}

function clear_checkbox_parentcategory(parent_category_id) {
    let parent_category_checkbox = document.getElementById(`checkbox_categories_${parent_category_id}`);
    if (parent_category_checkbox.checked) {
        parent_category_checkbox.checked = false;
    }
}

function toggle_filter_categories_showmore(flag) {
    if (flag) {
        document.querySelectorAll('#search-filter-content-categories ul li').forEach(function (element) { element.style.display = 'none'; });
        show_elements ('#search-categories-show-more');
        if (enable_subcategories) {
            [...document.querySelectorAll('#search-filter-content-categories ul li')].slice(0, 75).forEach(function (item) { item.style.display = ""; });
            document.querySelectorAll(`#search-filter-content-categories input[type='checkbox']`).forEach(function (checkbox) {
                if (checkbox.id.startsWith("checkbox_categories_")) {
                    toggle_checkbox_subcategories(checkbox.id.split("_")[2]);
                }
            });
        } else {
            [...document.querySelectorAll('#search-filter-content-categories ul li')].slice(0, 10).forEach(function (item) { item.style.display = ""; });
        }
   } else {
       show_elements ('#search-filter-content-categories ul li');
       hide_elements ('#search-categories-show-more');
   }
}

function toggle_filter_apply_button(flag) {
    let primary_color = _corporate_background_color();
    let color = flag ? primary_color : "#eeeeee";
    let cursor = flag ? "pointer" : "default";
    let color_text = flag ? "white" : "#cccccc";
    let classes = flag ? ["enabled", "disabled"] : ["disabled", "enabled"];
    let button = document.getElementById("search-filter-apply-button");
    button.style.background = color;
    button.style.color = color_text;
    button.style.cursor = cursor;
    button.classList.add(classes[0]);
    button.classList.remove(classes[1]);
}

function toggle_filter_reset_button(flag) {
    let primary_color = _corporate_background_color();
    let color = flag ? primary_color : "#eeeeee";
    let cursor = flag ? "pointer" : "default";
    let color_text = flag ? "white" : "#cccccc";
    let classes = flag ? ["enabled", "disabled"] : ["disabled", "enabled"];
    let button = document.getElementById("search-filter-reset-button");
    button.style.background = color;
    button.style.color = color_text;
    button.style.cursor = cursor;
    button.classList.add(classes[0]);
    button.classList.remove(classes[1]);
}

function toggle_filter_input_text(id, flag) {
    if (flag) {
        show_elements (`#${id}`, "inline-block");

        // Disable all the checkboxes if the 'Other' checkbox for institutions is checked.
        if (id === "textinput_institutions_other") {
            document.querySelectorAll("#search-filter-content-institutions input[type='checkbox']").forEach(function (checkbox) {
                if (checkbox.id === "checkbox_institutions_other") {
                    return;
                }
                checkbox.disabled = flag;
                checkbox.checked = !flag;
            });
        }

    } else {
        document.getElementById(id).value = "";
        hide_elements (`#${id}`);

        // Enable the other checkboxes if the 'Other' checkbox for institutions is unchecked.
        if (id === "textinput_institutions_other") {
            document.querySelectorAll("#search-filter-content-institutions input[type='checkbox']").forEach(function (checkbox) {
                checkbox.disabled = flag;
            });
        }
    }
}

function toggle_view_mode(mode) {
    if (mode !== "list" && mode !== "tile") {
        return;
    }

    let primary_color = _corporate_background_color();

    if (mode === "tile") {
        hide_elements ('#search-results-list-view');
        show_elements ('#search-results-tile-view');
        document.getElementById("list-view-mode").style.color = 'darkgray';
        document.getElementById("tile-view-mode").style.color = primary_color;
    } else {
        show_elements ('#search-results-list-view', "block");
        hide_elements ('#search-results-tile-view');
        document.getElementById("list-view-mode").style.color = primary_color;
        document.getElementById("tile-view-mode").style.color = 'darkgray';
    }

    let page_preferences = new PagePreferences();
    page_preferences.save("view_mode", mode);
}

function toggle_sort_by(sort_by) {
    if (!sort_by.startsWith("title_") && !sort_by.startsWith("date_")) {
        return;
    }

    document.getElementById("sort-by").value = sort_by;
    sort_search_results(sort_by);

    let page_preferences = new PagePreferences();
    page_preferences.save("sort_by", sort_by);
}

function register_event_handlers() {
    // reset all checkboxes if the reset button is clicked.
    document.getElementById("search-filter-reset-button")?.addEventListener("click", function() {
        document.querySelectorAll(`#search-box-wrapper input [type='hidden']`).forEach(function (element) {
            element.remove();
        });
        document.querySelectorAll(".search-filter-content input[type='checkbox']").forEach(function (checkbox) {
            checkbox.checked = false;
            document.querySelectorAll(`.search-filter-content input[type='text']`).forEach(function (input) {
                toggle_filter_input_text(input.id, false);
            });
            document.querySelectorAll(`.search-filter-content input[type='date']`).forEach(function (input) {
                toggle_filter_input_text(input.id, false);
            });
        });
        toggle_filter_apply_button(true);
        toggle_filter_reset_button(false);
        toggle_filter_categories_showmore(true);
        toggle_filter_institutions_showmore(true);
        toggle_filter_licenses_showmore(true);
    });

    // Collapse the list if 'Show more' is clicked.
    document.getElementById('search-categories-show-more')?.addEventListener("click", function() {
        toggle_filter_categories_showmore(false);
    });
    document.getElementById('search-institutions-show-more')?.addEventListener("click", function() {
        toggle_filter_institutions_showmore(false);
    });
    document.getElementById('search-licenses-show-more')?.addEventListener("click", function() {
        toggle_filter_licenses_showmore(false);
    });

    // Register events for each filter.
    for (let filter_name of Object.keys(filter_info)) {
        let event_id = "search-filter-content-" + filter_name;
        let is_multiple = filter_info[filter_name]["is_multiple"];

        add_event_listeners (`#${event_id} input[type='checkbox']`, "change", function(event) {
            let target_element = event.currentTarget;
            if (target_element.checked) {
                if (!is_multiple) {
                    document.querySelectorAll(`#${event_id} input[type='checkbox']`).forEach(function (checkbox) {
                        checkbox.checked = false;
                        document.querySelectorAll(`#${event_id} input[type='text']`).forEach(function (input) {
                            input.value = "";
                            toggle_filter_input_text(input.id, false);
                        });
                        document.querySelectorAll(`#${event_id} input[type='date']`).forEach(function (input) {
                            input.value = "";
                            toggle_filter_input_text(input.id, false);
                        });

                    });
                    target_element.checked = true;
                }

                if (target_element.classList.contains("parentcategory")) {
                    let parent_category_id = target_element.id.split("_").pop();
                    toggle_checkbox_subcategories(parent_category_id);
                } else if (target_element.classList.contains("subcategory")) {
                    let parent_category_id = target_element.parentElement.parentElement.id.split("_").pop();
                    clear_checkbox_parentcategory(parent_category_id);
                }
            }

            if (target_element.id.split("_").pop() === "other") {
                document.querySelectorAll(`#${event_id} input[type='text']`).forEach(function (input) {
                    toggle_filter_input_text(input.id, target_element.checked);
                });
                document.querySelectorAll(`#${event_id} input[type='date']`).forEach(function (input) {
                    toggle_filter_input_text(input.id, target_element.checked);
                });
            }
        });
    }

    // show more licenses if 'Show more' for licenses is clicked.
    document.getElementById('search-licenses-show-more')?.addEventListener("click", function() {
        toggle_filter_licenses_showmore(false);
    });

    // Enable the apply button if any checkbox is checked.
    // If collection is checked, disable Search Scope and File Types.
    add_event_listeners (".search-filter-content input[type='checkbox']", "change", function() {
        let is_checked = false;
        document.querySelectorAll(".search-filter-content input[type='checkbox']").forEach(function (checkbox) {
            if (checkbox.checked) {
                toggle_filter_apply_button(true);
                toggle_filter_reset_button(true);
                is_checked = true;
                return;
            }
        });

        if (is_checked == false) {
            toggle_filter_apply_button(true);
            toggle_filter_reset_button(true);
        }

        if (this.id === "checkbox_datatypes_collection") {
            let flag = this.checked ? true : false;
            document.querySelectorAll("#search-filter-content-searchscope input[type='checkbox']").forEach(function (checkbox) {
                checkbox.disabled = flag;
                checkbox.checked = false;
            });
            document.querySelectorAll("#search-filter-content-filetypes input[type='checkbox']").forEach(function (checkbox) {
                checkbox.disabled = flag;
                checkbox.checked = false;
            });
        }
    });

    // When the apply button is clicked, update the URL.
    document.getElementById("search-filter-apply-button")?.addEventListener("click", function() {
        if (document.getElementById("search-filter-apply-button").classList.contains("disabled")) {
            return;
        }

        document.querySelectorAll(".search-filter-content input").forEach(function (input) {
            if (input.type === "checkbox" && !input.checked) { return; }
            let filter_name = input.id.split("_")[1];
            let value       = input.value;
            if (!(filter_name in filter_info)) { return; }
            if (input.type === "checkbox" && value !== "other") {
                filter_info[filter_name]["values"].push(value);
            } else if ((input.type === "text" || input.type === "date") && value.length > 0) {
                filter_info[filter_name]["other_value"] = value;
            } else {
                return;
            }
        });

        let new_url = window.location.origin + window.location.pathname + "?";
        for (let filter_name of Object.keys(filter_info)) {
            let values = filter_info[filter_name]["values"];
            if (values.length > 0) {
                new_url += `${filter_name}=${values.join(",")}&`;
            }
            if ("other_value" in filter_info[filter_name]) {
                let other_value = filter_info[filter_name]["other_value"];
                other_value = trim_single_word(other_value);
                if (other_value && other_value.length > max_parameter_length) {
                    other_value = other_value.substring(0, max_parameter_length);
                }
                new_url += `${filter_name}_other=${other_value}&`;
            }
        }

        let search_for = document.getElementById("search-box")?.value;
        if (search_for && search_for.length > 0) {
            if (search_for.length > max_parameter_length) {
                search_for = search_for.substring(0, max_parameter_length);
                document.getElementById("search-box").value = search_for;
            }
            new_url += `search=${search_for}&`;
        }

        if (new_url.endsWith("&")) {
            new_url = new_url.slice(0, -1);
        }

        window.location.href = new_url;
    });

    document.getElementById("textinput_institutions_other")?.addEventListener("keyup", function() {
        toggle_filter_apply_button(true);
        toggle_filter_reset_button(true);
    });
    document.getElementById("textinput_filetypes_other")?.addEventListener("keyup", function() {
        toggle_filter_apply_button(true);
        toggle_filter_reset_button(true);
    });
    document.getElementById("textinput_publisheddate_other")?.addEventListener("keyup", function() {
        toggle_filter_apply_button(true);
        toggle_filter_reset_button(true);
    });
    document.getElementById("textinput_publisheddate_other")?.addEventListener("change", function() {
        toggle_filter_apply_button(true);
        toggle_filter_reset_button(true);
    });

    document.getElementById('tile-view-mode')?.addEventListener("click", function() {
        toggle_view_mode("tile");
    });

    document.getElementById('list-view-mode')?.addEventListener("click", function() {
        toggle_view_mode("list");
    });

    document.getElementById('sort-by')?.addEventListener("change", function() {
        let sort_by = document.getElementById("sort-by").value;
        toggle_sort_by(sort_by);
    });
}

function load_search_filters_from_url() {
    let url_params = parse_url_params();
    if (Object.keys(url_params).length > 0) {
        for (let param_name of Object.keys(url_params)) {
            let values = url_params[param_name].split(",");
            let filter_name = param_name;
            let is_other = false;
            if (param_name.endsWith("_other")) {
                filter_name = param_name.split("_")[0];
                is_other = true;
            }

            if (filter_name !== "search" && filter_name !== "page") {
                let field = create_element("input", {
                    "type": "hidden",
                    "name": (is_other) ? `${filter_name}_other` : filter_name,
                    "value": values
                });
                document.querySelector(`#search-box-wrapper form`)?.append(field);
            } else if (filter_name === "search") {
                let search_for = document.getElementById("search-box")?.value;
                if (search_for && search_for.length > 0 && search_for.length > max_parameter_length) {
                    search_for = search_for.substring(0, max_parameter_length);
                    document.getElementById("search-box").value = search_for;
                }
            }

            if (filter_name in filter_info) {
                if (filter_name == "institutions") {
                    toggle_filter_institutions_showmore(false);
                }

                if (filter_name == "licenses") {
                    toggle_filter_licenses_showmore(false);
                }

                if (filter_name == "categories") {
                    toggle_filter_categories_showmore(false);
                }

                for (let value of values) {
                    let stripped_value = value.replace(/[^a-zA-Z0-9-_]/g, '');
                    let checkbox_id = `checkbox_${filter_name}_${stripped_value}`;
                    let checkbox_id_element = jQuery(`#${checkbox_id}`);
                    if (checkbox_id_element.length > 0) {
                        document.getElementById(checkbox_id).checked = true;
                        if (filter_name == "categories") {
                            if (enable_subcategories) {
                                let checkbox_id_class = checkbox_id_element[0].className;
                                if (checkbox_id_class) {
                                    let classes = checkbox_id_class.split(" ");
                                    if (classes.includes("subcategory")) {
                                        let parent_category_id = checkbox_id_element[0].parentElement.parentElement.id.split("_").pop();
                                        toggle_checkbox_subcategories(parent_category_id, force_on=true);
                                        document.getElementById(checkbox_id).checked = true;
                                    }
                                }
                            }
                        }
                    }

                    if (filter_name == "institutions") {
                        toggle_filter_institutions_showmore(false);
                    }

                    // If collection is checked, disable Search Scope and File Types.
                    if (checkbox_id === "checkbox_datatypes_collection") {
                        document.querySelectorAll("#search-filter-content-searchscope input[type='checkbox']").forEach(function (checkbox) {
                            checkbox.disabled = true;
                            checkbox.checked = false;
                        });
                        document.querySelectorAll("#search-filter-content-filetypes input[type='checkbox']").forEach(function (checkbox) {
                            checkbox.disabled = true;
                            checkbox.checked = false;
                        });
                    }
                }

                if (is_other && "enable_other" in filter_info[filter_name] && url_params[param_name] && url_params[param_name].length > 0) {
                    let other_value = url_params[param_name];
                    let input_text_id = `textinput_${filter_name}_other`;
                    let input_text_id_element = jQuery(`#${input_text_id}`);
                    if (input_text_id_element.length > 0) {
                        input_text_id_element[0].value = other_value;
                        toggle_filter_input_text(input_text_id, true);
                    }
                    let checkbox_id = `checkbox_${filter_name}_other`;
                    let checkbox_id_element = jQuery(`#${checkbox_id}`);
                    if (checkbox_id_element.length > 0) {
                        document.getElementById(checkbox_id).checked = true;
                    }
                }
            } else {
                continue;
            }
        }
    }
}

function load_search_results() {
    let api_collection_url = "/v2/collections/search";
    let api_dataset_url    = "/v3/datasets/search";
    let target_api_url     = null;
    let url_params         = parse_url_params();
    let request_params     = {};

    // If the selected institutions have separate groups for students,
    // add the associated groups too.
    if ("institutions" in url_params) {
        let institutions = {};
        let hidden_institutions = {};
        let checked_institutions = {};
        document.querySelectorAll(`#search-filter-content-institutions label`).forEach(function (label) {
            let institution_name = label.innerText.trim();
            let institution_id   = label.attributes["for"].value;
            let hidden = false;
            if ("hidden" in label.attributes) {
                hidden = true;
            }

            if (hidden) {
                hidden_institutions[institution_name] = institution_id;
            } else {
                institutions[institution_name] = institution_id;
            }

            institutions[institution_name] = {
                "id": institution_id,
                "hidden": hidden,
            };
        });

        for (let institution of url_params["institutions"].split(",")) {
            let institution_id = `checkbox_institutions_${institution}`;
            let institution_name = (document.querySelector(`label[for='${institution_id}']`)?.textContent ?? "").trim();

            checked_institutions[institution_name] = institution_id;
        }

        for (let institution_name of Object.keys(hidden_institutions)) {
            let associated_institution_name = institution_name.substring(0, institution_name.length - " Students".length);
            if (associated_institution_name in checked_institutions) {
                let id = hidden_institutions[institution_name].slice("checkbox_institutions_".length);
                url_params["institutions"] += `,${id}`;
            }
        }
    }

    if ("datatypes" in url_params && url_params["datatypes"] === "collection") {
        target_api_url = api_collection_url;
    } else {
        target_api_url = api_dataset_url;
        request_params["item_type"] = url_params["datatypes"];
    }

    if ("searchscope" in url_params && typeof(url_params["searchscope"]) === "string" && url_params["searchscope"].length > 0) {
        request_params["search_scope"] = _split_comma_separated_string(url_params["searchscope"]);
    } else {
        // If searchscope is not selected, search in title, description, and tags.
        request_params["search_scope"] = ["title", "description", "tag", "author"];
    }

    if ("searchoperator" in url_params && typeof(url_params["searchoperator"]) === "string" && url_params["searchoperator"].length > 0) {
        request_params["search_operator"] = url_params["search_operator"];
    } else {
        request_params["search_operator"] = "AND";
    }

    if (("filetypes" in url_params && typeof(url_params["filetypes"]) === "string" && url_params["filetypes"].length > 0) || ("filetypes_other" in url_params && typeof(url_params["filetypes_other"]) === "string" && url_params["filetypes_other"].length > 0)) {
        request_params["search_format"] = _split_comma_separated_string(url_params["filetypes"]);
        if ("filetypes_other" in url_params && typeof(url_params["filetypes_other"]) === "string" && url_params["filetypes_other"].length > 0) {
            let filetypes_other = url_params["filetypes_other"];
            filetypes_other = trim_single_word(filetypes_other);
            request_params["search_format"].push(filetypes_other);
        }
    }

    if ("publisheddate" in url_params && typeof(url_params["publisheddate"]) === "string" && url_params["publisheddate"].length > 0) {
        let today = new Date();
        let year = today.getFullYear() - url_params["publisheddate"];
        let new_date = new Date(year, 0, 1);
        let since_date = new_date.toISOString();
        request_params["published_since"] = `${since_date}`;
    } else if ("publisheddate_other" in url_params && typeof(url_params["publisheddate_other"]) === "string" && url_params["publisheddate_other"].length > 0) {
        let new_date = new Date(url_params["publisheddate_other"]);
        let since_date = new_date.toISOString();
        request_params["published_since"] = `${since_date}`;
    }

    if (("licenses" in url_params && typeof(url_params["licenses"]) === "string" && url_params["licenses"].length > 0)) {
        request_params["licenses"] = _split_comma_separated_string(url_params["licenses"]);
    }

    if (("categories" in url_params && typeof(url_params["categories"]) === "string" && url_params["categories"].length > 0)) {
        request_params["categories"] = _split_comma_separated_string(url_params["categories"]);
    }

    if (("institutions" in url_params && typeof(url_params["institutions"]) === "string" && url_params["institutions"].length > 0)) {
        request_params["groups"] = _split_comma_separated_string(url_params["institutions"]);
    }

    if ("institutions_other" in url_params && typeof(url_params["institutions_other"]) === "string" && url_params["institutions_other"].length > 0) {
        request_params["organizations"] = trim_single_word(url_params["institutions_other"]);
    }

    request_params["search_for"] = url_params["search"];
    if (url_params["q"]) {
        request_params["search_for"] = url_params["q"];
    }

    request_params["page_size"] = page_size;
    request_params["is_latest"] = 1;
    request_params["page"] = "page" in url_params ? url_params["page"] : 1;

    show_elements ("#search-loader", "block");
    hide_elements ("#search-error");

    fetch(target_api_url, {
        method:  "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body:    JSON.stringify(request_params)
    }).then(function (response) {
        if (!response.ok) { throw response; }
        return response.json();
    }).then(function (data) {
        try {
            if (data.length == 0) {
                let error_message = `No search results...`;
                document.getElementById("search-error").innerHTML = error_message;
                show_elements ("#search-error", "block");
                return;
            }

            render_search_results(data, request_params["page"]);
        } catch (error) {
            let error_message = `Failed to get search results` +
                                `<br>reason: ${error}`;
            document.getElementById("search-error").innerHTML = error_message;
            show_elements ("#search-error", "block");
        }
    }).catch(function (error) {
        // An HTTP error gives us the response; anything else is an exception.
        let error_message = `Failed to get search results` +
                            `<br><br>status: ${error.status ?? "error"}` +
                            `<br>reason: ${error.statusText ?? error.message}`;
        document.getElementById("search-error").innerHTML = error_message;
        show_elements ("#search-error", "block");
    }).finally(function () {
        hide_elements ("#search-loader");
    });
}

function render_search_results(data, page_number) {
    let html_tile_view = "";
    let html_list_view = "";
    html_list_view += '<table class="corporate-identity-table">';
    html_list_view += '<thead><tr><th>Dataset</th><th>Posted On</th></tr></thead>';

    for (let item of data) {
        // continue if it doesn't have a timeline.
        // Usually, embargoed datasets don't have timeline.
        if (!("timeline" in item)) {
            continue;
        }

        let uuid = item.uuid;
        let title = item.title;
        let url_container = item.url_public_html;

        // Collections don't have .url_public_html and .url returns json.
        if (!url_container) {
            url_container = "/collections/" + uuid;
        }

        let preview_thumb = "/static/images/dataset-thumb.svg";
        if ("thumb" in item && typeof(item.thumb) === "string" && item.thumb.length > 0 && !(item.thumb.startsWith("https://ndownloader"))) {
            preview_thumb = item.thumb;
        }

        let posted_date = item.timeline.posted;
        if (posted_date.includes("T")) {
            posted_date = posted_date.split("T")[0];
        }

        let revision = null;
        if ("revision" in item.timeline && item.timeline.revision !== null) {
            revision = item.timeline.revision;
        }

        html_tile_view += `<div class="tile-item">`;
        html_tile_view += `<a href="${url_container}">`;
        html_tile_view += `<img class="tile-preview" src="${preview_thumb}" aria-hidden="true" alt="thumbnail for ${uuid}" />`;
        html_tile_view += `</a>`;
        html_tile_view += `<div class="tile-matches" id="article_${uuid}"></div>`;
        html_tile_view += `<div class="tile-title"><a href="${url_container}">${title}</a></div>`;

        if (revision) {
            html_tile_view += `<div class="tile-revision">Revision ${revision}</div>`;
        }
        html_tile_view += `<div class="tile-date">Posted on ${posted_date}</div>`;
        html_tile_view += `<div class="tile-authors"> </div>`;
        html_tile_view += `</div>`;

        html_list_view += '<tr>';
        html_list_view += `<td><a href="${url_container}">${title}</a></td><td class="center">${posted_date}</td>`;
        html_list_view += '</tr>';
    }

    html_list_view += `</tbody></table>`;
    let html_pager = get_pager_html(data, page_number);
    document.getElementById("search-results-tile-view").innerHTML = html_tile_view;
    document.getElementById("search-results-list-view").innerHTML = html_list_view;
    document.querySelectorAll(".search-results-pager").forEach(function (element) {
        element.innerHTML = html_pager;
    });

    update_search_results_count(data, page_number);
    // Sort the search results by the selected sort_by.
    load_search_preferences();
}

function update_search_results_count(data, current_page=1) {
    let html = "";
    if (data.length < page_size) {
        if (current_page === 1) {
            if (data.length === 1) {
                html = "<b>1</b> result found.";
            } else {
                html = `<b>${escape_html(String(data.length))}</b> results found.`;
            }
        } else {
            html = `Over <b>${escape_html(String(page_size))}</b> results found.`;
        }
    } else {
        html = `Over <b>${escape_html(String(page_size))}</b> results found.`;
    }

    document.getElementById("search-results-count").innerHTML = html;
}

function get_pager_html(data, current_page=1) {
    let prev_page = Number(current_page) - 1;
    let next_page = Number(current_page) + 1;
    let html = "";

    if (data.length < page_size) {
        if (current_page === 1) {
            prev_page = null;
            next_page = null;
        } else {
            next_page = null;
        }
    } else {
        if (current_page === 1) {
            prev_page = null;
        }
    }

    let new_url_link = new URL(window.location.href);
    new_url_link.searchParams.delete('page');
    html += "";
    if (prev_page) {
        new_url_link.searchParams.append('page', prev_page);
        html += `<div><a href="${escape_html(new_url_link.href)}" class="pager-prev">Previous</a></div>`;
    } else {
        html += `<div class="lightgrey">Prev</div>`;
    }

    html += `<div class="pager-cur">Page ${escape_html(String(current_page))}</div>`;

    if (next_page) {
        new_url_link.searchParams.append('page', next_page);
        html += `<div><a href="${escape_html(new_url_link.href)}" class="pager-next">Next</a></div>`;
    } else {
        html += `<div class="lightgrey">Next</div>`;
    }
    return html;
}

function load_search_preferences() {
    let page_preferences = new PagePreferences();
    let all_preferences = page_preferences.load_all();
    if ("view_mode" in all_preferences) {
        toggle_view_mode(all_preferences["view_mode"]);
    } else {
        toggle_view_mode("tile");
    }

    if ("sort_by" in all_preferences) {
        toggle_sort_by(all_preferences["sort_by"]);
    } else {
        toggle_sort_by("date_dsc");
    }
}

function sort_search_results(sort_by) {
    // Text of the index-th child of parent that matches selector ("" when there is none).
    function child_text (parent, selector, index) {
        return parent.querySelectorAll(`:scope > ${selector}`)[index]?.textContent ?? "";
    }

    let search_results_list = jQuery(".corporate-identity-table");
    // the first <tr> is the header row, so find the second <tr>
    let list_items = search_results_list.find("tr:gt(0)").get();

    try {
        list_items.sort(function(a, b) {
            // title: column 1, date: column 2
            let keyA = null;
            let keyB = null;

            if (sort_by.startsWith("date_")) {
                keyA = child_text(a, "td", 1);
                keyB = child_text(b, "td", 1);
                keyA = new Date(keyA);
                keyB = new Date(keyB);
            } else if (sort_by.startsWith("title_")) {
                keyA = child_text(a, "td", 0);
                keyB = child_text(b, "td", 0);
                // Sometimes, the title has leading/trailing spaces.
                keyA = keyA.trim().toLowerCase();
                keyB = keyB.trim().toLowerCase();
            }
            if (keyA < keyB) return -1;
            if (keyA > keyB) return 1;
            return 0;
        });

        if (sort_by.endsWith("_dsc")) {
            list_items.reverse();
        }
        list_items.forEach(function (row) {
            search_results_list[0].tBodies[0].append(row);
        });
    } catch (error) {}

    //
    // Sort the tile view
    //
    let search_results_tiles = jQuery("#search-results-tile-view");
    let tile_items = search_results_tiles.find(".tile-item").get();

    try {
        tile_items.sort(function(a, b) {
            let keyA = null;
            let keyB = null;

            if (sort_by.startsWith("date_")) {
                keyA = child_text(a, "div", 2);
                keyB = child_text(b, "div", 2);
                keyA = keyA.split(" ").pop();
                keyB = keyB.split(" ").pop();
                keyA = new Date(keyA);
                keyB = new Date(keyB);
            } else if (sort_by.startsWith("title_")) {
                keyA = child_text(a, "div", 1);
                keyB = child_text(b, "div", 1);
                // Sometimes, the title has leading/trailing spaces.
                keyA = keyA.trim().toLowerCase();
                keyB = keyB.trim().toLowerCase();
            }
            if (keyA < keyB) return -1;
            if (keyA > keyB) return 1;
            return 0;
        });

        if (sort_by.endsWith("_dsc")) {
            tile_items.reverse();
        }
        tile_items.forEach(function (tile) {
            search_results_tiles[0].append(tile);
        });
    } catch (error) {}
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
    let element = document.querySelector(".corporate-identity-background");
    return (element !== null) ? getComputedStyle(element).backgroundColor : "#000000";
}

function _split_comma_separated_string(value) {
    let values = [];
    if (value && value.length > 0) {
        for (let v of value.split(",")) {
            values.push(v);
        }
    }
    return values;
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
