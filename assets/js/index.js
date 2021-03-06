
(function() {
  document.addEventListener('DOMContentLoaded', function() {
    fetchMovieStylesheet();
    fetchMovieDetailStylesheet();
    fetchMovies(1);

    // one-way data biding to search bar
    MVC.OneWayBindingInputControl(
      model,
      document.getElementById('searchBar'),
      function(data) { return data.params.title; }
    );
  });

  // var BASE_URL = 'http://localhost:4567';
  var BASE_URL = 'https://your-movies.herokuapp.com';
  var client = new http.SimpleHTTPClient();
  var XML = new xml.XML();
  var MVC = new mvc.SimpleMVC();
  var simpleMemoryStorage = new Map();

  var model = new MVC.Model({
    moviesXML: undefined,
    movieDetailXML: undefined,
    showListView: true,
    params: {
      page: 1,
      title: '',
    },
  });
  var view = new MVC.View(model, handleModelChange);
  var controller = new MVC.Controller(view, model, {
    fetchMovies: fetchMovies,
    fetchMovieDetail: fetchMovieDetail,
    backToListView: backToListView,
    searchFor: searchFor,
    home: home,
  });

  // expose controller to global scope
  window.controller = controller;

  function handleModelChange(data) {
    showListView(Visibility.HIDDEN);
    showDetailView(Visibility.HIDDEN);

    if (!data.showListView) {
      return displayMovieDetail(data.movieDetailXML);
    }
    
    var totalCount = queryTotalCount(data.moviesXML);
    if (totalCount > 0) {
      return displayMovies(data.moviesXML);
    }

    showNoResults(totalCount > 0 ? Visibility.HIDDEN : Visibility.VISIBLE);
  }

  function fetchMovieStylesheet() {
    client
      .get('assets/xml/movie.xsl')
      .after(saveStyleSheetToStorage)
      .send();
  }

  function fetchMovieDetailStylesheet() {
    client
      .get('assets/xml/movieDetail.xsl')
      .after(saveMovieDetailStyleSheetToStorage)
      .send();
  }

  function saveStyleSheetToStorage(stylesheet) {
    simpleMemoryStorage.set('movie.xsl', stylesheet);
  }

  function saveMovieDetailStyleSheetToStorage(stylesheet) {
    simpleMemoryStorage.set('movieDetail.xsl', stylesheet);
  }

  function fetchMovies(pageNumber, _title) {
    // UI
    showListView(Visibility.HIDDEN);
    showDetailView(Visibility.HIDDEN);
    showLoadingIndicator(Visibility.VISIBLE);
    showNoResults(Visibility.HIDDEN);

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
      .whatever(showLoadingIndicator.bind(null, Visibility.HIDDEN))
      .send();
  }

  function fetchMovieDetail(id) {
    //UI
    showListView(Visibility.HIDDEN);
    showLoadingIndicator(Visibility.VISIBLE);

    client
      .get(BASE_URL + '/movies/' + id)
      .after(function(xml) {
        var dom = XML.domFromString(xml);
        controller.updateData({ movieDetailXML: dom, showListView: false });
      })
      .whatever(showLoadingIndicator.bind(null, Visibility.HIDDEN))
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

  function home() {
    fetchMovies(1, '');
  }

  function displayMovies(xml) {
    var xsl = simpleMemoryStorage.get('movie.xsl');

    if (xsl) {
      var htmlMoviesFragment = XML.transformToHtmlDocument(xml, xsl);
      var movieList = document.querySelector('.twelve.column.movie-list');

      removeAllChildrenFrom(movieList);
      movieList.appendChild(htmlMoviesFragment);

      showListView(Visibility.VISIBLE);
    }
  }

  function displayMovieDetail(xml) {
    var xsl = simpleMemoryStorage.get('movieDetail.xsl');

    if (xsl) {
      var htmlMovieDetailFragment = XML.transformToHtmlDocument(xml, xsl);
      var movieDetail = document.querySelector('.container-detail');

      removeAllChildrenFrom(movieDetail);
      movieDetail.appendChild(htmlMovieDetailFragment);

      showDetailView(Visibility.VISIBLE);
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

  function showLoadingIndicator(show) {
    var loading = document.querySelector('.loading');
    loading.style.display = show ? 'block' : 'none';
  }

  function showNoResults(show) {
    var noResults = document.querySelector('.no-results');
    noResults.style.display = show ? 'flex' : 'none';
  }

  function removeAllChildrenFrom(doc) {
    if (doc === undefined) return;

    while (doc.firstChild) {
      doc.removeChild(doc.firstChild);
    }
  }

  function queryTotalPage(dom) {
    var totalPage = queryTotalCount(dom);
    var pageSize = queryPagesize(dom);

    return Math.ceil(totalPage / pageSize);
  }

  function queryPagesize(dom) {
    return dom.evaluate('//@*[local-name()="pageSize"]', dom, null, XPathResult.NUMBER_TYPE, null).numberValue;
  }

  function queryTotalCount(dom) {
    return dom.evaluate('//@*[local-name()="totalCount"]', dom, null, XPathResult.NUMBER_TYPE, null).numberValue;
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
        return function(e) {
          if (containsOnlyDigits(e.target.textContent)) {
            controller.fetchMovies(page);
            setPageActive(page);
          } else {
            binarySearchFetch(e.target);
          }
        }
      })(paginationItems[i - 1]));

      pagination.appendChild(li);
    }

    // add prev and next button
    pagination = withPrevAndNext(pagination);

    // re-append pagination items to its container
    var pageginationContainer = document.querySelector('.row.pagination-container');
    removeAllChildrenFrom(pageginationContainer);
    if (pagination) {
      pageginationContainer.appendChild(pagination);
    }
  }

  function paginationWithPageBreak(totalPage, pageActive) {
    var delta = 2
    var left = pageActive - delta;
    var right = pageActive + delta + 1;
    var result = [];

    result = Array
      .from({length: totalPage}, function(_, k) { return k + 1 })
      .filter(function(i) { return (i && i >= left && i < right) });

    if (totalPage > (delta * 2 + 3)) {
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
    } else {
      result = Array.from({length: totalPage}, function(_, k) { return k + 1 });
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

  function binarySearchFetch(pageBreak) {
    var pageActive = model.getData().params.page;
    var dom = model.getData().moviesXML;
    var totalPage = queryTotalPage(dom);
    var pageToGo = pageActive;

    if (Number(pageBreak.previousSibling.textContent) === 1) { // left break
      pageToGo = Math.ceil(pageActive / 2);
    } else { // right break
      pageToGo = Math.ceil(pageActive + ((totalPage - pageActive) / 2));
    }

    fetchMovies(pageToGo);
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

  function containsOnlyDigits(value) {
    return /^\d+$/.test(value);
  }

  var Visibility = {
    VISIBLE: true,
    HIDDEN: false,
  }
})();