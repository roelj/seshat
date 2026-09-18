function gather_form_data () {
    return {
	"name":      or_null(document.getElementById("name").value),
	"namespace": or_null(document.getElementById("namespace").value)
    }
}

function save_project (project_uuid, event) {
    stop_event_propagation (event);
    let form_data = gather_form_data ();
    fetch(`/v3/projects/${project_uuid}`, {
	method:  "PUT",
	headers: { "Accept": "application/json", "Content-Type": "application/json" },
	body:    JSON.stringify (form_data)
    }).then(function (response) {
	if (!response.ok) { throw response; }
	show_message ("success", "<p>Saved changes.</p>");
    }).catch(function (error) {
        json_from_error (error).then(function (json) {
            let message = "<p>Failed to save project. Please try again at a later time.</p>";
            if (json) { message = `<p>Failed to save project: ${json.message}</p>`; }
            show_message ("failure", message);
        });
    });
}


function activate (project_uuid) {
    for (let element of document.querySelectorAll(".hide-for-javascript")) {
	element.classList.remove("hide-for-javascript");
    }
    document.getElementById("save")?.addEventListener("click", function (event) {
	save_project (project_uuid, event);
    });
}
