document.addEventListener("DOMContentLoaded", function () {
  const quantityInputs = document.querySelectorAll(".quantity-input");
  const eggCheckboxes = document.querySelectorAll(".add-egg");

  function updateTotalPrice(cardBody) {
    const price = parseFloat(cardBody.querySelector(".quantity-input").getAttribute("data-price"));
    const quantity = parseInt(cardBody.querySelector(".quantity-input").value);
    const eggPrice = cardBody.querySelector(".add-egg").checked ? parseFloat(cardBody.querySelector(".add-egg").getAttribute("data-egg-price")) : 0;
    const totalPriceElement = cardBody.querySelector(".total-price");
    const newTotalPrice = (price * quantity + eggPrice * quantity).toFixed(2);
    totalPriceElement.textContent = newTotalPrice;
  }

  quantityInputs.forEach(input => {
    input.addEventListener("input", function () {
      const cardBody = this.closest(".card-body");
      updateTotalPrice(cardBody);
    });
  });

  eggCheckboxes.forEach(checkbox => {
    checkbox.addEventListener("change", function () {
      const cardBody = this.closest(".card-body");
      updateTotalPrice(cardBody);
    });
  });
});

document.addEventListener('DOMContentLoaded', function() {
  const priceRadios = document.querySelectorAll('.price-radio');
  const quantityInputs = document.querySelectorAll('.quantity-input');

  function updateTotalPrice(itemId) {
    const selectedPriceRadio = document.querySelector('input[name="price' + itemId + '"]:checked');
    if (!selectedPriceRadio) return;

    const price = parseFloat(selectedPriceRadio.getAttribute('data-price'));
    const quantity = parseInt(document.getElementById('quantity-' + itemId).value);
    const totalPriceElement = document.getElementById('totalPrice-' + itemId);
    const newTotalPrice = (price * quantity).toFixed(2);
    totalPriceElement.textContent = '₱' + newTotalPrice;
  }

  priceRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      const itemId = this.getAttribute('name').split('price')[1];
      updateTotalPrice(itemId);
    });
  });

  quantityInputs.forEach(input => {
    input.addEventListener('input', function() {
      const itemId = this.getAttribute('id').split('quantity-')[1];
      updateTotalPrice(itemId);
    });
  });
});