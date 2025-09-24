// modals in the dashboard
{
  document.addEventListener("DOMContentLoaded", function () {
    const editBtns = document.querySelectorAll(".edit-user-btn");
    const modal = document.getElementById("update-user-modal");
    const modalContent = document.getElementById("update-user-form-container");
    const closeModal = document.getElementById("close-update-user-modal");
    if (editBtns && modal && modalContent && closeModal) {
      editBtns.forEach(function (btn) {
        btn.addEventListener("click", function () {
          const userId = btn.getAttribute("data-user-id");
          const agent = btn.getAttribute("data-user-agent");
          fetch(`/update-user/${userId}?agent=${agent}`)
            .then((res) => res.text())
            .then((html) => {
              modalContent.innerHTML = html;
              modal.style.display = "block";
            });
        });
      });
      closeModal.onclick = function () {
        modal.style.display = "none";
        modalContent.innerHTML = "";
      };
      window.onclick = function (event) {
        if (event.target == modal) {
          modal.style.display = "none";
          modalContent.innerHTML = "";
        }
      };
    }
  });

  document.addEventListener("DOMContentLoaded", function () {
    const updateBtn = document.getElementById("register-button");
    const modal = document.getElementById("update-user-modal");
    const modalContent = document.getElementById("update-user-form-container");
    const closeModal = document.getElementById("close-update-user-modal");
    if (updateBtn && modal && modalContent && closeModal) {
      updateBtn.addEventListener("click", function () {
        const userId = updateBtn.getAttribute("data-user-id");
        const agent = updateBtn.getAttribute("data-user-agent");
        fetch(`/update-user/${userId}?agent=${agent}`)
          .then((res) => res.text())
          .then((html) => {
            // Extract the form from the returned HTML (if needed) // For now, inject the whole HTML
            modalContent.innerHTML = html;
            modal.style.display = "block";
          });
      });
      closeModal.onclick = function () {
        modal.style.display = "none";
        modalContent.innerHTML = "";
      };
      window.onclick = function (event) {
        if (event.target == modal) {
          modal.style.display = "none";
          modalContent.innerHTML = "";
        }
      };
    }
  });
}
// function flatpickr("#date-input", {});
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

// access denied page navigation
{
  const home = document.getElementById("go-home");
  const back = document.getElementById("go-back");
  if (home) {
    home.addEventListener("click", function () {
      window.location.href = "/";
    });
  }
  if (back) {
    back.addEventListener("click", function () {
      window.history.back();
    });
  }
}

// Java script code to handle unit fetching
// {
//   Handlebars.registerHelper("ifCond", function (v1, v2, options) {
//     if (v1 === v2) {
//       return options.fn(this);
//     }
//     return options.inverse(this);
//   });
// }

// Notification requested
{
  navigator.serviceWorker
    .register("sw.js")
    .then((registration) => {
      Notification.requestPermission((permission) => {
        if (permission === "granted") {
          registration.pushManager
            .subscribe({
              userVisibleOnly: true,
              applicationServerKey:
                // urlBase64ToUint8Array(
                "BMvAEz6fHQAe9VpgxhCobnIjc1mNmFiMs7Pv2VfAgOqO2IqQHB-ASqu05541xcHdJQ9VgMh2OzlfFwxu8WUU5kY",
              // ),
            })
            .then((subscription) => {
              // Send the subscription object to your server
              fetch("/subscribe", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(subscription),
              });
            })
            .catch((error) => {
              console.error("Error subscribing to push notifications:", error);
            });
        } else {
          console.log("Notification permission denied");
        }
      });
    })
    .catch((error) => {
      console.error("Error registering service worker:", error);
    });
}

// update user
{
  // Get the update user button
  // var updateBtn = document.getElementById("update-user");
  // function updateUser(userId) {
  const btn = document.getElementById("register-button");
  if (btn) {
    const userId = btn.getAttribute("data-user-id");
    const agent = btn.getAttribute("data-user-agent");
    btn.addEventListener("click", function () {
      window.location.href = `/register?userId=${userId}?agent=${agent}`;
      // Replace 'register.html' with your actual register page URL
    });
  }
}

