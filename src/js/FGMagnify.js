var uk = (uk !== undefined) ? uk : {};
uk.co = (uk.co !== undefined) ? uk.co : {};
uk.co.firmgently = (uk.co.firmgently !== undefined) ? uk.co.firmgently : {};
uk.co.firmgently.FGMagnify = (function () {
  "use strict";
  /*
  ---------------------------------------------------------
                PRIVATE
  ---------------------------------------------------------
  */
  // constants
  var
  FGMAG_RFR_MS = 60, MAGSHOW_DELAY_MS = 600, 
  UPDATE_DELAY_MS = 100,
  ZOOMED_IMAGE_WIDTH = 3000,
  IMAGESIZE_TOPMARGIN_NORMAL = 200, IMAGESIZE_TOPMARGIN_SMALL = 70,
  IMAGESIZE_LEFTMARGIN_SMALL = 70, IMAGESIZE_LEFTMARGIN_NORMAL = 100,
  IMGLDINGMSG_STR = "image loading...", LDINGMSG_STR = "magnifier loading...",
  LOUPEBG_RESIZE_DARK = "/images/dark/loupeBgResize.gif", LOUPEBG_RESIZE_LIGHT = "/images/light/loupeBgResize.gif",
  BORDERCOLOUR_LIMIT_DARK = "#007ffe", BORDERCOLOUR_LIMIT_LIGHT = "#ff8001",
  IMAGE_RESIZE_STEP = 10,
  PAGE_MARGIN = 20,
  useLightColours,
  updateMag_tmr, magShow_tmr, onScroll_tmr, onResize_tmr,
  loupeBnd_rct = {}, mainImg_rct = {},
  hiResImg_inf = {}, colours_inf = {}, siz_inf = {}, mouse_inf = {},
  loupeBgResize, loupeBgImgOrig,
  itemDetails_el, imageMainContainer_el, mainColumn_el,
  magIsShowing,
  mag, magInner, loupe, mainImg, hiResImg,
  ldingMsg, imgLdingMsg, mainImageAspectRatio,
  calculateSizes,
  shwMag, hidMag, updMag, updateMousePos, updateMainImageMetrics,
  loadHiResImage, onHiResImageLoad,
  hiResImgPreload_el,
  updateAllMeasurements,
  
  onResize, onScroll, onMainImgMouseOut, onMainImgMouseOver, onDocumentDragStart, onMainImgTouchStart,
  onWindowLoad,
  createHTML, addClassname, removeClassname,
  logMsg, getWindowSizeArray, getWindowScrollPos,
  stopPropagation, registerEventHandler, unregisterEventHandler;



  logMsg = function (msg) {
    return; // cancel logging for live
    if (window.console) {
      console.log(msg);
    }
  };
  
  removeClassname = function (element, name) {
    element.className = element.className.replace(" " + name, "");
  };
  
  
  addClassname = function (element, name) {
    name = " " + name;
    element.className = element.className.replace(name, "");
    element.className = element.className + name;
  };
  
  getWindowScrollPos = function() {
    var pos;
    if (window.pageYOffset !== undefined) {
      pos = window.pageYOffset;
    } else {
      pos = (document.documentElement || document.body.parentNode || document.body).scrollTop;
    }
    return pos;
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
  
  stopPropagation = function (e) {
    if (e.preventDefault) { e.preventDefault(); }
    if (e.stopPropagation) { e.stopPropagation(); }
    e.cancelBubble = true;
    e.returnValue = false;
    return false;
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
  

  /* -----------------------------------------------------------------
    Update functions - for updating positions of magnifier elements
  */  
  
  updMag = function() { 
    if ( ! hiResImg_inf.sizeAvailable) {return;} // loading has barely beged
    var x, y;
    x = mouse_inf.xMainImg;
    y = mouse_inf.yMainImg;
    if (x < loupeBnd_rct.left) {
      x = loupeBnd_rct.left;
    } else if (x > loupeBnd_rct.right) {
      x = loupeBnd_rct.right;
    }
    if (y < loupeBnd_rct.top) {
      y = loupeBnd_rct.top;
    } else if (y > loupeBnd_rct.bottom) {
      y = loupeBnd_rct.bottom;
    }
    // set loupe position
    loupe.style.left = Math.round(x - siz_inf.loupeHW - siz_inf.loupeBorder) + "px";
    loupe.style.top = Math.round(y - siz_inf.loupeHH - siz_inf.loupeBorder) + "px";
    // set mag image position
    // hiResImg.style.left = Math.round(siz_inf.magHW - ((x - siz_inf.mainImgBorder) * siz_inf.ratio)) + "px";
    hiResImg.style.left = Math.round(siz_inf.magHW - ((x - siz_inf.mainImgBorder) * siz_inf.ratio)) + "px";
    // hiResImg.style.top = Math.round(siz_inf.magHH - ((y - siz_inf.mainImgBorder) * siz_inf.ratio)) + "px";
    hiResImg.style.top = Math.round(siz_inf.magHH - ((y - siz_inf.mainImgBorder) * siz_inf.ratio)) + "px";
    
    // recur
    updateMag_tmr = setTimeout(updMag, FGMAG_RFR_MS);
  };
 
  
  
  /* -----------------------------------------------------------------
    Show / hid functions for magnifier window
  */
  
  shwMag = function() {
    // TODO show wht needs to be shown regardless, but start
    // hiRes load if necessary
    if ( ! hiResImg_inf.ldeStarted) {
      // lde hi-res image if this is the first attempt at shwing
      loadHiResImage();
    }
   // else if (hiResImg_inf.sizeAvailable && mag.style.display !== "inline-block") {
      // shw what needs to be shwn
    hiResImg.style.visibility = "visible";
      mag.style.display = "inline-block";
      loupe.style.display = "inline-block";
      magIsShowing = true;
    //}
  };
  
  hidMag = function() {
    // hid what needs to be hid
    mag.style.display = "none";
    loupe.style.display = "none";
    magIsShowing = false;
  };

  
  
  /* -----------------------------------------------------------------
    Housekeeping functions
  */

  loadHiResImage = function() {
    hiResImg.setAttribute("src", mainImg.src);
    addClassname(hiResImg, "loading");
    hiResImg_inf.ldeStarted = true;
    ldingMsg.style.display = "inline-block";
    hiResImgPreload_el = document.createElement("img");
    registerEventHandler(hiResImgPreload_el, "load", onHiResImageLoad);
    hiResImgPreload_el.setAttribute("src", hiResImg_inf.path);
    hiResImg_inf.sizeAvailable = true;
    hiResImg.width = ZOOMED_IMAGE_WIDTH;
    calculateSizes();
    shwMag();
    updateMag_tmr = setTimeout(updMag, FGMAG_RFR_MS);
  };
  

  
  onHiResImageLoad = function(e) {
    removeClassname(hiResImg, "loading");
    hiResImg.setAttribute("src", hiResImgPreload_el.src);
    // display the hi-res image
    ldingMsg.style.display = "none";
    imgLdingMsg.style.display = "none";
  };

  
  updateMousePos = function(e) {
    mouse_inf.x = e.touches ? e.touches[0].clientX : e.clientX;
    mouse_inf.y = e.touches ? e.touches[0].clientY : e.clientY;
    mouse_inf.xMainImg = mouse_inf.x - siz_inf.mainImgRealL;
    mouse_inf.yMainImg = mouse_inf.y - siz_inf.mainImgRealT + getWindowScrollPos();
  };
  
  

  
  calculateSizes = function() {
    var
    winSize_ar = getWindowSizeArray(),
    scrollPos = getWindowScrollPos(),
    biggestSide, biggestMeasurement, curMeasurement;
        
    updateMainImageMetrics();
        
    logMsg("calculateSizes:");
    
    // which side has most room?
    // check top side, call it biggest
    biggestMeasurement = siz_inf.mainImgRealT - scrollPos;
    biggestSide = "top";
    logMsg("\ttop: " + biggestMeasurement);
    // check right side - bigger than biggest?
    curMeasurement = winSize_ar[0] - (siz_inf.mainImgRealL + mainImg.offsetWidth);
    logMsg("\tright: " + curMeasurement);
    if (curMeasurement > biggestMeasurement) {
      biggestMeasurement = curMeasurement;
      biggestSide = "right";
    }
    // check bottom side - bigger than biggest?
    curMeasurement = winSize_ar[1] - (siz_inf.mainImgRealT + mainImg.offsetHeight) + scrollPos;
    logMsg("\tbottom: " + curMeasurement);
    if (curMeasurement > biggestMeasurement) {
      biggestMeasurement = curMeasurement;
      biggestSide = "bottom";
    }
    // check left side, bigger than biggest?
    curMeasurement = siz_inf.mainImgRealL;
    logMsg("\tleft: " + curMeasurement);
    if (curMeasurement > biggestMeasurement) {
      biggestMeasurement = curMeasurement;
      biggestSide = "left";
    }

    switch (biggestSide) {
      case "top":
        siz_inf.magW = mainImg.offsetWidth - (siz_inf.magBorder * 2);
        siz_inf.magH = biggestMeasurement;
        mag.style.left = siz_inf.mainImgRealL + "px";
        mag.style.top = scrollPos + "px";
        break;
      case "right":
        siz_inf.magW = biggestMeasurement - PAGE_MARGIN - (siz_inf.magBorder * 2);
        siz_inf.magH = mainImg.offsetHeight - (siz_inf.magBorder * 2);
        mag.style.left = (siz_inf.mainImgRealL + mainImg.offsetWidth) + "px";
        mag.style.top = siz_inf.mainImgRealT + "px";
        break;
      case "bottom":
        siz_inf.magW = mainImg.offsetWidth - (siz_inf.magBorder * 2);
        siz_inf.magH = biggestMeasurement;
        mag.style.left = siz_inf.mainImgRealL + "px";
        mag.style.top = (siz_inf.mainImgRealT + mainImg.offsetHeight) + "px";
        break;
      case "left":
        siz_inf.magW = biggestMeasurement;
        siz_inf.magH = mainImg.offsetHeight - (siz_inf.magBorder * 2);
        mag.style.left = 0 + "px";
        mag.style.top = siz_inf.mainImgRealT + "px";
        break;
    }

    // take general measurements of magnifier elements
    mag.style.width = siz_inf.magW + "px";
    mag.style.height = siz_inf.magH + "px"; 
    magInner.style.width = siz_inf.magW + "px";
    magInner.style.height = siz_inf.magH + "px";
    // work out siz_inf.ratio of magnified:small images
    siz_inf.ratio = hiResImg.width / (mainImg.width + siz_inf.loupeBorder * 2);
    if (siz_inf.ratio === 0) {siz_inf.ratio = 1;}
    // size loupe accordingly
    siz_inf.loupeW = siz_inf.magW / siz_inf.ratio;
    siz_inf.loupeH = siz_inf.magH / siz_inf.ratio;
    loupe.style.width = siz_inf.loupeW + "px";
    loupe.style.height = siz_inf.loupeH + "px";
    // measure some more important elements
    siz_inf.hiResHW = hiResImg.width/2;
    siz_inf.hiResHH = hiResImg.height/2;
    siz_inf.loupeHW = siz_inf.loupeW/2;
    siz_inf.loupeHH = siz_inf.loupeH/2;
    siz_inf.magHW = siz_inf.magW/2;
    siz_inf.magHH = siz_inf.magH/2;
    // set up boundaries
    loupeBnd_rct.left = siz_inf.loupeHW + siz_inf.loupeBorder + siz_inf.mainImgBorder;
    loupeBnd_rct.right = (mainImg.offsetWidth - siz_inf.loupeHW) + siz_inf.loupeBorder - siz_inf.mainImgBorder;
    loupeBnd_rct.top = siz_inf.loupeHH + siz_inf.loupeBorder + siz_inf.mainImgBorder;
    loupeBnd_rct.bottom = (mainImg.offsetHeight - siz_inf.loupeHH) + siz_inf.loupeBorder - siz_inf.mainImgBorder;
    mainImg_rct.left = mainImg.offsetLeft + siz_inf.magHW;
    mainImg_rct.right = mainImg.offsetLeft + mainImg.offsetWidth - siz_inf.magHW;
    mainImg_rct.top = mainImg.offsetTop + siz_inf.magHH;
    mainImg_rct.bottom = mainImg.offsetTop + mainImg.offsetHeight - siz_inf.magHH;
  };
  
  
  createHTML = function() {
    var
    parentElement, msgText;

    // set light/dark
    if(useLightColours) {
      colours_inf.borderLimit = BORDERCOLOUR_LIMIT_LIGHT;
      loupeBgResize = LOUPEBG_RESIZE_LIGHT;
      colours_inf.attract = BORDERCOLOUR_LIMIT_LIGHT;
    } else {
      colours_inf.borderLimit = BORDERCOLOUR_LIMIT_DARK;
      loupeBgResize = LOUPEBG_RESIZE_DARK;
      colours_inf.attract = BORDERCOLOUR_LIMIT_DARK;
    }

    // get parent
    parentElement = mainImg.parentNode;
    siz_inf.parentL = parentElement.offsetLeft;
    siz_inf.parentT = parentElement.offsetTop;
    
    // make loupe and attach it to inner container
    loupe = document.createElement("div");
    loupe.id = "loupe";
    parentElement.appendChild(loupe);
    loupe.style.pointerEvents = "none";
    loupeBgImgOrig = loupe.style.backgroundImage;
    // ! style measurements must be taken whilst object is displayed on page !
    siz_inf.loupeBorder = (loupe.offsetWidth - loupe.clientWidth) / 2;
    loupe.style.margin = "-" + siz_inf.loupeBorder + "px 0 0 -" + siz_inf.loupeBorder + "px";
    loupeBnd_rct = {};
    
    // make outer container for hi-res image and attach it to DOM
    mag = document.createElement("div");
    mag.id = "mag";
    document.body.appendChild(mag);
    // set position of magnifier (first frame of entry animation)
    siz_inf.magBorder = (mag.offsetWidth - mag.clientWidth) / 2;
    colours_inf.borderOrig = mag.style.borderColor;
    
    // create image loading message elements
    imgLdingMsg = document.createElement("p");
    imgLdingMsg.id = "magImgLdingMsg";
    imgLdingMsg.className = "alert";
    mag.appendChild(imgLdingMsg);
    msgText = document.createTextNode(IMGLDINGMSG_STR);
    imgLdingMsg.appendChild(msgText);
    ldingMsg = document.createElement("p");
    ldingMsg.id = "magLdingMsg";
    ldingMsg.className = "alert";
    parentElement.appendChild(ldingMsg);
    msgText = document.createTextNode(LDINGMSG_STR);
    ldingMsg.appendChild(msgText);
    ldingMsg.style.left = (mainImg.offsetLeft + siz_inf.mainImgBorder) + "px";
    ldingMsg.style.top = (mainImg.offsetTop + siz_inf.mainImgBorder) + "px";
    
    // make hi-res image inner container and attach it to outer container
    magInner = document.createElement("div");
    magInner.id = "magInner";
    mag.appendChild(magInner);
    
    // create hiResImg element
    hiResImg = document.createElement("img");
    hiResImg.id = "hiResImg";
    magInner.appendChild(hiResImg); 
    hiResImg.style.visibility = "hidden";
    
    // make sure elements aren't hidden too early or we cant use
    // appendChild or take style measurements from them
    loupe.style.display = "none";
    mag.style.display = "none";
    ldingMsg.style.display = "none";
  };
  
  updateMainImageMetrics = function() {
    logMsg("updateMainImageMetrics:");
    // measure border and position of main image
    var curElement = mainImg;
    siz_inf.mainImgBorder = Math.round((mainImg.offsetWidth - mainImg.clientWidth) / 2);
    siz_inf.mainImgRealL = 0;
    siz_inf.mainImgRealT = 0;
    while(curElement.tagName !== "HTML" && curElement.tagName !== "BODY") {
      siz_inf.mainImgRealT += curElement.offsetTop;
      siz_inf.mainImgRealL += curElement.offsetLeft;
      curElement = curElement.offsetParent;
    }
    logMsg("\tsiz_inf.mainImgRealL: " + siz_inf.mainImgRealL);
    logMsg("\tsiz_inf.mainImgRealT: " + siz_inf.mainImgRealT);
  };

  onResize = function(e) {
    logMsg("onResize");
    clearTimeout(onResize_tmr);
    onResize_tmr = setTimeout(updateAllMeasurements, UPDATE_DELAY_MS);
  };
  
  updateAllMeasurements = function() {
    var
    winSize_ar, winHeight, imgWidth,
    isSmallLayout = false;

    winSize_ar = getWindowSizeArray();
    
    if (imageMainContainer_el.offsetTop > itemDetails_el.offsetTop) {
      isSmallLayout = true;
    }
    
    logMsg("isSmallLayout: " + isSmallLayout);
    
    if (isSmallLayout) {
      winHeight = winSize_ar[1] - IMAGESIZE_TOPMARGIN_SMALL;
    } else {
      winHeight = winSize_ar[1] - IMAGESIZE_TOPMARGIN_NORMAL;
    }

    logMsg("updateAllMeasurements: ");
    logMsg("\twinSize_ar[0]: " + winSize_ar[0]);
    logMsg("\twinSize_ar[1]: " + winSize_ar[1]);
    
    if (isSmallLayout) {
      imgWidth = winSize_ar[0] - imageMainContainer_el.offsetLeft - IMAGESIZE_LEFTMARGIN_SMALL;
    } else {
      imgWidth = winSize_ar[0] - imageMainContainer_el.offsetLeft - IMAGESIZE_LEFTMARGIN_NORMAL;
    }

    while ((imgWidth / mainImageAspectRatio) > winHeight) {
      imgWidth -= IMAGE_RESIZE_STEP;
    }
    mainImg.style.width = imgWidth + "px";
    
    logMsg("\timgWidth: " + imgWidth);

    calculateSizes();
  };

  onScroll = function(e) {
    logMsg("onScroll");
    clearTimeout(onScroll_tmr);
    onScroll_tmr = setTimeout(updateAllMeasurements, UPDATE_DELAY_MS);
  };


  onMainImgMouseOver = function(e) {
    if(!magIsShowing) {
      clearTimeout(magShow_tmr);
      magShow_tmr = setTimeout(shwMag, MAGSHOW_DELAY_MS);
    }
    stopPropagation(e);
  };
  
  
  onMainImgTouchStart = function(e) {
    onMainImgMouseOver(e);
    updateMousePos(e);
  };
  

  onMainImgMouseOut = function(e) {
    clearTimeout(magShow_tmr);
    if(magIsShowing) {
      hidMag();
    }
    stopPropagation(e);
  };
  
  
  onDocumentDragStart = function(e) { // end IE drag
    stopPropagation(e);
  };
  
  
  onWindowLoad = function() {
    mainImageAspectRatio = mainImg.offsetWidth / mainImg.offsetHeight;

    imageMainContainer_el = document.getElementById("item-image");
    itemDetails_el = document.getElementsByClassName("item-details")[0];

    updateMainImageMetrics();
    createHTML();

    updateAllMeasurements();
    
    removeClassname(mainImg, "invisible");
    //
    registerEventHandler(document, "mousemove", updateMousePos);
    registerEventHandler(document, "touchmove", updateMousePos);

    registerEventHandler(mainImg, "mousedown", onMainImgMouseOver);
    //registerEventHandler(mainImg, "mouseover", onMainImgMouseOver);
    registerEventHandler(mainImg, "touchstart", onMainImgTouchStart);

    registerEventHandler(mag, "mouseover", stopPropagation);
    registerEventHandler(document, "mouseup", onMainImgMouseOut);
    //registerEventHandler(mainImg, "mouseout", onMainImgMouseOut);
    registerEventHandler(mainImg, "touchend", onMainImgMouseOut);

    registerEventHandler(document, "dragstart", onDocumentDragStart);  

    registerEventHandler(window, "resize", onResize);
    registerEventHandler(window, "scroll", onScroll);
  };
  
  
  
  return {
    /*
    ---------------------------------------------------------
                  PUBLIC
    ---------------------------------------------------------
    */
    create: function(hiResPath, image_ob, useLightColours) { // create our magnifier
      mainImg = document.getElementById(image_ob);
      hiResImg_inf.path = hiResPath;
      useLightColours = useLightColours;
      if (mainImg) {
        //hiResImg_inf.path = mainImg.src;
        addClassname(mainImg, "invisible");
        registerEventHandler(window, "load", onWindowLoad);
      }
    }
  };
}());
