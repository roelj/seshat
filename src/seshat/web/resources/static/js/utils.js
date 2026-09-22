const quill_modules = { toolbar: [ ['bold', 'italic', 'underline', 'strike', 'link', { 'list': 'ordered' }, { 'list': 'bullet' }, 'clean'] ]};

function render_in_form (text) { return [text].join(""); }

function escape_html (text) {
    let element = document.createElement("div");
    element.textContent = text;
    return element.innerHTML;
}

function create_element (tag, attributes = {}, text = null) {
    let element = document.createElement(tag);
    for (let [name, value] of Object.entries(attributes)) { element.setAttribute(name, value); }
    if (text !== null && text !== undefined) { element.textContent = text; }
    return element;
}

function on_click_with_data (element, data, handler) {
    element.addEventListener("click", function (event) {
        event.data = data;
        handler (event);
    });
    return element;
}

function add_event_listeners (selector, type, handler) {
    for (let element of document.querySelectorAll(selector)) {
        element.addEventListener(type, handler);
    }
}

function show_elements (selector, display = "") {
    for (let element of document.querySelectorAll(selector)) { element.style.display = display; }
}

function hide_elements (selector) {
    for (let element of document.querySelectorAll(selector)) { element.style.display = "none"; }
}

function is_visible (element) {
    return element !== null && element.getClientRects().length > 0;
}

const collapsed_box = { height: "0px", paddingTop: "0px", paddingBottom: "0px", marginTop: "0px", marginBottom: "0px" };

function vertical_box (element) {
    let style = getComputedStyle(element);
    return { height: style.height, paddingTop: style.paddingTop, paddingBottom: style.paddingBottom,
             marginTop: style.marginTop, marginBottom: style.marginBottom };
}

function has_display_none (element) {
    return getComputedStyle(element).display === "none";
}

function animate_element (element, keyframes, duration, on_finish) {
    if (typeof element.animate !== "function") { on_finish (); return; }
    element.animate(keyframes, { duration: duration, easing: "ease-in-out" }).onfinish = on_finish;
}

function slide_down (element, duration, display = "", callback = function () {}) {
    if (element === null) { return; }
    if (!has_display_none (element)) { callback (); return; }
    element.style.display = display;
    element.style.overflow = "hidden";
    animate_element (element, [collapsed_box, vertical_box (element)], duration, function () {
        element.style.overflow = "";
        callback ();
    });
}

function slide_up (element, duration, callback = function () {}) {
    if (element === null) { return; }
    if (has_display_none (element)) { callback (); return; }
    element.style.overflow = "hidden";
    animate_element (element, [vertical_box (element), collapsed_box], duration, function () {
        element.style.display = "none";
        element.style.overflow = "";
        callback ();
    });
}

function fade_in (element, duration, display = "", callback = function () {}) {
    if (element === null) { return; }
    if (!has_display_none (element)) { callback (); return; }
    element.style.display = display;
    animate_element (element, [{ opacity: 0 }, { opacity: getComputedStyle(element).opacity }], duration, callback);
}

function fade_out (element, duration, callback = function () {}) {
    if (element === null) { return; }
    if (has_display_none (element)) { callback (); return; }
    animate_element (element, [{ opacity: getComputedStyle(element).opacity }, { opacity: 0 }], duration, function () {
        element.style.display = "none";
        callback ();
    });
}

function is_empty_object (item) {
    if (item === null || item === undefined) { return true; }
    return Object.keys(item).length === 0;
}

function build_query_parameters (values) {
    let parameters = new URLSearchParams();
    for (let [key, value] of Object.entries(values)) {
        if (Array.isArray(value)) { for (let entry of value) { parameters.append(`${key}[]`, entry); } }
	else { parameters.append(key, value); }
    }
    return parameters;
}

