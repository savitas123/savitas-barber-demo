const supabaseUrl = "https://bdeuobskwnoalkrnudkr.supabase.co";
const supabaseKey = "sb_publishable_4sYBnD-eYaYnGdhy4SwheQ_uTlMzhN9";

const supabaseClient = supabase.createClient(
    supabaseUrl,
    supabaseKey
);


const loginForm = document.getElementById("login-form");
const loginSection = document.getElementById("login-section");
const appointmentsSection = document.getElementById("appointments-section");
const loginError = document.getElementById("login-error");
const logoutButton = document.getElementById("logout-button");
const appointmentsContainer = document.getElementById(
    "appointments-container"
);

const filterButtons =
    document.querySelectorAll(".filter-button");

let currentFilter = "all";


filterButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        currentFilter = button.dataset.status;

        filterButtons.forEach(function(filterButton) {
            filterButton.classList.remove("active");
        });

        button.classList.add("active");

        loadAppointments();

    });

});


loginForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const email =
        document.getElementById("admin-email").value;

    const password =
        document.getElementById("admin-password").value;

    loginError.textContent = "";

    const { data, error } =
        await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

    if (error) {

        console.error("Login error:", error);

        if (
            error.message &&
            (
                error.message.toLowerCase().includes("fetch") ||
                error.message.toLowerCase().includes("network") ||
                error.message.toLowerCase().includes("failed")
            )
        ) {

            loginError.textContent =
                "Unable to connect. Please check your internet connection and try again.";

        } else {

            loginError.textContent =
                "Login failed. Please check your email and password.";

        }

        return;
    }

    console.log("Admin logged in:", data.user);

    loginSection.style.display = "none";
    appointmentsSection.style.display = "block";

    loadAppointments();

});


async function loadAppointments() {

    appointmentsContainer.innerHTML =
        "<p>Loading appointments...</p>";

    let { data, error } = await supabaseClient
        .from("bookings")
        .select("*")
        .order("appointment_date", { ascending: true });


    if (error) {

        console.error("Error loading appointments:", error);

        appointmentsContainer.innerHTML =
            "<p>Unable to load appointments. Please check your internet connection and try again.</p>";

        return;
    }


    console.log("Appointments:", data);


    if (currentFilter !== "all") {

        data = data.filter(function(booking) {
            return booking.status === currentFilter;
        });

    }


    if (data.length === 0) {

        appointmentsContainer.innerHTML =
            "<p>No appointments yet.</p>";

        return;
    }


    appointmentsContainer.innerHTML = "";


    data.forEach(function(booking) {

        const appointment =
            document.createElement("div");

        appointment.className =
            "appointment-card";


        appointment.innerHTML = `
            <h3>${booking.name}</h3>

            <p>Email: ${booking.email}</p>

            <p>Style: ${booking.style}</p>

            <p>Date: ${booking.appointment_date}</p>

            <p>Time: ${booking.appointment_time}</p>

            <p>Message: ${booking.message || "No message"}</p>

            <p>
                Status:
                <span class="status-badge ${booking.status}">
                    ${booking.status}
                </span>
            </p>

            <div class="appointment-actions">

                ${
                    booking.status === "pending"
                        ? `
                            <button class="confirm-button">
                                Confirm
                            </button>

                            <button class="cancel-button">
                                Cancel
                            </button>
                        `
                        : `
                            <span class="current-status">
                                ${
                                    booking.status === "confirmed"
                                        ? "Confirmed ✓"
                                        : "Cancelled"
                                }
                            </span>
                        `
                }

            </div>
        `;


        appointmentsContainer.appendChild(
            appointment
        );


        const confirmButton =
            appointment.querySelector(".confirm-button");

        const cancelButton =
            appointment.querySelector(".cancel-button");


        if (confirmButton) {

            confirmButton.addEventListener(
                "click",
                async function() {

                    const { error } =
                        await supabaseClient
                            .from("bookings")
                            .update({
                                status: "confirmed"
                            })
                            .eq("id", booking.id);


                    if (error) {

                        console.error(
                            "Confirm error:",
                            error
                        );

                        alert(
                            "Unable to confirm this booking. " +
                            "Please check your internet connection and try again."
                        );

                        return;
                    }


                    loadAppointments();

                }
            );

        }


        if (cancelButton) {

            cancelButton.addEventListener(
                "click",
                async function() {

                    const { error } =
                        await supabaseClient
                            .from("bookings")
                            .update({
                                status: "cancelled"
                            })
                            .eq("id", booking.id);


                    if (error) {

                        console.error(
                            "Cancel error:",
                            error
                        );

                        alert(
                            "Unable to cancel this booking. " +
                            "Please check your internet connection and try again."
                        );

                        return;
                    }


                    loadAppointments();

                }
            );

        }

    });

}


logoutButton.addEventListener(
    "click",
    async function() {

        await supabaseClient.auth.signOut();

        appointmentsSection.style.display = "none";
        loginSection.style.display = "block";

    }
);


async function checkSession() {

    const { data: { session } } =
        await supabaseClient.auth.getSession();


    if (session) {

        loginSection.style.display = "none";
        appointmentsSection.style.display = "block";

        loadAppointments();

    }

}


checkSession();
