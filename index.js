const fs = require('fs');
const path = require('path');
const express = require('express');
var app = express();
const port = 8080;
const folderVect = ['temp'];
const obGlobal = {
    obErrors: null
};

// Server Information
console.log(`Dir path: ${__dirname}`);
console.log(`File path: ${__filename}`);
console.log(`Current Working Directory path: ${process.cwd()}`);

// Function To Initialize Errors
function initErrors() {
    const filePath = path.join(__dirname, 'resources', 'errors.json');
    
    try {
        const rawData = fs.readFileSync(filePath, 'utf8');
        const jsonData = JSON.parse(rawData);

        if (jsonData && jsonData.info_errors) {
            jsonData.info_errors.forEach(error => {
                error.image = path.join(jsonData.base_path, error.image);
            });
        }

        obGlobal.obErrors = jsonData;
        console.log('Errors initialized successfully');
    } catch (error) {
        console.error('Error loading error data:', error);
    }
}

// Function That Renders The Error Page
function renderError(res, identifier = null, title = null, text = null, image = null) {
    let error = obGlobal.obErrors.info_errors.find(err => err.identifier === identifier);
    
    if (!error) {
        error = obGlobal.obErrors.default_error;
    }
    
    res.status(identifier || 200).render(path.join(__dirname, 'views', 'pages', 'error.ejs'), {
        error_title: title || error.title,
        error_text: text || error.text,
        error_image: image || error.image
    });
}

// Check And Create Required Folders
function checkAndCreateFolders() {
    folderVect.forEach(folder => {
        const folderPath = path.join(__dirname, folder);
        
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
            console.log(`Folder created: ${folder}`);
        } else {        
            console.log(`Folder already exists: ${folder}`);
        }
    });
}

// Setup
initErrors();
checkAndCreateFolders();
app.use(express.static(path.join(__dirname, 'resources')));

// Page Routes
app.get(['/', '/home', '/index'], (req, res) => {
    res.render(path.join(__dirname, 'views', 'pages', 'index.ejs'));
});
app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, 'resources', 'images', 'ico', 'favicon.ico'));
});
app.get('/shop', (req, res) => {
    res.render(path.join(__dirname, 'views', 'pages', 'shop.ejs'));
});
app.get('/faq', (req, res) => {
    res.render(path.join(__dirname, 'views', 'pages', 'faq.ejs'));
});
app.get('/contact', (req, res) => {
    res.render(path.join(__dirname, 'views', 'pages', 'contact.ejs'));
});
app.get('/mycart', (req, res) => {
    res.render(path.join(__dirname, 'views', 'pages', 'mycart.ejs'));
});
app.get('/*', (req, res) => {
    const resourcePath = path.join(__dirname, req.url);
    // let paramsList = req.params.splt('/');
    
    if (fs.existsSync(resourcePath)) {
        renderError(res, 403);
    } else if (resourcePath.endsWith('.ejs')) {
        renderError(res, 400);
    } else {
        res.render(path.join(__dirname, 'views', 'pages', req.url + '.ejs'),function(err, renderResult) {
            if(err) {
                if(err.message.includes('Failed to lookup view')) {
                    renderError(res, 404);
                } else if (req.url) {
    
                } else {
                    throw err;
                }
            } else {
                res.send(renderResult);
            }
        });
    }
});

// Start Server
app.listen(port);
console.log(`Server started on port ${port}`);