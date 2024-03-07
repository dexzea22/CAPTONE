const menuToggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.menu');
  
  menuToggle.addEventListener('click', () => {
    menu.classList.toggle('show');
  });
  document.addEventListener("DOMContentLoaded", function() {
    var menuToggle = document.querySelector(".menu-toggle");
    var sideMenu = document.querySelector(".side-menu");
  
    if (menuToggle) {
      menuToggle.addEventListener("click", function() {
        sideMenu.classList.toggle("show");
      });
    }
  
    // Check screen size on initial load and hide the menu if the screen is big
    checkScreenSize();
    
    // Check screen size when the window is resized
    window.addEventListener('resize', checkScreenSize);
  
    function checkScreenSize() {
      if (window.innerWidth > 768) {
        sideMenu.classList.remove("show");
      }
    }
  });
  function Login() {
    // You can set the login page URL here
    window.location.href = "/login"; // Replace "login.html" with the actual URL of your login page
  }
 // JavaScript function to create a star rating
 function createStarRating(containerId, rating) {
  const container = document.getElementById(containerId);
  
  // Clear any existing content in the container
  container.innerHTML = '';
  
  // Create a loop to generate the stars
  for (let i = 1; i <= 5; i++) {
    const star = document.createElement('span');
    star.classList.add('star', i <= rating ? 'filled' : 'empty');
    star.innerHTML = '★'; // You can use a star icon here if available
    container.appendChild(star);
  }
}

// Function to fetch cart items from the server and update UI
function loadAndDisplayCartItems() {
  fetch('/api/cart/items', {
      method: 'GET',
      headers: {
          'Content-Type': 'application/json',
          // Include any additional headers like authentication tokens here
      }
  })
  .then(response => response.json())
  .then(cartItems => {
      updateCartDisplay(cartItems);
      updateCartCounter(cartItems);
  })
  .catch(error => console.error('Error fetching cart items:', error));
}

// Call the function with the desired rating (e.g., 4 out of 5 stars)
createStarRating('starmls', 3);
createStarRating('starmls1', 4);
createStarRating('starmls2', 5);
createStarRating('starmls3', 5);
createStarRating('starmls4', 3);
createStarRating('starmls5', 4);
createStarRating('starmls6', 5);


// Function to update cart counter
function updateCartCounter() {
  fetch('/api/cart/items', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
      // Include any necessary authentication headers
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to fetch cart items.');
    }
    return response.json();
  })
  .then(cartItems => {
    const cartCounter = document.getElementById('cart-counter');
    if (cartCounter) {
      const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
      cartCounter.textContent = totalItems.toString();
      cartCounter.style.display = totalItems > 0 ? 'inline' : 'none';
    }
  })
  .catch(error => {
    console.error('Error updating cart counter:', error);
  });
}
// Function to update cart counter



// addtoCart //
function addToCart(itemName, cardId) {
  const selectedSize = document.querySelector(`#${cardId} input[name="size"]:checked`);
  const imageUrl = document.querySelector(`#${cardId} img[src^="images/"]`).getAttribute('src');

  if (!selectedSize) {
    Swal.fire({
      icon: 'warning',
      title: 'Oops...',
      text: 'Please select a size before adding to the cart.',
      timer: 2000,
    });
    return; // Exit the function if no size is selected
  }

  const [size, price] = selectedSize.value.split('-');
  const numericPrice = parseFloat(price);

  fetch('/api/cart/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Important for sessions
    body: JSON.stringify({ name: itemName, size, price: numericPrice, image: imageUrl, quantity: 1 }),
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to add item to cart. Please try again.');
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
      // Update cart counter
      updateCartCounter(); // Call the function to update the cart counter
      // Update UI based on the response
      updateCartDisplay();
      Swal.fire({
        icon: 'success',
        title: 'Item Added to Cart',
        text: `${itemName} ${size} has been added to your cart.`,
      });
      // Optionally, refresh the cart UI here
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: data.message || 'Could not add item to the cart.',
      });
    }
  })
  .catch(error => {
    console.error('Error adding item to cart:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.message || 'An unexpected error occurred.',
    });
  });
}
// addtoCart //

// Assuming cartItem has an ID and you have an API endpoint set up for these actions

// Function to increment the quantity of a specific item
function incrementItem(itemId) {
  fetch(`/api/cart/increment/${itemId}`, {
    method: 'POST',
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Update UI based on the response
      console.log('Item incremented successfully');
      updateCartDisplay(); // You might need to fetch the cart items again or update the UI based on the response
    }
  })
  .catch(error => console.error('Error incrementing item:', error));
}

