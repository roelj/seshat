function __current_project_uuid () {
    const project_selector = document.getElementById("project-selector");
    let value = project_selector.options[project_selector.selectedIndex].value;
    return (value == "all") ? null : value;
}

function render_projects_selector (event) {
    document.getElementById("project-selector")?.addEventListener("change", update_project);
    let project_uuid_from_cookie = null;
    for (let biscuit of document.cookie.split(";")) {
	if (biscuit.startsWith("seshat_project")) {
	    project_uuid_from_cookie = biscuit.split("=")[1];
	    break;
	}
    }
    fetch("/v3/projects", {
	method:  "GET",
	headers: { "Accept": "application/json" }
    }).then(function (response) {
	if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
	return response.json();
    }).then(function (projects) {
	const project_selector = document.getElementById("project-selector");
	for (const project of projects) {
	    project_selector.add(new Option(project["name"], project["uuid"]));
	}
	project_selector.value = (project_uuid_from_cookie !== null) ? project_uuid_from_cookie : "all";
	render_project_overview (event);
    }).catch(function () {
	show_message ("failure", "<p>Failed to fetch projects.</p>");
    });
}

function render_project_overview (event) {
    const projects = document.getElementById("projects");
    if (projects === null) { return; }

    const project_uuid = __current_project_uuid();
    if (! project_uuid) {
	projects.style.display = "none";
	return;
    }
    fetch(`/v3/projects/${project_uuid}`, {
	method:  "GET",
	headers: { "Accept": "application/json" }
    }).then(function (response) {
	if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
	return response.json();
    }).then(function (project) {
	document.getElementById("project-table-uuid").textContent = project["uuid"];
	document.getElementById("project-table-name").textContent = project["name"];
	document.getElementById("project-table-namespace").textContent = project["namespace"];
	document.getElementById("edit-project-button").href = `/my/projects/${project["uuid"]}/edit`;
	projects.style.display = "block";
    }).catch(function () {
	show_message ("failure", "<p>Failed to reload project information.</p>");
    });
}

function update_project (event) {
    const project_uuid = __current_project_uuid();
    if (! project_uuid) {
	document.cookie = `seshat_project=${project_uuid}; Max-Age=0; SameSite=Strict; path=/my`;
	document.getElementById("projects").style.display = "none";
    } else {
	document.cookie = `seshat_project=${project_uuid}; SameSite=Strict; path=/my`;
	document.getElementById("project-selector").value = project_uuid;
	render_project_overview (event);
    }
}
