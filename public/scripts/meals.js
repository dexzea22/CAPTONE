
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
  menuToggle.addEventListener('click', () => {
    menu.classList.toggle('show');
  });

      const imagePaths = [
  'mong.jpg',
  'bpm.jpg',
  'bs.jpg',
  'cream.jpeg',
  'emb.jpg',
  'fishveg.jpg',
  // Add more image file paths as needed
];

const slideshowContainer = document.querySelector('.slideshow-container');
let currentIndex = 0;


function updateBackgroundImage() {
  if (currentIndex >= imagePaths.length) {
    currentIndex = 0;
  }
  const imagePath = imagePaths[currentIndex];
  const imageUrl = `url('images/${imagePath}')`;
  document.querySelector('.jumbotron').style.backgroundImage = imageUrl;
  document.querySelector('.jumbotron').style.backgroundSize = '100% 100%'; // or 'contain' or custom size
  document.querySelector('.jumbotron').style.backgroundRepeat = 'no-repeat';
  document.querySelector('.jumbotron').style.backgroundPosition =  'center';

  currentIndex++;
}

// Update the background image every 3 seconds (3000 milliseconds)
setInterval(updateBackgroundImage, 3000);
 

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

// Function to update cart counter and item counter
function updateCartCounter() {
  fetch('/api/cart/items', {
      method: 'GET',
      credentials: 'include', // Important for sessions
  })
  .then(response => {
      if (!response.ok) {
          throw new Error('Failed to fetch cart items. Please try again.');
      }
      return response.json();
  })
  .then(data => {
      // Calculate total number of items in the cart
      const totalItems = data.reduce((total, item) => total + item.quantity, 0);
      // Update the cart counter and item counter in the UI
      document.getElementById('cart-counter').textContent = totalItems;
      document.getElementById('item-counter').textContent = totalItems; // Update item counter
  })
  .catch(error => {
      console.error('Error fetching cart items:', error);
      // Display an error message or handle it as per your requirement
  });
}

function QTY(operation, outputId) {
  // Get the span element by its id
  const quantityOutput = document.getElementById(outputId);
  
  // Get the current quantity value
  let currentQuantity = parseInt(quantityOutput.innerText);
  
  // Update the quantity based on the operation
  if (operation === 'increment') {
      // Increment the quantity by 1
      currentQuantity++;
  } else if (operation === 'decrement' && currentQuantity > 0) {
      // Decrement the quantity by 1, if it's greater than 0
      currentQuantity--;
  }
  
  // Display the updated quantity
  quantityOutput.innerText = currentQuantity;
}

// Function to update cart counter

  // Updated addToCart function to include quantity and "With Egg" option
