let editingProductId = null;
let currentImageUrl = '';
let customOptions = [];

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
                ${product.opciones && product.opciones.length > 0 ? 
                    `<div class="product-options" style="font-size: 12px; color: #4a6cf7; margin-top: 5px;">
                        Opciones: ${product.opciones.map(o => o.nombre).join(', ')}
                    </div>` : ''
                }
            </div>
            <div class="product-actions">
                <button class="edit-btn" onclick="editProduct('${product.id}')">Editar</button>
                <button class="delete-btn" onclick="deleteProduct('${product.id}')">Eliminar</button>
            </div>
        `;
        grid.appendChild(productCard);
    });
}

// ===== FUNCIONES PARA OPCIONES PERSONALIZADAS =====

function addCustomOption() {
    const container = document.getElementById('customOptionsContainer');
    const optionId = Date.now();
    
    const optionHtml = `
        <div class="option-item" id="option-${optionId}">
            <div class="option-header">
                <input type="text" class="form-input option-name-input" placeholder="Nombre de la opción (ej: Color)" value="Color">
                <button type="button" class="btn-remove-option" onclick="removeOption(${optionId})">× Eliminar</button>
            </div>
            <div class="option-values" id="values-${optionId}">
                <div class="value-item">
                    <input type="text" class="value-input" placeholder="Valor (ej: Negro)" value="Negro">
                    <button type="button" class="btn-remove-value" onclick="removeValue(${optionId}, 0)">×</button>
                </div>
                <div class="value-item">
                    <input type="text" class="value-input" placeholder="Valor (ej: Blanco)" value="Blanco">
                    <button type="button" class="btn-remove-value" onclick="removeValue(${optionId}, 1)">×</button>
                </div>
            </div>
            <button type="button" class="btn-add-value" onclick="addValue(${optionId})">+ Agregar Valor</button>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', optionHtml);
    customOptions.push({
        id: optionId,
        name: 'Color',
        values: ['Negro', 'Blanco']
    });
}

function removeOption(optionId) {
    document.getElementById(`option-${optionId}`).remove();
    customOptions = customOptions.filter(opt => opt.id !== optionId);
}

function addValue(optionId) {
    const valuesContainer = document.getElementById(`values-${optionId}`);
    const valueIndex = valuesContainer.children.length;
    
    const valueHtml = `
        <div class="value-item">
            <input type="text" class="value-input" placeholder="Nuevo valor">
            <button type="button" class="btn-remove-value" onclick="removeValue(${optionId}, ${valueIndex})">×</button>
        </div>
    `;
    
    valuesContainer.insertAdjacentHTML('beforeend', valueHtml);
    
    const optionIndex = customOptions.findIndex(opt => opt.id === optionId);
    if (optionIndex !== -1) {
        customOptions[optionIndex].values.push('');
    }
}

function removeValue(optionId, valueIndex) {
    const valueItem = document.querySelector(`#values-${optionId} .value-item:nth-child(${valueIndex + 1})`);
    if (valueItem) {
        valueItem.remove();
    }
    
    const optionIndex = customOptions.findIndex(opt => opt.id === optionId);
    if (optionIndex !== -1 && valueIndex < customOptions[optionIndex].values.length) {
        customOptions[optionIndex].values.splice(valueIndex, 1);
    }
}

