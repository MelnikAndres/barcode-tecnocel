// Registrar una venta en la hoja "ventas"
function registrarVenta(codigo, nombre, precioListado, precioVendido) {
  const ss = SpreadsheetApp.openById('1YTKv0ziQasi9Lwm05z4AqgJ0d_eyXYeWSxMc4j7BEfQ');
  let sheet = ss.getSheetByName('ventas');
  if (!sheet) {
    sheet = ss.insertSheet('ventas');
    sheet.appendRow(['codigo', 'nombre', 'precio listado', 'precio vendido']);
  }
  sheet.appendRow([codigo, nombre, precioListado, precioVendido]);
}
function doGet(e) {
  const ss = SpreadsheetApp.openById('1YTKv0ziQasi9Lwm05z4AqgJ0d_eyXYeWSxMc4j7BEfQ');
  const sheet = ss.getSheetByName('stock');
  const codigo = e.parameter.codigo;
  if (!codigo) {
    return ContentService.createTextOutput(JSON.stringify({ error: 'Falta el parámetro codigo' })).setMimeType(ContentService.MimeType.JSON);
  }
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idxCodigo = headers.indexOf('codigo');
  const idxNombre = headers.indexOf('nombre');
  const idxPrecio = headers.indexOf('precio');
  const idxCantidad = headers.indexOf('cantidad');
  const producto = data.slice(1).find(row => String(row[idxCodigo]) === String(codigo));
  if (!producto) {
    return ContentService.createTextOutput(JSON.stringify({ error: 'Producto no encontrado' })).setMimeType(ContentService.MimeType.JSON);
  }
  const result = {
    codigo: producto[idxCodigo],
    nombre: producto[idxNombre],
    precio: producto[idxPrecio],
    cantidad: producto[idxCantidad]
  };
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const ss = SpreadsheetApp.openById('1YTKv0ziQasi9Lwm05z4AqgJ0d_eyXYeWSxMc4j7BEfQ');
  const sheet = ss.getSheetByName('stock');
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: 'JSON inválido' })).setMimeType(ContentService.MimeType.JSON);
  }
  // Si el body tiene "venta", registrar en ventas
  if (data.venta === true) {
    const { codigo, precioVendido } = data;
    if (!codigo || precioVendido === undefined) {
      return ContentService.createTextOutput(JSON.stringify({ error: 'Faltan campos requeridos para venta' })).setMimeType(ContentService.MimeType.JSON);
    }
    // Buscar producto en stock
    const allData = sheet.getDataRange().getValues();
    const headers = allData[0];
    const idxCodigo = headers.indexOf('codigo');
    const idxNombre = headers.indexOf('nombre');
    const idxPrecio = headers.indexOf('precio');
    const idxCantidad = headers.indexOf('cantidad');
    const rowIndex = allData.slice(1).findIndex(row => String(row[idxCodigo]) === String(codigo));
    if (rowIndex === -1) {
      return ContentService.createTextOutput(JSON.stringify({ error: 'El código no existe en stock' })).setMimeType(ContentService.MimeType.JSON);
    }
    const producto = allData[rowIndex + 1]; // +1 por el header
    let cantidadActual = Number(producto[idxCantidad]);
    if (isNaN(cantidadActual) || cantidadActual < 1) {
      return ContentService.createTextOutput(JSON.stringify({ error: 'Sin stock disponible' })).setMimeType(ContentService.MimeType.JSON);
    }
    // Tomar nombre y precio listado del stock
    const nombre = producto[idxNombre];
    const precioListado = producto[idxPrecio];
    // Descontar 1 unidad
    cantidadActual -= 1;
    // Actualizar cantidad en la hoja
    sheet.getRange(rowIndex + 2, idxCantidad + 1).setValue(cantidadActual); // +2 por header y base 1
    // Registrar la venta
    registrarVenta(codigo, nombre, precioListado, precioVendido);
    return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
  }
  // Alta de producto normal
  const { codigo, nombre, precio, cantidad } = data;
  if (!codigo || !nombre || precio === undefined || cantidad === undefined) {
    return ContentService.createTextOutput(JSON.stringify({ error: 'Faltan campos requeridos' })).setMimeType(ContentService.MimeType.JSON);
  }
  // Verificar si el código ya existe
  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];
  const idxCodigo = headers.indexOf('codigo');
  const codigoExiste = allData.slice(1).some(row => String(row[idxCodigo]) === String(codigo));
  if (codigoExiste) {
    return ContentService.createTextOutput(JSON.stringify({ error: 'El código ya existe' })).setMimeType(ContentService.MimeType.JSON);
  }
  sheet.appendRow([codigo, nombre, precio, cantidad]);
  return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
}

