// Function to toggle the "like" state of a product
function toggleLike(button) {
    const icon = button.querySelector('i');
    if (icon.classList.contains('far')) {
        icon.classList.remove('far');
        icon.classList.add('fas');
        icon.style.color = 'red'; // Change color to indicate it's liked
    } else {
        icon.classList.remove('fas');
        icon.classList.add('far');
        icon.style.color = ''; // Reset color
    }
}

// Function to show a message when a product is added to the cart
function addToCart(button) {
    alert('Product has been added to your cart.');
}

// Optional: Function to handle sorting of products

document.addEventListener('DOMContentLoaded', () => {
    const sortSelect = document.getElementById('sort');
    const productList = document.getElementById('product-list');

    sortSelect.addEventListener('change', sortProducts);

    function sortProducts() {
        const sortValue = sortSelect.value;
        const products = Array.from(productList.getElementsByClassName('product'));

        products.sort((a, b) => {
            const priceA = parseFloat(a.getAttribute('data-price'));
            const priceB = parseFloat(b.getAttribute('data-price'));

            if (sortValue === 'price-asc') {
                return priceA - priceB;
            } else if (sortValue === 'price-desc') {
                return priceB - priceA;
            }
            return 0; // Default sort (do nothing)
        });

        // Clear the current product list
        productList.innerHTML = '';

        // Append the sorted products
        products.forEach(product => productList.appendChild(product));
    }
});

document.getElementById('review-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const name = document.getElementById('reviewer-name').value;
    const text = document.getElementById('review-text').value;
    const rating = document.getElementById('review-rating').value;
    
    const newReview = document.createElement('div');
    newReview.classList.add('review');
    newReview.innerHTML = `<p>"${text}" - ${name}</p><p>Rating: ${'⭐'.repeat(rating)}</p>`;
    
    document.querySelector('.reviews-list').appendChild(newReview);

    // Clear form
    document.getElementById('review-form').reset();
});

