document.addEventListener("DOMContentLoaded", function() {
  // Select the menu toggle button and the menu elements
  const menuToggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.menu');
  const sideMenu = document.querySelector(".side-menu");

  // Event listener for toggling the main menu
  menuToggle.addEventListener('click', () => {
      menu.classList.toggle('show');
      sideMenu.classList.toggle("show"); // Toggle side menu at the same time
  });

  // Function to check screen size and adjust menu visibility
  function checkScreenSize() {
      if (window.innerWidth > 768) {
          sideMenu.classList.remove("show"); // Hide side menu on larger screens
          menu.classList.remove("show"); // Consider if you also want to auto-hide the main menu on larger screens
      }
  }

  // Initial check to apply correct menu state based on current screen size
  checkScreenSize();

  // Listen for window resize events to adjust menu visibility
  window.addEventListener('resize', checkScreenSize);
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

  // Assumes user session management is properly set up and a userId is stored in the session
  function getUserId() {
    // This function should retrieve the user ID from your session. 
    // The implementation depends on how you're managing sessions (e.g., cookies, local storage, etc.)
    // As an example, if you're using cookies that include the user ID:
    // return getCookie("userId"); // Implement getCookie() accordingly
    // Since you're using server-side sessions, this would typically be managed by your server logic instead.
    // For demonstration purposes, we'll assume it's available as a global variable:
    return window.userId; // Ensure this is securely managed and assigned.
}



function updateCartDisplay() {
        const userId = getUserId();
        if (!userId) {
            console.error("User ID not found");
            return;
        }

        fetch(`/api/cart/items/${userId}`, {
            method: 'GET',
            credentials: 'include', // Necessary for sessions to work
        })
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                renderCartItems(data);
                updateItemCounter(data);
            } else {
                console.log("Cart is empty");
                // Handle empty cart scenario
            }
        })
        .catch(error => console.error('Error fetching cart items:', error));
    }

    function updateCartCounter(userId) {
      fetch(`/api/cart/items/${userId}`, {
          method: 'GET',
          credentials: 'include', // Necessary for sessions
      })
      .then(response => response.json())
      .then(cartItems => {
          const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
          document.getElementById("cart-counter").textContent = totalItems;
      })
      .catch(error => console.error('Error updating cart counter:', error));
  }

  function renderCartItems(cartItems) {
    const cartList = document.getElementById("mod-cart-items");
    cartList.innerHTML = ""; // Clear the cart list first
    cartItems.forEach(item => {
        // Render each cart item as needed
    });
}

function deleteCartItem(itemId) {
  const userId = getUserId();
  fetch(`/api/cart/delete/${userId}/${itemId}`, {
      method: 'DELETE',
      credentials: 'include', // Necessary for sessions
  })
  .then(response => {
      if (!response.ok) throw new Error('Failed to delete cart item');
      console.log("Cart item deleted successfully");
      updateCartDisplay(userId);
      updateCartCounter(userId);
  })
  .catch(error => {
      console.error("Error deleting cart item:", error);
  });
}


// function openCartModal() {
//   // Assumes cart data is already updated, simply checks if modal should open
//   const userId = 'yourUserIdHere'; // Replace with actual logic to retrieve user ID
//   fetch(`/api/cart/${userId}`)
//       .then(response => response.json())
//       .then(cartItems => {
//           if (cartItems.length > 0) {
//               console.log("Redirecting to /cart");
//               window.location.href = '/cart';
//           } else {
//               console.log("Cart is empty");
//               Swal.fire({
//                   icon: 'warning',
//                   title: 'Your cart is empty!',
//                   text: 'Please add food to your cart first.',
//                   showConfirmButton: true,
//               });
//           }
//       })
//       .catch(error => {
//           console.error("Error checking cart items:", error);
//           alert('Failed to check cart items. Please try again.');
//       });
// }

