// main.js
document.addEventListener('DOMContentLoaded', function () {
    // Fetch and display food items
    fetch('/api/food')
      .then(response => response.json())
      .then(foodItems => {
        const featureFoodSection = document.querySelector('.feature-food');
        foodItems.forEach(item => {
          const cardDiv = document.createElement('div');
          cardDiv.classList.add('cards');
          const image = document.createElement('img');
          image.classList.add('card-image');
          image.src = item.imageUrl;
          const detailDiv = document.createElement('div');
          detailDiv.classList.add('card-detail');
          const title = document.createElement('h4');
          title.textContent = item.name;
          const description = document.createElement('p');
          description.textContent = item.description;
          const price = document.createElement('p');
          price.textContent = `Price: ${item.price}`;
          // Add more elements as per your requirement
          detailDiv.append(title, description, price);
          cardDiv.append(image, detailDiv);
          featureFoodSection.appendChild(cardDiv);
        });
      })
      .catch(error => console.error('Error fetching food items:', error));
  
    // Handle form submission to add a new food item
    document.getElementById('addFoodForm').addEventListener('submit', event => {
      event.preventDefault();
      const formData = new FormData(event.target);
      const newFoodItem = {};
      formData.forEach((value, key) => {
        newFoodItem[key] = value;
      });
  
      fetch('/api/food/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFoodItem),
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // If successful, refresh the page to see the newly added item
          location.reload();
        } else {
          console.error('Error adding food item:', data.message);
        }
      })
      .catch(error => console.error('Error adding food item:', error));
    });
  });
  