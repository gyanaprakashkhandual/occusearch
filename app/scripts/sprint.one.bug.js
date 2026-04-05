let allBugs = [];
let filteredBugs = [];
let currentFilterField = null;
let filters = {};

async function fetchBugs() {
    try {
        const response = await fetch("../../data/sprint.one.bug.data.json");
        allBugs = await response.json();
        filteredBugs = [...allBugs];
        renderTable();
        populateDropdowns();
    } catch (error) {
        document.getElementById(
            "bugTableBody"
        ).innerHTML = `<tr><td colspan="9" class="error">Error loading data: ${error.message}</td></tr>`;
    }
}

function renderTable() {
    const tbody = document.getElementById("bugTableBody");

    if (filteredBugs.length === 0) {
        tbody.innerHTML =
            '<tr><td colspan="8" class="no-results">No bugs found</td></tr>';
        return;
    }

    tbody.innerHTML = filteredBugs
        .map(
            (bug) => `
    <tr>
        <td>${bug.bugId}</td>
        <td>${bug.module}</td>
        <td>${bug.bugType}</td>
        <td>${bug.bugDescription}</td>
        <td>${bug.bugRequirement}</td>
        <td><span class="priority-${bug.bugPriority.toLowerCase()}">${bug.bugPriority}</span></td>
        <td><span class="status-${bug.bugStatus.toLowerCase().replace(" ", "-")}">${bug.bugStatus}</span></td>
        <td><img src="${bug.bugReportedBy}" alt="Reporter" class="profile-img" title="Reported by"></td>
    </tr>
`
        )
        .join("");
}

function populateDropdowns() {
    const fields = [
        "bugId",
        "module",
        "bugType",
        "bugDescription",
        "bugRequirement",
        "bugPriority",
        "bugStatus",
    ];

    fields.forEach((field) => {
        const uniqueValues = [
            ...new Set(allBugs.map((bug) => bug[field])),
        ].sort();
        const dropdown = document.getElementById(`${field}Dropdown`);
        const list = dropdown.querySelector(".dropdown-list");
        const input = dropdown.querySelector(".dropdown-input");

        list.innerHTML = uniqueValues
            .map(
                (value) => `<div class="dropdown-item" onclick="filterByValue('${field}', '${value}')">${value}</div>`
            )
            .join("");

        input.addEventListener("input", (e) =>
            filterDropdownList(e.target, list, uniqueValues)
        );
        input.addEventListener("keydown", (e) =>
            handleDropdownKeyboard(e, list)
        );
    });

    const reportedByDropdown = document.getElementById("bugReportedByDropdown");
    const reportedByList = reportedByDropdown.querySelector(".dropdown-list");
    const reportedByInput = reportedByDropdown.querySelector(".dropdown-input");

    const uniqueReporters = [
        ...new Set(allBugs.map((bug) => bug.bugReportedBy)),
    ];
    reportedByList.innerHTML = uniqueReporters
        .map(
            (reporter) => `<div class="dropdown-item" onclick="filterByValue('bugReportedBy', '${reporter}')"><img src="${reporter}" style="width: 20px; height: 20px; border-radius: 50%; margin-right: 8px;">${reporter}</div>`
        )
        .join("");

    reportedByInput.addEventListener("input", (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const items = reportedByList.querySelectorAll(".dropdown-item");
        items.forEach((item) => {
            item.style.display = item.textContent
                .toLowerCase()
                .includes(searchTerm)
                ? "block"
                : "none";
        });
    });
    reportedByInput.addEventListener("keydown", (e) =>
        handleDropdownKeyboard(e, reportedByList)
    );
}

function openDropdown(event, field) {
    event.preventDefault();
    closeAllDropdowns();
    const dropdown = document.getElementById(`${field}Dropdown`);
    const button = event.target.closest("button");
    const rect = button.getBoundingClientRect();

    dropdown.style.top = rect.bottom + window.scrollY + "px";
    dropdown.style.left = rect.left + window.scrollX + "px";
    dropdown.classList.add("active");

    const input = dropdown.querySelector(".dropdown-input");
    input.focus();
    currentFilterField = field;
}

function closeAllDropdowns() {
    document
        .querySelectorAll(".dropdown")
        .forEach((d) => d.classList.remove("active"));
}

function filterDropdownList(input, list, values) {
    const searchTerm = input.value.toLowerCase();
    const items = list.querySelectorAll(".dropdown-item");
    items.forEach((item) => {
        item.style.display = item.textContent
            .toLowerCase()
            .includes(searchTerm)
            ? "block"
            : "none";
    });
}

function handleDropdownKeyboard(event, list) {
    if (event.key === "Enter") {
        const activeItem = list.querySelector(
            '.dropdown-item:not([style*="display: none"])'
        );
        if (activeItem) activeItem.click();
        closeAllDropdowns();
    } else if (event.key === "Escape") {
        closeAllDropdowns();
    }
}

function filterByValue(field, value) {
    filters[field] = value;
    updateClearButtons();
    filteredBugs = allBugs.filter((bug) => {
        for (let f in filters) {
            if (bug[f] !== filters[f]) return false;
        }
        return true;
    });
    renderTable();
    closeAllDropdowns();
}

function clearFilter(field) {
    delete filters[field];
    updateClearButtons();
    filteredBugs = allBugs.filter((bug) => {
        for (let f in filters) {
            if (bug[f] !== filters[f]) return false;
        }
        return true;
    });
    renderTable();
}

function updateClearButtons() {
    const fields = [
        "bugId",
        "module",
        "bugType",
        "bugDescription",
        "bugRequirement",
        "bugPriority",
        "bugStatus",
        "bugReportedBy",
    ];
    fields.forEach((field) => {
        const btn = document.getElementById(`${field}Clear`);
        btn.disabled = !filters[field];
    });
}

document.addEventListener("click", (e) => {
    if (!e.target.closest("th") && !e.target.closest(".dropdown")) {
        closeAllDropdowns();
    }
});

updateClearButtons();
fetchBugs();