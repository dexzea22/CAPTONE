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

// Function to initialize the PayPal button
function initializePayPalButton(totalAmount, shippingAddress, contactPerson, contactNumber) {
    paypal.Buttons({
        createOrder: function(data, actions) {
            // Use the same currency code as in the script tag
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: totalAmount.toFixed(2), // Format total amount with 2 decimal places
                        currency_code: 'PHP', // Use the correct currency code
                    },
                }],
            });
        },
        onApprove: function(data, actions) {
            // Send a request to your server to capture the order
            return fetch('/capture/' + data.orderID, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    // Pass shipping address, contact person, and contact number in the body
                    body: JSON.stringify({
                        shippingAddress: shippingAddress,
                        contactPerson: contactPerson,
                        contactNumber: contactNumber
                    })
                })
                .then(function(response) {
                    if (!response.ok) {
                        throw new Error('Failed to capture order. Server responded with ' + response.status);
                    }
                    return response.json();
                })
                .then(function(data) {
                    console.log("Payment successful:", data);
                    Swal.fire({
                        icon: 'success',
                        title: 'Payment Successful!',
                        showConfirmButton: false,
                        timer: 1500,
                    });
                    closePaymentModal();
                })
                .catch(function(error) {
                    console.error('An error occurred during PayPal checkout:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Payment Error',
                        text: 'An error occurred during payment processing. Please try again later.',
                    });
                });
        },
        onError: function(err) {
            console.error('An error occurred during PayPal checkout:', err);
            Swal.fire({
                icon: 'error',
                title: 'Payment Error',
                text: 'An error occurred during payment processing. Please try again later.',
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
