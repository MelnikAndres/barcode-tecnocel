// Cambia esta URL por la de tu endpoint de AppScript desplegado
const APPSCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyGDrkImEFm0VAOKpGANfpQ0aQayJNucH54OdNmAxMLds-Ao6G-EJanxx9vFsLbVvosXg/exec';

const btnScan = document.getElementById('btn-scan');
const btnManual = document.getElementById('btn-manual');
const btnVenta = document.getElementById('btn-venta');
const btnVolver = document.getElementById('btn-volver');
const reader = document.getElementById('reader');
const resultDiv = document.getElementById('result');
const errorDiv = document.getElementById('error');
const form = document.getElementById('product-form');
const ventaForm = document.getElementById('venta-form');
const codigoInput = document.getElementById('codigo');
const nombreInput = document.getElementById('nombre');
const precioInput = document.getElementById('precio');
const cantidadInput = document.getElementById('cantidad');
const ventaCodigoInput = document.getElementById('venta-codigo');
const ventaNombreInput = document.getElementById('venta-nombre');
const ventaPrecioListadoInput = document.getElementById('venta-precio-listado');
const ventaPrecioVendidoInput = document.getElementById('venta-precio-vendido');
let scanner = null;

btnScan.onclick = () => {
    form.style.display = 'none';
    ventaForm.style.display = 'none';
    reader.style.display = '';
    resultDiv.textContent = 'Escanee un código de barras...';
    errorDiv.textContent = '';
    if (!scanner) {
        scanner = new Html5Qrcode('reader');
    }
    scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250, formatsToSupport: [Html5QrcodeSupportedFormats.CODE_128, Html5QrcodeSupportedFormats.EAN_13, Html5QrcodeSupportedFormats.EAN_8, Html5QrcodeSupportedFormats.UPC_A, Html5QrcodeSupportedFormats.UPC_E] },
        (decodedText) => {
            scanner.stop();
            reader.style.display = 'none';
            buscarProducto(decodedText);
        },
        (error) => {
            // Opcional: manejar errores de escaneo
        }
    );
};

btnManual.onclick = () => {
    if (scanner) {
        scanner.stop();
    }
    reader.style.display = 'none';
    form.style.display = '';
    ventaForm.style.display = 'none';
    resultDiv.textContent = 'Ingrese los datos del producto.';
    errorDiv.textContent = '';
    form.reset();
};

btnVenta.onclick = () => {
    if (scanner) {
        scanner.stop();
    }
    reader.style.display = 'none';
    form.style.display = 'none';
    ventaForm.style.display = '';
    resultDiv.textContent = 'Ingrese los datos de la venta.';
    errorDiv.textContent = '';
    ventaForm.reset();
};

btnVolver.onclick = () => {
    ventaForm.style.display = 'none';
    form.style.display = 'none';
    reader.style.display = 'none';
    btnVolver.style.display = 'none';
    resultDiv.textContent = 'Seleccione una acción para comenzar.';
    errorDiv.textContent = '';
};

// Mostrar botón volver solo cuando ventaForm está visible
ventaForm.addEventListener('show', () => {
    btnVolver.style.display = '';
});
ventaForm.addEventListener('hide', () => {
    btnVolver.style.display = 'none';
});

form.onsubmit = async (e) => {
    e.preventDefault();
    errorDiv.textContent = '';
    const producto = {
        codigo: codigoInput.value.trim(),
        nombre: nombreInput.value.trim(),
        precio: parseFloat(precioInput.value),
        cantidad: parseInt(cantidadInput.value)
    };
    if (!producto.codigo || !producto.nombre || isNaN(producto.precio) || isNaN(producto.cantidad)) {
        errorDiv.textContent = 'Todos los campos son obligatorios.';
        return;
    }
    try {
        const res = await fetch(APPSCRIPT_URL, {
            method: 'POST',
            redirect: 'follow', 
            body: JSON.stringify(producto)
        });
        const data = await res.json();
        if (data.success) {
            resultDiv.textContent = 'Producto guardado correctamente.';
            form.reset();
        } else {
            errorDiv.textContent = data.error || 'Error al guardar.';
        }
    } catch (err) {
        errorDiv.textContent = 'Error de red o servidor.';
    }
};

ventaForm.onsubmit = async (e) => {
    e.preventDefault();
    errorDiv.textContent = '';
    const venta = {
        venta: true,
        codigo: ventaCodigoInput.value.trim(),
        nombre: ventaNombreInput.value.trim(),
        precioListado: parseFloat(ventaPrecioListadoInput.value),
        precioVendido: parseFloat(ventaPrecioVendidoInput.value)
    };
    if (!venta.codigo || !venta.nombre || isNaN(venta.precioListado) || isNaN(venta.precioVendido)) {
        errorDiv.textContent = 'Todos los campos de la venta son obligatorios.';
        return;
    }
    try {
        const res = await fetch(APPSCRIPT_URL, {
            method: 'POST',
            redirect: 'follow',
            body: JSON.stringify(venta)
        });
        const data = await res.json();
        if (data.success) {
            resultDiv.textContent = 'Venta registrada correctamente.';
            ventaForm.reset();
        } else {
            errorDiv.textContent = data.error || 'Error al registrar venta.';
        }
    } catch (err) {
        errorDiv.textContent = 'Error de red o servidor.';
    }
};

async function buscarProducto(codigo) {
    resultDiv.textContent = 'Buscando producto...';
    errorDiv.textContent = '';
    form.style.display = '';
    ventaForm.style.display = 'none';
    codigoInput.value = codigo;
    try {
        const res = await fetch(`${APPSCRIPT_URL}?codigo=${encodeURIComponent(codigo)}`,
            { redirect: 'follow' }
        );
        const data = await res.json();
        if (data.error) {
            resultDiv.textContent = 'Producto no encontrado. Puede crearlo:';
            nombreInput.value = '';
            precioInput.value = '';
            cantidadInput.value = '';
        } else {
            resultDiv.textContent = 'Producto encontrado. Puede editar y guardar:';
            nombreInput.value = data.nombre;
            precioInput.value = data.precio;
            cantidadInput.value = data.cantidad;
        }
    } catch (err) {
        errorDiv.textContent = 'Error de red o servidor.';
    }
}
