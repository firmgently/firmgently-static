var uk = (uk !== undefined) ? uk : {};
uk.co = (uk.co !== undefined) ? uk.co : {};
uk.co.firmgently = (uk.co.firmgently !== undefined) ? uk.co.firmgently : {};
uk.co.firmgently.FGCommentsAndRatings = (function () {
  "use strict";

  var
  TOTALSTARS = 9,
  highRatingElem, lowRatingElem,
  
  setupStars, setupValidation, setupToggleForms,
  starHover, toggleForm, validateCaptcha,
  
  onStarOver, onStarOut,
  
  logMsg, registerEventHandler, unregisterEventHandler;
  
  
  
  
  logMsg = function (msg) {
    return; // cancel logging for live
    if (window.console) {
      console.log(msg);
    }
  };
  
  registerEventHandler = function (node, event, handler, useCapture) {
    useCapture = (useCapture === undefined) ? false : useCapture;
    if (typeof node.addEventListener === "function") {
      node.addEventListener(event, handler, useCapture);
    } else {
      node.attachEvent("on" + event, handler);
    }
  };
  
  
  unregisterEventHandler = function (node, event, handler, useCapture) {
    useCapture = (useCapture === undefined) ? false : useCapture;
    if (typeof node.removeEventListener === "function") {
      node.removeEventListener(event, handler, useCapture);
    } else {
      node.detachEvent("on" + event, handler);
    }
  };


  starHover = function(num) {
    var
    highOpacity = num / TOTALSTARS,
    lowOpacity = (TOTALSTARS - num) / TOTALSTARS;
    
    if(num === 0) {
      highRatingElem.style.filter = "alpha(opacity=0)";
      highRatingElem.style.opacity = 0;
      lowRatingElem.style.filter = "alpha(opacity=0)";
      lowRatingElem.style.opacity = 0;
    } else {
      logMsg(lowRatingElem);
      highRatingElem.style.filter = "alpha(opacity=" + Math.round(highOpacity*100) + ")";
      highRatingElem.style.opacity = highOpacity;
/*       if(num > 7) {
        highRatingElem.style.fontWeight = "800";
      } else {
        highRatingElem.style.fontWeight = "200";
      } */
      highRatingElem.style.fontSize = 40 + Math.round(highOpacity*100) + "%";
      
      lowOpacity = (TOTALSTARS - num) / TOTALSTARS;
      lowRatingElem.style.filter = "alpha(opacity=" + Math.round(lowOpacity*100) + ")";
      lowRatingElem.style.opacity = lowOpacity;
/*       if((TOTALSTARS - num) > 6) {
        lowRatingElem.style.fontWeight = "800";
      } else {
        lowRatingElem.style.fontWeight = "200";
      } */
      lowRatingElem.style.fontSize = 40 + Math.round(lowOpacity*100) + "%";
    }
  };
  
  
  onStarOver = function(e) {
    var star = e.currentTarget ? e.currentTarget : e.srcElement;
    starHover(star.getAttribute("starID"));
  };

  
  onStarOut = function(e) {
    starHover(0);
  };

  
  toggleForm = function() {
    var
    id = this.getAttribute("data-fgtoggleformid"),
    formElement = document.getElementById("replyForm" + id),
    buttonElement = document.getElementById("toggleFormBtn" + id);
    
    if (formElement.style.display === "block") {
      formElement.style.display = "none";
      buttonElement.innerHTML = "Reply to this";
    } else {
      formElement.style.display = "block";
      buttonElement.innerHTML = "Cancel reply";
    }
  };

  
  validateCaptcha = function() {
    var
    id = this.getAttribute("data-fgvalidate"),
    submitBtn = document.getElementById("submit" + id),
    inputForm = submitBtn.parentNode,
    child = inputForm.firstChild,
    regEx = /\w{3}/,
    inputField, inputIsValid;
    
    while(child) {
      if(child.tagName && child.tagName.toUpperCase() === 'INPUT') {
        if (child.name === "picType") {
          inputField = child;
          break;
        }
      }
      child = child.nextSibling;
    }
    inputIsValid = regEx.test(inputField.value);
    if(inputIsValid) {
      submitBtn.className = "buttonSelected";
      submitBtn.style.cursor = "pointer";
      submitBtn.disabled = false;
    } else {
      submitBtn.className = "buttonSelected transparent";
      submitBtn.style.cursor = "default";
      submitBtn.disabled = true;
    }
  };

  
  setupStars = function() {
    var i, curStar;
    logMsg("setupStars");
    highRatingElem = document.getElementById("highRating");
    lowRatingElem = document.getElementById("lowRating");
    for (i = 1; i <= TOTALSTARS; i++) {
      curStar = document.getElementById("star_" + i);
      if (curStar) {
        // curStar.starID = i;
        curStar.setAttribute("starID", i);
        logMsg("curStar: " + curStar);
        logMsg("curStar.getAttribute('starID'): " + curStar.getAttribute("starID"));
        registerEventHandler(curStar, "mouseover", onStarOver);
        registerEventHandler(curStar, "mouseout", onStarOut);
      }
    }
  };
  
  
  setupValidation = function() {
    // get all items with data-fgvalidate
    // loop through them and add validation
    var
    nodeList = document.querySelectorAll("input[data-fgvalidate]"),
    i, curField;

    for (i = 0; i < nodeList.length; i++) {
      curField = nodeList[i];
      registerEventHandler(curField, "keyup", validateCaptcha);
    }
  };
  
  
  setupToggleForms = function() {
    // get all items with data-fgvalidate
    // loop through them and add validation
    var
    nodeList = document.querySelectorAll("a[data-fgtoggleformid]"),
    i, curField;

    for (i = 0; i < nodeList.length; i++) {
      curField = nodeList[i];
      registerEventHandler(curField, "click", toggleForm);
    }
  };

  
  
  return {
    /*
    ---------------------------------------------------------
                  PUBLIC
    ---------------------------------------------------------
    */
    setupStars: setupStars,
    setupValidation: setupValidation,
    setupToggleForms: setupToggleForms
  };
}());