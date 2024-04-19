
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

// Function to update cart counter

// addToCart function
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

  // Fetch current cart total price
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
    const totalPrice = data.reduce((total, item) => total + (item.foodItem.price * item.quantity), 0);
    const itemTotalPrice = numericPrice * 1; // Calculate total price for the new item
    const newTotalPrice = totalPrice + itemTotalPrice;

    // Check if adding the new item will exceed the limit
    if (newTotalPrice > 10000) {
      Swal.fire({
        icon: 'warning',
        title: 'Cart Limit Exceeded',
        text: 'Adding this item will exceed PHP 10,000. You cannot add to your cart anymore.',
      });
    } else {
      
      // Proceed with adding the item to the cart
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
          // Optionally, refresh the cart UI here
          // If you want to refresh the cart UI, you can call your updateCartDisplay function here
          // updateCartDisplay();
          Swal.fire({
            icon: 'success',
            title: 'Item Added to Cart',
            text: `${itemName} ${size} has been added to your cart.`,
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