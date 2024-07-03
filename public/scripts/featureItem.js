document.addEventListener("DOMContentLoaded", function () {
  const cards = document.querySelectorAll('.card');

  function updateTotalPrice(cardBody) {
    const isSoloMeal = cardBody.classList.contains('solo-meal');
    const quantityInput = cardBody.querySelector(".quantity-input");
    const quantity = parseInt(quantityInput.value);
    let newTotalPrice = 0;

    if (isSoloMeal) {
      const price = parseFloat(quantityInput.getAttribute("data-price"));
      const addEggCheckbox = cardBody.querySelector(".add-egg");
      const addEggPrice = addEggCheckbox.checked ? parseFloat(addEggCheckbox.getAttribute("data-egg-price")) : 0;
      newTotalPrice = ((price + addEggPrice) * quantity).toFixed(2);
      const totalPriceElement = cardBody.querySelector(".total-price");
      totalPriceElement.textContent = "₱" + newTotalPrice;
    } else {
      const selectedRadio = cardBody.querySelector(`input[name="price${cardBody.dataset.itemId}"]:checked`);
      if (!selectedRadio) return;
      const radioPrice = parseFloat(selectedRadio.getAttribute("data-price"));
      newTotalPrice = (radioPrice * quantity).toFixed(2);
      const totalPriceElement = cardBody.querySelector(`#totalPrice${cardBody.dataset.itemId}`);
      totalPriceElement.textContent = "₱" + newTotalPrice;
    }
  }

  cards.forEach(cardBody => {
    const quantityInput = cardBody.querySelector(".quantity-input");
    if (quantityInput) {
      quantityInput.addEventListener("input", function () {
        updateTotalPrice(cardBody);
      });
    }

    if (cardBody.classList.contains('solo-meal')) {
      const addEggCheckbox = cardBody.querySelector(".add-egg");
      if (addEggCheckbox) {
        addEggCheckbox.addEventListener("change", function () {
          updateTotalPrice(cardBody);
        });
      }
    } else if (cardBody.classList.contains('party-tray')) {
      const priceRadios = cardBody.querySelectorAll(".price-radio");
      priceRadios.forEach(radio => {
        radio.addEventListener("change", function () {
          updateTotalPrice(cardBody);
        });
      });
    }
  });
});
