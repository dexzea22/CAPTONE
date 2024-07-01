// JavaScript for UserDashboard.ejs

document.addEventListener("DOMContentLoaded", function () {
    const soloMealCards = document.querySelectorAll('.card-body.solo-meal');
    const partyTrayCards = document.querySelectorAll('.card-body.party-tray');
  
    // Function to update total price for Solo Meals
    function updateSoloMealTotalPrice(cardBody) {
      const price = parseFloat(cardBody.querySelector(".quantity-input").getAttribute("data-price"));
      const quantity = parseInt(cardBody.querySelector(".quantity-input").value);
      const addEggPrice = cardBody.querySelector(".add-egg").checked ? parseFloat(cardBody.querySelector(".add-egg").getAttribute("data-egg-price")) : 0;
      const totalPriceElement = cardBody.querySelector(".total-price");
      const newTotalPrice = (price * quantity + addEggPrice).toFixed(2);
      totalPriceElement.textContent = "₱" + newTotalPrice;
    }
  
    // Function to update total price for Party Trays
    function updatePartyTrayTotalPrice(itemId) {
      const selectedRadio = document.querySelector(`input[name="price${itemId}"]:checked`);
      if (!selectedRadio) return;
      
      const price = parseFloat(selectedRadio.getAttribute("data-price"));
      const quantity = parseInt(document.getElementById(`quantity${itemId}`).value);
      const totalPriceElement = document.getElementById(`totalPrice${itemId}`);
      const newTotalPrice = (price * quantity).toFixed(2);
      totalPriceElement.textContent = "₱" + newTotalPrice;
    }
  
    // Attach event listeners for Solo Meals
    soloMealCards.forEach(cardBody => {
      const quantityInput = cardBody.querySelector(".quantity-input");
      const addEggCheckbox = cardBody.querySelector(".add-egg");
  
      quantityInput.addEventListener("input", function () {
        updateSoloMealTotalPrice(cardBody);
      });
  
      addEggCheckbox.addEventListener("change", function () {
        updateSoloMealTotalPrice(cardBody);
      });
    });
  
    // Attach event listeners for Party Trays
    partyTrayCards.forEach(cardBody => {
      const priceRadios = cardBody.querySelectorAll(".price-radio");
      const quantityInput = cardBody.querySelector(".quantity-input");
  
      priceRadios.forEach(radio => {
        radio.addEventListener("change", function () {
          const itemId = radio.getAttribute("name").replace("price", "");
          updatePartyTrayTotalPrice(itemId);
        });
      });
  
      quantityInput.addEventListener("input", function () {
        const itemId = quantityInput.getAttribute("id").replace("quantity", "");
        updatePartyTrayTotalPrice(itemId);
      });
    });
  });
  