function addRatingColumn() {
    var table = document.getElementById("table1");
    if (!table) {
        console.log("Table 'table1' does not exist on this page.");
        return;
    }

    // Check if the Rating column already exists
    var headerRow = table.getElementsByTagName("thead")[0].getElementsByTagName("tr")[0];
    if (Array.from(headerRow.cells).some(cell => cell.innerText === "Rating")) {
        console.log("Rating column already exists.");
        return;
    }

    // Add a new header for the Rating column
    var newHeader = document.createElement("th");
    newHeader.innerHTML = "<div class='title' style='width: auto;'>Rating</div>"; // Matching the style of other headers
    headerRow.appendChild(newHeader);

    // Iterate over each row in the table body and add the new cell
    var rows = table.getElementsByTagName("tbody")[0].getElementsByTagName("tr");
    for (var i = 0; i < rows.length; i++) {
        var newRowCell = rows[i].insertCell(-1);
        newRowCell.innerHTML = "<div style='width: auto;'>5/5</div>"; // Inserting the rating in a div to match other cells
    }
    
}

function observeDOMChanges() {
    var observer = new MutationObserver(function(mutations) {
        addRatingColumn();
    });

    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Run the script after the DOM is fully loaded, or observe for changes
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", observeDOMChanges);
} else {
    observeDOMChanges();
}
