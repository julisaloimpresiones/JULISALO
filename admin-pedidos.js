let orders = [];

async function loadOrders() {
    try {
        const db = window.firebaseDB;
        const { collection, getDocs, doc, updateDoc } = window.firebaseFunctions;

        const querySnapshot = await getDocs(collection(db, "pedidos"));
        orders = [];

        querySnapshot.forEach((doc) => {
            const orderData = doc.data();
            orders.push({
                id: doc.id,
                ...orderData,
                // Convertir Firebase Timestamp a Date si es necesario
                fecha: orderData.fecha ? (orderData.fecha.toDate ? orderData.fecha.toDate() : orderData.fecha) : new Date()
            });
        });

        updateOrdersUI();
    } catch (error) {
        console.error("Error cargando pedidos:", error);
        alert("Error al cargar pedidos: " + error.message);
    }
}

function updateOrdersUI() {
    const ordersBadge = document.getElementById('ordersBadge');
    const ordersList = document.getElementById('ordersList');
    const pendingOrders = orders.filter(order => order.estado === 'pendiente');

    // Actualizar badge (la bolita roja)
    if (pendingOrders.length > 0) {
        ordersBadge.textContent = pendingOrders.length;
        ordersBadge.style.display = 'inline-block';
    } else {
        ordersBadge.style.display = 'none';
    }

    // Actualizar lista de pedidos
    ordersList.innerHTML = '';

    if (pendingOrders.length === 0) {
        ordersList.innerHTML = '<p>No hay pedidos pendientes</p>';
        return;
    }

    pendingOrders.forEach(order => {
        const orderElement = document.createElement('div');
        orderElement.className = 'order-item';
        orderElement.style.border = '1px solid #ddd';
        orderElement.style.padding = '15px';
        orderElement.style.margin = '10px 0';
        orderElement.style.borderRadius = '5px';

        orderElement.innerHTML = `
            <div class="order-header" style="display: flex; justify-content: between; margin-bottom: 10px;">
                <strong>Pedido #${order.id.slice(-6)}</strong>
                <span class="order-time" style="color: #666;">${new Date(order.fecha).toLocaleString()}</span>
            </div>
            <div class="order-products" style="margin-bottom: 10px;">
                ${order.productos.map(item =>
            `<div>${item.nombre} x${item.quantity} - $${(item.precio * item.quantity).toFixed(2)}</div>`
        ).join('')}
            </div>
            <div class="order-details" style="margin-bottom: 10px;">
    <strong>Total: $${order.total.toFixed(2)}</strong><br>
    <strong>Cliente:</strong> ${order.cliente}<br>
    ${order.tipoEntrega === 'domicilio' ?
                `📍 Domicilio: ${order.direccion}<br>` :
                '🏪 Recoger en local<br>'
            }
    ${order.tipoEntrega === 'domicilio' && order.telefono ?
                `📞 Teléfono: ${order.telefono}<br>` : ''
            }
            </div>
            <div class="order-actions" style="display: flex; gap: 10px;">
                <button class="btn-complete" onclick="completeOrder('${order.id}')" style="padding: 8px 15px; background: #28a745; color: white; border: none; border-radius: 3px; cursor: pointer;">Marcar como Completado</button>
                <button class="btn-invoice" onclick="generateInvoice('${order.id}')" style="padding: 8px 15px; background: #17a2b8; color: white; border: none; border-radius: 3px; cursor: pointer;">Generar Factura</button>
            </div>
        `;
        ordersList.appendChild(orderElement);
    });
}

async function completeOrder(orderId) {
    if (confirm('¿Marcar este pedido como completado?')) {
        try {
            const db = window.firebaseDB;
            const { doc, updateDoc } = window.firebaseFunctions;

            await updateDoc(doc(db, "pedidos", orderId), {
                estado: 'completado'
            });

            await loadOrders();
            alert('Pedido marcado como completado');
        } catch (error) {
            console.error("Error completando pedido:", error);
            alert("Error al completar pedido");
        }
    }
}