// Function to decrement the quantity of a specific item
function decrementItem(itemId) {
  fetch(`/api/cart/decrement/${itemId}`, {
    method: 'POST',
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Update UI based on the response
      console.log('Item decremented successfully');
      updateCartDisplay(); // You might need to fetch the cart items again or update the UI based on the response
    }
  })
  .catch(error => console.error('Error decrementing item:', error));
}

// Function to delete a specific item from the cart
function deleteCartItem(itemId) {
  fetch(`/api/cart/delete/${itemId}`, {
    method: 'DELETE',
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Update UI based on the response
      console.log('Item deleted successfully');
      updateCartDisplay(); // You might need to fetch the cart items again or update the UI based on the response
    }
  })
  .catch(error => console.error('Error deleting item:', error));
}
////////

// Function to fetch cart items from the server and update UI
function fetchCartItemsAndUpdateUI() {
  fetch('/api/cart/items', {
      method: 'GET',
      headers: {
          'Content-Type': 'application/json',
          // Include any additional headers like authentication tokens here
      }
  })
  .then(response => response.json())
  .then(cartItems => {
      updateCartDisplay(cartItems);
      updateCartCounter(cartItems);
  })
  .catch(error => console.error('Error fetching cart items:', error));
}

function updateItemCounter(cartItems) {
  var itemCounter = document.getElementById("item-counter");
  if (itemCounter) {
    var totalItems = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
    itemCounter.textContent = totalItems.toString();
    itemCounter.style.display = totalItems > 0 ? 'inline' : 'none';
  }
}

window.onload = function () {
  fetchCartItemsAndUpdateUI(); // Fetch cart items from the server and update UI accordingly
};

// Function to open cart modal
async function openCartModal() {
  fetch('/api/cart/items')
    .then(response => {
      console.log("hello")
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      if (data && data.cartItems && data.cartItems.length > 0) {
        console.log("Redirecting to /cart");
        window.location.href = '/cart';
      } else {
        // Use SweetAlert to show the empty cart message
        Swal.fire({
          icon: 'warning',
          title: 'Your cart is empty!',
          text: 'Please add food to your cart first.',
          showConfirmButton: true,
        });
      }
    })
    .catch(error => console.error('Error checking cart status:', error));
}


// Update the cart counter when the page loads
window.onload = function() {
  updateCartCounter();
};


// Function to update cart display
function updateCartDisplay(cartItems) {
  var cartList = document.getElementById("mod-cart-items");
  var totalAmount = document.getElementById("total-amount");
  cartList.innerHTML = "";
  let totalPrice = 0;

  if (cartItems && cartItems.length > 0) {
    cartItems.forEach((item, index) => {
      var div = document.createElement("div");
      var itemNumber = index + 1;
      var totalItemPrice = item.quantity * item.foodItem.price;
      var itemInfo = document.createElement("span");
      itemInfo.innerHTML = `${itemNumber}. ${item.foodItem.name} : ${item.foodItem.size} Quantity: ${item.quantity} Price: ₱${totalItemPrice.toLocaleString()}`;
      itemInfo.style.textDecoration = "underline";
      itemInfo.style.fontWeight = "bold";

      var imageElement = document.createElement("img");
      imageElement.src = item.foodItem.imageUrl;
      imageElement.alt = "Product Image";
      div.appendChild(imageElement);
      imageElement.classList.add("imgs");

      div.appendChild(itemInfo);
      cartList.appendChild(div);

      totalPrice += totalItemPrice;
    });
  } else {
    var emptyCartMessage = document.createElement("p");
    emptyCartMessage.textContent = "Your cart is empty!";
    cartList.appendChild(emptyCartMessage);
  }

  totalAmount.innerHTML = `<strong>₱${totalPrice.toLocaleString()}</strong>`;
}
//updateCartDisplay //

$('#openDietaryModal').click(function () {
  $('#dietaryPreferencesModal').modal('show');
});
// Function to open the profile modal
function openProfileModal() {
  document.getElementById('profileModal').style.display = 'block';
}

// Function to close the profile modal
function closeProfileModal() {
  document.getElementById('profileModal').style.display = 'none';
}

// Event listener for opening the modal
document.querySelector('.fa-user-circle').addEventListener('click', function(event) {
  openProfileModal();
  event.stopPropagation(); // Prevent the modal from closing immediately
});

// Event listener for closing the modal when clicking anywhere outside of the modal content
window.addEventListener('click', function(event) {
  var modal = document.getElementById('profileModal');
  if (event.target == modal) {
    closeProfileModal();
  }
});