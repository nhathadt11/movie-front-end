
(function() {
  document.addEventListener('DOMContentLoaded', function() {
    fetchMovieStylesheet();
    renderPagination(7, 1);
  });

  var BASE_URL = 'http://localhost:4567';
  var client = new http.SimpleHTTPClient();

  fetchMoviesByPage(1, function(xml) {
    displayMovies(xml);
    setPageActive(1);
  });

  function fetchMovieStylesheet() {
    client
      .get('/assets/xml/movie.xsl')
      .after(saveStyleSheetToLocalStorage)
      .send();
  }

  function saveStyleSheetToLocalStorage(stylesheet) {
    localStorage.setItem('movie.xsl', stylesheet);
  }

  function fetchMoviesByPage(pageNumber, success) {
    client
      .get(BASE_URL + '/movies/page/' + pageNumber)
      .after(success)
      .send();
  }

  function displayMovies(xml) {
    var xsl = localStorage.getItem('movie.xsl');

    if (xsl) {
      var htmlMoviesFragment = transformToHtmlDocument(xml, xsl);
      var movieList = document.querySelector('.twelve.column.movie-list');

      removeAllChildrenFrom(movieList);
      movieList.appendChild(htmlMoviesFragment);
    }
  }

  function removeAllChildrenFrom(doc) {
    while (doc.firstChild) {
      doc.removeChild(doc.firstChild);
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

  /**
   * Pagination
   */
  function renderPagination(totalPage, activePage) {
    var pagination = document.createElement('ul');
    pagination.classList.add('pagination');

    for (var i = 1; i <= totalPage; i++) {
      var li = document.createElement('li');

      li.classList.add('float-card', 'pagination-item')
      li.innerText = i;

      if (i === activePage) {
        li.classList.add('activeadd')
      } else {
        li.classList.remove('active');
      }

      li.addEventListener('click', (function(page) {
        return function() {
          fetchMoviesByPage(page, function(xml) {
            displayMovies(xml);
            setPageActive(page);
          });
        }
      })(i));

      pagination.appendChild(li);
    }

    var footer = document.querySelector('.row.footer');
    footer.appendChild(pagination);
  }

  function setPageActive(pageActive) {
    var pages = document.querySelectorAll('.float-card.pagination-item');

    pages.forEach(function(page) {
      if (Number(page.textContent) === pageActive) {
        page.classList.add('active');
      } else {
        page.classList.remove('active');
      }
    })
  }
})();