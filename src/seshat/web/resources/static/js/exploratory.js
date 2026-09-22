function uri_prefix_map () {
    return [ [resolve_ontology_url (),                       "shst:"],
             ["http://www.w3.org/1999/02/22-rdf-syntax-ns#", "rdf:"],
             ["http://www.w3.org/2000/01/rdf-schema#",       "rdfs:"] ];
}

function resolve_ontology_url () {
    if (typeof ontology_url !== 'undefined') { return ontology_url; }
    return "https://seshat.software/ontology/latest/";
}

function apply_replacements (value, pairs) {
    for (const [from, to] of pairs) { value = value.replace(from, to); }
    return value;
}

function shorthand_uri (value) { return apply_replacements (value, uri_prefix_map()); }

function longform_uri (value) {
    return apply_replacements (value, uri_prefix_map().map(([uri, prefix]) => [prefix, uri]));
}

function draw_grid () {
    let explorer    = d3.select("#data-model-explorer");
    let width       = Number.parseInt(explorer.style("width"));
    let height      = Number.parseInt(explorer.style("height"));

    explorer.select("#grid").remove();
    let grid = explorer.append("g").attr("id", "grid");
    grid.lower();
    for (let x = 10; x < width; x += 10) {
        // Vertical lines
        grid.append("line")
            .attr("x1", x)
            .attr("y1", 0)
            .attr("x2", x)
            .attr("y2", height + 1)
            .classed(((x % 290 == 0) ? "highlighted-grid-line" : "grid-line"), true);
        // Horizontal lines
        grid.append("line")
            .attr("x1", 0)
            .attr("y1", x)
            .attr("x2", width + 1)
            .attr("y2", x)
            .classed(((x == 40) ? "highlighted-grid-line" : "grid-line"), true);
    }
}

function draw_column_title (column, value) {
    let translate_x = 20 + column * 290;
    let explorer    = d3.select("#data-model-explorer");
    explorer.selectAll(`.node-${column}-column-title`).remove();
    let title_group = explorer.append("g")
        .attr("transform", "translate("+ translate_x +",20)")
        .classed(`node-${column}-column-title`, true);
    title_group
        .append("text").text(value)
        .attr("transform", "translate(0, 11)")
        .classed("node-column-title", true);
}

function resize_svg () {
    let explorer      = d3.select("#data-model-explorer");

    // Determine the maximum rows to adjust for.
    let column_0_rows = explorer.selectAll(".column-0").size();
    let column_1_rows = explorer.selectAll(".column-1").size();
    let rows          = ((column_0_rows > column_1_rows) ? column_0_rows : column_1_rows);

    // The formula is: header-padding + number-of-rows * height-of-the-row.
    let new_height    = 70 + rows * 40;
    explorer.style("height", `${new_height}px`);
}

function draw_node (row, column, value) {
    let translate_x = 20 + column * 290;
    let translate_y = 60 + row * 40;
    let fill_color  = ((row % 2 == 0) ? "white" : "gray");
    let explorer    = d3.select("#data-model-explorer");
    let node_group  = explorer.append("g").attr("transform", "translate("+ translate_x +","+ translate_y +")");

    // Re-adjust the height so that all rendered nodes are visible.
    let current_height = Number.parseInt(explorer.style("height"));
    let new_height     = translate_y + 50;
    if (current_height < new_height) {
        explorer.style("height", new_height + "px");
    }
    node_group
        .classed(`node-group`, true)
        .classed(`column-${column}`, true)
        .append("rect")
        .classed("node-item", true)
        .classed(`node-group-item-${fill_color}`, true);

    node_group
        .append("text").text(value)
        .attr("transform", "translate(10,21)")
        .attr("class", "node-group-item")

    node_group.on("mousedown", node_mousedown);
}

function node_mousedown () {
    let group = d3.select(this);
    let rect  = group.select("rect");
    let text  = group.select("text");

    // Reset active node.
    d3.select(".active-node").classed("active-node", false);
    rect.classed("active-node", true);

    // Load the next column
    let value = text.text();
    let parameters = build_query_parameters ({ "uri": `${encodeURIComponent(longform_uri(value))}` });
    fetch(`/v3/explore/properties?${parameters}`, {
        method:  "GET",
        headers: { "Accept": "application/json" }
    }).then(function (response) {
        if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
        return response.json();
    }).then(function (properties) {
        draw_column_title (1, "Properties");
        d3.selectAll(".column-1").remove();
        for (let index in properties) {
            value = shorthand_uri(properties[index]);
            draw_node (index, 1, value);
        }
        resize_svg();
        draw_grid ();
    }).catch(function () {
        console.log ("Failed to gather properties.");
    });
}

function clear_exploratory_cache (event) {
    stop_event_propagation (event);
    fetch("/v3/explore/clear-cache", {
        method:  "GET",
        headers: { "Accept": "application/json" }
    }).then(function (response) {
        if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
        location.reload();
    }).catch(function () {
        show_message ("failure", "<p>Failed to clear the exploratory cache.</p>");
    });
}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("remove-cache")?.addEventListener("click", function (event) {
        clear_exploratory_cache (event);
    });
    fetch("/v3/explore/types", {
        method:  "GET",
        headers: { "Accept": "application/json" }
    }).then(function (response) {
        if (!response.ok) { throw new Error(`Error: ${response.status} ${response.statusText}`); }
        return response.json();
    }).then(function (types) {
        draw_column_title (0, "Types");
        d3.selectAll(".column-0").remove();
        for (let index in types) {
            let value = shorthand_uri(types[index]);
            draw_node (index, 0, value);
        }
        resize_svg();
        draw_grid ();
    }).catch(function () {
        console.log ("Failed to gather types.");
    });
});
