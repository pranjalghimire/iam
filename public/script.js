document.addEventListener("DOMContentLoaded", () => {
  const bodyContainer = document.querySelector(".body"); // Select the main body container

  const dynamicContent = {
    overview: {
      title: "Overview",
      sections: [
        {
          header: "Welcome to the Overview Section",
          subSections: ["Introduction", "Summary", "Highlights", "About Us"],
        },
      ],
    },
    academia: {
      title: "Master of Science",
      sections: [
        {
          header: "University of Texas at Dallas",
          subSections: [
            "Relevant Classes",
            "Projects",
            "Employment",
            "Extracurriculars",
          ],
        },
      ],
    },
    corporate: {
      title: "Dell Alienware",
      sections: [
        {
          header: "Software Developer 1",
          subSections: [
            "Project/Type of Work",
            "Technology Used",
            "Learning Experience",
            "Value Added",
          ],
        },
      ],
    },
    freelance: {
      title: "Freelance Work",
      sections: [
        {
          header: "Freelance Projects",
          subSections: [
            "Website Development",
            "Mobile App Design",
            "Consulting",
            "Other Projects",
          ],
        },
      ],
    },
  };

  function renderContent(tabName) {
    if (tabName === "overview") {
      // Render the original default content for Overview
      bodyContainer.innerHTML = `
        <div class="tab-container">
          <button class="tab-button active" data-tab="overview">Overview</button>
          <button class="tab-button" data-tab="academia">Academia</button>
          <button class="tab-button" data-tab="corporate">Corporate</button>
          <button class="tab-button" data-tab="freelance">Freelance</button>
        </div>
        <div class="video-section">
          <div class="video-container"></div>
          <div class="bullet-points-section">
            <h2 class="fancy-text">i am...</h2>
            <div class="bullet-row">
              <div class="bullet-point">
                <h3>B.S @ Texas Tech University</h3>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
              </div>
              <div class="bullet-point">
                <h3>Director @ MLH TTU</h3>
                <p>Proin et urna eget lorem convallis posuere.</p>
              </div>
              <div class="bullet-point">
                <h3>Creative Thinker</h3>
                <p>Mauris id libero tincidunt, volutpat lorem vel, volutpat velit.</p>
              </div>
            </div>
            <div class="bullet-row">
              <div class="bullet-point">
                <h3>Problem Solver</h3>
                <p>Vestibulum ante ipsum primis in faucibus orci luctus et ultrices.</p>
              </div>
              <div class="bullet-point">
                <h3>Future Leader</h3>
                <p>Etiam nec ligula non nunc vulputate cursus non id sapien.</p>
              </div>
              <div class="bullet-point">
                <h3>Passionate Innovator</h3>
                <p>Curabitur ut lorem id sem condimentum hendrerit.</p>
              </div>
            </div>
          </div>
        </div>
        <h3 class="section-heading">Newest Channel Name Videos!</h3>
        <div class="videos-section">
          <div class="video-thumbnail"></div>
          <div class="video-thumbnail"></div>
          <div class="video-thumbnail"></div>
          <div class="video-thumbnail"></div>
        </div>
      `;
      return;
    }

    // Render dynamic content for other tabs
    const content = dynamicContent[tabName];
    if (!content) return;

    bodyContainer.innerHTML = `
      <div class="tab-container">
        <button class="tab-button" data-tab="overview">Overview</button>
        <button class="tab-button" data-tab="academia">Academia</button>
        <button class="tab-button" data-tab="corporate">Corporate</button>
        <button class="tab-button" data-tab="freelance">Freelance</button>
      </div>
      <h2>${content.title}</h2>
      ${content.sections
        .map(
          (section) => `
        <div class="section">
          <h3>${section.header}</h3>
          ${section.subSections
            .map(
              (subSection) => `
            <div>
              <h4>${subSection}</h4>
              <div class="videos-section">
                ${Array(4)
                  .fill(null)
                  .map(
                    () => `
                  <div class="video-thumbnail">
                    <div>Video Title</div>
                  </div>
                `
                  )
                  .join("")}
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      `
        )
        .join("")}
    `;
  }

  const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    // Clear user session by deleting cookies
    document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    alert("You have been logged out!");

    // Redirect to the login page
    window.location.href = "login.html";
  });
}
  // Event delegation to handle clicks on dynamically rendered buttons
  document.body.addEventListener("click", (e) => {
    if (e.target.classList.contains("tab-button")) {
      const tabName = e.target.getAttribute("data-tab");
      renderContent(tabName);

      // Highlight active tab
      const allTabs = document.querySelectorAll(".tab-button");
      allTabs.forEach((tab) => tab.classList.remove("active"));
      e.target.classList.add("active");
    }
  });

  // Render the default content for "Overview" when the page loads
  renderContent("overview");
});