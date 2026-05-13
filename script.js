const pointsUrl = "https://api.weather.gov/points/32.7938,-79.8626";

    async function fetchWeather() {
        try {
            const response = await fetch(pointsUrl);
            const data = await response.json();
            
            const [hourlyRes, dailyRes] = await Promise.all([
                fetch(data.properties.forecastHourly),
                fetch(data.properties.forecast)
            ]);

            const hourlyData = await hourlyRes.json();
            const dailyData = await dailyRes.json();
            
            updateUI(hourlyData.properties.periods, dailyData.properties.periods);
        } catch (err) {
            console.error("NWS Fetch Error:", err);
            document.getElementById('location').textContent = "Offline";
        }
    }

    function updateUI(hourlyPeriods, dailyPeriods) {
        const locTxt = document.getElementById('location');
        const tempTxt = document.getElementById('temperature');
        const descTxt = document.getElementById('description');
        const rainTxt = document.getElementById('precipitation');
        const iconImg = document.getElementById('currentIcon');
        const hourlyDiv = document.getElementById('hourlyForecast');
        const dailyDiv = document.getElementById('dailyForecast');

        // 1. Current Conditions
        const now = hourlyPeriods[0];
        locTxt.textContent = "Mount Pleasant, SC";
        tempTxt.textContent = `${now.temperature}°F`;
        descTxt.textContent = now.shortForecast;
        if (rainTxt) rainTxt.textContent = `Chance of Rain: ${now.probabilityOfPrecipitation.value || 0}%`;
        iconImg.src = now.icon;
        iconImg.style.display = 'inline-block';

        // 2. Hourly List
        hourlyDiv.innerHTML = '';
        hourlyPeriods.slice(0, 24).forEach(hour => {
            const time = new Date(hour.startTime).toLocaleString('en-US', { hour: 'numeric', hour12: true });
            hourlyDiv.innerHTML += `
                <div class="forecast-item">
                    <span style="font-weight: bold;">${time}</span>
                    <img src="${hour.icon}" alt="icon">
                    <span style="font-weight: bold;">${hour.temperature}°</span>
                    <div class="rain-text">${hour.probabilityOfPrecipitation.value || 0}% ☔</div>
                </div>`;
        });

        // 3. Daily List (7-Day Outlook with Month/Day)
        dailyDiv.innerHTML = '';
        for (let i = 0; i < dailyPeriods.length; i++) {
            const period = dailyPeriods[i];
            
            if (period.isDaytime) {
                const highTemp = period.temperature;
                const nextPeriod = dailyPeriods[i + 1];
                const lowTemp = nextPeriod ? nextPeriod.temperature : '--';
                const rainChance = period.probabilityOfPrecipitation.value || 0;

                // --- NEW DATE LOGIC ---
                const dateObj = new Date(period.startTime);
                // Format: "Wed 5/13"
                const dateLabel = dateObj.toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'numeric', 
                    day: 'numeric' 
                });

                dailyDiv.innerHTML += `
                    <div class="forecast-item">
                        <span style="font-weight: bold; font-size: 0.85rem;">${dateLabel}</span>
                        <img src="${period.icon}" alt="icon">
                        <div style="text-align: center;">
                            <span style="font-weight: bold; color: #ff9b9b;">${highTemp}°</span> / 
                            <span style="font-weight: bold; color: #a5d8ff;">${lowTemp}°</span>
                        </div>
                        <div class="rain-text" style="font-size: 0.9rem;">
                            ${rainChance}% ☔
                        </div>
                    </div>`;
            }
        }
    }

    fetchWeather();
