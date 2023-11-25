// ==UserScript==
// @name         Takealot Price Tracker
// @namespace    http://tampermonkey.net/
// @version      0.3.5
// @description  try to take over the world!
// @author       Murdock
// @match        https://www.takealot.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=takealot.com
// @grant        none
// ==/UserScript==


(window.onload =function() {
    'use strict';
    var targetElement = document.getElementById('Tracker');
        if (targetElement) {
           targetElement.remove()
        } else {
            console.error("Target element not found.");
        }
        targetElement = document.getElementById('line1');
        if (targetElement) {
           targetElement.remove()
        } else {
            console.error("Target element not found.");
        }
        targetElement = document.getElementById('line2');
        if (targetElement) {
           targetElement.remove()
        } else {
            console.error("Target element not found.");
        }
    setTimeout(createPriceHistoryButton, 800);
})();
(window.onresize =function() {
        var targetElement = document.getElementById('Tracker');
        if (targetElement) {
           targetElement.remove()
        } else {
            console.error("Target element not found.");
        }
        targetElement = document.getElementById('line1');
        if (targetElement) {
           targetElement.remove()
        } else {
            console.error("Target element not found.");
        }
        targetElement = document.getElementById('line2');
        if (targetElement) {
           targetElement.remove()
        } else {
            console.error("Target element not found.");
        }

    setTimeout(createPriceHistoryButton, 800);
})();

    // Function to create and append the button
    function createPriceHistoryButton() {
        const line1 = document.createElement("hr");
        const line2 = document.createElement("hr");
        const mybox = document.createElement("div");
        line1.setAttribute("style","margin: 5px 0px 5px 0px;")
        line2.setAttribute("style","margin: 5px 0px 5px 0px;")
        mybox.setAttribute("style", " margin: 5px 0px 5px 0px; border-radius: 1px; font-size: 16px; border: 0px solid #000000; background-color:  #ffffff;");
        line1.setAttribute("id", "line1");
        line2.setAttribute("id", "line2");
        mybox.setAttribute("id", "Tracker");
        const TakealotRating = document.getElementsByClassName("rating-module_rating-wrapper_3Cogb")[0].innerText;
        const ReviewAmount = document.getElementsByClassName("reviews cell shrink")[0].innerText.split(" ")[0];
        //((((4.5*9)/(5*9)*10)+1)/11)*100
        const rating = document.createElement("div");
        //rating.innerHTML = TakealotRating*ReviewAmount;
        rating.innerHTML ="Normalized Rating : " + Math.trunc( ((((TakealotRating*ReviewAmount)/(5*ReviewAmount)*10)+1)/11)*100)+"%";
        const button = document.createElement("button");
        button.innerHTML = "Price History";
        //button.setAttribute("id", "Tracker");
        button.addEventListener("click", openPriceHistory, false);
        button.setAttribute("style", " padding: 12px 12px 12px 12px;width:100%; height:40px; font-size:1rem;margin: 5px 0px 5px 0px; border-radius: 0px; font-size: 16px; text-align: center; color: #4d4d4f; background-color: #eaeaea; ");

        mybox.appendChild(rating);
        mybox.appendChild(button);

        const targetElement = document.querySelector(".buybox-module_price_2YUFa");
        if (targetElement) {
            targetElement.appendChild(line1);
            targetElement.appendChild(mybox);
            targetElement.appendChild(line2);

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