function or_null (value) { return (value == "" || value == "<p><br></p>") ? null : value; }
function or_empty (value) { return (value === undefined || value == null || value == "") ? "" : value;}
function show_message (type, message) {
    let element = document.getElementById("message");
    if (element === null) { return; }
    if (element.classList.contains("transparent")) {
        element.classList.remove("transparent");
        element.innerHTML = "";
    }
    element.classList.add(type);
    element.insertAdjacentHTML("beforeend", message);
    element.style.display = "block";
    setTimeout(() => {
        element.classList.add("fading-out");
        element.addEventListener("transitionend", () => {
            element.classList.remove(type, "fading-out");
            element.classList.add("transparent");
            element.innerHTML = "<p>&nbsp;</p>";
        }, { once: true });
    }, 20000);
}

function value_from_quill (identifier) {
    let value = or_null(document.querySelector(`${identifier} .ql-editor`)?.innerHTML);
    if (value === undefined) { return null; }
    if (value !== null) {
	value = value.replaceAll('<p class="ql-align-justify">', '<p>');
	value = value.replace(/<ol>(\s*<li data-list="bullet">[\s\S]*?)<\/ol>/g, '<ul>$1</ul>');
	value = value.replaceAll('<li data-list="ordered">', '<li>');
	value = value.replaceAll('<li data-list="bullet">', '<li>');
	value = value.replaceAll('<span class="ql-ui" contenteditable="false"></span>', '');
    }
    return value;
}

// Resolves to the JSON body of a failed fetch() response, or to null when
// there is none (network failure, or the body isn't valid JSON).
function json_from_error (error) {
    if (!(error instanceof Response)) { return Promise.resolve(null); }
    return error.json().catch(function () { return null; });
}

function stop_event_propagation (event) {
    if (event !== null) {
        event.preventDefault();
        event.stopPropagation();
    }
}

function install_sticky_header() {
    const submenu = document.getElementById("submenu");
    const message = document.getElementById("message");
    const content_wrapper = document.getElementById("content-wrapper");
    if (submenu === null || message === null || content_wrapper === null) { return; }
    const submenu_offset = submenu.offsetTop;

    function scroll_handler() {
        let is_sticky = window.scrollY >= submenu_offset;
        submenu.classList.toggle("sticky", is_sticky);
        message.classList.toggle("sticky-message", is_sticky);
	let h1 = document.querySelector("h1");
	if (h1) { h1.classList.toggle("sticky-margin", is_sticky); }
        if (is_sticky) {
            message.style.width = `${content_wrapper.offsetWidth}px`;
        } else if (message.classList.contains("transparent")) {
            message.classList.remove("transparent");
            message.textContent = "";
            message.style.display = "none";
        }
    }

    window.addEventListener("scroll", scroll_handler, { passive: true });
    window.addEventListener("resize", scroll_handler, { passive: true });
}

function install_touchable_help_icons() {
    document.querySelectorAll(".help-icon").forEach(icon => {
        icon.addEventListener("click", () => {
            let text = icon.querySelector(".help-text");
	    if (text) {
		let is_visible = text.offsetParent !== null || getComputedStyle(text).display !== "none";
		icon.classList.toggle("help-icon-clicked", !is_visible);
	    }
        });
    });
}

function toggle_categories (event = null) {
    stop_event_propagation (event);
    const categories = document.getElementById("expanded-categories");
    if (categories === null) { return; }
    const is_open = categories.classList.toggle("open");
    const button = document.getElementById("expand-categories-button");
    button.textContent = is_open ? "Hide categories" : "Select categories";
}

function delete_dataset (dataset_uuid, event) {
    stop_event_propagation (event);
    if (confirm("Deleting this draft dataset is unrecoverable. "+
                "Do you want to continue?"))
    {
        fetch(`/v2/account/articles/${dataset_uuid}`, {
            method: "DELETE"
        }).then(function (response) {
            if (!response.ok) { throw response; }
            window.location.pathname = "/my/datasets";
        }).catch(function (error) {
            if (error.status == 403) {
                show_message ("failure", "<p>No permission to remove dataset.</p>");
            } else {
                show_message ("failure", "<p>Failed to remove dataset.</p>");
            }
        });
    }
}

