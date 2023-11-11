// ==UserScript==
// @name         Takealot Price Tracker
// @namespace    http://tampermonkey.net/
// @version      0.2.1
// @description  try to take over the world!
// @author       Murdock
// @match        https://www.takealot.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=takealot.com
// @grant        none
// ==/UserScript==


(window.onload =function() {
    'use strict';

    // Function to create and append the button
    function createPriceHistoryButton() {
        const button = document.createElement("button");
        button.innerHTML = "Price History";
        button.setAttribute("id", "Tracker");
        button.addEventListener("click", openPriceHistory, false);
        button.setAttribute("style", "padding: 5px 5px; margin: 5px 0px 5px 15px; border-radius: 8px; font-size: 16px; position: absolute; text-align: center; border: 2px solid #000000; box-shadow: 0 3px 4px 0 rgba(0,0,0,0.24), 0 17px 50px 0 rgba(0,0,0,0.19); background-color: #B2BEB5;");

        const targetElement = document.querySelector(".buybox-module_price_2YUFa");
        if (targetElement) {
            targetElement.appendChild(button);
        } else {
            console.error("Target element not found.");
        }
    }

    // Function to open the price history window
    function openPriceHistory() {
        const productId = document.documentURI.split("/")[4];
        const url = `https://www.servaltracker.com/products/${productId}`;
        const pop = window.open(url, "MsgWindow", "width=575,height=600,menubar=0,status=0,titlebar=0,toolbar=0");

        if (!pop) {
            console.error("Failed to open the price history window.");
        }
    }

    // Execute after a delay
    setTimeout(createPriceHistoryButton, 800);
})();



