
(function() {
  document.addEventListener('DOMContentLoaded', function() {
    fetchMovieStylesheet();
  });

  var BASE_URL = 'http://localhost:4567';
  var client = new http.SimpleHTTPClient();

  fetchMoviesByPage(1);

  function fetchMovieStylesheet() {
    client
      .get('/assets/xml/movie.xsl')
      .after(saveStyleSheetToLocalStorage)
      .send();
  }

  function saveStyleSheetToLocalStorage(stylesheet) {
    localStorage.setItem('movie.xsl', stylesheet);
  }

  function fetchMoviesByPage(pageNumber) {
    client
      .get(BASE_URL + '/movies/page/' + pageNumber)
      .after(displayMovies)
      .send();
  }

  function displayMovies(xml) {
    var xsl = localStorage.getItem('movie.xsl');

    if (xsl) {
      var htmlMoviesFragment = transformToHtmlDocument(xml, xsl);
      var movieList = document.querySelector('.twelve.column.movie-list');

      movieList.appendChild(htmlMoviesFragment);
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
})();