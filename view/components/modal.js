// Get the modal and close button elements
var modal = document.getElementById('myModal');
var closeButton = document.querySelector('.close');

// Function to open the modal
function openModal() {
    modal.style.display = 'block';
}

// Function to close the modal
function closeModal() {
    modal.style.display = 'none';
}

// Event listeners to trigger the modal
// For example, you can add a click event to a button to open the modal
document.getElementById('openModalButton').addEventListener('click', openModal);

// Add an event listener to the close button to close the modal
closeButton.addEventListener('click', closeModal);

// Close the modal if the user clicks outside the modal content
window.addEventListener('click', function(event) {
    if (event.target === modal) {
        closeModal();
    }
});
