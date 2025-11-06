// yourwaeth used as userTab
const yourWeath = document.querySelector("#tab1");
const serachweath = document.querySelector("#tab2");
const usercontainer = document.querySelector(".weather-container");
const searchForm = document.querySelector("[data-searchForm]");

const userInfocontainer = document.querySelector(".user-info-container");
const grantAccesscontainer = document.querySelector(".grant-location-container");
const loadingScreen = document.querySelector(".loading-container");
const grantAccessBtn = document.querySelector("[data-granAccess]");
// initially we present at yourwath tab

let oldTab = yourWeath;  // old tab mtlb phle ham kha the
const API_KEY = "5ee6bd2a472bd64929dd5c827f8417a1";
oldTab.classList.add("current-tab");


// changing tab and adding/removing the color

// swiatchTab


function swiatchTab(newTab) {
    if (newTab != oldTab) {
        oldTab.classList.remove("current-tab");
        oldTab = newTab;
        oldTab.classList.add("current-tab");
    }

    if (newTab === serachweath) {
        // Switching to Search Weather
        userInfocontainer.classList.remove("active");
        grantAccesscontainer.classList.remove("active");
        searchForm.classList.add("active");
    } else {
        // Switching back to Your Weather
        searchForm.classList.remove("active");
        getFromSessionStorage();
    }
}


yourWeath.addEventListener("click" , ()=>{
    swiatchTab(yourWeath);
})

serachweath.addEventListener("click" , ()=>{
    swiatchTab(serachweath);
})


function getFromSessionStorage(){
    // use sessionStorage to remember the user’s location or last searched city?
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates){
        // if localCoordinates not found which menas we didnt give the grant location permission so it means we have to show the grant location UI
        grantAccesscontainer.classList.add("active");
    }
    else{
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

// fetchUserWeatherInfo this function calculate the weather with the help of coordinates (lat and long) by the ai call

async function fetchUserWeatherInfo(coordinates) {
  const { lat, lon } = coordinates;

  // hide other containers
  grantAccesscontainer.classList.remove("active");
  searchForm.classList.remove("active");
  userInfocontainer.classList.remove("active");

  // show loader
  loadingScreen.classList.add("active");

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    const data = await response.json();

    // hide loader
    loadingScreen.classList.remove("active");

    // show user weather data
    userInfocontainer.classList.add("active");

    renderWeatherInfo(data);
  } catch (err) {
    loadingScreen.classList.remove("active");
    alert("Error fetching weather: " + err);
  }
}


//  rendering function
function renderWeatherInfo(weatherInfo)
{
    console.log("Rendering weather info:", weatherInfo);

    // first we have to fetch the elements
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windSpeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");


    // change we have to do when we got a valid api

    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/48x36/${weatherInfo?.sys?.country?.toLowerCase()}.png`;

    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity} %`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all} %`;
}

grantAccessBtn.addEventListener("click", getlocation);

function getlocation() {
  if (navigator.geolocation) {
    // show loader and hide grant access
    loadingScreen.classList.add("active");
    grantAccesscontainer.classList.remove("active");

    navigator.geolocation.getCurrentPosition(showposition, handleError);
  } else {
    alert("Your browser does not support geolocation API");
  }
}

function showposition(position) {
    console.log("✅ showposition() triggered");
console.log("Latitude:", position.coords.latitude);
console.log("Longitude:", position.coords.longitude);

  const usercoordinates = {
    lat: position.coords.latitude,
    lon: position.coords.longitude,
  };

  sessionStorage.setItem("user-coordinates", JSON.stringify(usercoordinates));

  // Once we have coordinates, hide loader and fetch weather
  fetchUserWeatherInfo(usercoordinates);
}

function handleError(error) {
  loadingScreen.classList.remove("active");
  grantAccesscontainer.classList.add("active");
  alert("Location permission denied or error occurred!");
}



const searchInput = document.querySelector("[data-searchInput]");
searchForm.addEventListener("submit" , (e)=>{
    e.preventDefault();
    let cityName = searchInput.value;
    if(cityName === "")
        return; 
    else
    fetchSearchWeatherInfo(cityName);
})

async function fetchSearchWeatherInfo(city){
    // show the loader
    loadingScreen.classList.add("active");
    userInfocontainer.classList.remove("active");
    grantAccesscontainer.classList.remove("active");
    try{
        // render weather info ka data is api call se mil rha hai --> it is the main api call from open weather
        // in browser pass the call like this --> https://api.openweathermap.org/data/2.5/weather?q=city&appid=YOUR_API_KEY&units=metric
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        //    when the data come then removee the loader
        loadingScreen.classList.remove("active");
        // since the data come then show the userinfoconatiner
        userInfocontainer.classList.add("active");

        renderWeatherInfo(data);  // this function fetch the data like temp , city , country
        }catch(err){
            loadingScreen.classList.remove("active");
            // alert("something went wrong");
            console.log("err");
            alert(err);
        }
}
// When the page loads, check sessionStorage or ask for location
window.onload = () => {
  const savedCoords = sessionStorage.getItem("user-coordinates");

  if (savedCoords) {
    // Already have coordinates — fetch directly
    getFromSessionStorage();
  } else {
    // No coordinates — show the grant access screen
    grantAccesscontainer.classList.add("active");
  }
};
