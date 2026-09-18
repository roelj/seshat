const minimum_rows = 10;
const file_size_units = { b: 1, bytes: 1, kb: 1e3, kib: 1024, mb: 1e6, mib: 1048576, gb: 1e9, gib: 1073741824, tb: 1e12, tib: 1099511627776 };

function file_size_to_number (text) {
    let matches = text.match(/^(\d+(?:\.\d+)?)\s*([a-z]+)/i);
    if (matches === null) { return 0; }
    return Number.parseFloat(matches[1]) * (file_size_units[matches[2].toLowerCase()] ?? 1);
}

function sort_key (text, type) {
    if (type === "file-size") { return file_size_to_number (text); }
    if (type === "num") { return Number.parseFloat(text.replace(/[^0-9.eE+-]/g, "")) || 0; }
    if (type === "date") { return Date.parse(text) || 0; }
    return text.toLowerCase();
}

function detect_column_type (rows, index) {
    let seen = false;
    for (let row of rows) {
        let text = row.keys[index];
        if (text === "") { continue; }
        seen = true;
        if (Number.isNaN(Number(text)) && Number.isNaN(Date.parse(text))) { return "string"; }
    }
    if (!seen) { return "string"; }
    for (let row of rows) {
        if (row.keys[index] !== "" && Number.isNaN(Number(row.keys[index]))) { return "date"; }
    }
    return "num";
}

function DataTable (table, options = {}) {
    if (!(this instanceof DataTable)) { return new DataTable(table, options); }
    this.table    = table;
    this.body     = table.querySelector("tbody");
    if (this.body === null) {
        this.body = document.createElement("tbody");
        table.append(this.body);
    }
    this.headers  = Array.from(table.querySelectorAll("thead th"));
    this.paging   = options.paging !== false;
    this.per_page = options.pageLength ?? 10;
    this.info     = options.info !== false;
    this.searching = options.searching !== false;
    this.language = options.language ?? {};
    this.page     = 0;
    this.query    = "";
    this.sort     = null;

    this.rows = Array.from(this.body.querySelectorAll("tr")).map((row) => {
        let cells = Array.from(row.children).map((cell) => cell.textContent.trim());
        return { element: row, keys: cells, text: cells.join(" ").toLowerCase() };
    });

    this.enabled = this.rows.length >= (options.minimumRows ?? minimum_rows);
    if (!this.enabled) { return; }

    this.orderable = this.headers.map(() => true);
    this.types     = this.headers.map((header, index) => detect_column_type (this.rows, index));
    for (let definition of (options.columnDefs ?? [])) {
        let targets = Array.isArray(definition.targets) ? definition.targets : [definition.targets];
        for (let target of targets) {
            let index = target < 0 ? this.headers.length + target : target;
            if (definition.orderable === false) { this.orderable[index] = false; }
            if (definition.type !== undefined)  { this.types[index] = definition.type; }
        }
    }

    let order = options.order ?? [];
    if (order.length > 0) { this.sort = { column: order[0][0], descending: order[0][1] === "desc" }; }

    this.build_chrome ();
    this.headers.forEach((header, index) => {
        if (!this.orderable[index]) { return; }
        header.classList.add("sorting");
        header.tabIndex = 0;
        header.addEventListener("click", () => this.sort_by (index));
        header.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                this.sort_by (index);
            }
        });
    });

    this.draw ();
    if (typeof options.initComplete === "function") { options.initComplete.call(this, null, null); }
}

DataTable.prototype.build_chrome = function () {
    this.wrapper = document.createElement("div");
    this.wrapper.className = "dataTables_wrapper";
    this.wrapper.id = this.table.id ? `${this.table.id}_wrapper` : "";
    this.table.parentNode.insertBefore(this.wrapper, this.table);
    this.wrapper.append(this.table);

    if (this.searching) {
        let filter = document.createElement("div");
        filter.className = "dataTables_filter";
        let label = document.createElement("label");
        this.search_input = document.createElement("input");
        this.search_input.type = "search";
        this.search_input.placeholder = this.language.searchPlaceholder ?? "";
        let template = this.language.search ?? "Search:";
        let parts = template.split("_INPUT_");
        label.append(parts[0], this.search_input, parts.length > 1 ? parts[1] : "");
        this.search_input.addEventListener("input", () => {
            this.query = this.search_input.value.trim().toLowerCase();
            this.page  = 0;
            this.draw ();
        });
        filter.append(label);
        this.wrapper.append(filter);
    }

    this.paginate = document.createElement("div");
    this.paginate.className = "dataTables_paginate paging_simple_numbers";
    if (this.paging) { this.wrapper.append(this.paginate); }

    this.info_element = document.createElement("div");
    this.info_element.className = "dataTables_info";
    if (this.info) { this.wrapper.append(this.info_element); }
};

