// JSLint / JSHint ignore globals below
/*global Stripe*/
var uk = (uk !== undefined) ? uk : {};
uk.co = (uk.co !== undefined) ? uk.co : {};
uk.co.firmgently = (uk.co.firmgently !== undefined) ? uk.co.firmgently : {};
uk.co.firmgently.FGBuyPrint = (function () {
  "use strict";
  var 
  LANDSCAPE = "LANDSCAPE", PORTRAIT = "PORTRAIT", SQUARE = "SQUARE",
  CLASSNAME_PRESSED = "pressed", PAYMENTPROCESSING_STR = "Please Wait",
  CUSTOMMOUNT_PRINT_MULTIPLIER = 0.8,
  DRAWINGSCALE_MAX = 10, DRAWINGSCALE_MIN = 0.4,
  WINDOWWIDTH_OFFSET = 190, WINDOWHEIGHT_OFFSET = 280, RESIZEIMAGE_STEPCHANGE = 0.03,
  MARKERPAD_PX = 10, UPDATE_DELAY_MS = 800, CUSTOM_MIN_MM = 150,
  COOKIENAME = "fgPrintSettings", COOKIESTORE_DAYS = 10,
  KEYCODE_ARROWLEFT = 37, KEYCODE_ARROWRIGHT = 39,
  
  drawingScale = 0, formIsValid = false,
  data_ob = {}, product = {}, printCM_ob = {},
  
  customSizeChosen, printOrientation, sidePanelWidth, validateForm_tmr, pence,
  
  paper_el, print_el, mount_el, printPreview_el, printPrice_el, printDescription_el, loadingMessage_el,
  innerWidthMarker_el, outerWidthMarker_el, innerHeightMarker_el, outerHeightMarker_el, customsDisclaimer_el,
  submitButton_el, paymentForm_el, cardholderDetails_el, printInfo_el, printHeading_el,
  cardNumberInput_el, cvcInput_el, expYearInput_el, expMonthInput_el, lastInvalidField_el, paymentFeedback_el,
  deliveryCountry_el, deliveryFeedback_el, blankSpaceNote_el, maxSizeText_el,
  printOptionsPanel_el, printOptions_el, sizeHeight_el, sizeWidth_el,
  printNavNext_el, printNavPrev_el, sizeTypeTitle_el, sizeTypeDescription_el, customSizeTitle_el,
  mountDescription_el, mountTypeDescription_el, mediaDescription_el, cropDescription_el, printedAreaText_el,
  
  registerEventHandler, unregisterEventHandler,
  addClassname, removeClassname, setCookie, getCookie,
  stopPropagation, logMsg, createElementWithId,
  setOpacity, mmToInch, mmToCm,
  
  htmlHookUp, addOptionHandlers, centreElementOn, validateForm, updateCustomSize, updateLayout,
  resizePaperBySizeID, isValidEmail, cleanHTML,
  calculateDrawingScale, updatePreview, updateCrop, updateMount, updateMedia, updateCountry, updatePrintSize,
  drawSizeMarkers, savePrintOptions, isWithinSize, getCappedSizeOb, customMountIsPortrait,
  
  onWindowLoad, onFormSubmit, onRadioChange, onPrintLoad, onResize, onFormChange, onSizeChange,
  onKeyUp, onKeyDown,
  getFormattedPrice, getWindowSizeArray, orientedObjFromSize, getStyle,
  setSizeData, createNow, centrePreview, getIEVersion, decorateString,
  
  stripeResponseHandler;
  
  
  String.prototype.isEmpty = function() {
    return (!this || /^\s*$/.test(this));
  };
  
  
  Number.prototype.oneDecimalPlace = function() {
    return Math.round(this*10)/10;
  };
  
  
  // ----------------------------------------------------------
  // A short snippet for detecting versions of IE in JavaScript
  // without resorting to user-agent sniffing
  // http://james.padolsey.com/javascript/detect-ie-in-js-using-conditional-comments/
  // ----------------------------------------------------------
  // If you're not in IE (or IE version is less than 5) then:
  //     getIEVersion() === undefined
  // If you're in IE (>=5) then you can determine which version:
  //     getIEVersion() === 7; // IE7
  // Thus, to detect IE:
  //     if (getIEVersion()) {}
  // And to detect the version:
  //     getIEVersion() === 6 // IE6
  //     getIEVersion() > 7 // IE8, IE9 ...
  //     getIEVersion() < 9 // Anything less than IE9
  // ----------------------------------------------------------
   
  // UPDATE: Now using Live NodeList idea from @jdalton
  getIEVersion = function() {
    var undef,
      v = 3,
      div = document.createElement('div'),
      all = div.getElementsByTagName('i');

    while (
      div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->', 
      all[0]
    );

    return v > 4 ? v : undef;
  };
  
  
  isValidEmail = function(str) {
      var re = /\S+@\S+\.\S+/;
      return re.test(str);
  };
  
  
  cleanHTML = function(str) {
    str = str.replace(/&nbsp; /gi, " ");
    str = str.replace(/ &nbsp;/gi, " ");
    str = str.replace(/&nbsp;/gi, " "); // order (last) is important to avoid removing legit &nbsp;s
    return str;
  };
  
  
  stopPropagation = function (e) {
    if (e.preventDefault) { e.preventDefault(); }
    if (e.stopPropagation) { e.stopPropagation(); }
    e.cancelBubble = true;
    e.returnValue = false;
    return false;
  };
  
  
  getStyle = function(el, styleProp) {
    var style;
    if (el.currentStyle) {
      style = el.currentStyle[styleProp];
    } else if (window.getComputedStyle) {
      style = document.defaultView.getComputedStyle(el, null).getPropertyValue(styleProp);
    }
    return style;
  };
  
  
  removeClassname = function (element, name) {
    element.className = element.className.replace(" " + name, "");
  };
  
  
  addClassname = function (element, name) {
    name = " " + name;
    element.className = element.className.replace(name, "");
    element.className = element.className + name;
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
  
  
  getWindowSizeArray = function() {
    var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight|| e.clientHeight|| g.clientHeight;
    return [x, y];
  };
  
  
  setOpacity = function(el, n) {
    el.style.msFilter = "progid:DXImageTransform.Microsoft.Alpha(Opacity=" + (n*100) + ")";
    el.style.filter = "alpha(opacity=" + (n*100) + ")";
    el.style.opacity = n;
  };
  
  
	setCookie = function(cName, cVal, days) {
		var expireDate = new Date();
		expireDate.setDate(expireDate.getDate() + days);
		cVal = encodeURIComponent(cVal) + ((days === null) ? "" : "; expires=" + expireDate.toUTCString());
		document.cookie = cName + "=" + cVal;
	};
  
  
	getCookie = function(cName) {
		var i, x, y, cookie_ar = document.cookie.split(";");
		for (i=0; i < cookie_ar.length; i++) {
			x = cookie_ar[i].substr(0, cookie_ar[i].indexOf("="));
			y = cookie_ar[i].substr(cookie_ar[i].indexOf("=") + 1);
			x = x.replace(/^\s+|\s+$/g,"");
			if (x === cName) { return decodeURIComponent(y); }
		}
	};
  
  
  centreElementOn = function (shift_el, target_el) {
    shift_el.style.left = target_el.offsetLeft + (target_el.offsetWidth / 2) - ((shift_el.offsetWidth) / 2) + "px";
    shift_el.style.top = target_el.offsetTop + (target_el.offsetHeight / 2) - ((shift_el.offsetHeight) / 2) + "px";
  };

  
  logMsg = function (msg) {
    // return; // cancel logging for live
    if (window.console) { console.log(msg); }
  };
  
  
  createElementWithId = function(elType, id) {
    var el = document.createElement(elType);
    el.id = id;
    return el;
  };

  
  decorateString = function(str) {
    var
    ar = str.split(" "), decoratedCount = 0, 
    out_str, i;
    if (ar.length === 1) { // single-word strings
      if (Math.random() < 0.5) {
        out_str = "<em>" + str + "&nbsp;</em>";
      } else {
        out_str = str;
      }
    } else {
      while (decoratedCount === ar.length || decoratedCount === 0) { // all are decorated or undecorated
        out_str = "";
        decoratedCount = 0;
        // loop through all words with a 50:50 chance of wrapping each in <em>
        for (i = 0; i < ar.length; i++) {
          if (Math.random() < 0.5) {
            out_str += "<em>" + ar[i] + "&nbsp;</em>" + " ";
            decoratedCount ++;
          } else {
            out_str += ar[i] + " ";
          }
        }
      }
    }
    return out_str;
  };
  
  
  isWithinSize = function(check_ob, size_str) {
    var
    size_ob = orientedObjFromSize(size_str),
    isWithin;
    if (check_ob.w_mm <= size_ob.w_mm && check_ob.h_mm <= size_ob.h_mm) {
      isWithin = true;
    } else {
      isWithin = false;
    }
    return isWithin;
  };
  
  
  customMountIsPortrait = function() {
    return data_ob[product.mountSize].w_mm < data_ob[product.mountSize].h_mm;
  };
  
  
  getCappedSizeOb = function(check_ob, size_str) {
    var
    min_mm = (size_str === "A2") ? (CUSTOM_MIN_MM / CUSTOMMOUNT_PRINT_MULTIPLIER) : CUSTOM_MIN_MM,
    size_ob = orientedObjFromSize(size_str), ret_ob;

    ret_ob = {
      w_mm: (isNaN(check_ob.w_mm) || (check_ob.w_mm > size_ob.w_mm)) ? size_ob.w_mm : (check_ob.w_mm < min_mm) ? min_mm : check_ob.w_mm,
      h_mm: (isNaN(check_ob.h_mm) || (check_ob.h_mm > size_ob.h_mm)) ? size_ob.h_mm : (check_ob.h_mm < min_mm) ? min_mm : check_ob.h_mm
    };
    
    return ret_ob;
  };
  
  
	savePrintOptions = function() {
    setCookie(COOKIENAME, JSON.stringify(product), COOKIESTORE_DAYS); // name, value, days
    // alert(JSON.stringify(product).split(",").join("\n"));
	};
  
  
  validateForm = function() {
    var 
    validate_ar = [
      "FGdel_name", "FGdel_address_line1", "FGdel_address_city", "FGdel_address_zip", "FGdel_address_country"
    ],
    cardType, validate_el, i;
    
    formIsValid = true;
    logMsg("validateForm()");
    
    validate_el = document.getElementById("FGemail_address");
    if (!isValidEmail(validate_el.value)) {
      addClassname(validate_el, "invalid");
      addClassname(validate_el.parentNode, "invalid");
      lastInvalidField_el = validate_el;
      formIsValid = false;
    } else {
      removeClassname(validate_el, "invalid");
      removeClassname(validate_el.parentNode, "invalid");
    }
    // loop through address fields
    for (i = 0; i < validate_ar.length; i++) {
      validate_el = document.getElementById(validate_ar[i]);
      if (validate_el.value.isEmpty()) {
        addClassname(validate_el, "invalid");
        addClassname(validate_el.parentNode, "invalid");
        lastInvalidField_el = validate_el;
        formIsValid = false;
      } else {
        removeClassname(validate_el, "invalid");
        removeClassname(validate_el.parentNode, "invalid");
      }
    }    
    // payment fields
    if (Stripe.card.validateCardNumber(cardNumberInput_el.value) === false) {
      addClassname(cardNumberInput_el, "invalid");
      addClassname(cardNumberInput_el.parentNode, "invalid");
      lastInvalidField_el = cardNumberInput_el;
      formIsValid = false;
    } else {
      cardType = Stripe.card.cardType(cardNumberInput_el.value);
      removeClassname(cardNumberInput_el, "invalid");
      removeClassname(cardNumberInput_el.parentNode, "invalid");
      logMsg("cardType: " + cardType);
    }
    if (Stripe.card.validateExpiry(expMonthInput_el.value, expYearInput_el.value) === false) {
      addClassname(expMonthInput_el, "invalid");
      addClassname(expMonthInput_el.parentNode, "invalid");
      addClassname(expYearInput_el, "invalid");
      addClassname(expYearInput_el.parentNode, "invalid");
      lastInvalidField_el = expMonthInput_el;
      formIsValid = false;
    } else {
      removeClassname(expMonthInput_el, "invalid");
      removeClassname(expMonthInput_el.parentNode, "invalid");
      removeClassname(expYearInput_el, "invalid");
      removeClassname(expYearInput_el.parentNode, "invalid");
    }
    if (Stripe.card.validateCVC(cvcInput_el.value) === false) {
      addClassname(cvcInput_el, "invalid");
      addClassname(cvcInput_el.parentNode, "invalid");
      lastInvalidField_el = cvcInput_el;
      formIsValid = false;
    } else {
      removeClassname(cvcInput_el, "invalid");
      removeClassname(cvcInput_el.parentNode, "invalid");
    }
    logMsg("\tformIsValid: " + formIsValid);
  };
  
  
  updateCustomSize = function() {
    var
    priceIndex_ar = [
      "pricePence", "mountAddPence", "canvasAddPence",
      "UKMainlandUnmounted", "UKOtherUnmounted", "restOfWorldUnmounted",
      "UKMainlandMounted", "UKOtherMounted", "restOfWorldMounted"
    ],
    enteredData_ob = {
      w_mm: sizeWidth_el.value * 10, // entry is in cm so x10 for mm
      h_mm: sizeHeight_el.value * 10
    },
    cappedSize_ob, temp_ob, priceSize, options, i;
    
    if (!sizeWidth_el.value.isEmpty() && !sizeHeight_el.value.isEmpty()) {
      
      customSizeChosen = true;
      
      // uncheck all size radio buttons
      options = document.getElementsByName("printSize");
      for (i = 0; i < options.length; i++) { options[i].checked = false; }
      
      product.printSize = "CustomPrint";
      product.mountSize = "CustomMount";

      if (product.mountType === "mountedPrint") {
        cappedSize_ob = getCappedSizeOb(enteredData_ob, "A2");
        data_ob[product.mountSize].w_mm = cappedSize_ob.w_mm;
        data_ob[product.mountSize].h_mm = cappedSize_ob.h_mm;
        temp_ob = getCappedSizeOb({
          w_mm: data_ob[product.mountSize].w_mm * CUSTOMMOUNT_PRINT_MULTIPLIER,
          h_mm: data_ob[product.mountSize].h_mm * CUSTOMMOUNT_PRINT_MULTIPLIER
        }, "A3plus");
        data_ob[product.printSize].w_mm = temp_ob.w_mm;
        data_ob[product.printSize].h_mm = temp_ob.h_mm;
        sizeWidth_el.value = mmToCm(data_ob[product.mountSize].w_mm);
        sizeHeight_el.value = mmToCm(data_ob[product.mountSize].h_mm);
      } else if (product.mountType === "unmountedPrint") {
        cappedSize_ob = getCappedSizeOb(enteredData_ob, "A3plus");
        data_ob[product.printSize].w_mm = cappedSize_ob.w_mm;
        data_ob[product.printSize].h_mm = cappedSize_ob.h_mm;
        temp_ob = getCappedSizeOb({
          w_mm: (data_ob[product.printSize].w_mm / CUSTOMMOUNT_PRINT_MULTIPLIER).oneDecimalPlace(),
          h_mm: (data_ob[product.printSize].h_mm / CUSTOMMOUNT_PRINT_MULTIPLIER).oneDecimalPlace()
        }, "A2");
        data_ob[product.mountSize].w_mm = temp_ob.w_mm;
        data_ob[product.mountSize].h_mm = temp_ob.h_mm;
        sizeWidth_el.value = mmToCm(data_ob[product.printSize].w_mm);
        sizeHeight_el.value = mmToCm(data_ob[product.printSize].h_mm);
      }
      
      data_ob[product.mountSize].w_inch = mmToInch(data_ob[product.mountSize].w_mm);
      data_ob[product.mountSize].h_inch = mmToInch(data_ob[product.mountSize].h_mm);
      data_ob[product.printSize].w_inch = mmToInch(data_ob[product.printSize].w_mm);
      data_ob[product.printSize].h_inch = mmToInch(data_ob[product.printSize].h_mm);

      // price - depending on if print fits on A4 or A3plus
      priceSize = isWithinSize(data_ob[product.printSize], "A4") ? "A4" : "A3plus";
      // copy price info 
      for (i = 0; i < priceIndex_ar.length; i++) {
        data_ob[product.printSize][priceIndex_ar[i]] = data_ob[priceSize][priceIndex_ar[i]];
      }

      updatePreview();

    }
  };
  
  
  
  onFormSubmit = function(e) {
    logMsg("onFormSubmit()");
    validateForm();
    if (formIsValid) {
      logMsg("\tVALID");
      // Disable the submit button to prevent repeated clicks
      submitButton_el.disabled = true;
      addClassname(submitButton_el, "transparent");
      // feedback for user
      removeClassname(paymentFeedback_el, "invisible");
      paymentFeedback_el.innerHTML = PAYMENTPROCESSING_STR;
      // store description for use later
      product.title = cleanHTML(document.getElementById("printHeading").innerHTML);
      
      if (!deliveryCountry_el.disabled) {
        product.deliveryCountry = deliveryCountry_el.value;
      }
      document.getElementById("productDescription").value = JSON.stringify(product);
      // get payment token from Stripe
      Stripe.card.createToken(paymentForm_el, stripeResponseHandler);
    } else {
      logMsg("\tINVALID");
      lastInvalidField_el.scrollIntoView();
    }
    // Prevent the form from submitting with the default action
    stopPropagation(e);
  };

  
  stripeResponseHandler = function(status, response) {
    var token, tokenField;
    if (response.error) {
      // Show the errors on the form
      removeClassname(paymentFeedback_el, "invisible");
      paymentFeedback_el.innerHTML = response.error.message;
      submitButton_el.disabled = false;
      removeClassname(submitButton_el, "transparent");
    } else {
      logMsg("stripeResponseHandler: " + response.id);
      // response contains id and card, which contains additional card details
      token = response.id;
      // Insert the token into the form so it gets submitted to the server
      tokenField = document.createElement("input");
      paymentForm_el.appendChild(tokenField);
      tokenField.setAttribute("type", "hidden");
      tokenField.name = "stripeToken";
      tokenField.value = token;
      // and submit
      paymentForm_el.submit();
    }
  };
  
  
  getFormattedPrice = function(pence, includeSpan) {
    var str;
    includeSpan = includeSpan === undefined ? true : false;
    if (includeSpan) {
      str = "<em>&pound;</em>";
    } else {
      str = "£";
    }
    str += pence / 100;
    return str;
  };
  
  
  orientedObjFromSize = function(size) {
    var
    sizes_ob = data_ob[size],
    return_ob = {};
    
    if (printOrientation === LANDSCAPE || customSizeChosen) {
      return_ob.w_mm = sizes_ob.w_mm;
      return_ob.h_mm = sizes_ob.h_mm;
      return_ob.w_inch = sizes_ob.w_inch;
      return_ob.h_inch = sizes_ob.h_inch;
    } else if (printOrientation === PORTRAIT) {
      return_ob.w_mm = sizes_ob.h_mm;
      return_ob.h_mm = sizes_ob.w_mm;
      return_ob.w_inch = sizes_ob.h_inch;
      return_ob.h_inch = sizes_ob.w_inch;
    } else { // SQUARE
      return_ob.w_mm = sizes_ob.h_mm;
      return_ob.h_mm = sizes_ob.h_mm;
      return_ob.w_inch = sizes_ob.h_inch;
      return_ob.h_inch = sizes_ob.h_inch;
    }
    return return_ob;
  };
  
  
  mmToInch = function(mm) {
    return (mm * 0.0393700787).oneDecimalPlace();
  };
  
  
  mmToCm = function(mm) {
    return (mm / 10).oneDecimalPlace();
  };
  
  
  updatePrintSize = function() {
    if (product.printSize === "A4" || product.printSize === "A3plus") {
      customSizeChosen = false;
      product.mountSize = (product.printSize === "A4") ? "A3" : "A2";
    } else {
      customSizeChosen = true;
      product.printSize = "CustomPrint";
      product.mountSize = "CustomMount";
      product.customPrint_ob = data_ob.CustomPrint;
      product.customMount_ob = data_ob.CustomMount;
    }
    resizePaperBySizeID(product.printSize);
    pence += data_ob[product.printSize].pricePence;
    // logMsg("updatePreview()\tcustomSizeChosen: " + customSizeChosen);
  };
  
  
  updateMount = function() {
    var
    outerSize_ob = orientedObjFromSize("A2"),
    marginSide = "0px", marginTopBot = "0px",
    mountSize_ob, maxSize_ob, innerSize_ob, paperSize_ob,
    maxSize_str, mountSizeDesc;

    if (product.mountType === "mountedPrint") {
      mountTypeDescription_el.innerHTML = "window-mounted behind card, <strong>ready to frame</strong>";
      mountSize_ob = orientedObjFromSize(product.mountSize);
      mountSizeDesc = mmToCm(mountSize_ob.w_mm) + " x " + mmToCm(mountSize_ob.h_mm) + " cm<br>" + mountSize_ob.w_inch + " x " + mountSize_ob.h_inch + "\"";
      if (printOrientation !== SQUARE && product.mountSize !== "CustomMount") {
        mountSizeDesc += "<br><em>" + data_ob[product.mountSize].title + "</em>";
      }
      product.mountSizeDesc = mountSizeDesc;
      pence += data_ob[product.printSize].mountAddPence;
      mountDescription_el.innerHTML = "<strong>mounted and ready to fit in a frame size:</strong><br><span>" + mountSizeDesc + "</span>";
      sizeWidth_el.value = mmToCm(mountSize_ob.w_mm);
      sizeHeight_el.value = mmToCm(mountSize_ob.h_mm);
    } else if (product.mountType === "unmountedPrint") {
      mountTypeDescription_el.innerHTML = "just a print with no mount";
      paperSize_ob = orientedObjFromSize(product.printSize);
      mountDescription_el.innerHTML = "simple unmounted print";
      sizeWidth_el.value = mmToCm(paperSize_ob.w_mm);
      sizeHeight_el.value = mmToCm(paperSize_ob.h_mm);
    }

    if (product.printSize === "CustomPrint") {
      product.mountSize = "CustomMount";
    } else if (product.printSize === "A4") {
      product.mountSize = "A3";
    } else if (product.printSize === "A3plus") {
      product.mountSize = "A2";
    }
    innerSize_ob = orientedObjFromSize(product.mountSize);
    mount_el.style.width = (innerSize_ob.w_mm * drawingScale) + "px";
    mount_el.style.height = (innerSize_ob.h_mm * drawingScale) + "px";
    marginSide = ((outerSize_ob.w_mm - innerSize_ob.w_mm) / 2) * drawingScale + "px";
    marginTopBot = ((outerSize_ob.h_mm - innerSize_ob.h_mm) / 2) * drawingScale + "px";
    
    // use margin to keep everything centred around the same spot whatever the size
    mount_el.style.margin = marginTopBot + " " + marginSide;
    
    // update rest of panel mount text
    if (product.mountType === "mountedPrint") {
      maxSize_ob = orientedObjFromSize("A2");
      sizeTypeTitle_el.innerHTML = "<span>2</span>Mount Size";
      customSizeTitle_el.innerHTML = "or choose a custom size to fit a frame";
      sizeTypeDescription_el.innerHTML = "the mount is the same size as the glass in your frame<br>";
      removeClassname(mount_el, "invisible");
    } else if (product.mountType === "unmountedPrint") {
      maxSize_ob = orientedObjFromSize("A3plus");
      sizeTypeTitle_el.innerHTML = "<span>2</span>Print Size";
      customSizeTitle_el.innerHTML = "or choose your own Size";
      sizeTypeDescription_el.innerHTML = "type the size of the <em>" + product.media + "</em> you'd like";
      addClassname(mount_el, "invisible");
    }    
    maxSize_str =  "max. " + mmToCm(maxSize_ob.w_mm) + " x " + mmToCm(maxSize_ob.h_mm) + "cm";
    maxSizeText_el.innerHTML = maxSize_str;
  };

  
  updateCrop = function() {
    var
    printAspectRatio = print_el.offsetWidth / print_el.offsetHeight || 0, 
    paperAspectRatio = paper_el.offsetWidth / paper_el.offsetHeight || 0,
    overlap_px = data_ob[product.printSize].overlap_mm * drawingScale,
    margin_px = data_ob[product.printSize].margin_mm * drawingScale,
    mountOffset_px, inner_el, printedW_mm, printedH_mm;
    
    mount_el.style.borderTopWidth = mount_el.style.borderBottomWidth = mount_el.style.borderLeftWidth = mount_el.style.borderRightWidth = "0px"; 
    
    if (product.crop === "margins") {
      cropDescription_el.innerHTML = "print with margins - keeps the entire image but will have blank edges";
      printedW_mm = Math.round(print_el.offsetWidth / drawingScale);
      printedH_mm = Math.round(print_el.offsetHeight / drawingScale);
      printedAreaText_el.innerHTML = "printed area: " + mmToCm(printedW_mm) + " x " + mmToCm(printedH_mm) + "cm / " + mmToInch(printedW_mm) + " x " + mmToInch(printedH_mm) + "inches";
      removeClassname(blankSpaceNote_el, "removed");
    } else if (product.crop === "filled") {
      cropDescription_el.innerHTML = "fill the paper (sides of image may be cut off)";
      printedAreaText_el.innerHTML = "";
      addClassname(blankSpaceNote_el, "removed");
    }
    
    if (product.crop === "margins") {
      if (printAspectRatio < paperAspectRatio) { 
        print_el.style.height = (paper_el.offsetHeight - (data_ob[product.printSize].margin_mm * drawingScale * 2)) + "px";
        print_el.style.width = "auto";
      } else {
        print_el.style.width = (paper_el.offsetWidth - (data_ob[product.printSize].margin_mm * drawingScale * 2)) + "px";
        print_el.style.height = "auto";
      }
      inner_el = print_el;
      mountOffset_px = (0 - margin_px) + (overlap_px / 3);
    } else if (product.crop === "filled") {
       if (printAspectRatio < paperAspectRatio) { 
        print_el.style.width = paper_el.offsetWidth + "px";
        print_el.style.height = "auto";
      } else {
        print_el.style.height = paper_el.offsetHeight + "px";
        print_el.style.width = "auto";
      }
      inner_el = paper_el;
      mountOffset_px = overlap_px;
    }
       
    mount_el.style.borderTopWidth = mount_el.style.borderBottomWidth = (((mount_el.offsetHeight - inner_el.offsetHeight) / 2) + mountOffset_px) + "px";
    mount_el.style.borderLeftWidth = mount_el.style.borderRightWidth = (((mount_el.offsetWidth - inner_el.offsetWidth) / 2) + mountOffset_px) + "px"; 
    
    print_el.style.left = (paper_el.offsetWidth - print_el.offsetWidth) / 2 + "px";
    print_el.style.top = (paper_el.offsetHeight - print_el.offsetHeight) / 2 + "px";    
  };
  
  
  updateMedia = function() {
    if (product.media === "paper") {
      mediaDescription_el.innerHTML = "<strong>pigment ink on heavy paper</strong><br>(200-240g/m<sup>2</sup> depending on size) for <em>maximum detail</em>";
      setOpacity(print_el, 1);
    } else if (product.media === "canvas") {
      mediaDescription_el.innerHTML = "<strong>pigment ink on canvas</strong><br>(100% cotton, 340g/m<sup>2</sup>) for a <em>warmer texture</em>";
      setOpacity(print_el, 0.97);
      pence += data_ob[product.printSize].canvasAddPence;
    }
  };
  
  
  updateCountry = function() {
    if (product.deliveryCountry === "UKmainland") {
      deliveryCountry_el.value = "UK mainland";
      deliveryCountry_el.disabled = true;
      addClassname(customsDisclaimer_el, "invisible");
      deliveryFeedback_el.innerHTML = "delivered to mainland GB";
      if (product.mountType === "mountedPrint") {
        pence += data_ob[product.printSize].UKMainlandMounted;
      } else {
        pence += data_ob[product.printSize].UKMainlandUnmounted;
      }
    } else if (product.deliveryCountry === "RestOfWorld") {
      deliveryCountry_el.value = "";
      deliveryCountry_el.disabled = false;
      removeClassname(customsDisclaimer_el, "invisible");
      deliveryFeedback_el.innerHTML = "delivered international";
      if (product.mountType === "mountedPrint") {
        pence += data_ob[product.printSize].restOfWorldMounted;
      } else {
        pence += data_ob[product.printSize].restOfWorldUnmounted;
      }
    }
  };
  
  
  resizePaperBySizeID = function(size_id) {
    paper_el.style.width = (orientedObjFromSize(size_id).w_mm * drawingScale) + "px";
    paper_el.style.height = (orientedObjFromSize(size_id).h_mm * drawingScale) + "px";
  };
  
  
  htmlHookUp = function() {
    var i, nodeList, curInput;
        
    printPreview_el = document.getElementById("printPreview");
    paper_el = document.getElementById("FGPaper");
    print_el = document.getElementById("FGPrint");
    mount_el = document.getElementById("FGMount");
    innerWidthMarker_el = document.getElementById("FGInnerWidthMarker");
    outerWidthMarker_el = document.getElementById("FGOuterWidthMarker");
    innerHeightMarker_el = document.getElementById("FGInnerHeightMarker");
    outerHeightMarker_el = document.getElementById("FGOuterHeightMarker");
    printPrice_el = document.getElementById("FGPrintPrice");
    printDescription_el = document.getElementById("FGPrintDescription");
    submitButton_el = document.getElementById("buyPrintButton");
    printOptionsPanel_el = document.getElementById("printOptionsPanel");
    paymentForm_el = document.getElementById("paymentForm");
    printOptions_el = document.getElementById("printOptions");
    cardholderDetails_el = document.getElementById("cardholderDetails");
    paymentFeedback_el = document.getElementById("paymentFeedback");
    deliveryCountry_el = document.getElementById("FGdel_address_country");
    customsDisclaimer_el = document.getElementById("customsDisclaimer");
    deliveryFeedback_el = document.getElementById("deliveryFeedback");
    printInfo_el = document.getElementById("printInfo");
    printHeading_el = document.getElementById("printHeading");
    loadingMessage_el = document.getElementById("loadingMessage");
    printNavNext_el = document.getElementById("printNavNext");
    printNavPrev_el = document.getElementById("printNavPrev");
    sizeWidth_el = document.getElementById("sizeWidth");
    sizeHeight_el = document.getElementById("sizeHeight");
    sizeTypeTitle_el = document.getElementById("sizeTypeTitle");
    sizeTypeDescription_el = document.getElementById("sizeTypeDescription");
    customSizeTitle_el = document.getElementById("customSizeTitle");
    mountDescription_el = document.getElementById("mountDescription");
    printedAreaText_el = document.getElementById("printedAreaText");
    mountTypeDescription_el = document.getElementById("mountTypeDescription");
    mediaDescription_el = document.getElementById("mediaDescription");
    cropDescription_el = document.getElementById("cropDescription");
    blankSpaceNote_el = document.getElementById("blankSpaceNote");
    maxSizeText_el = document.getElementById("maxSizeText");
    
    // get all the Stripe fields
    nodeList = document.querySelectorAll("input[data-stripe]");
    for (i = 0; i < nodeList.length; i++) {
      curInput = nodeList[i];
      switch(curInput.getAttribute("data-stripe")) {
        case "number":
          cardNumberInput_el = curInput;
          break;
        case "cvc":
          cvcInput_el = curInput;
          break;
        case "exp-year":
          expYearInput_el = curInput;
          break;
        case "exp-month":
          expMonthInput_el = curInput;
          break;
      }
    }
  };
  
  
  addOptionHandlers = function() {
    var i, curNode, total,
        nodeList = document.querySelectorAll("input");

    total = nodeList.length;
    for (i = 0; i < total; i++) {
      curNode = nodeList[i];
      if (curNode.type.toLowerCase() === "radio") {
        if (!getIEVersion()) {
          registerEventHandler(curNode, "change", onRadioChange);
        } else {
          registerEventHandler(curNode, "click", onRadioChange);
        }
      } else if (curNode.type.toLowerCase() === "text") {
        if (curNode === sizeWidth_el || curNode === sizeHeight_el) {
          if (getIEVersion() < 9) {
            registerEventHandler(curNode, "propertychange", onSizeChange);
          } else {
            registerEventHandler(curNode, "input", onSizeChange);
          }
        } else {
          if (getIEVersion() < 9) {
            registerEventHandler(curNode, "propertychange", onFormChange);
          } else {
            registerEventHandler(curNode, "input", onFormChange);
          }
        }
      }
    }
  };
  
  
  onSizeChange = function() {
    clearInterval(validateForm_tmr);
    validateForm_tmr = setTimeout(updateCustomSize, UPDATE_DELAY_MS);
  };
  
  
  onFormChange = function() {
    clearInterval(validateForm_tmr);
    validateForm_tmr = setTimeout(validateForm, UPDATE_DELAY_MS);
  };
  
  
  onRadioChange = function() {
    logMsg("onRadioChange");
    updatePreview();
  };
  
  
  updatePreview = function() {
    var options, i;

    pence = 0;
    
    options = document.getElementsByName("printSize");
    for(i = 0; i < options.length; i++) {
      if(options[i].checked) {
        product.printSize = options[i].value;
        break;
      }
    }
    updatePrintSize();
    //
    options = document.getElementsByName("mountType");
    for(i = 0; i < options.length; i++) {
      if(options[i].checked) {
        product.mountType = options[i].value;
        break;
      }
    }
    updateMount();
    //
    options = document.getElementsByName("cropType");
    for(i = 0; i < options.length; i++) {
       if(options[i].checked) {
        product.crop = options[i].value;
        break;
      }
    }
    updateCrop();
    //
    options = document.getElementsByName("mediaType");
    for(i = 0; i < options.length; i++) {
      if(options[i].checked) {
        product.media = options[i].value;
        break;
      }
    }
    updateMedia();
    //
    options = document.getElementsByName("deliveryCountry");
    for(i = 0; i < options.length; i++) {
      if(options[i].checked) {
        product.deliveryCountry = options[i].value;
        break;
      }
    }
    updateCountry();
    //
    savePrintOptions();
    // display the price
    printPrice_el.innerHTML = getFormattedPrice(pence);
    submitButton_el.value = "Buy Now - " + getFormattedPrice(pence, false);
    centreElementOn(paper_el, mount_el);
    drawSizeMarkers();
  };
  
  
  drawSizeMarkers = function() {
    var
    w_mm, h_mm,
    paperSize_ob = orientedObjFromSize(product.printSize),
    mountSize_ob = orientedObjFromSize(product.mountSize);
    
    // inner markers
    if (product.crop === "margins") {
      removeClassname(innerWidthMarker_el, "invisible");
      removeClassname(innerHeightMarker_el, "invisible");
      w_mm = Math.round(print_el.offsetWidth / drawingScale);
      h_mm = Math.round(print_el.offsetHeight / drawingScale);
      printCM_ob.w_cm = mmToCm(w_mm);
      printCM_ob.h_cm = mmToCm(h_mm);
      innerWidthMarker_el.innerHTML = "<p><strong>printed area</strong> " + printCM_ob.w_cm + "cm&nbsp;(" + mmToInch(w_mm) + "&quot;)</p>";
      innerHeightMarker_el.innerHTML = "<p><strong>printed area</strong> " + printCM_ob.h_cm + "cm&nbsp;(" + mmToInch(h_mm) + "&quot;)</p>";
      product.printedAreaDesc = printCM_ob.w_cm + " x " + printCM_ob.h_cm + "cm / " + mmToInch(w_mm) + " x " + mmToInch(h_mm) + "inches";
      if (product.mountType === "mountedPrint") {
        innerWidthMarker_el.style.width = print_el.offsetWidth + "px";
        innerWidthMarker_el.style.top = (mount_el.offsetTop + mount_el.offsetHeight + MARKERPAD_PX) + "px";
        innerWidthMarker_el.style.left = (paper_el.offsetLeft + print_el.offsetLeft) + "px";
        innerHeightMarker_el.style.width = print_el.offsetHeight + "px";
        innerHeightMarker_el.style.top = (paper_el.offsetTop + print_el.offsetTop) + "px";
        innerHeightMarker_el.style.left = (mount_el.offsetLeft + mount_el.offsetWidth + innerHeightMarker_el.offsetHeight + MARKERPAD_PX) + "px";
      } else {
        innerWidthMarker_el.style.width = print_el.offsetWidth + "px";
        innerWidthMarker_el.style.top = (paper_el.offsetTop + paper_el.offsetHeight + MARKERPAD_PX) + "px";
        innerWidthMarker_el.style.left = (paper_el.offsetLeft + print_el.offsetLeft) + "px";
        innerHeightMarker_el.style.width = print_el.offsetHeight + "px";
        innerHeightMarker_el.style.top = (paper_el.offsetTop + print_el.offsetTop) + "px";
        innerHeightMarker_el.style.left = (paper_el.offsetLeft + paper_el.offsetWidth + innerHeightMarker_el.offsetHeight + MARKERPAD_PX) + "px";
      }
    } else { // filled
      printCM_ob.w_cm = mmToCm(paperSize_ob.w_mm);
      printCM_ob.h_cm = mmToCm(paperSize_ob.h_mm);
      innerWidthMarker_el.innerHTML = "<p><strong>print</strong> " + printCM_ob.w_cm + "cm&nbsp;(" + paperSize_ob.w_inch + "&quot;)</p>";
      innerHeightMarker_el.innerHTML = "<p><strong>print</strong> " + printCM_ob.h_cm + "cm&nbsp;(" + paperSize_ob.h_inch + "&quot;)</p>";
      if (product.mountType === "mountedPrint") {
        removeClassname(innerWidthMarker_el, "invisible");
        removeClassname(innerHeightMarker_el, "invisible");
        innerWidthMarker_el.style.width = paper_el.offsetWidth + "px";
        innerWidthMarker_el.style.top = (mount_el.offsetTop + mount_el.offsetHeight + MARKERPAD_PX) + "px";
        innerWidthMarker_el.style.left = paper_el.offsetLeft + "px";
        innerHeightMarker_el.style.width = paper_el.offsetHeight + "px";
        innerHeightMarker_el.style.left = (mount_el.offsetLeft + mount_el.offsetWidth + innerHeightMarker_el.offsetHeight + MARKERPAD_PX) + "px";
        innerHeightMarker_el.style.top = paper_el.offsetTop + "px";
      } else {
        addClassname(innerWidthMarker_el, "invisible");
        addClassname(innerHeightMarker_el, "invisible");
        innerWidthMarker_el.style.top = (paper_el.offsetTop + paper_el.offsetHeight + MARKERPAD_PX) + "px";
        innerHeightMarker_el.style.left = (paper_el.offsetLeft + paper_el.offsetWidth + MARKERPAD_PX) + "px";
      }
    }
    // outer markers
    if (product.mountType === "mountedPrint") {
      outerWidthMarker_el.innerHTML = "<p><strong>card mount</strong> " + mmToCm(mountSize_ob.w_mm) + "cm&nbsp;(" + mountSize_ob.w_inch + "&quot;)</p>";
      outerHeightMarker_el.innerHTML = "<p><strong>card mount</strong> " + mmToCm(mountSize_ob.h_mm) + "cm&nbsp;(" + mountSize_ob.h_inch + "&quot;)</p>";
      outerWidthMarker_el.style.width = mountSize_ob.w_mm * drawingScale + "px";
      outerWidthMarker_el.style.top = (innerWidthMarker_el.offsetTop + innerWidthMarker_el.offsetHeight + MARKERPAD_PX) + "px";
      outerWidthMarker_el.style.left = mount_el.offsetLeft + "px";
      outerHeightMarker_el.style.width = mountSize_ob.h_mm * drawingScale + "px";
      outerHeightMarker_el.style.left = (innerHeightMarker_el.offsetLeft + innerHeightMarker_el.offsetHeight + MARKERPAD_PX) + "px";
      outerHeightMarker_el.style.top = mount_el.offsetTop + "px";
    } else {
      outerWidthMarker_el.innerHTML = "<p><strong>" + product.media + "</strong> " + mmToCm(paperSize_ob.w_mm) + "cm&nbsp;(" + paperSize_ob.w_inch + "&quot;)</p>";
      outerHeightMarker_el.innerHTML = "<p><strong>" + product.media + "</strong> " + mmToCm(paperSize_ob.h_mm) + "cm&nbsp;(" + paperSize_ob.h_inch + "&quot;)</p>";
      outerWidthMarker_el.style.width = paper_el.offsetWidth + "px";
      if (product.crop === "margins") {
        outerWidthMarker_el.style.top = (innerWidthMarker_el.offsetTop + innerWidthMarker_el.offsetHeight + MARKERPAD_PX) + "px";
      } else {
        outerWidthMarker_el.style.top = (innerWidthMarker_el.offsetTop + MARKERPAD_PX) + "px";
      }
      outerWidthMarker_el.style.left = paper_el.offsetLeft + "px";
      outerHeightMarker_el.style.width = paper_el.offsetHeight + "px";
      outerHeightMarker_el.style.left = (innerHeightMarker_el.offsetLeft + innerHeightMarker_el.offsetHeight + MARKERPAD_PX) + "px";
      outerHeightMarker_el.style.top = paper_el.offsetTop + "px";
    }
  };
  
  
  updateLayout = function() {
    // logMsg("updateLayout()");
    centrePreview();
    calculateDrawingScale();
    updatePreview();
  };
  
  
  centrePreview = function() {
    var
    curElement = printOptionsPanel_el,
    realL = 0;
    // logMsg("centrePreview()");
    while(curElement && curElement.tagName !== "HTML" && curElement.tagName !== "BODY") {
      realL += curElement.offsetLeft;
      curElement = curElement.offsetParent;
    }
    if (getStyle(printPreview_el, "position").toUpperCase() === "FIXED" && realL > 0) {
      sidePanelWidth = getWindowSizeArray()[0] - realL;
    } else {
      sidePanelWidth = 0;
    }
    printPreview_el.style.paddingRight = sidePanelWidth + "px";
    printInfo_el.style.paddingRight = sidePanelWidth + "px";
    printHeading_el.style.paddingRight = sidePanelWidth + "px";
    loadingMessage_el.style.paddingRight = sidePanelWidth + "px";
  };
  
  
  calculateDrawingScale = function() {
    var
    sizeMaxArea = orientedObjFromSize("A2"),
    // sizeMaxArea = reverseOrientationMM(data_ob["A2"]),
    showHide_ar = [
      mount_el, paper_el, innerWidthMarker_el, innerHeightMarker_el, outerWidthMarker_el, outerHeightMarker_el
    ],
    windowSize_ar = getWindowSizeArray(),
    winWidth, winHeight, i;
    
    for (i = 0; i < showHide_ar.length; i++) {
      showHide_ar[i].style.display = "none";
    }
    
    winWidth = windowSize_ar[0] - sidePanelWidth - WINDOWWIDTH_OFFSET;
    if (printOptionsPanel_el.offsetTop > 50) {
      winHeight = printOptionsPanel_el.offsetTop - WINDOWHEIGHT_OFFSET;
    } else {
      winHeight = windowSize_ar[1] - WINDOWHEIGHT_OFFSET;
    }
    
    for (i = 0; i < showHide_ar.length; i++) {
      showHide_ar[i].style.display = "inline-block";
    }

    drawingScale = DRAWINGSCALE_MAX;
    while (sizeMaxArea.w_mm * drawingScale > winWidth || sizeMaxArea.h_mm * drawingScale > winHeight) {
      drawingScale -= RESIZEIMAGE_STEPCHANGE;
    }
    if (drawingScale < DRAWINGSCALE_MIN) { drawingScale = DRAWINGSCALE_MIN; }
    
  };
  
  
  onResize = function() {
    updateLayout();
  };
  
  
  onPrintLoad = function() {
    logMsg("onPrintLoad");
    if (print_el.offsetWidth === print_el.offsetHeight) {
      printOrientation = SQUARE;
    } else if (print_el.offsetWidth >= print_el.offsetHeight) {
      printOrientation = LANDSCAPE;
    } else {
      printOrientation = PORTRAIT;
    }
    addOptionHandlers();
    removeClassname(printPreview_el, "invisible");
    removeClassname(printHeading_el, "invisible");
    removeClassname(printInfo_el, "invisible");
    loadingMessage_el.style.display = "none";
    updateLayout();
  };
  
  
  setSizeData = function (newConfig) {
    var prop;
    for (prop in newConfig) {
      if (newConfig.hasOwnProperty(prop)) {
        data_ob[prop] = newConfig[prop];
      }
    }
  };
  
  
	onKeyDown = function(e) {
    if (e.keyCode === KEYCODE_ARROWRIGHT) {
      addClassname(printNavNext_el, CLASSNAME_PRESSED);
      stopPropagation(e);
    } else if (e.keyCode === KEYCODE_ARROWLEFT) {
      addClassname(printNavPrev_el, CLASSNAME_PRESSED);
      stopPropagation(e);
    }
  };
  
  
  onKeyUp = function(e) {
    if (e.keyCode === KEYCODE_ARROWRIGHT) {
      document.location = printNavNext_el.href;
      stopPropagation(e);
    } else if (e.keyCode === KEYCODE_ARROWLEFT) {
      document.location = printNavPrev_el.href;
      stopPropagation(e);
    }
  };
  
  
  onWindowLoad = function() {
    logMsg("onWindowLoad");
    submitButton_el.disabled = false;
    removeClassname(submitButton_el, "transparent");
    paymentFeedback_el.innerHTML = "XXX"; // some content is needed or the element collapses and breaks layout
    addClassname(paymentFeedback_el, "invisible");
  };
  
  
  createNow = function (id, ob) {
    var cookie, cookie_ob = {};
    
    product.id = id;
    
    cookie = getCookie(COOKIENAME);
    if (cookie) { cookie_ob = JSON.parse(getCookie(COOKIENAME)); }
    
    setSizeData(ob);
    htmlHookUp();
    addClassname(printPreview_el, "invisible");
    addClassname(printHeading_el, "invisible");
    addClassname(printInfo_el, "invisible");
        
    if (cookie_ob && cookie_ob.printSize === "CustomPrint" && (cookie_ob.customMount_ob || cookie_ob.customPrint_ob)) {
      if (cookie_ob.mountType === "mountedPrint") {
        product.mountType = "mountedPrint";
        sizeWidth_el.value = mmToCm(cookie_ob.customMount_ob.w_mm);
        sizeHeight_el.value = mmToCm(cookie_ob.customMount_ob.h_mm);
      } else if (cookie_ob.mountType === "unmountedPrint") {
        product.mountType = "unmountedPrint";
        sizeWidth_el.value = mmToCm(cookie_ob.customPrint_ob.w_mm);
        sizeHeight_el.value = mmToCm(cookie_ob.customPrint_ob.h_mm);
      }
      customSizeChosen = true;
      updateCustomSize();
      updateLayout();
    } else {
      customSizeChosen = false;
   }
    
    if (print_el.complete) {
      onPrintLoad();
    } else {
      registerEventHandler(print_el, "load", onPrintLoad);
    }
    print_el.src = print_el.src; // HACK: image onload won't get attached properly unless src is set afterwards
    //
    registerEventHandler(paymentForm_el, "submit", onFormSubmit);
    registerEventHandler(window, "resize", onResize);
    registerEventHandler(window, "load", onWindowLoad);
    registerEventHandler(window, "keydown", onKeyDown);
    registerEventHandler(window, "keyup", onKeyUp);
    
    printHeading_el.innerHTML = decorateString(printHeading_el.innerHTML);
  };
  
  
  return ({
    createNow : createNow
  });
  

}());
