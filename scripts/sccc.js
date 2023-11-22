// Function to clean up the instructor's name using a regex
function cleanInstructorName(name) {
  return name.replace(/\s+/g, ' ').trim().replace(/\b(\w)\s(\w\w+)\b/, '$2');
}

// Function to get the RMP rating based on the instructor's name and campus cell
function getRMPRating(name, campusCell) {
  const base64Locations = {
    default: "U2Nob29sLTI4ODg=",
    E: "U2Nob29sLTQyNDg=",
    W: "U2Nob29sLTQzMDE="
  };
  const location = campusCell.includes("E") ? base64Locations.E :
                   campusCell.includes("W") ? base64Locations.W :
                   base64Locations.default;
  
  return new Promise((resolve, reject) => {
    let query = {
      "name": cleanInstructorName(name),
      "location": location
    };
    chrome.runtime.sendMessage(query, response => {
      if (response?.data?.data?.node) {
        resolve(response.data.data.node.avgRating);
      } else {
        reject(new Error('No rating found'));
      }
    });
  });
}

// Function to handle errors and append an appropriate cell to the row
function handleError(row, instructorName, error) {
  console.error(`Error fetching rating for ${cleanInstructorName(instructorName)}:`, error);

  const errorCell = document.createElement('td');
  errorCell.className = 'dddefault';
  errorCell.textContent = 'N/A';

  row.appendChild(errorCell);
}

// Function to add the rating to the cell
async function addRatingToCell(row, instructorName, campusCell) {
  try {
    const rating = await getRMPRating(instructorName, campusCell);
    console.log(`${instructorName} ${rating} ${campusCell}`);

    const ratingCell = document.createElement('td');
    ratingCell.className = 'dddefault';
    ratingCell.textContent = `${rating}/5 ☆` || 'Not Found';

    row.appendChild(ratingCell);
  } catch (error) {
    handleError(row, instructorName, error);
  }
}

// Function to add a Ranking header to the second row of the table
function addRankingHeaderToSecondRow(tbody) {
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

// Main logic to add rankings to the table
function addRankingsToTable() {
  const table = document.querySelector('.datadisplaytable');
  if (!table) {
    console.error('Table with class "datadisplaytable" not found.');
    return;
  }

  const tbody = table.querySelector('tbody');
  if (!tbody) {
    console.error('No tbody found in the table.');
    return;
  }

  addRankingHeaderToSecondRow(tbody);

  tbody.querySelectorAll('tr').forEach((row, index) => {
    if (index > 0 && row.children[0].tagName === 'TD') {
      const campusCell = row.children.length >= 9 ? row.children[row.children.length - 9] : null;
      const instructorCell = row.children.length >= 9 ? row.children[row.children.length - 4] : null;
      if (instructorCell && campusCell) {
        const instructorName = instructorCell.textContent.trim().split("(")[0];
        const campusText = campusCell.textContent.trim();
        addRatingToCell(row, instructorName, campusText).catch(error => {
          console.error('Error occurred when adding rating to cell:', error);
        });
      }
    }
  });
}

// Invoke the main function to add rankings to the table
addRankingsToTable();