function delete_collection (collection_uuid, event) {
    stop_event_propagation (event);
    if (confirm("Deleting this draft collection is unrecoverable. "+
                "Do you want to continue?"))
    {
        fetch(`/v2/account/collections/${collection_uuid}`, {
            method: "DELETE"
        }).then(function (response) {
            if (!response.ok) { throw response; }
            window.location.pathname = "/my/collections";
        }).catch(function (error) {
	    if (error.status == 403) {
                show_message ("failure", "<p>No permission to remove collection.</p>");
	    } else {
                show_message ("failure", "<p>Failed to remove collection.</p>");
	    }
        });
    }
}

function delete_dataset_private_link (dataset_uuid, link_id, event) {
    stop_event_propagation (event);
    if (confirm("Deleting this private link is unrecoverable. "+
                "Do you want to continue?"))
    {
        fetch(`/v2/account/articles/${dataset_uuid}/private_links/${link_id}`, {
            method: "DELETE"
        }).then(function (response) {
            if (!response.ok) { throw response; }
            location.reload();
        }).catch(function (error) {
            if (error.status == 403) {
                show_message ("failure", "<p>No permission to remove private link.</p>");
            } else {
                show_message ("failure", "<p>Failed to remove private link.</p>");
            }
        });
    }
}

function delete_collection_private_link (collection_uuid, link_id, event) {
    stop_event_propagation (event);
    if (confirm("Deleting this private link is unrecoverable. "+
                "Do you want to continue?"))
    {
        fetch(`/v2/account/collections/${collection_uuid}/private_links/${link_id}`, {
            method: "DELETE"
        }).then(function (response) {
            if (!response.ok) { throw response; }
            location.reload();
        }).catch(function (error) {
            if (error.status == 403) {
                show_message ("failure", "<p>No permission to remove private link.</p>");
            } else {
                show_message ("failure", "<p>Failed to remove private link.</p>");
            }
        });
    }
}

function toggle_collaborators(dataset_uuid, may_edit_metadata, event) {
    stop_event_propagation(event);

    let expanded_collaborators = document.getElementById("expanded-collaborators");
    if (expanded_collaborators === null) { return; }
    let button = document.getElementById("expand-collaborators-button");
    let is_visible = expanded_collaborators.classList.contains("open");

  function show_collaborators() {
      expanded_collaborators.style.display = "block";
      expanded_collaborators.classList.add("open");
      button.textContent = "Hide collaborators";
  }

  function hide_collaborators() {
      expanded_collaborators.style.display = "none";
      expanded_collaborators.classList.remove("open");
      button.textContent = may_edit_metadata ? "Manage collaborators" : "Show collaborators";
  }

  if (is_visible) {
    hide_collaborators();
  } else if (document.getElementById("add_collaborator")) {
    show_collaborators();
  } else {
    render_collaborators_for_dataset(dataset_uuid, may_edit_metadata, show_collaborators);
  }
}

function fill_collaborator (email, full_name, account_uuid) {
    const input_text = full_name === null ? email : `${full_name}, (${email})`;
    document.getElementById('add_collaborator').value = input_text;
    document.getElementById('account_uuid').value = account_uuid;
    let element = document.getElementById('collaborator-ac');
    if (element) { element.remove(); }
    document.getElementById('add_collaborator').classList.remove('input-for-ac');
}

function add_collaborator_event (event) {
    stop_event_propagation (event);
    fill_collaborator (event.data["email"], event.data["full_name"], event.data["uuid"]);
}

