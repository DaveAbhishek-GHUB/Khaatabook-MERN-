const encryptCheckbox = document.getElementById('encrypt');
const shareableCheckbox = document.getElementById('shareable');
const passwordField = document.getElementById('password');
const editPermissionCheckbox = document.getElementById('editPermission');


// Event listener for "Encrypt this file?" checkbox
encryptCheckbox.addEventListener('change', function () {
    passwordField.disabled = !this.checked; // Enable if checked, disable if unchecked
    if (!this.checked) passwordField.value = ""; // Clear the field if disabled
});

// Event listener for "Shareable file?" checkbox
shareableCheckbox.addEventListener('change', function () {
    editPermissionCheckbox.disabled = !this.checked; // Enable if checked, disable if unchecked
    if (!this.checked) editPermissionCheckbox.checked = false; // Uncheck if disabled
});