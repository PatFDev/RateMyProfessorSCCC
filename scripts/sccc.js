function getRMPRating(name, campusCell) {
    var location = "U2Nob29sLTI4ODg="
    if(campusCell.includes("E")){
        location = "U2Nob29sLTQyNDg="
    } else if(campusCell.includes("W")){
        location = "U2Nob29sLTQzMDE="
    }
    return new Promise((resolve, reject) => {
        let query = {"name": name.replace(/\s+/g, ' ').trim(), "location": location};
        chrome.runtime.sendMessage(query, res => {
            if (res && res.data && res.data.data && res.data.data.node) {
                resolve(res.data.data.node.avgRating);
            } else {
                reject('No rating found');
            }
        });
    });
}

async function addRatingToCell(row, instructorName, campusCell) {
    try {
        const rating = await getRMPRating(instructorName, campusCell);
        console.log(instructorName + " " + rating + " " + campusCell);

        const ratingCell = document.createElement('td');
        ratingCell.className = 'dddefault';
        ratingCell.textContent = (rating + "/5 ☆") || 'Not Found';

        row.appendChild(ratingCell);
    } catch (error) {
        console.error('Error fetching rating for', instructorName, ':', error);

        const errorCell = document.createElement('td');
        errorCell.className = 'dddefault';
        errorCell.textContent = 'N/A';

        row.appendChild(errorCell);
    }
}

function addRankingHeaderToSecondRow(table) {
    // First, find the <tbody> within the table
    const tbody = table.querySelector('tbody');
    if (!tbody) {
        console.error('No tbody found in the table.');
        return;
    }

    const rows = tbody.querySelectorAll('tr');
    if (rows.length < 2) {
        console.error('Less than two rows found in tbody.');
        return;
    }
    const secondRow = rows[1];

    const rankingHeader = document.createElement('th');
    rankingHeader.className = 'ddheader';
    rankingHeader.scope = 'col';
    rankingHeader.textContent = 'Ranking';

    secondRow.appendChild(rankingHeader);
}

const table = document.querySelector('.datadisplaytable');
if (table) {
    addRankingHeaderToSecondRow(table);

    table.querySelectorAll('tbody > tr').forEach((row, index) => {
        if (index > 0 && row.children[0].tagName === 'TD') {
            const campusCell = row.children.length >= 9 ? row.children[row.children.length - 9] : null;
            const instructorCell = row.children.length >= 9 ? row.children[row.children.length - 4] : null;
            if (instructorCell) {
                const instructorName = instructorCell.textContent.trim().split("(")[0];
                const campusText = campusCell.textContent.trim();
                addRatingToCell(row, instructorName.replace(/\s+/g, ' ').trim(), campusText).catch(error => {
                    console.error('Error occurred when adding rating to cell:', error);
                });
            }
        }
    });
} else {
    console.error('Table with class "datadisplaytable" not found.');
}