//create activity modal
{
  // Get the modal
  var modal = document.getElementById("activity-modal");

  // Get the button that opens the modal
  var btns = document.querySelectorAll("#add-activity-btn");

  // Get the <span> element that closes the modal
  var span = document.querySelectorAll(".close");

  // When the user clicks the button, open the modal
  btns.forEach((btn) => {
    btn.onclick = function () {
      modal.style.display = "block";
      const activityType = btn.getAttribute("data-activity-type");
      const userId = btn.getAttribute("data-user-id");
      const agent = btn.getAttribute("data-user-agent");
      const phone = btn.getAttribute("phone-number");
      const location = {};
      if (activityType == "Attendance") {
        navigator.geolocation.getCurrentPosition((position) => {
          location.latitude = position.coords.latitude;
          location.longitude = position.coords.longitude;
        });
      }
      if (phone) {
        const callLink = `tel:${phone}`;
        window.location.href = callLink;
      }

      document.getElementById("activity-form").onsubmit = function (event) {
        event.preventDefault();
        var response = document.getElementById("response").value;

        fetch(
          `/create-activity/${userId}/${activityType}?agent=${agent}&location=${location}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ response: response }),
          }
        )
          .then((response) => response.json())
          .then((data) => {
            console.log(data);
            modal.style.display = "none";
            window.location.reload(true);
          })
          .catch((error) => {
            console.error("Error:", error);
            modal.style.display = "none";
            window.location.reload(true);
          });
      };
    };
  });

  if (span) {
    // When the user clicks on <span> (x), close the modal
    span.forEach((sp) => {
      sp.onclick = function () {
        modal.style.display = "none";
      };
    });
  }

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
}

{
  // Pop-up flash message close and auto-hide

  var popups = document.querySelectorAll(".popup-message");
  var btns = document.querySelector(".popup-close");

  if (btns) {
    btns.addEventListener("click", function () {
      popups.forEach((popup) => {
        if (popup) popup.style.display = "none";
      });
    });
  }

  window.addEventListener("DOMContentLoaded", function () {
    setTimeout(function () {
      const s = document.getElementById("popup-success");
      if (s) s.style.display = "none";
      const e = document.getElementById("popup-error");
      if (e) e.style.display = "none";
    }, 4000);
    // const s = document.getElementById("popup-success");
    // s.onclick = function () {
    //   s.style.display = "none";
    // };
    // const e = document.getElementById("popup-error");
    // e.onclick = function () {
    //   e.style.display = "none";
    // };
  });
}

{
  const userModal = document.getElementById("userModal");
  const excelModal = document.getElementById("excelModal");
  const users = document.querySelectorAll(".user-item");
  const excelBtn = document.getElementById("excel-upload-btn");
  const closeExcel = document.getElementById("close-excel");

  // Function to open the Excel upload modal
  if (excelBtn) {
    excelBtn.addEventListener("click", function () {
      excelModal.style.display = "block";
    });
  }

  // Function to close the Excel upload modal
  if (closeExcel) {
    closeExcel.addEventListener("click", function () {
      excelModal.style.display = "none";
    });
  }
  // function closeExcelModal() {
  //   excelModal.style.display = "none";
  // }

  // Function to open the user action modal and fetch data

  const openUser = document.getElementById("open-user");
  if (users) {
    users.forEach((user) => {
      user.onclick = async function async() {
        // const userD = user.getAttribute("data-user");
        // // await showUserActions(userId);
        // // Populate the modal with user information and actions
        // const modalBody = document.getElementById("modal-body-content");
        // modalBody.innerHTML = `
        //             <h3>${userD.NAME}</h3>
        //             <p><strong>Phone:</strong> ${userD.PHONENUMBER}</p>
        //             <p><strong>Email:</strong> ${userD.EMAIL}</p>
        //             <p><strong>Unit:</strong> ${userD.UNIT}</p>
        //         `;
        openUser.style.display = "block";
      };
    });
  }

  // async function showUserActions(userId) {
  //   try {
  //     // Fetch user data from the new API endpoint
  //     const response = await fetch(`/api/users/${userId}`);
  //     if (!response.ok) {
  //       throw new Error("User not found.");
  //     }
  //     const user = await response.json();

  //     // Populate the modal with user information and actions
  //     const modalBody = document.getElementById("modal-body-content");
  //     modalBody.innerHTML = `
  //                   <h3>${user.NAME}</h3>
  //                   <p><strong>Phone:</strong> ${user.PHONENUMBER}</p>
  //                   <p><strong>Email:</strong> ${user.EMAIL}</p>
  //                   <p><strong>Unit:</strong> ${user.UNIT}</p>
  //                   <hr>
  //                   <h4>Possible Actions:</h4>
  //                   <button id="see-logs" class="btn btn-info" data-user-id="${user.id}">View Activity</button>
  //                   <button
  //                 class="btn btn-primary activity-btn"
  //                 id="add-activity-btn"
  //                 data-user-id="${user.id}"
  //                 data-activity-type="call"
  //               >Call</button>
  //               <button
  //                 class="btn btn-primary activity-btn"
  //                 id="add-activity-btn"
  //                 data-user-id="${user.id}"
  //                 data-activity-type="pray"
  //               >Pray</button>

  //               `;
  //     userModal.style.display = "block";
  //   } catch (error) {
  //     console.error(error);
  //     alert("An error occurred while fetching user data.");
  //   }
  // }
  // Function to close the user action modal
  function closeUserModal() {
    userModal.style.display = "none";
  }

  // Function to log activity and show activities as input fields
  const log = document.getElementById("see-logs");
  if (log) {
    const userId = log.getAttribute("data-user-id");
    const agent = log.getAttribute("data-user-agent");
    log.addEventListener("click", async function () {
      await logActivity(userId, agent);
    });
  }
  async function logActivity(userId, agent) {
    alert(`Log activity for user ID: ${userId}`);
    try {
      const response = await fetch(
        `/activities/users/${userId}?agent=${agent}`
      );
      if (!response.ok) {
        throw new Error("User not found.");
      }
      const { activities } = await response.json();
      const modalBody = document.getElementById("modal-activity-content");
      if (activities && activities.length > 0) {
        console.log("Activities array:", activities);
        let activityInputs = '<div class="profile-section">';
        activityInputs += "<h2>My Activities</h2>";
        activityInputs += '<form id="activityForm">';
        activities.forEach((activity, idx) => {
          console.log(`Activity #${idx}:`, activity);
          console.log("Keys:", Object.keys(activity));
          activityInputs += `
                        <div class="activity-input-group">
                            <label>Activity Type</label>
                            <input type="text" name="activityType${idx}" value="${
            activity.ACTIVITYTYPE || ""
          }" />
                            <label>Date</label>
                            <input type="date" name="activityDate${idx}" value="${
            activity.DATE || ""
          }" />
                            <label>Time</label>
                            <input type="time" name="activityTime${idx}" value="${
            activity.TIME || ""
          }" />
                            <label>Response</label>
                            <input type="text" name="activityResponse${idx}" value="${
            activity.RESPONSE || ""
          }" />
                        </div>
                        <hr />`;
        });
        activityInputs += "</form></div>";
        modalBody.innerHTML = activityInputs;
      } else {
        modalBody.innerHTML = `<div class="profile-section"><h2>My Activities</h2><p>You have no recorded activities yet.</p></div>`;
      }
      userModal.style.display = "block";
    } catch (error) {
      console.error(error);
      alert("An error occurred while fetching user data.");
    }
  }

  function sendFollowUp(userId) {
    alert(`Sending follow up to user ID: ${userId}`);
    // Here you would implement logic for sending a message or notification
  }

  // Close modals when the user clicks outside of them
  const modals = document.querySelectorAll(".modal");

  window.onclick = function (event) {
    // if (event.target == userModal) {
    //   closeUserModal();
    // } else if (event.target == excelModal) {
    //   closeExcelModal();
    // } else {

    // }
    if (modals) {
      modals.forEach((modal) => {
        if (event.target == modal) {
          modal.style.display = "none";
        }
      });
    }
  };
}

{
  window.addEventListener("DOMContentLoaded", function () {
    // Select the existing dark mode toggle button by id 'toggle'
    const btn = document.getElementById("toggle");
    if (btn) {
      btn.addEventListener("click", function () {
        document.body.classList.toggle("dark-mode");
        if (document.body.classList.contains("dark-mode")) {
          localStorage.setItem("darkMode", "1");
        } else {
          localStorage.removeItem("darkMode");
        }
      });
    }
    // Restore dark mode preference
    if (localStorage.getItem("darkMode")) {
      document.body.classList.add("dark-mode");
    }
  });
}
