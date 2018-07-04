(function(window) {
  window.xml = {
    XML: XML,
  }

  function XML() {
    return {
      transformToHtmlDocument: transformToHtmlDocument,
    }
  }

  function parseFromString(xml) {
    return new DOMParser().parseFromString(xml, 'application/xml');
  }

  function transformToHtmlDocument(xml, xsl) {
    if (document.implementation && document.implementation.createDocument) {
      var xmlDoc = parseFromString(xml);
      var xslDoc = parseFromString(xsl);

      var xsltProcessor = new XSLTProcessor();
      xsltProcessor.importStylesheet(xslDoc);

      return xsltProcessor.transformToFragment(xmlDoc, document);
    }
  }
})(window);