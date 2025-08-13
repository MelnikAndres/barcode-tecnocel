function doGet(e) {
  const ss = SpreadsheetApp.openById('1YTKv0ziQasi9Lwm05z4AqgJ0d_eyXYeWSxMc4j7BEfQ');
  const sheet = ss.getSheetByName('info');
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
  const sheet = ss.getSheetByName('info');
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: 'JSON inválido' })).setMimeType(ContentService.MimeType.JSON);
  }
  const { codigo, nombre, precio, cantidad } = data;
  if (!codigo || !nombre || precio === undefined || cantidad === undefined) {
    return ContentService.createTextOutput(JSON.stringify({ error: 'Faltan campos requeridos' })).setMimeType(ContentService.MimeType.JSON);
  }
  sheet.appendRow([codigo, nombre, precio, cantidad]);
  return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
}

