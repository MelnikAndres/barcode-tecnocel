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
    return ContentService.createTextOutput(JSON.stringify({ error: 'Falta el parámetro codigo' })).setMimeType(ContentService.MimeType.JSON).setHeader("Access-Control-Allow-Origin", "*");;
  }
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idxCodigo = headers.indexOf('codigo');
  const idxNombre = headers.indexOf('nombre');
  const idxPrecio = headers.indexOf('precio');
  const idxCantidad = headers.indexOf('cantidad');
  const producto = data.slice(1).find(row => String(row[idxCodigo]) === String(codigo));
  if (!producto) {
    return ContentService.createTextOutput(JSON.stringify({ error: 'Producto no encontrado' })).setMimeType(ContentService.MimeType.JSON).setHeader("Access-Control-Allow-Origin", "*");;
  }
  const result = {
    codigo: producto[idxCodigo],
    nombre: producto[idxNombre],
    precio: producto[idxPrecio],
    cantidad: producto[idxCantidad]
  };
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON).setHeader("Access-Control-Allow-Origin", "*");
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
    const { codigo, nombre, precioListado, precioVendido } = data;
    if (!codigo || !nombre || precioListado === undefined || precioVendido === undefined) {
      return ContentService.createTextOutput(JSON.stringify({ error: 'Faltan campos requeridos para venta' })).setMimeType(ContentService.MimeType.JSON);
    }
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

