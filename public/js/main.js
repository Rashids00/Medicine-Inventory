
function deleteitem(medicid) {
    if (confirm("Are you sure you want to delete this item?")) {
        fetch('/medic/delete/' + medicid, {
            method: 'DELETE'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Not ok');
                }
                location.reload();
            })
            .catch(error => {
                console.log(error);470
            });
    }
};

document.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () {
        var successAlert = document.getElementById('success-alert');
        var errorAlert = document.getElementById('error-alert');

        if (successAlert) {
            successAlert.style.display = 'none';
        }

        if (errorAlert) {
            errorAlert.style.display = 'none';
        }
    }, 2000);
});


function confirmLogout() {
    var confirmLogout = confirm("Are you sure you want to logout?");
    if (confirmLogout) {
        window.location.href = '/user/logout';
    }
}




