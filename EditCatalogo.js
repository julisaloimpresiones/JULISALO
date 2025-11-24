let editingProductId = null;
let currentImageUrl = '';

// Cargar productos al iniciar
document.addEventListener('DOMContentLoaded', function() {
    loadProductsFromFirebase();
});

// CARGAR productos desde Firebase
async function loadProductsFromFirebase() {
    try {
        const db = window.firebaseDB;
        const { collection, getDocs } = window.firebaseFunctions;
        
        const querySnapshot = await getDocs(collection(db, "productos"));
        const products = [];
        
        querySnapshot.forEach((doc) => {
            products.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        renderProducts(products);
    } catch (error) {
        console.error("Error cargando productos:", error);
        alert("Error al cargar productos");
    }
}

// Mostrar productos en pantalla
function renderProducts(products) {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image">
                ${product.imagen ? 
                    `<img src="${product.imagen}" alt="${product.nombre}" onerror="this.style.display='none'; this.parentNode.innerHTML='📷 Imagen no disponible';">` : 
                    '📷 Sin imagen'
                }
            </div>
            <div class="product-info">
                <div class="product-name">${product.nombre}</div>
                <div class="product-price">$${product.precio.toFixed(2)}</div>
                <div class="product-stock">Disponible: ${product.stock} unidades</div>
                <div class="product-description" style="font-size: 14px; color: #666; margin-top: 8px;">${product.descripcion}</div>
            </div>
            <div class="product-actions">
                <button class="edit-btn" onclick="editProduct('${product.id}')">Editar</button>
                <button class="delete-btn" onclick="deleteProduct('${product.id}')">Eliminar</button>
            </div>
        `;
        grid.appendChild(productCard);
    });
}

// Abrir modal para agregar producto
function openAddModal() {
    editingProductId = null;
    document.getElementById('modalTitle').textContent = 'Agregar Nuevo Producto';
    document.getElementById('productName').value = '';
    document.getElementById('productDescription').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productStock').value = '';
    document.getElementById('productCategory').value = '';
    document.getElementById('imageUrl').value = '';
    document.getElementById('imagePreview').innerHTML = '📷 Ingresa una URL para ver la vista previa';
    currentImageUrl = '';
    document.getElementById('productModal').style.display = 'flex';
}

// Vista previa de imagen desde URL
function previewImageUrl(url) {
    currentImageUrl = url;
    const preview = document.getElementById('imagePreview');
    
    if (url && isValidUrl(url)) {
        preview.innerHTML = `<img src="${url}" class="image-preview" onerror="this.parentNode.innerHTML='❌ Error al cargar imagen'">`;
    } else if (url) {
        preview.innerHTML = '❌ URL no válida';
    } else {
        preview.innerHTML = '📷 Ingresa una URL para ver la vista previa';
    }
}

// Validar URL
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Editar producto existente
async function editProduct(id) {
    try {
        const db = window.firebaseDB;
        const { doc, getDoc } = window.firebaseFunctions;
        
        const productDoc = await getDoc(doc(db, "productos", id));
        
        if (productDoc.exists()) {
            const product = productDoc.data();
            editingProductId = id;
            
            document.getElementById('modalTitle').textContent = 'Editar Producto';
            document.getElementById('productName').value = product.nombre;
            document.getElementById('productDescription').value = product.descripcion;
            document.getElementById('productPrice').value = product.precio;
            document.getElementById('productStock').value = product.stock;
            document.getElementById('productCategory').value = product.categoria || '';
            document.getElementById('imageUrl').value = product.imagen || '';
            
            if (product.imagen) {
                previewImageUrl(product.imagen);
            } else {
                document.getElementById('imagePreview').innerHTML = '📷 Ingresa una URL para ver la vista previa';
            }
            
            document.getElementById('productModal').style.display = 'flex';
        }
    } catch (error) {
        console.error("Error editando producto:", error);
        alert("Error al cargar producto para editar");
    }
}

// Eliminar producto
async function deleteProduct(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
        try {
            const db = window.firebaseDB;
            const { doc, deleteDoc } = window.firebaseFunctions;
            
            await deleteDoc(doc(db, "productos", id));
            await loadProductsFromFirebase();
            alert("Producto eliminado correctamente");
        } catch (error) {
            console.error("Error eliminando producto:", error);
            alert("Error al eliminar producto");
        }
    }
}

// GUARDAR producto en Firebase
async function saveProduct() {
    const nombre = document.getElementById('productName').value;
    const descripcion = document.getElementById('productDescription').value;
    const precio = parseFloat(document.getElementById('productPrice').value);
    const stock = parseInt(document.getElementById('productStock').value);
    const imagen = currentImageUrl;
    const categoria = document.getElementById('productCategory').value;
    
    if (!nombre || !descripcion || isNaN(precio) || isNaN(stock)) {
        alert('Por favor, completa todos los campos correctamente.');
        return;
    }
    
    try {
        const db = window.firebaseDB;
        const { collection, addDoc, doc, updateDoc } = window.firebaseFunctions;
        
        const productData = {
            nombre: nombre,
            descripcion: descripcion,
            precio: precio,
            stock: stock,
            imagen: imagen || null,
            categoria: categoria,
            fechaActualizacion: new Date()
        };
        
        if (editingProductId) {
            // Actualizar producto existente
            await updateDoc(doc(db, "productos", editingProductId), productData);
        } else {
            // Agregar nuevo producto
            await addDoc(collection(db, "productos"), productData);
        }
        
        await loadProductsFromFirebase();
        closeModal();
        alert('Producto guardado exitosamente!');
        
    } catch (error) {
        console.error("Error guardando producto:", error);
        alert("Error al guardar producto");
    }
}

// Cerrar modal
function closeModal() {
    document.getElementById('productModal').style.display = 'none';
}

// Cerrar modal al hacer clic fuera
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        closeModal();
    }
}
