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
  hiResImg_inf = {}, colours_inf = {}, size_inf = {}, mouse_inf = {},
  loupeBgResize, loupeBgImgOrig,
  itemDetails_el, imageMainContainer_el, mainColumn_el,
  magIsShowing,
  mag, magInner, loupe, mainImg, hiResImg,
  loadingMsg, imgLoadingMsg, mainImageAspectRatio,
  calculateSizes, updateAllMeasurements,
  showMag, hideMag, updateMag, updateMousePos, updateMainImageMetrics,
  loadHiResImage, onHiResImageLoad, hiResImgPreload_el,
  
  onResize, onScroll, onStopInteraction, onStartInteraction, onMainImgTouchStart, onWindowLoad,
  createHTML, addClassname, removeClassname,
  logMsg, getWindowSizeArray, getWindowScrollPos,
  clamp, stopPropagation, registerEventHandler, unregisterEventHandler;



  logMsg = function (msg) {
    return; // cancel logging for live
    if (window.console) { console.log(msg); }
  };

  clamp = function (num, min, max) {
    return Math.min(Math.max(num, min), max);
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
  
  updateMag = function() { 
    var
      x = clamp(mouse_inf.xMainImg, loupeBnd_rct.left, loupeBnd_rct.right),
      y = clamp(mouse_inf.yMainImg, loupeBnd_rct.top, loupeBnd_rct.bottom);
    // set loupe position
    loupe.style.left = Math.round(x - size_inf.loupeHW - size_inf.loupeBorder) + "px";
    loupe.style.top = Math.round(y - size_inf.loupeHH - size_inf.loupeBorder) + "px";
    // set mag image position
    hiResImg.style.left = Math.round(size_inf.magHW - ((x - size_inf.mainImgBorder) * size_inf.ratio)) + "px";
    hiResImg.style.top = Math.round(size_inf.magHH - ((y - size_inf.mainImgBorder) * size_inf.ratio)) + "px";
    
    // recur
    updateMag_tmr = setTimeout(updateMag, FGMAG_RFR_MS);
  };
 
  
  
  /* -----------------------------------------------------------------
    Show / hid functions for magnifier window
  */

  showMag = function() {
    if ( ! hiResImg_inf.loadStarted) { loadHiResImage(); }
    hiResImg.style.visibility = "visible";
    mag.style.display = "inline-block";
    loupe.style.display = "inline-block";
    magIsShowing = true;
  };
  
  hideMag = function() {
    mag.style.display = "none";
    loupe.style.display = "none";
    magIsShowing = false;
  };

  
  
  /* -----------------------------------------------------------------
    Housekeeping functions
  */

  loadHiResImage = function() {
    // for now use the normal-sized main image (scaled up) as zoomed version
    // so that the zoom starts working immediately
    // rather than having to wait for the hi-res to load
    hiResImg.setAttribute("src", mainImg.src);
    addClassname(hiResImg, "loading");
    loadingMsg.style.display = "inline-block";
    hiResImgPreload_el = document.createElement("img");
    registerEventHandler(hiResImgPreload_el, "load", onHiResImageLoad);
    hiResImgPreload_el.setAttribute("src", hiResImg_inf.path);
    hiResImg_inf.loadStarted = true;
    hiResImg.width = ZOOMED_IMAGE_WIDTH;
    calculateSizes();
    showMag();
    updateMag_tmr = setTimeout(updateMag, FGMAG_RFR_MS);
  };
  
  
  onHiResImageLoad = function(e) {
    removeClassname(hiResImg, "loading");
    hiResImg.setAttribute("src", hiResImgPreload_el.src);
    loadingMsg.style.display = "none";
    imgLoadingMsg.style.display = "none";
  };

  
  updateMousePos = function(e) {
    mouse_inf.x = e.touches ? e.touches[0].clientX : e.clientX;
    mouse_inf.y = e.touches ? e.touches[0].clientY : e.clientY;
    mouse_inf.xMainImg = mouse_inf.x - size_inf.mainImgRealL;
    mouse_inf.yMainImg = mouse_inf.y - size_inf.mainImgRealT + getWindowScrollPos();
  };

  
  calculateSizes = function() {
    var
    winSize_ar = getWindowSizeArray(),
    scrollPos = getWindowScrollPos(),
    biggestSide, biggestMeasurement, curMeasurement;
        
    updateMainImageMetrics();
        
    // which side has most room?
    // check top side, call it biggest
    biggestMeasurement = size_inf.mainImgRealT - scrollPos;
    biggestSide = "top";
    // check right side - bigger than biggest?
    curMeasurement = winSize_ar[0] - (size_inf.mainImgRealL + mainImg.offsetWidth);
    if (curMeasurement > biggestMeasurement) {
      biggestMeasurement = curMeasurement;
      biggestSide = "right";
    }
    // check bottom side - bigger than biggest?
    curMeasurement = winSize_ar[1] - (size_inf.mainImgRealT + mainImg.offsetHeight) + scrollPos;
    if (curMeasurement > biggestMeasurement) {
      biggestMeasurement = curMeasurement;
      biggestSide = "bottom";
    }
    // check left side, bigger than biggest?
    curMeasurement = size_inf.mainImgRealL;
    if (curMeasurement > biggestMeasurement) {
      biggestMeasurement = curMeasurement;
      biggestSide = "left";
    }

    switch (biggestSide) {
      case "top":
        size_inf.magW = mainImg.offsetWidth;
        size_inf.magH = biggestMeasurement;
        mag.style.left = size_inf.mainImgRealL + "px";
        mag.style.top = scrollPos + "px";
        break;
      case "right":
        size_inf.magW = biggestMeasurement - PAGE_MARGIN - (size_inf.magBorder * 2);
        size_inf.magH = mainImg.offsetHeight;
        mag.style.left = (size_inf.mainImgRealL + mainImg.offsetWidth) + "px";
        mag.style.top = size_inf.mainImgRealT + "px";
        break;
      case "bottom":
        size_inf.magW = mainImg.offsetWidth;
        size_inf.magH = biggestMeasurement;
        mag.style.left = size_inf.mainImgRealL + "px";
        mag.style.top = (size_inf.mainImgRealT + mainImg.offsetHeight) + "px";
        break;
      case "left":
        size_inf.magW = biggestMeasurement;
        size_inf.magH = mainImg.offsetHeight;
        mag.style.left = 0 + "px";
        mag.style.top = size_inf.mainImgRealT + "px";
        break;
    }

    // take general measurements of magnifier elements
    mag.style.width = size_inf.magW + "px";
    mag.style.height = size_inf.magH + "px"; 
    magInner.style.width = size_inf.magW + "px";
    magInner.style.height = size_inf.magH + "px";
    // work out size_inf.ratio of magnified:small images
    size_inf.ratio = hiResImg.width / (mainImg.width + size_inf.loupeBorder * 2);
    if (size_inf.ratio === 0) {size_inf.ratio = 1;}
    // size loupe accordingly
    size_inf.loupeW = size_inf.magW / size_inf.ratio;
    size_inf.loupeH = size_inf.magH / size_inf.ratio;
    loupe.style.width = size_inf.loupeW + "px";
    loupe.style.height = size_inf.loupeH + "px";
    // measure some more important elements
    size_inf.hiResHW = hiResImg.width/2;
    size_inf.hiResHH = hiResImg.height/2;
    size_inf.loupeHW = size_inf.loupeW/2;
    size_inf.loupeHH = size_inf.loupeH/2;
    size_inf.magHW = size_inf.magW/2;
    size_inf.magHH = size_inf.magH/2;
    // set up boundaries
    loupeBnd_rct.left = size_inf.loupeHW + size_inf.loupeBorder + size_inf.mainImgBorder;
    loupeBnd_rct.right = (mainImg.offsetWidth - size_inf.loupeHW) + size_inf.loupeBorder - size_inf.mainImgBorder;
    loupeBnd_rct.top = size_inf.loupeHH + size_inf.loupeBorder + size_inf.mainImgBorder;
    loupeBnd_rct.bottom = (mainImg.offsetHeight - size_inf.loupeHH) + size_inf.loupeBorder - size_inf.mainImgBorder;
    mainImg_rct.left = mainImg.offsetLeft + size_inf.magHW;
    mainImg_rct.right = mainImg.offsetLeft + mainImg.offsetWidth - size_inf.magHW;
    mainImg_rct.top = mainImg.offsetTop + size_inf.magHH;
    mainImg_rct.bottom = mainImg.offsetTop + mainImg.offsetHeight - size_inf.magHH;
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
    size_inf.parentL = parentElement.offsetLeft;
    size_inf.parentT = parentElement.offsetTop;
    
    // make loupe and attach it to inner container
    loupe = document.createElement("div");
    loupe.id = "loupe";
    parentElement.appendChild(loupe);
    loupe.style.pointerEvents = "none";
    loupeBgImgOrig = loupe.style.backgroundImage;
    // ! style measurements must be taken whilst object is displayed on page !
    size_inf.loupeBorder = (loupe.offsetWidth - loupe.clientWidth) / 2;
    loupe.style.margin = "-" + size_inf.loupeBorder + "px 0 0 -" + size_inf.loupeBorder + "px";
    loupeBnd_rct = {};
    
    // make outer container for hi-res image and attach it to DOM
    mag = document.createElement("div");
    mag.id = "mag";
    document.body.appendChild(mag);
    // set position of magnifier (first frame of entry animation)
    size_inf.magBorder = (mag.offsetWidth - mag.clientWidth) / 2;
    colours_inf.borderOrig = mag.style.borderColor;
    
    // create image loading message elements
    imgLoadingMsg = document.createElement("p");
    imgLoadingMsg.id = "magImgLoadingMsg";
    imgLoadingMsg.className = "alert";
    mag.appendChild(imgLoadingMsg);
    msgText = document.createTextNode(IMGLDINGMSG_STR);
    imgLoadingMsg.appendChild(msgText);
    loadingMsg = document.createElement("p");
    loadingMsg.id = "magLoadingMsg";
    loadingMsg.className = "alert";
    parentElement.appendChild(loadingMsg);
    msgText = document.createTextNode(LDINGMSG_STR);
    loadingMsg.appendChild(msgText);
    loadingMsg.style.left = (mainImg.offsetLeft + size_inf.mainImgBorder) + "px";
    loadingMsg.style.top = (mainImg.offsetTop + size_inf.mainImgBorder) + "px";
    
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
    loadingMsg.style.display = "none";
  };
  
  updateMainImageMetrics = function() {
    // measure border and position of main image
    var curElement = mainImg;
    size_inf.mainImgBorder = Math.round((mainImg.offsetWidth - mainImg.clientWidth) / 2);
    size_inf.mainImgRealL = 0;
    size_inf.mainImgRealT = 0;
    while(curElement.tagName !== "HTML" && curElement.tagName !== "BODY") {
      size_inf.mainImgRealT += curElement.offsetTop;
      size_inf.mainImgRealL += curElement.offsetLeft;
      curElement = curElement.offsetParent;
    }
  };

  onResize = function(e) {
    clearTimeout(onResize_tmr);
    onResize_tmr = setTimeout(updateAllMeasurements, UPDATE_DELAY_MS);
  };
  
  updateAllMeasurements = function() {
    var
    winHeight, imgWidth,
    winSize_ar = getWindowSizeArray();
    
    if (imageMainContainer_el.offsetTop > itemDetails_el.offsetTop) { // small layout
      winHeight = winSize_ar[1] - IMAGESIZE_TOPMARGIN_SMALL;
      imgWidth = winSize_ar[0] - imageMainContainer_el.offsetLeft - IMAGESIZE_LEFTMARGIN_SMALL;
    } else {
      imgWidth = winSize_ar[0] - imageMainContainer_el.offsetLeft - IMAGESIZE_LEFTMARGIN_NORMAL;
      winHeight = winSize_ar[1] - IMAGESIZE_TOPMARGIN_NORMAL;
    }

    while ((imgWidth / mainImageAspectRatio) > winHeight) {
      imgWidth -= IMAGE_RESIZE_STEP;
    }
    mainImg.style.width = imgWidth + "px";

    calculateSizes();
  };


  onScroll = function(e) {
    clearTimeout(onScroll_tmr);
    onScroll_tmr = setTimeout(updateAllMeasurements, UPDATE_DELAY_MS);
  };


  onStartInteraction = function(e) {
    if(!magIsShowing) {
      clearTimeout(magShow_tmr);
      magShow_tmr = setTimeout(showMag, MAGSHOW_DELAY_MS);
    }
    stopPropagation(e);
  };
  
  
  onMainImgTouchStart = function(e) {
    onStartInteraction(e);
    updateMousePos(e);
  };
  

  onStopInteraction = function(e) {
    clearTimeout(magShow_tmr);
    if(magIsShowing) {
      hideMag();
    }
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

    registerEventHandler(mainImg, "mousedown", onStartInteraction);
    registerEventHandler(mainImg, "touchstart", onMainImgTouchStart);

    registerEventHandler(document, "mouseup", onStopInteraction);
    registerEventHandler(mainImg, "touchend", onStopInteraction);

    registerEventHandler(mag, "mouseover", stopPropagation);
    registerEventHandler(document, "dragstart", stopPropagation);  

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
        addClassname(mainImg, "invisible");
        registerEventHandler(window, "load", onWindowLoad);
      }
    }
  };
}());
