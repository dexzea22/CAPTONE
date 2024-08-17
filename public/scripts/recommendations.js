document.addEventListener('DOMContentLoaded', (event) => {
    const quantityInputs = document.querySelectorAll('.quantity-input');

    quantityInputs.forEach(input => {
        const price = parseFloat(input.getAttribute('data-price'));
        const price25_30 = parseFloat(input.getAttribute('data-price25_30'));
        const price45_50 = parseFloat(input.getAttribute('data-price45_50'));
        const totalPriceElement = input.closest('.card-body').querySelector('.total-price');
        const withEggCheckbox = input.closest('.card-body').querySelector('.form-check-input');
        const radioButtons = input.closest('.card-body').querySelectorAll('.price-radio-group input[type="radio"]');

        // Function to calculate total price
        const calculateTotalPrice = () => {
            const quantity = parseInt(input.value);
            let selectedPrice = parseFloat(input.closest('.card-body').querySelector('.price-radio-group input[type="radio"]:checked')?.value || price);
            const isWithEgg = withEggCheckbox && withEggCheckbox.checked;
            const eggPrice = isWithEgg ? parseFloat(withEggCheckbox.getAttribute('data-egg-price')) : 0;

            // Adjust price calculation for solo meals if withEgg is checked
            if (!input.closest('.card-body').querySelector('.price-radio-group')) {
                selectedPrice = price + eggPrice;
            }

            const totalPrice = selectedPrice * quantity;
            totalPriceElement.textContent = totalPrice.toFixed(2);
        };

        // Initialize total price display
        calculateTotalPrice();

        // Event listeners for quantity change and withEgg checkbox change
        input.addEventListener('change', calculateTotalPrice);
        if (withEggCheckbox) {
            withEggCheckbox.addEventListener('change', calculateTotalPrice);
        }
        radioButtons.forEach(radio => {
            radio.addEventListener('change', calculateTotalPrice);
        });
    });
});
