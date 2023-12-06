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
var cartItems = getCartItemsFromStorage() || [];

updateCartCounter();

function updateCartCounter() {
  var cartCounter = document.getElementById("cart-counter");

  if (cartCounter) {
    // Check if cartItems is not null and has items
    if (cartItems && cartItems.length > 0) {
      var totalItems = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
      cartCounter.textContent = totalItems.toString();
      cartCounter.style.display = 'inline'; // Show the counter
    } else {
      // If cart is null or empty, hide the counter
      cartCounter.style.display = 'none';
    }
  }
}

function addToCart(itemName, cardId) {

  var selectedSize = document.querySelector(`#${cardId} input[name="size"]:checked`);
  // Get the image URL based on the cardId
  var imageUrl = document.querySelector(`#${cardId} img[src^="images/"]`).getAttribute('src');
  if (selectedSize) {
    var selectedSizeValue = selectedSize.value;
    var [size, price] = selectedSizeValue.split('-');
    var numericPrice = parseFloat(price);

    var item = {
      name: itemName,
      size: size,
      price: numericPrice,
      image: imageUrl,  // Include the image URL
      quantity: 1,  // Default quantity is set to 1
    };

    console.log(cartItems);
    cartItems.push(item);
    console.log(cartItems);
    updateCartDisplay();
    saveCartItemsToStorage(cartItems);

    // Show SweetAlert notification using the unique lightbox ID
    Swal.fire({
      icon: 'success',
      title: 'Item Added to Cart',
      text: `${itemName} ${size} has been added to your cart.`,
      showConfirmButton: true,
    });
  } else {
    // Replace the alert with SweetAlert
    Swal.fire({
      icon: 'warning',
      title: 'Oops...',
      text: 'Please select a size before adding to the cart.',
      showConfirmButton: false,
      timer: 2000,
    });
  }
  updateCartCounter();
  updateItemCounter();
}

function updateCartDisplay() {
  var cartList = document.getElementById("mod-cart-items");
  var totalAmount = document.getElementById("total-amount");
  var hiddentotal= document.getElementById("total-amounthidden");
  cartList.innerHTML = "";
  var totalPrice = 0;

  console.log("cartList:", cartList);
  console.log("totalAmount:", totalAmount);
  console.log("hiddentotal:", hiddentotal);
  

  for (var i = 0; i < cartItems.length; i++) {
    var div = document.createElement("div");
    // Add numbering to the items
    var itemNumber = i + 1;
    // Compute the total price based on quantity
    var totalItemPrice = (cartItems[i].quantity || 1) * cartItems[i].price;
    // Display the item name, size, quantity, and formatted price
    var itemInfo = document.createElement("span");
    itemInfo.innerHTML = `${itemNumber}. ${cartItems[i].name} : ${cartItems[i].size} Quantity: ${cartItems[i].quantity || 1} Price:₱${totalItemPrice.toLocaleString()}`;
    itemInfo.style.textDecoration = "underline"; // Add underline style
    itemInfo.style.fontWeight = "Bold"; // Add underline style

    var imageElement = document.createElement("img");
    imageElement.src = cartItems[i].image; 
    imageElement.alt = "Product Image";
    div.appendChild(imageElement);
    imageElement.classList.add("imgs"); // Add your custom class here


    // Add a delete button for each item
    var deleteButton = createDeleteButton(i);
    // Add increment and decrement buttons
    var incrementButton = createIncrementButton(i);
    var decrementButton = createDecrementButton(i);

    div.appendChild(itemInfo);
    div.appendChild(deleteButton);
    div.appendChild(incrementButton);
    div.appendChild(decrementButton);

    cartList.appendChild(div);

    totalPrice += cartItems[i].price * (cartItems[i].quantity || 1);
  }

  totalAmount.innerHTML = "<strong>₱" + totalPrice.toLocaleString() + "</strong>";
  totalAmount.setAttribute('data-numeric-value', totalPrice);
  
  hiddentotal.innerHTML = totalPrice;
  console.log(hiddentotal.innerHTML);
  updateCartCounter();
  updateItemCounter();
}


 // Function to create an increment button for a specific item
 function createIncrementButton(index) {
  var incrementButton = document.createElement("button");
  incrementButton.classList.add("inc"); // Add your custom class here

  incrementButton.textContent = "+";
  incrementButton.addEventListener("click", function () {
    incrementItem(index);
  });
  return incrementButton;
}