function generateInvoice(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) {
        alert('No se encontró el pedido');
        return;
    }
    
    const invoiceWindow = window.open('', '_blank', 'width=350,height=600');
    const invoiceHTML = `
        <html>
        <head>
            <title>Factura Julisalo</title>
            <style>
                @media print {
                    body { 
                        width: 80mm !important; 
                        max-width: 80mm !important;
                        margin: 2mm !important; 
                        padding: 0 !important; 
                        font-family: 'Courier New', monospace !important;
                        font-size: 10px !important;
                        line-height: 1.2 !important;
                    }
                    .no-print { display: none !important; }
                    * {
                        box-sizing: border-box !important;
                    }
                }
                body { 
                    width: 80mm; 
                    max-width: 80mm;
                    margin: 0 auto; 
                    padding: 5px; 
                    font-family: 'Courier New', monospace;
                    font-size: 10px;
                    line-height: 1.2;
                    background: white;
                }
                .header { 
                    text-align: center; 
                    border-bottom: 1px dashed #000; 
                    padding-bottom: 3px;
                    margin-bottom: 3px;
                }
                .business-name {
                    font-weight: bold;
                    font-size: 12px;
                    margin: 2px 0;
                }
                .receipt-title {
                    font-size: 11px;
                    margin: 2px 0;
                }
                .details { 
                    margin: 5px 0; 
                    font-size: 9px;
                }
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin: 5px 0;
                    font-size: 9px;
                }
                th, td { 
                    padding: 2px 1px; 
                    text-align: left; 
                    vertical-align: top;
                }
                .product-name {
                    max-width: 45mm;
                    word-break: break-word;
                }
                .text-right { text-align: right; }
                .text-center { text-align: center; }
                .text-left { text-align: left; }
                .total { 
                    font-weight: bold; 
                    border-top: 1px dashed #000;
                    padding-top: 3px;
                    margin-top: 3px;
                    font-size: 11px;
                }
                .footer { 
                    margin-top: 8px; 
                    text-align: center; 
                    font-size: 8px; 
                    color: #666;
                    border-top: 1px dashed #000;
                    padding-top: 3px;
                }
                .divider {
                    border-bottom: 1px dashed #000;
                    margin: 3px 0;
                }
                .line {
                    display: block;
                    margin: 1px 0;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="business-name">LOCAL JULISALO</div>
                <div class="receipt-title">*** FACTURA ***</div>
                <div class="line">${new Date(order.fecha).toLocaleDateString()}</div>
                <div class="line">${new Date(order.fecha).toLocaleTimeString()}</div>
            </div>
            
            <div class="details">
                <div class="line"><strong>Cliente:</strong> ${order.cliente}</div>
                <div class="line"><strong>Pedido:</strong> #${order.id.slice(-6)}</div>
                <div class="line"><strong>Entrega:</strong> ${order.tipoEntrega === 'domicilio' ? 'Domicilio' : 'Local'}</div>
                ${order.tipoEntrega === 'domicilio' ? `<div class="line"><strong>Dir:</strong> ${order.direccion}</div>` : ''}
                ${order.tipoEntrega === 'domicilio' && order.telefono ? `<div class="line"><strong>Tel:</strong> ${order.telefono}</div>` : ''}
            </div>
            
            <div class="divider"></div>
            
            <table>
                <thead>
                    <tr>
                        <th class="text-left">Producto</th>
                        <th class="text-right">Cant</th>
                        <th class="text-right">P.Unit</th>
                        <th class="text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.productos.map(item => `
                        <tr>
                            <td class="text-left product-name">${item.nombre.length > 20 ? item.nombre.substring(0, 20) + '...' : item.nombre}</td>
                            <td class="text-right">${item.quantity}</td>
                            <td class="text-right">$${item.precio.toFixed(2)}</td>
                            <td class="text-right">$${(item.precio * item.quantity).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="divider"></div>
            
            <div class="total text-right">
                TOTAL: $${order.total.toFixed(2)}
            </div>
            
            <div class="footer">
                <div class="line">¡Gracias por su compra!</div>
                <div class="line">Local Julisalo</div>
                <div class="line">IG: @T4po.0</div>
                <div class="no-print">
                    <br>
                    <button onclick="window.print()" style="padding: 3px 6px; font-size: 9px; margin: 2px;">🖨️ Imprimir</button>
                    <button onclick="window.close()" style="padding: 3px 6px; font-size: 9px; margin: 2px;">❌ Cerrar</button>
                </div>
            </div>
            
            <script>
                window.onload = function() {
                    // Auto-ajustar para impresión
                    setTimeout(() => {
                        // Forzar redimensionamiento para impresión
                        document.body.style.width = '80mm';
                        document.body.style.maxWidth = '80mm';
                    }, 100);
                }
                
                // También imprimir automáticamente después de 1 segundo
                setTimeout(() => {
                    window.print();
                }, 1000);
            </script>
        </body>
        </html>
    `;
    
    invoiceWindow.document.write(invoiceHTML);
    invoiceWindow.document.close();
}

function openOrders() {
    loadOrders();
    document.getElementById('ordersModal').style.display = 'flex';
}

function closeOrders() {
    document.getElementById('ordersModal').style.display = 'none';
}

// Cargar pedidos automáticamente cada 30 segundos
setInterval(loadOrders, 30000);