function autocomplete_collaborator (event, item_id) {
    let current_text = document.getElementById("add_collaborator").value.trim();
    let existing_collaborators = [...document.querySelectorAll(".contributor-uuid")].map(el => el.value);
    if (current_text == "") {
	let element = document.getElementById("collaborator-ac");
	if (element) { element.remove(); }
        document.getElementById("add_collaborator").classList.remove("input-for-ac");
    } else if (current_text.length > 2) {
        fetch("/v3/accounts/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "search_for": current_text, "exclude": existing_collaborators })
        }).then(response => response.json())
          .then(data => {
	      let element = document.getElementById('collaborator-ac');
	      if (element) { element.remove(); }
              const unordered_list = document.createElement("ul");
              for (const item of data) {
                  const account_text = item.full_name ? `${item.full_name}, ${item.email}` : item.email;
                  const anchor = document.createElement("a");
                  anchor.href = "#";
                  anchor.textContent = account_text;
                  anchor.addEventListener("click", event => {
                      event.data = { "email": item.email,
                                     "full_name": item.full_name,
                                     "uuid": item.uuid
                                   };
                      add_collaborator_event(event);
                  });

                  const list_item = document.createElement("li");
                  list_item.appendChild(anchor);
                  unordered_list.appendChild(list_item);
              }

	      const wrapper = document.createElement("div");
	      wrapper.id = "collaborator-ac";
	      wrapper.className = "autocomplete";
	      wrapper.appendChild(unordered_list);
              const add_collaborator = document.getElementById("add_collaborator");
              add_collaborator.classList.add("input-for-ac");
              add_collaborator.after(wrapper);
          }).catch(error => { console.log(`Error: ${error.message}`); });
    }
}

function new_author (item_uuid) {
    let description = document.querySelector("#new-author-description");
    if (description) {
        description.outerHTML = `<br><span><i>Enter the details of the author you want to add.</i></span>`;
    }

    let field = (label, id, required) =>
        `<label for="${id}">${label}</label>` +
        (required ? `<span class="required-field">*</span>` : "") +
        `<input type="text" id="${id}" name="${id}">`;

    let container = document.querySelector("#authors-ac");
    container.querySelector("ul")?.remove();
    document.querySelector("#new-author")?.remove();
    container.insertAdjacentHTML("beforeend", `
        <div id="new-author-form">
          ${field("First name", "author_first_name", true)}
          ${field("Last name", "author_last_name", true)}
          ${field("E-mail address", "author_email")}
          ${field("ORCID", "author_orcid")}
          <div id="new-author" class="a-button"><a href="#">Add author</a></div>
        </div>`);

    container.querySelector("#new-author a").addEventListener("click", (event) => {
        event.data = { "item_uuid": item_uuid };
        submit_new_author_event(event);
    });
}

function submit_new_author_event (event) {
    stop_event_propagation (event);
    submit_new_author (event.data["item_uuid"]);
}

function add_author_event (event) {
    stop_event_propagation (event);
    if (event.data?.["uuid"]) {
        add_author (event.data["uuid"], event.data["item_id"]);
    } else {
        new_author (event.data["item_id"]);
    }
}

