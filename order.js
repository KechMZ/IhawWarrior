function loadOrders() {
    const userId = 1; // Replace with actual user ID
    console.log('Fetching orders for userId:', userId); // Log the fetch request

    fetch(`http://localhost:5000/getOrders?userId=${userId}`)
        .then(response => response.json())
        .then(data => {
            console.log('Received orders data:', data); // Log the data from the API
            
            const ordersList = document.getElementById('ordersList');
            if (!data || data.length === 0) {
                ordersList.innerHTML = '<p>No orders placed yet.</p>';
            } else {
                let ordersHTML = '';
                data.forEach(order => {
                    console.log('Order:', order); // Log each order data for debugging
                    const itemsHTML = order.items.map(item => 
                        `<li>${item.name} x ${item.quantity} - Php ${item.price.toFixed(2)}</li>`
                    ).join('');
                    ordersHTML += `  
                        <div class="order">
                            <h3>Order #${order.orderNumber}</h3>
                            <ul>${itemsHTML}</ul>
                            <p>Total: Php ${order.totalPrice.toFixed(2)}</p>
                        </div>
                    `;
                });
                ordersList.innerHTML = ordersHTML; // Insert the orders into the DOM
            }
        })
        .catch(error => {
            console.error('Error fetching orders:', error); // Log any errors during fetch
        });
}

// Call the loadOrders function on page load
loadOrders();
