/* set the offset per request */
let offset = 30;

/* set limit per request */
let limit = 30;

/* container for data response */
let data = [];

/* element for loading container */
const loading_container = document.querySelector('.loading-container');

/* loading element */
const loading = `<img src="./assets/loading.svg" alt="loading">`;

/* search input container */
const search_result_element = document.querySelector(".search-result");

/* search input element  */
const search = document.getElementById('search');

/* used to disabled the requesting of api while searching on the element */
let is_searching_through_input = false;

let searching_data = false;

/**
 * Document: This function is used to fetch spacex api request based on the declared offset and limit 
 * Triggered: When user loads the page or reloads the page or scroll down the page <br>
 * Last Updated Date: August 20, 2022
 *  @async
 * @params {}
 * @return {boolean} 
 * @author Mel
 */
async function fetch_spaces() {
    /* api url request with post methods and json type headers */
    const spacex_request = await fetch(
		"https://api.spacexdata.com/v4/launches/query",
		{
			method: "POST",
			headers: {
				"Content-type": "application/json",
			},
			body: JSON.stringify({
				query: {},
				options: { offset: 30, limit },
			}),
		}
	);

    /* converting request to json format */
	const spacex_response = await spacex_request.json();

    /* destructuring only the docs for the required data */
	const { docs } = spacex_response;
        console.log({docs})
    /* if docs or data exists the assign the response data to data container */
    if(docs){
        data = docs;
        return true;
    }
    else {
        return false;
    }
}

/**
 * Document: This function is used to initialize the request data upon loading
 * Triggered: When user loads the page or reloads the page <br>
 * Last Updated Date: August 20, 2022
 *  @async
 * @params {}
 * @return {} 
 * @author Mel
 */
async function initialize(){
	let card_list = "";

    /* loop thru each of the data to set/append html elements to the search_result container */
	for (const launch of data) {
		const {
			flight_number,
			date_local,
			name,
			details,
			links: {
				article,
				reddit,
				webcast,
				wikipedia,
				youtube_id,
				patch: { large },
			},
		} = launch;

        /* concat for each loop of data */
		card_list += `
            <div class="card">
                <img class="main_image" src="${large}" alt="patch">
                <div class="details">
                    <h5>Flight ${flight_number}</h5>
                    <h1>${name}</h1>
                    <p>${moment(date_local).format("MMMM Do YYYY, h:mm:ss a")}</p>
                </div>
                <div class="launch_details">
                    <span>Details</span>
                    <p>${details || 'Details is not available'}</p>
                </div>
                <div class="links">
                    <span>Links</span>
                    <div class="lists">
                        <div>
                            <img src="./assets/article-icon.png" alt="article" />
                            <p><a target=”_blank” href="${article}">Article</a></p>
                        </div>
                        <div>
                            <img src="./assets/reddit-icon.png" alt="reddit" />
                            <p><a target=”_blank” href="${reddit}">Reddit</a></p>
                        </div>
                        <div>
                            <img src="./assets/webcast-icon.png" alt="webcast" />
                            <p><a target=”_blank” href="${webcast}">Webcast</a></p>
                        </div>
                        <div>
                            <img src="./assets/yt-icon.png" alt="youtube" />
                            <p><a target=”_blank” href="https://www.youtube.com/watch?v=${youtube_id}">Youtube</a></p>
                        </div>
                        <div>
                            <img src="./assets/wiki-icon.png" alt="wiki" />
                            <p><a target=”_blank” href="${wikipedia}">Wikipedia</a></p>
                        </div>
                    </div>
                </div>
            </div>
        `;
	}
	search_result_element.innerHTML = card_list;
}

/**
 * Document: This IIFE is used to invoke the js as soon as the page is load
 * Triggered: When user loads the page or reloads <br>
 * Last Updated Date: August 20, 2022
 *  @async
 * @params {}
 * @return {} 
 * @author Mel
 */
(async () => {
   let is_ready = false;
    
   /* if is_searching_through_input meaning there are no series of searching of keywords the allow the fetching of data */
    if(!is_searching_through_input && !searching_data){
        /* append loading to loading container  */
        loading_container.innerHTML = loading;

        /* disable the search input when fetching request */
        search.setAttribute('disabled', true);
        
        searching_data = true;
        is_ready = await fetch_spaces();
    }
    
    /* check if there are data response */
    if(is_ready){
        setTimeout(() => {
            /* remove disabled search */
            search.removeAttribute('disabled');

            /* remove loading */
            loading_container.innerHTML = '';
            
            searching_data = false;
            
            /* initialize again */
            initialize();
        }, 3000);
    }
})();


/**
 * Document: this function is used to fetch data when scrolling
 * Triggered: When user scrolls the page down <br>
 * Last Updated Date: August 20, 2022
 *  @async
 * @params {}
 * @return {} 
 * @author Mel
 */
async function handleScroll() {
	let documentHeight = document.body.scrollHeight;
	let currentScroll = window.scrollY + window.innerHeight;

    /* if the scroll reach the bottom of the page */
    if (Math.ceil(currentScroll) >= documentHeight) {
        let is_ready = false;

        /* if is_searching_through_input meaning there are no series of searching of keywords the allow the fetching of data */
        if(!is_searching_through_input && !searching_data){
            loading_container.innerHTML = loading;
            search.setAttribute('disabled', true);

            
            /* add new 30 the previous limit */
            limit += 30;
            searching_data = true;
            is_ready = await fetch_spaces();
        }

        if(is_ready){
            setTimeout(() => {
                /* remove disabled search */
                search.removeAttribute('disabled');

                /* remove loading */
                loading_container.innerHTML = '';

                searching_data = false;
                
                /* initialize again */
                initialize();
            }, 3000);
        }
	}
};

/* event listening when scrolling */
window.addEventListener("scroll", handleScroll);

/**
 * Document: this function is used for searching element from the dom
 * Triggered: When user inputs keywords to the search input <br>
 * Last Updated Date: August 20, 2022
 *  @async
 * @params {}
 * @return {} 
 * @author Mel
 */
search.addEventListener("keyup", function(event) {
    const keyword = event.target.value;

    for(const card of search_result_element.children){
        const [, details] = card.children;
        const [, name] = details.children;
        const search_name = name.textContent || name.innerHTML;

        /* if no text then let the search true else disabled */
        if(keyword === ""){
            is_searching_through_input = false;
        }
        else{
            is_searching_through_input = true;
        }

        if(search_name.toLowerCase().includes(keyword)){
            card.style.display = "";
        }
        else{
            card.style.display = "none";
        }
    }
}); 