function autocomplete_author (event, item_id) {
    let current_text = document.getElementById("authors").value.trim();
    if (current_text == "") {
	let element = document.getElementById("authors-ac");
	if (element) { element.remove(); }
        document.getElementById("authors").classList.remove("input-for-ac");
    } else if (current_text.length > 2) {
        fetch("/v2/account/authors/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "search": current_text })
        }).then(response => response.json())
          .then(data => {
	      let element = document.getElementById("authors-ac");
	      if (element) { element.remove(); }
              const unordered_list = document.createElement("ul");
              const new_author_text = data.length === 0
                    ? "It seems the author is not registered in our system. Click the button below to register a new author."
                    : "Do you want to create a new author record? Then click on the button below.";

              for (const item of data) {
                  let name = item.full_name;
                  if (item.orcid_id != null && item.orcid_id !== "") {
                      name += ` (${item.orcid_id})`;
                  }

                  const anchor = document.createElement("a");
                  anchor.href = "#";
                  anchor.textContent = name;
                  anchor.addEventListener("click", event => {
                      event.data = { "uuid": item.uuid, "item_id": item_id };
                      add_author_event(event);
                  });

                  const list_item = document.createElement("li");
                  list_item.appendChild(anchor);
                  unordered_list.appendChild(list_item);
              }

              const new_author_description = document.createElement("span");
              new_author_description.id = "new-author-description";
              new_author_description.textContent = new_author_text;

              const new_author_anchor = document.createElement("a");
              new_author_anchor.href = "#";
              new_author_anchor.textContent = "Create new author record";
              new_author_anchor.addEventListener("click", event => {
                  event.data = { "item_id": item_id };
                  add_author_event(event);
              });

              const new_author_button = document.createElement("div");
              new_author_button.id = "new-author";
              new_author_button.className = "a-button";
              new_author_button.appendChild(new_author_anchor);

              new_author_description.appendChild(new_author_button);
              unordered_list.appendChild(new_author_description);

	      const wrapper = document.createElement("div");
	      wrapper.id = "authors-ac";
	      wrapper.className = "autocomplete";
	      wrapper.appendChild(unordered_list);
              const authors_input = document.getElementById("authors");
              authors_input.classList.add("input-for-ac");
              authors_input.after(wrapper);
          }).catch(error => { console.log(`Error: ${error.message}`); });
    }
}

function submit_new_funding_event (event) {
    stop_event_propagation (event);
    submit_new_funding (event.data["item_id"]);
}


function new_funding (item_id) {
    let field = (label, id) =>
        `<label for="${id}">${label}</label>` +
        `<input type="text" id="${id}" name="${id}">`;

    let container = document.querySelector("#funding-ac");
    container.querySelector("ul")?.remove();
    document.querySelector("#new-funding")?.remove();
    container.insertAdjacentHTML("beforeend", `
        <div id="new-funding-form">
          ${field("Title", "funding_title")}
          ${field("Grant code", "funding_grant_code")}
          ${field("Funder name", "funding_funder_name")}
          ${field("URL", "funding_url")}
          <div id="new-funding" class="a-button"><a href="#">Add funding</a></div>
        </div>`);

    container.querySelector("#new-funding a").addEventListener("click", (event) => {
        event.data = { "item_id": item_id };
        submit_new_funding_event(event);
    });
}

function add_funding_event (event) {
    stop_event_propagation (event);
    add_funding (event.data["uuid"], event.data["item_id"]);
}

function new_funding_event (event) {
    stop_event_propagation (event);
    new_funding (event.data["item_id"]);
}

function autocomplete_funding (event, item_id) {
    let current_text = document.getElementById("funding").value.trim();
    if (current_text == "") {
	let element = document.getElementById("funding-ac");
	if (element) { element.remove(); }
        document.getElementById("funding").classList.remove("input-for-ac");
    } else if (current_text.length > 2) {
        fetch("/v2/account/funding/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "search": current_text })
        }).then(response => response.json())
          .then(data => {
	      let element = document.getElementById("funding-ac");
	      if (element) { element.remove(); }
              const unordered_list = document.createElement("ul");
              for (const item of data) {
                  const anchor = document.createElement("a");
                  anchor.href = "#";
                  anchor.textContent = item.title;
                  anchor.addEventListener("click", event => {
                      event.data = { "uuid": item.uuid, "item_id": item_id };
                      add_funding_event(event);
                  });

                  const list_item = document.createElement("li");
                  list_item.appendChild(anchor);
                  unordered_list.appendChild(list_item);
              }

              const new_funding_anchor = document.createElement("a");
              new_funding_anchor.href = "#";
              new_funding_anchor.textContent = "Create funding record";
              new_funding_anchor.addEventListener("click", event => {
                  event.data = { "item_id": item_id };
                  new_funding_event(event);
              });

              const new_funding_button = document.createElement("div");
              new_funding_button.id = "new-funding";
              new_funding_button.className = "a-button";
              new_funding_button.appendChild(new_funding_anchor);
              unordered_list.appendChild(new_funding_button);

	      const wrapper = document.createElement("div");
	      wrapper.id = "funding-ac";
	      wrapper.className = "autocomplete";
	      wrapper.appendChild(unordered_list);
              const funding_input = document.getElementById("funding");
              funding_input.classList.add("input-for-ac");
              funding_input.after(wrapper);
          }).catch(error => { console.log(`Error: ${error.message}`); });
    }
}

