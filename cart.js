// Initialize cart data from localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Retrieve the current order number or initialize to 1
let orderNumber = parseInt(localStorage.getItem('orderNumber')) || 1;

// Function to show a loading message
function showLoading(message) {
    const cartElement = document.getElementById('cart');
    if (message) {
        const loadingElement = document.createElement('p');
        loadingElement.classList.add('loading');
        loadingElement.innerText = message;
        cartElement.appendChild(loadingElement);
    } else {
        const loadingElement = document.querySelector('.loading');
        if (loadingElement) loadingElement.remove();
    }
}

// Function to update the cart display
function updateCartDisplay() {
    const cartContainer = document.getElementById('cart');
    if (cart.length === 0) {
        cartContainer.innerHTML = '<p>Your cart is empty.</p>';
    } else {
        let cartContent = '<ul>';
        let totalPrice = 0;
        cart.forEach((item) => {
            cartContent += `<li>
                ${item.name} - Php ${item.price.toFixed(2)} x ${item.quantity}
                <button class="remove-item" data-id="${item.id}">Remove</button>
            </li>`;
            totalPrice += item.price * item.quantity;
        });
        cartContent += `</ul><p>Total: Php ${totalPrice.toFixed(2)}</p>`;
        cartContainer.innerHTML = cartContent;

        // Attach event listeners for the remove buttons
        document.querySelectorAll('.remove-item').forEach((button) => {
            button.addEventListener('click', function () {
                const itemId = this.getAttribute('data-id');
                removeFromCart(itemId);
            });
        });
    }
}

// Function to add an item to the cart
function addToCart(item) {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...item, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
    alert(`${item.name} has been added to your cart.`);
}

// Function to remove an item from the cart
function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
}

// Function to generate and show a receipt
function showReceipt() {
    const receiptContent = `
        <div class="receipt">
            <h2>Order Receipt</h2>
            <p>Order Number: ${orderNumber}</p>
            <ul>
                ${cart.map(item => `<li>${item.name} x ${item.quantity} - Php ${(item.price * item.quantity).toFixed(2)}</li>`).join('')}
            </ul>
            <p>Total: Php ${cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}</p>
            <button id="closeReceipt">Close</button>
        </div>
    `;

    const receiptContainer = document.createElement('div');
    receiptContainer.classList.add('receipt-container');
    receiptContainer.innerHTML = receiptContent;

    document.body.appendChild(receiptContainer);

    document.getElementById('closeReceipt').addEventListener('click', () => {
        document.body.removeChild(receiptContainer);
    });

    orderNumber++;
    localStorage.setItem('orderNumber', orderNumber); // Update order number in localStorage
}

// Function to process the order
function processOrder() {
    if (cart.length === 0) {
        alert("Your cart is empty! Please add items to your cart before buying.");
        return;
    }

    showReceipt();

    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
}

// Event listener for "Add to Cart" buttons (for products)
document.body.addEventListener('click', function (event) {
    if (event.target.classList.contains('btnskewer')) {
        const item = {
            id: event.target.getAttribute('data-id'),
            name: event.target.getAttribute('data-name'),
            price: parseFloat(event.target.getAttribute('data-price')),
            img: event.target.getAttribute('data-img')
        };
        addToCart(item);
    }
});

// Event listener for "Buy Now" button
document.getElementById('buyNowBtn').addEventListener('click', processOrder);

// Initial call to update the cart display on page load
updateCartDisplay();
