console.log("Initialized");

let fileDrop = document.getElementById('file-input');
let dropzone = document.getElementById('dropzone');
let dataTable = document.getElementById('dicom-data-body');
let fileIsLoaded = false;

document.addEventListener("DOMContentLoaded", function() {
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-input');

    dropzone.addEventListener('click', function() {
        fileInput.click();
    });
});

function readObject(obj) {
    let result = {};
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (typeof obj[key] === 'object') {
                result[key] = readObject(obj[key]);
            } else {
                result[key] = obj[key];
            }
        }
    }
    return result;
}

function createAccordionTable(obj) {
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    
    const newTable = document.createElement('table');
    newTable.className = 'table table-bordered table-sm';
    const newTableBody = document.createElement('tbody');
    newTable.appendChild(newTableBody);
    for (let key in obj) {
        const newRow = newTableBody.insertRow();
        const newCell1 = newRow.insertCell(0);
        const newCell2 = newRow.insertCell(1);
        newCell1.innerHTML = key;

        if (typeof obj[key] === 'object') {
            // newCell2.innerHTML = createAccordionTable(obj[key]);
            const accordionTable = createAccordionTable(obj[key]);
            newCell2.appendChild(accordionTable);
        } else {
            newCell2.innerHTML = obj[key];
        }

    }

    summary.innerHTML = `Expand: ${Object.keys(obj).length} item(s)`;
    details.appendChild(summary);
    details.appendChild(newTable);
    return details;
}

function loadDicom (e, file) {
    // Remove previous error messages if any
    let container = document.getElementById('container');
    container.querySelectorAll('.dicom-alert').forEach(alert => alert.remove());

    // Reset the file input so the same file can be re-dropped if needed
    fileDrop.value = '';

    // Clear the table
    dataTable.innerHTML = '';

    try {
        dcmjs.data.DicomMessage.readFile(e.target.result); 
    } catch (error) {
        notValidFile(e, file);
        return;
    } 

    const DicomDict = dcmjs.data.DicomMessage.readFile(e.target.result);
    const dataSet = dcmjs.data.DicomMetaDictionary.naturalizeDataset(DicomDict.dict);   

    // Get all keys and values from the dataset
    const keys = Object.keys(dataSet);
    const values = Object.values(dataSet);

    // Populate the table with the data
    for (let i = 0; i < keys.length; i++) {
        if (keys[i] === 'PixelData') {
            continue;
        }

        const row = dataTable.insertRow();
        const cell1 = row.insertCell(0);
        const cell2 = row.insertCell(1);
        cell1.innerHTML = keys[i];
        // cell2.innerHTML = values[i];

        // Check if the value is an object
        if (typeof values[i] === 'object') {
            object = readObject(values[i]);

            // Create an accordion table
            const accordionTable = createAccordionTable(object);
            cell2.appendChild(accordionTable);

        } else {
            cell2.innerHTML = values[i];
        }
    }
}

function notValidFile(e, file) {
    let table = document.getElementById('dicom-data');
    table.innerHTML = '';

    let container = document.getElementById('container');

    let alert = document.createElement('div');
    alert.className = 'dicom-alert';
    alert.innerHTML = 'Not a valid DICOM file';
    container.appendChild(alert);

}

FileReaderJS.setupDrop(dropzone, {
    dragClass: "file-input-drag",
    readAsDefault: 'ArrayBuffer',
    on: {
        load: loadDicom,
        error: function(e, file) {
            console.log('Not a valid DICOM file: ', file);
        }
    }
});

FileReaderJS.setupInput(fileDrop, {
    readAsDefault: 'ArrayBuffer',
    on: {
        load: loadDicom,
        error: function(e, file) {
            console.log('Not a valid DICOM file: ', file);
        }
    }
});

FileReaderJS.setupClipboard(document.body, {
    readAsDefault: 'ArrayBuffer',
    on: {
        load: loadDicom,
        error: function(e, file) {
            console.log('Not a valid DICOM file: ', file);
        }
    }
});
