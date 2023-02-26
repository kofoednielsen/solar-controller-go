package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"time"
)

type ForecastResponse struct {
	Properties ForecastProperties
}

type ForecastProperties struct {
	Timeseries []ForecastEntry
}

type ForecastEntry struct {
	Time time.Time
	Data ForecastData
}

type ForecastData struct {
	Instant ForecastInstant
}

type ForecastInstant struct {
	Details ForecastDetails
}

type ForecastDetails struct {
	Cloud_Area_Fraction         float64
	Ultraviolet_Index_Clear_Sky float64
}

var httpClient = &http.Client{Timeout: 10 * time.Second}

func calculate_cloud_average() float64 {
	state := State{}
	state.Load()

	request, err := http.NewRequest("GET", fmt.Sprintf("https://api.met.no/weatherapi/locationforecast/2.0/complete?lat=%f&lon=%f", state.Lat, state.Lon), nil)
	if err != nil {
		log.Fatal(err)
	}

	request.Header.Set("user-agent", "solar-controller")

	response, err := httpClient.Do(request)
	if err != nil {
		log.Fatal(err)
	}

	body, err := ioutil.ReadAll(response.Body)

	if err != nil {
		log.Fatal(err)
	}

	var forecast ForecastResponse
	err = json.Unmarshal(body, &forecast)
	if err != nil {
		log.Fatal(err)
	}

	now := time.Now()
	count := 0.0
	cloudAreaFractionSum := 0.0
	for _, entry := range forecast.Properties.Timeseries {
		if entry.Time.Day() == now.Day()+1 && entry.Time.Month() == now.Month() && entry.Time.Year() == now.Year() && entry.Data.Instant.Details.Ultraviolet_Index_Clear_Sky > 0 {
			count += 1.0
			cloudAreaFractionSum += entry.Data.Instant.Details.Cloud_Area_Fraction
		}
	}

	return cloudAreaFractionSum / count

}