function toggle_cite_collect (event, action) {
    stop_event_propagation (event);

    const other = action === "collect" ? "cite" : "collect";
    const label = action === "collect" ? "Collect" : "Citation";
    const item = document.getElementById(action);
    const other_item = document.getElementById(other);
    const btn = document.getElementById(`${action}-btn`);
    const other_btn = document.getElementById(`${other}-btn`);

    if (item === null || other_item === null) { return; }
    const is_visible = item.classList.contains("open");
    const other_is_visible = other_item.classList.contains("open");

    if (is_visible) {
        item.classList.remove("open");
        item.addEventListener("transitionend", () => {
            item.style.display = "none";
            btn.classList.remove("close");
            btn.classList.add("open");
            btn.textContent = label;
        }, { once: true });

        if (!other_is_visible) {
            other_btn.classList.remove("close", "secondary");
        }
    } else {
        other_item.classList.remove("open");
        other_item.addEventListener("transitionend", () => {
            other_item.style.display = "none";
            other_btn.classList.remove("open");
            other_btn.classList.add("secondary");
        }, { once: true });

        item.style.display = "grid";
        item.classList.add("open");
        item.addEventListener("transitionend", () => {
            btn.classList.remove("open", "secondary");
            btn.classList.add("close");
            btn.textContent = label;
        }, { once: true });
    }
}

function toggle_citation (event) {
    return toggle_cite_collect (event, "cite");
}
function toggle_collect (event) {
    return toggle_cite_collect (event, "collect");
}

function add_tag_event (event) {
    stop_event_propagation (event);
    const tag_input = document.getElementById('tag');
    tag_input.value = event.data["selected_tag"] + '; ';
    tag_input.focus();
    add_tag(event.data["item_id"]);
}

function autocomplete_tags (event, item_id) {
    let current_text = document.getElementById("tag").value.trim();
    if (current_text == "") {
	let element = document.getElementById("tag-ac");
	if (element) { element.remove(); }
        document.getElementById("tag").classList.remove("input-for-ac");
        return;
    }
    if (current_text.length <= 2) { return; }

    fetch("/v3/tags/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ "search_for": current_text })
    }).then(response => response.json())
      .then(data => {
	  let element = document.getElementById("tag-ac");
	  if (element) { element.remove(); }
	  if (data?.length) {
              const unordered_list = document.createElement("ul");
              for (const item of data) {
                  const anchor = document.createElement("a");
                  anchor.href = "#";
                  anchor.textContent = item;
                  anchor.addEventListener("click", event => {
                      event.data = { "item_id": item_id, "selected_tag": item };
                      add_tag_event(event);
                  });
                  const list_item = document.createElement("li");
                  list_item.appendChild(anchor);
                  unordered_list.appendChild(list_item);
              }

	      const wrapper = document.createElement("div");
	      wrapper.id = "tag-ac";
	      wrapper.className = "autocomplete";
	      wrapper.appendChild(unordered_list);
              document.getElementById("tag").classList.add("input-for-ac");
              document.getElementById("wrap-input-tag").after(wrapper);
          } else {
              document.getElementById("tag").classList.remove("input-for-ac");
          }
      }).catch(() => {
	  let element = document.getElementById("tag-ac");
	  if (element) { element.remove(); }
          document.getElementById("tag").classList.remove("input-for-ac");
      });
}