// Function to create a decrement button for a specific item
function createDecrementButton(index) {
  var decrementButton = document.createElement("button");
  decrementButton.classList.add("inc"); // Add your custom class here

  decrementButton.textContent = "-";
  decrementButton.addEventListener("click", function () {
    decrementItem(index);
  });
  return decrementButton;
}
// Function to increment the quantity of a specific item
function incrementItem(index) {
cartItems[index].quantity = (cartItems[index].quantity || 1) + 1;
cartItems[index].totalPrice = cartItems[index].quantity * cartItems[index].price; // Update total price
updateCartDisplay();
saveCartItemsToStorage(cartItems);
updateCartCounter();
updateItemCounter();
}

function decrementItem(index) {
if (cartItems[index].quantity > 1) {
  cartItems[index].quantity -= 1;
  cartItems[index].totalPrice = cartItems[index].quantity * cartItems[index].price; // Update total price
} else {
  deleteCartItem(index);
}
updateCartDisplay();
saveCartItemsToStorage(cartItems);
updateCartCounter();
updateItemCounter();
}


// Function to create a delete button for a specific item
function createDeleteButton(index) {
var deleteButton = document.createElement("i");
var icon = document.createElement("i");
// Set the icon class
icon.classList.add("fas", "fa-trash");
// Style the icon to be red
icon.style.color = "red";
// Append the icon to the delete button
deleteButton.appendChild(icon);

// Add classes and styles to position the button
deleteButton.classList.add("delete-icon");
deleteButton.style.float = "right"; 
deleteButton.style.marginLeft = "15px";  
deleteButton.style.cursor = "pointer";  

// Add a click event to delete the item when the delete button is clicked
deleteButton.addEventListener("click", function () {
  deleteCartItem(index);
});

return deleteButton;
}

// Function to delete a specific item from the cart
function deleteCartItem(index) {
  cartItems.splice(index, 1);
  console.log("Cart items after deletion:", cartItems);
  updateCartDisplay();
  updateCartCounter(); // Update the cart counter
  updateItemCounter(); // Update the item counter
  saveCartItemsToStorage(cartItems);
}

function updateItemCounter() {
  var itemCounter = document.getElementById("item-counter");
  if (itemCounter) {
    var totalItems = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
    itemCounter.textContent = totalItems.toString();
  }
}

function saveCartItemsToStorage(items) {
  localStorage.setItem("cartItems", JSON.stringify(items));
}

function getCartItemsFromStorage() {
  var storedItems = localStorage.getItem("cartItems");
  return storedItems ? JSON.parse(storedItems) : [];
}

function displayStoredItems() {
  var storedItems = getCartItemsFromStorage();

  if (storedItems.length > 0) {
    cartItems = storedItems; // Update the global cartItems array
    updateCartDisplay();
    updateItemCounter()
  }
}

window.onload = function () {
  displayStoredItems();
  updateCartCounter(); // Update the cart counter
  updateItemCounter(); // Update the item counter
};
function openCartModal() {
  var cartItems = getCartItemsFromStorage() || [];
  console.log("Cart Items:", cartItems);

  if (cartItems.length > 0) {
    console.log("Redirecting to /cart");
    window.location.href = '/cart';
  } else {
    console.log("Cart is empty");
    Swal.fire({
      icon: 'warning',
      title: 'Your cart is empty!',
      text: 'Please add items to your cart first.',
      showConfirmButton: true,
    }); 
  }
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
