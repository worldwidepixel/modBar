document.getElementById("searchBar").addEventListener("keyup", function (event) {
  event.preventDefault();
  if (event.keyCode === 13) {
    document.getElementById("searchButton").click();
  }
});

var searchButton = document.getElementById('searchButton');

searchButton.onclick = function () {
  search();
}

function search() {
  // define query
  var searchBar = document.getElementById("searchBar");
  var query = searchBar.value;

  // Define the API URL
  const modrinthApi = 'https://api.modrinth.com';
  let headers = new Headers({
    "User-Agent": "worldwidepixel/modBar (worldwidepixel.ca) (@worldwidepixel on discord)"
  });

  // Make a GET request
  fetch(`${modrinthApi}/v2/search?query="${query}"`, { headers: headers })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      // Handle the API response and create result elements
      displayResults(data.hits);
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

function displayResults(results) {
  const resultContainer = document.getElementById('resultContainer');

  // Clear previous content
  resultContainer.innerHTML = '';

  results.forEach(result => {
    const resultElement = document.createElement('div');
    resultElement.classList.add('result');
    resultElement.setAttribute("data-project-id", `${result.project_id}`);

    // Customize this part based on your API response structure
    resultElement.innerHTML = `
      <img class="projectIcon" src="${result.icon_url}">
      <div class="informationContainer">
        <span class="projectTitle" id="projectTitle">${result.title}</span>
        <span class="projectAuthor" id="projectAuthor">by ${result.author}</span>
        <span class="projectDownloads" id="projectDownloads">${result.downloads} downloads</span>
        <span class="projectId" id="projectId">${result.project_id}</span>
      </div>
      <div class="buttonColumn">
        <button class="projectButton" id="downloadLatest">download latest</button>
        <a href="https://modrinth.com/project/${result.slug}" target="_blank"> <button class="projectButton">see on modrinth</button> </a>
      </div>
    `;

    resultContainer.appendChild(resultElement);
    afterSearch();
  });
}

function afterSearch() {

  // Assuming resultContainer is the parent element containing all result elements
  var resultContainer = document.getElementById('resultContainer');

  // Add a click event listener to resultContainer
  resultContainer.addEventListener('click', function (event) {
    // Check if the clicked element is a "Download Latest" button
    if (event.target.classList.contains('projectButton') && event.target.textContent.trim() === 'download latest') {
      // Traverse the DOM to find the relevant project information
      var projectElement = event.target.closest('.result');

      if (projectElement) {
        // Get the project ID from the project element
        var projectId = projectElement.getAttribute('data-project-id');

        // Call the getLatestDownload function with the project ID
        getLatestDownload(projectId);
      }
    }
  });

}

let isFetchingData = false;

function getLatestDownload(projectId) {
  // Check if the function is already executing
  if (isFetchingData) {
    console.log('Function is already executing. Skipping...');
    return;
  }

  // Set the flag to indicate that the function is now executing
  isFetchingData = true;

  const modrinthApi = 'https://api.modrinth.com';

  let headers = new Headers({
    "User-Agent": "worldwidepixel/modBar (worldwidepixel.ca) (@worldwidepixel on discord)"
  });

  fetch(`${modrinthApi}/v2/project/${projectId}/version`, { headers: headers })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Network response was not ok for project ID: ${projectId}`);
      }
      return response.json();
    })
    .then(data => {
      // Extract specific data from the first block of data
      if (data.length > 0) {
        const firstVersion = data[0];
        const downloadUrl = firstVersion.files[0].url;

        console.log(`Download URL: ${downloadUrl}`);
        window.open(`${downloadUrl}`);
      } else {
        console.log('No version data found.');
      }
    })
    .catch(error => {
      console.error('Error:', error);
    })
    .finally(() => {
      // Reset the flag when the function completes, allowing it to run again
      isFetchingData = false;
    });
}
