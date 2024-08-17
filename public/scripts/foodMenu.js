document.addEventListener("DOMContentLoaded", function () {
  function calculateTotalPrice(cardBody) {
      const quantityInput = cardBody.querySelector('.quantity-input');
      const price = parseFloat(quantityInput.getAttribute('data-price'));
      const quantity = parseInt(quantityInput.value);
      const eggCheckbox = cardBody.querySelector('.form-check-input') || cardBody.querySelector('.add-egg');
      const isWithEgg = eggCheckbox && eggCheckbox.checked;
      const eggPrice = isWithEgg ? parseFloat(eggCheckbox.getAttribute('data-egg-price')) : 0;
      const radioButtons = cardBody.querySelectorAll('.price-radio-group input[type="radio"]');
      let selectedPrice = parseFloat(cardBody.querySelector('.price-radio-group input[type="radio"]:checked')?.value || price);

      if (radioButtons.length === 0) {
          selectedPrice = price + eggPrice;
      }

      const totalPrice = selectedPrice * quantity;
      const totalPriceElement = cardBody.querySelector('.total-price');
      totalPriceElement.textContent = '₱' + totalPrice.toFixed(2);
  }

  function initializeEventListeners() {
      document.querySelectorAll('.card-body').forEach(cardBody => {
          const quantityInputs = cardBody.querySelectorAll('.quantity-input');
          const eggCheckboxes = cardBody.querySelectorAll('.form-check-input, .add-egg');
          const priceRadios = cardBody.querySelectorAll('.price-radio-group input[type="radio"]');

          quantityInputs.forEach(input => {
              input.addEventListener("input", function () {
                  calculateTotalPrice(cardBody);
              });
          });

          eggCheckboxes.forEach(checkbox => {
              checkbox.addEventListener("change", function () {
                  calculateTotalPrice(cardBody);
              });
          });

          priceRadios.forEach(radio => {
              radio.addEventListener('change', function () {
                  calculateTotalPrice(cardBody);
              });
          });

          // Initialize total price on page load
          calculateTotalPrice(cardBody);
      });

      document.querySelectorAll('.price-radio').forEach(radio => {
          radio.addEventListener('change', function () {
              const itemId = this.getAttribute('name').split('price')[1];
              updateTotalPrice(itemId);
          });
      });

      document.querySelectorAll('.quantity-input').forEach(input => {
          input.addEventListener('input', function () {
              const itemId = this.getAttribute('id').split('quantity-')[1];
              updateTotalPrice(itemId);
          });
      });
  }

  function updateTotalPrice(itemId) {
      const selectedPriceRadio = document.querySelector('input[name="price' + itemId + '"]:checked');
      if (!selectedPriceRadio) return;

      const price = parseFloat(selectedPriceRadio.getAttribute('data-price'));
      const quantity = parseInt(document.getElementById('quantity-' + itemId).value);
      const totalPriceElement = document.getElementById('totalPrice-' + itemId);
      const newTotalPrice = (price * quantity).toFixed(2);
      totalPriceElement.textContent = '₱' + newTotalPrice;
  }

  initializeEventListeners();
});