// Function to open cart modal
function openCartModal() {
  fetch('/api/cart/items')
    .then(response => response.json())
    .then(data => {
      if (data && data.cartItems && data.cartItems.length > 0) {
        console.log("Redirecting to /cart");
        window.location.href = '/cart';
      } else {
        console.log("Cart is empty");
        // Use SweetAlert to show the empty cart message
        Swal.fire({
          icon: 'warning',
          title: 'Your cart is empty!',
          text: 'Please add food to your cart first.',
          showConfirmButton: true,
        }).then((result) => {
          if (result.isConfirmed) {
            // Optionally, you can add a redirect here if needed
            console.log("Redirecting to /userMenu");
            window.location.href = '/userMenu';
          }
        });
      }
    })
    .catch(error => console.error('Error checking cart status:', error));
}




// Function to increment the quantity of a specific cart item

function incrementItem(itemId) {
  const userId = getUserId(); // Retrieve user ID as implemented in your context
  fetch(`/api/cart/increment/${itemId}`, {
      method: 'POST',
      credentials: 'include', // Necessary for sessions
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }) // Assuming your API needs this
  })
  .then(response => {
      if (!response.ok) throw new Error('Failed to increment item quantity');
      console.log("Item quantity incremented successfully");
      updateCartDisplay(userId);
      updateCartCounter(userId);
  })
  .catch(error => console.error("Error incrementing item quantity:", error));
}

// Function to decrement the quantity of a specific cart item
function decrementItem(itemId) {
  const userId = getUserId(); // Retrieve user ID as implemented in your context
  fetch(`/api/cart/decrement/${itemId}`, {
      method: 'POST',
      credentials: 'include', // Necessary for sessions
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }) // Assuming your API needs this
  })
  .then(response => {
      if (!response.ok) throw new Error('Failed to decrement item quantity');
      console.log("Item quantity decremented successfully");
      updateCartDisplay(userId);
      updateCartCounter(userId);
  })
  .catch(error => console.error("Error decrementing item quantity:", error));
}

// Make sure to call these functions in your HTML or UI event listeners as needed.



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
// Call the function with the desired rating (e.g., 4 out of 5 stars)
createStarRating('star-rating4', 4);
createStarRating('star-rating5', 3);
createStarRating('star-rating6', 4);
createStarRating('star-rating7', 5);
createStarRating('star-rating8', 2);
createStarRating('star-rating9', 4);
createStarRating('star-rating10', 5);
createStarRating('star-rating11', 4);
createStarRating('star-rating12', 3);
createStarRating('star-rating13', 5);
createStarRating('star-rating14', 4);
createStarRating('star-rating15', 5);
createStarRating('star-rating16', 4);
createStarRating('star-rating17', 4);
createStarRating('star-rating18', 3);
createStarRating('star-rating19', 5);
createStarRating('star-rating20', 4);
createStarRating('star-rating21', 5);
createStarRating('star-rating22', 4);
createStarRating('star-rating23', 5);
createStarRating('star-rating24', 5);
createStarRating('star-rating25', 4);
createStarRating('star-rating26', 4);
createStarRating('star-rating27', 3);
createStarRating('star-rating28', 3);
createStarRating('star-rating29', 5);
createStarRating('star-rating30', 4);
createStarRating('star-rating31', 2);
createStarRating('star-rating32', 3);
createStarRating('star-rating33', 5);
createStarRating('star-rating34', 4);
createStarRating('star-rating35', 4);
createStarRating('star-rating36', 5);
createStarRating('star-rating37', 2);
createStarRating('star-rating38', 3);
createStarRating('star-rating39', 4);
createStarRating('star-rating40', 3);
createStarRating('star-rating41', 5);
createStarRating('star-rating42', 4);
createStarRating('star-rating43', 5);
// JavaScript for the lightbox functionality
const galleries = document.querySelectorAll('.gallery');
const lightboxes = document.querySelectorAll('.lightbox');
const lightboxImages = document.querySelectorAll('.lightbox-image');

galleries.forEach((gallery, index) => {
  gallery.querySelectorAll('img').forEach((img) => {
    img.addEventListener('click', () => {
      lightboxImages[index].src = img.src;
      lightboxes[index].style.display = 'block';
    });
  });

  lightboxes[index].addEventListener('click', (event) => {
    if (event.target === lightboxes[index]) {
      lightboxes[index].style.display = 'none';
    }
  });
});