function addToCart(cardId) {
  console.log('Adding to cart:', cardId); // Log to track function execution

  const cardElement = document.getElementById(cardId);
  if (!cardElement) {
      console.error('Card element not found:', cardId);
      return;
  }

  const quantityInput = cardElement.querySelector(`#quantity-${cardId.replace('card-', '')}`);
  const withEggCheckbox = cardElement.querySelector(`#withEgg-${cardId.replace('card-', '')}`);
  const imageUrl = cardElement.querySelector('img').getAttribute('src');

  if (!quantityInput || !withEggCheckbox) {
      console.error('Required input elements not found for card:', cardId);
      return;
  }

  const quantity = parseInt(quantityInput.value);
  const eggPrice = withEggCheckbox.checked ? parseFloat(withEggCheckbox.dataset.eggPrice) : 0;
  const itemPrice = parseFloat(quantityInput.getAttribute('data-price'));
  const itemTotalPrice = (itemPrice + eggPrice) * quantity;

  fetch('/api/cart/items', {
      method: 'GET',
      credentials: 'include',
  })
  .then(response => {
      if (!response.ok) {
          throw new Error('Failed to fetch cart items. Please try again.');
      }
      return response.json();
  })
  .then(data => {
      const totalPrice = data.reduce((total, item) => total + (item.foodItem.price * item.quantity), 0);
      const newTotalPrice = totalPrice + itemTotalPrice;

      if (newTotalPrice > 10000) {
          Swal.fire({
              icon: 'warning',
              title: 'Cart Limit Exceeded',
              text: 'Adding this item will exceed PHP 10,000. You cannot add to your cart anymore.',
          });
      } else {
          fetch('/api/cart/add', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ name: cardId, price: itemPrice + eggPrice, image: imageUrl, quantity: quantity }),
          })
          .then(response => {
              if (!response.ok) {
                  throw new Error('Failed to add item to cart. Please try again.');
              }
              return response.json();
          })
          .then(data => {
              if (data.success) {
                  Swal.fire({
                      icon: 'success',
                      title: 'Item Added to Cart',
                      text: `${cardId} has been added to your cart.`,
                  });
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
  })
  .catch(error => {
      console.error('Error fetching cart items:', error);
      Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch cart items. Please try again.',
      });
  });
}






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
      updateCartCounter(); // Update cart counter immediately after incrementing
      updateCartDisplay(); // Update cart display
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
      updateCartCounter(); // Update cart counter immediately after decrementing
      updateCartDisplay(); // Update cart display
    }
  })
  .catch(error => console.error('Error decrementing item:', error));
}
// Function to delete a cart item
function deleteCartItem(cartItemId) {
  fetch(`/api/cart/delete/${cartItemId}`, {
      method: 'DELETE',
      credentials: 'include', // Important for sessions
  })
  .then(response => {
      if (!response.ok) {
          throw new Error('Failed to delete item from cart. Please try again.');
      }
      // If deletion is successful, refresh the cart UI
      displayCartItems();
      updateCartCounter(); // Update cart counter immediately after deletion
  })
  .catch(error => {
      console.error('Error deleting item from cart:', error);
      // Display an error message if deletion fails
      Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Failed to delete item from cart. Please try again.',
      });
  });
}



// Function to fetch cart items from the server and update UI
function fetchCartItemsAndUpdateUI() {
  console.log('Fetching cart items...');
  fetch('/api/cart/items', {
    method: 'GET',
    credentials: 'include', // Ensures cookies, such as session cookies, are sent with the request
    headers: {
        'Content-Type': 'application/json',
    }
  })
.then(response => {
    console.log('Received response from server:', response);
    if (!response.ok) {
      throw new Error(`Failed to fetch cart items: ${response.statusText}`);
    }
    return response.json();
  })
.then(cartItems => {
    console.log('Received cart items:', cartItems);
    if (cartItems && cartItems.length > 0 && cartItems[0] && cartItems[0].userId) {
      updateCartDisplay(cartItems);
      updateCartCounter(cartItems);
    } else {
      console.error('Error fetching cart items:', 'No items in cart');
    }
  })
.catch(error => {
    console.error('Error fetching cart items:', error);
  });
}
window.onload = function () {
  fetchCartItemsAndUpdateUI(); // Fetch cart items from the server and update UI accordingly
};

/// Function to open cart page
function openCartPage() {
  fetch('/api/cart/items')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch cart items.');
      }
      return response.json();
    })
    .then(data => {
      console.log('Response from server:', data); // Log the response from the server
      
      // Check if data is an array and has items
      if (data && Array.isArray(data) && data.length > 0) {
        console.log("Redirecting to /cart");
        window.location.href = '/cart'; // Redirect to /cart page
      } else {
        console.log("Cart is empty");
        // Use SweetAlert to show the empty cart message
        Swal.fire({
          icon: 'warning',
          title: 'Your cart is empty!',
          text: 'Please add food to your cart first.',
          showConfirmButton: true,
        })
      }
    })
    .catch(error => {
      console.error('Error checking cart status:', error);
      // Handle error: show error message using SweetAlert
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch cart items. Please try again later.',
        showConfirmButton: true,
      });
    });
}

// Event listener to trigger cart view when user clicks the cart
document.getElementById('cart-button').addEventListener('click', viewCart);



// Update the cart counter when the page loads
window.onload = function() {
  updateCartCounter();
};




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

