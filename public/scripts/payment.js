// Function to handle Cash On Delivery (COD) process
function handleCOD() {
    document.getElementById('paymentMethod').value = 'COD';
    const formData = {
        shippingAddress: document.getElementById('adrss').value.trim(),
        contactPerson: document.getElementById('cntct').value.trim(),
        contactNumber: document.getElementById('num').value.trim(),
        paymentMethod: 'COD'
    };

    // Calculate total amount before sending the form data
    var totalAmount = getTotalPriceFromCart(); // Get total amount from the cart
    formData.totalAmount = totalAmount; // Append totalAmount to the formData object

    fetch('/capture', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        Swal.fire({
            icon: 'success',
            title: 'Order Captured Successfully!',
            text: 'Your COD order has been successfully captured.',
            showConfirmButton: false,
            timer: 1500
        }).then((result) => {
            if (result.dismiss === Swal.DismissReason.timer) {
                window.location.reload(); // Reload the window after the alert
            }
        });
        // Optionally, reset the form
        document.getElementById('checkoutForm').reset();
    })
    .catch(error => {
        console.error('An error occurred during COD processing:', error);
        Swal.fire({
            icon: 'error',
            title: 'Payment Error',
            text: 'An error occurred during payment processing. Please try again later.',
        });
    });

    // Prevent the default form submission
    return false;
}


document.addEventListener('DOMContentLoaded', (event) => {
    var modal = document.getElementById("payment-modal");
    var btn = document.getElementById("checkoutButton");
    var span = document.getElementsByClassName("closebtn")[0];

    // Function to update button state based on total amount
    function updateButtonState(totalAmount) {
        if (totalAmount > 10000) {
            btn.disabled = true;
        } else {
            btn.disabled = false;
        }
    }

    if (btn && modal && span) {
        btn.onclick = function(event) {
            event.preventDefault();
            var shippingAddress = document.getElementById('adrss').value.trim();
            var contactPerson = document.getElementById('cntct').value.trim();
            var contactNumber = document.getElementById('num').value.trim();

            if (shippingAddress === '' || contactPerson === '' || contactNumber === '') {
                Swal.fire({
                    icon: 'error',
                    title: 'Incomplete Information',
                    text: 'Please fill out all the required fields before proceeding to checkout.',
                });
            } else {
                var totalAmount = getTotalPriceFromCart();
                initializePayPalButton(totalAmount, shippingAddress, contactPerson, contactNumber);
                openPaymentModal();
            }
        }

        span.onclick = function(event) {
            event.preventDefault();
            modal.style.display = "none";
            // Do not reload here
        };

        modal.children[0].onclick = function(event) {
            event.stopPropagation();
            event.preventDefault();
        }

        // Check and update on page load
        var totalAmountOnLoad = getTotalPriceFromCart();
        updateButtonState(totalAmountOnLoad);

        // Listen for changes in total amount (if applicable)
        setInterval(function() {
            var newTotalAmount = getTotalPriceFromCart();
            updateButtonState(newTotalAmount);
        }, 1000); // Check every second for changes in total amount
    } else {
        console.error("Elements not found. Please check the IDs and class names.");
    }
});

// Function to open the payment modal
function openPaymentModal() {
    var modal = document.getElementById("payment-modal");
    modal.style.display = "flex";
}

// Function to close the payment modal
function closePaymentModal() {
    var modal = document.getElementById("payment-modal");
    modal.style.display = "none";
}

// Adjust the PayPal initialization to handle the specific route
function initializePayPalButton(totalAmount, shippingAddress, contactPerson, contactNumber) {
    paypal.Buttons({
        createOrder: function(data, actions) {
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: totalAmount.toFixed(2),
                        currency_code: 'PHP'
                    }
                }]
            });
        },
        onApprove: function(data, actions) {
            return fetch(`/capture/${data.orderID}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    shippingAddress: shippingAddress,
                    contactPerson: contactPerson,
                    contactNumber: contactNumber,
                    paymentMethod: 'PayPal'
                })
            })
            .then(response => response.json())
            .then(data => {
                Swal.fire({
                    icon: 'success',
                    title: 'Payment Successful!',
                    text: 'Your payment was processed successfully.',
                    showConfirmButton: false,
                    timer: 1500
                }).then((result) => {
                    if (result.dismiss === Swal.DismissReason.timer) {
                        window.location.reload(); // Reload the window after the alert
                    }
                });
                closePaymentModal(); // Close the payment modal if applicable
            })
            .catch(error => {
                console.error('An error occurred during PayPal checkout:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Payment Error',
                    text: 'An error occurred during payment processing. Please try again later.',
                });
            });
        }
    }).render('#paypal-button'); // Render the PayPal button into the specified container
}


// Event listener for checkout form submission
document.getElementById("checkoutForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent the default form submission
    var totalAmount = getTotalPriceFromCart();
    var shippingAddress = document.getElementById("adrss").value;
    var contactPerson = document.getElementById("cntct").value;
    var contactNumber = document.getElementById("num").value;

    console.log("Form submitted with values:");
    console.log("Total Amount:", totalAmount);
    console.log("Shipping Address:", shippingAddress);
    console.log("Contact Person:", contactPerson);
    console.log("Contact Number:", contactNumber);

    initializePayPalButton(totalAmount, shippingAddress, contactPerson, contactNumber);
    openPaymentModal();
});

// Function to retrieve the total price from the cart
function getTotalPriceFromCart() {
    var totalAmountElement = document.getElementById('total-amounthidden');
    var totalAmount = parseFloat(totalAmountElement.innerText);
    return totalAmount;
}

// Log a message indicating that the payment script has loaded
console.log("Payment script loaded.");