DataTable.prototype.matching_rows = function () {
    if (this.query === "") { return this.rows; }
    return this.rows.filter((row) => row.text.includes(this.query));
};

DataTable.prototype.sort_by = function (index) {
    if (this.sort !== null && this.sort.column === index) {
        this.sort.descending = !this.sort.descending;
    } else {
        this.sort = { column: index, descending: false };
    }
    this.page = 0;
    this.draw ();
};

DataTable.prototype.sorted_rows = function (rows) {
    if (this.sort === null) { return rows; }
    let index = this.sort.column;
    let type  = this.types[index];
    let order = this.sort.descending ? -1 : 1;
    return rows.slice().sort((one, two) => {
        let left  = sort_key (one.keys[index] ?? "", type);
        let right = sort_key (two.keys[index] ?? "", type);
        if (left < right) { return -order; }
        if (left > right) { return order; }
        return 0;
    });
};

DataTable.prototype.draw = function () {
    if (!this.enabled) { return; }
    let rows  = this.sorted_rows (this.matching_rows ());
    let total = rows.length;
    let pages = this.paging ? Math.max(1, Math.ceil(total / this.per_page)) : 1;
    if (this.page >= pages) { this.page = pages - 1; }
    let start = this.paging ? this.page * this.per_page : 0;
    let shown = this.paging ? rows.slice(start, start + this.per_page) : rows;

    if (total === 0) {
        let cell = document.createElement("td");
        cell.className = "dataTables_empty";
        cell.colSpan   = Math.max(1, this.headers.length);
        cell.textContent = this.rows.length === 0
            ? "No data available in table"
            : "No matching records found";
        let row = document.createElement("tr");
        row.append(cell);
        this.body.replaceChildren(row);
    } else {
        this.body.replaceChildren(...shown.map((row) => row.element));
    }

    this.headers.forEach((header, index) => {
        if (!this.orderable[index]) { return; }
        header.classList.remove("sorting_asc", "sorting_desc");
        header.classList.add("sorting");
        if (this.sort !== null && this.sort.column === index) {
            header.classList.remove("sorting");
            header.classList.add(this.sort.descending ? "sorting_desc" : "sorting_asc");
        }
    });

    if (this.info) {
        this.info_element.textContent = total === 0
            ? "Showing 0 to 0 of 0 entries"
            : `Showing ${start + 1} to ${start + shown.length} of ${total} entries`;
    }
    if (this.paging) { this.draw_pagination (pages); }
};

DataTable.prototype.draw_pagination = function (pages) {
    this.paginate.replaceChildren();
    if (pages <= 1) { return; }
    let add = (label, target, disabled, current) => {
        let inert  = disabled || current;
        let button = document.createElement(inert ? "span" : "a");
        button.className = "paginate_button" + (disabled ? " disabled" : "") + (current ? " current" : "");
        button.textContent = label;
        if (!inert) {
            button.href = "#";
            button.addEventListener("click", (event) => {
                event.preventDefault();
                this.page = target;
                this.draw ();
            });
        }
        this.paginate.append(button);
    };
    add ("Previous", this.page - 1, this.page === 0, false);
    for (let index = 0; index < pages; index++) {
        if (pages > 7 && index > 1 && index < pages - 2 && Math.abs(index - this.page) > 1) {
            if (index === 2) { this.paginate.append(document.createTextNode("…")); }
            continue;
        }
        add (`${index + 1}`, index, false, index === this.page);
    }
    add ("Next", this.page + 1, this.page === pages - 1, false);
};
