let currentPage = 1;

function fetchMovies(page = 1) {
  fetch(`https://filmwharf.pythonanywhere.com/api?page=${page}`)
    .then((response) => response.json())
    .then((data) => {
      const movieCardContainer = document.getElementById("movieCard");

      data.results.forEach((movie) => {
        const movieCard = document.createElement("div");
        movieCard.className = "card mb-3";

        movieCard.innerHTML = `
                            <div class="card-body d-flex">
                                <img src="${movie.thumbnail_url}" alt="Movie Thumbnail">
                                <div class="ps-1">
                                    <h5 class="card-title">${movie.name}</h5>
                                    <h6 class="card-title">Source: ${movie.source}</h6>
                                    <h6 class="card-title">Upload Date: ${movie.release_date}</h6>
                                    <a href="${movie.download_link}" class="btn btn-success">Download</a>
                                </div>
                            </div>
                        `;
        movieCardContainer.appendChild(movieCard);
      });
    })
    .catch((error) => {
      console.error("Error fetching movie data:", error);
    });
}

function isScrollAtBottom() {
  const scrollTop =
    document.documentElement.scrollTop || document.body.scrollTop;
  const scrollHeight =
    document.documentElement.scrollHeight || document.body.scrollHeight;
  const clientHeight =
    document.documentElement.clientHeight || window.innerHeight;
  return scrollTop + clientHeight >= scrollHeight - 100; // Adjust the threshold as needed
}

function loadMoreMovies() {
  if (isScrollAtBottom()) {
    currentPage++;
    fetchMovies(currentPage);
  }
}

// Initial fetch
fetchMovies();

// Attach scroll event listener
window.addEventListener("scroll", loadMoreMovies);

function searchMovies() {
  const query = document.getElementById("searchQuery").value;

  // Make AJAX request to your search API endpoint
  fetch(`https://filmwharf.pythonanywhere.com/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  })
    .then((response) => response.json())
    .then((data) => {
      // Redirect to result.html with the search results
      const queryString = `?query=${encodeURIComponent(query)}`;
      window.location.href = `result.html${queryString}`;
    })
    .catch((error) => {
      console.error("Error fetching search results:", error);
    });
}

        document.addEventListener("DOMContentLoaded", function () {
          const searchQuery = new URLSearchParams(window.location.search).get(
            "query"
          );
          const searchQuerySpan = document.getElementById("searchQuerySpan");
          const searchResultsContainer = document.getElementById(
            "searchResultsContainer"
          );

          if (searchQuery) {
            searchQuerySpan.textContent = searchQuery;

            fetch(`https://filmwharf.pythonanywhere.com/search`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ query: searchQuery }),
            })
              .then((response) => response.json())
              .then((data) => {
                if (Array.isArray(data)) {
                  if (data.length > 0) {
                    searchResultsContainer.innerHTML = "";
                    data.forEach((movie) => {
                      const card = `
                                <div class="card-body d-flex">
                                    <img src="${movie.thumbnail_url}" alt="Movie Thumbnail">
                                    <div class="ps-1">
                                        <h5 class="card-title">${movie.name}</h5>
                                        <h6 class="card-title">Source ${movie.source}</h6>
                                        <h6 class="card-title">Release Date: ${movie.release_date}</h6>
                                        <a href="${movie.download_link}" class="btn btn-success">Download page</a>
                                    </div>
                                </div>
                            `;
                      searchResultsContainer.innerHTML += card;
                    });
                  } else {
                    searchResultsContainer.innerHTML =
                      "<p>No results found.</p>";
                  }
                } else {
                  console.error("Invalid response format:", data);
                }
              })
              .catch((error) => {
                console.error("Error fetching search results:", error);
              });
          }
        });

    document
      .getElementById("movieForm")
      .addEventListener("submit", function (event) {
        event.preventDefault();

        // Collect form data
        const formData = new FormData(event.target);

        // Convert form data to a plain object
        const formDataObject = {};
        formData.forEach((value, key) => {
          formDataObject[key] = value;
        });

        // Manually format the date to 'YYYY-MM-DD'
        const releaseDateInput = formDataObject["release_date"];
        const releaseDate = new Date(releaseDateInput);

        // Check if the date is valid
        if (!isNaN(releaseDate.getTime())) {
          const formattedDate = releaseDate.toLocaleDateString("en-CA"); // 'en-CA' is the locale for 'YYYY-MM-DD' format
          formDataObject["release_date"] = formattedDate;

          // Send data to the Django REST API
          fetch("https://filmwharf.pythonanywhere.com/api", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(formDataObject),
          })
            .then((response) => {
              if (response.ok) {
                return response.json();
              }
              throw new Error("Network response was not ok.");
            })
            .then((data) => {
              console.log("Success:", data);
              // Handle success (e.g., show a success message)

              // Create and insert success alert
              const successAlert = document.createElement("div");
              successAlert.className = "alert alert-success mt-3";
              successAlert.setAttribute("role", "alert");
              successAlert.innerText = "You have successfully added a movie";

              const formContainer = document.querySelector(".container");
              formContainer.insertBefore(
                successAlert,
                document.getElementById("movieForm").nextSibling
              );

              // Refresh the page after successful POST
              window.location.reload();
            })
            .catch((error) => {
              console.error("Error:", error);
              // Handle error (e.g., show an error message)
            });
        } else {
          console.error("Invalid date format");
          // Handle the error as needed (e.g., display an error message to the user)
        }
      });