document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("setupForm");
    const bulletContainer = document.getElementById("bulletContainer");
    const addBullet = document.getElementById("addBullet");
  
    // Function to add more bullet inputs
    addBullet.addEventListener("click", () => {
      const bulletDiv = document.createElement("div");
      bulletDiv.classList.add("bullet-input");
      bulletDiv.innerHTML = `
        <input type="text" placeholder="Bullet Title" class="bullet-title" required>
        <textarea placeholder="Bullet Description" class="bullet-desc" required></textarea>
      `;
      bulletContainer.appendChild(bulletDiv);
    });
  
    // Handle form submission
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      // Get user inputs
      const name = document.getElementById("name").value;
      const profilePicture = document.getElementById("profilePicture").files[0];
      const mainVideo = document.getElementById("mainVideo").files[0];
      const bullets = Array.from(bulletContainer.querySelectorAll(".bullet-input")).map((bullet) => ({
        title: bullet.querySelector(".bullet-title").value,
        description: bullet.querySelector(".bullet-desc").value,
      }));
  
      // Upload to Pinata
      const uploadToPinata = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
          method: "POST",
          headers: {
            Authorization: `Bearer <YOUR_PINATA_JWT>`,
          },
          body: formData,
        });
        const data = await response.json();
        return `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
      };
  
      try {
        const profilePictureUrl = await uploadToPinata(profilePicture);
        const mainVideoUrl = await uploadToPinata(mainVideo);
  
        // Save data in localStorage or send to your server
        localStorage.setItem("userData", JSON.stringify({
          name,
          profilePicture: profilePictureUrl,
          mainVideo: mainVideoUrl,
          bullets,
        }));
  
        // Redirect to home.html
        window.location.href = "home.html";
      } catch (error) {
        console.error("Error uploading to Pinata:", error);
        alert("Error uploading files. Please try again.");
      }
    });
  });
  