// ===== FUNCIONES PRINCIPALES =====

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
    document.getElementById('customOptionsContainer').innerHTML = '';
    currentImageUrl = '';
    customOptions = [];
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
            
            // Llenar el formulario
            document.getElementById('modalTitle').textContent = 'Editar Producto';
            document.getElementById('productName').value = product.nombre || '';
            document.getElementById('productDescription').value = product.descripcion || '';
            document.getElementById('productPrice').value = product.precio || '';
            document.getElementById('productStock').value = product.stock || '';
            document.getElementById('productCategory').value = product.categoria || '';
            document.getElementById('imageUrl').value = product.imagen || '';
            
            // Limpiar y cargar opciones personalizadas
            document.getElementById('customOptionsContainer').innerHTML = '';
            customOptions = [];
            
            if (product.opciones && product.opciones.length > 0) {
                product.opciones.forEach((opcion, index) => {
                    const optionId = Date.now() + index;
                    const optionHtml = `
                        <div class="option-item" id="option-${optionId}">
                            <div class="option-header">
                                <input type="text" class="form-input option-name-input" placeholder="Nombre de la opción" value="${opcion.nombre}">
                                <button type="button" class="btn-remove-option" onclick="removeOption(${optionId})">× Eliminar</button>
                            </div>
                            <div class="option-values" id="values-${optionId}">
                                ${opcion.valores.map((valor, valIndex) => `
                                    <div class="value-item">
                                        <input type="text" class="value-input" placeholder="Valor" value="${valor}">
                                        <button type="button" class="btn-remove-value" onclick="removeValue(${optionId}, ${valIndex})">×</button>
                                    </div>
                                `).join('')}
                            </div>
                            <button type="button" class="btn-add-value" onclick="addValue(${optionId})">+ Agregar Valor</button>
                        </div>
                    `;
                    document.getElementById('customOptionsContainer').insertAdjacentHTML('beforeend', optionHtml);
                    customOptions.push({
                        id: optionId,
                        name: opcion.nombre,
                        values: [...opcion.valores]
                    });
                });
            }
            
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

// GUARDAR producto en Firebase (VERSIÓN ACTUALIZADA CON OPCIONES)
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
        
        // Recopilar opciones personalizadas
        const opcionesPersonalizadas = [];
        const optionElements = document.querySelectorAll('.option-item');
        
        optionElements.forEach(optionEl => {
            const nameInput = optionEl.querySelector('.option-name-input');
            const valueInputs = optionEl.querySelectorAll('.value-input');
            
            if (nameInput && nameInput.value) {
                const valores = Array.from(valueInputs)
                    .map(input => input.value)
                    .filter(value => value.trim() !== '');
                
                if (valores.length > 0) {
                    opcionesPersonalizadas.push({
                        nombre: nameInput.value,
                        valores: valores
                    });
                }
            }
        });
        
        const productData = {
            nombre: nombre,
            descripcion: descripcion,
            precio: precio,
            stock: stock,
            imagen: imagen || null,
            categoria: categoria,
            opciones: opcionesPersonalizadas, // NUEVO: Opciones personalizadas
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

// ===== FUNCIONALIDAD DE BÚSQUEDA =====

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            searchProducts(this.value);
        });
    }
});

function searchProducts(searchTerm) {
    const allProducts = document.querySelectorAll('.product-card');
    
    if (!searchTerm || searchTerm.trim() === '') {
        allProducts.forEach(product => {
            product.style.display = 'block';
        });
        return;
    }
    
    const term = searchTerm.toLowerCase().trim();
    let foundResults = false;
    
    allProducts.forEach(product => {
        const productName = product.querySelector('.product-name').textContent.toLowerCase();
        const productDescription = product.querySelector('.product-description').textContent.toLowerCase();
        const productPrice = product.querySelector('.product-price').textContent.toLowerCase();
        
        if (productName.includes(term) || 
            productDescription.includes(term) || 
            productPrice.includes(term)) {
            product.style.display = 'block';
            foundResults = true;
        } else {
            product.style.display = 'none';
        }
    });
    
    const productsGrid = document.getElementById('productsGrid');
    let noResultsMsg = productsGrid.querySelector('.no-results-message');
    
    if (!foundResults) {
        if (!noResultsMsg) {
            noResultsMsg = document.createElement('div');
            noResultsMsg.className = 'no-results-message';
            noResultsMsg.style.gridColumn = '1 / -1';
            noResultsMsg.style.textAlign = 'center';
            noResultsMsg.style.padding = '40px';
            noResultsMsg.style.color = '#666';
            noResultsMsg.innerHTML = `
                <div style="font-size: 3em;">🔍</div>
                <h3>No se encontraron productos</h3>
                <p>No hay productos que coincidan con "${searchTerm}"</p>
            `;
            productsGrid.appendChild(noResultsMsg);
        }
    } else if (noResultsMsg) {
        noResultsMsg.remove();
    }
}

function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
        searchProducts('');
    }
}

