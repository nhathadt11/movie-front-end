(function(window) {
  window.xml = {
    XML: XML,
  }

  function XML() {
    return {
      transformToHtmlDocument: transformToHtmlDocument,
      domFromString: domFromString,
    }
  }

  function domFromString(xml) {
    return new DOMParser().parseFromString(xml, 'application/xml');
  }

  function transformToHtmlDocument(xml, xsl) {
    if (document.implementation && document.implementation.createDocument) {
      var xmlDoc = isDocument(xml) ? xml : domFromString(xml);
      var xslDoc = isDocument(xsl) ? xml : domFromString(xsl);
      
      var xsltProcessor = new XSLTProcessor();
      xsltProcessor.importStylesheet(xslDoc);

      return xsltProcessor.transformToFragment(xmlDoc, document);
    }
  }

  function isDocument(doc) {
    return doc instanceof Document;
  }
})(window);