
(function() {
  document.addEventListener('DOMContentLoaded', function() {
    fetchMovieStylesheet();
    fetchMovieDetailStylesheet();
    fetchMovies(1);
  });

  // var BASE_URL = 'http://localhost:4567';
  var BASE_URL = 'https://your-movies.herokuapp.com';
  var client = new http.SimpleHTTPClient();
  var XML = new xml.XML();
  var MVC = new mvc.SimpleMVC();

  var model = new MVC.Model({
    moviesXML: undefined,
    movieDetailXML: undefined,
    showListView: true,
    params: {
      page: 1,
      title: undefined,
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

        var dom = XML.domFromString(xml);
        var totalPage = queryTotalPage(dom);

        controller.updateData({ moviesXML: dom, params: nextParams, showListView: true });
        renderPagination(totalPage, pageNumber);
        setPageActive(pageNumber);
      })
      .send();
  }

  function fetchMovieDetail(id) {
    client
      .get(BASE_URL + '/movies/' + id)
      .after(function(xml) {
        var dom = XML.domFromString(xml);
        controller.updateData({ movieDetailXML: dom, showListView: false });
      })
      .send();
  }

  function searchFor(e) {
    e.preventDefault();

    if (e.keyCode === 13) {
      var title = e.target.value;
  
      fetchMovies(1, title);
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

  function queryTotalPage(dom) {
    var totalPage = dom.evaluate('//@*[local-name()="totalCount"]', dom, null, XPathResult.NUMBER_TYPE, null).numberValue;
    var pageSize = dom.evaluate('//@*[local-name()="pageSize"]', dom, null, XPathResult.NUMBER_TYPE, null).numberValue;

    return Math.ceil(totalPage / pageSize);
  }

  /**
   * Pagination
   */
  function renderPagination(totalPage, activePage) {
    var pagination = document.createElement('ul');
    pagination.classList.add('pagination');

    // generate pagination items with page break
    var paginationItems = paginationWithPageBreak(totalPage, activePage);
    for (var i = 1; i <= paginationItems.length; i++) {
      var li = document.createElement('li');

      li.classList.add('float-card', 'pagination-item')
      li.innerText = paginationItems[i - 1];

      if (i === activePage) {
        li.classList.add('active')
      } else {
        li.classList.remove('active');
      }

      li.addEventListener('click', (function(page) {
        return function() {
          controller.fetchMovies(page);
        }
      })(paginationItems[i - 1]));

      pagination.appendChild(li);
    }

    // add prev and next button
    pagination = withPrevAndNext(pagination);

    // re-append pagination items to its container
    var pageginationContainer = document.querySelector('.row.pagination-container');
    removeAllChildrenFrom(pageginationContainer);
    pageginationContainer.appendChild(pagination);
  }

  function paginationWithPageBreak(totalPage, pageActive) {
    let delta = 2,
        left = pageActive - delta,
        right = pageActive + delta + 1,
        result = [];

    result = Array.from({length: totalPage}, (v, k) => k + 1)
        .filter(i => i && i >= left && i < right);

    if (totalPage > 7) {
      if (pageActive - delta - 1 > 1) {
        result.splice(0, 0, '...');
      }
      if (pageActive + delta + 1 < totalPage) {
        result.splice(result.length, 0, '...');
      }

      if (result.find(findValue(1)) === undefined) {
        result.unshift(1);
      }
      if (result.find(findValue(totalPage)) === undefined) {
        result.push(totalPage);
      }
    }

    return result;
  }

  function findValue(expected) {
    return function(value) {
      return value === expected;
    }
  }

  function withPrevAndNext(pagination) {
    if (!pagination.firstChild) return;

    var pageActive = model.getData().params.page;
    var moviesXML = model.getData().moviesXML;
    var totalPage = queryTotalPage(moviesXML);

    var prev = document.createElement('li');
    prev.classList.add('float-card', 'pagination-item');
    prev.innerHTML = '<a href="#" class="arrow left"></a>';
    prev.addEventListener('click', function(e) {
      e.preventDefault();

      if (pageActive > 1) {
        fetchMovies(pageActive - 1);
      }
    });

    var next = document.createElement('li');
    next.classList.add('float-card', 'pagination-item');
    next.innerHTML = '<a href="#" class="arrow right"></a>';
    next.addEventListener('click', function(e) {
      e.preventDefault();

      if (pageActive < totalPage) {
        fetchMovies(pageActive + 1);
      }
    });

    pagination.insertBefore(prev, pagination.firstChild);
    pagination.appendChild(next);

    return pagination;
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