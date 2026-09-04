const supabaseUrl = "https://bdeuobskwnoalkrnudkr.supabase.co";
const supabaseKey = "sb_publishable_4sYBnD-eYaYnGdhy4SwheQ_uTlMzhN9";

const supabaseClient = supabase.createClient(
    supabaseUrl,
    supabaseKey
);

const contactForm = document.getElementById("contact-form");

const appointmentDate = document.getElementById("appointment-date");

const today = new Date().toISOString().split("T")[0];

appointmentDate.setAttribute("min", today);
const appointmentTime = document.getElementById("appointment-time");

function updateMinimumTime() {

    const selectedDate = appointmentDate.value;

    const now = new Date();

    const currentDate = now.toISOString().split("T")[0];

    if (selectedDate === currentDate) {

        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");

        appointmentTime.min = `${hours}:${minutes}`;

    } else {

        appointmentTime.min = "09:00";

    }

}

appointmentDate.addEventListener("change", updateMinimumTime);

contactForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const style = document.getElementById("selected-style").value;
    const appointmentDate = document.getElementById("appointment-date").value;
    const appointmentTime = document.getElementById("appointment-time").value;
    const message = document.getElementById("message").value;

    const { data, error } = await supabaseClient
        .from("bookings")
        .insert([
            {
                name: name,
                email: email,
                style: style,
                appointment_date: appointmentDate,
                appointment_time: appointmentTime,
                message: message
            }
        ]);

    if (error) {
    console.error("Booking error:", error);

    alert(
        "We couldn't send your booking right now. " +
        "Please check your internet connection and try again."
    );

    return;
}

    const bookingSuccess = document.getElementById("booking-success");

    bookingSuccess.style.display = "block";

    contactForm.reset();

});

const styleButtons = document.querySelectorAll(".style-button");
const styleSelect = document.getElementById("selected-style");

styleButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        const selectedStyle = button
            .closest(".style-card")
            .querySelector("h3")
            .textContent;

        styleSelect.value = selectedStyle;

    });

});

const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

menuToggle.addEventListener("click", function() {

    navLinks.classList.toggle("active");

    if (navLinks.classList.contains("active")) {
        menuToggle.textContent = "✕";
    } else {
        menuToggle.textContent = "☰";
    }

});
