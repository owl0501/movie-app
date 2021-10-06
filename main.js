const img_url = 'https://image.tmdb.org/t/p/w1280';
const api_url = 'https://api.themoviedb.org/3/';

//api params
const api_key = '04c35731a5ee918f014970082a0088b1';
const language = 'en-US';
const currentDate = new Date();
const genres = [
    {
        "id": 28,
        "name": "Action"
    },
    {
        "id": 16,
        "name": "Animation"
    },
    {
        "id": 35,
        "name": "Comedy"
    },
    {
        "id": 878,
        "name": "Science Fiction"
    }
]


//電影種類代號api
const api_genres = `${api_url}genre/movie/list?api_key=${api_key}&language=en-US`;
//一般查詢api
const api_discover = `${api_url}discover/movie?sort_by=popularity.desc&api_key=${api_key}&page=1`;
//關鍵字搜尋api
const api_search = `${api_url}search/movie?api_key=${api_key}&language=${language}&page=1&query=`;

//DOM
const contentEl = document.querySelector('.content');
const search = document.querySelector('#search-wrap');
const input_search = document.querySelector('#input-search');

//initial call
const seasonDate = getSeasonDate(currentDate);
//視窗大小變動時
window.addEventListener('resize', function (ev) {
    const card_containerEls=this.document.querySelectorAll('.cards-container');
        console.log(card_containerEls);
        card_containerEls.forEach(function(item){
            if(item.classList.contains('wrap')){
                resizeElement(item,170);
            }
            else{
                return;
            }
            
        });
});
// console.log(seasonDate);
const Row1 = addRow(genres[0].name);
const R1_movies = Row1.querySelector('.cards-container');
getMovies(R1_movies, api_discover, seasonDate, genres[0].id);
const Row2 = addRow(genres[1].name);
const R2_movies = Row2.querySelector('.cards-container');
getMovies(R2_movies, api_discover, seasonDate, genres[1].id);
const Row3 = addRow(genres[2].name);
const R3_movies = Row3.querySelector('.cards-container');
getMovies(R3_movies, api_discover, seasonDate, genres[2].id);
const Row4 = addRow(genres[3].name);
const R4_movies = Row4.querySelector('.cards-container');
getMovies(R4_movies, api_discover, seasonDate, genres[3].id);

//搜尋
search.addEventListener('submit', function (ev) {
    ev.preventDefault();
    const queryText = input_search.value;
    //clear content
    contentEl.innerHTML = '';
    const search_wrap = addSearchWrapper(queryText, true);
    const search_movies = search_wrap.querySelector('.cards-container');
    getMovies(search_movies, api_search + queryText, seasonDate, genres[2].id);
    resizeElement(search_movies, 170);
});


//串接上api
async function fetchApi(api) {
    const resp = await fetch(api);
    const respData = await resp.json();
    const data = respData.results;
    console.log('await', data);
    return data;
}
//一般板
async function getMovies(_items_wrap, _api, _release_date = null, _genres = '') {
    const release_date_query = (_release_date) ? `&release_date.gte=${_release_date.start}&release_date.lte=${_release_date.end}` : ''
    const genres_query = (_genres) ? `&with_genres=${_genres}` : '';

    let full_api = `${_api}` + `${release_date_query}` + `${genres_query}`;
    const data = await fetchApi(full_api);
    addMovie(_items_wrap, data);
}

//新增電影
function addMovie(items_wrap, datas,) {
    //clear
    items_wrap.innerHTML = '';
    //add elements
    datas.forEach(function (item, index) {
        //取值
        const { title, poster_path, vote_average,overview } = item;
        if (poster_path) {
            const movieEl = document.createElement('div');
            movieEl.classList.add('movie-card');
            const name = `${title.length > 25 ? title.substr(0, 25) + '...' : title
                }`;
            movieEl.innerHTML = `
                <img src=${img_url + poster_path} alt=${title}>
                <div class="movie-intro">
                <h2 id="movie-name">${name}</h2>
                    <span class="score ${getClassbyRate(vote_average)}">${vote_average}</span>
                </div>
                <div class="overview scrollerbar-style1">
                    <h4>OverView:</h4>
                    ${overview}
                </div>
            `;
            items_wrap.appendChild(movieEl);
        }

    });
    const space = document.createElement('div');
    space.classList.add('movie-card-space');
    items_wrap.appendChild(space);
}
//新增搜尋Wrapper
function addSearchWrapper(_subtitle) {
    //新建wrapper
    const wrapperEl = document.createElement('div');
    wrapperEl.classList.add('wrapper');
    wrapperEl.innerHTML = `
        <div class="sub-header">
            <h3 id="sub-title">${_subtitle}</h3>
            <div id="close" class="btn-base">X</div>
        </div>
        <div id=${_subtitle} class="column-scroller">
            <div class="cards-container wrap">
            </div>
        </div>
    `;

    const btn_close=wrapperEl.querySelector('#close');
    btn_close.addEventListener('click',function(ev){
        location.reload();
    });
    contentEl.appendChild(wrapperEl);
    return wrapperEl;
}

//新增row wrapper
function addRow(_subtitle) {
    //新建wrapper
    const wrapperEl = document.createElement('div');
    wrapperEl.classList.add('wrapper');
    wrapperEl.innerHTML = `
        <div class="sub-header">
            <h3 id="sub-title">${_subtitle}</h3>
            <div id="show" class="btn-base">Show all</div>
        </div>
        <div id=${_subtitle} class="column-scroller">
            <div class="cards-container">
            </div>
        </div>
    `;

    //顯示全部
    const btn_showAll = wrapperEl.querySelector('.sub-header>#show');
    const items_wrap = wrapperEl.querySelector('.cards-container');
    btn_showAll.addEventListener('click', function (ev) {
        if (items_wrap.classList.contains('wrap')) {
            items_wrap.classList.remove('wrap');
            items_wrap.style.width = 100 + '%';
        }
        else {
            items_wrap.classList.add('wrap');
            resizeElement(items_wrap, 170);
        }
    });
    contentEl.appendChild(wrapperEl);
    return wrapperEl;
}
//變更flex-wrap元件大小
function resizeElement(elm, baseWidth) {
    //parent-width
    const widow_width = this.window.innerWidth;
    // console.log('w',widow_width);
    const onlyWidth = baseWidth * parseInt(widow_width / baseWidth);
    elm.style.width = onlyWidth + 'px';
    // console.log('ow',onlyWidth);
}

//取得季日期
function getSeasonDate(currentDate) {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const season = [
        { start: `${year}-01-01`, end: `${year}-03-31` }
        , { start: `${year}-04-01`, end: `${year}-06-31` }
        , { start: `${year}-07-01`, end: `${year}-09-31` }
        , { start: `${year}-10-01`, end: `${year}-12-31` }
    ];
    switch (month) {
        case 0:
        case 1:
        case 2:
            {
                return (season[0]);
            }
        case 3:
        case 4:
        case 5:
            {
                return (season[1]);
            }
        case 6:
        case 7:
        case 8:
            {
                return (season[2]);
            }
        case 9:
        case 10:
        case 11:
            {
                return (season[3]);
            }
    }
}

function getClassbyRate(rate){
    if(rate>7){
        return ('red');
    }
    else if(rate>3){
        return ('orange');
    }
    else{
        return('green');
    }
}