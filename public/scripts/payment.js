// Function to open the payment modal
function openPaymentModal() {
    var modal = document.getElementById("payment-mod");
    modal.style.display = "flex";
}

// Function to close the payment modal
function closePaymentModal() {
    var modal = document.getElementById("payment-mod");
    modal.style.display = "none";
}

// Function to initialize the PayPal button
function initializePayPalButton(totalAmountValue) {
    paypal.Buttons({
        createOrder: function (data, actions) {
            // Use the same currency code as in the script tag
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: totalAmountValue.toString(),
                        currency_code: 'PHP', // Use the correct currency code
                    },
                }],
            });
        },
        onApprove: function (data, actions) {
            return actions.order.capture().then(function (details) {
                console.log("Payment successful:", details);
                Swal.fire({
                    icon: 'success',
                    title: 'Payment Successful!',
                    showConfirmButton: false,
                    timer: 1500,
                });
                closePaymentModal();
            });
        },
        onError: function (err) {
            console.error('An error occurred during PayPal checkout:', err);
            Swal.fire({
                icon: 'error',
                title: 'Payment Error',
                text: 'An error occurred during payment processing. Please try again later.',
            });
        }
    }).render('#paypal-button');
}

// Function to retrieve the total price from the cart
function getTotalPriceFromCart() {
    var totalAmountElement = document.getElementById('total-amounthidden');
    var totalAmount = parseFloat(totalAmountElement.innerText);
    return totalAmount;
}

// Event listener for checkout button click
document.getElementById("checkoutButton").addEventListener("click", function () {
    var totalAmount = getTotalPriceFromCart();
    initializePayPalButton(totalAmount);
    openPaymentModal();
});
