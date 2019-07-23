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
  jsonPayload["URL"]=getURL();
  jsonPayload["Header"]=getTitle();
  jsonPayload["Content"]=plainText;

  // Create an HTTP Request
  //TODO: Add URL
  var request = new XMLHttpRequest();
  request.open("POST", "", true);
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  request.send(JSON.stringify(jsonPayload));

  verify(JSON.stringify(jsonPayload));
};

function extractContent(s, space) {
  var span= document.createElement('span');
  span.innerHTML= s;
  if(space) {
    var children= span.querySelectorAll('*');
    for(var i = 0 ; i < children.length ; i++) {
      if(children[i].textContent)
        children[i].textContent+= ' ';
      else
        children[i].innerText+= ' ';
    }
  }
  return [span.textContent || span.innerText].toString().replace(/ +/g,' ');
};

//TODO: Merge getURL and getTitle
function getURL() {
  chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT},
   function(tabs){
      return tabs[0].url;
   }
  );
};

function getTitle() {
  chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT},
   function(tabs){
      return tabs[0].title;
   }
  );
};

function verify(jsonPayloadString)
{
  chrome.extension.getBackgroundPage().console.log(jsonPayloadString);
};
