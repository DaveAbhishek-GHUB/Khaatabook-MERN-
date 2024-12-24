// Function to toggle between view and edit mode
    function toggleEditMode() {
        const editForm = document.getElementById('editForm');
        const viewContent = document.getElementById('viewContent');
  
        // Toggle visibility of the edit form and content view
        if (editForm.style.display === 'none') {
          editForm.style.display = 'block';
          viewContent.style.display = 'none';
        } else {
          editForm.style.display = 'none';
          viewContent.style.display = 'block';
        }
      }