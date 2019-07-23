// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

let scrape = document.getElementById('scrape');

/*chrome.storage.sync.get('color', function(data) {
  changeColor.style.backgroundColor = data.color;
  changeColor.setAttribute('value', data.color);
});*/

scrape.onclick = () => {

    // Get HTML from web-page

    // Extract plain text
    var plainText = extractContent("<p>Hello</p><a href='http://w3c.org'>W3C</a>.  Nice to <em>see</em><strong><em>you!</em></strong>", true);

    // Create JSON Payload
    //TODO: Extract URL and Header from webpage

    var jsonPayload = {};
    getURLandTitle();
    jsonPayload["url"] = window.localStorage.getItem("uri");
    jsonPayload["header"] = window.localStorage.getItem("head");
    jsonPayload["body"] = plainText;

    // Create an HTTP Request
    //TODO: Add URL
    load("http://trustednews.westus.cloudapp.azure.com/api/get_website_score", JSON.stringify(jsonPayload), verify);

    verify(jsonPayload);
};

function load(url, body, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            callback(xhr.response);
        }
    }
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(body);
};

function extractContent(s, space) {
    var span = document.createElement('span');
    span.innerHTML = s;
    if (space) {
        var children = span.querySelectorAll('*');
        for (var i = 0; i < children.length; i++) {
            if (children[i].textContent)
                children[i].textContent += ' ';
            else
                children[i].innerText += ' ';
        }
    }
    return [span.textContent || span.innerText].toString().replace(/ +/g, ' ');
};

//TODO: Merge getURL and getTitle
function getURLandTitle() {
    chrome.tabs.query({ 'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT },
        function (tabs) {
            window.localStorage.setItem("uri", tabs[0].url);
            window.localStorage.setItem("head", tabs[0].title);
        }
    );
};


function verify(jsonPayloadString) {
    chrome.extension.getBackgroundPage().console.log(jsonPayloadString);
};
