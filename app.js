const returnData = document.querySelector('#return-data');
const loading = document.querySelector('#loading');

const searchData = async () => {
  startSearch()

  const inputCity = document.querySelector('#input-city').value;
  const [isSuccess, cityData, weatherData] = await fetchApis(inputCity)

  if (isSuccess) {
    processBaseInfo(cityData, weatherData);
    processTable(cityData, weatherData);
    changeStyle(weatherData);
    finishSearch();

    return;
  }

  failedSearch();
}

function startSearch() {
  returnData.classList.add('hidden');
  loading.classList.remove('hidden');
}

async function fetchApis(inputCity) {
  try {
    const cityData = await getCity(inputCity);
    const weatherData = await getWeather(cityData.latitude, cityData.longitude);

    return [true, cityData, weatherData]
  } catch(err) {
    alert('Maybe you input a wrong city name!');
  }

  return [false, {}, {}];
}

async function getCity(city) {
  const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`)
  const result = await response.json();

  return result.results[0];
}

async function getWeather(latitude, longitude) {
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,is_day,rain,showers&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=2`)

  return await response.json();
}

function processBaseInfo(cityData, weatherData) {
  const temperatureUnit = weatherData.current_units.temperature_2m
  const cityName = document.querySelector('.city-name');
  const temperature = document.querySelector('.temperature');

  cityName.innerHTML = cityData.name;
  temperature.innerHTML = `${weatherData.current.temperature_2m} ${temperatureUnit}`
}

function processTable(cityData, weatherData) {
  const tomorrowTemperatureMin = weatherData.daily.temperature_2m_min[1]
  const tomorrowTemperatureMax = weatherData.daily.temperature_2m_max[1]
  const temperatureUnit = weatherData.current_units.temperature_2m
  const tbody = document.createElement('tbody');

  tbody.appendChild(buildTr('Country', cityData.country));
  tbody.appendChild(buildTr('Timezone', cityData.timezone));
  tbody.appendChild(buildTr('Population', cityData.population.toLocaleString()));
  tbody.appendChild(
    buildTr(
      'Tomorrow\'s Forecast',
      `Min: ${tomorrowTemperatureMin} ${temperatureUnit}<br>Max: ${tomorrowTemperatureMax} ${temperatureUnit}`)
  );

  const finalTable = document.querySelector('#final-table');
  const oldTbody = document.querySelector("#final-table tbody");

  finalTable.removeChild(oldTbody);
  finalTable.appendChild(tbody);
}

function buildTr(title, context) {
  const tr = document.createElement('tr');
  const fragment = document.createDocumentFragment();

  const titleTd = document.createElement('td');
  titleTd.className = 'strong';
  titleTd.textContent = title;

  const contextTd = document.createElement('td');
  contextTd.innerHTML = context;

  fragment.appendChild(titleTd);
  fragment.appendChild(contextTd);

  tr.appendChild(fragment)

  return tr;
}

function changeStyle(weatherData) {
  const main = document.querySelector('main');
  const className = (weatherData.current.is_day) ? 'day' : 'night';

  main.classList.remove('day', 'night');
  main.classList.add(className);
}

function finishSearch() {
  loading.classList.add('hidden');
  returnData.classList.remove('hidden');
}

function failedSearch() {
  loading.classList.add('hidden');
  returnData.classList.add('hidden');
}

document.querySelector('#search').addEventListener('click', searchData)