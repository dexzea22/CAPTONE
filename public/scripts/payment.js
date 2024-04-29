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

    // Append totalAmount to the formData object
    formData.totalAmount = totalAmount;

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
    // Get the modal
    var modal = document.getElementById("payment-modal");

    // Get the button that opens the modal
    var btn = document.getElementById("checkoutButton");

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("closebtn")[0];

    if (btn && modal && span) {
        // When the user clicks the button, open the modal 
        btn.onclick = function(event) {
            event.preventDefault(); // Prevent any default button action

            // Get the values of the input boxes
            var shippingAddress = document.getElementById('adrss').value.trim();
            var contactPerson = document.getElementById('cntct').value.trim();
            var contactNumber = document.getElementById('num').value.trim();

            // Check if any of the input boxes are empty
            if (shippingAddress === '' || contactPerson === '' || contactNumber === '') {
                // If any input box is empty, show an error message
                Swal.fire({
                    icon: 'error',
                    title: 'Incomplete Information',
                    text: 'Please fill out all the required fields before proceeding to checkout.',
                });
            } else {
                // If all input boxes are filled, proceed to checkout
                var totalAmount = getTotalPriceFromCart();
                initializePayPalButton(totalAmount, shippingAddress, contactPerson, contactNumber); // Pass shipping address, contact person, and contact number
                openPaymentModal();
            }
        }

        // When the user clicks on <span> (x), close the modal
        span.onclick = function(event) {
            event.preventDefault(); // Prevent any default span action
            modal.style.display = "none";
            location.reload(); // Refresh the window
        };

        // Prevent events inside the modal from closing it and stop propagation
        modal.children[0].onclick = function(event) {
            event.stopPropagation();
            event.preventDefault(); // Prevent any default action inside the modal
        }
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
                    showConfirmButton: false,
                    timer: 1500
                });
                closePaymentModal();
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
    }).render('#paypal-button');
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
