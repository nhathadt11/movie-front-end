
(function() {
  document.addEventListener('DOMContentLoaded', function() {
    fetchMovieStylesheet();
    fetchMovieDetailStylesheet();
    fetchMovies(1);
    renderPagination(7, 1);
  });

  var BASE_URL = 'http://localhost:4567';
  var client = new http.SimpleHTTPClient();
  var XML = new xml.XML();
  var MVC = new mvc.SimpleMVC();

  var model = new MVC.Model({
    moviesXML: undefined,
    movieDetailXML: undefined,
    showListView: true,
    params: {
      page: 1,
    },
  });
  var view = new MVC.View(model, handleModelChange);
  var controller = new MVC.Controller(view, model, {
    fetchMovies: fetchMovies,
    fetchMovieDetail: fetchMovieDetail,
    backToListView: backToListView,
    searchFor: searchFor,
  });

  // expose controller to global scope
  document.controller = controller;

  function handleModelChange(data) {
    showListView(false);
    showDetailView(false);

    if (data.showListView) {
      displayMovies(data.moviesXML);
    } else {
      displayMovieDetail(data.movieDetailXML);
    }
  }

  function fetchMovieStylesheet() {
    client
      .get('/assets/xml/movie.xsl')
      .after(saveStyleSheetToLocalStorage)
      .send();
  }

  function fetchMovieDetailStylesheet() {
    client
      .get('/assets/xml/movieDetail.xsl')
      .after(saveMovieDetailStyleSheetToLocalStorage)
      .send();
  }

  function saveStyleSheetToLocalStorage(stylesheet) {
    localStorage.setItem('movie.xsl', stylesheet);
  }

  function saveMovieDetailStyleSheetToLocalStorage(stylesheet) {
    localStorage.setItem('movieDetail.xsl', stylesheet);
  }

  function fetchMovies(pageNumber, _title) {
    var title = _title === undefined ? model.getData().params.title : _title;
    
    client
      .get(BASE_URL + '/movies/page/' + pageNumber, { params: { title: title } })
      .after(function(xml) {
        var nextParams = withNewParams({ page: pageNumber, title: title });

        controller.updateData({ moviesXML: xml, params: nextParams, showListView: true });
        setPageActive(pageNumber);
      })
      .send();
  }

  function fetchMovieDetail(id) {
    client
      .get(BASE_URL + '/movies/' + id)
      .after(function(xml) {
        controller.updateData({ movieDetailXML: xml, showListView: false });
      })
      .send();
  }

  function searchFor(e) {
    e.preventDefault();

    if (e.keyCode === 13) {
      var pageNumber = model.getData().params.page;
      var title = e.target.value;
  
      fetchMovies(pageNumber, title);
    }
  }

  function backToListView() {
    controller.updateData({ showListView: true });
  }

  function displayMovies(xml) {
    var xsl = localStorage.getItem('movie.xsl');

    if (xsl) {
      var htmlMoviesFragment = XML.transformToHtmlDocument(xml, xsl);
      var movieList = document.querySelector('.twelve.column.movie-list');

      removeAllChildrenFrom(movieList);
      movieList.appendChild(htmlMoviesFragment);

      showListView(true);
    }
  }

  function displayMovieDetail(xml) {
    var xsl = localStorage.getItem('movieDetail.xsl');

    if (xsl) {
      var htmlMovieDetailFragment = XML.transformToHtmlDocument(xml, xsl);
      var movieDetail = document.querySelector('.container-detail');

      removeAllChildrenFrom(movieDetail);
      movieDetail.appendChild(htmlMovieDetailFragment);

      showDetailView(true);
    }
  }

  function showListView(show) {
    var listView = document.querySelector('.list-view');
    listView.style.display = show ? 'block' : 'none';
  }

  function showDetailView(show) {
    var detailView = document.querySelector('.detail-view');
    detailView.style.display = show ? 'flex' : 'none';
  }

  function removeAllChildrenFrom(doc) {
    while (doc.firstChild) {
      doc.removeChild(doc.firstChild);
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
        li.classList.add('active')
      } else {
        li.classList.remove('active');
      }

      li.addEventListener('click', (function(page) {
        return function() {
          controller.fetchMovies(page);
        }
      })(i));

      pagination.appendChild(li);
    }

    var pageginationContainer = document.querySelector('.row.pagination-container');
    pageginationContainer.appendChild(pagination);
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

  function withNewParams(newParams) {
    var prevParams = model.getData().params;
    var nextParams = Object.assign({}, prevParams, newParams);

    return nextParams;
  }
})();