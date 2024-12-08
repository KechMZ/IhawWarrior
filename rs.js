// JavaScript to show popup after form submission

// Get elements
const signupForm = document.getElementById('signupForm');
const successPopup = document.getElementById('successPopup');
const loginButton = document.getElementById('loginButton');

// Function to show the success popup
function showSuccessPopup() {
  successPopup.style.visibility = 'visible'; // Make it visible
  successPopup.style.opacity = 1; // Make it opaque
}

// Handle form submission
signupForm.addEventListener('submit', (event) => {
  event.preventDefault(); // Prevent actual form submission (for now)
  showSuccessPopup(); // Show the success popup after form submission
});

// Handle the "Log In" button click
loginButton.addEventListener('click', () => {
  successPopup.style.visibility = 'hidden'; // Hide the popup
  successPopup.style.opacity = 0; // Make it fully transparent
  window.location.href = 'login.html'; // Redirect to login page
});
