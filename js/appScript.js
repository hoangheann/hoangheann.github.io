function doGet(e) {
  var action = e.parameter.action || 'read';
  if (action === 'write') {
    return handleWriteRequest(e);
  } else {
    var sheetName = e.parameter.sheetName || 'DS Nhóm FB';
    return ContentService.createTextOutput(JSON.stringify(exportData(sheetName))).setMimeType(ContentService.MimeType.JSON);
  }
}

function handleWriteRequest(e) {
  var sheetName = e.parameter.tabSheets || 'Báo cáo';
  var group = e.parameter.group;
  var status = e.parameter.status;
  var url = e.parameter.url;

  if (!group || !status || !url) {
    return ContentService.createTextOutput(JSON.stringify({ error: 'Missing required parameters' })).setMimeType(ContentService.MimeType.JSON);
  }

  var result = logData(sheetName, group, status, url);
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

function logData(sheetName, group, status, url) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) {
    return { error: 'Sheet not found' };
  }

  var lastRow = sheet.getLastRow();
  var lastColumn = sheet.getLastColumn();

  // Check if the last row is empty
  var range = sheet.getRange(lastRow, 1, 1, lastColumn);
  var values = range.getValues();
  var isEmptyRow = values[0].every(cell => cell === "");

  if (isEmptyRow) {
    var rowIndex = lastRow;
  } else {
    var rowIndex = lastRow + 1;
  }

  var timestamp = new Date();
  var formattedTimestamp = Utilities.formatDate(timestamp, Session.getScriptTimeZone(), 'HH:mm dd/MM/yyyy');
  var rowData = [formattedTimestamp, group, status, url];

  sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  return { success: true, timestamp: formattedTimestamp, group: group, status: status, url: url };
}

function exportData(sheetName) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) {
    return { error: 'Sheet not found' };
  }

  var dataRange = sheet.getRange("C2:C" + sheet.getLastRow());
  var data = dataRange.getValues();

  var lastRow = data.findIndex(row => row[0] === "") + 1;

  if (lastRow === 0) {
    lastRow = sheet.getLastRow();
  } else {
    lastRow += 1;
  }

  var resultRange = sheet.getRange("B2:G" + lastRow);
  var resultData = resultRange.getValues();

  var output = [];
  for (var i = 0; i < resultData.length; i++) {
    if (resultData[i][1] !== "") {
      output.push([resultData[i][0], resultData[i][1], resultData[i][3], resultData[i][5]]);
    }
  }

  return output;
}