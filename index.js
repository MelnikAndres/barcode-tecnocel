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
const btnProductoBuscar = document.getElementById('btn-producto-buscar');
const ventaCodigoInput = document.getElementById('venta-codigo');
const ventaNombreInput = document.getElementById('venta-nombre');
const ventaPrecioListadoInput = document.getElementById('venta-precio-listado');
const ventaPrecioVendidoInput = document.getElementById('venta-precio-vendido');
const btnVentaScan = document.getElementById('btn-venta-scan');
const btnVentaBuscar = document.getElementById('btn-venta-buscar');
const ventaReader = document.getElementById('venta-reader');
const ventaCantidadInput = document.getElementById('venta-cantidad');
const loaderDiv = document.getElementById('loader');
// Buscar información del producto al hacer clic en el botón buscar del formulario de producto
btnProductoBuscar.onclick = async (e) => {
    e.preventDefault();
    errorDiv.textContent = '';
    const codigo = codigoInput.value.trim();
    if (!codigo) {
        resultDiv.textContent = 'Ingrese un código para buscar.';
        nombreInput.value = '';
        precioInput.value = '';
        cantidadInput.value = '';
        return;
    }
    resultDiv.textContent = 'Buscando producto...';
    showLoader(true);
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
    showLoader(false);
};

function showLoader(show) {
    loaderDiv.style.display = show ? '' : 'none';
}
// Buscar información del producto al hacer clic en el botón buscar
btnVentaBuscar.onclick = async (e) => {
    e.preventDefault();
    showLoader(true);
    await autocompletarVenta(ventaCodigoInput.value.trim());
    showLoader(false);
};
let ventaScanner = null;

// Escanear código en formulario de venta
btnVentaScan.onclick = async (e) => {
    e.preventDefault();
    ventaReader.style.display = '';
    if (!ventaScanner) {
        ventaScanner = new Html5Qrcode('venta-reader');
    }
    ventaScanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 200, formatsToSupport: [Html5QrcodeSupportedFormats.CODE_128, Html5QrcodeSupportedFormats.EAN_13, Html5QrcodeSupportedFormats.EAN_8, Html5QrcodeSupportedFormats.UPC_A, Html5QrcodeSupportedFormats.UPC_E] },
        async (decodedText) => {
            ventaScanner.stop();
            ventaReader.style.display = 'none';
            ventaCodigoInput.value = decodedText;
            await autocompletarVenta(decodedText);
        },
        (error) => {
            // Opcional: manejar errores de escaneo
        }
    );
};

async function autocompletarVenta(codigo) {
    if (!codigo) {
        ventaNombreInput.value = '';
        ventaPrecioListadoInput.value = '';
        ventaCantidadInput.value = '';
        return;
    }
    try {
        showLoader(true);
        const res = await fetch(`${APPSCRIPT_URL}?codigo=${encodeURIComponent(codigo)}`);
        const data = await res.json();
        showLoader(false);
        if (data.error) {
            ventaNombreInput.value = '';
            ventaPrecioListadoInput.value = '';
            ventaCantidadInput.value = '';
            errorDiv.textContent = 'Producto no encontrado en stock para venta.';
        } else {
            ventaNombreInput.value = data.nombre;
            ventaPrecioListadoInput.value = data.precio;
            ventaCantidadInput.value = data.cantidad;
            errorDiv.textContent = '';
        }
    } catch (err) {
        ventaNombreInput.value = '';
        ventaPrecioListadoInput.value = '';
        ventaCantidadInput.value = '';
        showLoader(false);
        errorDiv.textContent = 'Error de red o servidor.';
    }
}
let scanner = null;


const showNavigation = (show) => {
    document.getElementById('navigation').style.display = show ? '' : 'none';
    if (!show) return;
    showMainActions(false);
}

const showMainActions = (show) => {
    document.getElementById('main-actions').style.display = show ? '' : 'none';
    if (!show) return;
    showNavigation(false);
}

const showProductForm = () => {
    form.style.display = '';
    ventaForm.style.display = 'none';
    showNavigation(true);
}

const showVentaForm = () => {
    form.style.display = 'none';
    ventaForm.style.display = '';
    showNavigation(true);
}

const showHome = () => {
    form.style.display = 'none';
    ventaForm.style.display = 'none';
    showReader(false);
    cleanError();
    showMainActions(true);
    resultDiv.textContent = 'Seleccione una acción para comenzar.';
}

const startScanner = () => {
    showLoader(true);
    try {
        if (!scanner) {
            scanner = new Html5Qrcode('reader');
        }
        scanner.start(
            { facingMode: 'environment' },
            { fps: 30, qrbox: 250, formatsToSupport: [Html5QrcodeSupportedFormats.CODE_128, Html5QrcodeSupportedFormats.EAN_13, Html5QrcodeSupportedFormats.EAN_8, Html5QrcodeSupportedFormats.UPC_A, Html5QrcodeSupportedFormats.UPC_E] },
            (decodedText) => {
                scanner.stop();
                reader.style.display = 'none';
                showLoader(false);
                buscarProducto(decodedText);
            },
            (error) => {
                // Opcional: manejar errores de escaneo
            }
        ).then(() => {
            showLoader(false);
        }).catch(() => {
            showLoader(false);
        });
    } catch (e) {
        showLoader(false);
    }
}

const showReader = (show) => {
    reader.style.display = show ? '' : 'none';
    if (!show && scanner) {
        try {
            scanner.stop();
        } catch (e) {
            // no-op, puede que el scanner no esté iniciado
        }
    }
}


const cleanError = () => {
    errorDiv.textContent = '';
}

btnScan.onclick = () => {
    showReader(true);
    showNavigation(true);
    cleanError();
    resultDiv.textContent = 'Escanee un código de barras...';
    startScanner();
};

btnManual.onclick = () => {

    showReader(false);
    showProductForm();
    cleanError();
    resultDiv.textContent = 'Ingrese los datos del producto.';
    form.reset();
};

btnVenta.onclick = () => {

    showReader(false);
    showVentaForm();
    cleanError();
    resultDiv.textContent = 'Ingrese los datos de la venta.';
    ventaForm.reset();
};

btnVolver.onclick = () => {
    showHome();
};

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
    showLoader(true);
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
    showLoader(false);
};

ventaForm.onsubmit = async (e) => {
    e.preventDefault();
    errorDiv.textContent = '';
    const venta = {
        venta: true,
        codigo: ventaCodigoInput.value.trim(),
        precioVendido: parseFloat(ventaPrecioVendidoInput.value)
    };
    if (!venta.codigo || isNaN(venta.precioVendido)) {
        errorDiv.textContent = 'Debe escanear o ingresar un código válido y el precio vendido.';
        return;
    }
    showLoader(true);
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
            ventaNombreInput.value = '';
            ventaPrecioListadoInput.value = '';
        } else {
            errorDiv.textContent = data.error || 'Error al registrar venta.';
        }
    } catch (err) {
        errorDiv.textContent = 'Error de red o servidor.';
    }
    showLoader(false);
};

async function buscarProducto(codigo) {
    resultDiv.textContent = 'Buscando producto...';
    errorDiv.textContent = '';
    form.style.display = '';
    ventaForm.style.display = 'none';
    codigoInput.value = codigo;
    showLoader(true);
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
    showLoader(false);
}
