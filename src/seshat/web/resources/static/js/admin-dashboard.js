function register_maintenance_action (selector, url, success_message, failure_message) {
    const element = document.querySelector(selector);
    if (element === null) { return; }
    element.addEventListener("click", function (event) {
        stop_event_propagation (event);
        fetch(url, { method: "GET" })
            .then(function (response) {
                if (!response.ok) { throw new Error(`Error: ${response.status}`); }
                show_message ("success", `<p>${success_message}</p>`);
            })
            .catch(function () {
                show_message ("failure", `<p>${failure_message}</p>`);
            });
    });
}

document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".hide-for-javascript").forEach(function (element) {
        element.classList.remove("hide-for-javascript");
    });
    register_maintenance_action ("#recalculate-statistics",
                                 "/admin/maintenance/recalculate-statistics",
                                 "Recalculated statistics.",
                                 "Failed to recalculate statistics.");

    register_maintenance_action ("#clear-cache",
                                 "/admin/maintenance/clear-cache",
                                 "Cache has been cleared.",
                                 "Could not clear the cache.");

    register_maintenance_action ("#clear-website-sessions",
                                 "/admin/maintenance/remove-website-sessions",
                                 "Removed old website sessions.",
                                 "Failed to remove old website sessions.");

    register_maintenance_action ("#repair-missing-dois",
                                 "/admin/maintenance/repair-doi-registrations",
                                 "Repaired DOI registrations.",
                                 "Failed to repair DOI registrations.");
});
